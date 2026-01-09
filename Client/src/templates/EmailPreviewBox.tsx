import { useState } from "react";
import { CircleLoader } from "../components/Loader";
import { apiService } from "../services/apiService";
import type { EmailPreviewBoxProps } from "../types";
import { useTheme } from "../contexts/ThemeContext";
import { toast } from "react-toastify";

import { GiSpeaker } from "react-icons/gi";
import { GoCopy, GoCheck } from "react-icons/go";

const EmailPreviewBox = ({
    emailData,
    emailId,
    tone,
    prompt,
    onRegenerate,
    onUpdate,
}: EmailPreviewBoxProps) => {
    const [sent, setSent] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [actionInProgress, setActionInProgress] = useState<string | null>(
        null,
    );
    const [editedSubject, setEditedSubject] = useState(
        emailData?.subject || "",
    );
    const [editedBody, setEditedBody] = useState(emailData?.body || "");
    const [editedTo, setEditedTo] = useState(emailData?.to || "");
    const { currentColors, currentPalette } = useTheme();

    const copy_to_clipboard = async () => {
        if (emailData) {
            await navigator.clipboard.writeText(
                `Subject: ${emailData.subject}\n\n${emailData.body}`,
            );
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const sendEmail = async () => {
        if (!emailId) {
            toast.error("Cannot send: Email ID missing");
            return;
        }

        setIsLoading(true);
        setActionInProgress("sending");
        try {
            // Update email status to "sent" in database
            await apiService.updateEmail(emailId, {
                status: "sent",
            });

            setSent(true);
            toast.success("Email marked as sent");
            console.log("Email marked as sent");

            setTimeout(() => {
                setSent(false);
            }, 5000);
        } catch (error) {
            console.error("Error updating email status:", error);
            toast.error("Failed to mark email as sent");
        } finally {
            setIsLoading(false);
            setActionInProgress(null);
        }
    };

    const saveAsDraft = async () => {
        if (!emailId) {
            toast.error("Cannot save draft: Email ID missing");
            return;
        }

        setActionInProgress("draft");
        try {
            await apiService.updateEmail(emailId, { status: "draft" });
            toast.success("Saved as draft");
        } catch (error) {
            console.error("Failed to save draft:", error);
            toast.error("Failed to save draft");
        } finally {
            setActionInProgress(null);
        }
    };

    const handleEdit = () => {
        if (isEditing) {
            // Save changes
            saveEdits();
        } else {
            // Enter edit mode
            setIsEditing(true);
            setEditedSubject(emailData?.subject || "");
            setEditedBody(emailData?.body || "");
            setEditedTo(emailData?.to || "");
        }
    };

    const saveEdits = async () => {
        if (!emailId) {
            toast.error("Cannot save: Email ID missing");
            return;
        }

        setActionInProgress("editing");
        try {
            await apiService.updateEmail(emailId, {
                subject: editedSubject,
                body: editedBody,
                to_email: editedTo,
            });

            // Update local state
            if (onUpdate) {
                onUpdate({
                    to: editedTo,
                    subject: editedSubject,
                    body: editedBody,
                });
            }

            setIsEditing(false);
            toast.success("Email updated");
        } catch (error) {
            console.error("Failed to save edits:", error);
            toast.error("Failed to save changes");
        } finally {
            setActionInProgress(null);
        }
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditedSubject(emailData?.subject || "");
        setEditedBody(emailData?.body || "");
        setEditedTo(emailData?.to || "");
    };

    const handleRegenerate = async () => {
        if (!prompt) {
            toast.error("Cannot regenerate: Original prompt not available");
            return;
        }

        setIsRegenerating(true);
        setActionInProgress("regenerating");
        try {
            const response = await apiService.generateEmail({
                receiverEmail: emailData?.to || "",
                prompt: prompt,
                tone: tone,
            });

            if (response.success && response.email) {
                // Update regeneration count in database
                if (emailId) {
                    try {
                        await apiService.regenerateEmail(emailId);
                    } catch (error) {
                        console.error(
                            "Failed to update regeneration count:",
                            error,
                        );
                    }
                }

                // Update local display
                if (onRegenerate) {
                    onRegenerate({
                        to: response.email.to,
                        subject: response.email.subject,
                        body: response.email.body,
                    });
                }

                setEditedSubject(response.email.subject);
                setEditedBody(response.email.body);
                setEditedTo(response.email.to);

                toast.success("Email regenerated");
            } else {
                toast.error("Failed to regenerate email");
            }
        } catch (error) {
            console.error("Error regenerating email:", error);
            toast.error("Failed to regenerate email");
        } finally {
            setIsRegenerating(false);
            setActionInProgress(null);
        }
    };

    const getButtonText = () => {
        if (isLoading) return <CircleLoader size="sm" />;
        if (sent) return "Sent";
        return "Send";
    };

    const isAnyActionInProgress = actionInProgress !== null;

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
                    {isEditing ? "Edit Email:" : "Generated Email:"}
                </div>
                <div className="space-y-2">
                    {isEditing ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    To:
                                </label>
                                <input
                                    type="email"
                                    value={editedTo}
                                    onChange={(e) =>
                                        setEditedTo(e.target.value)
                                    }
                                    className="w-full px-2 py-1 border rounded text-sm"
                                    style={{
                                        background: currentColors.surface,
                                        color: currentColors.text,
                                        borderColor: currentColors.border,
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Subject:
                                </label>
                                <input
                                    type="text"
                                    value={editedSubject}
                                    onChange={(e) =>
                                        setEditedSubject(e.target.value)
                                    }
                                    className="w-full px-2 py-1 border rounded text-sm"
                                    style={{
                                        background: currentColors.surface,
                                        color: currentColors.text,
                                        borderColor: currentColors.border,
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Body:
                                </label>
                                <textarea
                                    value={editedBody}
                                    onChange={(e) =>
                                        setEditedBody(e.target.value)
                                    }
                                    rows={8}
                                    className="w-full px-2 py-1 border rounded text-sm resize-none"
                                    style={{
                                        background: currentColors.surface,
                                        color: currentColors.text,
                                        borderColor: currentColors.border,
                                    }}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="whitespace-pre-wrap">
                            <div>
                                <strong>Subject:</strong>{" "}
                                <span>{emailData?.subject}</span>
                            </div>
                            <div
                                className="border-t pt-2 mt-2"
                                style={{ borderColor: currentColors.border }}
                            >
                                <p className="mt-1">{emailData?.body}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3">
                {!isEditing ? (
                    <>
                        <button
                            className="border px-2 sm:px-3 py-1 rounded text-xs sm:text-sm w-14 sm:w-16 shadow-sm cursor-pointer hover:opacity-60 flex-shrink-0 disabled:cursor-not-allowed"
                            style={{
                                borderColor: currentColors.border,
                                color: currentColors.text,
                            }}
                            onClick={sendEmail}
                            disabled={
                                isLoading || sent || isAnyActionInProgress
                            }
                        >
                            {getButtonText()}
                        </button>
                        <button
                            className="border px-2 sm:px-3 py-1 rounded text-xs sm:text-sm shadow-sm cursor-pointer hover:opacity-60 flex-shrink-0 disabled:cursor-not-allowed"
                            style={{
                                borderColor: currentColors.border,
                            }}
                            onClick={saveAsDraft}
                            disabled={isAnyActionInProgress}
                        >
                            {actionInProgress === "draft" ? (
                                <CircleLoader size="sm" />
                            ) : (
                                "Save as Draft"
                            )}
                        </button>
                        <button
                            className="border px-2 sm:px-3 py-1 rounded text-xs sm:text-sm shadow-sm cursor-pointer hover:opacity-60 flex-shrink-0 disabled:cursor-not-allowed"
                            style={{
                                borderColor: currentColors.border,
                            }}
                            onClick={handleEdit}
                            disabled={isAnyActionInProgress}
                        >
                            Edit
                        </button>
                        <button
                            className="border px-2 sm:px-3 py-1 rounded text-xs sm:text-sm shadow-sm cursor-pointer hover:opacity-60 flex-shrink-0 disabled:cursor-not-allowed"
                            style={{
                                borderColor: currentColors.border,
                            }}
                            onClick={handleRegenerate}
                            disabled={
                                isRegenerating ||
                                !prompt ||
                                isAnyActionInProgress
                            }
                        >
                            {isRegenerating ? (
                                <CircleLoader size="sm" />
                            ) : (
                                "Regenerate"
                            )}
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            className="border px-2 sm:px-3 py-1 rounded text-xs sm:text-sm shadow-sm cursor-pointer hover:opacity-60 flex-shrink-0 disabled:cursor-not-allowed"
                            style={{
                                borderColor: currentColors.border,
                                backgroundColor: currentPalette.primary,
                                color: "white",
                            }}
                            onClick={handleEdit}
                            disabled={isAnyActionInProgress}
                        >
                            {actionInProgress === "saving" ? (
                                <CircleLoader size="sm" />
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                        <button
                            className="border px-2 sm:px-3 py-1 rounded text-xs sm:text-sm shadow-sm cursor-pointer hover:opacity-60 flex-shrink-0 disabled:cursor-not-allowed"
                            style={{
                                borderColor: currentColors.border,
                            }}
                            onClick={cancelEdit}
                            disabled={isAnyActionInProgress}
                        >
                            Cancel
                        </button>
                    </>
                )}
                <button
                    className="border px-2 sm:px-3 py-1 rounded text-xs sm:text-sm shadow-sm cursor-pointer hover:opacity-60 flex-shrink-0"
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
                    className="border px-2 sm:px-3 py-1 rounded text-xs sm:text-sm shadow-sm cursor-not-allowed hover:opacity-60 flex-shrink-0"
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
