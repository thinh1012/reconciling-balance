# Mom Balance Reconciliation Bot

A Telegram bot for tracking balance reconciliation with your mom. Supports shorthand notation (e.g., 300k = 300,000, 9M = 9,000,000) for quick transaction entry.

## Features

- ✅ Add/subtract balance with shorthand notation (`+300k`, `-50k`, `+9M`, `-1.5M`)
- 📊 View current balance
- 📅 View transactions by date
- 📈 Daily transaction summaries
- 💾 SQLite database for persistent storage
- 🕒 Full transaction history with timestamps

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Follow the prompts to create your bot
4. Copy the bot token provided by BotFather

### 3. Configure Environment

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your bot token:
   ```
   TELEGRAM_BOT_TOKEN=your_token_here
   DATABASE_PATH=./data/balance.db
   ```

### 4. Run the Bot

```bash
npm start
```

Or for development:

```bash
npm run dev
```

## Usage

### Commands

| Command | Description |
|---------|-------------|
| `/help` | Show help message with all commands |
| `/balance` | Show current balance and recent transactions |
| `/today` | Show today's transactions with summary |
| `/history` | Show last 7 days of transactions |
| `/history <date>` | Show transactions for a specific date |

### Transaction Commands

Simply type the transaction amount with `+` or `-`:

- `+300k` → Add 300,000 to balance
- `-50k` → Subtract 50,000 from balance
- `+9M` → Add 9,000,000 to balance
- `-1.5M` → Subtract 1,500,000 from balance
- `+100` → Add 100 to balance (works without notation too)

### Shorthand Notation

The bot automatically converts shorthand notation:

**Thousands (k):**
- `300k` = 300,000
- `1k` = 1,000
- `1.5k` = 1,500

**Millions (M):**
- `9M` = 9,000,000
- `1.5M` = 1,500,000
- `100M` = 100,000,000

The `/history` command supports multiple date formats:

- `DD/MM` → e.g., `19/01` (assumes current year)
- `YYYY-MM-DD` → e.g., `2026-01-19`

Examples:
```
/history 19/01
/history 2026-01-19
```

## Project Structure

```
reconciling-balance/
├── src/
│   ├── commands/          # Command handlers
│   │   ├── help.js
│   │   ├── balance.js
│   │   ├── history.js
│   │   └── transaction.js
│   ├── services/          # Business logic
│   │   ├── balanceService.js
│   │   └── messageParser.js
│   ├── database/          # Database setup
│   │   └── db.js
│   └── bot.js             # Main bot logic
├── data/                  # Database files (auto-created)
├── index.js               # Entry point
├── package.json
├── .env.example
└── README.md
```

## Database Schema

### balances table
- `id` - Primary key
- `name` - Account name (e.g., "mom")
- `current_balance` - Current balance amount
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### transactions table
- `id` - Primary key
- `balance_id` - Foreign key to balances
- `amount` - Transaction amount (positive for add, negative for subtract)
- `description` - Transaction description
- `created_at` - Transaction timestamp

## Troubleshooting

### Bot not responding
- Check that your bot token is correct in `.env`
- Ensure the bot is running (`npm start`)
- Verify you're messaging the correct bot in Telegram

### Database errors
- Check that the `data/` directory is writable
- Delete `data/balance.db` to reset the database

## Development

The bot uses:
- **Node.js** with ES modules
- **node-telegram-bot-api** for Telegram integration
- **better-sqlite3** for database operations
- **dotenv** for environment variables

## License

MIT
