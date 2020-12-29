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
    const [milliSecondsArray, setMilliSecondsArray] = useState<number[]>([]);

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
            props.updateMilliSeconds(0);
            setMilliSecondsArray([...milliSecondsArray, props.milliSeconds]);
        }
    }, [props.count]);

    const countTime = () => {
        props.updateMilliSeconds(props.milliSeconds + props.milliInterval);
    };
    const startTimer = () => {
        setIsStarted(true);
    };
    const stopTimer = () => {
        if (timeoutId != null) {
            clearTimeout(timeoutId);
        }
    };

    return (
        <React.Fragment>
            <p>{props.milliSeconds}ms</p>
            <p>{milliSecondsArray}</p>
            <button onClick={startTimer}>開始</button>
            <button onClick={stopTimer}>停止</button>
        </React.Fragment>
    );
};
