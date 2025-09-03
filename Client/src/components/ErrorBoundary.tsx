import { Component } from "react";
import type { ErrorInfo } from "react";
import type { Props, State } from "../types";

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    private handleRetry = () => {
        this.setState({
            hasError: false,
            error: undefined,
            errorInfo: undefined,
        });
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-gray-900/50 p-8 max-w-md w-full">
                        {/* Error Icon */}
                        <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-6">
                            <svg
                                className="w-8 h-8 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                            </svg>
                        </div>

                        {/* Error Title */}
                        <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
                            Oops! Something went wrong
                        </h1>

                        {/* Error Message */}
                        <p className="text-gray-600 text-center mb-6">
                            We encountered an unexpected error. Don't worry,
                            it's not your fault. Please try again.
                        </p>

                        {/* Error Details (in development) */}
                        {process.env.NODE_ENV === "development" &&
                            this.state.error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                    <h3 className="text-sm font-medium text-red-800 mb-2">
                                        Error Details (Development Only):
                                    </h3>
                                    <pre className="text-xs text-red-700 overflow-auto max-h-32">
                                        {this.state.error.message}
                                    </pre>
                                </div>
                            )}

                        {/* Action Buttons */}
                        <div className="flex flex-col space-y-3">
                            <button
                                onClick={this.handleRetry}
                                className="w-full bg-gray-700 text-white py-3 px-4 rounded-lg hover:bg-gray-900 transition-colors font-medium"
                            >
                                Try Again
                            </button>

                            <button
                                onClick={() => window.location.reload()}
                                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                Refresh Page
                            </button>
                        </div>

                        {/* Contact Support */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500">
                                If the problem persists, please{" "}
                                <a
                                    href="mailto:testingmyapp99times@gmail.com"
                                    className="text-gray-700 hover:underline"
                                >
                                    contact support
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
