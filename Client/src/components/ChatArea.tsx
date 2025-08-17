import { useEffect, useRef } from "react";

import EmailPreviewBox from "../templates/EmailPreviewBox";
import { CircleLoader, ChatLoader, EmailGenerateLoader } from "./Loader";

interface Message {
    id: string;
    content: string;
    sender: "user" | "assistant";
    timestamp: Date;
    hashtag?: string;
    type?: "text" | "email";
    emailData?: EmailData;
}

interface EmailData {
    to: string;
    subject: string;
    body: string;
}

interface ChatAreaProps {
    messages: Message[];
    isLoading?: boolean;
    isAIThinking?: boolean;
    isEmailGenerating?: boolean;
}

const ChatArea = ({
    messages,
    isLoading = false,
    isAIThinking = false,
    isEmailGenerating = false,
}: ChatAreaProps) => {
    const chatAreaRef = useRef<HTMLDivElement>(null);

    const parseMessageContent = (content: string) => {
        const parts = content.split(/(\*\*_.*?_\*\*)/g);

        return parts.map((part, index) => {
            if (part.match(/\*\*_.*?_\*\*/)) {
                const text = part.replace(/\*\*_|_\*\*/g, "");
                return (
                    <span key={index} className="font-bold italic">
                        {text}
                    </span>
                );
            }
            return part;
        });
    };

    useEffect(() => {
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        }
    }, [messages, isAIThinking, isEmailGenerating]);

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-gray-800 overflow-hidden">
            {messages?.length !== 0 ? (
                <div
                    className="flex-1 flex flex-col overflow-y-auto"
                    ref={chatAreaRef}
                >
                    {messages?.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${
                                message.sender === "user"
                                    ? "justify-end"
                                    : "justify-start"
                            } p-4`}
                        >
                            <div className="flex flex-col">
                                {message.type === "email" ? (
                                    <div className="max-w-xs lg:max-w-md">
                                        <EmailPreviewBox
                                            emailData={
                                                message.emailData || null
                                            }
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-sm shadow-sm ${
                                            message.sender === "user"
                                                ? "bg-gray-700 dark:bg-gray-900 text-white dark:shadow-gray-900/30"
                                                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 dark:shadow-gray-900/30"
                                        }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">
                                            {parseMessageContent(
                                                message.content
                                            )}
                                        </p>
                                        {message.hashtag && (
                                            <span className="text-xs opacity-75 block mt-3 border-t-2 border-dashed border-gray-200 dark:border-gray-600 -mx-4 px-2 text-center -mb-1">
                                                {message.hashtag}
                                            </span>
                                        )}
                                    </div>
                                )}
                                {message.timestamp && (
                                    <span className="text-xs text-gray-500 text-end select-none">
                                        {message.timestamp.toLocaleTimeString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}

                    {isAIThinking && (
                        <div className="flex justify-start p-4">
                            <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 max-w-xs lg:max-w-md px-1 py-1 rounded-sm shadow-sm dark:shadow-gray-900/30">
                                <ChatLoader />
                            </div>
                        </div>
                    )}
                    {isEmailGenerating && (
                        <div className="flex justify-start p-4">
                            <EmailGenerateLoader />
                        </div>
                    )}
                </div>
            ) : isLoading ? (
                <div className="flex-1 flex flex-col justify-center items-center p-8 text-center">
                    <div className="text-gray-500 flex flex-col items-center space-y-2 select-none">
                        <CircleLoader size="lg" />
                        <p>Loading...</p>
                    </div>
                </div>
            ) : (
                <div className="dark:bg-gray-800 dark:text-gray-100 flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
                    <div className="max-w-md space-y-4">
                        <div className="mb-6">
                            <h1 className="text-4xl font-bold mb-2">
                                Chat & Email Assistant
                            </h1>
                            <p className="text-lg text-gray-600">
                                Your intelligent companion for conversations and
                                professional email drafting
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 mt-8">
                            <div className="dark:bg-gray-900 bg-gray-50 border dark:border-gray-600 border-gray-200 rounded-sm p-4 transition-colors shadow-sm dark:shadow-gray-900/20">
                                <h3 className="font-semibold dark:text-blue-300 text-blue-900 mb-1">
                                    Start a Conversation
                                </h3>
                                <p className="text-sm text-gray-400">
                                    Ask questions or get help with any topic
                                </p>
                                <p className="text-sm text-gray-400">
                                    Create professional emails with AI
                                    assistance
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 mt-6">
                            Type your message below to get started
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatArea;
