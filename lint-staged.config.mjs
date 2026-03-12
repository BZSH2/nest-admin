export default {
  '*.{ts,tsx,js,jsx,cjs,mjs}': ['biome check --write'],
  '**/*.{json,jsonc}': ['biome check --write'],
};
