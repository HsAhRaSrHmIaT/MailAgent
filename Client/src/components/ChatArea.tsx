import { useEffect, useRef } from "react";
import type { ChatAreaProps } from "../types";
import { useTheme } from "../contexts/ThemeContext";

import EmailPreviewBox from "../templates/EmailPreviewBox";

import { CircleLoader, ChatLoader, EmailGenerateLoader } from "./Loader";

const ChatArea = ({
    messages,
    isLoading = false,
    isAIThinking = false,
    isEmailGenerating = false,
    onScrollToTop,
    onUpdateMessage,
}: ChatAreaProps) => {
    const chatAreaRef = useRef<HTMLDivElement>(null);
    const { currentColors, currentPalette } = useTheme();

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

    // Scroll to bottom on new messages
    useEffect(() => {
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        }
    }, [messages, isAIThinking, isEmailGenerating]);

    // Detect scroll to top for loading older messages
    useEffect(() => {
        const chatArea = chatAreaRef.current;
        if (!chatArea || !onScrollToTop) return;

        const handleScroll = () => {
            // If scrolled near top (within 100px)
            if (chatArea.scrollTop < 100) {
                onScrollToTop();
            }
        };

        chatArea.addEventListener("scroll", handleScroll);
        return () => chatArea.removeEventListener("scroll", handleScroll);
    }, [onScrollToTop]);

    return (
        <div
            className="flex flex-col h-screen overflow-hidden"
            style={{ backgroundColor: currentColors.bg }}
        >
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
                            } p-2 sm:p-4`}
                        >
                            <div className="flex flex-col">
                                {message.type === "email" ? (
                                    <div className="max-w-xs sm:max-w-sm lg:max-w-md">
                                        <EmailPreviewBox
                                            emailData={
                                                message.emailData || null
                                            }
                                            emailId={message.emailId}
                                            tone={message.tone}
                                            prompt={message.prompt}
                                            status={message.status}
                                            onRegenerate={(newEmailData) => {
                                                if (onUpdateMessage) {
                                                    onUpdateMessage(
                                                        message.id,
                                                        newEmailData,
                                                    );
                                                }
                                            }}
                                            onUpdate={(updatedEmailData) => {
                                                if (onUpdateMessage) {
                                                    onUpdateMessage(
                                                        message.id,
                                                        updatedEmailData,
                                                    );
                                                }
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="max-w-xs sm:max-w-sm lg:max-w-md px-3 py-2 sm:px-4 rounded-sm shadow-sm"
                                        style={{
                                            backgroundColor:
                                                message.sender === "user"
                                                    ? currentPalette.primary
                                                    : currentColors.surface,
                                            color:
                                                message.sender === "user"
                                                    ? "#fff"
                                                    : currentColors.text,
                                            boxShadow:
                                                "0 1px 4px 0 " +
                                                (message.sender === "user"
                                                    ? currentPalette.primary +
                                                      "22"
                                                    : currentColors.border +
                                                      "22"),
                                        }}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">
                                            {parseMessageContent(
                                                message.content,
                                            )}
                                        </p>
                                        {message.hashtag && (
                                            <span
                                                className="text-xs opacity-75 block mt-3 border-t-2 border-dashed -mx-4 px-2 text-center -mb-1"
                                                style={{
                                                    borderColor:
                                                        currentColors.surface,
                                                }}
                                            >
                                                {message.hashtag}
                                            </span>
                                        )}
                                    </div>
                                )}
                                {message.timestamp && (
                                    <span
                                        className="text-xs text-end select-none"
                                        style={{
                                            color: currentColors.textSecondary,
                                        }}
                                    >
                                        {message.timestamp.toLocaleTimeString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}

                    {isAIThinking && (
                        <div className="flex justify-start p-4">
                            <div
                                className="max-w-xs lg:max-w-md px-1 py-1 rounded-sm shadow-sm"
                                style={{
                                    backgroundColor: currentColors.surface,
                                    color: currentColors.text,
                                    boxShadow:
                                        "0 1px 4px 0 " +
                                        currentColors.border +
                                        "22",
                                }}
                            >
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
                    <div
                        className="flex flex-col items-center space-y-2 select-none"
                        style={{ color: currentColors.textSecondary }}
                    >
                        <CircleLoader size="lg" />
                        <p>Loading...</p>
                    </div>
                </div>
            ) : (
                <div
                    className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none"
                    style={{
                        backgroundColor: currentColors.bg,
                        color: currentColors.text,
                    }}
                >
                    <div className="max-w-md space-y-4">
                        <div className="mb-6">
                            <h1 className="text-4xl font-bold mb-2">
                                Chat & Email Assistant
                            </h1>
                            <p
                                className="text-lg"
                                style={{ color: currentColors.textSecondary }}
                            >
                                Your intelligent companion for conversations and
                                professional email drafting
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 mt-8">
                            <div
                                className="rounded-sm p-4 transition-colors shadow-sm"
                                style={{
                                    backgroundColor: currentColors.surface,
                                    border: `1px solid ${currentColors.border}`,
                                    boxShadow:
                                        "0 1px 4px 0 " +
                                        currentColors.border +
                                        "22",
                                }}
                            >
                                <h3
                                    className="font-semibold mb-1"
                                    style={{ color: currentColors.text }}
                                >
                                    Start a Conversation
                                </h3>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: currentColors.textSecondary,
                                    }}
                                >
                                    Ask questions or get help with any topic
                                </p>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: currentColors.textSecondary,
                                    }}
                                >
                                    Create professional emails with AI
                                    assistance
                                </p>
                            </div>
                        </div>

                        <p
                            className="text-sm mt-6"
                            style={{ color: currentColors.textSecondary }}
                        >
                            Type your message below to get started
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatArea;
