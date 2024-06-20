module.exports = {
  "**/*.{ts,tsx}": (files) => `nx affected --target=typecheck --files=${files.join(",")}`,
  "**/*.{js,ts,jsx,tsx,json,html,yml,yaml,md,cjs,mjs}": [
    (files) => `prettier --write ${files.join(" ")}`,
    (files) => `nx affected:lint --files=${files}`,
  ],
};
