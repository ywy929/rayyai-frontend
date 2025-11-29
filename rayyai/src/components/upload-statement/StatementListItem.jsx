import React from "react";
import {
    FileUp,
    CreditCard,
    FileText,
    Eye,
    Trash2,
    RefreshCw,
    Building2,
} from "lucide-react";
import { brand, formatFileName } from "./constants";

/**
 * Returns file type info with icon, label, and styling
 */
const getFileTypeInfo = (type) => {
    switch (type) {
        case "bank":
            return {
                icon: <Building2 className="w-6 h-6" style={{ color: brand.ink }} />,
                label: "Bank Statement",
                color: "bg-blue-100 text-blue-800",
            };
        case "credit":
            return {
                icon: <CreditCard className="w-6 h-6" style={{ color: brand.ink }} />,
                label: "Credit Card",
                color: "bg-purple-100 text-purple-800",
            };
        case "ewallet":
            return {
                icon: <FileText className="w-6 h-6" style={{ color: brand.ink }} />,
                label: "E-Wallet",
                color: "bg-green-100 text-green-800",
            };
        case "receipt":
            return {
                icon: <FileText className="w-6 h-6" style={{ color: brand.ink }} />,
                label: "Receipt",
                color: "bg-orange-100 text-orange-800",
            };
        default:
            return {
                icon: <FileText className="w-6 h-6" style={{ color: brand.ink }} />,
                label: "Document",
                color: "bg-gray-100 text-[#04362c]/90",
            };
    }
};

/**
 * StatementListItem - Individual statement row in the list
 */
function StatementListItem({
    file,
    isProcessed,
    isExtracting,
    onProcess,
    onViewExtracted,
    onRescan,
    onPreviewPdf,
    onDelete,
}) {
    const typeInfo = getFileTypeInfo(file.type);

    return (
        <div
            className="p-4 sm:p-6 rounded-lg border hover:shadow-lg transition-all duration-300 bg-white"
            style={{ borderColor: brand.ink + "33" }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center">
                        {typeInfo.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="font-medium" style={{ color: brand.ink }}>
                                {formatFileName(file.name)}
                            </p>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${typeInfo.color}`}>
                                {typeInfo.label}
                            </span>
                        </div>
                        <div
                            className="flex items-center gap-2 text-sm flex-wrap"
                            style={{ color: brand.ink + "CC" }}
                        >
                            <span>
                                Uploaded {file.uploadDate.toLocaleDateString("en-GB")}
                            </span>
                            {file.dateRange && (
                                <>
                                    <span>•</span>
                                    <span>{file.dateRange}</span>
                                </>
                            )}
                            {file.reportDate && (
                                <>
                                    <span>•</span>
                                    <span>{file.reportDate}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {file.status === "completed" && (
                        <div className="flex flex-wrap gap-2">
                            {/* Process button for bank/credit/ewallet statements */}
                            {(file.type === "bank" || file.type === "credit" || file.type === "ewallet") &&
                                !isProcessed && (
                                    <button
                                        onClick={() => onProcess(file)}
                                        disabled={isExtracting}
                                        className="px-3 py-1 text-sm bg-[#04362c] text-white rounded-md hover:bg-[#04362c]/90 transition-colors flex items-center gap-1 disabled:bg-gray-400"
                                    >
                                        {isExtracting ? (
                                            <>
                                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <FileUp className="w-4 h-4" />
                                                Process
                                            </>
                                        )}
                                    </button>
                                )}
                            {/* Preview Extracted button - shows after processing */}
                            {(file.type === "bank" || file.type === "credit" || file.type === "ewallet") &&
                                isProcessed && (
                                    <>
                                        <button
                                            onClick={() => onViewExtracted(file)}
                                            className="px-3 py-1 text-sm border border-[#04362c] text-[#04362c] rounded-md hover:bg-[#04362c]/10 transition-colors flex items-center gap-1"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Preview Extracted
                                        </button>
                                        {/* Rescan button */}
                                        <button
                                            onClick={() => onRescan(file)}
                                            disabled={isExtracting}
                                            className="px-3 py-1 text-sm border border-[#0DAD8D] text-[#0DAD8D] rounded-md hover:bg-[#0DAD8D]/10 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Re-extract transactions from this statement"
                                        >
                                            {isExtracting ? (
                                                <>
                                                    <div className="animate-spin h-4 w-4 border-2 border-[#0DAD8D] border-t-transparent rounded-full"></div>
                                                    Rescanning...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw className="w-4 h-4" />
                                                    Rescan
                                                </>
                                            )}
                                        </button>
                                    </>
                                )}
                            {/* View PDF button */}
                            <button
                                onClick={() => onPreviewPdf(file)}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1"
                            >
                                <Eye className="w-4 h-4" />
                                View PDF
                            </button>
                            {/* Delete button */}
                            <button
                                onClick={() => onDelete(file)}
                                className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors flex items-center gap-1"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StatementListItem;
