import { useEffect, useRef } from "react";

// import EmailPreviewBox from "../templates/EmailPreviewBox";
import { CircleLoader, ChatLoader, EmailGenerateLoader } from "./Loader";

interface Message {
    id: string;
    content: string;
    sender: "user" | "assistant";
    timestamp: Date;
    hashTag?: string;
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

    // const messages = [
    //     {
    //         id: "1",
    //         content: "Hello, how can I assist you today?",
    //         sender: "assistant",
    //         timestamp: new Date(),
    //     },
    //     {
    //         id: "2",
    //         content: "I'm looking for information on your services.",
    //         sender: "user",
    //         timestamp: new Date(),
    //         hashTag: "#services",
    //     },
    //     {
    //         id: "3",
    //         content: "Sure, I can help with that!",
    //         sender: "assistant",
    //         timestamp: new Date(),
    //     },
    //     {
    //         id: "4",
    //         content: "What services do you offer?",
    //         sender: "assistant",
    //         timestamp: new Date(),
    //     },
    //     {
    //         id: "5",
    //         content: "Can you provide more details?",
    //         sender: "user",
    //         timestamp: new Date(),
    //     },
    //     {
    //         id: "6",
    //         content: "What are your pricing plans?",
    //         sender: "user",
    //         timestamp: new Date(),
    //     },
    //     {
    //         id: "7",
    //         content: "In Tailwind CSS, the boldness of dotted borders—meaning how thick or prominent the dots appear—is controlled by the border-width utility. Tailwind doesn’t offer a separate utility to change the size of the dots directly, but increasing the border width will make the dots appear bolder",
    //         sender: "user",
    //         timestamp: new Date(),
    //     },
    //     {
    //         id: "8",
    //         content: "Can you help me with a project proposal?",
    //         sender: "user",
    //         timestamp: new Date(),
    //     },
    //     {
    //         id: "9",
    //         content:
    //             "What is the turnaround time for a project? So I need to know the estimated delivery date. This is important for our planning.",
    //         sender: "user",
    //         timestamp: new Date(),
    //         hashTag: "#project"
    //     },
    //     {
    //         id: "10",
    //         content: "Can you provide a timeline for the project?",
    //         sender: "assistant",
    //         timestamp: new Date(),
    //     },
    // ];

    useEffect(() => {
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        }
    }, [messages, isAIThinking]);

    return (
        <div className="flex flex-col h-screen bg-white overflow-hidden">
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
                                <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-sm ${
                                        message.sender === "user"
                                            ? "bg-gray-700 text-white"
                                            : "bg-gray-200 text-gray-800"
                                    }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">
                                        {message.content}
                                    </p>
                                    {message.hashTag && (
                                        <span className="text-xs opacity-75 block mt-3 border-t-2 border-dashed border-gray-200 -mx-4 px-2 text-center -mb-1">
                                            {message.hashTag}
                                        </span>
                                    )}
                                </div>
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
                            <div className="bg-gray-200 text-gray-800 max-w-xs lg:max-w-md px-1 py-1 rounded-sm">
                                <ChatLoader />
                            </div>
                        </div>
                    )}
                    {isEmailGenerating && (
                        <div className="flex justify-start p-4">
                            <div className="bg-gray-200 text-gray-800 max-w-xs lg:max-w-md px-1 py-1 rounded-sm">
                                <EmailGenerateLoader />
                            </div>
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
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
                    <div className="max-w-md space-y-4">
                        <div className="mb-6">
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                Chat & Email Assistant
                            </h1>
                            <p className="text-lg text-gray-600">
                                Your intelligent companion for conversations and
                                professional email drafting
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 mt-8">
                            <div className="bg-gray-50 border border-gray-200 rounded-sm p-4 transition-colors">
                                <h3 className="font-semibold text-blue-900 mb-1">
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
