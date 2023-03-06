import React, {useEffect, useState} from "react"
import {Page, Header} from "./common";

function UserInfo({ page, setPage, currentUser, setCurrentUser}: 
    { page: number, 
      setPage: (page: number) => void, 
      currentUser: string, 
      setCurrentUser: (currentUser: string) => void}) {

    function handleStartLabel() {
        setPage(Page.LabelGeneral);
    }

    // function handleShowHistory() {
    //     setPage(Page.LabelHistory);
    // }

    const [numRound, setNumRound] = useState(0);

    async function handleResponse(response:any) {
        const resData = await response.json();
        console.log("this is resData", resData);
        setNumRound(resData-1);
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
            .then((response) => handleResponse(response))
            .catch(err => console.log("ERROR:", err));
        }
        fetchData();
      }, []);

    return(
        <div className="userinfo">
            <Header />
            {/* <h1 className="userinfo-welcome-text">Hi {currentUser}!</h1> */}
            {/* <button 
                className="userinfo-history-button"
                onClick={handleShowHistory}>
                See previous labeling history...
            </button> */}

            <div className="round-label">You have finished {numRound} rounds</div>
            <button 
                className="userinfo-label-button"
                onClick={handleStartLabel}
            >
                Start new labelling here...
            </button>
            
        </div>
    )
}

export default UserInfo;