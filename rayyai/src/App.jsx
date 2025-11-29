import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useNavigate,
} from "react-router-dom";

import TopNavigation from "@/components/general/TopNavigationBar";
import SideNavigationBar from "@/components/general/SideNavigationBar";
import UserProfileDialog from "@/components/general/UserProfileDialog";

import Transactions from "@/pages/TransactionHistory";
import UploadStatement from "@/pages/UploadStatement";
import RayyAIAssistant from "@/pages/RayyAIchat";

import HomePage from "@/pages/HomePage";
import CreditCardPage from "@/pages/CreditCardpage";
import { CardRecommendationDetail } from "@/pages/details";
import { BudgetTracker } from "@/pages/BudgetTrackerPage";
import { FinancialGoals } from "@/pages/FinancialGoals";
import Dashboard from "@/pages/Dashboard";

import { navigationConfig } from "@/config/navigation";
import { AuthProvider, useAuth } from "@/contexts";
import { authApi } from "@/services/api";

const toGenderEnumValue = (value) => {
    if (!value) {
        return undefined;
    }

    const normalized = value.toString().toLowerCase();
    if (
        ["male", "female", "other", "prefer not to say"].includes(normalized)
    ) {
        return normalized;
    }

    return value;
};

const normalizeDateInputValue = (value) => {
    if (!value) {
        return "";
    }

    try {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value;
        }
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, "0");
        const day = String(date.getUTCDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    } catch (err) {
        return value;
    }
};

const extractErrorMessage = (errorData, fallback = "Failed to update profile") => {
    if (!errorData) {
        return fallback;
    }

    if (typeof errorData === "string") {
        return errorData;
    }

    if (Array.isArray(errorData)) {
        return errorData
            .map((item) => {
                if (typeof item === "string") return item;
                if (item?.msg) return item.msg;
                return JSON.stringify(item);
            })
            .join("; ");
    }

    if (typeof errorData === "object") {
        if (typeof errorData.detail === "string") {
            return errorData.detail;
        }

        if (Array.isArray(errorData.detail)) {
            return errorData.detail
                .map((item) => {
                    if (typeof item === "string") return item;
                    if (item?.msg) return item.msg;
                    return JSON.stringify(item);
                })
                .join("; ");
        }

        return JSON.stringify(errorData.detail ?? errorData);
    }

    return fallback;
};

// Main App Component
const App = () => {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
};

const AppContent = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading, logout, updateUser, refreshProfile } = useAuth();

    const [isSidebarLocked, setIsSidebarLocked] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isHoveringSidebar, setIsHoveringSidebar] = useState(false);
    const [isHoveringToggle, setIsHoveringToggle] = useState(false);
    const sidebarTimeoutRef = useRef(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

    useEffect(() => {
        if (isHoveringSidebar || isHoveringToggle || isSidebarLocked) {
            setIsSidebarOpen(true);
            if (sidebarTimeoutRef.current) {
                clearTimeout(sidebarTimeoutRef.current);
                sidebarTimeoutRef.current = null;
            }
        } else {
            sidebarTimeoutRef.current = setTimeout(() => {
                setIsSidebarOpen(false);
            }, 300);
        }

        return () => {
            if (sidebarTimeoutRef.current) {
                clearTimeout(sidebarTimeoutRef.current);
            }
        };
    }, [isHoveringSidebar, isHoveringToggle, isSidebarLocked]);

    // Called by SignInDialog and SignUpDialog after successful login/signup
    const handleLoginSuccess = useCallback((userData) => {
        // Auth context handles the state update via login
        // Just refresh profile and navigate
        refreshProfile().catch((err) => {
            console.error("Unable to refresh profile after login:", err);
        });
        navigate("/dashboard");
    }, [navigate, refreshProfile]);

    // Logout handler
    const handleLogout = useCallback(() => {
        setIsLoggingOut(true);
        setIsSidebarLocked(false);
        setIsSidebarOpen(false);

        logout();

        // Navigate first
        navigate("/", { replace: true });

        // Keep loading screen visible longer to prevent flash
        setTimeout(() => {
            setIsLoggingOut(false);
        }, 300);
    }, [logout, navigate]);

    const handleSidebarLockFromTopBar = () => {
        setIsSidebarLocked(!isSidebarLocked);
        if (!isSidebarLocked) {
            setIsSidebarOpen(true);
        }
    };

    const handleHoverButtonFromTopBar = (hoverState) => {
        setIsHoveringToggle(hoverState);
    };

    const handleSidebarHover = (hoverState) => {
        setIsHoveringSidebar(hoverState);
    };

    const handleSidebarOpenClose = (sidebarState) => {
        setIsSidebarOpen(sidebarState);
        if (!sidebarState) {
            setIsHoveringSidebar(false);
            setIsHoveringToggle(false);
        }
    };

    const handleProfileClick = () => {
        const needsRefresh =
            !user ||
            !user.first_name ||
            !user.last_name ||
            !user.dob ||
            !user.gender;

        if (needsRefresh) {
            refreshProfile().catch((err) => {
                console.error("Failed to load profile:", err);
            });
        }
        setIsProfileDialogOpen(true);
    };

    const handleProfileSave = async (updatedValues) => {
        const payload = {};
        const fields = ["first_name", "last_name", "email", "dob", "gender", "password"];

        fields.forEach((field) => {
            if (!Object.prototype.hasOwnProperty.call(updatedValues, field)) {
                return;
            }

            let newValue = updatedValues[field];

            if (typeof newValue === "string") {
                newValue = newValue.trim();
            }

            const currentValue = user ? user[field] : undefined;

            if (field === "password") {
                if (!newValue) {
                    return;
                }
                payload[field] = newValue;
                return;
            }

            if (field === "gender") {
                if (!newValue) {
                    if (currentValue) {
                        payload[field] = null;
                    }
                    return;
                }

                const normalizedNewGender = toGenderEnumValue(newValue);
                const normalizedCurrentGender = toGenderEnumValue(currentValue);

                if (!normalizedNewGender) {
                    return;
                }

                if (normalizedNewGender !== normalizedCurrentGender) {
                    payload[field] = normalizedNewGender;
                }
                return;
            }

            if (field === "dob") {
                if (!newValue) {
                    if (currentValue) {
                        payload[field] = null;
                    }
                    return;
                }

                const normalizedNewDate = normalizeDateInputValue(newValue);
                const normalizedCurrentDate = normalizeDateInputValue(currentValue);

                if (normalizedNewDate !== normalizedCurrentDate) {
                    payload[field] = normalizedNewDate;
                }
                return;
            }

            if (
                newValue === undefined ||
                newValue === null ||
                (typeof newValue === "string" && newValue === "")
            ) {
                if (
                    currentValue !== undefined &&
                    currentValue !== null &&
                    currentValue !== ""
                ) {
                    payload[field] = null;
                }
                return;
            }

            if (newValue !== currentValue) {
                payload[field] = newValue;
            }
        });

        // No changes - simply return current user
        if (Object.keys(payload).length === 0) {
            return user;
        }

        try {
            const updatedProfile = await authApi.updateProfile(payload);
            updateUser(updatedProfile);
            return updatedProfile;
        } catch (error) {
            const message = extractErrorMessage(error.data || error.message, "Failed to update profile");
            throw new Error(message);
        }
    };

    return (
        <>
            {isLoading || isLoggingOut ? (
                // Show styled loading screen during auth check or logout
                <div className="min-h-screen bg-[#9eb8b9] flex items-center justify-center p-4">
                    <div className="bg-[#d2eaee] rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-[#6f948d]/20">
                        <div className="w-20 h-20 bg-[#6f948d]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg
                                className="w-10 h-10 text-[#6f948d] animate-spin"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                        </div>

                        <h1 className="text-3xl font-bold text-[#586c75] mb-3">
                            {isLoggingOut ? "Signing Out" : "Loading"}
                        </h1>

                        <p className="text-[#586c75]/80">
                            {isLoggingOut ? "Please wait while we securely log you out..." : "Please wait..."}
                        </p>
                    </div>
                </div>
            ) : isAuthenticated ? (
                // Show authenticated layout
                <>
                    <div className="fixed top-0 left-0 right-0 z-50 bg-secondary">
                        <TopNavigation
                            isSidebarLocked={isSidebarLocked}
                            isSidebarOpen={isSidebarOpen}
                            isHoveringSidebar={isHoveringSidebar}
                            isHoveringToggle={isHoveringToggle}
                            onSidebarLockChange={handleSidebarLockFromTopBar}
                            onSidebarButtonHover={handleHoverButtonFromTopBar}
                            onLogout={handleLogout}
                        />
                    </div>

                    <div className="flex pt-20 min-h-screen" style={{ background: '#d2eaee' }}>
                        <div className="fixed left-0 top-0 bottom-0 z-30">
                            <SideNavigationBar
                                isHoveringToggle={isHoveringToggle}
                                isSidebarOpen={isSidebarOpen}
                                navigation={navigationConfig}
                                onSidebarOpenClose={handleSidebarOpenClose}
                                onSidebarHover={handleSidebarHover}
                                onLogout={handleLogout}
                                user={user}
                                onProfileClick={handleProfileClick}
                            />
                        </div>

                        <main
                            className="flex-1 transition-all duration-300 ease-in-out"
                            style={{
                                marginLeft: isSidebarOpen ? "400px" : "0px",
                            }}
                        >
                            <div>
                                <RayyAIAssistant/>
                                <Routes>
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/transactions/all" element={<Transactions />} />
                                    <Route path="/transactions/upload" element={<UploadStatement />} />
                                    <Route path="/planning/budget" element={<BudgetTracker />} />
                                    <Route path="/planning/goals" element={<FinancialGoals />} />
                                    <Route path="/cards" element={<CreditCardPage />} />
                                    <Route path="/cards/recommendation-detail" element={<CardRecommendationDetail />} />
                                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                                </Routes>
                            </div>
                        </main>
                    </div>
                    <UserProfileDialog
                        isOpen={isProfileDialogOpen}
                        onClose={() => setIsProfileDialogOpen(false)}
                        user={user}
                        onSave={handleProfileSave}
                    />
                </>
            ) : (
                // Show homepage for unauthenticated users
                <Routes>
                    <Route
                        path="/"
                        element={
                            <HomePage
                                onLogin={handleLoginSuccess}
                                onSignup={handleLoginSuccess}
                            />
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            )}
        </>
    );
};

export default App;
