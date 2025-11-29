import React from "react";
import { PenTool, Upload } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import AIAssistedEntry from "./AIAssistedEntry";
import ManualEntryForm from "./ManualEntryForm";

/**
 * AddTransactionDialog - Dialog for selecting entry method and adding transactions
 */
function AddTransactionDialog({
    open,
    onOpenChange,
    entryMethod,
    onMethodSelect,
    onSave,
    accounts,
}) {
    if (entryMethod === "selection") {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl border-2 border-[#04362c]/30 transition-all duration-500 ease-in-out animate-in fade-in-0 zoom-in-95">
                    <DialogHeader>
                        <div className="text-center animate-in fade-in-0 slide-in-from-top-4 duration-500">
                            <DialogTitle className="text-lg sm:text-xl font-bold text-[#04362c]">
                                Add New Transaction
                            </DialogTitle>
                            <DialogDescription className="text-sm text-[#04362c]/70 mt-1">
                                Choose how you'd like to add your transaction
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <div className="py-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-100">
                        <div className="grid grid-cols-2 gap-6">
                            {/* Manual Entry Card */}
                            <button
                                onClick={() => onMethodSelect("manual")}
                                className="flex flex-col items-center p-6 bg-white border-2 border-[#04362c]/20 rounded-lg transition-all cursor-pointer group hover:bg-gray-50 hover:border-[#04362c]/40"
                            >
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                                    <PenTool className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="font-medium text-lg mb-2 text-[#04362c]">
                                    Manual Entry
                                </h3>
                                <p className="text-sm text-[#04362c]/70 text-center leading-relaxed">
                                    Fill in all transaction details manually and
                                    optionally attach a receipt
                                </p>
                            </button>

                            {/* AI-Assisted Entry Card */}
                            <button
                                onClick={() => onMethodSelect("ai-assisted")}
                                className="flex flex-col items-center p-6 bg-white border-2 border-[#04362c]/20 rounded-lg transition-all cursor-pointer group hover:bg-gray-50 hover:border-[#04362c]/40"
                            >
                                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                                    <Upload className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="font-medium text-lg mb-2 text-[#04362c]">
                                    AI-Assisted Entry
                                </h3>
                                <p className="text-sm text-[#04362c]/70 text-center leading-relaxed">
                                    Upload a receipt and let AI extract the
                                    details for you to verify
                                </p>
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (entryMethod === "ai-assisted") {
        return (
            <AIAssistedEntry
                open={open}
                onOpenChange={onOpenChange}
                onSave={onSave}
                onBack={() => onMethodSelect("selection")}
                accounts={accounts}
            />
        );
    }

    return (
        <ManualEntryForm
            open={open}
            onOpenChange={onOpenChange}
            onSave={onSave}
            onBack={() => onMethodSelect("selection")}
            accounts={accounts}
        />
    );
}

export default AddTransactionDialog;
