import React, { ReactElement } from "react";

interface ImagePreviewerProps {
    imageUrl: string;
    setImageUrl: (url: string) => void;
}

export const ImagePreviewer = (props: ImagePreviewerProps): ReactElement => {
    const previewImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files != null) {
            const url = URL.createObjectURL(event.target.files[0]);
            props.setImageUrl(url);
        }
    };

    return (
        <div className="uk-padding" style={wrapperStyle}>
            <div className="uk-margin">
                <div className="uk-form-custom">
                    <input
                        id="fileInput"
                        type="file"
                        accept="image/*"
                        onChange={previewImage}
                    />
                    <button
                        className="uk-button uk-button-primary"
                        type="button"
                    >
                        画像選択
                    </button>
                </div>
            </div>
            <img src={props.imageUrl} />
        </div>
    );
};

const wrapperStyle = {
    flex: 1,
    textAlign: "center" as const,
};
