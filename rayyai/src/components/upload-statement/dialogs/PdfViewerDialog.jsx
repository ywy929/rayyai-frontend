import React from "react";
import { FileText, X } from "lucide-react";

/**
 * PdfViewerDialog - Modal for viewing PDF files
 */
function PdfViewerDialog({ isOpen, pdfUrl, fileName, onClose }) {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity duration-300"
                onClick={onClose}
            ></div>

            {/* PDF Viewer Modal */}
            <div className="fixed inset-4 md:inset-8 lg:inset-12 z-50 flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#04362c] to-[#0DAD8D] text-white border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">PDF Viewer</h3>
                            <p className="text-sm text-white/80">{fileName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* PDF Content */}
                <div className="flex-1 overflow-hidden bg-gray-100">
                    <iframe
                        src={pdfUrl}
                        className="w-full h-full"
                        title="PDF Viewer"
                        style={{ border: "none" }}
                    />
                </div>
            </div>
        </>
    );
}

export default PdfViewerDialog;
