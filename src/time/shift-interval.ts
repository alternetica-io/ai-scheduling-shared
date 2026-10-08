/**
 * Los dos horarios de un turno: el programado y el trabajado.
 *
 * ─── Por qué hace falta una regla ───────────────────────────────────────────
 *
 * Un turno guarda dos intervalos, y las columnas no se llaman como uno
 * esperaría:
 *
 *  - `planned_start_time` / `planned_end_time` → el **programado** original.
 *  - `actual_start_time` / `actual_end_time`   → el **trabajado**… y, mientras
 *    no haya un fichaje aprobado, también el programado.
 *
 * Ahí está la trampa: la columna del trabajado **arranca conteniendo el
 * programado**. Cuando se aprueba un fichaje, `syncShiftToPunch` copia la hora
 * real sobre `actual_*` y preserva el valor anterior en `planned_*`, pero solo
 * la primera vez.
 *
 * Así que `planned_* = null` NO significa "no hay programado": significa
 * "nunca se pisó, el programado sigue estando en `actual_*`". De ahí que la
 * coalescencia **sea** la regla y no un descuido defensivo.
 *
 * ─── Qué salió mal sin esto ─────────────────────────────────────────────────
 *
 * La pantalla de Asistencia mostraba `actual_end_time` con la etiqueta
 * "Horario" y juzgaba la puntualidad contra eso. En un turno hasta las 23:00
 * con salida fichada 22:17 decía "Horario 10:17 p. m. · a tiempo": comparaba
 * lo trabajado contra sí mismo (front #2). El móvil hacía lo mismo
 * (móvil #11).
 *
 * Vive en el paquete compartido porque el error se cometió dos veces, en la
 * web y en el móvil, leyendo la misma fila.
 */

export interface ShiftTimes {
  /** `planned_start_time`. `null` = nunca se pisó. */
  plannedStart?: string | null;
  /** `planned_end_time`. `null` = nunca se pisó. */
  plannedEnd?: string | null;
  /** `actual_start_time`. Ojo: es el programado si `plannedStart` es `null`. */
  actualStart?: string | null;
  /** `actual_end_time`. Ojo: es el programado si `plannedEnd` es `null`. */
  actualEnd?: string | null;
}

export interface Interval {
  start: string | null;
  end: string | null;
}

/**
 * El horario **programado**: lo que se le asignó al empleado.
 *
 * Es lo que hay que mostrar con la etiqueta "Horario" y contra lo que hay que
 * juzgar si llegó tarde o se fue temprano.
 */
export function scheduledInterval(t: ShiftTimes): Interval {
  return {
    start: t.plannedStart ?? t.actualStart ?? null,
    end: t.plannedEnd ?? t.actualEnd ?? null,
  };
}

/**
 * El horario **trabajado**: lo que quedó después de los fichajes aprobados.
 *
 * Siempre es `actual_*`. Devuelve lo mismo que el programado cuando no hubo
 * fichaje aprobado, y eso es correcto: sin fichaje, lo trabajado que conoce el
 * sistema es lo que estaba previsto.
 */
export function workedInterval(t: ShiftTimes): Interval {
  return { start: t.actualStart ?? null, end: t.actualEnd ?? null };
}

/**
 * `true` si el fichaje aprobado movió el horario, o sea si vale la pena mostrar
 * los dos.
 *
 * Sirve para no repetir la misma hora dos veces en la pantalla: cuando nadie
 * pisó nada, programado y trabajado son el mismo valor.
 */
export function shiftTimesDiffer(t: ShiftTimes): boolean {
  const p = scheduledInterval(t);
  const w = workedInterval(t);
  return p.start !== w.start || p.end !== w.end;
}
