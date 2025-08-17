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
        <div className="p-4 bg-gray-200 dark:bg-gray-700 rounded-sm shadow-sm dark:shadow-gray-900/30">
            <p className="text-gray-800 dark:text-gray-200 select-none">
                I'll help you create that email. Here's a professional template:
                SEND To{" "}
                <i className="text-gray-800 dark:text-gray-200 font-bold">
                    {emailData?.to}
                </i>{" "}
            </p>

            {/* Email Preview Box */}
            <div className="mt-3 p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm dark:shadow-gray-900/20">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Generated Email:
                </div>
                <div className="space-y-2 whitespace-pre-wrap">
                    <div>
                        <strong className="text-gray-900 dark:text-gray-100">
                            Subject:
                        </strong>{" "}
                        <span className="text-gray-800 dark:text-gray-200">
                            {emailData?.subject}
                        </span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                        <p className="mt-1 text-gray-800 dark:text-gray-200">
                            {emailData?.body}
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-3">
                <button
                    className="border border-gray-300 dark:border-gray-600 px-3 py-1 rounded text-sm hover:bg-green-700 dark:hover:bg-green-600 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-white w-16 disabled:bg-gray-200 dark:disabled:bg-gray-600 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:bg-gray-200 dark:disabled:hover:bg-gray-600 disabled:hover:text-gray-400 dark:disabled:hover:text-gray-500 shadow-sm dark:shadow-gray-900/30"
                    onClick={sendEmail}
                    disabled={isLoading}
                >
                    {getButtonText()}
                </button>
                <button className="border border-gray-300 dark:border-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-white shadow-sm dark:shadow-gray-900/30">
                    Save as Draft
                </button>
                <button className="border border-gray-300 dark:border-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-white shadow-sm dark:shadow-gray-900/30">
                    Edit
                </button>
                <button className="border border-gray-300 dark:border-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-white shadow-sm dark:shadow-gray-900/30">
                    Regenerate
                </button>
                <button
                    className="border border-gray-300 dark:border-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 hover:text-white cursor-pointer shadow-sm dark:shadow-gray-900/30"
                    onClick={copy_to_clipboard}
                >
                    {copied ? <GoCheck size={18} /> : <GoCopy size={18} />}
                </button>
                <button
                    className="border border-gray-300 dark:border-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 hover:text-white cursor-pointer disabled:bg-gray-200 dark:disabled:bg-gray-600 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:bg-gray-200 dark:disabled:hover:bg-gray-600 disabled:hover:text-gray-400 dark:disabled:hover:text-gray-500 shadow-sm dark:shadow-gray-900/30"
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
