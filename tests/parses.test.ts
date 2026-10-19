import { describe, expect, it } from 'vitest';
import { dayNotesConflict, parseChatMessages, parseDayNotes } from '../src';

/**
 * Los parses tolerantes (orch #35). Un valor nuevo del backend que el cliente
 * todavía no conoce no puede tirar la lista entera: es lo que rompió el móvil
 * en runtime antes de que los parses fueran tolerantes.
 */
const nota = {
  employeeId: 'e1',
  date: '2026-10-19',
  kind: 'day_off',
  decision: 'accepted',
  inEffect: true,
  requestId: 'r1',
  rangeStart: '2026-10-19',
  rangeEnd: '2026-10-19',
  blocksShifts: true,
  shiftAssignmentId: null,
};

describe('parseDayNotes', () => {
  it('un tipo o una decisión que el cliente no conoce no tiran la nota', () => {
    const [n] = parseDayNotes([{ ...nota, kind: 'tipo_nuevo', decision: 'algo_nuevo' }]);
    expect(n?.kind).toBe('incident');
    expect(n?.decision).toBe('undecided');
  });

  it('una nota rota no tira las demás', () => {
    const out = parseDayNotes([nota, { basura: true }, { ...nota, requestId: 'r2' }]);
    expect(out.map((n) => n.requestId)).toEqual(['r1', 'r2']);
  });

  it('algo que no es una lista es una lista vacía', () => {
    expect(parseDayNotes(null)).toEqual([]);
    expect(parseDayNotes({ a: 1 })).toEqual([]);
  });

  it('sin el turno vinculado, queda null', () => {
    const { shiftAssignmentId: _omitida, ...sinTurno } = nota;
    expect(parseDayNotes([sinTurno])[0]?.shiftAssignmentId).toBeNull();
  });
});

describe('parseChatMessages', () => {
  const mensaje = {
    id: 'm1',
    roomId: 'r1',
    senderId: null,
    senderName: null,
    content: 'hola',
    createdAt: '2026-10-19T10:00:00Z',
  };

  it('una tarjeta del asistente de un tipo nuevo deja el mensaje como texto', () => {
    const [m] = parseChatMessages([
      { ...mensaje, senderType: 'assistant', botPayload: { kind: 'tarjeta_nueva', x: 1 } },
    ]);
    expect(m?.content).toBe('hola');
    expect(m?.botPayload).toBeNull();
  });

  it('una fila rota se aparta y se informa, sin vaciar la conversación', () => {
    const malas: unknown[] = [];
    const out = parseChatMessages([{ basura: true }], (row) => malas.push(row));
    expect(out).toEqual([]);
    expect(malas).toHaveLength(1);
  });

  it('algo que no es una lista es una lista vacía', () => {
    expect(parseChatMessages(undefined)).toEqual([]);
  });
});

describe('dayNotesConflict', () => {
  const n = (o: object) => parseDayNotes([{ ...nota, ...o }])[0]!;

  it('una solicitud en efecto que bloquea, con un turno ese día: choca', () => {
    expect(dayNotesConflict([n({})], ['t1'])).toBe(true);
  });

  it('rechazada, fuera de efecto o que no bloquea: no', () => {
    expect(dayNotesConflict([n({ decision: 'rejected' })], ['t1'])).toBe(false);
    expect(dayNotesConflict([n({ inEffect: false })], ['t1'])).toBe(false);
    expect(dayNotesConflict([n({ blocksShifts: false })], ['t1'])).toBe(false);
  });

  it('la inasistencia atada a su propio turno no choca con él (orch #87)', () => {
    expect(dayNotesConflict([n({ shiftAssignmentId: 't1' })], ['t1'])).toBe(false);
    expect(dayNotesConflict([n({ shiftAssignmentId: 't1' })], ['t1', 't2'])).toBe(true);
  });
});
