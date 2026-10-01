import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

const TestTimer = ({ duration, onTimeUp }) => {
    const [timeLeft, setTimeLeft] = useState(duration * 60);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp?.();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((previousTime) => previousTime - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onTimeUp]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(seconds).padStart(2, "0");

    const isLowTime = timeLeft <= 60;

    return (
        <div
            className={`test-timer ${
                isLowTime ? "timer-warning" : ""
            }`}
        >
            <Clock size={20} />

            <div className="timer-content">
                <span className="timer-label">
                    Time Remaining
                </span>

                <span className="timer-value">
                    {formattedMinutes}:{formattedSeconds}
                </span>
            </div>
        </div>
    );
};

export default TestTimer;