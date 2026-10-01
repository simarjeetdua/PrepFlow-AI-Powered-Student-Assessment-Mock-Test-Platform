import { useChat as useChatContext } from "../context/ChatContext";

const useChat = () => {
    return useChatContext();
};

export default useChat;