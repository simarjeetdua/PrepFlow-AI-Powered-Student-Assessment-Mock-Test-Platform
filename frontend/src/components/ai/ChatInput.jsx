import { useState } from "react";
import { Send } from "lucide-react";

const ChatInput = ({ onSend, loading = false }) => {
    const [message, setMessage] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmedMessage = message.trim();

        if (!trimmedMessage || loading) {
            return;
        }

        onSend(trimmedMessage);

        setMessage("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form
            className="ai-input-container"
            onSubmit={handleSubmit}
        >
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                disabled={loading}
                rows={1}
            />

            <button
                type="submit"
                disabled={!message.trim() || loading}
                aria-label="Send message"
            >
                <Send size={18} />
            </button>
        </form>
    );
};

export default ChatInput;