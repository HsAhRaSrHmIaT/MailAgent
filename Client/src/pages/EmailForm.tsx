import React, { useState, useRef, useEffect } from "react";

import QuickActions from "../components/QuickActions";
import CommandHelp from "../components/CommandHelp";
import ChatArea from "../components/ChatArea";
import Header from "../components/Header";
import CommandStatusBar from "../components/CommandStatusBar";
import SendButtons from "../components/SendButtons";
import HashTag from "../components/HashTag";
import ToggleTheme from "../components/ToggleTheme";

import { apiService } from "../services/apiService";
import { useTheme } from "../contexts/ThemeContext";

import { IoSettingsOutline } from "react-icons/io5";
import { MdOutlineDesktopWindows, MdDrafts } from "react-icons/md";
import { Link } from "react-router-dom";
import type { Message, CommandState, EmailData } from "../types";

const EmailForm = () => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [hashTag, setHashTag] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isAIThinking, setIsAIThinking] = useState(false);
    const [isEmailGenerating, setIsEmailGenerating] = useState(false);
    const [emailValidationError, setEmailValidationError] = useState(false);
    const [commandState, setCommandState] = useState<CommandState>({
        isActive: false,
        command: "",
        step: 0,
        data: {},
        clearAll: false,
    });
    const [clearCountdown, setClearCountdown] = useState(0);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [isLoadingOlder, setIsLoadingOlder] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const emailLength = 50;
    const maxMessageLength = 300;
    const { currentColors } = useTheme();
    const theme = localStorage.getItem("theme") || "light";

    const addMessage = async (
        content: string,
        sender: "user" | "assistant",
        hashtag?: string,
        type: "text" | "email" = "text",
        emailData?: EmailData,
        emailId?: string,
        tone?: string,
        prompt?: string,
    ) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            content,
            sender,
            timestamp: new Date(),
            hashtag,
            type,
            emailData,
            emailId,
            tone,
            prompt,
        };
        setMessages((prev) => [...prev, newMessage]);

        // Save text messages to database (emails are saved separately with full context)
        if (type === "text") {
            try {
                await apiService.saveMessage(newMessage);
            } catch (error) {
                console.error("Failed to save message:", error);
            }
        }
    };

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const isValidEmail = (email: string): boolean => {
        return emailPattern.test(email.trim());
    };

    const commands = {
        "/email": {
            description: "Generate and send an email",
            steps: [
                { field: "receiverEmail", prompt: "Enter receiver's email:" },
                { field: "prompt", prompt: "Enter your email prompt:" },
            ],
        },
        "/clear": {
            description: "Clear chat history",
            steps: [],
        },
        "#confident": {
            description: "Use confident tone",
            steps: [],
        },
        "#formal": {
            description: "Use formal tone",
            steps: [],
        },
        "#casual": {
            description: "Use casual tone",
            steps: [],
        },
    };

    useEffect(() => {
        // Load chat history on mount
        const loadChatHistory = async () => {
            setIsLoading(true);
            try {
                // Load both chat messages and emails
                const [chatResult, emailResult] = await Promise.all([
                    apiService.getChatHistory(50),
                    apiService.getEmailHistory(50),
                ]);

                // Convert emails to Message format
                const emailMessages: Message[] = emailResult.emails.map(
                    (email) => ({
                        id: email.id,
                        content: "",
                        sender: "assistant" as const,
                        timestamp: new Date(email.timestamp),
                        hashtag: email.tone ? `#${email.tone}` : undefined,
                        type: "email" as const,
                        emailData: {
                            to: email.to_email,
                            subject: email.subject,
                            body: email.body,
                        },
                        emailId: email.id,
                        tone: email.tone,
                        prompt: email.prompt,
                    }),
                );

                // Merge and sort by timestamp
                const allMessages = [
                    ...chatResult.messages,
                    ...emailMessages,
                ].sort(
                    (a, b) =>
                        new Date(a.timestamp).getTime() -
                        new Date(b.timestamp).getTime(),
                );

                setMessages(allMessages);
                setHasMoreMessages(chatResult.hasMore || emailResult.hasMore);
            } catch (error) {
                console.error("Failed to load chat history:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadChatHistory();
    }, []);

    // Load older messages when scrolling to top
    const loadOlderMessages = async () => {
        if (!hasMoreMessages || isLoadingOlder || messages.length === 0) return;

        setIsLoadingOlder(true);
        try {
            const oldestMessage = messages[0];
            const beforeTimestamp = oldestMessage.timestamp.toISOString();

            // Load both older chat messages and emails
            const [chatResult, emailResult] = await Promise.all([
                apiService.getChatHistory(50, beforeTimestamp),
                apiService.getEmailHistory(50, beforeTimestamp),
            ]);

            // Convert emails to Message format
            const emailMessages: Message[] = emailResult.emails.map(
                (email) => ({
                    id: email.id,
                    content: "",
                    sender: "assistant" as const,
                    timestamp: new Date(email.timestamp),
                    hashtag: email.tone ? `#${email.tone}` : undefined,
                    type: "email" as const,
                    emailData: {
                        to: email.to_email,
                        subject: email.subject,
                        body: email.body,
                    },
                    emailId: email.id,
                    tone: email.tone,
                    prompt: email.prompt,
                }),
            );

            // Merge and sort older messages
            const olderMessages = [
                ...chatResult.messages,
                ...emailMessages,
            ].sort(
                (a, b) =>
                    new Date(a.timestamp).getTime() -
                    new Date(b.timestamp).getTime(),
            );

            setMessages((prev) => [...olderMessages, ...prev]);
            setHasMoreMessages(chatResult.hasMore || emailResult.hasMore);
        } catch (error) {
            console.error("Failed to load older messages:", error);
        } finally {
            setIsLoadingOlder(false);
        }
    };

    // Countdown effect for clear command
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (
            commandState.isActive &&
            commandState.command === "/clear" &&
            clearCountdown > 0
        ) {
            interval = setInterval(() => {
                setClearCountdown((prev) => {
                    if (prev <= 1) {
                        // Execute clear action when countdown reaches 0
                        console.log("Chat history cleared!");
                        setMessages([]);

                        // Clear both chat messages and emails from database
                        Promise.all([
                            apiService.clearChatHistory(),
                            apiService.clearEmailHistory(),
                        ]).catch((err) => {
                            console.error("Failed to clear history:", err);
                        });

                        // Reset command state
                        setCommandState({
                            isActive: false,
                            command: "",
                            step: 0,
                            data: {},
                        });
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            setHashTag("");
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [commandState.isActive, commandState.command, clearCountdown]);

    // Handle input change and command detection
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;

        if (emailValidationError) {
            setEmailValidationError(false);
        }

        // Determine character limit based on current context
        let charLimit;
        if (
            commandState.isActive &&
            commandState.command === "/email" &&
            commandState.step === 0
        ) {
            charLimit = emailLength;
        } else {
            charLimit = maxMessageLength;
        }

        // Only update if within character limit
        if (value.length <= charLimit) {
            setMessage(value);

            // Check if user typed a command
            if (value.startsWith("/") && !commandState.isActive) {
                const command = value.split(" ")[0];
                if (commands[command as keyof typeof commands]) {
                    if (command === "/clear") {
                        // Start clear countdown
                        setCommandState({
                            isActive: true,
                            command,
                            step: 0,
                            data: {},
                        });
                        setClearCountdown(5);
                        setMessage("");
                    } else {
                        // Regular command
                        setCommandState({
                            isActive: true,
                            command,
                            step: 0,
                            data: {},
                        });
                        setMessage("");
                    }
                }
            } else if (value.includes("#") && !commandState.isActive) {
                const hashtagMatch = value.match(/#(formal|casual|confident)/);
                if (hashtagMatch) {
                    const tag = `#${hashtagMatch[1]}`;
                    if (commands[tag as keyof typeof commands]) {
                        setHashTag(tag);
                        // Remove the hashtag from the message
                        const cleanMessage = value
                            .replace(/#(formal|casual|confident)/, "")
                            .trim();
                        setMessage(cleanMessage);
                    }
                }
            }
        }
    };

    // Handle command step submission
    const handleCommandStep = async () => {
        const currentCommand =
            commands[commandState.command as keyof typeof commands];
        const currentStep = currentCommand.steps[commandState.step];

        if (!message.trim()) return;

        if (commandState.command === "/email" && commandState.step === 0) {
            if (!isValidEmail(message.trim())) {
                setEmailValidationError(true);
                return;
            }
        }

        setEmailValidationError(false);

        const newData = {
            ...commandState.data,
            [currentStep.field]: message.trim(),
        };

        if (commandState.step < currentCommand.steps.length - 1) {
            // Move to next step
            setCommandState({
                ...commandState,
                step: commandState.step + 1,
                data: newData,
            });
            setMessage("");
        } else {
            // setIsEmailGenerating(true);
            setIsAIThinking(true);
            await addMessage(
                `${newData.prompt}\nGenerating email for: **_${newData.receiverEmail}_**`,
                "user",
            );

            try {
                setTimeout(async () => {
                    await addMessage("Generating Email...", "assistant");
                    setIsAIThinking(false);
                }, 1000);

                setTimeout(async () => {
                    setIsEmailGenerating(true);
                    try {
                        const response = await apiService.generateEmail({
                            receiverEmail: newData.receiverEmail!,
                            prompt: newData.prompt!,
                            tone: hashTag.replace("#", "") || undefined,
                        });
                        if (response.success && response.email) {
                            const emailId = Date.now().toString();

                            // Add email message to chat
                            await addMessage(
                                "",
                                "assistant",
                                hashTag || undefined,
                                "email",
                                {
                                    to: response.email.to,
                                    subject: response.email.subject,
                                    body: response.email.body,
                                },
                                emailId,
                                hashTag.replace("#", "") || undefined,
                                newData.prompt,
                            );

                            // Save email to database with prompt
                            try {
                                await apiService.saveEmail(
                                    emailId,
                                    response.email.to,
                                    response.email.subject,
                                    response.email.body,
                                    new Date(),
                                    hashTag.replace("#", "") || undefined,
                                    newData.prompt,
                                    "unsent",
                                );
                            } catch (error) {
                                console.error(
                                    "Failed to save email to database:",
                                    error,
                                );
                            }
                        } else {
                            await addMessage(
                                `❌Failed to generate email: ${
                                    response.error || "Unknown error"
                                }`,
                                "assistant",
                            );
                        }
                    } catch (error) {
                        console.error("Error generating email:", error);
                        await addMessage(
                            "❌Something went wrong. Please try again later",
                            "assistant",
                        );
                    } finally {
                        setIsEmailGenerating(false);
                    }
                }, 3000);

                setCommandState({
                    ...commandState,
                    step: 0,
                    data: {},
                });
                setMessage("");
                setHashTag("");
            } catch (error) {
                console.error("Error generating email:", error);
                setIsEmailGenerating(false);
            }

            setCommandState({
                isActive: false,
                command: "",
                step: 0,
                data: {},
            });
            setMessage("");
        }
    };

    const totalSteps =
        commandState.command &&
        commands[commandState.command as keyof typeof commands]
            ? commands[commandState.command as keyof typeof commands].steps
                  .length
            : 0;

    // Handle regular message submission
    const handleRegularMessage = async () => {
        if (!message.trim()) return;

        const userMessage = message.trim();
        const tone = hashTag.replace("#", "") || undefined;

        await addMessage(userMessage, "user", hashTag);
        setMessage("");
        setIsAIThinking(true);

        try {
            const response = await apiService.sendChatMessage({
                message: userMessage,
                tone,
            });

            if (response.success && response.message) {
                await addMessage(response.message, "assistant");
            } else {
                await addMessage(
                    `❌Failed to get response: ${
                        response.error || "Unknown error"
                    }`,
                    "assistant",
                );
            }
        } catch (error) {
            console.error("Error handling regular message:", error);
            await addMessage(
                "❌Something went wrong. Please try again later",
                "assistant",
            );
        } finally {
            setIsAIThinking(false);
        }

        console.log("Regular message:", message);
        // TODO: Handle regular chat message
        setMessage("");
    };

    // Handle submit (Enter key or button click)
    const handleSubmit = () => {
        if (commandState.isActive) {
            handleCommandStep();
        } else {
            handleRegularMessage();
        }
    };

    // Handle Enter key
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        } else if (e.key === "Escape") {
            cancelCommand();
        }
    };

    // Cancel command
    const cancelCommand = () => {
        setClearCountdown(0); // Reset countdown
        setEmailValidationError(false);
        setCommandState({
            isActive: false,
            command: "",
            step: 0,
            data: {},
        });
        setMessage("");
    };

    // Handle email message updates (for Edit and Regenerate)
    const handleUpdateMessage = (
        messageId: string,
        updatedEmailData: EmailData,
    ) => {
        setMessages((prev) =>
            prev.map((msg) =>
                msg.id === messageId
                    ? { ...msg, emailData: updatedEmailData }
                    : msg,
            ),
        );
    };

    // Get current placeholder text
    const getPlaceholder = () => {
        if (commandState.isActive) {
            if (commandState.command === "/clear") {
                return "Clearing chat history...";
            }
            const currentCommand =
                commands[commandState.command as keyof typeof commands];
            const currentStep = currentCommand.steps[commandState.step];
            return currentStep.prompt;
        }
        return "Type your message or use /email to generate an email...";
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Main Chat Container */}
            <div className="flex-1 flex flex-col relative mx-2">
                <div
                    className="flex flex-col h-[calc(100vh-100px)] lg:h-full max-w-4xl w-full mx-auto border shadow-xl rounded-lg overflow-hidden my-3 mx-3 lg:my-4 lg:mx-auto"
                    style={{
                        borderColor: currentColors.border,
                    }}
                >
                    {/* Header */}
                    <Header setMessages={setMessages} />

                    {/* Chat Messages Area */}
                    <ChatArea
                        messages={messages}
                        isLoading={isLoading}
                        isAIThinking={isAIThinking}
                        isEmailGenerating={isEmailGenerating}
                        onScrollToTop={loadOlderMessages}
                        onUpdateMessage={handleUpdateMessage}
                    />

                    {/* Command Status Bar */}
                    {commandState.isActive && (
                        <CommandStatusBar
                            commandState={commandState}
                            clearCountdown={clearCountdown}
                            totalSteps={totalSteps}
                            onCancel={cancelCommand}
                            currentMessage={message}
                            isValidEmail={isValidEmail}
                            showValidationError={emailValidationError}
                        />
                    )}

                    {/* Input Section */}
                    <div
                        className="border-t p-4"
                        style={{
                            borderColor: currentColors.border,
                        }}
                    >
                        <div className="flex items-end space-x-3">
                            {/* Message Input */}
                            <div
                                className="flex-1 border p-3 overflow-hidden rounded-lg"
                                style={{
                                    borderColor: currentColors.border,
                                    color: currentColors.text,
                                }}
                                tabIndex={-1}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor =
                                        currentColors.text || "#2563eb";
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor =
                                        currentColors.border;
                                }}
                            >
                                <textarea
                                    ref={textareaRef}
                                    value={message}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    className="w-full resize-none focus:outline-none scrollbar-hide"
                                    style={{
                                        scrollbarWidth: "none",
                                        msOverflowStyle: "none",
                                        color: currentColors.text,
                                    }}
                                    rows={2}
                                    placeholder={getPlaceholder()}
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <HashTag
                                        hashTag={hashTag}
                                        setHashTag={setHashTag}
                                    />

                                    <span className="text-xs select-none opacity-50">
                                        {commandState.isActive &&
                                        commandState.command === "/email" &&
                                        commandState.step === 0
                                            ? `${message.length}/${emailLength}`
                                            : `${message.length}/${maxMessageLength}`}
                                    </span>
                                </div>
                            </div>

                            {/* Send Buttons */}
                            <SendButtons
                                onSubmit={handleSubmit}
                                disabled={
                                    !message.trim() ||
                                    (commandState.isActive &&
                                        commandState.command === "/clear")
                                }
                            />
                        </div>

                        {/* Quick Action Buttons - Hide during command mode */}
                        {!commandState.isActive && (
                            <QuickActions
                                setMessage={setMessage}
                                setHashTag={setHashTag}
                                hashTag={hashTag}
                            />
                        )}

                        {/* Command Help */}
                        {!commandState.isActive &&
                            (message === "/" || message.includes("#")) && (
                                <CommandHelp />
                            )}
                    </div>
                </div>
            </div>

            {/* Desktop Side Action Bar */}
            <div className="hidden lg:flex flex-col items-center justify-start space-y-4 py-8 pr-4 absolute right-0 top-0 bottom-0 z-10">
                <div className="flex flex-col items-center justify-center gap-4">
                    {theme !== "system" && <ToggleTheme />}
                    <Link to="/drafts">
                        <div className="flex items-center justify-center gap-2 cursor-pointer hover:scale-110 transition-transform duration-200">
                            <div className="hover:rotate-12 transition-transform duration-200 cursor-pointer">
                                <MdDrafts
                                    size={24}
                                    style={{ color: currentColors.text }}
                                />
                            </div>
                        </div>
                    </Link>
                    <Link to="/settings">
                        <div className="flex items-center justify-center gap-2 cursor-pointer hover:scale-110 transition-transform duration-200">
                            {theme === "system" && (
                                <span
                                    className="font-medium text-sm mb-1"
                                    style={{
                                        color: currentColors.textSecondary,
                                    }}
                                >
                                    Settings
                                </span>
                            )}
                            <div className="hover:rotate-180 transition-transform duration-200 cursor-pointer">
                                <IoSettingsOutline
                                    size={24}
                                    style={{ color: currentColors.text }}
                                />
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Mobile Bottom Action Bar */}
            <div
                className="lg:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around border-t p-3 backdrop-blur-md z-50"
                style={{
                    backgroundColor: currentColors.surface + "f5",
                    borderColor: currentColors.border,
                }}
            >
                {theme !== "system" ? (
                    <ToggleTheme />
                ) : (
                    <div className="flex items-center gap-2 select-none">
                        <MdOutlineDesktopWindows
                            size={20}
                            style={{ color: currentColors.textSecondary }}
                        />
                        <span
                            className="font-medium text-sm"
                            style={{ color: currentColors.textSecondary }}
                        >
                            Auto
                        </span>
                    </div>
                )}

                <div
                    className="h-6 w-px"
                    style={{ backgroundColor: currentColors.border }}
                />

                <Link to="/drafts">
                    <MdDrafts size={24} style={{ color: currentColors.text }} />
                </Link>

                <div
                    className="h-6 w-px"
                    style={{ backgroundColor: currentColors.border }}
                />

                <Link to="/settings">
                    <IoSettingsOutline
                        size={24}
                        style={{ color: currentColors.text }}
                    />
                </Link>
            </div>
        </div>
    );
};

export default EmailForm;
