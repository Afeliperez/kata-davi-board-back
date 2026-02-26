import { rethrowWithContext } from '@shared/errors/rethrowWithContext';

describe('rethrowWithContext', () => {
  it('creates contextual error when input is Error', () => {
    const result = rethrowWithContext(new Error('boom'), 'MyContext');

    expect(result.message).toBe('MyContext: boom');
  });

  it('creates contextual error when input is unknown', () => {
    const result = rethrowWithContext('boom', 'MyContext');

    expect(result.message).toBe('MyContext: boom');
  });
});
