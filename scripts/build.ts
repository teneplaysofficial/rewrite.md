import { rm } from 'fs/promises';

await rm('dist', { recursive: true, force: true });

await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  format: 'esm',
  target: 'node',
  minify: true,
  packages: 'external',
});

await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  format: 'cjs',
  target: 'node',
  minify: true,
  naming: '[dir]/[name].cjs',
  packages: 'external',
});
