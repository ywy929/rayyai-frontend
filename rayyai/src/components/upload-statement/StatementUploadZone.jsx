import React, { useCallback } from "react";
import { FileUp, CreditCard, Loader } from "lucide-react";
import { brand, getDragOverClasses } from "./constants";

/**
 * StatementUploadZone - Drag and drop upload area for financial statements
 */
function StatementUploadZone({
    isDragOver,
    setIsDragOver,
    isProcessing,
    onFileUpload,
    inputRef,
}) {
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(true);
    }, [setIsDragOver]);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
    }, [setIsDragOver]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        onFileUpload(files);
    }, [setIsDragOver, onFileUpload]);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        onFileUpload(files);
    };

    return (
        <div
            className="bg-white/95 backdrop-blur-sm rounded-xl border shadow-xl mb-10"
            style={{ borderColor: brand.ink + "33" }}
        >
            <div
                className="px-4 sm:px-6 py-4 border-b"
                style={{ borderColor: brand.ink + "33" }}
            >
                <h2
                    className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2"
                    style={{ color: brand.ink }}
                >
                    <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 pt-1" />
                    Upload Financial Statements
                </h2>
                <p
                    className="text-sm sm:text-base mt-1"
                    style={{ color: brand.ink + "CC" }}
                >
                    Bank statements, credit card statements, and other financial documents
                </p>
            </div>
            <div className="p-4 sm:p-6">
                <div
                    className={getDragOverClasses(isDragOver)}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <FileUp
                        className="w-16 h-16 mx-auto mb-4"
                        style={{ color: brand.ink }}
                    />
                    <h3 className="mb-2 font-medium" style={{ color: brand.ink }}>
                        Upload Financial Documents
                    </h3>
                    <p className="mb-4" style={{ color: brand.ink + "CC" }}>
                        Drag and drop your bank statements, credit card statements, or click to browse
                    </p>
                    <div className="space-y-2 mb-4">
                        <p className="text-xs" style={{ color: brand.ink + "B3" }}>
                            Supported formats: PDF, JPG, PNG
                        </p>
                        <p className="text-xs" style={{ color: brand.ink + "CC" }}>
                            Maximum file size: 10MB per file
                        </p>
                    </div>
                    <input
                        ref={inputRef}
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="statement-upload"
                    />
                    <label
                        htmlFor="statement-upload"
                        className="px-6 py-3 rounded-lg cursor-pointer transition-all flex items-center gap-2 w-fit mx-auto font-semibold shadow-md hover:shadow-lg"
                        style={{
                            backgroundColor: brand.ink,
                            color: "#ffffff",
                        }}
                    >
                        <FileUp className="w-5 h-5" /> Choose Files
                    </label>
                </div>

                {isProcessing && (
                    <div
                        className="mt-4 p-4 rounded-lg flex items-center justify-center gap-3"
                        style={{ backgroundColor: brand.mint + "1A" }}
                    >
                        <Loader
                            className="w-5 h-5 animate-spin"
                            style={{ color: brand.mint }}
                        />
                        <p className="text-sm" style={{ color: brand.ink }}>
                            Processing uploaded files... This may take a few moments.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StatementUploadZone;
