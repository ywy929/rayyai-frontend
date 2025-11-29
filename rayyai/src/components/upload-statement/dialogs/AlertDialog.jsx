import React from "react";
import { CheckCircle2, XCircle, CircleAlert, Info, X } from "lucide-react";

/**
 * AlertDialog - Generic alert dialog for success, error, warning, and info messages
 */
function AlertDialog({ isOpen, type, title, message, onClose }) {
    if (!isOpen) return null;

    const getIconBackground = () => {
        switch (type) {
            case "success":
                return "bg-green-100";
            case "error":
                return "bg-red-100";
            case "warning":
                return "bg-amber-100";
            default:
                return "bg-blue-100";
        }
    };

    const getButtonStyle = () => {
        switch (type) {
            case "success":
                return "bg-green-600 hover:bg-green-700 text-white";
            case "error":
                return "bg-red-600 hover:bg-red-700 text-white";
            case "warning":
                return "bg-amber-600 hover:bg-amber-700 text-white";
            default:
                return "bg-blue-600 hover:bg-blue-700 text-white";
        }
    };

    const getIcon = () => {
        switch (type) {
            case "success":
                return <CheckCircle2 className="w-5 h-5 text-green-600" />;
            case "error":
                return <XCircle className="w-5 h-5 text-red-600" />;
            case "warning":
                return <CircleAlert className="w-5 h-5 text-amber-600" />;
            default:
                return <Info className="w-5 h-5 text-blue-600" />;
        }
    };

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
                        <div
                            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getIconBackground()}`}
                        >
                            {getIcon()}
                        </div>
                        {/* Title */}
                        <div className="flex-1">
                            <h3 className="text-base font-bold text-[#04362c]">{title}</h3>
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
                    <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${getButtonStyle()}`}
                    >
                        OK
                    </button>
                </div>
            </div>
        </>
    );
}

export default AlertDialog;
