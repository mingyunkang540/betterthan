export function validateIdParams(params: unknown): { id: string } {
  if (!params || typeof params !== 'object') return { id: '' };
  const id = (params as { id?: unknown }).id;
  return {
    id: typeof id === 'string' && id.length <= 120 ? id : '',
  };
}
