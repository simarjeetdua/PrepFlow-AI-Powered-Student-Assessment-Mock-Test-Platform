import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, LoaderCircle } from "lucide-react";
import api from "../../services/api";

const AIAssistant = ({ onClose }) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: "assistant",
            content:
                "Hi! I'm your AI Assistant. I can help you with mock tests, subjects, and your exam preparation.",
        },
    ]);

    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);

    // Automatically scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages, loading]);

    const handleSendMessage = async (e) => {
        e?.preventDefault();

        const trimmedMessage = message.trim();

        if (!trimmedMessage || loading) {
            return;
        }

        // Add user's message immediately
        const userMessage = {
            id: Date.now(),
            role: "user",
            content: trimmedMessage,
        };

        setMessages((prev) => [...prev, userMessage]);
        setMessage("");
        setLoading(true);

        try {
            /*
             * This endpoint will be created in your backend:
             *
             * POST /api/ai/chat
             *
             * The backend will send the message to Mistral 7B.
             */
            const response = await api.post("/ai/chat", {
                message: trimmedMessage,
            });

            const aiReply =
                response.data.reply ||
                response.data.message ||
                "Sorry, I couldn't generate a response.";

            const assistantMessage = {
                id: Date.now() + 1,
                role: "assistant",
                content: aiReply,
            };

            setMessages((prev) => [...prev, assistantMessage]);

        } catch (error) {
            console.error("AI Assistant Error:", error);

            const errorMessage = {
                id: Date.now() + 1,
                role: "assistant",
                content:
                    error.response?.data?.message ||
                    "Sorry, I'm unable to respond right now. Please try again.",
            };

            setMessages((prev) => [...prev, errorMessage]);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-assistant">

            {/* Header */}
            <div className="ai-header">

                <div className="ai-header-info">

                    <div className="ai-icon">
                        <Bot size={20} />
                    </div>

                    <div>
                        <h3>AI Assistant</h3>

                        <span className="ai-status">
                            <span className="status-dot"></span>
                            Online
                        </span>
                    </div>

                </div>

                <button
                    type="button"
                    className="ai-close-button"
                    onClick={onClose}
                    aria-label="Close AI Assistant"
                >
                    <X size={20} />
                </button>

            </div>

            {/* Messages */}
            <div className="ai-messages">

                {messages.map((item) => (
                    <div
                        key={item.id}
                        className={`chat-message ${
                            item.role === "user"
                                ? "user-message"
                                : "assistant-message"
                        }`}
                    >

                        {item.role === "assistant" && (
                            <div className="message-avatar">
                                <Bot size={16} />
                            </div>
                        )}

                        <div className="message-content">
                            {item.content}
                        </div>

                    </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                    <div className="chat-message assistant-message">

                        <div className="message-avatar">
                            <Bot size={16} />
                        </div>

                        <div className="message-content typing">
                            <LoaderCircle
                                size={16}
                                className="loading-icon"
                            />

                            Thinking...
                        </div>

                    </div>
                )}

                <div ref={messagesEndRef}></div>

            </div>

            {/* Input */}
            <form
                className="ai-input-container"
                onSubmit={handleSendMessage}
            >

                <input
                    type="text"
                    placeholder="Ask me anything..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={loading}
                />

                <button
                    type="submit"
                    disabled={!message.trim() || loading}
                    aria-label="Send message"
                >
                    <Send size={18} />
                </button>

            </form>

        </div>
    );
};

export default AIAssistant;