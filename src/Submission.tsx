import { useEffect, useState } from "react";
import { Page } from "./common";
import {Button} from "@blueprintjs/core";

const LoadingComponent = () => 
    <div className="score-page">
        <p className="show-score">Uploading data and retraining model, please wait...</p>
    </div>;

export default function Submission({page,setPage,sensitivityMap, numEmails}:
    {page: number; setPage:(page:number) => void;sensitivityMap: Record<string, Record<string, any>>; numEmails: number}) {
    const [isLoading, setLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    const onLoadEffect = () => {
        setTimeout(() => {
            setLoading(false);
        }, 8000);

        setTimeout(() => {
            setIsError(true);
        }, 10000);
    };

    useEffect(onLoadEffect, []);

    if (isLoading) {
        return <LoadingComponent />;
    }
    return (
        <div className="score-page">
            <p className="show-score">Thank you for completing this survey! </p> 
            <button
                className="back-button"
                onClick={() => {
                    setPage(Page.UserInfo);
                }}
            >Back to User Info Page</button>
        </div>
    );
}