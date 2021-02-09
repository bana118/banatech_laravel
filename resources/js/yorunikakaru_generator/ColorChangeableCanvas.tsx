import React, { ReactElement, useState, useRef, useEffect } from "react";

interface ColorChangeableCanvasProps {
    imageUrl: string;
}

export const ColorChangeableCanvas = (
    props: ColorChangeableCanvasProps
): ReactElement => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [canvasContext, setCanvasContext] = useState<
        CanvasRenderingContext2D | undefined | null
    >(null);

    // Because the latest state is not referenced in the event handlers
    const canvasContextRef = useRef<
        CanvasRenderingContext2D | undefined | null
    >(null);
    canvasContextRef.current = canvasContext;

    useEffect(() => {
        const canvas = canvasRef?.current;
        const image = new Image();
        image.onload = () => {
            if (canvas != null) {
                const context = canvas.getContext("2d");
                canvas.width = image.width;
                canvas.height = image.height;
                if (context != null) {
                    context.drawImage(image, 0, 0);
                    const imageData = context.getImageData(
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );
                    const idata = imageData.data;
                    const imageSize = idata.length;
                    const pixelSize = imageSize / 4;
                    for (let i = 0; i < pixelSize; i++) {
                        const r = idata[i * 4];
                        const g = idata[i * 4 + 1];
                        const b = idata[i * 4 + 2];
                        const gray = (r * 30 + g * 59 + b * 11) / 100;
                        idata[i * 4] = gray;
                        idata[i * 4 + 1] = gray;
                        idata[i * 4 + 2] = gray;
                    }
                    context.putImageData(imageData, 0, 0);
                }
            }
        };
        image.src = props.imageUrl;
    }, [props.imageUrl]);

    return (
        <div className="uk-padding" style={wrapperStyle}>
            <canvas ref={canvasRef} style={canvasStyle} />
        </div>
    );
};

const canvasStyle = {
    display: "inline-block",
    border: "1px solid gray",
};

const wrapperStyle = {
    flex: 1,
    textAlign: "center" as const,
};
