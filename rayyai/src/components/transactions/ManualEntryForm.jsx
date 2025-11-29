import React, { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { expenseCategories, incomeCategories, getDefaultFormData } from "./constants";

/**
 * ManualEntryForm - Form for manually entering transaction details
 */
function ManualEntryForm({ open, onOpenChange, onSave, onBack, accounts = [] }) {
    const [formData, setFormData] = useState(getDefaultFormData(accounts));

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.description || !formData.amount) {
            alert("Please fill in all required fields");
            return;
        }

        if (formData.type === "expense" && !formData.seller) {
            alert("Please enter the seller/merchant name");
            return;
        }

        if (formData.type === "income" && !formData.payer) {
            alert("Please enter the payer name");
            return;
        }

        const transaction = {
            ...formData,
            amount:
                formData.type === "expense"
                    ? -Math.abs(parseFloat(formData.amount))
                    : Math.abs(parseFloat(formData.amount)),
            taxAmount: formData.taxAmount ? parseFloat(formData.taxAmount) : 0,
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
                    <DialogTitle className="text-lg sm:text-xl font-bold text-[#04362c] animate-in fade-in-0 slide-in-from-top-4 duration-500">
                        Add Transaction
                    </DialogTitle>
                    <DialogDescription className="text-sm text-[#04362c]/70 mt-1 animate-in fade-in-0 duration-500 delay-75">
                        Enter the transaction details below
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-150">
                    {/* Date and Type row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[#04362c]/90 mb-1">
                                Date *
                            </label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleChange("date", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#04362c]/90 mb-1">
                                Type *
                            </label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => handleChange("type", value)}
                            >
                                <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[#04362c] bg-white hover:bg-white focus:bg-white">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="expense" className="text-[#04362c] focus:bg-accent/30 focus:text-[#04362c] hover:bg-accent/30">
                                        Expense
                                    </SelectItem>
                                    <SelectItem value="income" className="text-[#04362c] focus:bg-accent/30 focus:text-[#04362c] hover:bg-accent/30">
                                        Income
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Need or Want - Only show for expenses */}
                    {formData.type === "expense" && (
                        <div>
                            <label className="block text-sm font-medium text-[#04362c]/90 mb-1">
                                Need or Want *
                            </label>
                            <Select
                                value={formData.needOrWant}
                                onValueChange={(value) => handleChange("needOrWant", value)}
                            >
                                <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[#04362c] bg-white hover:bg-white focus:bg-white">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="need" className="text-[#04362c] focus:bg-accent/30 focus:text-[#04362c] hover:bg-accent/30">
                                        Need
                                    </SelectItem>
                                    <SelectItem value="want" className="text-[#04362c] focus:bg-accent/30 focus:text-[#04362c] hover:bg-accent/30">
                                        Want
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-[#04362c]/90 mb-1">
                            Description *
                        </label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            placeholder="e.g., Grocery shopping"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                            required
                        />
                    </div>

                    {/* Amount and Category row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[#04362c]/90 mb-1">
                                Amount (RM) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.amount}
                                onChange={(e) => handleChange("amount", e.target.value)}
                                placeholder="0.00"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#04362c]/90 mb-1">
                                Category *
                            </label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => handleChange("category", value)}
                            >
                                <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[#04362c] bg-white hover:bg-white focus:bg-white">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(formData.type === "income" ? incomeCategories : expenseCategories).map((category) => (
                                        <SelectItem
                                            key={category}
                                            value={category}
                                            className="text-[#04362c] focus:bg-accent/30 focus:text-[#04362c] hover:bg-accent/30"
                                        >
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Account */}
                    <div>
                        <label className="block text-sm font-medium text-[#04362c]/90 mb-1">
                            Account *
                        </label>
                        <Select
                            value={formData.account}
                            onValueChange={(value) => {
                                const selectedAccount = accounts.find(
                                    (acc) => acc.account_name === value
                                );
                                setFormData((prev) => ({
                                    ...prev,
                                    account: value,
                                    accountId: selectedAccount?.account_id || null,
                                }));
                            }}
                        >
                            <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[#04362c] bg-white hover:bg-white focus:bg-white">
                                <SelectValue placeholder="Account" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map((account) => (
                                    <SelectItem
                                        key={account.account_id}
                                        value={account.account_name}
                                        className="text-[#04362c] focus:bg-accent/30 focus:text-[#04362c] hover:bg-accent/30"
                                    >
                                        {account.account_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Expense-specific fields */}
                    {formData.type === "expense" && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-[#04362c]/90 mb-1">
                                    Seller/Merchant *
                                </label>
                                <input
                                    type="text"
                                    value={formData.seller}
                                    onChange={(e) => handleChange("seller", e.target.value)}
                                    placeholder="e.g., Walmart, Amazon"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#04362c]/90 mb-1">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => handleChange("location", e.target.value)}
                                        placeholder="e.g., New York, Store #123"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#04362c]/90 mb-1">
                                        Reference Number
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.referenceNo}
                                        onChange={(e) => handleChange("referenceNo", e.target.value)}
                                        placeholder="e.g., INV-12345"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#04362c]/90 mb-1">
                                    Tax Amount ($)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.taxAmount}
                                    onChange={(e) => handleChange("taxAmount", e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="taxDeductible"
                                        checked={formData.taxDeductible}
                                        onCheckedChange={(checked) => handleChange("taxDeductible", checked)}
                                    />
                                    <label htmlFor="taxDeductible" className="text-sm font-medium text-[#04362c]/90 cursor-pointer">
                                        Tax Deductible
                                    </label>
                                </div>
                                <div className="flex items-center gap-2 flex-row-reverse">
                                    <Checkbox
                                        id="isReimbursable"
                                        checked={formData.isReimbursable}
                                        onCheckedChange={(checked) => handleChange("isReimbursable", checked)}
                                    />
                                    <label htmlFor="isReimbursable" className="text-sm font-medium text-[#04362c]/90 cursor-pointer">
                                        Reimbursable
                                    </label>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Income-specific fields */}
                    {formData.type === "income" && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-[#04362c]/90 mb-1">
                                    Payer *
                                </label>
                                <input
                                    type="text"
                                    value={formData.payer}
                                    onChange={(e) => handleChange("payer", e.target.value)}
                                    placeholder="e.g., Employer Name, Client Name"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#04362c]/90 mb-1">
                                        Department
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.department}
                                        onChange={(e) => handleChange("department", e.target.value)}
                                        placeholder="e.g., Engineering, Sales"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#04362c]/90 mb-1">
                                        Project
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.project}
                                        onChange={(e) => handleChange("project", e.target.value)}
                                        placeholder="e.g., Project Alpha"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#04362c]/90 mb-1">
                                    Reference Number
                                </label>
                                <input
                                    type="text"
                                    value={formData.referenceNo}
                                    onChange={(e) => handleChange("referenceNo", e.target.value)}
                                    placeholder="e.g., PAY-12345"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                                />
                            </div>
                        </>
                    )}

                    {/* Footer Buttons */}
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
                            Add Transaction
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default ManualEntryForm;
