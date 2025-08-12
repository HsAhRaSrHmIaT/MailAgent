import { CircleLoader } from "../components/Loader";

// import { GiSpeaker } from "react-icons/gi";

const EmailPreviewBox = () => {
    return (
        <>
            <p className="text-gray-800 select-none">
                I'll help you create that email. Here's a professional template:
                SEND To{" "}
                <i className="text-gray-800 font-bold">abc@example.com</i>{" "}
            </p>
            
            {/* Email Preview Box */}
            <div className="mt-3 p-4 bg-white border border-gray-300 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">
                    Generated Email:
                </div>
                <div className="space-y-2">
                    <div>
                        <strong>Subject:</strong> Project Update - [Project
                        Name]
                    </div>
                    <div className="border-t pt-2">
                        <p>Dear [Client Name],</p>
                        <p className="mt-2">
                            I hope this email finds you well. I wanted to
                            provide you with an update on the current status of
                            your project.
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
                <button
                    className="border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-700 text-gray-700 hover:text-white cursor-pointer disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-200 disabled:hover:text-gray-400"
                    disabled={true}
                >
                    {/* <GiSpeaker size={18} /> */}
                    <CircleLoader />
                </button>
            </div>
        </>
    );
};

export default EmailPreviewBox;
