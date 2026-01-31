/**
 * Parse shorthand notation to full numbers
 * Examples: 
 *   300k -> 300000, 9000k -> 9000000, 1.5k -> 1500
 *   9M -> 9000000, 1.5M -> 1500000, 100M -> 100000000
 */
export function parseKNotation(input) {
    if (typeof input !== 'string') {
        return null;
    }

    const cleaned = input.trim().toLowerCase();

    // Match patterns like: 300k, 1.5k, 1000k, 9m, 1.5m
    const matchK = cleaned.match(/^([\d.]+)k$/);
    const matchM = cleaned.match(/^([\d.]+)m$/);

    if (matchK) {
        const number = parseFloat(matchK[1]);
        if (isNaN(number)) return null;
        return number * 1000;
    }

    if (matchM) {
        const number = parseFloat(matchM[1]);
        if (isNaN(number)) return null;
        return number * 1000000;
    }

    return null;
}

/**
 * Parse transaction command (e.g., +300k, -50k, +300k mô tả, +300k | mô tả)
 * Returns { operation: 'add' | 'subtract', amount: number, description: string } or null
 */
export function parseTransactionCommand(message) {
    if (typeof message !== 'string') {
        return null;
    }

    const cleaned = message.trim();

    // Check if using pipe separator
    if (cleaned.includes('|')) {
        const parts = cleaned.split('|');
        const amountPart = parts[0].trim();
        const description = parts.slice(1).join('|').trim() || null;

        const match = amountPart.match(/^([+\-])([\d.]+[km]?)$/i);
        if (match) {
            const amount = parseAmountHelper(match[2]);
            if (amount) {
                return {
                    operation: match[1] === '+' ? 'add' : 'subtract',
                    amount: amount,
                    description: description
                };
            }
        }
        return null;
    }

    // Space separator: +300k mô tả
    const match = cleaned.match(/^([+\-])([\d.]+[km]?)(?:\s+(.+))?$/i);

    if (!match) {
        return null;
    }

    const operator = match[1];
    const amountStr = match[2];
    const description = match[3] ? match[3].trim() : null;

    const amount = parseAmountHelper(amountStr);
    if (!amount) {
        return null;
    }

    return {
        operation: operator === '+' ? 'add' : 'subtract',
        amount: amount,
        description: description
    };
}

/**
 * Helper to parse amount with k/M notation
 */
function parseAmountHelper(amountStr) {
    let amount;
    if (/[km]$/i.test(amountStr)) {
        amount = parseKNotation(amountStr);
    } else {
        amount = parseFloat(amountStr);
    }

    if (!amount || isNaN(amount) || amount <= 0) {
        return null;
    }
    return amount;
}

/**
 * Parse date from various formats
 * Supports: YYYY-MM-DD, DD/MM, DD/MM/YYYY
 */
export function parseDate(input) {
    if (!input) {
        return null;
    }

    const cleaned = input.trim();

    // YYYY-MM-DD format
    const isoMatch = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
        return new Date(cleaned);
    }

    // DD/MM format (assume current year)
    const shortMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (shortMatch) {
        const day = parseInt(shortMatch[1]);
        const month = parseInt(shortMatch[2]);
        const year = new Date().getFullYear();
        return new Date(year, month - 1, day);
    }

    // DD/MM/YYYY format
    const fullMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (fullMatch) {
        const day = parseInt(fullMatch[1]);
        const month = parseInt(fullMatch[2]);
        const year = parseInt(fullMatch[3]);
        return new Date(year, month - 1, day);
    }

    return null;
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num) {
    return num.toLocaleString('en-US');
}

/**
 * Format date as DD/MM/YYYY
 */
export function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}
