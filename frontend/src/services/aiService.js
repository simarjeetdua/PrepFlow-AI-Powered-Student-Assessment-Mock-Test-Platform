import api from "./api";

const sendMessage = async (message) => {
    if (!message?.trim()) {
        throw new Error("Message is required.");
    }

    const response = await api.post("/ai/chat", {
        message: message.trim(),
    });

    return response.data;
};

const aiService = {
    sendMessage,
};

export default aiService;