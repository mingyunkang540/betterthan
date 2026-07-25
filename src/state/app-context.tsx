import type React from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';
import { rewardBalanceWithTesterGrant } from '../constants/tester-config';
import {
  type CheckInDraft,
  type DailyRecord,
  createEmptyDraft,
} from '../models/daily-record';
import type {
  DecorationState,
  RoomPosition,
  RoomState,
  ShopItem,
} from '../models/decoration';
import type { MonthlyMilestone, RewardTransaction } from '../models/reward';
import {
  createDefaultDecorationState,
  decorationSpent,
  equipDecoration,
  loadDecorationState,
  purchaseDecoration,
  purchaseOrEquipDecoration,
  saveDecorationState,
  saveRoomSlots,
} from '../storage/decoration-storage';
import { nativeStorage } from '../storage/native-storage';
import {
  clearDraft,
  loadDraft,
  loadRecords,
  saveDraft,
  saveRecords,
  upsertRecord,
} from '../storage/record-storage';
import {
  calculateWallet,
  claimMonthlyMilestone,
  loadRewardTransactions,
  reconcileRecordRewards,
  saveRewardTransactions,
} from '../storage/reward-storage';
import { createAsyncMutationQueue } from '../utils/async-mutation-queue';
import { toLocalDateKey, toLocalMonthKey } from '../utils/date';

interface AppContextValue {
  loading: boolean;
  error?: string;
  records: DailyRecord[];
  rewardTransactions: RewardTransaction[];
  rewardBalance: number;
  decorationState: DecorationState;
  draft: CheckInDraft;
  updateDraft(patch: Partial<CheckInDraft>): void;
  resetDraft(): Promise<void>;
  saveCurrentDraft(): Promise<DailyRecord>;
  claimReward(milestone: MonthlyMilestone): Promise<RewardTransaction>;
  buyDecoration(item: ShopItem): Promise<void>;
  applyDecoration(item: ShopItem): Promise<void>;
  purchaseOrApplyDecoration(
    item: ShopItem,
    position?: RoomPosition,
  ): Promise<void>;
  saveRoom(roomSlots: RoomState['slots']): Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [today, setToday] = useState(() => toLocalDateKey(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const recordsRef = useRef<DailyRecord[]>([]);
  const [rewardTransactions, setRewardTransactions] = useState<
    RewardTransaction[]
  >([]);
  const rewardTransactionsRef = useRef<RewardTransaction[]>([]);
  const [decorationState, setDecorationState] = useState<DecorationState>(() =>
    createDefaultDecorationState(),
  );
  const decorationStateRef = useRef(decorationState);
  const decorationMutationQueueRef = useRef(createAsyncMutationQueue());
  const [draft, setDraft] = useState<CheckInDraft>(() =>
    createEmptyDraft(today),
  );

  useEffect(() => {
    const syncDate = () => setToday(toLocalDateKey(new Date()));
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncDate();
    });
    const now = new Date();
    const activeDay = new Date(`${today}T00:00:00`);
    const nextDay = new Date(
      activeDay.getFullYear(),
      activeDay.getMonth(),
      activeDay.getDate() + 1,
      0,
      0,
      0,
      100,
    );
    const timer = setTimeout(
      syncDate,
      Math.max(0, nextDay.getTime() - now.getTime()),
    );
    return () => {
      subscription.remove();
      clearTimeout(timer);
    };
  }, [today]);

  useEffect(() => {
    let active = true;
    let loadFailed = false;
    Promise.all([
      loadRecords(nativeStorage).catch(() => {
        loadFailed = true;
        return [];
      }),
      loadDraft(today, nativeStorage).catch(() => {
        loadFailed = true;
        return null;
      }),
      loadRewardTransactions(nativeStorage).catch(() => {
        loadFailed = true;
        return [];
      }),
      loadDecorationState(nativeStorage).catch(() => {
        loadFailed = true;
        return createDefaultDecorationState();
      }),
    ])
      .then(
        async ([
          storedRecords,
          storedDraft,
          storedRewards,
          storedDecoration,
        ]) => {
          if (!active) return;
          const reconciled = reconcileRecordRewards(
            storedRecords,
            storedRewards,
          );
          setRecords(storedRecords);
          recordsRef.current = storedRecords;
          setRewardTransactions(reconciled.transactions);
          rewardTransactionsRef.current = reconciled.transactions;
          setDecorationState(storedDecoration);
          decorationStateRef.current = storedDecoration;
          if (reconciled.added.length > 0)
            await saveRewardTransactions(
              reconciled.transactions,
              nativeStorage,
            );
          if (storedDraft) setDraft(storedDraft);
          else setDraft(createEmptyDraft(today));
          if (loadFailed)
            setError(
              '일부 저장 내용을 불러오지 못했어요. 다른 기록은 안전하게 불러왔어요.',
            );
        },
      )
      .catch(
        () =>
          active &&
          setError('저장된 기록을 불러오지 못했어요. 앱을 다시 열어주세요.'),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [today]);

  const updateDraft = useCallback((patch: Partial<CheckInDraft>) => {
    setDraft((current) => {
      const currentToday = toLocalDateKey(new Date());
      const base =
        current.date === currentToday
          ? current
          : createEmptyDraft(currentToday);
      const next = { ...base, ...patch, date: currentToday };
      void saveDraft(next, nativeStorage).catch(() =>
        setError('작성 중인 내용을 임시 저장하지 못했어요.'),
      );
      return next;
    });
  }, []);

  const resetDraft = useCallback(async () => {
    const empty = createEmptyDraft(today);
    setDraft(empty);
    await clearDraft(nativeStorage);
  }, [today]);

  const saveCurrentDraft = useCallback(async () => {
    const currentToday = toLocalDateKey(new Date());
    if (draft.date !== currentToday) throw new Error('작성 날짜가 바뀌었어요.');
    if (!draft.mood || !draft.energy || !draft.focus)
      throw new Error('필수 상태 값이 없어요.');
    const result = await upsertRecord(recordsRef.current, {
      date: currentToday,
      mood: draft.mood,
      energy: draft.energy,
      focus: draft.focus,
      activities: draft.activities,
      blocker: draft.blocker,
      improvement: draft.improvement,
      experimentCategory: draft.experimentCategory,
      experiment: draft.experiment,
      oneLine: draft.oneLine,
    });
    await saveRecords(result.records, nativeStorage);
    recordsRef.current = result.records;
    setRecords(result.records);
    const rewards = reconcileRecordRewards(
      result.records,
      rewardTransactionsRef.current,
    );
    await saveRewardTransactions(rewards.transactions, nativeStorage);
    await clearDraft(nativeStorage);
    setRewardTransactions(rewards.transactions);
    rewardTransactionsRef.current = rewards.transactions;
    setDraft(createEmptyDraft(currentToday));
    return result.record;
  }, [draft]);

  const mutateDecoration = useCallback(
    async (build: (state: DecorationState) => DecorationState) => {
      const operation = async () => {
        const next = build(decorationStateRef.current);
        await saveDecorationState(next, nativeStorage);
        decorationStateRef.current = next;
        setDecorationState(next);
      };
      await decorationMutationQueueRef.current.enqueue(operation);
    },
    [],
  );

  const claimReward = useCallback(
    async (milestone: MonthlyMilestone) => {
      const monthKey = toLocalMonthKey(new Date());
      const recordCount = records.filter((record) =>
        record.date.startsWith(monthKey),
      ).length;
      const previousTransactions = rewardTransactionsRef.current;
      const result = claimMonthlyMilestone(
        previousTransactions,
        monthKey,
        recordCount,
        milestone,
      );
      rewardTransactionsRef.current = result.transactions;
      try {
        await saveRewardTransactions(result.transactions, nativeStorage);
      } catch (cause) {
        const persisted = await loadRewardTransactions(nativeStorage).catch(
          () => previousTransactions,
        );
        rewardTransactionsRef.current = persisted;
        setRewardTransactions(persisted);
        throw cause;
      }
      setRewardTransactions(result.transactions);
      return result.reward;
    },
    [records],
  );

  const buyDecoration = useCallback(
    async (item: ShopItem) => {
      await mutateDecoration((state) => {
        const balance = rewardBalanceWithTesterGrant(
          calculateWallet(rewardTransactionsRef.current).balance,
          decorationSpent(state),
        );
        return purchaseDecoration(state, item, balance);
      });
    },
    [mutateDecoration],
  );

  const applyDecoration = useCallback(
    async (item: ShopItem) => {
      await mutateDecoration((state) => equipDecoration(state, item));
    },
    [mutateDecoration],
  );

  const purchaseOrApplyDecoration = useCallback(
    async (item: ShopItem, position?: RoomPosition) => {
      await mutateDecoration((state) => {
        const balance = rewardBalanceWithTesterGrant(
          calculateWallet(rewardTransactionsRef.current).balance,
          decorationSpent(state),
        );
        return purchaseOrEquipDecoration(state, item, balance, position);
      });
    },
    [mutateDecoration],
  );

  const saveRoom = useCallback(
    async (roomSlots: RoomState['slots']) => {
      await mutateDecoration((state) => saveRoomSlots(state, roomSlots));
    },
    [mutateDecoration],
  );

  const rewardBalance = rewardBalanceWithTesterGrant(
    calculateWallet(rewardTransactions).balance,
    decorationSpent(decorationState),
  );

  const value = useMemo(
    () => ({
      loading,
      error,
      records,
      rewardTransactions,
      rewardBalance,
      decorationState,
      draft,
      updateDraft,
      resetDraft,
      saveCurrentDraft,
      claimReward,
      buyDecoration,
      applyDecoration,
      purchaseOrApplyDecoration,
      saveRoom,
    }),
    [
      loading,
      error,
      records,
      rewardTransactions,
      rewardBalance,
      decorationState,
      draft,
      updateDraft,
      resetDraft,
      saveCurrentDraft,
      claimReward,
      buyDecoration,
      applyDecoration,
      purchaseOrApplyDecoration,
      saveRoom,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp은 AppProvider 안에서 사용해야 해요.');
  return value;
}
