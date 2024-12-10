module.exports = {
  // Only run prettier since it writes to files. Type check and linting are only checks and run on
  // each PR anyway.
  // "**/*.{ts,tsx}": (files) => `nx affected --target=typecheck --files=${files.join(",")}`,
  "**/*.{js,ts,jsx,tsx,json,html,yml,yaml,md,cjs,mjs}": [
    (files) => `prettier --write ${files.join(" ")}`,
    // (files) => `nx affected:lint --files=${files}`,
  ],
};
