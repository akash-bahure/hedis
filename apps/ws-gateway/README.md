# ws-gateway

Elysia-based WebSocket gateway (runs on Bun).

## Initialization

This app is a placeholder. Initialize it:

```bash
cd apps/ws-gateway
bun create elysia .
```

Or manually:

```bash
bun init
bun add elysia
```

## Structure (after initialization)

```
apps/ws-gateway/
├── src/
│   └── index.ts           # Elysia entry point (WebSocket handlers)
├── package.json
├── tsconfig.json
├── Makefile
└── project.json
```

## Running

```bash
make -C apps/ws-gateway dev
```

Port: `3001`
