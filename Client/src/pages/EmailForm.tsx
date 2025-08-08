import { useState, useRef, useEffect } from "react";

import { GiSpeaker } from "react-icons/gi";
import { FaMicrophone } from "react-icons/fa";
import { BsFillSendFill } from "react-icons/bs";
import { LuRefreshCcw } from "react-icons/lu";

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
                <div className="bg-gray-700 text-white p-4 flex items-center justify-between select-none">
                    <div>
                        <h1 className="text-lg font-semibold">
                            Chat & Email Assistant
                        </h1>
                        <div className="flex items-center space-x-1 ml-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-xs">Online</span>
                        </div>
                    </div>
                    <button className="bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600 transition-colors cursor-pointer">
                        <LuRefreshCcw size={20} />
                    </button>
                </div>

                {/* Chat Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Sample Chat Messages */}
                    <div className="flex justify-start">
                        <div className="bg-gray-200 rounded-sm p-3 max-w-xs">
                            <p className="text-gray-800">
                                Hello! I can help you with chat conversations
                                and generating emails. What would you like to do
                                today?
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <div className="bg-gray-700 text-white rounded-sm p-3 max-w-xs">
                            <p>
                                I need to write a professional email to my
                                client about project updates. His email is{" "}
                                <i className="text-gray-200 font-bold">
                                    abc@example.com
                                </i>
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-start">
                        <div className="bg-gray-200 rounded-sm p-3 max-w-md">
                            <p className="text-gray-800 select-none">
                                I'll help you create that email. Here's a
                                professional template: SEND To{" "}
                                <i className="text-gray-800 font-bold">
                                    abc@example.com
                                </i>
                            </p>

                            {/* Email Preview Box */}
                            <div className="mt-3 p-4 bg-white border border-gray-300 rounded-lg">
                                <div className="text-sm text-gray-600 mb-2">
                                    Generated Email:
                                </div>
                                <div className="space-y-2">
                                    <div>
                                        <strong>Subject:</strong> Project Update
                                        - [Project Name]
                                    </div>
                                    <div className="border-t pt-2">
                                        <p>Dear [Client Name],</p>
                                        <p className="mt-2">
                                            I hope this email finds you well. I
                                            wanted to provide you with an update
                                            on the current status of your
                                            project.
                                        </p>
                                        <p className="mt-2">
                                            Best regards,
                                            <br />
                                            Harshit Sharma
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-2 mt-3">
                                <button className="border border-gray-300 px-3 py-1 rounded text-sm hover:bg-green-700 cursor-pointer text-gray-700 hover:text-white">
                                    Send Email
                                </button>
                                <button className="border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-700 cursor-pointer text-gray-700 hover:text-white">
                                    Save as Draft
                                </button>
                                <button className="border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-700 cursor-pointer text-gray-700 hover:text-white">
                                    Edit
                                </button>
                                <button className="border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-700 cursor-pointer text-gray-700 hover:text-white">
                                    Regenerate
                                </button>
                                <button className="border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-700 cursor-pointer text-gray-700 hover:text-white">
                                    <GiSpeaker size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Command Status Bar */}
                {commandState.isActive && (
                    <div className="bg-blue-50 border-t border-blue-200 p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <span className="text-blue-600 font-medium select-none">
                                    {commandState.command}
                                </span>

                                {commandState.command === "/clear" ? (
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs text-red-500 select-none">
                                            Clearing in {clearCountdown}s
                                        </span>
                                    </div>
                                ) : (
                                    <>
                                        <span className="text-sm text-blue-500 select-none">
                                            Step {commandState.step + 1} of{" "}
                                            {
                                                commands[
                                                    commandState.command as keyof typeof commands
                                                ].steps.length
                                            }
                                        </span>
                                        {commandState.data.receiverEmail && (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                To:{" "}
                                                {
                                                    commandState.data
                                                        .receiverEmail
                                                }
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                            <button
                                onClick={cancelCommand}
                                className="text-blue-500 hover:text-blue-700 text-sm cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
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
                                className="w-full resize-none focus:outline-none"
                                rows={2}
                                placeholder={getPlaceholder()}
                            />
                            <div className="flex justify-between mt-1 -mb-1">
                                <div className="select-none">
                                    <span className="text-xs text-gray-600 font-bold">
                                        Tag:{" "}
                                    </span>
                                    {hashTag ? (
                                        <>
                                            <span className="text-xs text-blue-400 bg-blue-50 px-1 rounded-full">
                                                {hashTag}
                                            </span>
                                            <button
                                                onClick={() => setHashTag("")}
                                                className="text-xs text-red-400 bg-red-50 hover:bg-red-100 px-1 rounded-full cursor-pointer ml-1"
                                            >
                                                Remove
                                            </button>
                                        </>
                                    ) : (
                                        <span className="text-xs text-blue-400 bg-blue-50 px-1 rounded-full">
                                            None
                                        </span>
                                    )}
                                </div>

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

                        {/* Send Button */}
                        <div className="flex flex-col space-y-3 items-center mb-0.5">
                            <button
                                onClick={handleSubmit}
                                className="bg-gray-700 text-white p-3 hover:bg-gray-800 transition-colors cursor-pointer"
                            >
                                <BsFillSendFill size={20} />
                            </button>
                            <button className="bg-gray-700 text-white p-3 hover:bg-gray-800 transition-colors cursor-pointer">
                                <FaMicrophone size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Quick Action Buttons - Hide during command mode */}
                    {!commandState.isActive && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            <button
                                onClick={() => setMessage("/")}
                                className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-300 cursor-pointer"
                            >
                                /commands
                            </button>
                            <button
                                onClick={() => setHashTag("#Confident")}
                                className={`bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-300 cursor-pointer ${hashTag === "#Confident" ? "hidden" : ""}`}
                            >
                                Confident
                            </button>
                            <button
                                onClick={() => setHashTag("#Formal")}
                                className={`bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-300 cursor-pointer ${hashTag === "#Formal" ? "hidden" : ""}`}
                            >
                                Formal
                            </button>
                            <button
                                onClick={() => setHashTag("#Casual")}
                                className={`bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-300 cursor-pointer ${hashTag === "#Casual" ? "hidden" : ""}`}
                            >
                                Casual
                            </button>
                        </div>
                    )}

                    {/* Command Help */}
                    {!commandState.isActive &&
                        (message === "/" || message.includes("#")) && (
                            <div className="mt-2 p-2 bg-gray-200 text-sm select-none">
                                <div className="font-medium text-gray-700 mb-1">
                                    Available Commands:
                                </div>
                                <div className="text-gray-600">
                                    /email - Generate and send an email
                                    <br />
                                    /clear - Clear chat history
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                    #Confident - Use confident tone
                                    <br />
                                    #Formal - Use formal tone
                                    <br />
                                    #Casual - Use casual tone
                                </div>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
};

export default EmailForm;
