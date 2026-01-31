import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = process.env.DATABASE_PATH || './data/balance.db';

console.log(`Connecting to database at: ${DB_PATH}`);

try {
    const db = new Database(DB_PATH);
    
    // Check current count
    const txCountBefore = db.prepare('SELECT COUNT(*) as count FROM transactions').get();
    const balanceBefore = db.prepare("SELECT current_balance FROM balances WHERE name = 'mom'").get();
    
    console.log(`Current transactions: ${txCountBefore.count}`);
    console.log(`Current balance: ${balanceBefore ? balanceBefore.current_balance : 'N/A'}`);
    
    // Start transaction for safety
    const clearData = db.transaction(() => {
        // Delete all transactions
        db.prepare('DELETE FROM transactions').run();
        
        // Reset balance to 0
        db.prepare("UPDATE balances SET current_balance = 0, updated_at = CURRENT_TIMESTAMP WHERE name = 'mom'").run();
    });
    
    clearData();
    
    console.log('✅ Transactions cleared and balance reset to 0!');
    
    // Verify
    const txCountAfter = db.prepare('SELECT COUNT(*) as count FROM transactions').get();
    const balanceAfter = db.prepare("SELECT current_balance FROM balances WHERE name = 'mom'").get();
    
    console.log(`Remaining transactions: ${txCountAfter.count}`);
    console.log(`New balance: ${balanceAfter ? balanceAfter.current_balance : 0}`);
    
    db.close();
    process.exit(0);
} catch (error) {
    console.error('❌ Error clearing transactions:', error.message);
    process.exit(1);
}
