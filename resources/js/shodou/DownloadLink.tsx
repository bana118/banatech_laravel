import React, { ReactElement, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";

interface DownloadButtonProps {
    canvas: HTMLCanvasElement | undefined;
    hexCanvasColor: string;
    count: number;
    updateCount: (count: number) => void;
}

export const DownloadLink = (props: DownloadButtonProps): ReactElement => {
    const anchorRef = useRef<HTMLAnchorElement | null>(null);
    useHotkeys("ctrl+s", (event: KeyboardEvent) => {
        const anchor = anchorRef.current;
        if (anchor == null) {
            console.log("anchor loading error");
        } else {
            anchor.click();
        }
        event.preventDefault();
    });
    const downloadCanvas = () => {
        const anchor = anchorRef.current;
        if (anchor == null) {
            console.log("anchor loading error");
        } else {
            if (props.canvas == null) {
                console.log("canvas loading error");
            } else {
                const base64 = props.canvas.toDataURL("image/png");
                anchor.download = `${props.count}.png`;
                props.updateCount(props.count + 1);
                anchor.href = base64;
                const context = props.canvas.getContext("2d");
                if (context == null) {
                    console.log("context loading error");
                } else {
                    context.fillStyle = props.hexCanvasColor;
                    context.fillRect(
                        0,
                        0,
                        context.canvas.width,
                        context.canvas.height
                    );
                }
            }
        }
    };
    return (
        <div className="uk-margin">
            <a ref={anchorRef} onClick={downloadCanvas}>
                保存(Ctrl+s)
            </a>
        </div>
    );
};
