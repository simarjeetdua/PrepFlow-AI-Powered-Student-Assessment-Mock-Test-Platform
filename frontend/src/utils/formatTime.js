// Convert seconds into MM:SS format
export const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;
};

// Convert minutes into MM:SS format
export const formatMinutes = (minutes) => {
    if (!Number.isFinite(minutes) || minutes < 0) {
        return "00:00";
    }

    return formatTime(minutes * 60);
};