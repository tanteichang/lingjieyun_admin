# Repository Guidelines

## Stack & UI Library
- Vue 3 + TypeScript + Vite + Pinia project scaffolded from `tdesign-starter-cli`.
- UI is built with TDesign Vue Next (`tdesign-vue-next`, `tdesign-icons-vue-next`) and `@form-create/tdesign`; prefer TDesign components and tokens before custom styling.
- Theme/layout switches live in `src/config/style.ts` (mode, layout, brandTheme, sidebar/header toggles); shared color tokens are in `src/config/color.ts`; global styles are under `src/style/`.

## Development & Build
- Requires Node >= 18.18.0.
- Install deps with `npm install`.
- Local dev: `npm run dev` (mock data via `npm run dev:mock` if needed).
- Builds: `npm run build` for release, `npm run build:test` for test env, `npm run preview` to serve the built output, and `npm run build:type` for `vue-tsc --noEmit`.

## Quality & Linting
- ESLint: `npm run lint` / `npm run lint:fix` for Vue/TS/JS; Stylelint: `npm run stylelint` / `npm run stylelint:fix`.
- No automated tests yet (`npm run test` placeholder), so rely on lint + manual verification around changed flows.

## Project Structure
- App entry at `src/main.ts`; routing under `src/router`; auth/permission guard in `src/permission.ts`.
- Pages under `src/pages`; shared UI in `src/components`; layouts in `src/layouts`; state in `src/store`; i18n strings in `src/locales`; configuration helpers in `src/config`.
