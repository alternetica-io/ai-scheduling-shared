import { describe, expect, it } from 'vitest';
import {
  addDaysToDate,
  instantToWallClock,
  todayInZone,
  wallClockToInstantIso,
  weekStartOfDate,
} from '../src';

/** Las zonas horarias: el producto es multi-región y no asume ninguna. */
describe('todayInZone', () => {
  it('a las 20:00 de Florida, en UTC ya es mañana; en Florida, no', () => {
    const now = new Date('2026-10-20T00:30:00Z'); // 20:30 en Nueva York (EDT)
    expect(todayInZone('America/New_York', now)).toBe('2026-10-19');
    expect(todayInZone('UTC', now)).toBe('2026-10-20');
  });
});

describe('hora de pared ↔ instante', () => {
  it('ida y vuelta en una zona sin cambio de hora', () => {
    const real = wallClockToInstantIso('2026-10-19T08:00:00.000Z', 'America/Caracas');
    expect(real).toBe('2026-10-19T12:00:00.000Z');
    expect(instantToWallClock(real, 'America/Caracas')).toBe('2026-10-19T08:00:00.000Z');
  });

  it('una hora que no existe (adelanto de reloj) cae después del salto', () => {
    // 2026-03-08 02:30 no existe en Nueva York: el reloj pasa de 02:00 a 03:00.
    const real = wallClockToInstantIso('2026-03-08T02:30:00.000Z', 'America/New_York');
    expect(instantToWallClock(real, 'America/New_York')).toBe('2026-03-08T03:30:00.000Z');
  });

  it('una hora que se repite (atraso de reloj) toma la primera', () => {
    // 2026-11-01 01:30 ocurre dos veces en Nueva York.
    const real = wallClockToInstantIso('2026-11-01T01:30:00.000Z', 'America/New_York');
    expect(real).toBe('2026-11-01T05:30:00.000Z');
  });
});

describe('weekStartOfDate', () => {
  it('respeta el primer día de la semana de la empresa', () => {
    // 2026-10-21 es miércoles.
    expect(weekStartOfDate('2026-10-21', 'monday')).toBe('2026-10-19');
    expect(weekStartOfDate('2026-10-21', 'sunday')).toBe('2026-10-18');
  });

  it('el propio primer día es su semana', () => {
    expect(weekStartOfDate('2026-10-19', 'monday')).toBe('2026-10-19');
  });
});

describe('addDaysToDate', () => {
  it('es aritmética de calendario: no la mueve un cambio de hora', () => {
    expect(addDaysToDate('2026-03-07', 1)).toBe('2026-03-08');
    expect(addDaysToDate('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDaysToDate('2026-03-01', -1)).toBe('2026-02-28');
  });
});
