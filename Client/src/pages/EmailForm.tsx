import React, { useState, useRef, useEffect } from "react";

import QuickActions from "../components/QuickActions";
import CommandHelp from "../components/CommandHelp";
import ChatArea from "../components/ChatArea";
import Header from "../components/Header";
import CommandStatusBar from "../components/CommandStatusBar";
import SendButtons from "../components/SendButtons";
import HashTag from "../components/HashTag";
import ToggleTheme from "../components/ToggleTheme";
import VoiceInterface from "../components/VoiceInterface";
import RecipientInput from "../components/RecipientInput";

import { apiService } from "../services/apiService";
import { useTheme } from "../contexts/ThemeContext";

import { IoSettingsOutline } from "react-icons/io5";
import {
    MdOutlineDesktopWindows,
    MdDrafts,
    MdAdd,
    MdClose,
    MdKeyboardArrowLeft,
    MdKeyboardArrowRight,
} from "react-icons/md";
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
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [commandRecipients, setCommandRecipients] = useState<string[]>([]);
    const [recipientInputError, setRecipientInputError] = useState(false);
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
    const [isDesktopActionsCollapsed, setIsDesktopActionsCollapsed] =
        useState(true);
    const [isMobileActionsOpen, setIsMobileActionsOpen] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const emailLength = 2000; // Increased to allow multiple emails
    const maxMessageLength = 300;
    const { currentColors, theme } = useTheme();

    const addMessage = async (
        content: string,
        sender: "user" | "assistant",
        hashtag?: string,
        type: "text" | "email" = "text",
        emailData?: EmailData,
        emailId?: string,
        tone?: string,
        prompt?: string,
        status?: string,
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
            status,
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
                        status: email.status,
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
        let interval: ReturnType<typeof setInterval> | undefined;
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

        // Special handling for /email command step 0 (recipients)
        if (commandState.command === "/email" && commandState.step === 0) {
            // Validate recipients from chip input
            if (commandRecipients.length === 0) {
                setEmailValidationError(true);
                return;
            }

            setEmailValidationError(false);

            // Store recipients in command data
            const newData = {
                ...commandState.data,
                receiverEmails: commandRecipients, // Store as array
            };

            // Move to next step (prompt)
            setCommandState({
                ...commandState,
                step: commandState.step + 1,
                data: newData,
            });
            return;
        }

        // Regular text input handling for other steps
        if (!message.trim()) return;

        setEmailValidationError(false);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newData: Record<string, any> = {
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
            // Determine if single or bulk send
            const recipients = newData.receiverEmails as string[];
            const isBulkSend = recipients.length > 1;

            // Add user message immediately
            await addMessage(
                `${newData.prompt}\nGenerate email for: ${isBulkSend ? `**_${recipients.length} recipients_**` : `**_${recipients[0]}_**`}`,
                "user",
            );

            // Reset command state and clear input
            setCommandState({
                isActive: false,
                command: "",
                step: 0,
                data: {},
            });
            setMessage("");
            setCommandRecipients([]); // Clear recipients
            const currentHashTag = hashTag;
            setHashTag("");

            // Show loading state
            setIsEmailGenerating(true);

            try {
                // Generate email for first recipient (same content for all in bulk)
                const response = await apiService.generateEmail({
                    receiverEmail: recipients[0],
                    prompt: newData.prompt!,
                    tone: currentHashTag.replace("#", "") || undefined,
                });

                if (response.success && response.email) {
                    const emailId = Date.now().toString();

                    // Store recipients as comma-separated string
                    const recipientsString = recipients.join(", ");

                    // Add email message to chat (show first recipient or count)
                    await addMessage(
                        "",
                        "assistant",
                        currentHashTag || undefined,
                        "email",
                        {
                            to: isBulkSend
                                ? `${recipients.length} recipients`
                                : recipientsString,
                            subject: response.email.subject,
                            body: response.email.body,
                        },
                        emailId,
                        currentHashTag.replace("#", "") || undefined,
                        newData.prompt,
                        "unsent",
                    );

                    // Save email to database with all recipient info
                    try {
                        await apiService.saveEmail(
                            emailId,
                            recipientsString,
                            response.email.subject,
                            response.email.body,
                            new Date(),
                            currentHashTag.replace("#", "") || undefined,
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
                        `❌ Failed to generate email: ${
                            response.error || "Unknown error"
                        }`,
                        "assistant",
                    );
                }
            } catch (error) {
                console.error("Error generating email:", error);
                await addMessage(
                    "❌ Something went wrong. Please try again later",
                    "assistant",
                );
            } finally {
                setIsEmailGenerating(false);
            }
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
        const currentHashTag = hashTag;
        const tone = currentHashTag.replace("#", "") || undefined;

        // Clear inputs immediately for instant feedback
        setMessage("");

        // Add user message first (sync state update)
        setMessages((prev) => [
            ...prev,
            {
                id: Date.now().toString(),
                content: userMessage,
                sender: "user" as const,
                timestamp: new Date(),
                hashtag: currentHashTag,
                type: "text" as const,
            },
        ]);

        // Then show loading
        setIsAIThinking(true);

        // Save message to database in background
        try {
            await apiService.saveMessage({
                id: Date.now().toString(),
                content: userMessage,
                sender: "user",
                timestamp: new Date(),
                hashtag: currentHashTag,
                type: "text",
            });
        } catch (error) {
            console.error("Failed to save message:", error);
        }

        try {
            const response = await apiService.sendChatMessage({
                message: userMessage,
                tone,
            });

            // Hide loader immediately when response arrives
            setIsAIThinking(false);

            if (response.success && response.message) {
                await addMessage(response.message, "assistant");
            } else {
                await addMessage(
                    `❌ Failed to get response: ${
                        response.error || "Unknown error"
                    }`,
                    "assistant",
                );
            }
        } catch (error) {
            console.error("Error handling regular message:", error);
            setIsAIThinking(false);
            await addMessage(
                "❌ Something went wrong. Please try again later",
                "assistant",
            );
        }
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
        setCommandRecipients([]); // Clear recipients
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
            if (commandState.command === "/email" && commandState.step === 0) {
                return "Enter your email prompt...";
            }
            const currentCommand =
                commands[commandState.command as keyof typeof commands];
            const currentStep = currentCommand.steps[commandState.step];
            return currentStep.prompt;
        }
        return "Type your message or use /email to generate an email...";
    };

    return (
        <div
            className="relative flex h-screen overflow-hidden"
            style={{ backgroundColor: currentColors.bg }}
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-80"
                style={{
                    background:
                        `radial-gradient(circle at top left, ${currentColors.border}18 0%, transparent 34%),` +
                        `radial-gradient(circle at bottom right, ${currentColors.chatBubble}14 0%, transparent 30%),` +
                        `linear-gradient(180deg, ${currentColors.bg} 0%, ${currentColors.surface}12 100%)`,
                }}
            />
            {/* Main Chat Container */}
            <div className="relative z-10 flex flex-1 flex-col px-2 py-2 sm:px-3 lg:px-4 lg:py-4">
                <div
                    className="flex h-[calc(100vh-1rem)] w-full max-w-4xl mx-auto flex-col overflow-hidden rounded-[30px] border shadow-xl backdrop-blur-2xl sm:h-[calc(100vh-1.5rem)] lg:h-[calc(100vh-2rem)]"
                    style={{
                        borderColor: currentColors.border,
                        background: `linear-gradient(180deg, ${currentColors.surface}F8 0%, ${currentColors.surface}EC 100%)`,
                        boxShadow: `0 1px 0 ${currentColors.border}2A inset, 0 28px 80px ${currentColors.border}1F`,
                    }}
                >
                    {/* Header */}
                    <Header setMessages={setMessages} />
                    {/* Conditional rendering: Voice Interface or Chat Area */}
                    {isVoiceMode ? (
                        <VoiceInterface onClose={() => setIsVoiceMode(false)} />
                    ) : (
                        <>
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
                                    showValidationError={
                                        commandState.command === "/email" &&
                                        commandState.step === 0
                                            ? recipientInputError
                                            : emailValidationError
                                    }
                                />
                            )}
                            {/* Input Section */}
                            <div
                                className="border-t px-4 py-4 sm:px-5"
                                style={{
                                    borderColor: currentColors.border,
                                    background: `linear-gradient(180deg, ${currentColors.surface}A8 0%, ${currentColors.surface}E8 100%)`,
                                }}
                            >
                                <div className="flex items-end space-x-3">
                                    {/* Message Input */}
                                    <div
                                        className="flex-1 overflow-hidden rounded-2xl border px-3 py-3 shadow-inner transition-all duration-200"
                                        style={{
                                            borderColor:
                                                commandState.isActive &&
                                                commandState.command ===
                                                    "/email" &&
                                                commandState.step === 0 &&
                                                recipientInputError
                                                    ? "#EF4444"
                                                    : emailValidationError
                                                      ? "#EF4444"
                                                      : currentColors.border,
                                            color: currentColors.text,
                                            background: `linear-gradient(180deg, ${currentColors.surface}F6 0%, ${currentColors.bg}F2 100%)`,
                                            boxShadow: `0 1px 0 ${currentColors.border}1A inset, 0 10px 30px ${currentColors.border}0F`,
                                        }}
                                        tabIndex={-1}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor =
                                                commandState.isActive &&
                                                commandState.command ===
                                                    "/email" &&
                                                commandState.step === 0 &&
                                                recipientInputError
                                                    ? "#EF4444"
                                                    : currentColors.text ||
                                                      "#2563eb";
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor =
                                                commandState.isActive &&
                                                commandState.command ===
                                                    "/email" &&
                                                commandState.step === 0 &&
                                                recipientInputError
                                                    ? "#EF4444"
                                                    : currentColors.border;
                                        }}
                                    >
                                        {/* Show RecipientInput for /email step 0 */}
                                        {commandState.isActive &&
                                        commandState.command === "/email" &&
                                        commandState.step === 0 ? (
                                            <RecipientInput
                                                recipients={commandRecipients}
                                                onRecipientsChange={
                                                    setCommandRecipients
                                                }
                                                maxRecipients={50}
                                                onErrorChange={
                                                    setRecipientInputError
                                                }
                                            />
                                        ) : (
                                            <>
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
                                                        {`${message.length}/${maxMessageLength}`}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Send Buttons */}
                                    <SendButtons
                                        onSubmit={handleSubmit}
                                        disabled={
                                            // For /email step 0, need recipients
                                            (commandState.isActive &&
                                                commandState.command ===
                                                    "/email" &&
                                                commandState.step === 0 &&
                                                commandRecipients.length ===
                                                    0) ||
                                            // For other steps, need message
                                            (commandState.isActive &&
                                                commandState.step > 0 &&
                                                !message.trim()) ||
                                            // Regular message needs text
                                            (!commandState.isActive &&
                                                !message.trim()) ||
                                            // Disable during clear
                                            (commandState.isActive &&
                                                commandState.command ===
                                                    "/clear") ||
                                            isLoading
                                        }
                                        isVoiceMode={isVoiceMode}
                                        onToggleVoiceMode={() =>
                                            setIsVoiceMode(!isVoiceMode)
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
                                    (message === "/" || message === "#") && (
                                        <CommandHelp />
                                    )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Desktop Side Action Bar */}
            <div className="fixed right-4 top-1/2 z-20 hidden -translate-y-1/2 lg:block">
                <div className="relative overflow-visible">
                    <button
                        type="button"
                        className={`group absolute right-0 top-1/2 z-20 flex h-14 items-center gap-3 rounded-full border px-4 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-out ${
                            isDesktopActionsCollapsed
                                ? "translate-x-0 opacity-100 scale-100"
                                : "pointer-events-none translate-x-5 opacity-0 scale-95"
                        }`}
                        style={{
                            backgroundColor: `${currentColors.surface}F2`,
                            borderColor: currentColors.border,
                            color: currentColors.text,
                            boxShadow: `0 24px 60px ${currentColors.border}24`,
                        }}
                        onClick={() => setIsDesktopActionsCollapsed(false)}
                        aria-label="Expand actions panel"
                        title="Open actions panel"
                    >
                        <span
                            className="flex h-9 w-9 items-center justify-center rounded-full border transition-transform duration-300 group-hover:scale-105"
                            style={{
                                backgroundColor: `${currentColors.border}18`,
                                borderColor: `${currentColors.border}30`,
                            }}
                        >
                            <MdOutlineDesktopWindows size={18} />
                        </span>

                        <span className="flex min-w-0 flex-col items-start leading-none">
                            <span
                                className="text-[10px] font-semibold uppercase tracking-[0.24em]"
                                style={{ color: currentColors.textSecondary }}
                            >
                                Expand
                            </span>
                        </span>

                        <span
                            className="flex h-7 w-7 items-center justify-center rounded-full border transition-transform duration-300 group-hover:translate-x-0.5"
                            style={{
                                backgroundColor: `${currentColors.border}12`,
                                borderColor: `${currentColors.border}28`,
                            }}
                        >
                            <MdKeyboardArrowLeft size={20} />
                        </span>
                    </button>

                    <div
                        className={`absolute right-0 top-1/2 w-[300px] -translate-y-1/2 origin-right overflow-hidden rounded-[28px] border px-3 py-4 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-out ${
                            isDesktopActionsCollapsed
                                ? "pointer-events-none translate-x-6 scale-[0.97] opacity-0"
                                : "translate-x-0 scale-100 opacity-100"
                        }`}
                        style={{
                            backgroundColor: `${currentColors.surface}F0`,
                            borderColor: currentColors.border,
                            boxShadow: `0 24px 60px ${currentColors.border}24`,
                        }}
                    >
                        <div className="flex items-center justify-between gap-2 pb-2">
                            <div
                                className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]"
                                style={{
                                    backgroundColor: `${currentColors.border}24`,
                                    color: currentColors.textSecondary,
                                }}
                            >
                                Actions
                            </div>

                            <button
                                type="button"
                                className="flex h-9 w-9 items-center justify-center rounded-full border transition-transform duration-200 hover:scale-105"
                                style={{
                                    backgroundColor: `${currentColors.border}18`,
                                    borderColor: currentColors.border,
                                    color: currentColors.text,
                                }}
                                onClick={() =>
                                    setIsDesktopActionsCollapsed(true)
                                }
                                aria-label="Collapse actions panel"
                                title="Collapse actions panel"
                            >
                                <MdKeyboardArrowRight size={20} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-3 transition-all duration-300">
                            {theme !== "system" && (
                                <div className="flex justify-center pt-1">
                                    <ToggleTheme />
                                </div>
                            )}

                            <Link
                                to="/drafts"
                                className="group flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200 hover:-translate-y-0.5"
                                style={{
                                    backgroundColor: `${currentColors.border}14`,
                                }}
                            >
                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                                    style={{
                                        backgroundColor: `${currentColors.border}1E`,
                                        color: currentColors.text,
                                    }}
                                >
                                    <MdDrafts
                                        size={22}
                                        className="transition-transform duration-200 group-hover:rotate-15"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <div
                                        className="text-sm font-semibold"
                                        style={{ color: currentColors.text }}
                                    >
                                        Drafts
                                    </div>
                                    <div
                                        className="text-xs"
                                        style={{
                                            color: currentColors.textSecondary,
                                        }}
                                    >
                                        Review saved emails
                                    </div>
                                </div>
                            </Link>

                            <Link
                                to="/settings"
                                className="group flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200 hover:-translate-y-0.5"
                                style={{
                                    backgroundColor: `${currentColors.border}14`,
                                }}
                            >
                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                                    style={{
                                        backgroundColor: `${currentColors.border}1E`,
                                        color: currentColors.text,
                                    }}
                                >
                                    <IoSettingsOutline
                                        size={22}
                                        className="transition-transform duration-200 group-hover:rotate-90"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <div
                                        className="text-sm font-semibold"
                                        style={{ color: currentColors.text }}
                                    >
                                        Settings
                                    </div>
                                    <div
                                        className="text-xs"
                                        style={{
                                            color: currentColors.textSecondary,
                                        }}
                                    >
                                        Manage app preferences
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Floating Action Bubble */}
            <div className="lg:hidden fixed bottom-4 right-4 z-50 pb-[env(safe-area-inset-bottom)]">
                <div className="relative flex items-end justify-end">
                    <div
                        className={`absolute bottom-16 right-0 flex flex-col items-end gap-3 transition-all duration-300 ${
                            isMobileActionsOpen
                                ? "pointer-events-auto translate-y-0 opacity-100"
                                : "pointer-events-none translate-y-3 opacity-0"
                        }`}
                    >
                        {theme !== "system" ? (
                            <div
                                className="rounded-2xl border px-3 py-2 shadow-lg backdrop-blur-xl"
                                style={{
                                    backgroundColor: `${currentColors.surface}F2`,
                                    borderColor: currentColors.border,
                                }}
                            >
                                <ToggleTheme />
                            </div>
                        ) : (
                            <div
                                className="flex items-center gap-2 rounded-full border px-4 py-3 shadow-lg backdrop-blur-xl"
                                style={{
                                    backgroundColor: `${currentColors.surface}F2`,
                                    borderColor: currentColors.border,
                                }}
                            >
                                <MdOutlineDesktopWindows
                                    size={18}
                                    style={{
                                        color: currentColors.textSecondary,
                                    }}
                                />
                                <span
                                    className="text-xs font-semibold uppercase tracking-[0.18em]"
                                    style={{
                                        color: currentColors.textSecondary,
                                    }}
                                >
                                    Auto
                                </span>
                            </div>
                        )}

                        <Link
                            to="/drafts"
                            className="flex items-center gap-3 rounded-full border px-4 py-3 shadow-lg backdrop-blur-xl transition-transform duration-200 active:scale-95"
                            style={{
                                backgroundColor: `${currentColors.surface}F2`,
                                borderColor: currentColors.border,
                            }}
                            onClick={() => setIsMobileActionsOpen(false)}
                        >
                            <MdDrafts
                                size={20}
                                style={{ color: currentColors.text }}
                            />
                            <span
                                className="text-sm font-semibold"
                                style={{ color: currentColors.text }}
                            >
                                Drafts
                            </span>
                        </Link>

                        <Link
                            to="/settings"
                            className="flex items-center gap-3 rounded-full border px-4 py-3 shadow-lg backdrop-blur-xl transition-transform duration-200 active:scale-95"
                            style={{
                                backgroundColor: `${currentColors.surface}F2`,
                                borderColor: currentColors.border,
                            }}
                            onClick={() => setIsMobileActionsOpen(false)}
                        >
                            <IoSettingsOutline
                                size={20}
                                style={{ color: currentColors.text }}
                            />
                            <span
                                className="text-sm font-semibold"
                                style={{ color: currentColors.text }}
                            >
                                Settings
                            </span>
                        </Link>
                    </div>

                    <button
                        type="button"
                        className="flex h-14 w-14 items-center justify-center rounded-full border shadow-2xl backdrop-blur-xl transition-transform duration-200 active:scale-95"
                        style={{
                            backgroundColor: currentColors.surface,
                            borderColor: currentColors.border,
                            color: currentColors.text,
                            boxShadow: `0 18px 40px ${currentColors.border}30`,
                        }}
                        onClick={() => setIsMobileActionsOpen((prev) => !prev)}
                        aria-label={
                            isMobileActionsOpen
                                ? "Collapse actions"
                                : "Expand actions"
                        }
                        aria-expanded={isMobileActionsOpen}
                    >
                        <span
                            className={`flex transition-transform duration-300 ${
                                isMobileActionsOpen ? "rotate-90" : "rotate-0"
                            }`}
                        >
                            {isMobileActionsOpen ? (
                                <MdClose size={24} />
                            ) : (
                                <MdAdd size={26} />
                            )}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailForm;
