import { createRoute } from '@granite-js/react-native';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { RecordView } from '../components/record-view';
import {
  AppScreen,
  BackButton,
  EmptyState,
  LoadingScreen,
  colors,
} from '../components/ui';
import { useApp } from '../state/app-context';
import { formatDateKey } from '../utils/date';
import { validateIdParams } from '../utils/route-params';

export const Route = createRoute('/record-detail', {
  validateParams: validateIdParams,
  component: RecordDetailPage,
});

function RecordDetailPage() {
  const navigation = Route.useNavigation();
  const { id } = Route.useParams();
  const { loading, records } = useApp();
  if (loading) return <LoadingScreen />;
  const record = records.find((item) => item.id === id);
  return (
    <AppScreen>
      <BackButton onPress={() => navigation.goBack()} />
      {record ? (
        <>
          <Text style={styles.date}>{formatDateKey(record.date)}</Text>
          <Text style={styles.title}>그날의 기록</Text>
          <RecordView record={record} />
        </>
      ) : (
        <EmptyState
          title="기록을 찾지 못했어요"
          description="기록 목록에서 다시 선택해 주세요."
        />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  date: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 16,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 24,
  },
});
