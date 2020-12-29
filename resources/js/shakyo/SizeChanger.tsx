import React, { ReactElement } from "react";

interface SizeChangerProps {
    size: number;
    updateSize: (size: number) => void;
}

export const SizeChanger = (props: SizeChangerProps): ReactElement => {
    const updateWithValidation = (input: string) => {
        const size = Number(input);
        if (!Number.isNaN(size) && size <= 1000 && size > 0) {
            props.updateSize(size);
        }
    };
    return (
        <input
            type="text"
            value={props.size}
            onChange={(event) => updateWithValidation(event.target.value)}
        />
    );
};
