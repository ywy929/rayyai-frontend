import React, { useState } from "react";
import { Upload } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { expenseCategories, incomeCategories } from "./constants";

/**
 * AIReviewForm - Form to review and edit AI-scanned transaction data
 */
function AIReviewForm({ open, onOpenChange, scannedData, onSave, onBack, accounts = [] }) {
    const [formData, setFormData] = useState(scannedData);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.description || !formData.amount) {
            alert("Please fill in all required fields");
            return;
        }

        const transaction = {
            ...formData,
            amount:
                formData.type === "expense"
                    ? -Math.abs(parseFloat(formData.amount))
                    : Math.abs(parseFloat(formData.amount)),
        };

        onSave(transaction);
    };

    const handleChange = (field, value) => {
        setFormData((prev) => {
            const updated = {
                ...prev,
                [field]: value,
            };

            if (field === "type") {
                updated.category =
                    value === "income"
                        ? incomeCategories[0]
                        : expenseCategories[0];
            }

            return updated;
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-[#04362c]/30 transition-all duration-500 ease-in-out animate-in fade-in-0 zoom-in-95">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-[#04362c] animate-in fade-in-0 slide-in-from-top-4 duration-500">
                        Review Scanned Transaction
                    </DialogTitle>
                    <DialogDescription className="text-sm text-[#04362c]/70 animate-in fade-in-0 duration-500 delay-75">
                        AI extracted the following details. Please verify and edit if needed.
                    </DialogDescription>
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2 animate-in fade-in-0 duration-500 delay-100">
                        <Upload className="h-4 w-4" />
                        Extracted with AI Vision (Gemini)
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-150">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date *
                            </label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleChange("date", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type *
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => handleChange("type", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                            >
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                        </div>
                    </div>

                    {formData.type === "expense" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Need or Want *
                            </label>
                            <Select
                                value={formData.needOrWant}
                                onValueChange={(value) => handleChange("needOrWant", value)}
                            >
                                <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="need">Need</SelectItem>
                                    <SelectItem value="want">Want</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description *
                        </label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Amount (RM) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.amount}
                                onChange={(e) => handleChange("amount", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category *
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => handleChange("category", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                            >
                                {(formData.type === "income" ? incomeCategories : expenseCategories).map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Account *
                        </label>
                        <select
                            value={formData.account}
                            onChange={(e) => {
                                const selectedAccount = accounts.find(
                                    (acc) => acc.account_name === e.target.value
                                );
                                setFormData((prev) => ({
                                    ...prev,
                                    account: e.target.value,
                                    accountId: selectedAccount?.account_id || null,
                                }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        >
                            {accounts.map((account) => (
                                <option
                                    key={account.account_id || account.id}
                                    value={account.account_name || account.name}
                                >
                                    {account.account_name || account.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {formData.type === "expense" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Seller/Merchant
                            </label>
                            <input
                                type="text"
                                value={formData.supplier || ""}
                                onChange={(e) => handleChange("supplier", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                            />
                        </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onBack}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:shadow-md transition-shadow"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-[#04362c] text-white rounded-lg hover:bg-[#04362c]/90 font-medium transition-colors"
                        >
                            Save Transaction
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default AIReviewForm;
