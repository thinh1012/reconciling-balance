# Mom Balance Reconciliation Bot

## Overview
- **What it does:** Tracks money owed/received between you and your mom. Supports shorthand notation (e.g. `+300k`, `-1.5M`) for quick transaction entry via Telegram.
- **Bot username:** [@your_mom_bot_name] ← update this
- **Who uses it:** Personal use

---

## Tech Stack
- **Language:** Node.js (ES Modules)
- **Library:** node-telegram-bot-api
- **Hosting:** Ubuntu VPS via Proxmox (root@bot-server) at `/root/reconciling-balance`
- **OS:** Ubuntu (running as PM2 process)
- **Database:** SQLite via better-sqlite3

---

## Project Structure
```
reconciling-balance/
├── index.js                    # Entry point
├── src/
│   ├── bot.js                  # Main bot logic & polling config
│   ├── commands/
│   │   ├── help.js             # /help handler
│   │   ├── balance.js          # /balance handler
│   │   ├── history.js          # /today, /history handlers
│   │   ├── transaction.js      # +/- transaction handler
│   │   └── undo.js             # /undo handler
│   ├── services/
│   │   ├── balanceService.js   # Business logic
│   │   └── messageParser.js    # Shorthand notation parser (k, M)
│   └── database/
│       └── db.js               # SQLite setup
├── monitor-bridge-batch.mjs    # Monitor bridge (logs to server-monitor)
├── data/                       # SQLite database (auto-created)
├── .env                        # Secrets (not in git)
└── package.json
```

---

## Bot Commands
| Command | What it does |
|---|---|
| `/start` | Welcome message in Vietnamese |
| `/help` | Show all available commands |
| `/balance` | Show current balance + recent transactions |
| `/today` | Show today's transactions with summary |
| `/history` | Show last 7 days of transactions |
| `/history <date>` | Show transactions for a specific date (DD/MM or YYYY-MM-DD) |
| `/undo` | Undo the last transaction |
| `/ping` | Check if bot is online |
| `+300k` / `-1.5M` | Add or subtract a transaction amount |

---

## Data Sources
| Source | Type | How it connects |
|---|---|---|
| Local SQLite DB | Balance & transaction history | File-based (`./data/balance.db`) |

---

## Environment Variables (.env)
```
TELEGRAM_BOT_TOKEN=    # From BotFather
DATABASE_PATH=./data/balance.db
```

---

## How to Run

```bash
# Install dependencies
npm install

# Run directly
npm start

# Run as PM2 service (Ubuntu) — 15-min cycle
pm2 start index.js --name "mom-bot"
pm2 restart mom-bot --restart-delay 540000   # 9 min sleep after 6 min run
pm2 save
```

---

## PM2 Behaviour ⚠️
> PM2 **always restarts** the bot when it stops — even after the built-in 6-minute Wake-and-Sleep shutdown.
> The `--restart-delay 540000` creates a **15-minute cycle**: 6 min ON → 9 min OFF.
> To permanently stop: `pm2 stop mom-bot`

---

## Auto-Start on Boot (Proxmox → Ubuntu → PM2)
```bash
# Run once on Ubuntu to enable PM2 auto-start:
pm2 startup
# Copy and run the command it outputs, then:
pm2 save
```
> Also set **Start at boot = Yes** on the Proxmox VM Options page.
> Full flow: PC on → Proxmox boots → Ubuntu VM starts → PM2 restarts all saved processes.

---

## Security Notes
- [x] API keys stored in `.env`, never in code
- [x] `.env` and `data/` are in `.gitignore`
- [ ] No user ID restriction — bot responds to anyone who messages it

---

## Known Issues / Bugs
- Occasional `EFATAL: AggregateError` — network blip, bot auto-retries, safe to ignore
- `409 Conflict` — bot is running on two machines with the same token, stop the other one

---

## Future Ideas
- [ ] Restrict bot to specific Telegram user IDs for security
- [ ] Daily balance summary notification
- [ ] Alert when balance crosses a threshold

