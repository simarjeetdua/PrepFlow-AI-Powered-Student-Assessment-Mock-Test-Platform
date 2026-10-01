import { Bot, User } from "lucide-react";

const ChatMessage = ({ message }) => {
    const isUser = message.role === "user";

    return (
        <div
            className={`chat-message ${
                isUser ? "user-message" : "assistant-message"
            }`}
        >
            {/* Avatar */}
            <div className="message-avatar">
                {isUser ? (
                    <User size={16} />
                ) : (
                    <Bot size={16} />
                )}
            </div>

            {/* Message */}
            <div className="message-content">
                {message.content}
            </div>
        </div>
    );
};

export default ChatMessage;