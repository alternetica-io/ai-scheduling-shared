/**
 * Cálculos de fecha y hora en la zona de la SUCURSAL.
 *
 * Regla del producto: todo "hoy", inicio de semana, ventana de fichaje,
 * no-show y auto-clock-out se calcula en la zona IANA de la sucursal. La zona
 * del navegador o del dispositivo solo sirve para mostrarle al usuario su
 * propia hora actual — nunca para decidir.
 *
 * Dos convenciones de almacenamiento conviven en el sistema y confundirlas es
 * la causa de la mayoría de los bugs de este subsistema:
 *
 *   - **wall-clock codificado como UTC** — los horarios (`actual_start_time`,
 *     `actual_end_time`). Un turno que empieza a las 21:00 en Lima se guarda
 *     como `21:00Z`. El sufijo Z miente a propósito: son componentes de pared.
 *   - **instante real en UTC** — los fichajes (`occurred_at`). Ahí la Z es de
 *     verdad.
 *
 * Comparar uno contra otro sin convertir es el error; estas funciones son el
 * puente.
 */

export type FirstDayOfWeek = 'sunday' | 'monday';

const pad = (n: number): string => String(n).padStart(2, '0');

/** Componentes de pared de un instante, en la zona dada. */
function partsInZone(
  instantMs: number,
  tz: string,
): { y: number; mo: number; d: number; h: number; mi: number; s: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date(instantMs));
  const get = (t: string): number =>
    Number(parts.find((p) => p.type === t)?.value ?? '0');
  return {
    y: get('year'),
    mo: get('month'),
    d: get('day'),
    // `hour12: false` puede devolver 24 para la medianoche en algunos runtimes.
    h: get('hour') % 24,
    mi: get('minute'),
    s: get('second'),
  };
}

/** Desfase de la zona en ese instante, en ms (positivo al este de Greenwich). */
function zoneOffsetMs(instantMs: number, tz: string): number {
  const p = partsInZone(instantMs, tz);
  return Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s) - instantMs;
}

/** `YYYY-MM-DD` de HOY en la zona dada. */
export function todayInZone(tz: string, now: Date = new Date()): string {
  const p = partsInZone(now.getTime(), tz);
  return `${p.y}-${pad(p.mo)}-${pad(p.d)}`;
}

/** Minutos desde la medianoche (0–1439) de un instante, en la zona dada. */
export function wallMinutesInZone(
  instant: Date | string,
  tz: string,
): number {
  const ms = typeof instant === 'string' ? Date.parse(instant) : instant.getTime();
  const p = partsInZone(ms, tz);
  return p.h * 60 + p.mi;
}

/**
 * Instante real → ISO con los componentes de PARED de la zona, codificados
 * como UTC. Es la convención con la que se guardan los horarios.
 */
export function instantToWallClock(instant: Date | string, tz: string): string {
  const ms = typeof instant === 'string' ? Date.parse(instant) : instant.getTime();
  const p = partsInZone(ms, tz);
  return new Date(Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s)).toISOString();
}

/**
 * Inverso: un ISO wall-clock-como-UTC → el instante real en esa zona, en ms.
 *
 * DOS PASADAS, y no es un detalle: el desfase hay que medirlo en el instante
 * RESULTANTE, no en la hora de pared tratada como si fuera UTC. En un cambio
 * de horario de verano los dos difieren y una sola pasada se equivoca por una
 * hora justo el día del cambio.
 *
 * Horas que no existen (la madrugada que el reloj se saltea al adelantar) o
 * que ocurren dos veces (al atrasar) se resuelven de forma determinística:
 * la segunda pasada fija un único instante, y para la hora repetida devuelve
 * la primera ocurrencia.
 */
export function wallClockToInstantMs(wallClockIso: string, tz: string): number {
  const wallMs = Date.parse(wallClockIso);
  const firstPass = wallMs - zoneOffsetMs(wallMs, tz);
  return wallMs - zoneOffsetMs(firstPass, tz);
}

/** Igual que `wallClockToInstantMs` pero devuelve el ISO del instante real. */
export function wallClockToInstantIso(wallClockIso: string, tz: string): string {
  return new Date(wallClockToInstantMs(wallClockIso, tz)).toISOString();
}

/**
 * Primer día de la semana que contiene a `ymd`, como `YYYY-MM-DD`.
 *
 * Aritmética de calendario pura: no interviene ninguna zona porque las dos
 * puntas son fechas, no instantes.
 */
export function weekStartOfDate(ymd: string, firstDay: FirstDayOfWeek): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const anchor = Date.UTC(y as number, (m as number) - 1, d as number);
  const dow = new Date(anchor).getUTCDay(); // 0 domingo … 6 sábado
  const start = firstDay === 'sunday' ? 0 : 1;
  const offset = (dow - start + 7) % 7;
  const out = new Date(anchor - offset * 86400000);
  return `${out.getUTCFullYear()}-${pad(out.getUTCMonth() + 1)}-${pad(out.getUTCDate())}`;
}

/** `YYYY-MM-DD` del primer día de la semana EN CURSO, en la zona dada. */
export function weekStartInZone(
  tz: string,
  firstDay: FirstDayOfWeek,
  now: Date = new Date(),
): string {
  return weekStartOfDate(todayInZone(tz, now), firstDay);
}

/** Suma días a una fecha `YYYY-MM-DD`. Aritmética de calendario pura. */
export function addDaysToDate(ymd: string, days: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const out = new Date(
    Date.UTC(y as number, (m as number) - 1, d as number) + days * 86400000,
  );
  return `${out.getUTCFullYear()}-${pad(out.getUTCMonth() + 1)}-${pad(out.getUTCDate())}`;
}
