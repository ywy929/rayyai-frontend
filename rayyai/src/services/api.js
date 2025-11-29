/**
 * API Services - Backwards Compatibility Export
 *
 * This file re-exports from the new modular structure in ./api/
 * All imports from '../services/api' will continue to work.
 *
 * New structure:
 * - ./api/client.js    - Core HTTP client, token management, ApiError
 * - ./api/auth.js      - Authentication endpoints
 * - ./api/transactions.js - Income, expense, transfer, unified transactions
 * - ./api/accounts.js  - Account management
 * - ./api/budgets.js   - Budget management
 * - ./api/goals.js     - Financial goals
 * - ./api/cards.js     - Credit cards and recommendations
 * - ./api/chat.js      - RayyAI chat and insights
 * - ./api/scanner.js   - Receipt scanning
 */

// Re-export everything from the new modular structure
export {
  // Core client
  API_BASE_URL,
  getToken,
  setToken,
  removeToken,
  isAuthenticated,
  ApiError,
  request,
  api,

  // Domain APIs
  authApi,
  incomeApi,
  expenseApi,
  transferApi,
  transactionApi,
  accountApi,
  budgetApi,
  goalsApi,
  cardsApi,
  chatApi,
  rayyaiApi,
  scannerApi,
} from './api/index';

// Default export
export { default } from './api/index';
