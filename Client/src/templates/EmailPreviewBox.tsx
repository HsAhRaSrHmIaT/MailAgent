import { useState } from "react";
import { CircleLoader } from "../components/Loader";
import { apiService } from "../services/apiService";

import { GiSpeaker } from "react-icons/gi";
import { GoCopy, GoCheck } from "react-icons/go";

interface EmailData {
    to: string;
    subject: string;
    body: string;
}

interface EmailPreviewBoxProps {
    emailData: EmailData | null;
}

const EmailPreviewBox = ({ emailData }: EmailPreviewBoxProps) => {
    const [sent, setSent] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const copy_to_clipboard = async () => {
        if (emailData) {
            await navigator.clipboard.writeText(
                `Subject: ${emailData.subject}\n\n${emailData.body}`
            );
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const sendEmail = async () => {
        setIsLoading(true);
        try {
            if (emailData) {
                const response = await apiService.sendEmail({
                    receiverEmail: emailData.to,
                    emailMessage: emailData.body,
                    subject: emailData.subject,
                });
                if (response.success) {
                    // Assuming response.message contains a success message
                    setSent(true);
                    console.log("Email sent successfully");

                    setTimeout(() => {
                        setSent(false);
                    }, 5000);
                } else {
                    console.error("Failed to send email");
                }
            }
        } catch (error) {
            console.error("Error sending email:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getButtonText = () => {
        if (isLoading) return <CircleLoader size="sm" />;
        if (sent) return "Sent";
        return "Send";
    };

    return (
        <div className="p-4 bg-gray-200 rounded-sm">
            <p className="text-gray-800 select-none">
                I'll help you create that email. Here's a professional template:
                SEND To{" "}
                <i className="text-gray-800 font-bold">{emailData?.to}</i>{" "}
            </p>

            {/* Email Preview Box */}
            <div className="mt-3 p-4 bg-white border border-gray-300 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">
                    Generated Email:
                </div>
                <div className="space-y-2 whitespace-pre-wrap">
                    <div>
                        <strong>Subject:</strong> {emailData?.subject}
                    </div>
                    <div className="border-t pt-2">
                        <p className="mt-1">{emailData?.body}</p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-3">
                <button
                    className="border border-gray-300 px-3 py-1 rounded text-sm hover:bg-green-700 cursor-pointer text-gray-700 hover:text-white w-16 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-200 disabled:hover:text-gray-400"
                    onClick={sendEmail}
                    disabled={isLoading}
                >
                    {getButtonText()}
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
                    className="border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-700 text-gray-700 hover:text-white cursor-pointer"
                    onClick={copy_to_clipboard}
                >
                    {copied ? <GoCheck size={18} /> : <GoCopy size={18} />}
                </button>
                <button
                    className="border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-700 text-gray-700 hover:text-white cursor-pointer disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-200 disabled:hover:text-gray-400"
                    disabled={true}
                >
                    <GiSpeaker size={18} />
                    {/* <CircleLoader /> */}
                </button>
            </div>
        </div>
    );
};

export default EmailPreviewBox;
