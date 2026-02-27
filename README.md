# TikWright Toolkit (Educational)

This repository contains an **educational demonstration only** framework for building controlled automation and research tooling. It is designed for local test environments and must not be used on live platforms without explicit permission.

## Project Structure

```
.
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── packages
    ├── api
    ├── core
    ├── shared
    └── worker
```

## Packages

- **@tikwright/shared**: shared types and utilities
- **@tikwright/core**: Playwright stealth browser factory + behavior simulation helpers
- **@tikwright/worker**: BullMQ queues, schedulers, and workers
- **@tikwright/api**: placeholder for future REST API

## Setup

```bash
corepack enable
pnpm install
pnpm --filter @tikwright/worker dev
```

## Docker (local dev)

```bash
docker compose up
```

## Educational Notice

All automation features in this repository are strictly for educational demonstrations in controlled environments. Do not use on live platforms without explicit permission.
