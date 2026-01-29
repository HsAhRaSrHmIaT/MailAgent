import { useState, useRef } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { HiXMark, HiDocumentArrowUp, HiPlus } from "react-icons/hi2";

interface RecipientInputProps {
    recipients: string[];
    onRecipientsChange: (recipients: string[]) => void;
    maxRecipients?: number;
    onErrorChange?: (hasError: boolean) => void;
}

const RecipientInput = ({
    recipients,
    onRecipientsChange,
    maxRecipients = 50,
    onErrorChange,
}: RecipientInputProps) => {
    const { currentColors, currentPalette } = useTheme();
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState("");

    const updateError = (errorMsg: string) => {
        setError(errorMsg);
        onErrorChange?.(!!errorMsg);
    };
    const fileInputRef = useRef<HTMLInputElement>(null);

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // List of invalid/reserved domains that should be blocked
    const invalidDomains = [
        "example.com",
        "example.org",
        "example.net",
        "test.com",
        "test.org",
        "test.net",
        "localhost",
        "invalid",
        "local",
    ];

    const isValidEmail = (email: string): boolean => {
        if (!emailPattern.test(email.trim())) {
            return false;
        }

        // Check if domain is in the invalid list
        const domain = email.split("@")[1]?.toLowerCase();
        if (domain && invalidDomains.includes(domain)) {
            return false;
        }

        return true;
    };

    const addRecipient = (email: string) => {
        const trimmedEmail = email.trim().toLowerCase();

        if (!trimmedEmail) return;

        if (recipients.length >= maxRecipients) {
            updateError(`Maximum ${maxRecipients} recipients allowed`);
            return;
        }

        if (!isValidEmail(trimmedEmail)) {
            updateError("Invalid email format");
            return;
        }

        if (recipients.includes(trimmedEmail)) {
            updateError("Email already added");
            return;
        }

        onRecipientsChange([...recipients, trimmedEmail]);
        setInputValue("");
        updateError("");
    };

    const removeRecipient = (email: string) => {
        onRecipientsChange(recipients.filter((r) => r !== email));
        updateError("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === "," || e.key === " ") {
            e.preventDefault();
            addRecipient(inputValue);
        } else if (
            e.key === "Backspace" &&
            !inputValue &&
            recipients.length > 0
        ) {
            removeRecipient(recipients[recipients.length - 1]);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData("text");
        const emails = pastedText
            .split(/[,;\s\n]+/)
            .map((email) => email.trim())
            .filter((email) => email);

        let addedCount = 0;
        let invalidCount = 0;
        let duplicateCount = 0;

        for (const email of emails) {
            if (recipients.length + addedCount >= maxRecipients) {
                updateError(`Reached maximum of ${maxRecipients} recipients`);
                break;
            }

            if (!isValidEmail(email)) {
                invalidCount++;
                continue;
            }

            if (recipients.includes(email.toLowerCase())) {
                duplicateCount++;
                continue;
            }

            recipients.push(email.toLowerCase());
            addedCount++;
        }

        if (addedCount > 0) {
            onRecipientsChange([...recipients]);
        }

        if (invalidCount > 0 || duplicateCount > 0) {
            const messages = [];
            if (addedCount > 0) messages.push(`${addedCount} added`);
            if (invalidCount > 0) messages.push(`${invalidCount} invalid`);
            if (duplicateCount > 0)
                messages.push(`${duplicateCount} duplicate`);
            updateError(messages.join(", "));
        } else if (addedCount > 0) {
            updateError("");
        }

        setInputValue("");
    };

    const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split(/\r?\n/);
            const emails: string[] = [];

            // Parse CSV - handle both comma and semicolon separators
            for (const line of lines) {
                const cells = line.split(/[,;]/).map((cell) => cell.trim());
                for (const cell of cells) {
                    // Remove quotes if present
                    const cleaned = cell.replace(/^["']|["']$/g, "").trim();
                    if (cleaned && isValidEmail(cleaned)) {
                        const lowerEmail = cleaned.toLowerCase();
                        if (
                            !recipients.includes(lowerEmail) &&
                            !emails.includes(lowerEmail)
                        ) {
                            emails.push(lowerEmail);
                        }
                    }
                }
            }

            const newRecipients = [
                ...recipients,
                ...emails.slice(0, maxRecipients - recipients.length),
            ];
            onRecipientsChange(newRecipients);

            if (emails.length > maxRecipients - recipients.length) {
                updateError(
                    `Added ${maxRecipients - recipients.length} emails (limit reached)`,
                );
            } else if (emails.length > 0) {
                updateError("");
            } else {
                updateError("No valid emails found in CSV file");
            }
        };

        reader.readAsText(file);
        e.target.value = "";
    };

    return (
        <div className="w-full">
            {/* Recipients Display with Input */}
            <div
                className="min-h-[60px] max-h-[200px] overflow-y-auto scrollbar-hide"
                style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
            >
                <div className="flex flex-wrap gap-2 mb-3">
                    {recipients.map((email) => (
                        <div
                            key={email}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium"
                            style={{
                                backgroundColor: `${currentPalette.primary}15`,
                                color: currentColors.text,
                                border: `1px solid ${currentPalette.primary}30`,
                            }}
                        >
                            <span>{email}</span>
                            <button
                                onClick={() => removeRecipient(email)}
                                className="hover:opacity-70 transition-opacity"
                                style={{ color: currentPalette.primary }}
                            >
                                <HiXMark size={14} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Input Field */}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    placeholder={
                        recipients.length === 0
                            ? "Type or paste email addresses..."
                            : "Add more..."
                    }
                    className="w-full outline-none bg-transparent text-sm"
                    style={{ color: currentColors.text }}
                />
            </div>

            {/* Action Buttons and Counter */}
            <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => addRecipient(inputValue)}
                        disabled={!inputValue.trim()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: currentPalette.primary,
                            color: "#FFFFFF",
                        }}
                    >
                        <HiPlus size={16} />
                        Add
                    </button>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all duration-200"
                        style={{
                            backgroundColor: currentColors.border,
                            color: currentColors.text,
                        }}
                    >
                        <HiDocumentArrowUp size={16} />
                        Upload CSV
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleCSVUpload}
                        className="hidden"
                    />
                </div>

                <span
                    className="text-xs select-none opacity-50"
                    style={{
                        color:
                            recipients.length >= maxRecipients
                                ? "#EF4444"
                                : currentColors.text,
                    }}
                >
                    {recipients.length} / {maxRecipients}
                </span>
            </div>

            {/* Helper Text */}
            <p
                className="text-xs mt-2 opacity-60"
                style={{ color: currentColors.text }}
            >
                Press Enter, comma, or space to add. Upload CSV file or paste
                multiple emails at once.
            </p>
        </div>
    );
};

export default RecipientInput;
