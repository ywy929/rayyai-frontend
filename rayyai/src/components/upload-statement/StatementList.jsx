import React from "react";
import { FileText, FileUp, RefreshCw } from "lucide-react";
import { brand } from "./constants";
import StatementListItem from "./StatementListItem";

/**
 * StatementList - Displays list of uploaded statements with actions
 */
function StatementList({
    uploadedFiles,
    isLoading,
    processedStatements,
    extractingStatementId,
    onRefresh,
    onProcess,
    onViewExtracted,
    onRescan,
    onPreviewPdf,
    onDelete,
}) {
    return (
        <div
            id="statement-list-section"
            className="bg-white/95 backdrop-blur-sm rounded-xl border shadow-xl"
            style={{ borderColor: brand.ink + "33" }}
        >
            <div
                className="px-4 sm:px-6 py-4 border-b"
                style={{ borderColor: brand.ink + "33" }}
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2
                            className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2"
                            style={{ color: brand.ink }}
                        >
                            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                            Your Documents
                        </h2>
                        <p
                            className="text-sm sm:text-base mt-1"
                            style={{ color: brand.ink + "CC" }}
                        >
                            View and manage your financial statements
                        </p>
                    </div>
                    <button
                        onClick={onRefresh}
                        disabled={isLoading}
                        className="p-3 hover:bg-gray-200 rounded-full transition-all duration-200 hover:scale-110 hover:shadow-md flex-shrink-0 disabled:opacity-50 focus:outline-none focus:ring-0 border-0"
                        title="Refresh"
                    >
                        <RefreshCw
                            className={`w-6 h-6 text-[#04362c] ${isLoading ? "animate-spin" : ""}`}
                        />
                    </button>
                </div>
            </div>
            <div className="p-4 sm:p-6">
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <RefreshCw
                                className="w-12 h-12 mx-auto mb-4 animate-spin"
                                style={{ color: brand.ink + "99" }}
                            />
                            <p style={{ color: brand.ink + "CC" }}>
                                Loading statements...
                            </p>
                        </div>
                    ) : uploadedFiles.length === 0 ? (
                        <div
                            className="text-center py-12 rounded-lg border"
                            style={{
                                borderColor: brand.ink + "33",
                                backgroundColor: brand.surface,
                            }}
                        >
                            <FileUp
                                className="w-16 h-16 mx-auto mb-4"
                                style={{ color: brand.ink + "99" }}
                            />
                            <p
                                className="font-medium mb-2"
                                style={{ color: brand.ink + "CC" }}
                            >
                                No financial statements uploaded yet
                            </p>
                            <p
                                className="text-sm"
                                style={{ color: brand.ink + "B3" }}
                            >
                                Upload your bank statements, credit cards, or e-wallet statements to get started
                            </p>
                        </div>
                    ) : (
                        uploadedFiles.map((file) => (
                            <StatementListItem
                                key={file.id}
                                file={file}
                                isProcessed={!!processedStatements[file.statementId]}
                                isExtracting={extractingStatementId === file.statementId}
                                onProcess={onProcess}
                                onViewExtracted={onViewExtracted}
                                onRescan={onRescan}
                                onPreviewPdf={onPreviewPdf}
                                onDelete={onDelete}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default StatementList;
