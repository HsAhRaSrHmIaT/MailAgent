import { useState } from "react";
import { CircleLoader } from "../components/Loader";
import { apiService } from "../services/apiService";
import type { EmailPreviewBoxProps } from "../types";
import { useTheme } from "../contexts/ThemeContext";

import { GiSpeaker } from "react-icons/gi";
import { GoCopy, GoCheck } from "react-icons/go";

const EmailPreviewBox = ({ emailData }: EmailPreviewBoxProps) => {
    const [sent, setSent] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { currentColors } = useTheme();

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
        <div
            className="p-3 sm:p-4 rounded-sm shadow-sm"
            style={{
                background: currentColors.surface,
                color: currentColors.text,
            }}
        >
            <p className="select-none text-sm sm:text-base">
                I'll help you create that email. Here's a professional template:
                SEND To <i className="font-bold">{emailData?.to}</i>{" "}
            </p>

            {/* Email Preview Box */}
            <div
                className="mt-3 p-3 sm:p-4 border rounded-lg shadow-sm"
                style={{
                    background: currentColors.bg,
                    borderColor: currentColors.border,
                }}
            >
                <div
                    className="text-sm mb-2"
                    style={{ color: currentColors.textSecondary }}
                >
                    Generated Email:
                </div>
                <div className="space-y-2 whitespace-pre-wrap">
                    <div>
                        <strong>Subject:</strong>{" "}
                        <span>{emailData?.subject}</span>
                    </div>
                    <div
                        className="border-t pt-2"
                        style={{ borderColor: currentColors.border }}
                    >
                        <p className="mt-1">{emailData?.body}</p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3">
                <button
                    className="border px-2 sm:px-3 py-1 rounded text-xs sm:text-sm w-14 sm:w-16 shadow-sm"
                    style={{
                        borderColor: currentColors.border,
                        color: currentColors.text,
                    }}
                    onClick={sendEmail}
                    disabled={isLoading}
                >
                    {getButtonText()}
                </button>
                <button
                    className="border px-2 sm:px-3 py-1 rounded text-xs sm:text-sm shadow-sm flex-shrink-0"
                    style={{
                        borderColor: currentColors.border,
                    }}
                >
                    Save as Draft
                </button>
                <button
                    className="border px-2 sm:px-3 py-1 rounded text-xs sm:text-sm shadow-sm flex-shrink-0"
                    style={{
                        borderColor: currentColors.border,
                    }}
                >
                    Edit
                </button>
                <button
                    className="border px-2 sm:px-3 py-1 rounded text-xs sm:text-sm shadow-sm flex-shrink-0"
                    style={{
                        borderColor: currentColors.border,
                    }}
                >
                    Regenerate
                </button>
                <button
                    className="border px-2 sm:px-3 py-1 rounded text-xs sm:text-sm shadow-sm flex-shrink-0"
                    style={{
                        borderColor: currentColors.border,
                    }}
                    onClick={copy_to_clipboard}
                >
                    {copied ? (
                        <GoCheck
                            size={16}
                            className="sm:w-[18px] sm:h-[18px]"
                        />
                    ) : (
                        <GoCopy size={16} className="sm:w-[18px] sm:h-[18px]" />
                    )}
                </button>
                <button
                    className="border px-2 sm:px-3 py-1 rounded text-xs sm:text-sm shadow-sm flex-shrink-0"
                    style={{
                        borderColor: currentColors.border,
                        color: currentColors.textSecondary,
                    }}
                    disabled={true}
                >
                    <GiSpeaker size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
            </div>
        </div>
    );
};

export default EmailPreviewBox;
