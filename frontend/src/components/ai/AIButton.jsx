import { useState, useRef } from "react";
import { Sparkles } from "lucide-react";

const AIButton = ({ onClick, position, onPositionChange }) => {
    const [isDragging, setIsDragging] = useState(false);
    const dragDataRef = useRef({
        isPointerDown: false,
        startX: 0,
        startY: 0,
        initialPosX: 0,
        initialPosY: 0,
        hasMoved: false,
    });

    const buttonRef = useRef(null);

    const handlePointerDown = (e) => {
        // Only react to primary pointer (left mouse click or touch)
        if (e.button !== 0 && e.pointerType === "mouse") return;

        const currentX = position?.x ?? Math.max(16, window.innerWidth - 160);
        const currentY = position?.y ?? Math.max(16, window.innerHeight - 76);

        dragDataRef.current = {
            isPointerDown: true,
            startX: e.clientX,
            startY: e.clientY,
            initialPosX: currentX,
            initialPosY: currentY,
            hasMoved: false,
        };

        try {
            e.currentTarget.setPointerCapture(e.pointerId);
        } catch (err) {}
    };

    const handlePointerMove = (e) => {
        if (!dragDataRef.current.isPointerDown) return;

        const deltaX = e.clientX - dragDataRef.current.startX;
        const deltaY = e.clientY - dragDataRef.current.startY;
        const dist = Math.hypot(deltaX, deltaY);

        // Distinguish intentional drag from accidental minor jitter (> 5px)
        if (dist > 5) {
            if (!dragDataRef.current.hasMoved) {
                dragDataRef.current.hasMoved = true;
                setIsDragging(true);
            }

            const btnWidth = buttonRef.current?.offsetWidth || 132;
            const btnHeight = buttonRef.current?.offsetHeight || 46;

            const padding = 16;
            const rawX = dragDataRef.current.initialPosX + deltaX;
            const rawY = dragDataRef.current.initialPosY + deltaY;

            // Keep strictly clamped within visible viewport boundaries
            const clampedX = Math.max(padding, Math.min(rawX, window.innerWidth - btnWidth - padding));
            const clampedY = Math.max(padding, Math.min(rawY, window.innerHeight - btnHeight - padding));

            if (onPositionChange) {
                onPositionChange({ x: clampedX, y: clampedY });
            }
        }
    };

    const handlePointerUp = (e) => {
        if (!dragDataRef.current.isPointerDown) return;

        const hasMoved = dragDataRef.current.hasMoved;
        dragDataRef.current.isPointerDown = false;
        setIsDragging(false);

        try {
            e.currentTarget.releasePointerCapture(e.pointerId);
        } catch (err) {}

        // If the user tapped/clicked without dragging, open the AI Tutor
        if (!hasMoved) {
            onClick?.();
        }
    };

    const handlePointerCancel = (e) => {
        dragDataRef.current.isPointerDown = false;
        setIsDragging(false);
        try {
            e.currentTarget.releasePointerCapture(e.pointerId);
        } catch (err) {}
    };

    const launcherStyle = {
        position: "fixed",
        left: position ? `${position.x}px` : "auto",
        top: position ? `${position.y}px` : "auto",
        right: position ? "auto" : "28px",
        bottom: position ? "auto" : "28px",
        touchAction: "none",
        zIndex: 1100,
    };

    return (
        <button
            ref={buttonRef}
            type="button"
            className={`ai-draggable-launcher ${isDragging ? "is-dragging" : ""}`}
            style={launcherStyle}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            aria-label="Open PrepFlow AI Tutor (Drag to reposition)"
            title="PrepFlow AI Tutor — Click to open or drag to reposition"
        >
            <div className="ai-launcher-icon-wrap" aria-hidden="true">
                <Sparkles size={17} strokeWidth={2.2} />
            </div>
            <span className="ai-launcher-title">AI Tutor</span>
            <span className="ai-launcher-drag-grip" aria-hidden="true">
                <span className="grip-dot" />
                <span className="grip-dot" />
            </span>
        </button>
    );
};

export default AIButton;
