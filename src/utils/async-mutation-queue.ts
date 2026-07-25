export interface AsyncMutationQueue {
  enqueue<T>(operation: () => Promise<T>): Promise<T>;
}

export function createAsyncMutationQueue(): AsyncMutationQueue {
  let tail = Promise.resolve<unknown>(undefined);
  return {
    enqueue<T>(operation: () => Promise<T>) {
      const queued = tail.then(operation, operation);
      tail = queued.then(
        () => undefined,
        () => undefined,
      );
      return queued;
    },
  };
}
