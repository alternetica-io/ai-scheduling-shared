/**
 * ¿Hay que pedirle el segundo factor a esta sesión?
 *
 * ─── Por qué esto es compartido y no una línea en cada app ──────────────────
 *
 * Supabase NO pide el código por su cuenta. `signInWithPassword` devuelve una
 * sesión en `aal1` incluso si el usuario tiene un TOTP verificado y activo: el
 * desafío lo tiene que hacer la aplicación. Mientras no lo hacíamos, un factor
 * enrolado no protegía nada — con la contraseña se entraba igual.
 *
 * La condición vive acá porque la necesitan la web y el móvil, y es una
 * decisión de SEGURIDAD: si una de las dos copias se separa, esa plataforma
 * deja de pedir el código y nadie se entera hasta que alguien lo prueba. No es
 * un caso de "dos usos que probablemente divergen": acá divergir es el bug.
 *
 * `nextLevel` es el nivel que Supabase considera que esa sesión DEBERÍA
 * alcanzar: vale `aal2` cuando el usuario tiene al menos un factor verificado.
 * Si no tiene factores vale `aal1`, y por eso no alcanza con mirar
 * `currentLevel === 'aal1'` — eso le pediría un código a todo el mundo y nadie
 * podría entrar.
 */
export function needsMfaChallenge(aal: {
  currentLevel: string | null;
  nextLevel: string | null;
}): boolean {
  return aal.nextLevel === 'aal2' && aal.currentLevel === 'aal1';
}
