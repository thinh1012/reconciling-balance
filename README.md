# Reconcile Balance

A Telegram bot for tracking a shared running balance between two people. Designed for family money tracking — quick transaction entry with shorthand notation, full history, and undo support.

## What it does

- Add or subtract amounts with shorthand notation (`+300k`, `-1.5M`, `+9M`)
- View current balance and recent transactions
- Browse history by date
- Undo the last transaction
- Runs 24/7 in webhook mode on a self-hosted Ubuntu server

## Stack

- Node.js (ES Modules)
- Telegram Bot API (webhook mode)
- SQLite (better-sqlite3)
- PM2 for process management

## Setup

```bash
npm install
cp .env.example .env   # fill in your values
npm start
```

## Environment variables

| Variable | Description |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Telegram bot token |
| `WEBHOOK_URL` | Public HTTPS URL for Telegram webhook |
| `PORT` | Webhook listener port |
| `DATABASE_PATH` | Path to SQLite database file |

## Commands

| Command | Description |
|---|---|
| `/help` | Show all commands |
| `/balance` | Current balance + recent transactions |
| `/today` | Today's transactions |
| `/history` | Last 7 days |
| `/history <date>` | Specific date (`DD/MM` or `YYYY-MM-DD`) |
| `/undo` | Undo last transaction |

## Transaction input

Just type the amount directly — no command needed:

```
+300k     → add 300,000
-50k      → subtract 50,000
+9M       → add 9,000,000
-1.5M     → subtract 1,500,000
+100      → add 100
```

## Project structure

```
├── src/
│   ├── bot.js              # Webhook setup + message routing
│   ├── commands/           # /balance, /history, /today, /undo, /help
│   ├── services/           # Balance logic, message parser
│   └── database/           # SQLite schema + queries
├── index.js                # Entry point
└── .env.example
```

## Self-hosting notes

Runs behind nginx (port 8443) with a self-signed cert for Telegram webhook compatibility. PM2 restores the process on reboot.
