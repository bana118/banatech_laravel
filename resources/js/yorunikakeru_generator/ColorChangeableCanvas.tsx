import React, { ReactElement, useState, useRef, useEffect } from "react";

interface ColorChangeableCanvasProps {
    imageUrl: string;
}

export const ColorChangeableCanvas = (
    props: ColorChangeableCanvasProps
): ReactElement => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const anchorRef = useRef<HTMLAnchorElement | null>(null);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [bottomColor, setBottomColor] = useState("#3C5A78");
    const [topColor, setTopColor] = useState("#F05A78");

    useEffect(() => {
        if (!isInputFocused) {
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
                        const bottomRgb = hex2rgb(bottomColor);
                        const topRgb = hex2rgb(topColor);
                        const rDiff = topRgb[0] - bottomRgb[0];
                        const gDiff = topRgb[1] - bottomRgb[1];
                        const bDiff = topRgb[2] - bottomRgb[2];
                        for (let i = 0; i < pixelSize; i++) {
                            const r = idata[i * 4];
                            const g = idata[i * 4 + 1];
                            const b = idata[i * 4 + 2];
                            const gray = (r + g + b) / 3;

                            idata[i * 4] = bottomRgb[0] + (rDiff * gray) / 255;
                            idata[i * 4 + 1] =
                                bottomRgb[1] + (gDiff * gray) / 255;
                            idata[i * 4 + 2] =
                                bottomRgb[2] + (bDiff * gray) / 255;
                        }
                        context.putImageData(imageData, 0, 0);
                    }
                }
            };
            image.src = props.imageUrl;
        }
    }, [props.imageUrl, isInputFocused]);

    const downloadCanvas = () => {
        const anchor = anchorRef.current;
        const canvas = canvasRef?.current;
        if (anchor != null) {
            if (canvas != null) {
                const base64 = canvas.toDataURL("image/png");
                anchor.download = "download.png";
                anchor.href = base64;
            }
        }
    };

    const hex2rgb = (hex: string) => {
        hex = hex.slice(1);
        return [hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6)].map(
            function (str) {
                return parseInt(str, 16);
            }
        );
    };

    return (
        <div className="uk-padding" style={wrapperStyle}>
            <a ref={anchorRef} onClick={downloadCanvas}>
                画像ダウンロード
            </a>
            <div>
                <label htmlFor="bottomColor">黒</label>
                <input
                    id="bottomColor"
                    className="uk-input uk-form-width-small uk-form-small"
                    type="color"
                    value={bottomColor}
                    onChange={(event) => setBottomColor(event.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                />
            </div>
            <div>
                <label htmlFor="topColor">白</label>
                <input
                    id="topColor"
                    className="uk-input uk-form-width-small uk-form-small"
                    type="color"
                    value={topColor}
                    onChange={(event) => setTopColor(event.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                />
            </div>
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
