import {
    createContext,
    useContext,
    useState,
} from "react";

import api from "../services/api";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: "assistant",
            content:
                "Hi! I'm your AI Assistant. I can help you with mock tests, subjects, and your exam preparation.",
        },
    ]);

    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const sendMessage = async (message) => {
        const trimmedMessage = message.trim();

        if (!trimmedMessage || loading) {
            return;
        }

        const userMessage = {
            id: Date.now(),
            role: "user",
            content: trimmedMessage,
        };

        setMessages((previousMessages) => [
            ...previousMessages,
            userMessage,
        ]);

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

            setMessages((previousMessages) => [
                ...previousMessages,
                assistantMessage,
            ]);

            return assistantMessage;
        } catch (error) {
            console.error(
                "AI Assistant Error:",
                error
            );

            const errorMessage = {
                id: Date.now() + 1,
                role: "assistant",
                content:
                    error.response?.data?.message ||
                    "Sorry, I'm unable to respond right now. Please try again.",
            };

            setMessages((previousMessages) => [
                ...previousMessages,
                errorMessage,
            ]);

            return errorMessage;
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([
            {
                id: Date.now(),
                role: "assistant",
                content:
                    "Hi! I'm your AI Assistant. I can help you with mock tests, subjects, and your exam preparation.",
            },
        ]);
    };

    const openChat = () => {
        setIsOpen(true);
    };

    const closeChat = () => {
        setIsOpen(false);
    };

    const toggleChat = () => {
        setIsOpen((previousState) => !previousState);
    };

    const value = {
        messages,
        loading,
        isOpen,
        sendMessage,
        clearChat,
        openChat,
        closeChat,
        toggleChat,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);

    if (!context) {
        throw new Error(
            "useChat must be used inside ChatProvider"
        );
    }

    return context;
};

export default ChatContext;