/**
 * API Services Index
 * Re-exports all API services for convenient importing
 */

// Core client exports
export {
  API_BASE_URL,
  getToken,
  setToken,
  removeToken,
  isAuthenticated,
  ApiError,
  request,
  api,
  axiosInstance,
} from './client';

// Domain-specific API exports
export { authApi } from './auth';
export { incomeApi, expenseApi, transferApi, transactionApi } from './transactions';
export { accountApi } from './accounts';
export { budgetApi } from './budgets';
export { goalsApi } from './goals';
export { cardsApi } from './cards';
export { chatApi, rayyaiApi } from './chat';
export { scannerApi } from './scanner';

// Default export with all APIs grouped
import { authApi } from './auth';
import { incomeApi, expenseApi, transferApi, transactionApi } from './transactions';
import { accountApi } from './accounts';
import { budgetApi } from './budgets';
import { goalsApi } from './goals';
import { cardsApi } from './cards';
import { chatApi, rayyaiApi } from './chat';
import { scannerApi } from './scanner';

export default {
  auth: authApi,
  income: incomeApi,
  expense: expenseApi,
  transfer: transferApi,
  transactions: transactionApi,
  accounts: accountApi,
  budgets: budgetApi,
  goals: goalsApi,
  cards: cardsApi,
  rayyai: rayyaiApi,
  scanner: scannerApi,
  chat: chatApi,
};
