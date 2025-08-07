import { useState } from "react";
import axios from "axios";

const EmailForm = () => {
    const [receiverEmail, setReceiverEmail] = useState("");
    const [shortMessage, setShortMessage] = useState("");
    const [status, setStatus] = useState("");
    const [sendAsDraft, setSendAsDraft] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        if (!receiverEmail || !shortMessage || !receiverEmail.includes("@")) {
            e.preventDefault();
            setStatus("❌ Please enter a valid email address and a message.");
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:8000/send-email",
                {
                    receiver_email: receiverEmail,
                    short_message: shortMessage,
                    send_as_draft: sendAsDraft,
                }
            );
            console.log(response.data);
            setStatus("✅ Email sent successfully!");
        } catch (error: unknown) {
            console.error("Error sending email:", error);
            if (
                axios.isAxiosError(error) &&
                error.response &&
                error.response.data
            ) {
                setStatus(`❌ Error: ${error.response.data.detail}`);
            } else {
                setStatus("❌ An unexpected error occurred.");
            }
        }
    };
    return (
        <div className="email-form flex flex-col items-center p-4">
            <h2 className="text-lg font-bold mb-4">Send Email</h2>
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-white p-6 rounded shadow-md"
            >
                <div className="mb-4">
                    <label htmlFor="receiverEmail">Receiver Email:</label>
                    <input
                        className="w-full p-2 border rounded"
                        type="email"
                        id="receiverEmail"
                        value={receiverEmail}
                        onChange={(e) => setReceiverEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="shortMessage">Short Message:</label>
                    <textarea
                        className="w-full h-24 p-2 border rounded"
                        rows={4}
                        id="shortMessage"
                        value={shortMessage}
                        onChange={(e) => setShortMessage(e.target.value)}
                        required
                    ></textarea>
                    <label>
                        <input
                            type="checkbox"
                            checked={sendAsDraft}
                            onChange={(e) => setSendAsDraft(e.target.checked)}
                        />
                        Save as Draft
                    </label>
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 text-white py-2 px-4 rounded cursor-pointer"
                >
                    Send Email
                </button>
                {status && <p className="mt-4 text-center">{status}</p>}
            </form>
        </div>
    );
};

export default EmailForm;
