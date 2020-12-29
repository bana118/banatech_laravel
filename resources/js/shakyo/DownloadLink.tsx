import React, { ReactElement, useState, useRef, useEffect } from "react";

interface DownloadButtonProps {
    canvas: HTMLCanvasElement | undefined;
    updateCount: (count: number) => void;
}

export const DownloadLink = (props: DownloadButtonProps): ReactElement => {
    const anchorRef = useRef<HTMLAnchorElement | null>(null);
    const [count, setCount] = useState(1);
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
            }
        }
    };
    return (
        <a ref={anchorRef} onClick={downloadCanvas}>
            保存
        </a>
    );
};
