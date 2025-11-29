import React from "react";
import { AlertTriangle, X } from "lucide-react";

/**
 * DuplicateDialog - Shows when a duplicate file is detected
 */
function DuplicateDialog({
    isOpen,
    duplicateInfo,
    onClose,
    onForceUpload,
}) {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
                onClick={onClose}
            ></div>

            {/* Dialog */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fade-in">
                {/* Header with Close Button */}
                <div className="relative px-5 pt-5 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                        <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-base font-bold text-[#04362c]">
                                Duplicate File Detected
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                This file already exists in your records
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-5 py-4">
                    <p className="text-sm text-gray-600 mb-3">
                        This file has already been uploaded previously. Here are the details:
                    </p>

                    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 space-y-2.5 border border-gray-200/50">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-gray-600">
                                Statement ID
                            </span>
                            <span className="text-sm text-[#04362c] font-medium">
                                {duplicateInfo?.statement_id}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-gray-600">
                                Type
                            </span>
                            <span className="text-sm text-[#04362c] font-medium capitalize">
                                {duplicateInfo?.statement_type}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-gray-600">
                                Uploaded
                            </span>
                            <span className="text-sm text-[#04362c] font-medium">
                                {duplicateInfo?.date_uploaded
                                    ? new Date(duplicateInfo.date_uploaded).toLocaleDateString("en-GB")
                                    : "N/A"}
                            </span>
                        </div>
                        {duplicateInfo?.period_start && duplicateInfo?.period_end && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-600">
                                    Period
                                </span>
                                <span className="text-sm text-[#04362c] font-medium">
                                    {new Date(duplicateInfo.period_start).toLocaleDateString("en-GB")} -{" "}
                                    {new Date(duplicateInfo.period_end).toLocaleDateString("en-GB")}
                                </span>
                            </div>
                        )}
                        {duplicateInfo?.credit_score && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-600">
                                    Credit Score
                                </span>
                                <span className="text-sm text-[#04362c] font-medium">
                                    {duplicateInfo.credit_score}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-amber-800 text-xs font-medium">
                            Uploading this file again will create a duplicate entry in your records.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="px-5 pb-5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-sm border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onForceUpload}
                        className="flex-1 px-4 py-2 text-sm bg-[#0DAD8D] text-white rounded-xl font-semibold hover:bg-[#0a9374] transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        Upload Anyway
                    </button>
                </div>
            </div>
        </>
    );
}

export default DuplicateDialog;
