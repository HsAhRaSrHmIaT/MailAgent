import { useEffect, useState } from "react";
import { LuRefreshCcw } from "react-icons/lu";
import { apiService } from "../services/apiService";
import { useTheme } from "../contexts/ThemeContext";
import type { HeaderProps } from "../types";

const Header = ({ setMessages }: HeaderProps) => {
    const { currentColors } = useTheme();
    const [status, setStatus] = useState("Offline");
    const handleRefresh = () => {
        // Logic to refresh messages or reset state
        setMessages([]);
    };

    useEffect(() => {
        apiService.connectWebSocket();
        const checkOnlineStatus = () => {
            if (apiService.isWebSocketConnected()) {
                setStatus("Online");
                // console.log("WebSocket is connected");
            } else {
                setStatus("Offline");
                // console.log("Things are not going as expected");
            }
        };
        checkOnlineStatus();
        const interval = setInterval(checkOnlineStatus, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div
            className="p-4 flex items-center justify-between select-none shadow-sm"
            style={{
                backgroundColor: currentColors.surface,
                color: currentColors.text,
                boxShadow: `0 1px 3px 0 ${currentColors.border}20`,
            }}
        >
            <div>
                <h1
                    className="text-lg font-semibold"
                    style={{ color: currentColors.text }}
                >
                    Chat & Email Assistant
                </h1>
                <div className="flex items-center space-x-1 ml-1">
                    <div
                        className={`w-2 h-2 rounded-full`}
                        style={{
                            backgroundColor:
                                status === "Online"
                                    ? "#10B981"
                                    : currentColors.border,
                        }}
                    ></div>
                    <span
                        className="text-xs"
                        style={{ color: currentColors.textSecondary }}
                    >
                        {status}
                    </span>
                </div>
            </div>
            <button
                className="p-2 rounded-full transition-all duration-300 cursor-pointer hover:-rotate-180"
                style={{
                    backgroundColor: currentColors.bg,
                    color: currentColors.text,
                    border: `1px solid ${currentColors.border}`,
                }}
                onClick={handleRefresh}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                        currentColors.border;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = currentColors.bg;
                }}
            >
                <LuRefreshCcw size={20} />
            </button>
        </div>
    );
};

export default Header;
