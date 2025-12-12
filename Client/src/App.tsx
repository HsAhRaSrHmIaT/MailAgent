import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import EmailForm from "./pages/EmailForm";
import Settings from "./pages/Settings";
import GetDB from "./pages/GetDB";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PageNotFound from "./pages/PageNotFound";
import ProtectedRoute from "./components/ProtectedRoute";

function AppRoutes() {
    const { isLoading } = useAuth();
    const { currentColors } = useTheme();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: currentColors.bg }}>
                <div className="flex flex-col items-center space-y-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 rounded-full animate-spin" style={{borderColor: currentColors.border, borderTopColor: `${currentColors.border}60` }} />
                        <div className="absolute inset-2 w-12 h-12 border-4 rounded-full animate-spin" style={{ animationDirection: 'reverse', borderColor: currentColors.border, borderBottomColor: `${currentColors.border}60` }} />
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                        <div className="text-lg font-medium" style={{ color: currentColors.textSecondary }}>Loading...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Welcome />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route
                    path="/email-form"
                    element={
                        <ProtectedRoute>
                            <EmailForm />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            <Settings />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/get-db"
                    element={
                        <ProtectedRoute>
                            <GetDB />
                        </ProtectedRoute>
                    }
                />

                {/* 404 Page */}
                <Route path="*" element={<PageNotFound />} />
            </Routes>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </Router>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
