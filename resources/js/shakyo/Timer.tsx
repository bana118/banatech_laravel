import React, { ReactElement, useState, useRef, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

interface TimerProps {
    count: number;
}

// milliSeconds
const INTERVAL = 50;

export const Timer = (props: TimerProps): ReactElement => {
    const anchorRef = useRef<HTMLAnchorElement | null>(null);
    useHotkeys("ctrl+a", (event: KeyboardEvent) => {
        startTimer();
        event.preventDefault();
    });
    useHotkeys("ctrl+d", (event: KeyboardEvent) => {
        finish();
        const anchor = anchorRef.current;
        if (anchor == null) {
            console.log("anchor loading error");
        } else {
            anchor.click();
        }
        event.preventDefault();
    });
    const [isStarted, setIsStarted] = useState(false);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>(
        undefined
    );
    const [milliSeconds, setMilliSeconds] = useState(0);
    const [milliSecondsArray, setMilliSecondsArray] = useState<number[]>([]);

    useEffect(() => {
        if (isStarted) {
            const id = setTimeout(countTime, INTERVAL);
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
        setMilliSeconds(milliSeconds + INTERVAL);
    };
    const startTimer = () => {
        setMilliSeconds(0);
        setIsStarted(true);
    };
    const finish = () => {
        setIsStarted(false);
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
            <div className="uk-margin">
                <a onClick={startTimer}>タイマー開始(Ctrl+a)</a>
            </div>
            <div className="uk-margin">
                <a ref={anchorRef} onClick={finish}>
                    タイマー停止(Ctrl+d)
                </a>
            </div>
            <p>{milliSeconds}ms</p>
            <p>{milliSecondsArray.join(",")}</p>
        </React.Fragment>
    );
};
