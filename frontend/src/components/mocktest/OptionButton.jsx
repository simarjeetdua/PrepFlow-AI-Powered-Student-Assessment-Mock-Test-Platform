import { Check, X } from "lucide-react";

const OptionButton = ({
    option,
    selected = false,
    correct = false,
    incorrect = false,
    disabled = false,
    onClick,
}) => {
    let optionClass = "option-button";

    if (selected) {
        optionClass += " selected";
    }

    if (correct) {
        optionClass += " correct";
    }

    if (incorrect) {
        optionClass += " incorrect";
    }

    return (
        <button
            type="button"
            className={optionClass}
            onClick={onClick}
            disabled={disabled}
        >
            <span className="option-text">
                {option}
            </span>

            {correct && (
                <span className="option-result correct-result">
                    <Check size={18} />
                </span>
            )}

            {incorrect && (
                <span className="option-result incorrect-result">
                    <X size={18} />
                </span>
            )}
        </button>
    );
};

export default OptionButton;