import React, { ReactElement } from "react";

interface ImagePreviewerProps {
    imageUrl: string;
    setImageUrl: (url: string) => void;
}

export const ImagePreviewer = (props: ImagePreviewerProps): ReactElement => {
    const previewImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files != null) {
            const url = URL.createObjectURL(event.target.files[0]);
            console.log(url);
            props.setImageUrl(url);
        }
    };

    return (
        <div className="uk-padding" style={wrapperStyle}>
            <input
                type="file"
                id="input"
                onChange={previewImage}
                accept="image/*"
            />
            <img src={props.imageUrl} />
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
