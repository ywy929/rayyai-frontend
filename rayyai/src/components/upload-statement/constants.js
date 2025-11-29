/**
 * Upload Statement Constants
 * Shared configuration and helper functions for statement upload components
 */

// Brand tokens for consistent styling
export const brand = {
    ink: "#04362c",
    mint: "#0DAD8D",
    surface: "#eef2f0",
    ring: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0DAD8D]",
};

// Category lists for transaction classification
export const expenseCategories = [
    "Housing",
    "Groceries",
    "Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Healthcare",
    "Bills & Utilities",
    "Education",
    "Travel",
    "Insurance",
    "Personal Care",
    "Other",
];

export const incomeCategories = [
    "Salary",
    "Freelance",
    "Business",
    "Investments",
    "Gifts",
    "Refunds",
    "Transfer",
    "Other",
];

/**
 * Infers expense type (wants vs needs) based on category and description
 * Matches the backend logic in routers/transactions.py
 */
export const inferExpenseType = (category, description, amount) => {
    if (!category && !description) return "needs";

    const text = `${category || ""} ${description || ""}`.toLowerCase();

    // Check for transfers - return null (will be handled as transfer type)
    const transferKeywords = [
        "transfer", "savings", "saving", "own account", "self transfer", "internal transfer",
        "tabung", "asb", "sspni", "ssp1m", "stash", "goal transfer", "auto-save"
    ];
    if (transferKeywords.some(keyword => text.includes(keyword))) {
        return null;
    }

    // Shopping is always wants
    if (category === "Shopping" || category?.toLowerCase() === "shopping") {
        return "wants";
    }
    const shoppingKeywords = [
        "shopping", "shop", "mall", "purchase", "buy", "retail", "store",
        "fashion", "clothing", "apparel", "online shopping", "e-commerce", "marketplace"
    ];
    if (shoppingKeywords.some(keyword => text.includes(keyword))) {
        return "wants";
    }

    // Dining - always wants if clearly dining out, or if amount > 50
    const diningKeywords = [
        "restaurant", "cafe", "bistro", "dining", "dine", "food court",
        "foodcourt", "takeout", "dining out"
    ];
    const isDining = diningKeywords.some(keyword => text.includes(keyword));
    if (isDining) {
        if (amount === undefined || amount === null || Math.abs(amount) > 50) {
            return "wants";
        }
        if (["restaurant", "cafe", "bistro", "dining out", "takeout"].some(keyword => text.includes(keyword))) {
            return "wants";
        }
    }

    // Other wants keywords
    const wantsKeywords = [
        "entertainment", "travel", "personal care", "gym", "fitness",
        "spa", "salon", "beauty", "cinema", "movie", "game"
    ];
    if (wantsKeywords.some(keyword => text.includes(keyword))) {
        return "wants";
    }

    // Default to needs
    return "needs";
};

/**
 * Formats bytes into human-readable file size
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Formats filename for display (removes underscores, extensions, adds spaces)
 */
export const formatFileName = (fileName) => {
    if (!fileName) return "";
    // Remove file extension
    let formatted = fileName.replace(/\.[^/.]+$/, "");
    // Replace underscores with spaces
    formatted = formatted.replace(/_/g, " ");
    // Add space before capital letters that follow lowercase
    formatted = formatted.replace(/([a-z])([A-Z])/g, "$1 $2");
    // Add space before numbers that follow letters
    formatted = formatted.replace(/([a-zA-Z])(\d)/g, "$1 $2");
    // Add space after numbers that are followed by letters
    formatted = formatted.replace(/(\d)([a-zA-Z])/g, "$1 $2");
    return formatted;
};

/**
 * Returns drag-over CSS classes based on state
 */
export const getDragOverClasses = (isDragOver) => {
    return isDragOver
        ? "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 border-primary-foreground bg-primary-foreground/10 shadow-lg"
        : "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 border-gray-300";
};
