import React, { ReactElement } from "react";

interface SizeChangerProps {
    propertyName: string;
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
        <div className="uk-margin">
            <div>
                <label htmlFor={props.propertyName}>{props.propertyName}</label>
            </div>
            <input
                id={props.propertyName}
                className="uk-input uk-form-width-small uk-form-small"
                type="number"
                value={props.size}
                onChange={(event) => updateWithValidation(event.target.value)}
            />
        </div>
    );
};
