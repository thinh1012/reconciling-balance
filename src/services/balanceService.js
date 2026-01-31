import { getDatabase } from '../database/db.js';

/**
 * Ensure balance record exists for 'mom'
 * Prevents logic errors if the database is reset or record is missing.
 */
function ensureBalanceRecordExists() {
  const db = getDatabase();
  const insertBalance = db.prepare(`
    INSERT OR IGNORE INTO balances (name, current_balance) 
    VALUES ('mom', 0)
  `);
  insertBalance.run();
}

/**
 * Check if a transaction with this message ID already exists
 */
function isDuplicateTransaction(messageId) {
  if (!messageId) return false;
  const db = getDatabase();
  const stmt = db.prepare('SELECT id FROM transactions WHERE source_message_id = ?');
  return !!stmt.get(messageId);
}

/**
 * Get current balance for mom
 */
export function getCurrentBalance() {
  const db = getDatabase();
  ensureBalanceRecordExists();
  const stmt = db.prepare('SELECT current_balance FROM balances WHERE name = ?');
  const result = stmt.get('mom');
  return result ? result.current_balance : 0;
}

/**
 * Add balance and create transaction record
 */
export function addBalance(amount, description = 'received', messageId = null) {
  const db = getDatabase();

  if (isDuplicateTransaction(messageId)) {
    console.log(`[IDEMPOTENCY] Skipping duplicate transaction for message ${messageId}`);
    return getCurrentBalance();
  }

  const updateBalance = db.prepare(`
    UPDATE balances 
    SET current_balance = current_balance + ?, 
        updated_at = CURRENT_TIMESTAMP 
    WHERE name = ?
  `);

  const insertTransaction = db.prepare(`
    INSERT INTO transactions (balance_id, amount, description, source_message_id) 
    VALUES ((SELECT id FROM balances WHERE name = ?), ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    ensureBalanceRecordExists();
    updateBalance.run(amount, 'mom');
    insertTransaction.run('mom', amount, description, messageId);
  });

  transaction();

  return getCurrentBalance();
}

/**
 * Subtract balance and create transaction record
 */
export function subtractBalance(amount, description = 'sent', messageId = null) {
  const db = getDatabase();

  if (isDuplicateTransaction(messageId)) {
    console.log(`[IDEMPOTENCY] Skipping duplicate transaction for message ${messageId}`);
    return getCurrentBalance();
  }

  const updateBalance = db.prepare(`
    UPDATE balances 
    SET current_balance = current_balance - ?, 
        updated_at = CURRENT_TIMESTAMP 
    WHERE name = ?
  `);

  const insertTransaction = db.prepare(`
    INSERT INTO transactions (balance_id, amount, description, source_message_id) 
    VALUES ((SELECT id FROM balances WHERE name = ?), ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    ensureBalanceRecordExists();
    updateBalance.run(amount, 'mom');
    insertTransaction.run('mom', -amount, description, messageId);
  });

  transaction();

  return getCurrentBalance();
}

/**
 * Get recent transaction history
 */
export function getTransactionHistory(limit = 10) {
  const db = getDatabase();
  ensureBalanceRecordExists();
  const stmt = db.prepare(`
    SELECT amount, description, created_at 
    FROM transactions 
    WHERE balance_id = (SELECT id FROM balances WHERE name = ?)
    ORDER BY created_at DESC 
    LIMIT ?
  `);

  return stmt.all('mom', limit);
}

/**
 * Get transactions for a specific date
 */
export function getTransactionsByDate(date) {
  const db = getDatabase();
  ensureBalanceRecordExists();
  const dateStr = date.toISOString().split('T')[0];

  const stmt = db.prepare(`
    SELECT amount, description, created_at 
    FROM transactions 
    WHERE balance_id = (SELECT id FROM balances WHERE name = ?)
      AND date(created_at) = date(?)
    ORDER BY created_at ASC
  `);

  return stmt.all('mom', dateStr);
}

/**
 * Get transactions within a date range
 */
export function getTransactionsInRange(startDate, endDate) {
  const db = getDatabase();
  ensureBalanceRecordExists();
  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  const stmt = db.prepare(`
    SELECT amount, description, created_at 
    FROM transactions 
    WHERE balance_id = (SELECT id FROM balances WHERE name = ?)
      AND date(created_at) >= date(?)
      AND date(created_at) <= date(?)
    ORDER BY created_at ASC
  `);

  return stmt.all('mom', startStr, endStr);
}

/**
 * Get today's transaction summary
 */
export function getTodaysSummary() {
  const today = new Date();
  const transactions = getTransactionsByDate(today);

  let totalReceived = 0;
  let totalSent = 0;

  transactions.forEach(tx => {
    if (tx.amount > 0) {
      totalReceived += tx.amount;
    } else {
      totalSent += Math.abs(tx.amount);
    }
  });

  return {
    transactions,
    totalReceived,
    totalSent,
    net: totalReceived - totalSent,
    date: today
  };
}

/**
 * Undo the last transaction
 */
export function undoLastTransaction() {
  const db = getDatabase();
  ensureBalanceRecordExists();

  const getLastTx = db.prepare(`
        SELECT id, amount, description, created_at 
        FROM transactions 
        WHERE balance_id = (SELECT id FROM balances WHERE name = ?)
        ORDER BY created_at DESC, id DESC
        LIMIT 1
    `);

  const lastTx = getLastTx.get('mom');

  if (!lastTx) {
    return null;
  }

  const deleteTx = db.prepare('DELETE FROM transactions WHERE id = ?');
  const updateBalance = db.prepare(`
        UPDATE balances 
        SET current_balance = current_balance - ?, 
            updated_at = CURRENT_TIMESTAMP 
        WHERE name = ?
    `);

  const transaction = db.transaction(() => {
    deleteTx.run(lastTx.id);
    updateBalance.run(lastTx.amount, 'mom');
  });

  transaction();

  return {
    amount: lastTx.amount,
    description: lastTx.description,
    created_at: lastTx.created_at,
    newBalance: getCurrentBalance()
  };
}
