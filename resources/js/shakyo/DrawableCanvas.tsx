import React, { ReactElement, useState, useRef, useEffect } from "react";

interface CanvasProps {
    size: number;
    lineWidth: number;
    updateCanvas: (canvas: HTMLCanvasElement) => void;
}

export const DrawableCanvas = (props: CanvasProps): ReactElement => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [canvasContext, setCanvasContext] = useState<
        CanvasRenderingContext2D | undefined | null
    >(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [positionX, setPositionX] = useState(0);
    const [positionY, setPositionY] = useState(0);

    // Because the latest state is not referenced in the event handlers
    const canvasContextRef = useRef<
        CanvasRenderingContext2D | undefined | null
    >(null);
    canvasContextRef.current = canvasContext;
    const isDrawingRef = useRef(false);
    isDrawingRef.current = isDrawing;
    const positionXRef = useRef(0);
    positionXRef.current = positionX;
    const positionYRef = useRef(0);
    positionYRef.current = positionY;

    useEffect(() => {
        const canvas = canvasRef?.current;
        if (canvas == null) {
            console.log("canvasRef loading error");
        } else {
            // Set passive to false to disable normal touch events in preventListner
            canvas.addEventListener("touchmove", onTouchDraw, false);
        }
    }, []);

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
                context.lineWidth = props.lineWidth;
                context.lineJoin = "round";
                context.lineCap = "round";
                context.save();
            }
        }
    }, [props.size, props.lineWidth]);

    const drawLine = (x: number, y: number) => {
        if (canvasContextRef.current != null) {
            canvasContextRef.current.beginPath();
            canvasContextRef.current.moveTo(
                positionXRef.current,
                positionYRef.current
            );
            canvasContextRef.current.lineTo(x, y);
            canvasContextRef.current.stroke();
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
    const onTouchDraw = (event: TouchEvent) => {
        if (isDrawingRef.current) {
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
            event.preventDefault();
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
                // onTouchMove={onTouchDraw}
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
