/**
 * Centralized formatting utilities for currency, dates, and percentages
 */

/**
 * Format a numeric value as currency
 * @param {number|string} value - The value to format
 * @param {Object} options - Formatting options
 * @param {string} options.currency - Currency code (default: 'MYR')
 * @param {string} options.locale - Locale string (default: 'en-MY')
 * @param {number} options.maximumFractionDigits - Max decimal places (default: 2)
 * @param {number} options.minimumFractionDigits - Min decimal places (default: 0)
 * @param {string} options.fallback - Fallback string for invalid values (default: 'RM 0')
 * @param {boolean} options.addSpace - Add space after currency symbol (default: true)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, options = {}) => {
    const {
        currency = 'MYR',
        locale = 'en-MY',
        maximumFractionDigits = 2,
        minimumFractionDigits = 0,
        fallback = 'RM 0',
        addSpace = true,
    } = options;

    const numeric = Number(value);

    if (value === null || value === undefined || Number.isNaN(numeric)) {
        return fallback;
    }

    try {
        const formatted = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
            maximumFractionDigits,
            minimumFractionDigits,
        }).format(numeric);

        // Add space after RM if requested (for MYR)
        if (addSpace && currency === 'MYR') {
            return formatted.replace('RM', 'RM ').replace(/\s+/g, ' ').trim();
        }

        return formatted;
    } catch {
        // Fallback formatting
        const symbol = currency === 'USD' ? '$' : currency === 'MYR' ? 'RM ' : `${currency} `;
        return `${symbol}${numeric.toLocaleString(locale, { maximumFractionDigits })}`;
    }
};

/**
 * Format a date value
 * @param {Date|string|number} date - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options,
    };

    try {
        return new Intl.DateTimeFormat('en-MY', defaultOptions).format(new Date(date));
    } catch {
        return String(date);
    }
};

/**
 * Format a number as percentage
 * @param {number} value - The value to format (0-100 or 0-1)
 * @param {number} decimals - Number of decimal places (default: 1)
 * @param {boolean} isDecimal - Whether value is decimal (0-1) or percentage (0-100)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1, isDecimal = false) => {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return '0%';

    const percentage = isDecimal ? numeric * 100 : numeric;
    return `${percentage.toFixed(decimals)}%`;
};

/**
 * Format a number with thousand separators
 * @param {number|string} value - The value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export const formatNumber = (value, decimals = 0) => {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return '0';

    return numeric.toLocaleString('en-MY', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};
