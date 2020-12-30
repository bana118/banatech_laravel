import React, { ReactElement, useState } from "react";

interface ColorChangerProps {
    propertyName: string;
    hexColor: string;
    updateHexColor: (color: string) => void;
}

export const ColorChanger = (props: ColorChangerProps): ReactElement => {
    const [inputValue, setInputValue] = useState("#000000");
    const updateWithValidation = (input: string) => {
        setInputValue(input);
        const hexColorPattern = /^#[0-9a-fA-F]{6}$/;
        if (hexColorPattern.test(input)) {
            props.updateHexColor(input);
        }
    };
    return (
        <div className="uk-margin">
            <p>{props.propertyName}</p>
            <input
                className="uk-input uk-form-width-small uk-form-small"
                type="text"
                value={inputValue}
                onChange={(event) => updateWithValidation(event.target.value)}
            />
            <input
                type="color"
                value={props.hexColor}
                onChange={(event) => updateWithValidation(event.target.value)}
            />
        </div>
    );
};
