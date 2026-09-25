# BabyPlanner

A warm, keepsake-feeling baby activity log: the speed of a utility app with the care of a printed memory book.

## Repository layout

- **backend/** — .NET 8 Web API (C#)
- **frontend/baby-planner/** — Angular 22 web app (TypeScript, SCSS)
- **docs/** — Product, design, and architecture documents

## Required versions

- **Node.js** >= 22.22.3 (tested on 24.21 LTS via nvm)
- **.NET SDK & runtime** — version 8, or run a newer runtime with `DOTNET_ROLL_FORWARD=Major`

Set the Node version with nvm:

```bash
nvm use 24
```

## Running the API

```bash
dotnet run --project backend/src/BabyPlanner.Api
```

Check `backend/src/BabyPlanner.Api/Properties/launchSettings.json` for the HTTPS port (default: 7057).

## Running the frontend

From `frontend/baby-planner/`:

```bash
npm install
npm start
```

The dev server (port 4300) proxies API requests to the running backend (default: https://localhost:7057).

## Development

- **Styles & design tokens** — `frontend/baby-planner/src/styles/`
- **Component showcase** (dev only) — visit `/dev/components` when the app is running

## Documentation

- **Product vision & constraints** — [PRODUCT.md](PRODUCT.md)
- **Redesign plan** — [docs/redesign/REDESIGN_PLAN.md](docs/redesign/REDESIGN_PLAN.md)
- **Architecture decisions** — [docs/adr/](docs/adr/)
