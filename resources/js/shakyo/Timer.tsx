import React, { ReactElement, useState, useRef, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

interface TimerProps {
    count: number;
}

export const Timer = (props: TimerProps): ReactElement => {
    const anchorRef = useRef<HTMLAnchorElement | null>(null);
    useHotkeys("ctrl+a", (event: KeyboardEvent) => {
        startTimer();
        event.preventDefault();
    });
    const [isStarted, setIsStarted] = useState(false);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>(
        undefined
    );
    const [milliSeconds, setMilliSeconds] = useState(0);
    const milliInterval = 50;
    const [milliSecondsArray, setMilliSecondsArray] = useState<number[]>([]);

    useEffect(() => {
        if (isStarted) {
            const id = setTimeout(countTime, milliInterval);
            setTimeoutId(id);
            return () => {
                clearTimeout(id);
            };
        }
    }, [milliSeconds, isStarted]);

    useEffect(() => {
        if (timeoutId != null) {
            clearTimeout(timeoutId);
            setMilliSeconds(0);
            setMilliSecondsArray([...milliSecondsArray, milliSeconds]);
        }
    }, [props.count]);

    const countTime = () => {
        setMilliSeconds(milliSeconds + milliInterval);
    };
    const startTimer = () => {
        setIsStarted(true);
    };
    const finish = () => {
        if (timeoutId != null) {
            clearTimeout(timeoutId);
        }
        const anchor = anchorRef.current;
        if (anchor == null) {
            console.log("anchor loading error");
        } else {
            const header = "id,time";
            const content = milliSecondsArray.map((ms, i) => `${i + 1},${ms}`);
            const csv = [header, ...content].join("\n");
            const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
            const blob = new Blob([bom, csv], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            anchor.download = "times.csv";
            anchor.href = url;
            // cause network error
            // window.URL.revokeObjectURL(url);
        }
    };

    return (
        <React.Fragment>
            <p>{milliSeconds}ms</p>
            <p>{milliSecondsArray}</p>
            <a onClick={startTimer}>開始</a>
            <a ref={anchorRef} onClick={finish}>
                終了
            </a>
        </React.Fragment>
    );
};
