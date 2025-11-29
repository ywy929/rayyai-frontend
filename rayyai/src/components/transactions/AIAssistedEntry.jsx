import React, { useState } from "react";
import { Upload, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { scannerApi } from "@/services/api";
import AIReviewForm from "./AIReviewForm";

/**
 * AIAssistedEntry - Upload receipt and let AI extract transaction details
 */
function AIAssistedEntry({ open, onOpenChange, onSave, onBack, accounts = [] }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scannedData, setScannedData] = useState(null);
    const [error, setError] = useState(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                setError("Please select an image file (PNG, JPG, JPEG)");
                return;
            }

            setSelectedFile(file);
            setError(null);

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleScan = async () => {
        if (!selectedFile) {
            setError("Please select a file first");
            return;
        }

        setIsScanning(true);
        setError(null);

        try {
            const result = await scannerApi.scanReceipt(selectedFile);

            const mappedData = {
                date: result.date,
                description: result.description || `Purchase from ${result.merchant}`,
                amount: Math.abs(result.amount),
                category: result.category || "Other",
                type: "expense",
                needOrWant: "need",
                account: accounts.length > 0 ? accounts[0].account_name : "",
                accountId: accounts.length > 0 ? accounts[0].account_id : null,
                supplier: result.merchant || "",
                location: "",
                reference: result.reference || "",
                department: "",
                project: "",
            };

            setScannedData(mappedData);
        } catch (err) {
            console.error("Scan error:", err);
            if (err.status === 401) {
                setError("Session expired. Please refresh the page and log in again.");
            } else {
                setError(err.message || "Failed to scan receipt. Please try again.");
            }
        } finally {
            setIsScanning(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setPreview(null);
        setScannedData(null);
        setError(null);
        onOpenChange(false);
    };

    if (scannedData) {
        return (
            <AIReviewForm
                open={open}
                onOpenChange={handleClose}
                scannedData={scannedData}
                onSave={onSave}
                onBack={() => setScannedData(null)}
                accounts={accounts}
            />
        );
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md border-2 border-[#04362c]/30 transition-all duration-500 ease-in-out animate-in fade-in-0 zoom-in-95">
                <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl font-bold text-[#04362c] animate-in fade-in-0 slide-in-from-top-4 duration-500">
                        AI-Assisted Entry
                    </DialogTitle>
                    <DialogDescription className="text-sm text-[#04362c]/70 mt-1 animate-in fade-in-0 duration-500 delay-75">
                        Upload a receipt and let AI extract the details
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-150">
                    {!preview ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors">
                            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="font-medium mb-2">Upload Receipt</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Select an image of your receipt
                            </p>
                            <label className="inline-block px-4 py-2 border border-gray-300 rounded-lg cursor-pointer font-medium hover:shadow-md transition-shadow">
                                Select File
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden">
                                <img
                                    src={preview}
                                    alt="Receipt preview"
                                    className="w-full h-64 object-contain bg-gray-50"
                                />
                                <button
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setPreview(null);
                                    }}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <button
                                onClick={handleScan}
                                disabled={isScanning}
                                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isScanning ? (
                                    <>
                                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                        Scanning...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-5 w-5" />
                                        Scan Receipt with AI
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onBack}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:shadow-md transition-shadow"
                        >
                            Back
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default AIAssistedEntry;
