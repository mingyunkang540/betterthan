import { validateIdParams } from './route-params';

describe('route params', () => {
  it('문자열 id만 통과시킨다', () => {
    expect(validateIdParams({ id: 'record-1' })).toEqual({ id: 'record-1' });
    expect(validateIdParams({ id: 1 })).toEqual({ id: '' });
    expect(validateIdParams(null)).toEqual({ id: '' });
    expect(validateIdParams({ id: 'x'.repeat(121) })).toEqual({ id: '' });
  });
});
