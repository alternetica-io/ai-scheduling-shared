import { describe, expect, it } from 'vitest';
import { needsMfaChallenge } from '../src';

/**
 * Pedir el segundo factor solo a quien lo tiene y todavía no lo usó. Si se le
 * pidiera a todo el que está en aal1, nadie sin factor podría entrar.
 */
describe('needsMfaChallenge', () => {
  it('con un factor y sesión sin verificar: sí', () => {
    expect(needsMfaChallenge({ currentLevel: 'aal1', nextLevel: 'aal2' })).toBe(true);
  });

  it('sin factores: no', () => {
    expect(needsMfaChallenge({ currentLevel: 'aal1', nextLevel: 'aal1' })).toBe(false);
  });

  it('ya verificado: no', () => {
    expect(needsMfaChallenge({ currentLevel: 'aal2', nextLevel: 'aal2' })).toBe(false);
  });

  it('sin datos: no', () => {
    expect(needsMfaChallenge({ currentLevel: null, nextLevel: null })).toBe(false);
  });
});
