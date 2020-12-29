import React, { ReactElement, useState, useRef, useEffect } from "react";

interface CanvasProps {
    size: number;
    updateCanvas: (canvas: HTMLCanvasElement) => void;
}

export const Canvas = (props: CanvasProps): ReactElement => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [canvasContext, setCanvasContext] = useState<
        CanvasRenderingContext2D | undefined | null
    >(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [positionX, setPositionX] = useState(0);
    const [positionY, setPositionY] = useState(0);

    useEffect(() => {
        const canvas = canvasRef?.current;
        if (canvas == null) {
            console.log("canvasRef loading error");
        } else {
            const context = canvas.getContext("2d");
            // At this point, canvasContext is still undefined
            if (context == null) {
                console.log("canvasContext loading error");
            } else {
                setCanvasContext(context);
                props.updateCanvas(context.canvas);
                context.fillStyle = "rgb(255,255,255)";
                context.fillRect(
                    0,
                    0,
                    context.canvas.width,
                    context.canvas.height
                );
                context.strokeStyle = "#000000";
                context.lineWidth = 5;
                context.lineJoin = "round";
                context.lineCap = "round";
                context.save();
            }
        }
    }, [props.size]);

    const drawLine = (x: number, y: number) => {
        if (canvasContext != null) {
            canvasContext.beginPath();
            canvasContext.moveTo(positionX, positionY);
            canvasContext.lineTo(x, y);
            canvasContext.stroke();
        }
    };
    const onTouchDrawStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        const eventTarget = event.touches[0].target as HTMLElement;
        const x =
            event.touches[0].clientX - eventTarget.getBoundingClientRect().left;
        const y =
            event.touches[0].clientY - eventTarget.getBoundingClientRect().top;
        setPositionX(x);
        setPositionY(y);
        event.stopPropagation();
    };
    const onTouchDrawEnd = (event: React.TouchEvent<HTMLCanvasElement>) => {
        setIsDrawing(false);
        event.stopPropagation();
    };
    const onTouchDraw = (event: React.TouchEvent<HTMLCanvasElement>) => {
        if (isDrawing) {
            const eventTarget = event.touches[0].target as HTMLElement;
            const x =
                event.touches[0].clientX -
                eventTarget.getBoundingClientRect().left;
            const y =
                event.touches[0].clientY -
                eventTarget.getBoundingClientRect().top;
            drawLine(x, y);
            setPositionX(x);
            setPositionY(y);
            event.stopPropagation();
        }
    };

    const onMouseDrawStart = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (event.buttons == 1) {
            setIsDrawing(true);
            const eventTarget = event.target as HTMLElement;
            const x = event.clientX - eventTarget.getBoundingClientRect().left;
            const y = event.clientY - eventTarget.getBoundingClientRect().top;
            setPositionX(x);
            setPositionY(y);
        }
    };
    const onMouseDrawEnd = () => {
        setIsDrawing(false);
    };
    const onMouseDraw = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (isDrawing) {
            const eventTarget = event.target as HTMLElement;
            const x = event.clientX - eventTarget.getBoundingClientRect().left;
            const y = event.clientY - eventTarget.getBoundingClientRect().top;
            drawLine(x, y);
            setPositionX(x);
            setPositionY(y);
        }
    };

    return (
        <div style={wrapperStyle}>
            <canvas
                ref={canvasRef}
                width={props.size}
                height={props.size}
                style={canvasStyle}
                onTouchStart={onTouchDrawStart}
                onTouchEnd={onTouchDrawEnd}
                onTouchMove={onTouchDraw}
                onMouseDown={onMouseDrawStart}
                onMouseEnter={onMouseDrawStart}
                onMouseUp={onMouseDrawEnd}
                onMouseLeave={onMouseDrawEnd}
                onMouseMove={onMouseDraw}
            />
        </div>
    );
};

const canvasStyle = {
    display: "inline-block",
    border: "1px solid gray",
    backgroundColor: "white",
};

const wrapperStyle = {
    flex: 1,
    textAlign: "center" as const,
};
