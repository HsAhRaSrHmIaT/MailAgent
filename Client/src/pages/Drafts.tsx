import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/apiService";
import { sendService } from "../services/sendService";
import { useTheme } from "../contexts/ThemeContext";
import { toast } from "react-toastify";
import Header from "../components/Header";
import { CircleLoader } from "../components/Loader";
import { MdDelete, MdEdit, MdSend } from "react-icons/md";

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
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const { currentColors, currentPalette } = useTheme();
    const navigate = useNavigate();

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

    const handleEdit = (draft: Draft) => {
        // Navigate back to chat with draft data for editing
        navigate("/", { state: { editDraft: draft } });
    };

    const toggleExpand = (draftId: string) => {
        setExpandedId(expandedId === draftId ? null : draftId);
    };

    return (
        <div
            className="flex flex-col h-screen"
            style={{ backgroundColor: currentColors.bg }}
        >
            <Header setMessages={() => {}} />

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h1
                            className="text-2xl font-bold"
                            style={{ color: currentColors.text }}
                        >
                            Drafts
                        </h1>
                        <button
                            onClick={() => navigate("/")}
                            className="px-4 py-2 rounded text-sm hover:opacity-80"
                            style={{
                                backgroundColor: currentPalette.primary,
                                color: "white",
                            }}
                        >
                            Back to Chat
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <CircleLoader size="lg" />
                        </div>
                    ) : drafts.length === 0 ? (
                        <div
                            className="text-center py-12 rounded-lg"
                            style={{
                                backgroundColor:
                                    currentColors.textSecondary + "10",
                                color: currentColors.textSecondary,
                            }}
                        >
                            <p className="text-lg">No drafts found</p>
                            <p className="text-sm mt-2">
                                Generate an email and save it as draft to see it
                                here
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {drafts.map((draft) => (
                                <div
                                    key={draft.id}
                                    className="border rounded-lg p-4 shadow-sm"
                                    style={{
                                        borderColor: currentColors.border,
                                        backgroundColor:
                                            currentColors.bg + "20",
                                    }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div
                                            className="flex-1 cursor-pointer"
                                            onClick={() =>
                                                toggleExpand(draft.id)
                                            }
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3
                                                    className="font-semibold"
                                                    style={{
                                                        color: currentColors.text,
                                                    }}
                                                >
                                                    To: {draft.to_email}
                                                </h3>
                                                {draft.tone && (
                                                    <span
                                                        className="text-xs px-2 py-1 rounded"
                                                        style={{
                                                            backgroundColor:
                                                                currentColors.textSecondary +
                                                                "20",
                                                            color: currentColors.text,
                                                        }}
                                                    >
                                                        #{draft.tone}
                                                    </span>
                                                )}
                                            </div>
                                            <p
                                                className="font-medium mb-1"
                                                style={{
                                                    color: currentColors.text,
                                                }}
                                            >
                                                {draft.subject}
                                            </p>
                                            <p
                                                className="text-sm line-clamp-2"
                                                style={{
                                                    color: currentColors.textSecondary,
                                                }}
                                            >
                                                {draft.body}
                                            </p>
                                            <p
                                                className="text-xs mt-2"
                                                style={{
                                                    color: currentColors.textSecondary,
                                                }}
                                            >
                                                {new Date(
                                                    draft.timestamp,
                                                ).toLocaleDateString()}{" "}
                                                {new Date(
                                                    draft.timestamp,
                                                ).toLocaleTimeString()}
                                            </p>
                                        </div>

                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() =>
                                                    handleSend(draft)
                                                }
                                                disabled={
                                                    sendingId === draft.id
                                                }
                                                className="p-2 rounded hover:opacity-80 disabled:opacity-50"
                                                style={{
                                                    backgroundColor:
                                                        currentPalette.primary,
                                                    color: "white",
                                                }}
                                                title="Send"
                                            >
                                                {sendingId === draft.id ? (
                                                    <CircleLoader size="sm" />
                                                ) : (
                                                    <MdSend size={18} />
                                                )}
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleEdit(draft)
                                                }
                                                className="p-2 rounded hover:opacity-80"
                                                style={{
                                                    backgroundColor:
                                                        currentColors.textSecondary +
                                                        "20",
                                                    color: currentColors.text,
                                                }}
                                                title="Edit"
                                            >
                                                <MdEdit size={18} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(draft.id)
                                                }
                                                disabled={
                                                    deletingId === draft.id
                                                }
                                                className="p-2 rounded hover:opacity-80 disabled:opacity-50"
                                                style={{
                                                    backgroundColor: "#ef4444",
                                                    color: "white",
                                                }}
                                                title="Delete"
                                            >
                                                {deletingId === draft.id ? (
                                                    <CircleLoader size="sm" />
                                                ) : (
                                                    <MdDelete size={18} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {expandedId === draft.id && (
                                        <div
                                            className="mt-4 pt-4 border-t"
                                            style={{
                                                borderColor:
                                                    currentColors.border,
                                            }}
                                        >
                                            <div className="space-y-3">
                                                <div>
                                                    <label
                                                        className="text-sm font-medium block mb-1"
                                                        style={{
                                                            color: currentColors.textSecondary,
                                                        }}
                                                    >
                                                        Subject:
                                                    </label>
                                                    <p
                                                        style={{
                                                            color: currentColors.text,
                                                        }}
                                                    >
                                                        {draft.subject}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label
                                                        className="text-sm font-medium block mb-1"
                                                        style={{
                                                            color: currentColors.textSecondary,
                                                        }}
                                                    >
                                                        Body:
                                                    </label>
                                                    <p
                                                        className="whitespace-pre-wrap"
                                                        style={{
                                                            color: currentColors.text,
                                                        }}
                                                    >
                                                        {draft.body}
                                                    </p>
                                                </div>
                                                {draft.prompt && (
                                                    <div>
                                                        <label
                                                            className="text-sm font-medium block mb-1"
                                                            style={{
                                                                color: currentColors.textSecondary,
                                                            }}
                                                        >
                                                            Original Prompt:
                                                        </label>
                                                        <p
                                                            className="text-sm"
                                                            style={{
                                                                color: currentColors.textSecondary,
                                                            }}
                                                        >
                                                            {draft.prompt}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
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
