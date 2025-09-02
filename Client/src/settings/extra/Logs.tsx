import { LuLogs } from "react-icons/lu";
import { useTheme } from "../../contexts/ThemeContext";

const Logs = () => {
    const { currentColors, currentPalette } = useTheme();

    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto p-6 select-none">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div
                            className="p-3 rounded-xl"
                            style={{
                                backgroundColor: `${currentPalette.primary}20`,
                            }}
                        >
                            <span
                                className="text-md font-mono font-bold"
                                style={{ color: currentColors.text }}
                            >
                                <LuLogs size={24} />
                            </span>
                        </div>
                        <div>
                            <h1
                                className="text-4xl font-bold"
                                style={{ color: currentColors.text }}
                            >
                                View Logs
                            </h1>
                            <p
                                className="text-lg mt-1"
                                style={{ color: currentColors.textSecondary }}
                            >
                                Monitor and manage your application logs
                                effectively
                            </p>
                        </div>
                    </div>
                </div>
                <div
                    className="h-142 border rounded-xl p-6 flex items-center justify-center"
                    style={{
                        borderColor: currentColors.border,
                        background: currentColors.surface,
                    }}
                >
                    <p style={{ color: currentColors.text }}>
                        No logs available
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Logs;