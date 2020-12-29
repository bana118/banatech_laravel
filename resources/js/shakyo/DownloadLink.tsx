import React, { ReactElement, useState, useRef, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

interface DownloadButtonProps {
    canvas: HTMLCanvasElement | undefined;
    updateCount: (count: number) => void;
}

export const DownloadLink = (props: DownloadButtonProps): ReactElement => {
    const anchorRef = useRef<HTMLAnchorElement | null>(null);
    const [count, setCount] = useState(1);
    useHotkeys("ctrl+s", (event: KeyboardEvent) => {
        const anchor = anchorRef.current;
        if (anchor != null) {
            downloadCanvas();
            anchor.click();
        }
        event.preventDefault();
    });
    useEffect(() => {
        props.updateCount(count);
    }, [count]);
    const downloadCanvas = () => {
        const anchor = anchorRef.current;
        if (anchor != null) {
            if (props.canvas != null) {
                const base64 = props.canvas.toDataURL("image/png");
                anchor.download = `${count}.png`;
                setCount(count + 1);
                anchor.href = base64;
                const context = props.canvas.getContext("2d");
                if (context != null) {
                    context.fillStyle = "rgb(255,255,255)";
                    context.fillRect(
                        0,
                        0,
                        context.canvas.width,
                        context.canvas.height
                    );
                } else {
                    console.log("context loading error");
                }
            } else {
                console.log("canvas loading error");
            }
        } else {
            console.log("anchor loading error");
        }
    };
    return (
        <a ref={anchorRef} onClick={downloadCanvas}>
            保存(Ctrl+s)
        </a>
    );
};
