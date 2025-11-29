import React, { useState, useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import {
    AlertDialog as ShadcnAlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { API_BASE_URL } from "@/services/api";

// Import extracted components
import {
    StatementUploadZone,
    StatementList,
    TransactionPreviewDrawer,
    AlertDialog,
    DuplicateDialog,
    PdfViewerDialog,
    RescanConfirmDialog,
    brand,
    inferExpenseType,
    formatFileSize,
} from "@/components/upload-statement";

export default function UploadStatement() {
    // State management
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showTransactions, setShowTransactions] = useState(false);
    const [extractedTransactions, setExtractedTransactions] = useState(null);
    const [extractingStatementId, setExtractingStatementId] = useState(null);
    const [editedPreviewTransactions, setEditedPreviewTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [creditCards, setCreditCards] = useState([]);
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState(0);

    // Cache for processed statements
    const [processedStatements, setProcessedStatements] = useState(() => {
        try {
            const stored = localStorage.getItem("processedStatements");
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error("Error loading processed statements from localStorage:", error);
            return {};
        }
    });

    // Dialog states
    const [duplicateDialog, setDuplicateDialog] = useState({
        isOpen: false,
        file: null,
        duplicateInfo: null,
    });
    const [pdfViewerDialog, setPdfViewerDialog] = useState({
        isOpen: false,
        pdfUrl: null,
        fileName: null,
    });
    const [alertDialog, setAlertDialog] = useState({
        isOpen: false,
        type: "info",
        title: "",
        message: "",
    });
    const [rescanConfirmDialog, setRescanConfirmDialog] = useState({
        isOpen: false,
        file: null,
    });
    const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({
        isOpen: false,
        file: null,
    });

    // Refs
    const statementInputRef = useRef(null);

    // Persist processedStatements to localStorage
    useEffect(() => {
        try {
            localStorage.setItem("processedStatements", JSON.stringify(processedStatements));
        } catch (error) {
            console.error("Error saving processed statements to localStorage:", error);
        }
    }, [processedStatements]);

    // Cleanup blob URLs on unmount
    useEffect(() => {
        return () => {
            if (pdfViewerDialog.pdfUrl && pdfViewerDialog.pdfUrl.startsWith("blob:")) {
                URL.revokeObjectURL(pdfViewerDialog.pdfUrl);
            }
        };
    }, [pdfViewerDialog.pdfUrl]);

    // Fetch data on mount
    useEffect(() => {
        fetchStatementsByTab();
        fetchAccounts();
        fetchCreditCards();
    }, []);

    // Helper function to show alert dialog
    const showAlert = (type, title, message) => {
        setAlertDialog({ isOpen: true, type, title, message });
    };

    // Helper function to close PDF viewer
    const closePdfViewer = () => {
        if (pdfViewerDialog.pdfUrl && pdfViewerDialog.pdfUrl.startsWith("blob:")) {
            URL.revokeObjectURL(pdfViewerDialog.pdfUrl);
        }
        setPdfViewerDialog({ isOpen: false, pdfUrl: null, fileName: null });
    };

    // Fetch user accounts for dropdown
    const fetchAccounts = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/accounts/`, {
                credentials: "include",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setAccounts(data);
            }
        } catch (error) {
            console.error("Error fetching accounts:", error);
        }
    };

    // Fetch user credit cards
    const fetchCreditCards = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/cards/`, {
                credentials: "include",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setCreditCards(data);
            }
        } catch (error) {
            console.error("Error fetching credit cards:", error);
        }
    };

    // Transform backend statement data to frontend format
    const transformStatement = (statement) => {
        const filename =
            statement.display_name ||
            statement.statement_url.split("/").pop() ||
            "Unknown file";

        let type = statement.statement_type.toLowerCase();
        if (type === "credit_card") type = "credit";

        let dateRange = null;
        if (statement.period_start && statement.period_end) {
            const startDate = new Date(statement.period_start);
            const endDate = new Date(statement.period_end);
            dateRange = `${startDate.toLocaleDateString("en-GB")} - ${endDate.toLocaleDateString("en-GB")}`;
        }

        return {
            id: statement.statement_id.toString(),
            statementId: statement.statement_id,
            name: filename,
            size: "N/A",
            status: "completed",
            uploadDate: new Date(statement.date_uploaded || statement.created_at),
            type: type,
            transactionsCount: null,
            dateRange: dateRange,
            extractedData: statement.extracted_data,
            statementUrl: statement.statement_url,
            fileName: filename,
        };
    };

    // Fetch statements
    const fetchStatementsByTab = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/statement`, {
                credentials: "include",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch statements");
            }

            const statements = await response.json();
            const transformedStatements = statements.map(transformStatement);
            transformedStatements.sort((a, b) => b.uploadDate - a.uploadDate);
            setUploadedFiles(transformedStatements);
        } catch (error) {
            console.error("Error fetching statements:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Upload financial statements
    const handleStatementUpload = async (files, forceUpload = false, statementTypeOverride = null) => {
        setIsProcessing(true);

        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append("file", file);

                let statementType = statementTypeOverride;
                if (!statementType) {
                    if (file.name.toLowerCase().includes("credit")) {
                        statementType = "credit_card";
                    } else if (file.name.toLowerCase().includes("ewallet")) {
                        statementType = "ewallet";
                    } else if (file.name.toLowerCase().includes("receipt")) {
                        statementType = "receipt";
                    } else {
                        statementType = "bank";
                    }
                }

                const tempFile = {
                    id: "temp-" + Date.now().toString() + Math.random().toString(36).substring(2, 11),
                    name: file.name,
                    size: formatFileSize(file.size),
                    status: "processing",
                    uploadDate: new Date(),
                    type: statementType === "credit_card" ? "credit" : statementType,
                };

                setUploadedFiles((prev) => [tempFile, ...prev]);

                try {
                    const url = `${API_BASE_URL}/statement?statement_type=${statementType}${forceUpload ? "&force_upload=true" : ""}`;

                    const response = await fetch(url, {
                        method: "POST",
                        body: formData,
                        credentials: "include",
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    });

                    if (!response.ok) {
                        const errorData = await response.json();

                        if (response.status === 409) {
                            setUploadedFiles((prev) => prev.filter((f) => f.id !== tempFile.id));
                            setDuplicateDialog({
                                isOpen: true,
                                file: file,
                                duplicateInfo: errorData.detail.duplicate_statement,
                                uploadType: "statement",
                                statementType: statementType,
                            });
                            return;
                        }

                        throw new Error(errorData.detail?.message || errorData.detail || "Upload failed");
                    }

                    setUploadedFiles((prev) => prev.filter((f) => f.id !== tempFile.id));
                    await fetchStatementsByTab();
                } catch (error) {
                    console.error("Upload error:", error);
                    setUploadedFiles((prev) =>
                        prev.map((f) => (f.id === tempFile.id ? { ...f, status: "error" } : f))
                    );
                    showAlert("error", "Upload Failed", `Failed to upload ${file.name}: ${error.message}`);
                }
            }
        } finally {
            setIsProcessing(false);
        }
    };

    // Delete statement
    const handleDeleteStatement = async () => {
        const file = deleteConfirmDialog.file;
        if (!file) return;

        setDeleteConfirmDialog({ isOpen: false, file: null });

        try {
            const response = await fetch(`${API_BASE_URL}/statement/${file.statementId}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to delete statement");
            }

            setUploadedFiles((prev) => prev.filter((f) => f.id !== file.id));
            setProcessedStatements((prev) => {
                const updated = { ...prev };
                delete updated[file.statementId];
                return updated;
            });
        } catch (error) {
            console.error("Delete error:", error);
            showAlert("error", "Delete Failed", `Failed to delete statement: ${error.message}`);
        }
    };

    // Initialize transactions with defaults
    const initializeTransactionsWithDefaults = (result) => {
        const extractedAccountName =
            result.account_info?.account_name || result.account_info?.account_type || "";

        const matchingAccount = accounts.find(
            (acc) => acc.account_name.toLowerCase() === extractedAccountName.toLowerCase()
        );

        const defaultAccount = extractedAccountName || accounts[0]?.account_name || "";
        const defaultAccountId =
            matchingAccount?.account_id ||
            (extractedAccountName ? null : accounts[0]?.account_id) ||
            null;

        return (result.transactions || []).map((txn, idx) => {
            const isTransfer =
                txn.category === "Transfer" ||
                txn.transfer_type ||
                (txn.description?.toLowerCase().includes("transfer") &&
                    (txn.description?.toLowerCase().includes("savings") ||
                        txn.description?.toLowerCase().includes("own account") ||
                        txn.description?.toLowerCase().includes("internal")));

            let expenseType = null;
            if (txn.type === "debit" && !isTransfer) {
                const inferred = inferExpenseType(txn.category, txn.description, txn.amount);
                expenseType = inferred || "needs";
            }

            return {
                ...txn,
                id: `preview-${idx}`,
                account: defaultAccount,
                accountId: defaultAccountId,
                seller: txn.merchant || "",
                location: txn.location || "",
                reference_no: "",
                tax_amount: 0,
                expenseType: expenseType,
                transfer_type: txn.transfer_type || (isTransfer ? "intra_person" : null),
                payer: "",
            };
        });
    };

    // Preview PDF
    const handlePreviewPdf = async (file) => {
        const token = localStorage.getItem("token");
        const pdfUrl = `${API_BASE_URL}/statement/${file.statementId}/view?token=${encodeURIComponent(token || "")}`;

        try {
            const response = await fetch(pdfUrl, { credentials: "include" });

            if (!response.ok) {
                let errorMessage = `The statement file "${file.fileName || "statement"}" could not be found.`;
                try {
                    const errorData = await response.json();
                    if (errorData.detail) errorMessage = errorData.detail;
                } catch {}
                showAlert(
                    "error",
                    "File Not Available",
                    errorMessage + " It may have been deleted or the file URL is invalid. Please try uploading the statement again."
                );
                return;
            }

            const contentType = response.headers.get("content-type");
            if (contentType && !contentType.includes("application/pdf") && !contentType.includes("image/")) {
                try {
                    const errorData = await response.json();
                    showAlert("error", "File Not Available", errorData.detail || "The statement file could not be loaded.");
                    return;
                } catch {}
            }

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            setPdfViewerDialog({
                isOpen: true,
                pdfUrl: blobUrl,
                fileName: file.fileName || "Statement.pdf",
            });
        } catch (error) {
            console.error("Error loading PDF:", error);
            showAlert("error", "Unable to Load Statement", "Failed to load the statement file. Please check your connection and try again.");
        }
    };

    // Process statement with AI
    const handleProcessStatement = async (file) => {
        setExtractingStatementId(file.statementId);
        setSelectedFile(file);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE_URL}/statement/preview/${file.statementId}`, {
                method: "POST",
                credentials: "include",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to extract transactions");
            }

            const result = await response.json();
            setExtractedTransactions(result);
            const transactionsWithDefaults = initializeTransactionsWithDefaults(result);
            setEditedPreviewTransactions(transactionsWithDefaults);
            setProcessedStatements((prev) => ({ ...prev, [file.statementId]: result }));
            await fetchStatementsByTab();
            setShowTransactions(true);
        } catch (error) {
            console.error("Extraction error:", error);
            showAlert("error", "Extraction Failed", `Failed to extract transactions: ${error.message}`);
        } finally {
            setExtractingStatementId(null);
        }
    };

    // View previously extracted transactions
    const handleViewExtractedTransactions = (file) => {
        const cachedData = processedStatements[file.statementId];
        if (cachedData) {
            setSelectedFile(file);
            setExtractedTransactions(cachedData);
            const transactionsWithDefaults = initializeTransactionsWithDefaults(cachedData);
            setEditedPreviewTransactions(transactionsWithDefaults);
            setShowTransactions(true);
        }
    };

    // Show rescan confirmation
    const showRescanConfirmation = (file) => {
        setRescanConfirmDialog({ isOpen: true, file: file });
    };

    // Rescan statement
    const handleRescanStatement = async () => {
        const file = rescanConfirmDialog.file;
        setRescanConfirmDialog({ isOpen: false, file: null });
        setExtractingStatementId(file.statementId);
        setSelectedFile(file);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${API_BASE_URL}/statement/preview/${file.statementId}?force_refresh=true`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to re-extract transactions");
            }

            const result = await response.json();
            setExtractedTransactions(result);
            const transactionsWithDefaults = initializeTransactionsWithDefaults(result);
            setEditedPreviewTransactions(transactionsWithDefaults);
            setProcessedStatements((prev) => ({ ...prev, [file.statementId]: result }));
            await fetchStatementsByTab();
            setShowTransactions(true);
            showAlert(
                "success",
                "Re-extraction Successful",
                `Re-extracted ${result.total_transactions} transactions with improved location detection!`
            );
        } catch (error) {
            console.error("Re-extraction error:", error);
            showAlert("error", "Re-extraction Failed", `Failed to re-extract transactions: ${error.message}`);
        } finally {
            setExtractingStatementId(null);
        }
    };

    // Import extracted transactions
    const handleImportTransactions = async () => {
        if (!editedPreviewTransactions || editedPreviewTransactions.length === 0) {
            showAlert("warning", "No Transactions", "No transactions to import");
            return;
        }

        if (!extractedTransactions?.account_info?.account_number) {
            showAlert("warning", "Missing Account Number", "Account number is missing. Cannot create account without account number.");
            return;
        }

        setIsImporting(true);
        setImportProgress(0);

        const token = localStorage.getItem("token");
        let successCount = 0;
        let failCount = 0;
        let skippedCount = 0;
        const errors = [];

        try {
            // Find or create account
            const accountInfo = extractedTransactions.account_info;
            let targetAccountId = null;

            const accountsResponse = await fetch(`${API_BASE_URL}/accounts/`, {
                method: "GET",
                credentials: "include",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (accountsResponse.ok) {
                const existingAccounts = await accountsResponse.json();
                const matchingAccount = existingAccounts.find(
                    (acc) => acc.account_no === accountInfo.account_number
                );
                if (matchingAccount) {
                    targetAccountId = matchingAccount.account_id;
                }
            }

            // Create credit card if needed
            const statementType = extractedTransactions?.statement_type;
            if (statementType === "credit_card" && accountInfo.account_number) {
                const cardNumber = accountInfo.account_number;
                const existingCard = creditCards.find((card) =>
                    card.card_number.endsWith(cardNumber.slice(-4))
                );

                if (!existingCard) {
                    const accountType = accountInfo.account_type?.toLowerCase() || "";
                    const accountName = accountInfo.account_name?.toLowerCase() || "";
                    let cardBrand = "Unknown";

                    if (accountType.includes("visa") || accountName.includes("visa")) {
                        cardBrand = "Visa";
                    } else if (accountType.includes("mastercard") || accountName.includes("mastercard")) {
                        cardBrand = "Mastercard";
                    } else if (accountType.includes("amex") || accountName.includes("american express")) {
                        cardBrand = "American Express";
                    }

                    let bankName = accountInfo.bank_name || "Unknown";
                    if (bankName === "Unknown") {
                        const commonBanks = ["Maybank", "CIMB", "Public Bank", "RHB", "Hong Leong", "AmBank", "HSBC", "Standard Chartered", "Citibank", "UOB", "Alliance Bank", "Affin Bank", "Bank Islam", "Bank Rakyat"];
                        for (const bank of commonBanks) {
                            if (accountName.includes(bank.toLowerCase()) || accountType.includes(bank.toLowerCase())) {
                                bankName = bank;
                                break;
                            }
                        }
                    }

                    const creditCardTerms = extractedTransactions?.credit_card_terms || {};
                    const createCardResponse = await fetch(`${API_BASE_URL}/cards/`, {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            user_id: 0,
                            card_number: cardNumber,
                            card_name: accountInfo.account_name || `${cardBrand} Credit Card`,
                            bank_name: bankName,
                            card_brand: cardBrand,
                            expiry_month: 12,
                            expiry_year: new Date().getFullYear() + 3,
                            credit_limit: creditCardTerms.credit_limit || 0.0,
                            annual_fee: creditCardTerms.annual_fee || 0.0,
                            current_balance: creditCardTerms.current_balance || 0.0,
                            next_payment_amount: creditCardTerms.minimum_payment || null,
                            next_payment_date: creditCardTerms.payment_due_date || null,
                            benefits: {},
                        }),
                    });

                    if (createCardResponse.ok) {
                        await fetchCreditCards();
                    }
                }
            }

            // Create account if it doesn't exist
            if (!targetAccountId) {
                const accountName = accountInfo.account_name || accountInfo.account_type || `Account ${accountInfo.account_number}`;
                const accountType = accountInfo.account_type?.toLowerCase().includes("savings")
                    ? "savings"
                    : accountInfo.account_type?.toLowerCase().includes("current")
                    ? "current"
                    : accountInfo.account_type?.toLowerCase().includes("credit")
                    ? "credit"
                    : "savings";

                const createAccountResponse = await fetch(`${API_BASE_URL}/accounts/`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        account_name: accountName,
                        account_type: accountType,
                        account_no: accountInfo.account_number,
                    }),
                });

                if (createAccountResponse.ok) {
                    const newAccount = await createAccountResponse.json();
                    targetAccountId = newAccount.account_id;
                } else {
                    throw new Error("Failed to create account");
                }
            }

            // Import transactions
            const totalTransactions = editedPreviewTransactions.length;

            for (let i = 0; i < totalTransactions; i++) {
                const txn = editedPreviewTransactions[i];
                setImportProgress(Math.round(((i + 1) / totalTransactions) * 100));

                try {
                    const isIncome = txn.type === "credit" || txn.type === "income";
                    const endpoint = isIncome ? "/transactions/income" : "/transactions/expense";

                    const transactionData = isIncome
                        ? {
                              account_id: targetAccountId,
                              amount: Math.abs(txn.amount),
                              description: txn.description || "",
                              category: txn.category || "Other",
                              date_received: txn.date,
                              payer: txn.payer || txn.merchant || "Unknown",
                              reference_no: txn.reference_no || null,
                              statement_id: extractedTransactions.statement_id,
                          }
                        : {
                              account_id: targetAccountId,
                              amount: Math.abs(txn.amount),
                              description: txn.description || "",
                              category: txn.category || "Other",
                              date_spent: txn.date,
                              seller: txn.seller || txn.merchant || "Unknown",
                              location: txn.location || null,
                              reference_no: txn.reference_no || null,
                              tax_amount: txn.tax_amount || 0,
                              expense_type: txn.expenseType || null,
                              statement_id: extractedTransactions.statement_id,
                          };

                    const txnResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(transactionData),
                    });

                    if (txnResponse.ok) {
                        successCount++;
                    } else if (txnResponse.status === 409) {
                        skippedCount++;
                    } else {
                        const errorData = await txnResponse.json();
                        throw new Error(errorData.detail || "Failed to create transaction");
                    }
                } catch (txnError) {
                    if (!txnError.message?.includes("409")) {
                        failCount++;
                        errors.push(`Row ${i + 1}: ${txnError.message}`);
                    }
                }
            }

            // Update account balance
            try {
                await fetch(`${API_BASE_URL}/statement/process/${extractedTransactions.statement_id}`, {
                    method: "POST",
                    credentials: "include",
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch {}

            // Show result
            setImportProgress(100);
            setTimeout(() => {
                if (failCount === 0 && skippedCount === 0) {
                    showAlert("success", "Import Successful", `Successfully imported ${successCount} transactions.`);
                } else if (failCount === 0 && skippedCount > 0) {
                    showAlert("success", "Import Completed", `Imported: ${successCount} transactions\nSkipped: ${skippedCount} (already exist)`);
                } else {
                    showAlert(
                        "warning",
                        "Import Completed with Issues",
                        `Imported: ${successCount}\nSkipped: ${skippedCount} (duplicates)\nFailed: ${failCount}\n\nErrors:\n${errors.slice(0, 5).join("\n")}${errors.length > 5 ? "\n..." : ""}`
                    );
                }

                fetchAccounts();
                setShowTransactions(false);
                setExtractedTransactions(null);
            }, 300);
        } catch (error) {
            console.error("Import error:", error);
            showAlert("error", "Import Failed", `Failed to import transactions:\n\n${error.message}`);
        } finally {
            setIsImporting(false);
            setImportProgress(0);
        }
    };

    // Handle force upload after duplicate detection
    const handleCancelDuplicate = () => {
        setDuplicateDialog({ isOpen: false, file: null, duplicateInfo: null });
        if (statementInputRef.current) statementInputRef.current.value = "";
    };

    const handleForceUpload = () => {
        const { file, statementType } = duplicateDialog;
        setDuplicateDialog({ isOpen: false, file: null, duplicateInfo: null });
        if (statementInputRef.current) statementInputRef.current.value = "";
        handleStatementUpload([file], true, statementType);
    };

    // Close transaction drawer
    const handleCloseTransactions = () => {
        setShowTransactions(false);
        setExtractedTransactions(null);
    };

    return (
        <div
            id="upload-statement-page"
            className="min-h-screen text-lg md:text-xl lg:text-2xl flex flex-col py-10 sm:py-12 md:py-16 lg:py-20"
            style={{
                background: brand.surface,
                margin: "0",
                border: "0",
                padding: "80px",
            }}
        >
            <div className="w-full">
                {/* Header section */}
                <div className="mb-8 sm:mb-12">
                    <div className="flex items-center gap-2 mb-4">
                        <h1
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-left"
                            style={{ color: brand.ink }}
                        >
                            Document Upload Center
                        </h1>
                    </div>
                    <p
                        className="font-medium text-2xl sm:text-3xl leading-relaxed text-left"
                        style={{ color: "rgba(4, 54, 44, 0.9)" }}
                    >
                        Upload your financial documents for comprehensive analysis and insights
                    </p>
                </div>

                {/* Upload Section */}
                <div className="space-y-4 sm:space-y-6">
                    <div className="space-y-6">
                        <StatementUploadZone
                            isDragOver={isDragOver}
                            setIsDragOver={setIsDragOver}
                            isProcessing={isProcessing}
                            onFileUpload={handleStatementUpload}
                            inputRef={statementInputRef}
                        />
                    </div>
                </div>

                {/* Uploaded Files List */}
                <StatementList
                    uploadedFiles={uploadedFiles}
                    isLoading={isLoading}
                    processedStatements={processedStatements}
                    extractingStatementId={extractingStatementId}
                    onRefresh={fetchStatementsByTab}
                    onProcess={handleProcessStatement}
                    onViewExtracted={handleViewExtractedTransactions}
                    onRescan={showRescanConfirmation}
                    onPreviewPdf={handlePreviewPdf}
                    onDelete={(file) => setDeleteConfirmDialog({ isOpen: true, file })}
                />

                {/* Transaction Preview Drawer */}
                <TransactionPreviewDrawer
                    showTransactions={showTransactions}
                    selectedFile={selectedFile}
                    extractedTransactions={extractedTransactions}
                    editedPreviewTransactions={editedPreviewTransactions}
                    accounts={accounts}
                    isImporting={isImporting}
                    importProgress={importProgress}
                    onClose={handleCloseTransactions}
                    onImport={handleImportTransactions}
                    setExtractedTransactions={setExtractedTransactions}
                    setEditedPreviewTransactions={setEditedPreviewTransactions}
                />

                {/* Duplicate Detection Dialog */}
                <DuplicateDialog
                    isOpen={duplicateDialog.isOpen}
                    duplicateInfo={duplicateDialog.duplicateInfo}
                    onClose={handleCancelDuplicate}
                    onForceUpload={handleForceUpload}
                />

                {/* PDF Viewer Dialog */}
                <PdfViewerDialog
                    isOpen={pdfViewerDialog.isOpen}
                    pdfUrl={pdfViewerDialog.pdfUrl}
                    fileName={pdfViewerDialog.fileName}
                    onClose={closePdfViewer}
                />

                {/* Rescan Confirmation Dialog */}
                <RescanConfirmDialog
                    isOpen={rescanConfirmDialog.isOpen}
                    onClose={() => setRescanConfirmDialog({ isOpen: false, file: null })}
                    onConfirm={handleRescanStatement}
                />

                {/* Alert Dialog */}
                <AlertDialog
                    isOpen={alertDialog.isOpen}
                    type={alertDialog.type}
                    title={alertDialog.title}
                    message={alertDialog.message}
                    onClose={() => setAlertDialog({ isOpen: false, type: "info", title: "", message: "" })}
                />

                {/* Delete Confirmation Dialog */}
                <ShadcnAlertDialog
                    open={deleteConfirmDialog.isOpen}
                    onOpenChange={(open) => !open && setDeleteConfirmDialog({ isOpen: false, file: null })}
                >
                    <AlertDialogContent className="bg-white">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Statement</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete "{deleteConfirmDialog.file?.name}"? This action cannot
                                be undone and will remove all associated data.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="px-6 py-3 rounded-xl border border-[#04362c]/20 bg-white text-base font-semibold text-[#04362c] hover:bg-[#04362c]/5 transition-all">
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteStatement}
                                className="px-6 py-3 rounded-xl bg-[#0DAD8D] text-white text-base font-semibold shadow-lg hover:bg-[#0DAD8D]/90 transition-all inline-flex items-center gap-2 justify-center"
                            >
                                <Trash2 className="w-5 h-5" />
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </ShadcnAlertDialog>
            </div>
        </div>
    );
}
