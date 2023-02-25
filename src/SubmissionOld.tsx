import React, { useState, useLayoutEffect, useEffect } from "react";
import { Page } from "./common";
import {Button,} from "@blueprintjs/core";
import correctData from "./correctData"
import Delay from "./Delay";


function Submission({page,setPage,sensitivityMap, numEmails}:
    {page: number; setPage:(page:number) => void;sensitivityMap: Record<string, Record<string, any>>; numEmails: number}) {
        const LoadingComponent = () => <div>Loading...</div>;

    function App() {
        const [isLoading, setLoading] = useState(true);
        const [isError, setIsError] = useState(false);

        const onLoadEffect = () => {
            setTimeout(() => {
                setLoading(false);
            }, 2000);

            setTimeout(() => {
                setIsError(true);
            }, 10000);
        };

        useEffect(onLoadEffect, []);

        if (isLoading) {
            return <LoadingComponent />;
        }
        return (
            <div className="App">
                {isError ? (
                    <div style={{ color: "red" }}>Something went wrong</div>
                ) : (
                    <div>Data that you want to display</div>
                )}
            </div>
        );
    }

    useEffect(()=> {App()},[]);
    return (
        <div className="score-page">
            {/* <p className="show-score">Thank you for completing this survey! </p> */}
            {/* <Delay></Delay> */}
            {/* <p className="show-score">uploading data and retraining model </p> */}
            
            {/*button for going back to user info page is removed, need to work on cleaning up states to start re-label fresh*/}
            {/*scoring points and giving reward points are removed, since no doing reward system anymore, should focus on input/output data */}
            {/* <Button
                icon="arrow-left"
                intent="warning"
                text={"Back to User Info Page"}
                onClick={() => {
                    setPage(Page.UserInfo);
                }}
            /> */}

            {/* <p className="show-score-2">You scored {emailScore}/{numEmails} on this survey</p>
            <p className="show-score-3">You now have {emailScore} Reward Points</p>
            <button className="redeem-button">redeem Reward Points</button> */}
        </div>
    )
}

export default Submission;