import { useEffect, useState } from "react";
import { Page } from "./common";
import {Button, Spinner} from "@blueprintjs/core";

const LoadingComponent = () => 
    <div className="score-page">
        <Spinner
            className="submission-spinner"
            size={70}
        />
        <p className="show-score">Uploading data and retraining model, please wait...</p>
    </div>;

export default function Submission({page,setPage,sensitivityMap, numEmails,currentUser,
    setCurrentUser}:
    {page: number; setPage:(page:number) => void;sensitivityMap: Record<string, Record<string, any>>; numEmails: number;
        currentUser: string;
        setCurrentUser: (currentUser: string) => void;}) {
    const [doneTen, setDoneTen] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    const onLoadEffect = () => {
        setTimeout(() => {
            setLoading(false);
        }, 16000);

        setTimeout(() => {
            setIsError(true);
        }, 10000);
    };

    useEffect(onLoadEffect, []);


    async function handleSubmitResponse(response:any) {
        const resData = await response.json();
        console.log("this is resdata", resData);
        if (resData === 10) {
          setDoneTen(true);
        }
        console.log("this is user this round and its doneTen value", currentUser,doneTen);
    }

    var info = {
      currentUser: currentUser
    }

    useEffect(()=>{
        console.log("Current User: ", currentUser);
        async function fetchData() {
          const result = await fetch('http://localhost:8000/getRound', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
              body: JSON.stringify(info)
            })
            .then((response) => handleSubmitResponse(response))
            .catch(err => console.log("ERROR:", err));
        }
        fetchData();
      }, []);

    if (isLoading) {
        return <LoadingComponent />;
    }
    return (
        <div className="score-page">
            {doneTen === true && 
                <div className="agreement">
                    <p className="show-score">Thank you for completing all 10 rounds of survey! </p> 
                    <h1 className="agreement-statement">Please let us know if you agree to let us use your inputs</h1>
                    <button
                        className="approve-button"
                        onClick={() => {
                            setPage(Page.Thankyou);
                        }}
                    >Approve</button>
                    <button
                        className="approve-button"
                        onClick={() => {
                            setPage(Page.Thankyou);
                        }}
                    >Disapprove</button>
                </div>}
            
            {doneTen === false && 
                <div>
                    <p className="show-score">Thank you for completing this survey! </p> 
                    <button
                        className="back-button"
                        onClick={() => {
                            setPage(Page.UserInfo);
                        }}
                    >Back to User Info Page</button>
                </div>
            }
            
        </div>
    );
}