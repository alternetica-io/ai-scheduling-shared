import { describe, expect, it } from 'vitest';
import {
  scheduledInterval,
  shiftTimesDiffer,
  shiftTimesToShow,
  workedInterval,
} from '../src';

/**
 * El horario programado contra el trabajado: la regla que se equivocó dos
 * veces, en la web y en el móvil, leyendo la misma fila (front #2, móvil #11).
 */
const pisado = {
  plannedStart: null,
  plannedEnd: '2026-10-05T23:00:00.000Z',
  actualStart: '2026-10-05T15:00:00.000Z',
  actualEnd: '2026-10-05T22:17:00.000Z',
};
const intacto = {
  plannedStart: null,
  plannedEnd: null,
  actualStart: '2026-10-05T15:00:00.000Z',
  actualEnd: '2026-10-05T23:00:00.000Z',
};

describe('scheduledInterval', () => {
  it('con el fin pisado por el fichaje, el programado es el guardado', () => {
    expect(scheduledInterval(pisado)).toEqual({
      start: '2026-10-05T15:00:00.000Z',
      end: '2026-10-05T23:00:00.000Z',
    });
  });

  it('sin nada pisado, `actual_*` es el programado', () => {
    expect(scheduledInterval(intacto).end).toBe('2026-10-05T23:00:00.000Z');
  });
});

describe('workedInterval', () => {
  it('siempre es `actual_*`', () => {
    expect(workedInterval(pisado).end).toBe('2026-10-05T22:17:00.000Z');
  });
});

describe('shiftTimesDiffer', () => {
  it('solo si el fichaje movió algo', () => {
    expect(shiftTimesDiffer(pisado)).toBe(true);
    expect(shiftTimesDiffer(intacto)).toBe(false);
  });
});

describe('shiftTimesToShow (front #20)', () => {
  it('con las dos y un fichaje que movió el horario, la real aparece', () => {
    expect(shiftTimesToShow(pisado, 'both').real?.end).toBe('2026-10-05T22:17:00.000Z');
  });

  it('con solo la programada, no', () => {
    const r = shiftTimesToShow(pisado, 'planned');
    expect(r.real).toBeNull();
    expect(r.scheduled.end).toBe('2026-10-05T23:00:00.000Z');
  });

  it('si nadie movió nada, no se repite la misma hora', () => {
    expect(shiftTimesToShow(intacto, 'both').real).toBeNull();
  });
});
