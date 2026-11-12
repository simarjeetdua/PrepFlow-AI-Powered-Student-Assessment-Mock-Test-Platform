import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, LoaderCircle, Sparkles } from "lucide-react";
import api from "../../services/api";

const AIAssistant = ({ onClose, launcherPosition }) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: "assistant",
            content:
                "Hi there! I'm your PrepFlow AI Tutor. Ask me anything about your mock tests, concepts, formulas, or study guidance.",
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

    // Calculate intelligent panel position based on launcher's current coordinates
    const getPanelStyle = () => {
        if (!launcherPosition || window.innerWidth <= 640) {
            return {}; // Use default CSS mobile/drawer placement
        }

        const panelWidth = 380;
        const panelHeight = 540;
        const padding = 16;

        let left = launcherPosition.x;
        // If launcher is on right side of screen, align panel properly
        if (left + panelWidth > window.innerWidth - padding) {
            left = Math.max(padding, window.innerWidth - panelWidth - padding);
        }

        let top = launcherPosition.y - panelHeight - 12;
        // If not enough room above, position below launcher
        if (top < padding) {
            top = launcherPosition.y + 54;
        }
        // Keep clamped inside viewport
        if (top + panelHeight > window.innerHeight - padding) {
            top = Math.max(padding, window.innerHeight - panelHeight - padding);
        }

        return {
            left: `${left}px`,
            top: `${top}px`,
            right: "auto",
            bottom: "auto",
        };
    };

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
        <div className="ai-assistant" style={getPanelStyle()}>
            {/* Header */}
            <div className="ai-header">
                <div className="ai-header-info">
                    <div className="ai-icon">
                        <Bot size={19} />
                    </div>

                    <div>
                        <div className="ai-title-row">
                            <h3>PrepFlow AI Tutor</h3>
                            <span className="ai-model-pill">
                                <Sparkles size={11} />
                                AI
                            </span>
                        </div>

                        <span className="ai-status">
                            <span className="status-dot"></span>
                            Online & Ready
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    className="ai-close-button"
                    onClick={onClose}
                    aria-label="Close AI Assistant"
                >
                    <X size={18} />
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
                                <Bot size={15} />
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
                            <Bot size={15} />
                        </div>

                        <div className="message-content typing">
                            <LoaderCircle
                                size={15}
                                className="loading-icon animate-spin"
                            />
                            <span>Generating response...</span>
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
                    placeholder="Ask about formulas, exam questions, tips..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={loading}
                    aria-label="AI message input"
                />

                <button
                    type="submit"
                    disabled={!message.trim() || loading}
                    aria-label="Send message"
                    className="ai-send-btn"
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
};

export default AIAssistant;
