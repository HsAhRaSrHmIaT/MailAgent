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
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const emailLength = 50;
    const maxMessageLength = 300;
    const { currentColors } = useTheme();

    const addMessage = (
        content: string,
        sender: "user" | "assistant",
        hashtag?: string,
        type: "text" | "email" = "text",
        emailData?: EmailData
    ) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            content,
            sender,
            timestamp: new Date(),
            hashtag,
            type,
            emailData,
        };
        setMessages((prev) => [...prev, newMessage]);
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
        // Initialize loading state
        setIsLoading(true);

        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

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
                        // TODO: Add actual chat clearing logic here
                        setMessages([]);
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
    const handleCommandStep = () => {
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
            addMessage(
                `${newData.prompt}\nGenerating email for: **_${newData.receiverEmail}_**`,
                "user"
            );

            try {
                setTimeout(() => {
                    addMessage("Generating Email...", "assistant");
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
                            addMessage("", "assistant", undefined, "email", {
                                to: response.email.to,
                                subject: response.email.subject,
                                body: response.email.body,
                            });
                        } else {
                            addMessage(
                                `❌Failed to generate email: ${
                                    response.error || "Unknown error"
                                }`,
                                "assistant"
                            );
                        }
                    } catch (error) {
                        console.error("Error generating email:", error);
                        addMessage(
                            "❌Something went wrong. Please try again later",
                            "assistant"
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

        addMessage(userMessage, "user", hashTag);
        setMessage("");
        setIsAIThinking(true);

        try {
            const response = await apiService.sendChatMessage({
                message: userMessage,
                tone,
            });

            if (response.success && response.message) {
                addMessage(response.message, "assistant");
            } else {
                addMessage(
                    `❌Failed to get response: ${
                        response.error || "Unknown error"
                    }`,
                    "assistant"
                );
            }
        } catch (error) {
            console.error("Error handling regular message:", error);
            addMessage(
                "❌Something went wrong. Please try again later",
                "assistant"
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
        <div className="flex h-[calc(100vh-2rem)] m-4">
            {/* Main Chat Container */}
            <div
                className={`flex-1 flex flex-col max-w-4xl mx-auto border shadow-lg dark:shadow-gray-900/50 overflow-hidden`}
                style={{ borderColor: currentColors.border }}
            >
                {/* Header */}
                <Header setMessages={setMessages} />

                {/* Chat Messages Area */}
                <ChatArea
                    messages={messages}
                    isLoading={isLoading}
                    isAIThinking={isAIThinking}
                    isEmailGenerating={isEmailGenerating}
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
                            className="flex-1 border p-3 overflow-hidden"
                            style={{
                                borderColor: currentColors.border,
                                color: currentColors.text,
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
                            <div className="flex justify-between mt-1 -mb-1">
                                <HashTag
                                    hashTag={hashTag}
                                    setHashTag={setHashTag}
                                />

                                <span className="text-xs select-none">
                                    {commandState.isActive &&
                                    commandState.command === "/email" &&
                                    commandState.step === 0
                                        ? `${message.length}/${emailLength}`
                                        : `${message.length}/${maxMessageLength}`}{" "}
                                    characters
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
            <div className="flex justify-between items-center space-x-4 h-16">
                <ToggleTheme />
                <Link to="/settings">
                    <div className="hover:rotate-180 transition-transform duration-200">
                        <IoSettingsOutline
                            size={24}
                            style={{ color: currentColors.text }}
                        />
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default EmailForm;
