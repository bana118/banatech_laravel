import React, { ReactElement } from "react";

interface SizeChangerProps {
    size: number;
    max: number;
    min: number;
    updateSize: (size: number) => void;
}

export const SizeChanger = (props: SizeChangerProps): ReactElement => {
    const updateWithValidation = (input: string) => {
        const size = Number(input);
        if (!Number.isNaN(size) && size <= props.max && size >= props.min) {
            props.updateSize(size);
        }
    };
    return (
        <input
            type="number"
            value={props.size}
            onChange={(event) => updateWithValidation(event.target.value)}
        />
    );
};
