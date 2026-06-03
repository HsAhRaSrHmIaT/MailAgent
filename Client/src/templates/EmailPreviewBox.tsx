import { useState } from "react";
import { CircleLoader } from "../components/Loader";
import { apiService } from "../services/apiService";
import { sendService } from "../services/sendService";
import type { EmailPreviewBoxProps } from "../types";
import { useTheme } from "../contexts/ThemeContext";
import { toast } from "react-toastify";

import { GiSpeaker } from "react-icons/gi";
import { GoCopy, GoCheck } from "react-icons/go";
import { LuRefreshCw, LuPencil, LuSend, LuBookmark } from "react-icons/lu";
import { MdOutlineCancel } from "react-icons/md";

const EmailPreviewBox = ({
    emailData,
    emailId,
    tone,
    prompt,
    status,
    onRegenerate,
    onUpdate,
}: EmailPreviewBoxProps) => {
    const [sent, setSent] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(status);
    const [actionInProgress, setActionInProgress] = useState<string | null>(null);
    const [editedSubject, setEditedSubject] = useState(emailData?.subject || "");
    const [editedBody, setEditedBody] = useState(emailData?.body || "");
    const [editedTo, setEditedTo] = useState(emailData?.to || "");
    const { currentColors, currentPalette } = useTheme();

    const copy_to_clipboard = async () => {
        if (emailData) {
            await navigator.clipboard.writeText(`Subject: ${emailData.subject}\n\n${emailData.body}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const sendEmail = async () => {
        if (!emailId) { toast.error("Cannot send: Email ID missing"); return; }
        if (!emailData) { toast.error("Cannot send: Email data missing"); return; }
        setIsLoading(true);
        setActionInProgress("sending");
        try {
            const result = await sendService.sendEmail({ emailId, toEmail: emailData.to, subject: emailData.subject, body: emailData.body });
            if (result.success) {
                setSent(true);
                setCurrentStatus("sent");
                toast.success("Email sent successfully!");
                setTimeout(() => setSent(false), 5000);
            } else {
                toast.error(result.error || "Failed to send email");
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to send email.");
        } finally {
            setIsLoading(false);
            setActionInProgress(null);
        }
    };

    const resendEmail = async () => {
        if (!emailId) { toast.error("Cannot resend: Email ID missing"); return; }
        if (!emailData) { toast.error("Cannot resend: Email data missing"); return; }
        setIsLoading(true);
        setActionInProgress("resending");
        try {
            const result = await sendService.sendEmail({ emailId, toEmail: emailData.to, subject: emailData.subject, body: emailData.body });
            if (result.success) { toast.success("Email resent successfully!"); }
            else { toast.error(result.error || "Failed to resend email"); }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to resend email.");
        } finally {
            setIsLoading(false);
            setActionInProgress(null);
        }
    };

    const saveAsDraft = async () => {
        if (!emailId) { toast.error("Cannot save draft: Email ID missing"); return; }
        setActionInProgress("draft");
        try {
            await apiService.updateEmail(emailId, { status: "draft" });
            setCurrentStatus("draft");
            toast.success("Saved as draft");
        } catch {
            toast.error("Failed to save draft");
        } finally {
            setActionInProgress(null);
        }
    };

    const handleEdit = () => {
        if (isEditing) {
            saveEdits();
        } else {
            setIsEditing(true);
            setEditedSubject(emailData?.subject || "");
            setEditedBody(emailData?.body || "");
            setEditedTo(emailData?.to || "");
        }
    };

    const saveEdits = async () => {
        if (!emailId) { toast.error("Cannot save: Email ID missing"); return; }
        setActionInProgress("editing");
        try {
            await apiService.updateEmail(emailId, { subject: editedSubject, body: editedBody, to_email: editedTo });
            if (onUpdate) onUpdate({ to: editedTo, subject: editedSubject, body: editedBody });
            setIsEditing(false);
            toast.success("Email updated");
        } catch {
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
        if (!prompt) { toast.error("Cannot regenerate: Original prompt not available"); return; }
        setIsRegenerating(true);
        setActionInProgress("regenerating");
        try {
            const response = await apiService.generateEmail({ receiverEmail: emailData?.to || "", prompt, tone });
            if (response.success && response.email) {
                if (emailId) {
                    try { await apiService.regenerateEmail(emailId); } catch {
                            toast.error("Failed to update email with regenerated content");
                    }
                }
                if (onRegenerate) onRegenerate({ to: response.email.to, subject: response.email.subject, body: response.email.body });
                setEditedSubject(response.email.subject);
                setEditedBody(response.email.body);
                setEditedTo(response.email.to);
                toast.success("Email regenerated");
            } else {
                toast.error("Failed to regenerate email");
            }
        } catch {
            toast.error("Failed to regenerate email");
        } finally {
            setIsRegenerating(false);
            setActionInProgress(null);
        }
    };

    const isAnyActionInProgress = actionInProgress !== null;

    /* ── shared input style ── */
    const inputStyle = {
        background: currentColors.bg,
        color: currentColors.text,
        borderColor: currentColors.border,
    };

    /* ── shared ghost button style ── */
    const ghostBtn = {
        borderColor: currentColors.border,
        color: currentColors.textSecondary,
    };

    return (
        <div
            className="rounded-xl overflow-hidden text-sm"
            style={{
                background: currentColors.surface,
                border: `1px solid ${currentColors.border}`,
                color: currentColors.text,
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: `0 2px 12px -4px ${currentColors.border}66`,
            }}
        >
            {/* ── Header ── */}
            <div
                className="flex items-center justify-between px-4 py-2.5 gap-2"
                style={{ borderBottom: `1px solid ${currentColors.border}` }}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <span
                        className="text-xs font-semibold uppercase tracking-widest select-none"
                        style={{ color: currentColors.textSecondary, fontFamily: "'DM Mono', monospace" }}
                    >
                        Draft
                    </span>
                    {currentStatus === "sent" && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-500 font-medium select-none">
                            Sent
                        </span>
                    )}
                    {currentStatus === "draft" && (
                        <span
                            className="text-xs px-1.5 py-0.5 rounded-full font-medium select-none"
                            style={{ background: currentColors.border + "55", color: currentColors.textSecondary }}
                        >
                            Saved draft
                        </span>
                    )}
                </div>
                <span className="text-xs truncate min-w-0" style={{ color: currentColors.textSecondary }}>
                    → <span className="font-medium" style={{ color: currentColors.text }}>{emailData?.to}</span>
                </span>
            </div>

            {/* ── Body ── */}
            <div className="px-4 py-3 space-y-3">
                {isEditing ? (
                    <>
                        {/* To */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium" style={{ color: currentColors.textSecondary }}>To</label>
                            <input
                                type="email"
                                value={editedTo}
                                onChange={(e) => setEditedTo(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border text-sm outline-none transition-opacity focus:opacity-100"
                                style={inputStyle}
                            />
                        </div>
                        {/* Subject */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium" style={{ color: currentColors.textSecondary }}>Subject</label>
                            <input
                                type="text"
                                value={editedSubject}
                                onChange={(e) => setEditedSubject(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border text-sm outline-none"
                                style={inputStyle}
                            />
                        </div>
                        {/* Body */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium" style={{ color: currentColors.textSecondary }}>Body</label>
                            <textarea
                                value={editedBody}
                                onChange={(e) => setEditedBody(e.target.value)}
                                rows={8}
                                className="w-full px-3 py-2 rounded-lg border text-sm resize-none outline-none"
                                style={inputStyle}
                            />
                        </div>
                    </>
                ) : (
                    <div className="space-y-2">
                        {/* Subject line */}
                        <p className="font-semibold leading-snug" style={{ color: currentColors.text }}>
                            {emailData?.subject}
                        </p>
                        {/* Divider */}
                        <div className="border-t" style={{ borderColor: currentColors.border }} />
                        {/* Body text */}
                        <p
                            className="whitespace-pre-wrap leading-relaxed text-xs"
                            style={{ color: currentColors.textSecondary, maxHeight: 180, overflowY: "auto" }}
                        >
                            {emailData?.body}
                        </p>
                    </div>
                )}
            </div>

            {/* ── Actions ── */}
            <div
                className="flex flex-wrap items-center gap-1.5 px-4 py-2.5"
                style={{ borderTop: `1px solid ${currentColors.border}` }}
            >
                {!isEditing ? (
                    <>
                        {/* Send / Resend */}
                        {currentStatus !== "sent" ? (
                            <ActionButton
                                onClick={sendEmail}
                                disabled={isLoading || sent || isAnyActionInProgress}
                                primary
                                primaryColor={currentPalette.primary}
                            >
                                {isLoading ? <CircleLoader size="sm" /> : <><LuSend size={13} />{sent ? "Sent" : "Send"}</>}
                            </ActionButton>
                        ) : (
                            <ActionButton onClick={resendEmail} disabled={isAnyActionInProgress} style={ghostBtn}>
                                {actionInProgress === "resending" ? <CircleLoader size="sm" /> : <><LuSend size={13} />Resend</>}
                            </ActionButton>
                        )}

                        {/* Save as Draft */}
                        {currentStatus !== "draft" && (
                            <ActionButton onClick={saveAsDraft} disabled={isAnyActionInProgress} style={ghostBtn}>
                                {actionInProgress === "draft" ? <CircleLoader size="sm" /> : <><LuBookmark size={13} />Draft</>}
                            </ActionButton>
                        )}

                        {/* Edit */}
                        <ActionButton onClick={handleEdit} disabled={isAnyActionInProgress} style={ghostBtn}>
                            <LuPencil size={13} />Edit
                        </ActionButton>

                        {/* Regenerate */}
                        <ActionButton
                            onClick={handleRegenerate}
                            disabled={isRegenerating || !prompt || isAnyActionInProgress}
                            style={ghostBtn}
                        >
                            <LuRefreshCw size={13} className={isRegenerating ? "animate-spin" : ""} />
                            {isRegenerating ? "..." : "Redo"}
                        </ActionButton>
                    </>
                ) : (
                    <>
                        <ActionButton
                            onClick={handleEdit}
                            disabled={isAnyActionInProgress}
                            primary
                            primaryColor={currentPalette.primary}
                        >
                            {actionInProgress === "editing" ? <CircleLoader size="sm" /> : "Save"}
                        </ActionButton>
                        <ActionButton onClick={cancelEdit} disabled={isAnyActionInProgress} style={ghostBtn}>
                            <MdOutlineCancel size={14} />Cancel
                        </ActionButton>
                    </>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Copy */}
                <IconButton onClick={copy_to_clipboard} style={ghostBtn} title="Copy to clipboard">
                    {copied ? <GoCheck size={15} className="text-green-500" /> : <GoCopy size={15} />}
                </IconButton>

                {/* Speaker (disabled) */}
                <IconButton disabled style={ghostBtn} title="Text to speech (coming soon)">
                    <GiSpeaker size={15} />
                </IconButton>
            </div>
        </div>
    );
};

/* ── Small reusable button primitives ───────────────────────────────────── */

type ABProps = {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    primary?: boolean;
    primaryColor?: string;
    style?: React.CSSProperties;
};

const ActionButton = ({ children, onClick, disabled, primary, primaryColor, style }: ABProps) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg border text-sm font-medium transition-opacity hover:opacity-70 disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer"
        style={
            primary
                ? { backgroundColor: primaryColor, color: "#fff", borderColor: "transparent" }
                : style
        }
    >
        {children}
    </button>
);

type IBProps = {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    style?: React.CSSProperties;
    title?: string;
};

const IconButton = ({ children, onClick, disabled, style, title }: IBProps) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg border transition-opacity hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        style={style}
    >
        {children}
    </button>
);

export default EmailPreviewBox;