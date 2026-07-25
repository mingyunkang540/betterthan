import { createAsyncMutationQueue } from './async-mutation-queue';

describe('async mutation queue', () => {
  it('동시에 요청된 변경을 호출 순서대로 직렬화한다', async () => {
    const queue = createAsyncMutationQueue();
    const order: string[] = [];
    let releaseFirst: (() => void) | undefined;
    const firstGate = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });

    const first = queue.enqueue(async () => {
      order.push('first:start');
      await firstGate;
      order.push('first:end');
    });
    const second = queue.enqueue(async () => {
      order.push('second');
    });

    await Promise.resolve();
    expect(order).toEqual(['first:start']);
    releaseFirst?.();
    await Promise.all([first, second]);
    expect(order).toEqual(['first:start', 'first:end', 'second']);
  });

  it('앞선 변경이 실패해도 다음 변경을 계속 처리한다', async () => {
    const queue = createAsyncMutationQueue();
    const failed = queue.enqueue(async () => {
      throw new Error('저장 실패');
    });
    const recovered = queue.enqueue(async () => 'saved');

    await expect(failed).rejects.toThrow('저장 실패');
    await expect(recovered).resolves.toBe('saved');
  });
});
