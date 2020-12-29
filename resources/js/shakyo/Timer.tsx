import React, { ReactElement, useState, useRef, useEffect } from "react";

interface TimerProps {
    milliSeconds: number;
    updateMilliSeconds: (milliSeconds: number) => void;
    milliInterval: number;
    count: number;
}

export const Timer = (props: TimerProps): ReactElement => {
    const [isStarted, setIsStarted] = useState(false);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>(
        undefined
    );

    useEffect(() => {
        if (isStarted) {
            const id = setTimeout(countTime, props.milliInterval);
            setTimeoutId(id);
            return () => {
                clearTimeout(id);
            };
        }
    }, [props.milliSeconds, isStarted]);

    useEffect(() => {
        if (timeoutId != null) {
            clearTimeout(timeoutId);
        }
    }, [props.count]);

    const countTime = () => {
        props.updateMilliSeconds(props.milliSeconds + props.milliInterval);
    };
    const startTimer = () => {
        setIsStarted(true);
    };

    return (
        <React.Fragment>
            <p>{props.milliSeconds}ms</p>
            <button onClick={startTimer}>開始</button>
        </React.Fragment>
    );
};
