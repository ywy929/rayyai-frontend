import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    Plus,
    ArrowUpDown,
    Search,
    Filter,
    X,
    Eye,
    EyeClosed,
    Trash2,
    Info,
    ChevronDown,
    ChevronRight,
    AlertTriangle,
    CheckCircle2,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectScrollDownButton,
    SelectScrollUpButton,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
} from "@/components/ui/pagination";
import {
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardAction,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

import { GlobalLoader } from "@/components/shared";
import { transactionApi, accountApi } from "@/services/api";
import { formatCurrency } from "@/utils/formatting";

// Import extracted transaction components
import {
    AddTransactionDialog,
    expenseCategories,
    incomeCategories,
    categories,
} from "@/components/transactions";

function Transactions() {
    //add transaction dialog state
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false); //pop-up dialog for add transaction fn
    const [entryMethod, setEntryMethod] = useState("selection");

    // Transaction data state - now from API instead of mock data
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Accounts state - needed for account selection in forms
    const [accounts, setAccounts] = useState([]);
    // const [accountsLoading, setAccountsLoading] = useState(true);

    //filter states
    const [searchTerm, setSearchTerm] = useState(""); //depend input search box
    const [categoryFilter, setCategoryFilter] = useState(() => {
        // Load from localStorage on initial render
        return localStorage.getItem('transactionCategoryFilter') || "";
    });
    const [typeFilter, setTypeFilter] = useState(() => {
        // Load from localStorage on initial render
        return localStorage.getItem('transactionTypeFilter') || "";
    });
    const [selectedMonth, setSelectedMonth] = useState(() => {
        // Load from localStorage on initial render
        return localStorage.getItem('transactionSelectedMonth') || "";
    });
    const [selectedYear, setSelectedYear] = useState(() => {
        // Load from localStorage on initial render
        return localStorage.getItem('transactionSelectedYear') || "";
    });

    //advance filter states
    const [showMoreFilters, setShowMoreFilters] = useState(false); //toggle for More Filters button
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [minAmount, setMinAmount] = useState("");
    const [maxAmount, setMaxAmount] = useState("");
    const [accountFilter, setAccountFilter] = useState("");

    //sorting states
    const [sortField, setSortField] = useState("date"); // Which field to sort by (date, description, amount, etc.)
    const [sortDirection, setSortDirection] = useState("desc"); // Sort direction: "asc" (ascending) or "desc" (descending)

    //expanded row state
    const [expandedRow, setExpandedRow] = useState(null); // Track which row is expanded
    const [editedTransaction, setEditedTransaction] = useState(null); // Track original data before edits
    const [isSaving, setIsSaving] = useState(false); // Track save operation status

    // Suspicious transactions state - loaded from localStorage when navigating from dashboard
    const [suspiciousTransactionIds, setSuspiciousTransactionIds] = useState(new Set());
    const [showSuspiciousOnly, setShowSuspiciousOnly] = useState(false);

    //delete confirmation dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState(null);

    //bulk delete state
    const [selectedTransactions, setSelectedTransactions] = useState(new Set());
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    //pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        // Load from localStorage on initial render
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('transactionItemsPerPage');
            if (saved) {
                const parsed = parseInt(saved, 10);
                // Validate that it's one of the allowed values
                if ([10, 20, 50, 100].includes(parsed)) {
                    return parsed;
                }
            }
        }
        return 10;
    });

    // ===========================
    // API Functions
    // ===========================

    // Fetch all transactions from backend
    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Build filter params for backend
            const params = {};
            if (categoryFilter) params.category = categoryFilter;
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
            if (minAmount) params.min_amount = parseFloat(minAmount);
            if (maxAmount) params.max_amount = parseFloat(maxAmount);

            // Try to fetch from backend, fallback to mock data if connection fails
            try {
                const data = await transactionApi.getAll(params, true);
                setTransactions(data);
            } catch (apiError) {
                console.warn(
                    "Backend not available, using mock data:",
                    apiError.message
                );

                // Mock transaction data for development
                const mockTransactions = [
                    {
                        id: 1,
                        amount: -45.5,
                        description: "Grocery Store Purchase",
                        category: "Food & Dining",
                        date: "2024-01-15",
                        account_id: 1,
                        account: { name: "Checking Account", type: "checking" },
                        type: "expense",
                    },
                    {
                        id: 2,
                        amount: 2500.0,
                        description: "Salary Deposit",
                        category: "Income",
                        date: "2024-01-14",
                        account_id: 1,
                        account: { name: "Checking Account", type: "checking" },
                        type: "income",
                    },
                    {
                        id: 3,
                        amount: -120.0,
                        description: "Electric Bill",
                        category: "Utilities",
                        date: "2024-01-13",
                        account_id: 1,
                        account: { name: "Checking Account", type: "checking" },
                        type: "expense",
                    },
                    {
                        id: 4,
                        amount: -25.99,
                        description: "Netflix Subscription",
                        category: "Entertainment",
                        date: "2024-01-12",
                        account_id: 2,
                        account: { name: "Credit Card", type: "credit" },
                        type: "expense",
                    },
                    {
                        id: 5,
                        amount: -89.99,
                        description: "Gas Station",
                        category: "Transportation",
                        date: "2024-01-11",
                        account_id: 1,
                        account: { name: "Checking Account", type: "checking" },
                        type: "expense",
                    },
                    {
                        id: 6,
                        amount: 500.0,
                        description: "Freelance Payment",
                        category: "Income",
                        date: "2024-01-10",
                        account_id: 1,
                        account: { name: "Checking Account", type: "checking" },
                        type: "income",
                    },
                    {
                        id: 7,
                        amount: -15.5,
                        description: "Coffee Shop",
                        category: "Food & Dining",
                        date: "2024-01-09",
                        account_id: 2,
                        account: { name: "Credit Card", type: "credit" },
                        type: "expense",
                    },
                    {
                        id: 8,
                        amount: -200.0,
                        description: "Rent Payment",
                        category: "Housing",
                        date: "2024-01-08",
                        account_id: 1,
                        account: { name: "Checking Account", type: "checking" },
                        type: "expense",
                    },
                ];

                // Apply filters to mock data
                let filteredData = mockTransactions;

                if (categoryFilter) {
                    filteredData = filteredData.filter(
                        (t) => t.category === categoryFilter
                    );
                }
                if (startDate) {
                    filteredData = filteredData.filter(
                        (t) => t.date >= startDate
                    );
                }
                if (endDate) {
                    filteredData = filteredData.filter(
                        (t) => t.date <= endDate
                    );
                }
                if (minAmount) {
                    filteredData = filteredData.filter(
                        (t) => Math.abs(t.amount) >= parseFloat(minAmount)
                    );
                }
                if (maxAmount) {
                    filteredData = filteredData.filter(
                        (t) => Math.abs(t.amount) <= parseFloat(maxAmount)
                    );
                }

                setTransactions(filteredData);
            }
        } catch (err) {
            console.error("Failed to fetch transactions:", err);
            setError(err.message || "Failed to load transactions");
        } finally {
            setLoading(false);
        }
    }, [categoryFilter, startDate, endDate, minAmount, maxAmount, selectedMonth, selectedYear]);

    // Fetch accounts for dropdown selections
    const fetchAccounts = useCallback(async () => {
        try {
            // setAccountsLoading(true);

            // Try to fetch from backend, fallback to mock data if connection fails
            try {
                const data = await accountApi.getAll();
                setAccounts(data);
            } catch (apiError) {
                console.warn(
                    "Backend not available, using mock accounts:",
                    apiError.message
                );

                // Mock account data for development
                const mockAccounts = [
                    {
                        id: 1,
                        name: "Checking Account",
                        type: "checking",
                        balance: 2500.0,
                        currency: "USD",
                    },
                    {
                        id: 2,
                        name: "Credit Card",
                        type: "credit",
                        balance: -500.0,
                        currency: "USD",
                    },
                    {
                        id: 3,
                        name: "Savings Account",
                        type: "savings",
                        balance: 10000.0,
                        currency: "USD",
                    },
                ];

                setAccounts(mockAccounts);
            }
        } catch (err) {
            console.error("Failed to fetch accounts:", err);
        } finally {
            // setAccountsLoading(false);
        }
    }, []);

    // Fetch transactions on component mount
    useEffect(() => {
        fetchTransactions();
        fetchAccounts();
    }, [fetchTransactions, fetchAccounts]);

    // Load preferences from localStorage on mount (in case component remounts)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('transactionItemsPerPage');
            if (saved) {
                const parsed = parseInt(saved, 10);
                if ([10, 20, 50, 100].includes(parsed)) {
                    // Only update if different to avoid unnecessary re-renders
                    setItemsPerPage(prev => prev !== parsed ? parsed : prev);
                }
            }

            // Load suspicious transaction IDs from localStorage
            const suspiciousData = localStorage.getItem('suspiciousTransactionIds');
            if (suspiciousData) {
                try {
                    const parsed = JSON.parse(suspiciousData);
                    // Only use if data is less than 1 hour old
                    if (parsed.timestamp && Date.now() - parsed.timestamp < 3600000) {
                        setSuspiciousTransactionIds(new Set(parsed.ids || []));
                        // Clear after loading to avoid stale data
                        setTimeout(() => {
                            localStorage.removeItem('suspiciousTransactionIds');
                        }, 100);
                    } else {
                        localStorage.removeItem('suspiciousTransactionIds');
                    }
                } catch (err) {
                    console.warn('Failed to parse suspicious transaction IDs:', err);
                    localStorage.removeItem('suspiciousTransactionIds');
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount

    // Save preferences to localStorage when they change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('transactionItemsPerPage', itemsPerPage.toString());
        }
    }, [itemsPerPage]);

    useEffect(() => {
        if (categoryFilter) {
            localStorage.setItem('transactionCategoryFilter', categoryFilter);
        } else {
            localStorage.removeItem('transactionCategoryFilter');
        }
    }, [categoryFilter]);

    useEffect(() => {
        if (typeFilter) {
            localStorage.setItem('transactionTypeFilter', typeFilter);
        } else {
            localStorage.removeItem('transactionTypeFilter');
        }
    }, [typeFilter]);

    useEffect(() => {
        if (selectedMonth) {
            localStorage.setItem('transactionSelectedMonth', selectedMonth);
        } else {
            localStorage.removeItem('transactionSelectedMonth');
        }
    }, [selectedMonth]);

    useEffect(() => {
        if (selectedYear) {
            localStorage.setItem('transactionSelectedYear', selectedYear);
        } else {
            localStorage.removeItem('transactionSelectedYear');
        }
    }, [selectedYear]);

    // Note: fetchTransactions automatically re-runs when filters change
    // because it's memoized with those dependencies

    //filtering logic - this happens everytime the component renders
    //filter() => creates new array that fulfill the condition. (TRUE)
    const filteredTransactions = transactions
        .filter((transaction) => {
            //search input value will be checked to be matched with description and categories
            // .toLowerCase() converts to lowercase for case-insensitive comparison
            // .includes() checks if one string contains another
            const matchesSearch =
                transaction.description
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                transaction.category
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

            // Check if category filter matches (empty string means no filter)
            // !categoryFilter means "if categoryFilter is empty/falsy"
            const matchesCategory =
                !categoryFilter || transaction.category === categoryFilter;

            const matchesType = !typeFilter || transaction.type === typeFilter;

            const matchesAccount =
                !accountFilter || transaction.account?.name === accountFilter;

            //check date range filter
            // new Date() converts string to Date object for comparison
            const transactionDate = new Date(transaction.date);
            const matchesStartDate =
                !startDate || transactionDate >= new Date(startDate);
            const matchesEndDate =
                !endDate || transactionDate <= new Date(endDate);

            // Check amount range filter
            // Math.abs() gets absolute value (converts negative expenses to positive for comparison)
            const absoluteAmount = Math.abs(transaction.amount);
            const matchesMinAmount =
                !minAmount || absoluteAmount >= parseFloat(minAmount);
            const matchesMaxAmount =
                !maxAmount || absoluteAmount <= parseFloat(maxAmount);

            // Check suspicious filter
            const txId = transaction.id || transaction.transfer_id || transaction.income_id || transaction.expense_id;
            const isSuspicious = suspiciousTransactionIds.has(txId) || 
                                 suspiciousTransactionIds.has(String(txId)) ||
                                 suspiciousTransactionIds.has(`transfer-${txId}`) ||
                                 suspiciousTransactionIds.has(`income-${txId}`) ||
                                 suspiciousTransactionIds.has(`expense-${txId}`);
            const matchesSuspicious = !showSuspiciousOnly || isSuspicious;

            // Return true only if ALL conditions are met (AND logic)
            // This transaction will be included in filtered results
            return (
                matchesSearch &&
                matchesCategory &&
                matchesType &&
                matchesAccount &&
                matchesStartDate &&
                matchesEndDate &&
                matchesMinAmount &&
                matchesMaxAmount &&
                matchesSuspicious
            );
        })
        //sorting logic
        //sort() takes comparator function that compares two items(a and b)
        .sort((a, b) => {
            //get the  values to compare
            const aValue = a[sortField];
            const bValue = b[sortField];

            // Direction multiplier: 1 for ascending, -1 for descending
            // This flips the comparison result for descending order
            const direction = sortDirection === "asc" ? 1 : -1;

            // Special handling for date sorting
            if (sortField === "date") {
                const dateA = new Date(aValue);
                const dateB = new Date(bValue);
                return (dateA - dateB) * direction;
            }

            // Compare strings using localeCompare (handles special characters, accents, etc.)
            if (typeof aValue === "string" && typeof bValue === "string") {
                // localeCompare returns: -1 if a < b, 0 if equal, 1 if a > b
                // Multiply by direction to flip for descending order
                return aValue.localeCompare(bValue) * direction;
            }

            // Compare numbers: return -1 if a < b, 1 if a > b
            // The ternary operator chooses -1 or 1 based on comparison
            return (aValue < bValue ? -1 : 1) * direction;
        });

    // Calculate count of flagged transactions that are not deleted (exist in current transactions)
    const flaggedTransactionCount = useMemo(() => {
        if (suspiciousTransactionIds.size === 0) return 0;
        
        return transactions.filter(transaction => {
            const txId = transaction.id || transaction.transfer_id || transaction.income_id || transaction.expense_id;
            if (!txId) return false;
            
            const isSuspicious = suspiciousTransactionIds.has(txId) || 
                                 suspiciousTransactionIds.has(String(txId)) ||
                                 suspiciousTransactionIds.has(`transfer-${txId}`) ||
                                 suspiciousTransactionIds.has(`income-${txId}`) ||
                                 suspiciousTransactionIds.has(`expense-${txId}`);
            
            return isSuspicious;
        }).length;
    }, [transactions, suspiciousTransactionIds]);

    // Pagination logic
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(
        startIndex,
        endIndex
    );

    //function to handle column sorting
    const handleSort = (field) => {
        //check if clicking the same column that's already sorted
        if (sortField === field) {
            //if same column, toggle the direction (asc <=> desc)
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            //if clicking a new column, set that field and default to descending
            setSortField(field);
            setSortDirection("desc");
        }
    };

    //function to add new transaction
    const handleAddTransaction = async (newTransaction) => {
        try {
            // Get account ID - use the first account if not specified
            const accountId =
                newTransaction.accountId ||
                (accounts.length > 0 ? accounts[0].account_id : null);

            if (!accountId) {
                alert("Please select an account or create an account first.");
                return;
            }

            // Create transaction via API
            await transactionApi.create(newTransaction, accountId);

            // Close dialog
            setIsAddDialogOpen(false);
            setEntryMethod("selection");

            // Refresh transactions to show the new one
            setSelectedTransactions(new Set());
            await fetchTransactions();
        } catch (err) {
            console.error("Failed to add transaction:", err);

            // Better error message
            let errorMsg = "Unknown error";
            if (err.data && err.data.detail) {
                // Handle FastAPI validation errors (array of errors)
                if (Array.isArray(err.data.detail)) {
                    errorMsg = err.data.detail
                        .map((e) => `${e.loc?.join(".")}: ${e.msg}`)
                        .join("\n");
                } else if (typeof err.data.detail === "string") {
                    errorMsg = err.data.detail;
                } else {
                    errorMsg = JSON.stringify(err.data.detail);
                }
            } else if (err.message) {
                errorMsg = err.message;
            } else if (typeof err === "string") {
                errorMsg = err;
            }

            alert("Failed to add transaction: " + errorMsg);
        }
    };

    //function to delete transaction
    const handleDeleteTransaction = async () => {
        if (transactionToDelete) {
            try {
                // Delete transaction via API
                await transactionApi.delete(transactionToDelete);

                // Close dialog
                setDeleteDialogOpen(false);
                setTransactionToDelete(null);
                setExpandedRow(null); // Close expanded row if it was open

                // Refresh transactions to remove the deleted one
                setSelectedTransactions(new Set());
                await fetchTransactions();
            } catch (err) {
                console.error("Failed to delete transaction:", err);
                alert(
                    "Failed to delete transaction: " +
                        (err.message || "Unknown error")
                );
            }
        }
    };

    // Selection handlers
    const toggleTransactionSelection = (transactionId) => {
        setSelectedTransactions((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(transactionId)) {
                newSet.delete(transactionId);
            } else {
                newSet.add(transactionId);
            }
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        if (selectedTransactions.size === paginatedTransactions.length) {
            setSelectedTransactions(new Set());
        } else {
            setSelectedTransactions(new Set(paginatedTransactions.map(t => t.id)));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedTransactions.size === 0) return;
        
        try {
            setIsDeleting(true);
            const transactionIds = Array.from(selectedTransactions);
            await transactionApi.bulkDelete(transactionIds);
            
            setBulkDeleteDialogOpen(false);
            setSelectedTransactions(new Set());
            await fetchTransactions();
        } catch (err) {
            console.error("Failed to delete transactions:", err);
            alert("Failed to delete transactions: " + (err.message || "Unknown error"));
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteAll = async () => {
        try {
            setIsDeleting(true);
            await transactionApi.deleteAll();
            
            setDeleteAllDialogOpen(false);
            setSelectedTransactions(new Set());
            await fetchTransactions();
        } catch (err) {
            console.error("Failed to delete all transactions:", err);
            alert("Failed to delete all transactions: " + (err.message || "Unknown error"));
        } finally {
            setIsDeleting(false);
        }
    };

    //function to update/save transaction changes
    const handleUpdateTransaction = async (transaction) => {
        try {
            setIsSaving(true);

            // Find the account ID from the account name
            const selectedAccount = accounts.find(
                (acc) => acc.account_name === transaction.account?.name || acc.account_name === transaction.account
            );
            const accountId =
                selectedAccount?.account_id || transaction.accountId || transaction.account?.id;

            if (!accountId) {
                alert("Please select a valid account.");
                setIsSaving(false);
                return;
            }

            // Check if transaction type has changed
            const originalTransaction = editedTransaction;
            const typeChanged = originalTransaction && originalTransaction.type !== transaction.type;

            if (typeChanged) {
                // If type changed, delete old transaction and create new one
                // First delete the old transaction
                await transactionApi.delete(originalTransaction.id);
                
                // Then create new transaction with new type
                await transactionApi.create(transaction, accountId);
            } else {
                // Update transaction via API (same type)
            await transactionApi.update(transaction.id, transaction, accountId);
            }

            // Close expanded row and clear edit state
            setExpandedRow(null);
            setEditedTransaction(null);

            // Refresh transactions to show the updated data
            await fetchTransactions();
        } catch (err) {
            console.error("Failed to update transaction:", err);

            // Better error message
            let errorMsg = "Unknown error";
            if (err.data && err.data.detail) {
                if (Array.isArray(err.data.detail)) {
                    errorMsg = err.data.detail
                        .map((e) => `${e.loc?.join(".")}: ${e.msg}`)
                        .join("\n");
                } else if (typeof err.data.detail === "string") {
                    errorMsg = err.data.detail;
                }
            } else if (err.message) {
                errorMsg = err.message;
            }

            alert("Failed to update transaction: " + errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    //function to cancel editing and revert changes
    const handleCancelEdit = () => {
        if (editedTransaction) {
            // Revert to original transaction data
            setTransactions((prevTransactions) =>
                prevTransactions.map((t) =>
                    t.id === editedTransaction.id ? editedTransaction : t
                )
            );
            setEditedTransaction(null);
        }
        setExpandedRow(null);
    };

    // Effect to update startDate and endDate when month/year filter changes
    useEffect(() => {
        if (selectedMonth) {
            // Set startDate to first day of selected month
            const [year, month] = selectedMonth.split('-');
            const firstDay = `${year}-${month}-01`;
            setStartDate(firstDay);
            
            // Set endDate to last day of selected month
            const lastDay = new Date(parseInt(year), parseInt(month), 0);
            const lastDayStr = `${year}-${month}-${String(lastDay.getDate()).padStart(2, '0')}`;
            setEndDate(lastDayStr);
        } else if (selectedYear) {
            // Set startDate to first day of selected year
            setStartDate(`${selectedYear}-01-01`);
            // Set endDate to last day of selected year
            setEndDate(`${selectedYear}-12-31`);
        }
        // Note: We don't auto-clear dates when month/year are cleared
        // to preserve manually set date ranges in advanced filters
    }, [selectedMonth, selectedYear]);

    //function to clear all filters
    // Function to clear suspicious flag for a transaction
    const clearSuspiciousFlag = (transaction) => {
        const txId = transaction.id || transaction.transfer_id || transaction.income_id || transaction.expense_id;
        if (!txId) return;
        
        // Remove all possible ID formats from the set
        const newSuspiciousIds = new Set(suspiciousTransactionIds);
        newSuspiciousIds.delete(txId);
        newSuspiciousIds.delete(String(txId));
        newSuspiciousIds.delete(`transfer-${txId}`);
        newSuspiciousIds.delete(`income-${txId}`);
        newSuspiciousIds.delete(`expense-${txId}`);
        
        setSuspiciousTransactionIds(newSuspiciousIds);
        
        // Also update localStorage if it exists
        const suspiciousData = localStorage.getItem('suspiciousTransactionIds');
        if (suspiciousData) {
            try {
                const parsed = JSON.parse(suspiciousData);
                const updatedIds = (parsed.ids || []).filter(id => {
                    const normalized = String(id).replace(/^(transfer-|income-|expense-)/, '');
                    return normalized !== String(txId) && 
                           id !== txId && 
                           id !== String(txId) &&
                           id !== `transfer-${txId}` &&
                           id !== `income-${txId}` &&
                           id !== `expense-${txId}`;
                });
                localStorage.setItem('suspiciousTransactionIds', JSON.stringify({
                    ids: updatedIds,
                    timestamp: parsed.timestamp || Date.now()
                }));
            } catch (err) {
                console.warn('Failed to update suspicious transaction IDs in localStorage:', err);
            }
        }
    };

    const clearFilter = () => {
        setSearchTerm("");
        setCategoryFilter("");
        setTypeFilter("");
        setSelectedMonth("");
        setSelectedYear("");
        setStartDate("");
        setEndDate("");
        setAccountFilter("");
        setMinAmount("");
        setMaxAmount("");
        setShowMoreFilters(false);
        setShowSuspiciousOnly(false);
    };

    const activeFilterCount =
        (searchTerm ? 1 : 0) +
        (categoryFilter ? 1 : 0) +
        (typeFilter ? 1 : 0) +
        (selectedMonth ? 1 : 0) +
        (selectedYear ? 1 : 0) +
        (accountFilter ? 1 : 0) +
        ((startDate && !selectedMonth && !selectedYear) ? 1 : 0) +
        ((endDate && !selectedMonth && !selectedYear) ? 1 : 0) +
        (minAmount ? 1 : 0) +
        (maxAmount ? 1 : 0) +
        (showSuspiciousOnly ? 1 : 0);

    const hasActiveFilter = activeFilterCount > 0;

    // ===========================
    // Loading & Error States
    // ===========================

    // Brand token cache for consistent styling (matching Intelligence Dashboard)
    const brand = {
        ink: "#04362c",
        mint: "#0DAD8D",
        surface: "#eef2f0",
        ring: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0DAD8D]",
    };

    if (loading && transactions.length === 0) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ background: brand.surface }}
            >
                <div className="text-center">
                    <GlobalLoader size="medium" className="mx-auto mb-4" />
                    <p className="text-black/70 text-lg">
                        Loading transactions...
                    </p>
                </div>
            </div>
        );
    }

    if (error && transactions.length === 0) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ background: brand.surface }}
            >
                <div className="text-center max-w-md">
                    <div className="text-red-600 mb-4">
                        <X className="h-16 w-16 mx-auto" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#04362c] mb-2">
                        Error Loading Transactions
                    </h2>
                    <p className="text-[#04362c]/80 mb-6">{error}</p>
                    <button
                        onClick={fetchTransactions}
                        className="px-6 py-3 bg-[#04362c] text-white rounded-lg hover:bg-[#04362c]/90 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            id="transaction-history-page"
            className="min-h-screen text-lg md:text-xl lg:text-2xl flex flex-col text-black"
            style={{
                background: brand.surface,
                margin: "0",
                border: "0",
                padding: "80px",
            }}
        >
            <style>{`
              #transaction-history-page button.add-transaction-btn,
              #transaction-history-page button.add-transaction-btn * { color: white !important; }
            `}</style>
            <div className="w-full">
                {/* Error banner for errors after initial load */}
                {error && transactions.length > 0 && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <X className="h-5 w-5" />
                            <span>{error}</span>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            className="text-red-600 hover:text-red-800"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* header section */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-4">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-left" style={{ color: '#04362c' }}>
                            Transaction History
                        </h1>
                    </div>
                    <p className="font-medium text-3xl leading-relaxed mb-8 text-left" style={{ color: 'rgba(4, 54, 44, 0.9)' }}>
                        View and manage all your financial transactions
                    </p>
                </div>

                {/* filter and search section */}
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-[#04362c]/20 shadow-xl mb-8">
                    <div className="px-4">
                        <div className="flex gap-4 flex-wrap items-center">
                            {/* search input */}
                            <div className="flex-1 min-w-[200px]">
                                <div className="relative">
                                    {/* Absolutely positioned search icon inside the input */}
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#04362c] h-4 w-4"></Search>
                                    <Input
                                        type="text"
                                        placeholder="Search Transactions..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="pl-10 py-2 text-lg text-[#04362c] placeholder:text-[#04362c]/60"
                                    />
                                </div>
                            </div>

                            {/* category filter dropdown */}
                            <div>
                                <Select
                                    value={categoryFilter || "all"}
                                    // Radix uses onValueChange instead of onChange
                                    onValueChange={(value) =>
                                        setCategoryFilter(
                                            value === "all" ? "" : value
                                        )
                                    }
                                >
                                    <SelectTrigger className="w-[180px] text-[#04362c] hover:bg-transparent focus:bg-transparent focus:text-[#04362c]">
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem
                                            value="all"
                                            className="text-[#04362c] focus:bg-accent/30 focus:text-[#04362c] hover:bg-accent/30"
                                        >
                                            All Categories
                                        </SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem
                                                key={category}
                                                value={category}
                                                className="text-[#04362c] focus:bg-accent/30 focus:text-[#04362c] hover:bg-accent/30"
                                            >
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* type filter dropdown */}
                            <div>
                                <Select
                                    value={typeFilter || "all"}
                                    onValueChange={(value) =>
                                        setTypeFilter(
                                            value === "all" ? "" : value
                                        )
                                    }
                                >
                                    <SelectTrigger className="w-[120px] text-[#04362c] hover:bg-transparent focus:bg-transparent focus:text-[#04362c]">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem
                                            value="all"
                                            className="text-[#04362c] focus:bg-accent/30 focus:text-[#04362c] hover:bg-accent/30"
                                        >
                                            All Types
                                        </SelectItem>
                                        <SelectItem
                                            value="income"
                                            className="text-[#04362c] focus:bg-accent/30 focus:text-[#04362c] hover:bg-accent/30"
                                        >
                                            Income
                                        </SelectItem>
                                        <SelectItem
                                            value="expense"
                                            className="text-[#04362c] focus:bg-accent/30 focus:text-[#04362c] hover:bg-accent/30"
                                        >
                                            Expense
                                        </SelectItem>
                                        <SelectItem
                                            value="transfer"
                                            className="text-[#04362c] focus:bg-accent/30 focus:text-[#04362c] hover:bg-accent/30"
                                        >
                                            Transfer
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Month filter dropdown */}
                            <div>
                                <Select
                                    value={selectedMonth || "all"}
                                    onValueChange={(value) => {
                                        if (value === "all") {
                                            setSelectedMonth("");
                                            setSelectedYear(""); // Clear year when clearing month
                                        } else {
                                            setSelectedMonth(value);
                                            setSelectedYear(""); // Clear year when selecting month
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-[150px] text-[#04362c] hover:bg-transparent focus:bg-transparent focus:text-[#04362c]">
                                        <SelectValue placeholder="All Months" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem
                                            value="all"
                                            className="text-[#04362c] focus:bg-accent/30 focus:text-[#04362c] hover:bg-accent/30"
                                        >
                                            All Months
                                        </SelectItem>
                                        {(() => {
                                            const months = [];
                                            const now = new Date();
                                            // Generate last 12 months
                                            for (let i = 0; i < 12; i++) {
                                                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                                                const year = date.getFullYear();
                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                const monthName = date.toLocaleString('default', { month: 'long' });
                                                const value = `${year}-${month}`;
                                                months.push(
                                                    <SelectItem
                                                        key={value}
                                                        value={value}
                                                        className="text-[#04362c] focus:bg-accent/30 focus:text-[#04362c] hover:bg-accent/30"
                                                    >
                                                        {monthName} {year}
                                                    </SelectItem>
                                                );
                                            }
                                            return months;
                                        })()}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Year filter dropdown */}
                            <div>
                                <Select
                                    value={selectedYear || "all"}
                                    onValueChange={(value) => {
                                        if (value === "all") {
                                            setSelectedYear("");
                                            setSelectedMonth(""); // Clear month when clearing year
                                        } else {
                                            setSelectedYear(value);
                                            setSelectedMonth(""); // Clear month when selecting year
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-[120px] text-[#04362c] hover:bg-transparent focus:bg-transparent focus:text-[#04362c]">
                                        <SelectValue placeholder="All Years" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem
                                            value="all"
                                            className="text-[#04362c] focus:bg-accent/30 focus:text-[#04362c] hover:bg-accent/30"
                                        >
                                            All Years
                                        </SelectItem>
                                        {(() => {
                                            const years = [];
                                            const currentYear = new Date().getFullYear();
                                            // Generate last 10 years
                                            for (let i = 0; i < 10; i++) {
                                                const year = currentYear - i;
                                                years.push(
                                                    <SelectItem
                                                        key={year}
                                                        value={String(year)}
                                                        className="text-[#04362c] focus:bg-accent/30 focus:text-[#04362c] hover:bg-accent/30"
                                                    >
                                                        {year}
                                                    </SelectItem>
                                                );
                                            }
                                            return years;
                                        })()}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Suspicious transactions filter toggle */}
                            {flaggedTransactionCount > 0 && (
                                <Button
                                    onClick={() => setShowSuspiciousOnly(!showSuspiciousOnly)}
                                    variant={showSuspiciousOnly ? "default" : "outline"}
                                    className={`flex items-center gap-2 ${
                                        showSuspiciousOnly 
                                            ? "bg-amber-500 text-white hover:bg-amber-600" 
                                            : "border-amber-300 text-amber-700 hover:bg-amber-50"
                                    }`}
                                >
                                    <AlertTriangle className={`h-4 w-4 ${showSuspiciousOnly ? "text-white" : "text-amber-700"}`} />
                                    <span className={showSuspiciousOnly ? "text-white" : "text-amber-700"}>
                                        {showSuspiciousOnly ? "Show All" : "Show Flagged"}
                                    </span>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ml-1 ${
                                        showSuspiciousOnly 
                                            ? "bg-white/20 text-white" 
                                            : "bg-amber-100 text-amber-700"
                                    }`}>
                                        {flaggedTransactionCount}
                                    </span>
                                </Button>
                            )}

                            {/* more filter dropdown */}
                            <div className="relative">
                                <Select
                                    onOpenChange={(open) =>
                                        setShowMoreFilters(open)
                                    }
                                    open={showMoreFilters}
                                >
                                    <SelectTrigger className="w-[180px] text-[#04362c]">
                                        <div className="flex items-center gap-2">
                                            <Filter className="h-5 w-5 text-[#04362c]" />
                                            <SelectValue
                                                placeholder="More Filters"
                                                className="text-[#04362c]"
                                            />
                                            {/* Show count of advanced filters if any are active */}
                                            {(accountFilter ||
                                                (startDate && !selectedMonth && !selectedYear) ||
                                                (endDate && !selectedMonth && !selectedYear) ||
                                                minAmount ||
                                                maxAmount) && (
                                                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                                                    {(accountFilter ? 1 : 0) +
                                                        ((startDate && !selectedMonth && !selectedYear) ? 1 : 0) +
                                                        ((endDate && !selectedMonth && !selectedYear) ? 1 : 0) +
                                                        (minAmount ? 1 : 0) +
                                                        (maxAmount ? 1 : 0)}
                                                </span>
                                            )}
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="w-80 p-0View and ">
                                        {/* More Filters Dropdown Panel */}
                                        <div className="p-4 space-y-4">
                                            <div className="flex items-center justify-between border-b pb-2">
                                                <h3 className="font-semibold text-[#04362c]">
                                                    Advance Filters
                                                </h3>
                                                <button
                                                    className="text-[#04362c]/60 hover:text-[#04362c]/80"
                                                    onClick={() =>
                                                        setShowMoreFilters(
                                                            false
                                                        )
                                                    }
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>

                                            {/* Account Filter */}
                                            <div>
                                                <label className="block text-sm font-medium text-[#04362c]/90 mb-1">
                                                    Account
                                                </label>
                                                <Select
                                                    value={
                                                        accountFilter || "all"
                                                    }
                                                    onValueChange={(value) =>
                                                        setAccountFilter(
                                                            value === "all"
                                                                ? ""
                                                                : value
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="text-[#04362c] hover:bg-transparent focus:bg-transparent focus:text-[#04362c]">
                                                        <SelectValue placeholder="All Accounts"></SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem
                                                            value="all"
                                                            className="text-[#04362c] focus:bg-accent/30 focus:text-[#04362c] hover:bg-accent/30"
                                                        >
                                                            All Accounts
                                                        </SelectItem>
                                                        {accounts.map(
                                                            (account) => (
                                                                <SelectItem
                                                                    key={
                                                                        account.account_id ||
                                                                        account.id
                                                                    }
                                                                    value={
                                                                        account.account_name ||
                                                                        account.name
                                                                    }
                                                                    className="text-[#04362c] focus:bg-accent/30 focus:text-[#04362c] hover:bg-accent/30"
                                                                >
                                                                    {account.account_name ||
                                                                        account.name}
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* date range filter */}
                                            <div>
                                                <label className="block text-sm font-medium text-[#04362c]/90 mb-1">
                                                    Date Range
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-xs text-[#04362c]/70 mb-1">
                                                            From
                                                        </label>
                                                        <Input
                                                            type="date"
                                                            value={startDate}
                                                            onChange={(e) =>
                                                                setStartDate(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-full px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-[#04362c]/70 mb-1">
                                                            To
                                                        </label>
                                                        <Input
                                                            type="date"
                                                            value={endDate}
                                                            onChange={(e) =>
                                                                setEndDate(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-full px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* amount range filter */}
                                            <div>
                                                <label className="block text-sm font-medium text-[#04362c]/90 mb-1">
                                                    Amount Range
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-xs text-[#04362c]/70">
                                                            Min (RM)
                                                        </label>
                                                        <Input
                                                            type="number"
                                                            placeholder="0.00"
                                                            step="0.01"
                                                            min="0"
                                                            value={minAmount}
                                                            onChange={(e) =>
                                                                setMinAmount(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-[#04362c]/70">
                                                            Max (RM)
                                                        </label>
                                                        <Input
                                                            type="number"
                                                            placeholder="0.00"
                                                            step="0.01"
                                                            min="0"
                                                            value={maxAmount}
                                                            onChange={(e) =>
                                                                setMaxAmount(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* clear button in dropdown */}
                                            <div className="flex gap-2 pt-2 border-t">
                                                <button
                                                    onClick={() => {
                                                        setAccountFilter("");
                                                        setStartDate("");
                                                        setEndDate("");
                                                        setMinAmount("");
                                                        setMaxAmount("");
                                                    }}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                >
                                                    Clear Advanced
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setShowMoreFilters(
                                                            false
                                                        )
                                                    }
                                                    className="flex-1 px-3 py-2 bg-[#04362c] text-white rounded-lg text-sm"
                                                >
                                                    Apply Filters
                                                </button>
                                            </div>
                                        </div>
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* clear all filters button */}
                            {hasActiveFilter && (
                                <Button
                                    onClick={clearFilter}
                                    className="flex items-center gap-2 bg-primary text-[#04362c] transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                    Clear All
                                    {activeFilterCount > 1 && (
                                        <span className="bg-secondary/20 text-[#04362c] text-xs font-medium rounded-full">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </Button>
                            )}

                            {/* add transaction button */}
                            <Button
                                onClick={() => setIsAddDialogOpen(true)}
                                className="add-transaction-btn flex items-center gap-2 px-6 py-3 bg-[#04362c] text-white text-lg rounded-lg transition-colors shadow-lg hover:shadow-xl hover:bg-[#04362c]/90 ml-auto"
                            >
                                <Plus className="h-5 w-5" />
                                Add Transaction
                            </Button>
                        </div>

                        {/* active filters badges - show what filters currently applied */}
                        {hasActiveFilter && (
                            <div className="flex gap-2 mt-4 flex-wrap">
                                <span className="text-sm text-[#04362c]/80 font-medium py-1">
                                    Active filters:
                                </span>
                                {/* Search Term badge */}
                                {searchTerm && (
                                    <Badge className="gap-1 bg-[#04362c]/10 text-[#04362c] px-3 py-1 rounded-full text-sm border border-[#04362c]/20">
                                        <Search className="h-3 w-3" />
                                        <span>Search: "{searchTerm}"</span>
                                        <button
                                            onClick={() => setSearchTerm("")}
                                            className="ml-1 rounded-full p-0.5"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )}
                                {/* Category badge */}
                                {categoryFilter && (
                                    <Badge className="gap-1 bg-[#04362c]/10 text-[#04362c] px-3 py-1 rounded-full text-sm border border-[#04362c]/20">
                                        <Filter className="h-3 w-3" />
                                        <span>
                                            Category: "{categoryFilter}"
                                        </span>
                                        <button
                                            onClick={() =>
                                                setCategoryFilter("")
                                            }
                                            className="ml-1 rounded-full p-0.5"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )}
                                {/* Type badge */}
                                {typeFilter && (
                                    <Badge className="gap-1 bg-[#04362c]/10 text-[#04362c] px-3 py-1 rounded-full text-sm border border-[#04362c]/20">
                                        <Filter className="h-3 w-3" />
                                        <span>Type: "{typeFilter}"</span>
                                        <button
                                            onClick={() => setTypeFilter("")}
                                            className="ml-1 rounded-full p-0.5"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )}
                                {/* Account filter badge */}
                                {accountFilter && (
                                    <Badge className="gap-1 bg-[#04362c]/10 text-[#04362c] px-3 py-1 rounded-full text-sm border border-[#04362c]/20">
                                        <Filter className="h-3 w-3" />
                                        <span>Account: {accountFilter}</span>
                                        <button
                                            onClick={() => setAccountFilter("")}
                                            className="ml-1 rounded-full p-0.5"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )}
                                {/* Date range badge */}
                                {(startDate || endDate) && (
                                    <Badge className="gap-1 bg-[#04362c]/10 text-[#04362c] px-3 py-1 rounded-full text-sm border border-[#04362c]/20">
                                        <Filter className="h-3 w-3" />
                                        <span>
                                            Date: {startDate || "..."} to{" "}
                                            {endDate || "..."}
                                        </span>
                                        <button
                                            onClick={() => {
                                                setStartDate("");
                                                setEndDate("");
                                            }}
                                            className="ml-1 rounded-full p-0.5"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )}
                                {/* Amount range badge */}
                                {(minAmount || maxAmount) && (
                                    <Badge className="gap-1 bg-[#04362c]/10 text-[#04362c] px-3 py-1 rounded-full text-sm border border-[#04362c]/20">
                                        <Filter className="h-3 w-3" />
                                        <span>
                                            Amount: {formatCurrency(minAmount || 0)} -{" "}
                                            {maxAmount ? formatCurrency(maxAmount) : "RM ∞"}
                                        </span>
                                        <button
                                            onClick={() => {
                                                setMinAmount("");
                                                setMaxAmount("");
                                            }}
                                            className="ml-1 rounded-full p-0.5"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Transaction Table Card */}
                <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-[#04362c]/20 shadow-xl">
                    {/* Card Header */}
                    <div className="px-6 py-4 border-b border-[#04362c]/20 flex items-center justify-between">
                        <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-[#04362c]">
                            Recent Transactions
                        </h2>
                        <p className="text-base text-[#04362c]/80">
                            {transactions.length} transactions found
                            {suspiciousTransactionIds.size > 0 && (
                                <span className="ml-2 text-amber-600 font-semibold">
                                    • {suspiciousTransactionIds.size} flagged for review
                                </span>
                            )}
                        </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {selectedTransactions.size > 0 && (
                                <>
                                    <Button
                                        onClick={() => setBulkDeleteDialogOpen(true)}
                                        variant="destructive"
                                        className="flex items-center gap-2 px-4 py-2"
                                        disabled={isDeleting}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete Selected ({selectedTransactions.size})
                                    </Button>
                                    <Button
                                        onClick={() => setDeleteAllDialogOpen(true)}
                                        variant="destructive"
                                        className="flex items-center gap-2 px-4 py-2"
                                        disabled={isDeleting || transactions.length === 0}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete All
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Card Content - Table */}
                    <div className="p-6 overflow-x-auto">
                        <Table>
                            {/* Table Header */}
                            <TableHeader>
                                <TableRow>
                                    {/* Checkbox Column Header */}
                                    <TableHead className="text-[#04362c] text-lg w-12 text-center">
                                        <div className="flex justify-center">
                                            <Checkbox
                                                checked={paginatedTransactions.length > 0 && selectedTransactions.size === paginatedTransactions.length}
                                                onCheckedChange={toggleSelectAll}
                                            />
                                        </div>
                                    </TableHead>
                                    {/* Date Column Header - Sortable */}
                                    <TableHead className="text-[#04362c] text-lg text-left">
                                        <div
                                            className="flex items-center gap-1 cursor-pointer"
                                            onClick={() => handleSort("date")}
                                        >
                                            Date
                                            {/* Show different icon based on sort state */}
                                            {sortField === "date" ? (
                                                // Show direction indicator if this column is currently sorted
                                                <span className="text-[#04362c]">
                                                    {sortDirection === "asc"
                                                        ? "↑"
                                                        : "↓"}
                                                </span>
                                            ) : (
                                                // Show generic sort icon if column is not currently sorted
                                                <ArrowUpDown className="h-4 w-4 text-[#04362c]" />
                                            )}
                                        </div>
                                    </TableHead>
                                    {/* Description Column Header - Sortable */}
                                    <TableHead className="text-[#04362c] text-lg text-left">
                                        <div
                                            className="flex items-center gap-1 cursor-pointer"
                                            onClick={() =>
                                                handleSort("description")
                                            }
                                        >
                                            Description
                                            {/* Show different icon based on sort state */}
                                            {sortField === "description" ? (
                                                // Show direction indicator if this column is currently sorted
                                                <span className="text-[#04362c]">
                                                    {sortDirection === "asc"
                                                        ? "↑"
                                                        : "↓"}
                                                </span>
                                            ) : (
                                                // Show generic sort icon if column is not currently sorted
                                                <ArrowUpDown className="h-4 w-4 text-[#04362c]" />
                                            )}
                                        </div>
                                    </TableHead>
                                    {/* Category Column Header */}
                                    <TableHead className="text-[#04362c] text-lg text-left">
                                        Category
                                    </TableHead>
                                    {/* Account Column Header */}
                                    <TableHead className="text-[#04362c] text-lg text-left">
                                        Account
                                    </TableHead>
                                    {/* Amount Column Header */}
                                    <TableHead className="text-[#04362c] text-lg text-left">
                                        <div
                                            className="flex items-center gap-1 cursor-pointer"
                                            onClick={() => handleSort("amount")}
                                        >
                                            Amount
                                            {sortField === "amount" ? (
                                                <span className="text-[#04362c]">
                                                    {sortDirection === "asc"
                                                        ? "↑"
                                                        : "↓"}
                                                </span>
                                            ) : (
                                                <ArrowUpDown className="h-4 w-4 text-[#04362c]" />
                                            )}
                                        </div>
                                    </TableHead>
                                    {/* Actions Column Header */}
                                    <TableHead className="text-[#04362c] text-lg text-center">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            {/* Table Body   */}
                            <TableBody>
                                {/* create table row for each paginated transaction */}
                                {paginatedTransactions.map((transaction) => {
                                    const isExpanded =
                                        expandedRow === transaction.id;
                                    // Check if this transaction is flagged as suspicious
                                    const txId = transaction.id || transaction.transfer_id || transaction.income_id || transaction.expense_id;
                                    const isSuspicious = suspiciousTransactionIds.has(txId) || 
                                                         suspiciousTransactionIds.has(String(txId)) ||
                                                         suspiciousTransactionIds.has(`transfer-${txId}`) ||
                                                         suspiciousTransactionIds.has(`income-${txId}`) ||
                                                         suspiciousTransactionIds.has(`expense-${txId}`);
                                    return (
                                        <React.Fragment key={transaction.id}>
                                            <TableRow className={isSuspicious ? "bg-amber-50/50 border-l-4 border-l-amber-400" : ""}>
                                                {/* Checkbox Column */}
                                                <TableCell className="text-[#04362c] text-lg text-center">
                                                    <div className="flex justify-center">
                                                        <Checkbox
                                                            checked={selectedTransactions.has(transaction.id)}
                                                            onCheckedChange={() => toggleTransactionSelection(transaction.id)}
                                                        />
                                                    </div>
                                                </TableCell>
                                                {/* Date Column */}
                                                <TableCell className="text-[#04362c] text-lg text-left">
                                                    {new Date(
                                                        transaction.date
                                                    ).toLocaleDateString(
                                                        "en-GB"
                                                    )}
                                                </TableCell>
                                                {/* Description Column - Clickable */}
                                                <TableCell className="text-[#04362c] text-lg">
                                                    <div
                                                        onClick={() => {
                                                            if (isExpanded) {
                                                                handleCancelEdit();
                                                            } else {
                                                                setExpandedRow(transaction.id);
                                                                setEditedTransaction({
                                                                        ...transaction,
                                                                    type: transaction.type || (transaction.id?.startsWith('transfer-') ? 'transfer' : transaction.id?.startsWith('income-') ? 'income' : 'expense'),
                                                                });
                                                            }
                                                        }}
                                                        className="cursor-pointer transition-colors hover:text-[#04362c]/80"
                                                    >
                                                        {transaction.description}
                                                    </div>
                                                </TableCell>
                                                {/* Category Column */}
                                                <TableCell className="text-[#04362c] text-lg">
                                                    <span>
                                                        {transaction.category}
                                                    </span>
                                                </TableCell>
                                                {/* Account Column */}
                                                <TableCell className="text-[#04362c] text-lg">
                                                    {transaction.account
                                                        ?.name ||
                                                        "Unknown Account"}
                                                </TableCell>
                                                {/* Amount Column */}
                                                <TableCell>
                                                    <span
                                                        className={`font-medium text-[#04362c] text-base sm:text-lg ${
                                                            transaction.type ===
                                                            "income"
                                                                ? "text-green-600"
                                                                : transaction.type === "transfer"
                                                                ? "text-blue-600"
                                                                : "text-red-600"
                                                        }`}
                                                    >
                                                        {formatCurrency(
                                                            Math.abs(transaction.amount)
                                                        )}
                                                    </span>
                                                </TableCell>
                                                {/* Actions Column */}
                                                <TableCell className="text-[#04362c] text-lg text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {/* Clear Flag button for suspicious transactions */}
                                                        {isSuspicious && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    clearSuspiciousFlag(transaction);
                                                                }}
                                                                className="p-2 text-amber-600 rounded-lg transition-colors hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                                                title="Clear suspicious flag"
                                                            >
                                                                <CheckCircle2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    <button
                                                        onClick={() => {
                                                                if (isExpanded) {
                                                                    handleCancelEdit();
                                                                } else {
                                                                    setExpandedRow(transaction.id);
                                                                    setEditedTransaction({
                                                                        ...transaction,
                                                                        type: transaction.type || (transaction.id?.startsWith('transfer-') ? 'transfer' : transaction.id?.startsWith('income-') ? 'income' : 'expense'),
                                                                    });
                                                                }
                                                            }}
                                                            className="p-2 text-[#04362c] rounded-lg transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#04362c]/20"
                                                            title={isExpanded ? "Close details" : "View details"}
                                                        >
                                                            {isExpanded ? (
                                                                <ChevronDown className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                // Ensure we have a valid transaction ID
                                                                const txId = transaction.id || 
                                                                    (transaction.type === 'transfer' ? `transfer-${transaction.transfer_id || transaction.rawId}` : 
                                                                     transaction.type === 'income' ? `income-${transaction.income_id || transaction.rawId}` :
                                                                     transaction.type === 'expense' ? `expense-${transaction.expense_id || transaction.rawId}` :
                                                                     null);
                                                                
                                                                if (!txId) {
                                                                    console.error('Cannot delete transaction: missing ID', transaction);
                                                                    alert('Cannot delete transaction: missing transaction ID');
                                                                    return;
                                                                }
                                                                
                                                                setTransactionToDelete(txId);
                                                                setDeleteDialogOpen(true);
                                                            }}
                                                            className="p-2 text-red-800 rounded-lg transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300"
                                                        title="Delete transaction"
                                                    >
                                                            <Trash2 className="h-4 w-4" />
                                                    </button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>

                                            {/* Expanded Row - Details */}
                                            {isExpanded && (
                                                <TableRow className="bg-gray-100">
                                                    <TableCell colSpan={7} className="p-6">
                                                        <div>
                                                            <h3 className="font-semibold text-[#04362c] mb-4 text-lg">
                                                                Transaction Details
                                                                {transaction.type && (
                                                                    <span className="ml-2 text-sm font-normal text-gray-500">
                                                                        (Type: {transaction.type})
                                                                    </span>
                                                                )}
                                                            </h3>
                                                            {/* Unified form with responsive grid */}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                {/* Transaction Type - Allow changing type */}
                                                                <div>
                                                                    <label className="block text-sm text-[#04362c]/80 mb-1">
                                                                        Transaction Type: *
                                                                    </label>
                                                                    <select
                                                                        value={transaction.type || "expense"}
                                                                        onChange={(e) => {
                                                                            const newType = e.target.value;
                                                                            const updatedTransactions = transactions.map((t) =>
                                                                                t.id === transaction.id
                                                                                    ? {
                                                                                          ...t,
                                                                                          type: newType,
                                                                                          // Reset type-specific fields when changing type
                                                                                          category: newType === "transfer" 
                                                                                              ? "Transfer" 
                                                                                              : newType === "income"
                                                                                              ? incomeCategories[0] || "Salary"
                                                                                              : expenseCategories[0] || "Other",
                                                                                          // Clear expense-specific fields when changing to non-expense
                                                                                          expenseType: newType === "expense" ? (t.expenseType || "needs") : null,
                                                                                          location: newType === "expense" ? (t.location || "") : "",
                                                                                          // Clear income-specific fields when changing to non-income
                                                                                          department: newType === "income" ? (t.department || "") : "",
                                                                                          project: newType === "income" ? (t.project || "") : "",
                                                                                          // Clear transfer-specific fields when changing to non-transfer
                                                                                          transferType: newType === "transfer" ? (t.transferType || "intra_person") : null,
                                                                                          recipientAccountName: newType === "transfer" ? (t.recipientAccountName || "") : "",
                                                                                          recipientAccountNo: newType === "transfer" ? (t.recipientAccountNo || "") : "",
                                                                                          // Adjust amount sign based on type
                                                                                          amount: newType === "expense" 
                                                                                              ? -Math.abs(t.amount)
                                                                                              : Math.abs(t.amount),
                                                                                      }
                                                                                    : t
                                                                            );
                                                                            setTransactions(updatedTransactions);
                                                                        }}
                                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white font-medium"
                                                                    >
                                                                        <option value="income">Income</option>
                                                                        <option value="expense">Expense</option>
                                                                        <option value="transfer">Transfer</option>
                                                                    </select>
                                                                </div>
                                                                {/* Description */}
                                                                <div>
                                                                    <label className="block text-sm text-[#04362c]/80 mb-1">
                                                                        Description:
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={
                                                                            transaction.description
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            const updatedTransactions =
                                                                                transactions.map(
                                                                                    (
                                                                                        t
                                                                                    ) =>
                                                                                        t.id ===
                                                                                        transaction.id
                                                                                            ? {
                                                                                                  ...t,
                                                                                                  description:
                                                                                                      e
                                                                                                          .target
                                                                                                          .value,
                                                                                              }
                                                                                            : t
                                                                                );
                                                                            setTransactions(
                                                                                updatedTransactions
                                                                            );
                                                                        }}
                                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm text-[#04362c]/80 mb-1">
                                                                        Amount:
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={Math.abs(
                                                                            transaction.amount
                                                                        )}
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            const updatedTransactions =
                                                                                transactions.map(
                                                                                    (
                                                                                        t
                                                                                    ) =>
                                                                                        t.id ===
                                                                                        transaction.id
                                                                                            ? {
                                                                                                  ...t,
                                                                                                  amount:
                                                                                                      t.type ===
                                                                                                      "expense"
                                                                                                          ? -Math.abs(
                                                                                                                parseFloat(
                                                                                                                    e
                                                                                                                        .target
                                                                                                                        .value
                                                                                                                )
                                                                                                            )
                                                                                                          : Math.abs(
                                                                                                                parseFloat(
                                                                                                                    e
                                                                                                                        .target
                                                                                                                        .value
                                                                                                                )
                                                                                                            ),
                                                                                              }
                                                                                            : t
                                                                                );
                                                                            setTransactions(
                                                                                updatedTransactions
                                                                            );
                                                                        }}
                                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm text-[#04362c]/80 mb-1">
                                                                        Category:
                                                                    </label>
                                                                    <select
                                                                        value={
                                                                            transaction.category || (transaction.type === "transfer" ? "Transfer" : transaction.type === "income" ? incomeCategories[0] : expenseCategories[0])
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            const newCategory =
                                                                                e
                                                                                    .target
                                                                                    .value;
                                                                            const updatedTransactions =
                                                                                transactions.map(
                                                                                    (
                                                                                        t
                                                                                    ) =>
                                                                                        t.id ===
                                                                                        transaction.id
                                                                                            ? {
                                                                                                  ...t,
                                                                                                  category:
                                                                                                      newCategory,
                                                                                              }
                                                                                            : t
                                                                                );
                                                                            setTransactions(
                                                                                updatedTransactions
                                                                            );
                                                                        }}
                                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                                                    >
                                                                        {transaction.type === "transfer" ? (
                                                                            <option value="Transfer">Transfer</option>
                                                                        ) : transaction.type === "income" ? (
                                                                            incomeCategories.map((category) => (
                                                                                <option key={category} value={category}>
                                                                                    {category}
                                                                                </option>
                                                                            ))
                                                                        ) : (
                                                                            expenseCategories.map((category) => (
                                                                                <option key={category} value={category}>
                                                                                    {category}
                                                                                </option>
                                                                            ))
                                                                        )}
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm text-[#04362c]/80 mb-1">
                                                                        Account:
                                                                    </label>
                                                                    <select
                                                                        value={
                                                                            transaction
                                                                                .account
                                                                                ?.id ||
                                                                            transaction.accountId ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            const selectedAccountId =
                                                                                parseInt(
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                );
                                                                            const selectedAccount =
                                                                                accounts.find(
                                                                                    (
                                                                                        acc
                                                                                    ) =>
                                                                                        (acc.account_id ||
                                                                                            acc.id) ===
                                                                                        selectedAccountId
                                                                                );

                                                                            const updatedTransactions =
                                                                                transactions.map(
                                                                                    (
                                                                                        t
                                                                                    ) =>
                                                                                        t.id ===
                                                                                        transaction.id
                                                                                            ? {
                                                                                                  ...t,
                                                                                                  account:
                                                                                                      {
                                                                                                          name:
                                                                                                              selectedAccount?.account_name ||
                                                                                                              selectedAccount?.name,
                                                                                                          type:
                                                                                                              selectedAccount?.account_type ||
                                                                                                              selectedAccount?.type,
                                                                                                          id: selectedAccountId,
                                                                                                      },
                                                                                                  accountId:
                                                                                                      selectedAccountId,
                                                                                              }
                                                                                            : t
                                                                                );
                                                                            setTransactions(
                                                                                updatedTransactions
                                                                            );
                                                                        }}
                                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                                                    >
                                                                        <option value="">
                                                                            Select
                                                                            Account
                                                                        </option>
                                                                        {accounts.map(
                                                                            (
                                                                                account
                                                                            ) => (
                                                                                <option
                                                                                    key={
                                                                                        account.account_id ||
                                                                                        account.id
                                                                                    }
                                                                                    value={
                                                                                        account.account_id ||
                                                                                        account.id
                                                                                    }
                                                                                >
                                                                                    {account.account_name ||
                                                                                        account.name}
                                                                                </option>
                                                                            )
                                                                        )}
                                                                    </select>
                                                                </div>
                                                                {/* Tax Amount - Only for Expenses */}
                                                                {transaction.type === "expense" && (
                                                                <div>
                                                                    <label className="block text-sm text-[#04362c]/80 mb-1">
                                                                        Tax
                                                                        Amount:
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        step="0.01"
                                                                        defaultValue="0.00"
                                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                                                    />
                                                                </div>
                                                                )}
                                                                <div>
                                                                    <label className="block text-sm text-[#04362c]/80 mb-1">
                                                                        Date:
                                                                    </label>
                                                                    <input
                                                                        type="date"
                                                                        value={
                                                                            transaction.date
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            const updatedTransactions =
                                                                                transactions.map(
                                                                                    (
                                                                                        t
                                                                                    ) =>
                                                                                        t.id ===
                                                                                        transaction.id
                                                                                            ? {
                                                                                                  ...t,
                                                                                                  date: e
                                                                                                      .target
                                                                                                      .value,
                                                                                              }
                                                                                            : t
                                                                                );
                                                                            setTransactions(
                                                                                updatedTransactions
                                                                            );
                                                                        }}
                                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                                                    />
                                                                </div>
                                                                {/* Need vs Want dropdown - only show for expenses */}
                                                                {transaction.type ===
                                                                    "expense" && (
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                                                            Need
                                                                            or
                                                                            Want
                                                                            *
                                                                        </label>
                                                                        <select
                                                                            value={
                                                                                (transaction.expenseType ||
                                                                                    "needs") ===
                                                                                "wants"
                                                                                    ? "want"
                                                                                    : "need"
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) => {
                                                                                const updatedTransactions =
                                                                                    transactions.map(
                                                                                        (
                                                                                            t
                                                                                        ) =>
                                                                                            t.id ===
                                                                                            transaction.id
                                                                                                ? {
                                                                                                      ...t,
                                                                                                      expenseType:
                                                                                                          e
                                                                                                              .target
                                                                                                              .value ===
                                                                                                          "want"
                                                                                                              ? "wants"
                                                                                                              : "needs",
                                                                                                  }
                                                                                                : t
                                                                                    );
                                                                                setTransactions(
                                                                                    updatedTransactions
                                                                                );
                                                                            }}
                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                                                        >
                                                                            <option value="need">
                                                                                Need
                                                                            </option>
                                                                            <option value="want">
                                                                                Want
                                                                            </option>
                                                                        </select>
                                                                    </div>
                                                                )}

                                                                {/* Payer/Merchant - Available for income and expense, not transfers */}
                                                                {transaction.type !== "transfer" && (
                                                                <div>
                                                                    <label className="block text-sm text-[#04362c]/80 mb-1">
                                                                        {transaction.type ===
                                                                        "income"
                                                                            ? "Payer:"
                                                                            : "Merchant:"}
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={
                                                                            transaction.supplier ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            const updatedTransactions =
                                                                                transactions.map(
                                                                                    (
                                                                                        t
                                                                                    ) =>
                                                                                        t.id ===
                                                                                        transaction.id
                                                                                            ? {
                                                                                                  ...t,
                                                                                                  supplier:
                                                                                                      e
                                                                                                          .target
                                                                                                          .value,
                                                                                              }
                                                                                            : t
                                                                                );
                                                                            setTransactions(
                                                                                updatedTransactions
                                                                            );
                                                                        }}
                                                                        placeholder={
                                                                            transaction.type ===
                                                                            "income"
                                                                                ? "Enter payer name"
                                                                                : "Enter merchant name"
                                                                        }
                                                                        className="bg-white w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                    />
                                                                </div>
                                                                )}

                                                                {/* Department - Only for Income */}
                                                                {transaction.type ===
                                                                    "income" && (
                                                                    <div>
                                                                        <label className="block text-sm text-[#04362c]/80 mb-1">
                                                                            Department:
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={
                                                                                transaction.department ||
                                                                                ""
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) => {
                                                                                const updatedTransactions =
                                                                                    transactions.map(
                                                                                        (
                                                                                            t
                                                                                        ) =>
                                                                                            t.id ===
                                                                                            transaction.id
                                                                                                ? {
                                                                                                      ...t,
                                                                                                      department:
                                                                                                          e
                                                                                                              .target
                                                                                                              .value,
                                                                                                  }
                                                                                                : t
                                                                                    );
                                                                                setTransactions(
                                                                                    updatedTransactions
                                                                                );
                                                                            }}
                                                                            placeholder="Enter department"
                                                                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                                                        />
                                                                    </div>
                                                                )}

                                                                {/* Project - Only for Income */}
                                                                {transaction.type ===
                                                                    "income" && (
                                                                    <div>
                                                                        <label className="block text-sm text-[#04362c]/80 mb-1">
                                                                            Project:
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={
                                                                                transaction.project ||
                                                                                ""
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) => {
                                                                                const updatedTransactions =
                                                                                    transactions.map(
                                                                                        (
                                                                                            t
                                                                                        ) =>
                                                                                            t.id ===
                                                                                            transaction.id
                                                                                                ? {
                                                                                                      ...t,
                                                                                                      project:
                                                                                                          e
                                                                                                              .target
                                                                                                              .value,
                                                                                                  }
                                                                                                : t
                                                                                    );
                                                                                setTransactions(
                                                                                    updatedTransactions
                                                                                );
                                                                            }}
                                                                            placeholder="Enter project name"
                                                                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                                                        />
                                                                    </div>
                                                                )}

                                                                {/* Location - Only for Expenses */}
                                                                {transaction.type ===
                                                                    "expense" && (
                                                                    <div>
                                                                        <label className="block text-sm text-[#04362c]/80 mb-1">
                                                                            Location:
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={
                                                                                transaction.location ||
                                                                                ""
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) => {
                                                                                const updatedTransactions =
                                                                                    transactions.map(
                                                                                        (
                                                                                            t
                                                                                        ) =>
                                                                                            t.id ===
                                                                                            transaction.id
                                                                                                ? {
                                                                                                      ...t,
                                                                                                      location:
                                                                                                          e
                                                                                                              .target
                                                                                                              .value,
                                                                                                  }
                                                                                                : t
                                                                                    );
                                                                                setTransactions(
                                                                                    updatedTransactions
                                                                                );
                                                                            }}
                                                                            placeholder="Enter location"
                                                                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                                                        />
                                                                    </div>
                                                                )}

                                                                {/* Transfer Type - Only for Transfers */}
                                                                {transaction.type ===
                                                                    "transfer" && (
                                                                    <div>
                                                                        <label className="block text-sm text-[#04362c]/80 mb-1">
                                                                            Transfer Type:
                                                                        </label>
                                                                        <select
                                                                            value={
                                                                                transaction.transferType ||
                                                                                "intra_person"
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) => {
                                                                                const updatedTransactions =
                                                                                    transactions.map(
                                                                                        (
                                                                                            t
                                                                                        ) =>
                                                                                            t.id ===
                                                                                            transaction.id
                                                                                                ? {
                                                                                                      ...t,
                                                                                                      transferType:
                                                                                                          e
                                                                                                              .target
                                                                                                              .value,
                                                                                                  }
                                                                                                : t
                                                                                    );
                                                                                setTransactions(
                                                                                    updatedTransactions
                                                                                );
                                                                            }}
                                                                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                                                        >
                                                                            <option value="intra_person">
                                                                                To Own Account/Savings
                                                                            </option>
                                                                            <option value="inter_person">
                                                                                To Another Person
                                                                            </option>
                                                                        </select>
                                                                    </div>
                                                                )}

                                                                {/* Recipient Account Name - Only for Transfers */}
                                                                {transaction.type ===
                                                                    "transfer" && (
                                                                    <div>
                                                                        <label className="block text-sm text-[#04362c]/80 mb-1">
                                                                            Recipient Account Name:
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={
                                                                                transaction.recipientAccountName ||
                                                                                ""
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) => {
                                                                                const updatedTransactions =
                                                                                    transactions.map(
                                                                                        (
                                                                                            t
                                                                                        ) =>
                                                                                            t.id ===
                                                                                            transaction.id
                                                                                                ? {
                                                                                                      ...t,
                                                                                                      recipientAccountName:
                                                                                                          e
                                                                                                              .target
                                                                                                              .value,
                                                                                                  }
                                                                                                : t
                                                                                    );
                                                                                setTransactions(
                                                                                    updatedTransactions
                                                                                );
                                                                            }}
                                                                            placeholder="Enter recipient account name"
                                                                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                                                        />
                                                                    </div>
                                                                )}

                                                                {/* Recipient Account Number - Only for Transfers */}
                                                                {transaction.type ===
                                                                    "transfer" && (
                                                                    <div>
                                                                        <label className="block text-sm text-[#04362c]/80 mb-1">
                                                                            Recipient Account Number:
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={
                                                                                transaction.recipientAccountNo ||
                                                                                ""
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) => {
                                                                                const updatedTransactions =
                                                                                    transactions.map(
                                                                                        (
                                                                                            t
                                                                                        ) =>
                                                                                            t.id ===
                                                                                            transaction.id
                                                                                                ? {
                                                                                                      ...t,
                                                                                                      recipientAccountNo:
                                                                                                          e
                                                                                                              .target
                                                                                                              .value,
                                                                                                  }
                                                                                                : t
                                                                                    );
                                                                                setTransactions(
                                                                                    updatedTransactions
                                                                                );
                                                                            }}
                                                                            placeholder="Enter recipient account number"
                                                                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                                                        />
                                                                    </div>
                                                                )}

                                                                {/* Reference - Available for all transaction types */}
                                                                <div>
                                                                    <label className="block text-sm text-[#04362c]/80 mb-1">
                                                                        Reference:
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={
                                                                            transaction.reference ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            const updatedTransactions =
                                                                                transactions.map(
                                                                                    (
                                                                                        t
                                                                                    ) =>
                                                                                        t.id ===
                                                                                        transaction.id
                                                                                            ? {
                                                                                                  ...t,
                                                                                                  reference:
                                                                                                      e
                                                                                                          .target
                                                                                                          .value,
                                                                                              }
                                                                                            : t
                                                                                );
                                                                            setTransactions(
                                                                                updatedTransactions
                                                                            );
                                                                        }}
                                                                        placeholder="Enter reference number"
                                                                        className="bg-white w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Save and Cancel Buttons */}
                                                        <div className="grid grid-cols-2 gap-3 pt-4 mt-4 border-t border-gray-200">
                                                            <button
                                                                type="button"
                                                                onClick={
                                                                    handleCancelEdit
                                                                }
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                                                disabled={
                                                                    isSaving
                                                                }
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleUpdateTransaction(
                                                                        transaction
                                                                    )
                                                                }
                                                                className="w-full px-4 py-2 bg-[var(--card)] text-[var(--button-foreground)] rounded-lg hover:opacity-90 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                disabled={
                                                                    isSaving
                                                                }
                                                            >
                                                                {isSaving
                                                                    ? "Saving..."
                                                                    : "Save Changes"}
                                                            </button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        {/* Show message when no transactions match filters */}
                        {filteredTransactions.length === 0 && (
                            <div className="text-center py-8 text-[#04362c]">
                                {/* Different messages based on whether filters are active */}
                                {searchTerm || categoryFilter || typeFilter
                                    ? "No transactions found matching your filters."
                                    : "No transactions found."}
                            </div>
                        )}

                        {/* Pagination */}
                        {filteredTransactions.length > 0 && (
                            <>
                                <div className="mt-4 flex items-center justify-between border-t pt-4">
                                    {/* Items per page selector */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-[#04362c]/80 whitespace-nowrap">Show:</span>
                                        <Select
                                            value={itemsPerPage.toString()}
                                            onValueChange={(value) => {
                                                const newValue = parseInt(value, 10);
                                                setItemsPerPage(newValue);
                                                setCurrentPage(1); // Reset to first page when changing items per page
                                                // Immediately save to localStorage
                                                if (typeof window !== 'undefined') {
                                                    localStorage.setItem('transactionItemsPerPage', newValue.toString());
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="w-[80px] text-sm text-[#04362c]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="10" className="text-[#04362c]">10</SelectItem>
                                                <SelectItem value="20" className="text-[#04362c]">20</SelectItem>
                                                <SelectItem value="50" className="text-[#04362c]">50</SelectItem>
                                                <SelectItem value="100" className="text-[#04362c]">100</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <span className="text-sm text-[#04362c]/80 whitespace-nowrap">per page</span>
                                    </div>
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    onClick={() =>
                                                        setCurrentPage((prev) =>
                                                            Math.max(
                                                                prev - 1,
                                                                1
                                                            )
                                                        )
                                                    }
                                                    className={`text-[#04362c] text-lg ${
                                                        currentPage === 1
                                                            ? "pointer-events-none opacity-50"
                                                            : "cursor-pointer"
                                                    }`}
                                                />
                                            </PaginationItem>

                                            {/* Smart Page Numbers: <Prev 1 ... 4 5 6 ... 10 Next> */}
                                            {(() => {
                                                const pages = [];

                                                if (totalPages <= 7) {
                                                    // Show all pages if 7 or less
                                                    for (
                                                        let i = 1;
                                                        i <= totalPages;
                                                        i++
                                                    ) {
                                                        pages.push(
                                                            <PaginationItem
                                                                key={i}
                                                            >
                                                                <PaginationLink
                                                                    onClick={() =>
                                                                        setCurrentPage(
                                                                            i
                                                                        )
                                                                    }
                                                                    isActive={
                                                                        currentPage ===
                                                                        i
                                                                    }
                                                                    className={`text-[#04362c] cursor-pointer text-lg ${
                                                                        currentPage ===
                                                                        i
                                                                            ? "border-2 border-secondary"
                                                                            : ""
                                                                    }`}
                                                                >
                                                                    {i}
                                                                </PaginationLink>
                                                            </PaginationItem>
                                                        );
                                                    }
                                                } else {
                                                    // Always show first page
                                                    pages.push(
                                                        <PaginationItem key={1}>
                                                            <PaginationLink
                                                                onClick={() =>
                                                                    setCurrentPage(
                                                                        1
                                                                    )
                                                                }
                                                                isActive={
                                                                    currentPage ===
                                                                    1
                                                                }
                                                                className={`text-[#04362c] cursor-pointer text-lg ${
                                                                    currentPage ===
                                                                    1
                                                                        ? "border-2 border-secondary"
                                                                        : ""
                                                                }`}
                                                            >
                                                                1
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    );

                                                    // Left ellipsis (if current page > 3)
                                                    if (currentPage > 3) {
                                                        pages.push(
                                                            <PaginationItem key="ellipsis-left">
                                                                <span className="px-3 text-[#04362c] text-lg">
                                                                    ...
                                                                </span>
                                                            </PaginationItem>
                                                        );
                                                    }

                                                    // Pages around current (show current - 1, current, current + 1)
                                                    const startPage = Math.max(
                                                        2,
                                                        currentPage - 1
                                                    );
                                                    const endPage = Math.min(
                                                        totalPages - 1,
                                                        currentPage + 1
                                                    );

                                                    for (
                                                        let i = startPage;
                                                        i <= endPage;
                                                        i++
                                                    ) {
                                                        pages.push(
                                                            <PaginationItem
                                                                key={i}
                                                            >
                                                                <PaginationLink
                                                                    onClick={() =>
                                                                        setCurrentPage(
                                                                            i
                                                                        )
                                                                    }
                                                                    isActive={
                                                                        currentPage ===
                                                                        i
                                                                    }
                                                                    className={`text-[#04362c] cursor-pointer text-lg ${
                                                                        currentPage ===
                                                                        i
                                                                            ? "border-2 border-secondary"
                                                                            : ""
                                                                    }`}
                                                                >
                                                                    {i}
                                                                </PaginationLink>
                                                            </PaginationItem>
                                                        );
                                                    }

                                                    // Right ellipsis (if current page < totalPages - 2)
                                                    if (
                                                        currentPage <
                                                        totalPages - 2
                                                    ) {
                                                        pages.push(
                                                            <PaginationItem key="ellipsis-right">
                                                                <span className="px-3 text-[#04362c] text-lg">
                                                                    ...
                                                                </span>
                                                            </PaginationItem>
                                                        );
                                                    }

                                                    // Always show last page
                                                    pages.push(
                                                        <PaginationItem
                                                            key={totalPages}
                                                        >
                                                            <PaginationLink
                                                                onClick={() =>
                                                                    setCurrentPage(
                                                                        totalPages
                                                                    )
                                                                }
                                                                isActive={
                                                                    currentPage ===
                                                                    totalPages
                                                                }
                                                                className={`text-[#04362c] cursor-pointer text-lg ${
                                                                    currentPage ===
                                                                    totalPages
                                                                        ? "border-2 border-secondary"
                                                                        : ""
                                                                }`}
                                                            >
                                                                {totalPages}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    );
                                                }

                                                return pages;
                                            })()}

                                            <PaginationItem>
                                                <PaginationNext
                                                    onClick={() =>
                                                        setCurrentPage((prev) =>
                                                            Math.min(
                                                                prev + 1,
                                                                totalPages
                                                            )
                                                        )
                                                    }
                                                    className={`text-[#04362c] text-lg ${
                                                        currentPage ===
                                                        totalPages
                                                            ? "pointer-events-none opacity-50"
                                                            : "cursor-pointer"
                                                    }`}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                                <p className="text-xs text-center text-[#04362c] mt-3">
                                    Showing {startIndex + 1} to{" "}
                                    {Math.min(
                                        endIndex,
                                        filteredTransactions.length
                                    )}{" "}
                                    of {filteredTransactions.length}{" "}
                                    transactions
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Add Transaction Dialog */}
                <AddTransactionDialog
                    open={isAddDialogOpen}
                    onOpenChange={(open) => {
                        setIsAddDialogOpen(open);
                        if (!open) {
                            setEntryMethod("selection"); // Reset to selection when closing
                        }
                    }}
                    entryMethod={entryMethod}
                    onMethodSelect={setEntryMethod}
                    onSave={handleAddTransaction}
                    accounts={accounts}
                />

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                >
                    <DialogContent className="max-w-md border-2 border-[#04362c]/30 bg-white">
                        <DialogHeader>
                            <DialogTitle className="text-lg sm:text-xl font-bold text-[#04362c]">
                                Delete Transaction
                            </DialogTitle>
                            <DialogDescription className="text-sm text-[#04362c]/70 mt-1">
                                Are you sure you want to delete this transaction? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter className="flex gap-3 mt-6">
                            <Button
                                onClick={() => {
                                    setDeleteDialogOpen(false);
                                    setTransactionToDelete(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 bg-white text-[#04362c]/90 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDeleteTransaction}
                                className="flex-1 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 font-medium transition-colors"
                            >
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Bulk Delete Confirmation Dialog */}
                <Dialog
                    open={bulkDeleteDialogOpen}
                    onOpenChange={setBulkDeleteDialogOpen}
                >
                    <DialogContent className="max-w-md border-2 border-[#04362c]/30 bg-white">
                        <DialogHeader>
                            <DialogTitle className="text-lg sm:text-xl font-bold text-[#04362c]">
                                Delete Selected Transactions
                            </DialogTitle>
                            <DialogDescription className="text-sm text-[#04362c]/70 mt-1">
                                Are you sure you want to delete {selectedTransactions.size} selected transaction{selectedTransactions.size > 1 ? 's' : ''}? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter className="flex gap-3 mt-6">
                            <Button
                                onClick={() => setBulkDeleteDialogOpen(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 bg-white text-[#04362c]/90 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleBulkDelete}
                                className="flex-1 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 font-medium transition-colors"
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete All Confirmation Dialog */}
                <Dialog
                    open={deleteAllDialogOpen}
                    onOpenChange={setDeleteAllDialogOpen}
                >
                    <DialogContent className="max-w-md border-2 border-[#04362c]/30 bg-white">
                        <DialogHeader>
                            <DialogTitle className="text-lg sm:text-xl font-bold text-[#04362c]">
                                Delete All Transactions
                            </DialogTitle>
                            <DialogDescription className="text-sm text-[#04362c]/70 mt-1">
                                Are you sure you want to delete ALL {transactions.length} transactions? This is a destructive action and cannot be undone.
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter className="flex gap-3 mt-6">
                            <Button
                                onClick={() => setDeleteAllDialogOpen(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 bg-white text-[#04362c]/90 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDeleteAll}
                                className="flex-1 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 font-medium transition-colors"
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Deleting..." : "Delete All"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

export default Transactions;
