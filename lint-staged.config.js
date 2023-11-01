module.exports = {
  // "**/*.{ts,tsx}": (files) => `nx affected --target=typecheck --files=${files.join(",")}`,
  "**/*.{js,ts,jsx,tsx,json,html,yml,yaml,md,cjs,mjs}": [
    // (files) => `nx affected:lint --files=${files.join(",")}`,
    (files) => `nx format:write --files=${files.join(",")}`,
  ],
};
