import { useState, useEffect } from "react";
import { apiService } from "../services/apiService";
import { sendService } from "../services/sendService";
import { useTheme } from "../contexts/ThemeContext";
import { toast } from "react-toastify";
import DraftsHeader from "../components/DraftsHeader";
import { CircleLoader } from "../components/Loader";
import { MdDelete, MdEdit, MdSend, MdSave, MdClose } from "react-icons/md";

interface Draft {
    id: string;
    to_email: string;
    subject: string;
    body: string;
    tone?: string;
    prompt?: string;
    timestamp: Date;
}

const Drafts = () => {
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sendingId, setSendingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{
        to_email: string;
        subject: string;
        body: string;
    }>({ to_email: "", subject: "", body: "" });
    const { currentColors, currentPalette } = useTheme();

    useEffect(() => {
        loadDrafts();
    }, []);

    const loadDrafts = async () => {
        setIsLoading(true);
        try {
            const response = await apiService.getDrafts();
            setDrafts(response.emails);
        } catch (error) {
            console.error("Failed to load drafts:", error);
            toast.error("Failed to load drafts");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async (draft: Draft) => {
        setSendingId(draft.id);
        try {
            const result = await sendService.sendEmail({
                emailId: draft.id,
                toEmail: draft.to_email,
                subject: draft.subject,
                body: draft.body,
            });

            if (result.success) {
                toast.success("Email sent successfully!");
                loadDrafts(); // Refresh list
            } else {
                toast.error(result.error || "Failed to send email");
            }
        } catch (error) {
            console.error("Error sending email:", error);
            toast.error("Failed to send email");
        } finally {
            setSendingId(null);
        }
    };

    const handleDelete = async (draftId: string) => {
        if (!confirm("Are you sure you want to delete this draft?")) return;

        setDeletingId(draftId);
        try {
            await apiService.updateEmail(draftId, { status: "deleted" });
            toast.success("Draft deleted");
            loadDrafts(); // Refresh list
        } catch (error) {
            console.error("Failed to delete draft:", error);
            toast.error("Failed to delete draft");
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = async (draft: Draft) => {
        setEditingId(draft.id);
        setExpandedId(draft.id);
        setEditForm({
            to_email: draft.to_email,
            subject: draft.subject,
            body: draft.body,
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({ to_email: "", subject: "", body: "" });
    };

    const handleSaveEdit = async (draftId: string) => {
        setSavingId(draftId);
        try {
            await apiService.updateEmail(draftId, {
                to_email: editForm.to_email,
                subject: editForm.subject,
                body: editForm.body,
            });
            toast.success("Draft updated successfully!");
            setEditingId(null);
            loadDrafts(); // Refresh list
        } catch (error) {
            console.error("Failed to update draft:", error);
            toast.error("Failed to update draft");
        } finally {
            setSavingId(null);
        }
    };

    const toggleExpand = (draftId: string) => {
        setExpandedId(expandedId === draftId ? null : draftId);
    };

    return (
        <div
            className="flex flex-col h-screen"
            style={{ backgroundColor: currentColors.bg }}
        >
            <DraftsHeader />

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                    {/* Page Title */}
                    <div className="mb-8">
                        <h1
                            className="text-xl font-semibold tracking-tight"
                            style={{ color: currentColors.text }}
                        >
                            Drafts
                        </h1>
                        {!isLoading && drafts.length > 0 && (
                            <p
                                className="text-sm mt-1"
                                style={{ color: currentColors.textSecondary }}
                            >
                                {drafts.length} saved{" "}
                                {drafts.length === 1 ? "draft" : "drafts"}
                            </p>
                        )}
                    </div>

                    {/* States */}
                    {isLoading ? (
                        <div className="flex justify-center items-center h-56">
                            <CircleLoader size="lg" />
                        </div>
                    ) : drafts.length === 0 ? (
                        <div
                            className="flex flex-col items-center justify-center py-20 rounded-2xl"
                            style={{
                                backgroundColor:
                                    currentColors.textSecondary + "08",
                                border: `1px dashed ${currentColors.border}`,
                            }}
                        >
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                                style={{
                                    backgroundColor:
                                        currentColors.textSecondary + "12",
                                }}
                            >
                                <MdEdit
                                    size={22}
                                    style={{
                                        color: currentColors.textSecondary,
                                    }}
                                />
                            </div>
                            <p
                                className="font-medium text-sm"
                                style={{ color: currentColors.text }}
                            >
                                No drafts yet
                            </p>
                            <p
                                className="text-xs mt-1"
                                style={{ color: currentColors.textSecondary }}
                            >
                                Generate an email and save it as a draft to see
                                it here
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {drafts.map((draft) => (
                                <div
                                    key={draft.id}
                                    className="rounded-2xl overflow-hidden transition-shadow duration-200"
                                    style={{
                                        backgroundColor: currentColors.bg,
                                        border: `1px solid ${currentColors.border}`,
                                        boxShadow:
                                            expandedId === draft.id
                                                ? `0 4px 20px ${currentColors.textSecondary}18`
                                                : `0 1px 4px ${currentColors.textSecondary}0a`,
                                    }}
                                >
                                    {/* Card Top Row */}
                                    <div className="flex items-start gap-3 p-4">
                                        {/* Avatar / Initials */}
                                        <div
                                            className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold mt-0.5"
                                            style={{
                                                backgroundColor:
                                                    currentPalette.primary +
                                                    "18",
                                                color: currentPalette.primary,
                                            }}
                                        >
                                            {draft.to_email
                                                ? draft.to_email
                                                      .charAt(0)
                                                      .toUpperCase()
                                                : "?"}
                                        </div>

                                        {/* Main info — clickable to expand */}
                                        <div
                                            className="flex-1 min-w-0 cursor-pointer"
                                            onClick={() =>
                                                toggleExpand(draft.id)
                                            }
                                        >
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span
                                                    className="text-sm font-medium truncate"
                                                    style={{
                                                        color: currentColors.text,
                                                    }}
                                                >
                                                    {draft.to_email}
                                                </span>
                                                {draft.tone && (
                                                    <span
                                                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                        style={{
                                                            backgroundColor:
                                                                currentPalette.primary +
                                                                "15",
                                                            color: currentPalette.primary,
                                                        }}
                                                    >
                                                        {draft.tone}
                                                    </span>
                                                )}
                                            </div>
                                            <p
                                                className="text-sm font-medium mt-0.5 truncate"
                                                style={{
                                                    color: currentColors.text,
                                                }}
                                            >
                                                {draft.subject}
                                            </p>
                                            <p
                                                className="text-xs mt-1 line-clamp-1"
                                                style={{
                                                    color: currentColors.textSecondary,
                                                }}
                                            >
                                                {draft.body}
                                            </p>
                                            <p
                                                className="text-xs mt-1.5"
                                                style={{
                                                    color:
                                                        currentColors.textSecondary +
                                                        "99",
                                                }}
                                            >
                                                {new Date(
                                                    draft.timestamp,
                                                ).toLocaleDateString(
                                                    undefined,
                                                    {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    },
                                                )}{" "}
                                                ·{" "}
                                                {new Date(
                                                    draft.timestamp,
                                                ).toLocaleTimeString(
                                                    undefined,
                                                    {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    },
                                                )}
                                            </p>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <button
                                                onClick={() =>
                                                    handleSend(draft)
                                                }
                                                disabled={
                                                    sendingId === draft.id
                                                }
                                                title="Send"
                                                className="w-8 h-8 rounded-xl flex items-center justify-center transition-opacity duration-150 disabled:opacity-50 hover:opacity-80"
                                                style={{
                                                    backgroundColor:
                                                        currentPalette.primary,
                                                    color: "white",
                                                }}
                                            >
                                                {sendingId === draft.id ? (
                                                    <CircleLoader size="sm" />
                                                ) : (
                                                    <MdSend size={15} />
                                                )}
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleEdit(draft)
                                                }
                                                title="Edit"
                                                className="w-8 h-8 rounded-xl flex items-center justify-center transition-opacity duration-150 hover:opacity-80"
                                                style={{
                                                    backgroundColor:
                                                        currentColors.textSecondary +
                                                        "14",
                                                    color: currentColors.textSecondary,
                                                }}
                                            >
                                                <MdEdit size={15} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(draft.id)
                                                }
                                                disabled={
                                                    deletingId === draft.id
                                                }
                                                title="Delete"
                                                className="w-8 h-8 rounded-xl flex items-center justify-center transition-opacity duration-150 disabled:opacity-50 hover:opacity-80"
                                                style={{
                                                    backgroundColor:
                                                        "#ef444418",
                                                    color: "#ef4444",
                                                }}
                                            >
                                                {deletingId === draft.id ? (
                                                    <CircleLoader size="sm" />
                                                ) : (
                                                    <MdDelete size={15} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Panel */}
                                    {expandedId === draft.id && (
                                        <div
                                            className="px-4 pb-4"
                                            style={{
                                                borderTop: `1px solid ${currentColors.border}`,
                                            }}
                                        >
                                            {editingId === draft.id ? (
                                                /* ── Edit Mode ── */
                                                <div className="space-y-4 pt-4">
                                                    {[
                                                        {
                                                            label: "To",
                                                            key: "to_email",
                                                            type: "email",
                                                            placeholder:
                                                                "recipient@example.com",
                                                            isTextarea: false,
                                                        },
                                                        {
                                                            label: "Subject",
                                                            key: "subject",
                                                            type: "text",
                                                            placeholder:
                                                                "Email subject",
                                                            isTextarea: false,
                                                        },
                                                    ].map(
                                                        ({
                                                            label,
                                                            key,
                                                            type,
                                                            placeholder,
                                                        }) => (
                                                            <div key={key}>
                                                                <label
                                                                    className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                                    style={{
                                                                        color: currentColors.textSecondary,
                                                                    }}
                                                                >
                                                                    {label}
                                                                </label>
                                                                <input
                                                                    type={type}
                                                                    value={
                                                                        editForm[
                                                                            key as keyof typeof editForm
                                                                        ]
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setEditForm(
                                                                            {
                                                                                ...editForm,
                                                                                [key]: e
                                                                                    .target
                                                                                    .value,
                                                                            },
                                                                        )
                                                                    }
                                                                    placeholder={
                                                                        placeholder
                                                                    }
                                                                    className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors duration-150"
                                                                    style={{
                                                                        backgroundColor:
                                                                            currentColors.textSecondary +
                                                                            "0c",
                                                                        color: currentColors.text,
                                                                        border: `1px solid ${currentColors.border}`,
                                                                    }}
                                                                />
                                                            </div>
                                                        ),
                                                    )}

                                                    <div>
                                                        <label
                                                            className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                                                            style={{
                                                                color: currentColors.textSecondary,
                                                            }}
                                                        >
                                                            Body
                                                        </label>
                                                        <textarea
                                                            value={
                                                                editForm.body
                                                            }
                                                            onChange={(e) =>
                                                                setEditForm({
                                                                    ...editForm,
                                                                    body: e
                                                                        .target
                                                                        .value,
                                                                })
                                                            }
                                                            rows={7}
                                                            placeholder="Email content"
                                                            className="w-full px-3 py-2 rounded-xl text-sm resize-none outline-none transition-colors duration-150"
                                                            style={{
                                                                backgroundColor:
                                                                    currentColors.textSecondary +
                                                                    "0c",
                                                                color: currentColors.text,
                                                                border: `1px solid ${currentColors.border}`,
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="flex justify-end gap-2 pt-1">
                                                        <button
                                                            onClick={
                                                                handleCancelEdit
                                                            }
                                                            className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-opacity duration-150 hover:opacity-75"
                                                            style={{
                                                                backgroundColor:
                                                                    currentColors.textSecondary +
                                                                    "14",
                                                                color: currentColors.text,
                                                            }}
                                                        >
                                                            <MdClose
                                                                size={16}
                                                            />
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleSaveEdit(
                                                                    draft.id,
                                                                )
                                                            }
                                                            disabled={
                                                                savingId ===
                                                                draft.id
                                                            }
                                                            className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-opacity duration-150 hover:opacity-80 disabled:opacity-50"
                                                            style={{
                                                                backgroundColor:
                                                                    currentPalette.primary,
                                                                color: "white",
                                                            }}
                                                        >
                                                            {savingId ===
                                                            draft.id ? (
                                                                <CircleLoader size="sm" />
                                                            ) : (
                                                                <>
                                                                    <MdSave
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                    Save
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* ── Read Mode ── */
                                                <div className="space-y-4 pt-4">
                                                    <div>
                                                        <p
                                                            className="text-xs font-medium uppercase tracking-wide mb-1"
                                                            style={{
                                                                color: currentColors.textSecondary,
                                                            }}
                                                        >
                                                            Subject
                                                        </p>
                                                        <p
                                                            className="text-sm font-medium"
                                                            style={{
                                                                color: currentColors.text,
                                                            }}
                                                        >
                                                            {draft.subject}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p
                                                            className="text-xs font-medium uppercase tracking-wide mb-1"
                                                            style={{
                                                                color: currentColors.textSecondary,
                                                            }}
                                                        >
                                                            Body
                                                        </p>
                                                        <div
                                                            className="rounded-xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed"
                                                            style={{
                                                                backgroundColor:
                                                                    currentColors.textSecondary +
                                                                    "08",
                                                                color: currentColors.text,
                                                                border: `1px solid ${currentColors.border}`,
                                                            }}
                                                        >
                                                            {draft.body}
                                                        </div>
                                                    </div>

                                                    {draft.prompt && (
                                                        <div>
                                                            <p
                                                                className="text-xs font-medium uppercase tracking-wide mb-1"
                                                                style={{
                                                                    color: currentColors.textSecondary,
                                                                }}
                                                            >
                                                                Original Prompt
                                                            </p>
                                                            <p
                                                                className="text-xs leading-relaxed"
                                                                style={{
                                                                    color: currentColors.textSecondary,
                                                                }}
                                                            >
                                                                {draft.prompt}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Drafts;
