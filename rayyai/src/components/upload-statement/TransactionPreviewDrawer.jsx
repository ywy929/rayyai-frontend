import React, { useState, useEffect } from "react";
import {
    X,
    FileUp,
    Loader,
    ChevronDown,
    ChevronRight,
    PenTool,
    Shield,
    CreditCard,
    CheckCircle2,
} from "lucide-react";
import { brand, formatFileName, expenseCategories, incomeCategories, inferExpenseType } from "./constants";

/**
 * TransactionPreviewDrawer - Slide-out drawer showing extracted transactions
 */
function TransactionPreviewDrawer({
    showTransactions,
    selectedFile,
    extractedTransactions,
    editedPreviewTransactions,
    accounts,
    isImporting,
    importProgress,
    onClose,
    onImport,
    setExtractedTransactions,
    setEditedPreviewTransactions,
}) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [expandedPreviewRow, setExpandedPreviewRow] = useState(null);
    const [editingCell, setEditingCell] = useState(null);
    const [editingAccountInfo, setEditingAccountInfo] = useState(false);

    // Handle drawer animation
    useEffect(() => {
        if (showTransactions) {
            setTimeout(() => setIsDrawerOpen(true), 10);
        } else {
            setIsDrawerOpen(false);
        }
    }, [showTransactions]);

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    // Helper to update a single transaction field
    const updateTransactionField = (transactionId, updates) => {
        setEditedPreviewTransactions((prev) =>
            prev.map((t) => (t.id === transactionId ? { ...t, ...updates } : t))
        );
    };

    if (!showTransactions || !selectedFile) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
                    isDrawerOpen ? "opacity-100" : "opacity-0"
                }`}
                onClick={closeDrawer}
            ></div>

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full md:w-[90%] lg:w-[85%] shadow-2xl z-50 transform transition-transform duration-300 ease-out overflow-hidden flex flex-col ${
                    isDrawerOpen ? "translate-x-0" : "translate-x-full"
                }`}
                style={{ backgroundColor: brand.surface }}
            >
                {/* Drawer Header */}
                <div
                    className="text-white p-4 sm:p-5 flex-shrink-0"
                    style={{ backgroundColor: brand.ink }}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg sm:text-xl font-semibold">
                                {`Transactions from ${formatFileName(selectedFile.name)}`}
                            </h2>
                            <p className="text-xs sm:text-sm text-white/90 mt-1.5">
                                Preview of extracted transactions - you can categorize and modify them
                            </p>
                        </div>
                        <button
                            onClick={closeDrawer}
                            className="ml-3 p-1.5 hover:bg-white/20 rounded-lg transition-colors shrink-0"
                            title="Close drawer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Drawer Content - Scrollable */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-0">
                    {/* Transaction Table View */}
                    <div>
                        {/* Show extraction summary if available */}
                        {extractedTransactions && (
                            <ExtractionSummary
                                extractedTransactions={extractedTransactions}
                                editingAccountInfo={editingAccountInfo}
                                setEditingAccountInfo={setEditingAccountInfo}
                                setExtractedTransactions={setExtractedTransactions}
                            />
                        )}

                        <div className="overflow-x-auto h-full">
                            <table className="w-full">
                                <thead
                                    className="sticky top-0 z-10 shadow-sm"
                                    style={{ backgroundColor: brand.surface }}
                                >
                                    <tr>
                                        <th
                                            className="text-left py-2 px-3 text-xs sm:text-sm font-medium border-b"
                                            style={{ color: brand.ink, borderColor: brand.ink + "33" }}
                                        >
                                            Date
                                        </th>
                                        <th
                                            className="text-left py-2 px-3 text-xs sm:text-sm font-medium border-b"
                                            style={{ color: brand.ink, borderColor: brand.ink + "33" }}
                                        >
                                            Description
                                        </th>
                                        <th
                                            className="text-left py-2 px-3 text-xs sm:text-sm font-medium border-b"
                                            style={{ color: brand.ink, borderColor: brand.ink + "33" }}
                                        >
                                            Category
                                        </th>
                                        <th
                                            className="text-left py-2 px-3 text-xs sm:text-sm font-medium border-b"
                                            style={{ color: brand.ink, borderColor: brand.ink + "33" }}
                                        >
                                            Account
                                        </th>
                                        <th
                                            className="text-left py-2 px-3 text-xs sm:text-sm font-medium border-b"
                                            style={{ color: brand.ink, borderColor: brand.ink + "33" }}
                                        >
                                            Type
                                        </th>
                                        <th
                                            className="text-right py-2 px-3 text-xs sm:text-sm font-medium border-b"
                                            style={{ color: brand.ink, borderColor: brand.ink + "33" }}
                                        >
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {editedPreviewTransactions.map((transaction) => (
                                        <TransactionRow
                                            key={transaction.id}
                                            transaction={transaction}
                                            isExpanded={expandedPreviewRow === transaction.id}
                                            editingCell={editingCell}
                                            accounts={accounts}
                                            onToggleExpand={() => {
                                                setExpandedPreviewRow(
                                                    expandedPreviewRow === transaction.id
                                                        ? null
                                                        : transaction.id
                                                );
                                                setEditingCell(null);
                                            }}
                                            onEditCell={setEditingCell}
                                            onUpdateField={updateTransactionField}
                                            setEditedPreviewTransactions={setEditedPreviewTransactions}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Bottom spacing */}
                        <div className="pb-6"></div>
                    </div>
                </div>

                {/* Drawer Footer - Sticky */}
                <div
                    className="flex justify-between items-center gap-3 p-4 sm:p-5 border-t flex-shrink-0"
                    style={{ borderColor: brand.ink + "33", backgroundColor: brand.surface }}
                >
                    <button
                        onClick={closeDrawer}
                        disabled={isImporting}
                        className="px-4 py-2 rounded-lg border transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ borderColor: brand.ink + "66", color: brand.ink }}
                        onMouseEnter={(e) =>
                            !e.currentTarget.disabled &&
                            (e.currentTarget.style.backgroundColor = brand.ink + "1A")
                        }
                        onMouseLeave={(e) =>
                            !e.currentTarget.disabled &&
                            (e.currentTarget.style.backgroundColor = "transparent")
                        }
                    >
                        Close Preview
                    </button>
                    {extractedTransactions ? (
                        <button
                            onClick={onImport}
                            disabled={isImporting}
                            className="relative px-4 py-2 rounded-lg overflow-hidden transition-all flex items-center justify-center gap-2 text-sm font-medium shadow-md hover:shadow-lg disabled:cursor-not-allowed min-w-[200px] sm:min-w-[240px]"
                            style={{
                                backgroundColor: isImporting ? brand.surface : brand.mint,
                                color: isImporting ? brand.ink : "white",
                            }}
                        >
                            {/* Progress Bar Background */}
                            {isImporting && (
                                <div
                                    className="absolute inset-0 transition-all duration-300 ease-out"
                                    style={{
                                        width: `${importProgress}%`,
                                        backgroundColor: brand.ink,
                                    }}
                                />
                            )}

                            {/* Button Content */}
                            <div
                                className="relative z-10 flex items-center gap-2"
                                style={{ color: isImporting ? "white" : "inherit" }}
                            >
                                {isImporting ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        <span>
                                            Importing {extractedTransactions.summary.total_transactions}{" "}
                                            Transactions... {importProgress}%
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <FileUp className="w-4 h-4" />
                                        Import {extractedTransactions.summary.total_transactions} Transactions
                                    </>
                                )}
                            </div>
                        </button>
                    ) : (
                        <button
                            className="px-4 py-2 text-white rounded-lg transition-all text-sm font-medium shadow-md hover:shadow-lg"
                            style={{ backgroundColor: brand.ink }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = brand.mint)}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = brand.ink)}
                        >
                            Import All Transactions
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}

/**
 * ExtractionSummary - Shows summary of extracted data with editable account info
 */
function ExtractionSummary({
    extractedTransactions,
    editingAccountInfo,
    setEditingAccountInfo,
    setExtractedTransactions,
}) {
    // Calculate period from transactions if not provided
    let startDate = extractedTransactions.statement_period?.start_date;
    let endDate = extractedTransactions.statement_period?.end_date;

    if ((!startDate || !endDate) && extractedTransactions.transactions?.length > 0) {
        const dates = extractedTransactions.transactions
            .map((t) => t.date)
            .filter(Boolean)
            .sort();
        startDate = dates[0];
        endDate = dates[dates.length - 1];
    }

    return (
        <div
            className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border"
            style={{ backgroundColor: brand.surface, borderColor: brand.ink + "33" }}
        >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm mb-3 sm:mb-4">
                <div>
                    <span style={{ color: brand.ink + "CC" }}>Total Pages:</span>
                    <p className="font-bold" style={{ color: brand.ink }}>
                        {extractedTransactions.summary.total_pages}
                    </p>
                </div>
                <div>
                    <span style={{ color: brand.ink + "CC" }}>Transactions:</span>
                    <p className="font-bold" style={{ color: brand.ink }}>
                        {extractedTransactions.summary.total_transactions}
                    </p>
                </div>
                <div>
                    <label className="block mb-1" style={{ color: brand.ink + "CC" }}>
                        Period:
                    </label>
                    {editingAccountInfo ? (
                        <div className="flex gap-2 items-center">
                            <input
                                type="date"
                                value={extractedTransactions.statement_period?.start_date || startDate || ""}
                                onChange={(e) => {
                                    setExtractedTransactions((prev) => ({
                                        ...prev,
                                        statement_period: {
                                            ...(prev.statement_period || {}),
                                            start_date: e.target.value,
                                        },
                                    }));
                                }}
                                className="flex-1 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-2 font-bold"
                                style={{ borderColor: brand.ink + "66", color: brand.ink }}
                            />
                            <span className="text-xs" style={{ color: brand.ink + "99" }}>
                                to
                            </span>
                            <input
                                type="date"
                                value={extractedTransactions.statement_period?.end_date || endDate || ""}
                                onChange={(e) => {
                                    setExtractedTransactions((prev) => ({
                                        ...prev,
                                        statement_period: {
                                            ...(prev.statement_period || {}),
                                            end_date: e.target.value,
                                        },
                                    }));
                                }}
                                className="flex-1 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-2 font-bold"
                                style={{ borderColor: brand.ink + "66", color: brand.ink }}
                            />
                        </div>
                    ) : (
                        <p className="font-bold" style={{ color: brand.ink }}>
                            {startDate && endDate ? `${startDate} to ${endDate}` : "N/A"}
                        </p>
                    )}
                </div>
            </div>

            {/* Account Information Section */}
            {extractedTransactions.account_info && (
                <AccountInfoSection
                    accountInfo={extractedTransactions.account_info}
                    editingAccountInfo={editingAccountInfo}
                    setEditingAccountInfo={setEditingAccountInfo}
                    setExtractedTransactions={setExtractedTransactions}
                />
            )}

            {/* Balance Section */}
            {(extractedTransactions.opening_balance != null ||
                extractedTransactions.closing_balance != null ||
                editingAccountInfo) && (
                <BalanceSection
                    openingBalance={extractedTransactions.opening_balance}
                    closingBalance={extractedTransactions.closing_balance}
                    editingAccountInfo={editingAccountInfo}
                    setEditingAccountInfo={setEditingAccountInfo}
                    setExtractedTransactions={setExtractedTransactions}
                />
            )}
        </div>
    );
}

/**
 * AccountInfoSection - Editable account information
 */
function AccountInfoSection({
    accountInfo,
    editingAccountInfo,
    setEditingAccountInfo,
    setExtractedTransactions,
}) {
    return (
        <div className="border-t pt-3 sm:pt-4 mt-3 sm:mt-4" style={{ borderColor: brand.ink + "33" }}>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h4 className="text-xs sm:text-sm font-semibold" style={{ color: brand.ink }}>
                    Account Information
                </h4>
                {!editingAccountInfo && (
                    <button
                        onClick={() => setEditingAccountInfo(true)}
                        className="text-xs px-2 py-1 rounded transition-colors flex items-center gap-1"
                        style={{ color: brand.mint }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = brand.mint + "1A")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        title="Edit account information"
                    >
                        <PenTool className="h-3 w-3" />
                        Edit
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                {/* Account Number */}
                <EditableField
                    label="Account Number"
                    value={accountInfo.account_number}
                    editing={editingAccountInfo}
                    onChange={(value) =>
                        setExtractedTransactions((prev) => ({
                            ...prev,
                            account_info: { ...prev.account_info, account_number: value },
                        }))
                    }
                    onStartEdit={() => setEditingAccountInfo(true)}
                    placeholder="Enter account number"
                />

                {/* Account Name */}
                <EditableField
                    label="Account Name"
                    value={accountInfo.account_name}
                    editing={editingAccountInfo}
                    onChange={(value) =>
                        setExtractedTransactions((prev) => ({
                            ...prev,
                            account_info: { ...prev.account_info, account_name: value },
                        }))
                    }
                    onStartEdit={() => setEditingAccountInfo(true)}
                    placeholder="Enter account name"
                />

                {/* Account Type */}
                <EditableSelectField
                    label="Account Type"
                    value={accountInfo.account_type}
                    editing={editingAccountInfo}
                    options={[
                        { value: "", label: "Select type" },
                        { value: "Savings Account", label: "Savings Account" },
                        { value: "Current Account", label: "Current Account" },
                        { value: "Credit Card", label: "Credit Card" },
                        { value: "E-Wallet", label: "E-Wallet" },
                        { value: "Fixed Deposit", label: "Fixed Deposit" },
                        { value: "Investment Account", label: "Investment Account" },
                        { value: "Loan Account", label: "Loan Account" },
                        { value: "Other", label: "Other" },
                    ]}
                    onChange={(value) =>
                        setExtractedTransactions((prev) => ({
                            ...prev,
                            account_info: { ...prev.account_info, account_type: value },
                        }))
                    }
                    onStartEdit={() => setEditingAccountInfo(true)}
                />
            </div>

            {/* Save/Cancel buttons */}
            {editingAccountInfo && (
                <div className="flex gap-2 mt-3 sm:mt-4">
                    <button
                        onClick={() => setEditingAccountInfo(false)}
                        className="px-3 py-1.5 text-sm text-white rounded-lg transition-colors font-medium"
                        style={{ backgroundColor: brand.mint }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = brand.ink)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = brand.mint)}
                    >
                        Save
                    </button>
                    <button
                        onClick={() => setEditingAccountInfo(false)}
                        className="px-3 py-1.5 text-sm border rounded-lg transition-colors font-medium"
                        style={{ borderColor: brand.ink + "66", color: brand.ink }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = brand.ink + "1A")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
}

/**
 * BalanceSection - Shows opening/closing balance
 */
function BalanceSection({
    openingBalance,
    closingBalance,
    editingAccountInfo,
    setEditingAccountInfo,
    setExtractedTransactions,
}) {
    return (
        <div className="border-t pt-3 sm:pt-4 mt-3 sm:mt-4" style={{ borderColor: brand.ink + "33" }}>
            <h4 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3" style={{ color: brand.ink }}>
                Balance Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                {/* Opening Balance */}
                <div>
                    <label className="block mb-1" style={{ color: brand.ink + "CC" }}>
                        Opening Balance:
                    </label>
                    {editingAccountInfo ? (
                        <input
                            type="number"
                            step="0.01"
                            value={openingBalance != null ? openingBalance : ""}
                            onChange={(e) => {
                                setExtractedTransactions((prev) => ({
                                    ...prev,
                                    opening_balance: e.target.value ? parseFloat(e.target.value) : null,
                                }));
                            }}
                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded focus:outline-none focus:ring-2 font-medium"
                            style={{ borderColor: brand.ink + "66", color: brand.ink }}
                            placeholder="0.00"
                        />
                    ) : (
                        <div
                            onClick={() => setEditingAccountInfo(true)}
                            className="font-bold cursor-pointer px-2 py-1 rounded transition-colors"
                            style={{ color: openingBalance != null ? brand.ink : "#ef4444" }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = brand.ink + "1A")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                            title={openingBalance != null ? "Click to edit" : "Click to add opening balance"}
                        >
                            {openingBalance != null ? `RM ${openingBalance.toFixed(2)}` : "Not detected"}
                        </div>
                    )}
                </div>

                {/* Closing Balance */}
                <div>
                    <label className="block mb-1" style={{ color: brand.ink + "CC" }}>
                        Closing Balance:
                    </label>
                    {editingAccountInfo ? (
                        <input
                            type="number"
                            step="0.01"
                            value={closingBalance != null ? closingBalance : ""}
                            onChange={(e) => {
                                setExtractedTransactions((prev) => ({
                                    ...prev,
                                    closing_balance: e.target.value ? parseFloat(e.target.value) : null,
                                }));
                            }}
                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded focus:outline-none focus:ring-2 font-medium"
                            style={{ borderColor: brand.ink + "66", color: brand.ink }}
                            placeholder="0.00"
                        />
                    ) : (
                        <div
                            onClick={() => setEditingAccountInfo(true)}
                            className="font-bold cursor-pointer px-2 py-1 rounded transition-colors"
                            style={{ color: closingBalance != null ? brand.ink : "#ef4444" }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = brand.ink + "1A")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                            title={closingBalance != null ? "Click to edit" : "Click to add closing balance"}
                        >
                            {closingBalance != null ? `RM ${closingBalance.toFixed(2)}` : "Not detected"}
                        </div>
                    )}
                </div>

                <div></div>
            </div>
            {openingBalance != null && closingBalance != null && !editingAccountInfo && (
                <div className="mt-2 text-xs" style={{ color: brand.ink + "99" }}>
                    Net Change: RM {(closingBalance - openingBalance).toFixed(2)}
                </div>
            )}
        </div>
    );
}

/**
 * EditableField - Generic editable text field
 */
function EditableField({ label, value, editing, onChange, onStartEdit, placeholder }) {
    return (
        <div>
            <label className="block mb-1" style={{ color: brand.ink + "CC" }}>
                {label}:
            </label>
            {editing ? (
                <input
                    type="text"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded focus:outline-none focus:ring-2 font-medium"
                    style={{ borderColor: brand.ink + "66", color: brand.ink }}
                    placeholder={placeholder}
                />
            ) : (
                <div
                    onClick={onStartEdit}
                    className="font-bold cursor-pointer px-2 py-1 rounded transition-colors"
                    style={{ color: value ? brand.ink : "#ef4444" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = brand.ink + "1A")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    title={value ? "Click to edit" : `Click to add ${label.toLowerCase()}`}
                >
                    {value || "Not detected"}
                </div>
            )}
        </div>
    );
}

/**
 * EditableSelectField - Generic editable select field
 */
function EditableSelectField({ label, value, editing, options, onChange, onStartEdit }) {
    return (
        <div>
            <label className="block mb-1" style={{ color: brand.ink + "CC" }}>
                {label}:
            </label>
            {editing ? (
                <select
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded focus:outline-none focus:ring-2 font-medium"
                    style={{ borderColor: brand.ink + "66", color: brand.ink }}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            ) : (
                <div
                    onClick={onStartEdit}
                    className="font-bold cursor-pointer px-2 py-1 rounded transition-colors"
                    style={{ color: value ? brand.ink : "#ef4444" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = brand.ink + "1A")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    title={value ? "Click to edit" : `Click to select ${label.toLowerCase()}`}
                >
                    {value || "Not detected"}
                </div>
            )}
        </div>
    );
}

/**
 * TransactionRow - Individual transaction row with inline editing
 */
function TransactionRow({
    transaction,
    isExpanded,
    editingCell,
    accounts,
    onToggleExpand,
    onEditCell,
    onUpdateField,
    setEditedPreviewTransactions,
}) {
    const isTransfer = transaction.type === "transfer";
    const isExpense = transaction.type === "debit" && !isTransfer;
    const isIncome = transaction.type === "credit" && !isTransfer;

    return (
        <React.Fragment>
            <tr
                className="border-b hover:bg-opacity-50"
                style={{ borderColor: brand.ink + "1A" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = brand.surface)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
                {/* Date */}
                <td className="py-2 px-3 text-xs sm:text-sm">
                    {editingCell?.transactionId === transaction.id && editingCell?.field === "date" ? (
                        <input
                            type="date"
                            value={transaction.date || ""}
                            onChange={(e) => onUpdateField(transaction.id, { date: e.target.value })}
                            onBlur={() => onEditCell(null)}
                            onKeyDown={(e) => e.key === "Enter" && onEditCell(null)}
                            autoFocus
                            className="w-full px-2 py-1 text-xs sm:text-sm border rounded focus:outline-none focus:ring-2"
                            style={{ borderColor: brand.ink + "66", color: brand.ink }}
                        />
                    ) : (
                        <div
                            onClick={() => onEditCell({ transactionId: transaction.id, field: "date" })}
                            className="cursor-pointer px-2 py-1 rounded transition-colors"
                            style={{ color: brand.ink }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = brand.ink + "1A")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                            title="Click to edit date"
                        >
                            {transaction.date || "N/A"}
                        </div>
                    )}
                </td>

                {/* Description - Click to expand */}
                <td className="py-2 px-3 text-xs sm:text-sm">
                    <div
                        onClick={onToggleExpand}
                        className="cursor-pointer px-2 py-1 rounded transition-colors flex items-center gap-2"
                        style={{ color: brand.ink }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = brand.ink + "1A")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        title="Click to view/edit details"
                    >
                        {isExpanded ? (
                            <ChevronDown className="h-3 w-3" style={{ color: brand.mint }} />
                        ) : (
                            <ChevronRight className="h-3 w-3" style={{ color: brand.ink + "99" }} />
                        )}
                        <span className="truncate">{transaction.description || "N/A"}</span>
                    </div>
                </td>

                {/* Category */}
                <td className="py-2 px-3 text-xs sm:text-sm">
                    {editingCell?.transactionId === transaction.id && editingCell?.field === "category" ? (
                        <select
                            value={transaction.category || ""}
                            onChange={(e) => {
                                const newCategory = e.target.value;
                                const updates = { category: newCategory };
                                if (newCategory === "Transfer") {
                                    updates.type = "transfer";
                                    updates.expenseType = null;
                                    updates.transfer_type = transaction.transfer_type || "intra_person";
                                } else if (transaction.type === "debit" && transaction.type !== "transfer") {
                                    const inferredType = inferExpenseType(
                                        newCategory,
                                        transaction.description,
                                        Math.abs(transaction.amount)
                                    );
                                    updates.expenseType = inferredType || "needs";
                                }
                                onUpdateField(transaction.id, updates);
                                onEditCell(null);
                            }}
                            onBlur={() => onEditCell(null)}
                            autoFocus
                            className="w-full px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {(isExpense ? expenseCategories : incomeCategories).map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <span
                            onClick={() => onEditCell({ transactionId: transaction.id, field: "category" })}
                            className="px-2 py-1 rounded text-xs bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors inline-block"
                            title="Click to change category"
                        >
                            {transaction.category || "Other"}
                        </span>
                    )}
                </td>

                {/* Account */}
                <td className="py-2 px-3 text-xs sm:text-sm">
                    {editingCell?.transactionId === transaction.id && editingCell?.field === "account" ? (
                        <select
                            value={transaction.accountId || ""}
                            onChange={(e) => {
                                const selectedAccount = accounts.find(
                                    (acc) => acc.account_id === parseInt(e.target.value)
                                );
                                onUpdateField(transaction.id, {
                                    accountId: e.target.value ? parseInt(e.target.value) : null,
                                    account: selectedAccount?.account_name || "",
                                });
                                onEditCell(null);
                            }}
                            onBlur={() => onEditCell(null)}
                            autoFocus
                            className="w-full px-2 py-1 text-xs sm:text-sm border rounded focus:outline-none focus:ring-2"
                            style={{ borderColor: brand.ink + "66", color: brand.ink }}
                        >
                            <option value="">Select account</option>
                            {accounts.map((acc) => (
                                <option key={acc.account_id} value={acc.account_id}>
                                    {acc.account_name}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <div
                            onClick={() => onEditCell({ transactionId: transaction.id, field: "account" })}
                            className="cursor-pointer px-2 py-1 rounded transition-colors"
                            style={{ color: brand.ink }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = brand.ink + "1A")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                            title="Click to change account"
                        >
                            {transaction.account || "Not set"}
                        </div>
                    )}
                </td>

                {/* Type */}
                <td className="py-2 px-3 text-xs sm:text-sm">
                    {editingCell?.transactionId === transaction.id && editingCell?.field === "type" ? (
                        <select
                            value={transaction.type || "debit"}
                            onChange={(e) => {
                                const newType = e.target.value;
                                const currentAmount = Math.abs(transaction.amount);
                                const updates = {
                                    type: newType,
                                    amount: newType === "credit" ? currentAmount : -currentAmount,
                                };
                                if (newType === "transfer") {
                                    updates.category = "Transfer";
                                    updates.expenseType = null;
                                    updates.transfer_type = transaction.transfer_type || "intra_person";
                                } else if (newType === "debit") {
                                    if (transaction.category === "Transfer") {
                                        updates.category = "Other";
                                    }
                                    const inferredType = inferExpenseType(
                                        updates.category || transaction.category,
                                        transaction.description,
                                        currentAmount
                                    );
                                    updates.expenseType = inferredType || "needs";
                                } else if (newType === "credit") {
                                    updates.expenseType = null;
                                }
                                onUpdateField(transaction.id, updates);
                                onEditCell(null);
                            }}
                            onBlur={() => onEditCell(null)}
                            autoFocus
                            className="w-full px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="debit">Expense</option>
                            <option value="credit">Income</option>
                            <option value="transfer">Transfer</option>
                        </select>
                    ) : (
                        <span
                            onClick={() => onEditCell({ transactionId: transaction.id, field: "type" })}
                            className={`px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity ${
                                transaction.type === "transfer"
                                    ? "bg-blue-100 text-blue-700"
                                    : isIncome
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                            title="Click to change type"
                        >
                            {transaction.type === "transfer" ? "Transfer" : isIncome ? "Income" : "Expense"}
                        </span>
                    )}
                </td>

                {/* Amount */}
                <td
                    className="py-2 px-3 text-right font-semibold text-sm sm:text-base"
                    style={{ color: isIncome ? brand.mint : "#ef4444" }}
                >
                    {editingCell?.transactionId === transaction.id && editingCell?.field === "amount" ? (
                        <div className="flex items-center justify-end gap-1">
                            <span>{isIncome ? "+" : "-"}</span>
                            <span>RM</span>
                            <input
                                type="number"
                                step="0.01"
                                value={Math.abs(transaction.amount) || 0}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value) || 0;
                                    onUpdateField(transaction.id, {
                                        amount: isIncome ? value : -value,
                                    });
                                }}
                                onBlur={() => onEditCell(null)}
                                onKeyDown={(e) => e.key === "Enter" && onEditCell(null)}
                                autoFocus
                                className="w-24 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                            />
                        </div>
                    ) : (
                        <div
                            onClick={() => onEditCell({ transactionId: transaction.id, field: "amount" })}
                            className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors inline-block"
                            title="Click to edit amount"
                        >
                            {isIncome ? "+" : "-"}RM {Math.abs(transaction.amount || 0).toFixed(2)}
                        </div>
                    )}
                </td>
            </tr>

            {/* Expandable edit form */}
            {isExpanded && (
                <ExpandedTransactionForm
                    transaction={transaction}
                    isExpense={isExpense}
                    isIncome={isIncome}
                    accounts={accounts}
                    onUpdateField={onUpdateField}
                    setEditedPreviewTransactions={setEditedPreviewTransactions}
                />
            )}
        </React.Fragment>
    );
}

/**
 * ExpandedTransactionForm - Full edit form shown when a row is expanded
 */
function ExpandedTransactionForm({
    transaction,
    isExpense,
    isIncome,
    accounts,
    onUpdateField,
    setEditedPreviewTransactions,
}) {
    return (
        <tr className="bg-gray-50">
            <td colSpan="6" className="p-6">
                <div className="grid grid-cols-2 gap-4">
                    {/* Description */}
                    <div>
                        <label
                            className="block text-xs sm:text-sm font-medium mb-1"
                            style={{ color: brand.ink + "CC" }}
                        >
                            Description *
                        </label>
                        <input
                            type="text"
                            value={transaction.description}
                            onChange={(e) =>
                                onUpdateField(transaction.id, { description: e.target.value })
                            }
                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg"
                            style={{ borderColor: brand.ink + "66", color: brand.ink }}
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label
                            className="block text-xs sm:text-sm font-medium mb-1"
                            style={{ color: brand.ink + "CC" }}
                        >
                            Amount *
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={Math.abs(transaction.amount)}
                            onChange={(e) =>
                                onUpdateField(transaction.id, {
                                    amount: isIncome
                                        ? parseFloat(e.target.value)
                                        : -parseFloat(e.target.value),
                                })
                            }
                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg"
                            style={{ borderColor: brand.ink + "66", color: brand.ink }}
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label
                            className="block text-xs sm:text-sm font-medium mb-1"
                            style={{ color: brand.ink + "CC" }}
                        >
                            Category *
                        </label>
                        <select
                            value={transaction.category}
                            onChange={(e) => onUpdateField(transaction.id, { category: e.target.value })}
                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg"
                            style={{ borderColor: brand.ink + "66", color: brand.ink }}
                        >
                            {(isExpense ? expenseCategories : incomeCategories).map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Account */}
                    <div>
                        <label
                            className="block text-xs sm:text-sm font-medium mb-1"
                            style={{ color: brand.ink + "CC" }}
                        >
                            Account *
                        </label>
                        <select
                            value={transaction.accountId || "custom"}
                            onChange={(e) => {
                                if (e.target.value === "custom") {
                                    onUpdateField(transaction.id, { accountId: null, account: "" });
                                } else {
                                    const selectedAccount = accounts.find(
                                        (acc) => acc.account_id === parseInt(e.target.value)
                                    );
                                    onUpdateField(transaction.id, {
                                        accountId: selectedAccount?.account_id,
                                        account: selectedAccount?.account_name,
                                    });
                                }
                            }}
                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg"
                            style={{ borderColor: brand.ink + "66", color: brand.ink }}
                        >
                            {accounts.map((acc) => (
                                <option key={acc.account_id} value={acc.account_id}>
                                    {acc.account_name}
                                </option>
                            ))}
                            <option value="custom">+ New Account (Type Below)</option>
                        </select>
                        {!transaction.accountId && (
                            <div className="mt-2">
                                <input
                                    type="text"
                                    placeholder="Enter new account name..."
                                    value={transaction.account || ""}
                                    onChange={(e) =>
                                        onUpdateField(transaction.id, { account: e.target.value })
                                    }
                                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-2"
                                    style={{ borderColor: brand.ink + "66", color: brand.ink }}
                                />
                                <p className="text-xs text-blue-600 mt-1">
                                    New account will be created with this name
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Date */}
                    <div>
                        <label
                            className="block text-xs sm:text-sm font-medium mb-1"
                            style={{ color: brand.ink + "CC" }}
                        >
                            Date *
                        </label>
                        <input
                            type="date"
                            value={transaction.date}
                            onChange={(e) => {
                                setEditedPreviewTransactions((prev) =>
                                    prev.map((t) =>
                                        t.id === transaction.id ? { ...t, date: e.target.value } : t
                                    )
                                );
                            }}
                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg"
                            style={{ borderColor: brand.ink + "66", color: brand.ink }}
                        />
                    </div>

                    {/* Need vs Want for expenses */}
                    {isExpense && (
                        <div>
                            <label
                                className="block text-xs sm:text-sm font-medium mb-1"
                                style={{ color: brand.ink + "CC" }}
                            >
                                Need or Want *
                            </label>
                            <select
                                value={transaction.expenseType || "needs"}
                                onChange={(e) => {
                                    setEditedPreviewTransactions((prev) =>
                                        prev.map((t) =>
                                            t.id === transaction.id ? { ...t, expenseType: e.target.value } : t
                                        )
                                    );
                                }}
                                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg"
                                style={{ borderColor: brand.ink + "66", color: brand.ink }}
                            >
                                <option value="needs">Need</option>
                                <option value="wants">Want</option>
                            </select>
                        </div>
                    )}

                    {/* Transfer Type */}
                    {transaction.type === "transfer" && (
                        <div>
                            <label
                                className="block text-xs sm:text-sm font-medium mb-1"
                                style={{ color: brand.ink + "CC" }}
                            >
                                Transfer Type *
                            </label>
                            <select
                                value={transaction.transfer_type || "intra_person"}
                                onChange={(e) => {
                                    setEditedPreviewTransactions((prev) =>
                                        prev.map((t) =>
                                            t.id === transaction.id
                                                ? { ...t, transfer_type: e.target.value }
                                                : t
                                        )
                                    );
                                }}
                                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg"
                                style={{ borderColor: brand.ink + "66", color: brand.ink }}
                            >
                                <option value="intra_person">Internal Transfer (to own account/savings)</option>
                                <option value="inter_person">Transfer to Others</option>
                            </select>
                        </div>
                    )}

                    {/* Seller/Payer */}
                    <div>
                        <label
                            className="block text-xs sm:text-sm font-medium mb-1"
                            style={{ color: brand.ink + "CC" }}
                        >
                            {transaction.type === "transfer"
                                ? "Recipient"
                                : isExpense
                                ? "Seller"
                                : "Payer"}{" "}
                            (Optional)
                        </label>
                        <input
                            type="text"
                            value={isExpense ? transaction.seller : transaction.payer}
                            onChange={(e) => {
                                setEditedPreviewTransactions((prev) =>
                                    prev.map((t) =>
                                        t.id === transaction.id
                                            ? { ...t, [isExpense ? "seller" : "payer"]: e.target.value }
                                            : t
                                    )
                                );
                            }}
                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg"
                            style={{ borderColor: brand.ink + "66", color: brand.ink }}
                        />
                    </div>

                    {/* Location (for expenses only) */}
                    {isExpense && (
                        <div>
                            <label
                                className="block text-xs sm:text-sm font-medium mb-1"
                                style={{ color: brand.ink + "CC" }}
                            >
                                Location (Optional)
                            </label>
                            <input
                                type="text"
                                value={transaction.location || ""}
                                onChange={(e) => {
                                    setEditedPreviewTransactions((prev) =>
                                        prev.map((t) =>
                                            t.id === transaction.id ? { ...t, location: e.target.value } : t
                                        )
                                    );
                                }}
                                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg"
                                style={{ borderColor: brand.ink + "66", color: brand.ink }}
                            />
                        </div>
                    )}

                    {/* Reference No */}
                    <div>
                        <label
                            className="block text-xs sm:text-sm font-medium mb-1"
                            style={{ color: brand.ink + "CC" }}
                        >
                            Reference No (Optional)
                        </label>
                        <input
                            type="text"
                            value={transaction.reference_no || ""}
                            onChange={(e) => {
                                setEditedPreviewTransactions((prev) =>
                                    prev.map((t) =>
                                        t.id === transaction.id ? { ...t, reference_no: e.target.value } : t
                                    )
                                );
                            }}
                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg"
                            style={{ borderColor: brand.ink + "66", color: brand.ink }}
                        />
                    </div>
                </div>
            </td>
        </tr>
    );
}

export default TransactionPreviewDrawer;
