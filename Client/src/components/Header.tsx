import { useEffect, useState } from "react";
import { LuRefreshCcw } from "react-icons/lu";
import { apiService } from "../services/apiService";
import { useTheme } from "../contexts/ThemeContext";

interface Message {
    id: string;
    content: string;
    sender: "user" | "assistant";
    timestamp: Date;
    hashtag?: string;
    type?: "text" | "email";
    emailData?: {
        to: string;
        subject: string;
        body: string;
    };
}

interface HeaderProps {
    setMessages: (messages: Message[]) => void;
}

const Header = ({ setMessages }: HeaderProps) => {
    const { currentColors } = useTheme();
    const [status, setStatus] = useState("Online");
    const handleRefresh = () => {
        // Logic to refresh messages or reset state
        setMessages([]);
    };

    useEffect(() => {
        const checkOnlineStatus = async () => {
            try {
                // Logic to check if the user is online
                const response = await apiService.getStatus();
                if (response.status) {
                    // User is online
                    setStatus("Online");
                } else {
                    // User is offline
                    setStatus("Offline");
                }
            } catch (error) {
                console.error("Failed to check online status:", error);
                setStatus("Offline");
            }
        };
        checkOnlineStatus();
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
