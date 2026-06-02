import { useEffect, useRef } from "react";
import type { ChatAreaProps } from "../types";
import { useTheme } from "../contexts/ThemeContext";

import EmailPreviewBox from "../templates/EmailPreviewBox";

import { CircleLoader, ChatLoader, EmailGenerateLoader } from "./Loader";

import { IoMdMail, IoIosChatbubbles } from "react-icons/io";

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

    const features = [
        {
            emoji: <IoIosChatbubbles size={24} />,
            title: "Start a Conversation",
            desc: "Ask questions or get help with any topic",
        },
        {
            emoji: <IoMdMail size={24} />,
            title: "Draft Professional Emails",
            desc: "Create polished emails with AI assistance",
        },
    ];

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
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            style={{
                background: `linear-gradient(180deg, ${currentColors.bg} 0%, ${currentColors.surface}18 100%)`,
            }}
        >
            {messages?.length !== 0 ? (
                <div
                    className="flex min-h-0 flex-1 flex-col overflow-y-auto px-1 py-2 sm:px-2 sm:py-3"
                    ref={chatAreaRef}
                >
                    {messages?.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${
                                message.sender === "user"
                                    ? "justify-end"
                                    : "justify-start"
                            } px-2 py-2 sm:px-4 sm:py-3`}
                        >
                            {message.sender === "assistant" &&
                                message.type !== "email" && (
                                    <div
                                        className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full mr-2 mt-auto text-[0.6rem] font-semibold tracking-wider"
                                        style={{
                                            backgroundColor:
                                                currentColors.surface,
                                            border: `1px solid ${currentColors.border}`,
                                            color: currentColors.textSecondary,
                                            fontFamily: "'DM Sans', sans-serif",
                                        }}
                                    >
                                        AI
                                    </div>
                                )}
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
                                        className={`max-w-xs sm:max-w-sm lg:max-w-md px-3 py-2 sm:px-4 ${message.sender === "user" ? "rounded-[16px_16px_4px_16px]" : "rounded-[16px_16px_16px_4px]"} shadow-sm`}
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
                                                "0 1px 2px 0 " +
                                                (message.sender === "user"
                                                    ? currentPalette.primary +
                                                      "22"
                                                    : currentColors.border +
                                                      "dd"),
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
                                        className="text-xs text-end select-none mt-1 opacity-75"
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
                                className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full mr-2 mt-auto text-[0.6rem] font-semibold tracking-wider"
                                style={{
                                    backgroundColor: currentColors.surface,
                                    border: `1px solid ${currentColors.border}`,
                                    color: currentColors.textSecondary,
                                    fontFamily: "'DM Sans', sans-serif",
                                }}
                            >
                                AI
                            </div>
                            <div
                                className="max-w-xs lg:max-w-md px-1 py-1 rounded-[16px_16px_16px_4px] shadow-sm"
                                style={{
                                    backgroundColor: currentColors.surface,
                                    color: currentColors.text,
                                    boxShadow:
                                        "0 1px 2px 0 " + currentColors.border,
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
                <div className="flex-1 flex flex-col items-center justify-center select-none px-[20px] py-[32px] font-[DM_Sans,sans-serif]">
                    <div className="max-w-[360px] w-full text-center">
                        {/* Icon mark */}
                        <div
                            className="w-[52px] h-[52px] rounded-[16px] flex items-center justify-center mx-auto mb-[20px]"
                            style={{
                                backgroundColor: currentColors.surface,
                                border: `1px solid ${currentColors.border}`,
                                boxShadow: `0 2px 12px -4px ${currentColors.border}66`,
                            }}
                        >
                            <span className="text-[1.4rem]">✦</span>
                        </div>

                        <h1
                            className="text-[1.4rem] font-bold mb-2 leading-[1.2] tracking-[-0.02em]"
                            style={{ color: currentColors.text }}
                        >
                            Chat & Email Assistant
                        </h1>

                        <p
                            className="text-[0.875rem] leading-[1.6] mb-[28px]"
                            style={{ color: currentColors.textSecondary }}
                        >
                            Your intelligent companion for conversations and
                            professional email drafting.
                        </p>

                        {/* Feature cards */}
                        <div className="flex flex-col gap-[10px]">
                            {features.map(({ emoji, title, desc }) => (
                                <div
                                    key={title}
                                    className="flex items-start gap-[12px] rounded-[12px] px-[16px] py-[14px] text-left shadow-[0_1px_6px_-2px_rgba(0,0,0,0.26)]"
                                    style={{
                                        backgroundColor: currentColors.surface,
                                        border: `1px solid ${currentColors.border}`,
                                        boxShadow: `0 1px 6px -2px ${currentColors.border}44`,
                                    }}
                                >
                                    <span className="text-[1.1rem] mt-[1px]">
                                        {emoji}
                                    </span>
                                    <div>
                                        <p
                                            className="font-semibold text-[0.875rem] mb-[2px]"
                                            style={{
                                                color: currentColors.text,
                                            }}
                                        >
                                            {title}
                                        </p>
                                        <p
                                            className="text-[0.8rem] leading-[1.5]"
                                            style={{
                                                color: currentColors.textSecondary,
                                            }}
                                        >
                                            {desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p
                            className="mt-[24px] text-[0.78rem] tracking-[0.02em]"
                            style={{
                                color: currentColors.textSecondary,
                                opacity: 0.6,
                            }}
                        >
                            Type a message below to get started
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatArea;
