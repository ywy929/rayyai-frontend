/**
 * Transaction Constants
 * Shared category lists and configuration for transaction components
 */

export const expenseCategories = [
    "Groceries",
    "Transportation",
    "Entertainment",
    "Utilities",
    "Shopping",
    "Food & Dining",
    "Health & Fitness",
    "Travel",
    "Education",
    "Housing",
    "Insurance",
    "Personal Care",
    "Other",
];

export const incomeCategories = [
    "Salary",
    "Freelance",
    "Business",
    "Investments",
    "Gifts",
    "Refunds",
    "Transfer",
    "Other",
];

// Combined categories (removing duplicates)
export const categories = [...new Set([...expenseCategories, ...incomeCategories])];

// Transaction types
export const transactionTypes = [
    { value: "expense", label: "Expense" },
    { value: "income", label: "Income" },
    { value: "transfer", label: "Transfer" },
];

// Default form data for new transactions
export const getDefaultFormData = (accounts = []) => ({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    category: expenseCategories[0],
    type: "expense",
    needOrWant: "need",
    account: accounts.length > 0 ? accounts[0].account_name : "",
    accountId: accounts.length > 0 ? accounts[0].account_id : null,
    expenseType: "needs",
    // Expense-specific fields
    seller: "",
    location: "",
    taxAmount: "",
    taxDeductible: false,
    isReimbursable: false,
    // Income-specific fields
    payer: "",
    department: "",
    project: "",
    // Common field
    referenceNo: "",
});
