# AquaSphere

Unified smart-aquarium dashboard: vision health, water-quality XAI, behaviour-driven feeding.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Scripts

| Command        | Action              |
| -------------- | ------------------- |
| `npm run dev`  | Vite dev server     |
| `npm run build`| Typecheck + production build → `dist/` |
| `npm run preview` | Serve `dist/`    |
| `npm run lint` | `tsc --noEmit`      |

## Ship / zip

Do **not** include `node_modules` or `dist`. Clone or unzip the `main` folder, then `npm install` and `npm run build` on the target machine.
