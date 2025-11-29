import React from "react";
import { RefreshCw, X } from "lucide-react";

/**
 * RescanConfirmDialog - Confirmation dialog for re-scanning a statement
 */
function RescanConfirmDialog({ isOpen, onClose, onConfirm }) {
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
                {/* Header with Icon and Close Button */}
                <div className="relative px-5 pt-5 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                        {/* Icon */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
                            <RefreshCw className="w-5 h-5 text-blue-600" />
                        </div>
                        {/* Title */}
                        <div className="flex-1">
                            <h3 className="text-base font-bold text-[#04362c]">
                                Re-scan this statement?
                            </h3>
                        </div>
                        {/* Close Button */}
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
                    <p className="text-sm text-gray-600 mb-3">This will:</p>
                    <ul className="text-sm text-gray-600 space-y-2 ml-4">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>Re-extract transactions using the latest AI</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>Replace the cached preview data</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>Allow you to review and import fresh results</span>
                        </li>
                    </ul>
                    <p className="text-xs text-gray-500 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <strong>Note:</strong> Duplicate prevention will skip already imported transactions.
                    </p>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-5 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Rescan
                    </button>
                </div>
            </div>
        </>
    );
}

export default RescanConfirmDialog;
