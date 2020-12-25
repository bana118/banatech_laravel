import React, { ReactElement } from "react";

interface CanvasProps {
    width: number;
    hight: number;
}

export const Canvas = (props: CanvasProps): ReactElement => {
    return (
        <div style={wrapperStyle}>
            <canvas
                width={props.width}
                height={props.hight}
                style={canvasStyle}
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
