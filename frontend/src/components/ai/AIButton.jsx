import { Bot } from "lucide-react";

const AIButton = ({ onClick }) => {
    return (
        <button
            type="button"
            className="ai-floating-button"
            onClick={onClick}
            aria-label="Open AI Assistant"
            title="AI Assistant"
        >
            <Bot size={26} />
        </button>
    );
};

export default AIButton;