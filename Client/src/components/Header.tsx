import { useEffect, useState } from "react";
import { LuRefreshCcw } from "react-icons/lu";
import { apiService } from "../services/apiService";

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
        <div className="bg-gray-700 dark:bg-gray-900 text-white p-4 flex items-center justify-between select-none shadow-sm dark:shadow-gray-900/50">
            <div>
                <h1 className="text-lg font-semibold">
                    Chat & Email Assistant
                </h1>
                <div className="flex items-center space-x-1 ml-1">
                    <div
                        className={`w-2 h-2 rounded-full ${
                            status === "Online" ? "bg-green-400" : "bg-gray-400"
                        }`}
                    ></div>
                    <span className="text-xs">{status}</span>
                </div>
            </div>
            <button
                className="bg-gray-700 dark:bg-gray-800 text-white p-2 rounded-full hover:bg-gray-600 dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer hover:-rotate-180 shadow-sm dark:shadow-gray-900/30"
                onClick={handleRefresh}
            >
                <LuRefreshCcw size={20} />
            </button>
        </div>
    );
};

export default Header;
