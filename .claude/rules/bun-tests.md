---
paths:
  - "src/**/*.test.ts"
  - "src/**/*.test.tsx"
---

# Bun tests

- A `mock.module` applies to the whole `bun test` run, not just its own file: two files that mock the same module differently break each other, depending on run order. Mock a shared module the same way everywhere, from one helper (`chapter-storage/chapter-storage.mock.ts`, used by the three `state/*.test.ts`), and keep ids that don't collide between files, since observables in memory are shared too.
