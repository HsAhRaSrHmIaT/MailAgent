import EmailPreviewBox from "../templates/EmailPreviewBox";

const ChatArea = () => {
    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Sample Chat Messages */}
            <div className="flex justify-start">
                <div className="bg-gray-200 rounded-sm p-3 max-w-xs">
                    <p className="text-gray-800">
                        Hello! I can help you with chat conversations and
                        generating emails. What would you like to do today?
                    </p>
                </div>
            </div>

            <div className="flex justify-end">
                <div className="bg-gray-700 text-white rounded-sm p-3 max-w-xs">
                    <p>
                        I need to write a professional email to my client about
                        project updates. His email is{" "}
                        <i className="text-gray-200 font-bold">
                            abc@example.com
                        </i>
                    </p>
                </div>
            </div>

            <div className="flex justify-start">
                <div className="bg-gray-200 rounded-sm p-3 max-w-md">
                    <p className="text-gray-800 select-none">
                        I'll help you create that email. Here's a professional
                        template: SEND To{" "}
                        <i className="text-gray-800 font-bold">
                            abc@example.com
                        </i>
                    </p>

                    <EmailPreviewBox />
                </div>
            </div>
        </div>
    );
};

export default ChatArea;
