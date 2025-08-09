import { useState, useRef, useEffect } from "react";

import QuickActions from "../components/QuickActions";
import CommandHelp from "../components/CommandHelp";
import ChatArea from "../components/ChatArea";
import Header from "../components/Header";
import CommandStatusBar from "../components/CommandStatusBar";
import SendButtons from "../components/SendButtons";
import HashTag from "../components/HashTag";

interface CommandState {
    isActive: boolean;
    command: string;
    step: number;
    data: {
        receiverEmail?: string;
        prompt?: string;
    };
    clearAll?: boolean;
}

const EmailForm = () => {
    const [message, setMessage] = useState("");
    const [hashTag, setHashTag] = useState("");
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
    const maxMessageLength = 500;

    // Command definitions
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
    };

    // Countdown effect for clear command
    useEffect(() => {
        let interval: number;
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
            }
        }
    };

    // Handle command step submission
    const handleCommandStep = () => {
        const currentCommand =
            commands[commandState.command as keyof typeof commands];
        const currentStep = currentCommand.steps[commandState.step];

        if (!message.trim()) return;

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
            // Command complete - here you would handle the email generation
            console.log("Email command data:", newData);

            // Reset command state
            setCommandState({
                isActive: false,
                command: "",
                step: 0,
                data: {},
            });
            setMessage("");

            // TODO: Trigger email generation with newData.receiverEmail and newData.prompt
        }
    };

    const totalSteps =
        commandState.command &&
        commands[commandState.command as keyof typeof commands]
            ? commands[commandState.command as keyof typeof commands].steps
                  .length
            : 0;

    // Handle regular message submission
    const handleRegularMessage = () => {
        if (!message.trim()) return;

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
            <div className="flex-1 flex flex-col max-w-4xl mx-auto bg-white shadow-lg overflow-hidden">
                {/* Header */}
                <Header />

                {/* Chat Messages Area */}
                <ChatArea />

                {/* Command Status Bar */}
                {commandState.isActive && (
                    <CommandStatusBar
                        commandState={commandState}
                        clearCountdown={clearCountdown}
                        totalSteps={totalSteps}
                        onCancel={cancelCommand}
                    />
                )}

                {/* Input Section */}
                <div className="border-t bg-gray-50 p-4">
                    <div className="flex items-end space-x-3">
                        {/* Message Input */}
                        <div className="flex-1 border border-gray-300 p-3 bg-white focus-within:border-gray-700 overflow-hidden">
                            <textarea
                                ref={textareaRef}
                                value={message}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                className="w-full resize-none focus:outline-none scrollbar-hide"
                                style={{
                                    scrollbarWidth: "none",
                                    msOverflowStyle: "none",
                                }}
                                rows={2}
                                placeholder={getPlaceholder()}
                            />
                            <div className="flex justify-between mt-1 -mb-1">
                                <HashTag
                                    hashTag={hashTag}
                                    setHashTag={setHashTag}
                                />

                                <span className="text-xs text-gray-500 select-none">
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
                        <SendButtons handleSubmit={handleSubmit} />
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
    );
};

export default EmailForm;
