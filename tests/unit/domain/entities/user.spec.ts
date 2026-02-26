import { Role } from '@domain/entities/User';

describe('User entity', () => {
  it('exposes expected role values', () => {
    expect(Role.ADMIN).toBe('ADMIN');
    expect(Role.PO).toBe('PO');
    expect(Role.SM).toBe('SM');
    expect(Role.DEV).toBe('DEV');
    expect(Role.QA).toBe('QA');
  });
});
