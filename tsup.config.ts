import { defineConfig } from 'tsup';

// Multiple entry points so consumers can import either the root barrel
// (`@ai-scheduling/shared`) or a subpath (`@ai-scheduling/shared/api`).
// Dual ESM + CJS so both Vite (web) and Metro/Expo (mobile) resolve cleanly.
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'types/index': 'src/types/index.ts',
    'api/index': 'src/api/index.ts',
    'errors/index': 'src/errors/index.ts',
    'schemas/index': 'src/schemas/index.ts',
    'i18n/index': 'src/i18n/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  // axios + zod are peer deps — never bundle them.
  external: ['axios', 'zod'],
});
