import React, { ReactElement, useState, useRef, useEffect } from "react";

interface DownloadButtonProps {
    canvas: HTMLCanvasElement | undefined;
}

export const DownloadLink = (props: DownloadButtonProps): ReactElement => {
    const anchorRef = useRef<HTMLAnchorElement | null>(null);
    const downloadCanvas = () => {
        const anchor = anchorRef.current;
        if (anchor != null) {
            if (props.canvas != null) {
                const base64 = props.canvas.toDataURL("image/png");
                anchor.download = "hoge.png";
                anchor.href = base64;
            }
        }
    };
    return (
        <a ref={anchorRef} onClick={downloadCanvas}>
            Save
        </a>
    );
};
