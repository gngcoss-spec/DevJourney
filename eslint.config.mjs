import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default [
  ...nextCoreWebVitals,
  {
    ignores: [".next/", "node_modules/", "supabase/", "worktree/"],
  },
  {
    files: ["src/__tests__/**/*"],
    rules: {
      "react/display-name": "off",
    },
  },
];
