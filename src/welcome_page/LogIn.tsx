import react, {useEffect, useState} from "react";
import axios from "axios";
import {Page, Header} from "../common";
import userData from "../userData";

function LogIn({ page, setPage }: { page: number, setPage: (page: number) => void}) {
    const [userName, setUserName] = useState('');
    const [userNameErr, setUserNameErr] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordErr, setPasswordErr] = useState(false);
    const [interest, setInterest] = useState('Label');

    function loginHandler(e:React.SyntheticEvent) {
        // const fs = require('fs');
        // const current = new Date();
        e.preventDefault();
        let foundUsername = false;
        const userInterest = interest;
        

        console.log(userName, password, interest);
        for (var i=0; i<userData.length; i++) {
            if (userName == userData[i].user) {
                foundUsername = true;
                if (password == userData[i].password) {
                    setPage(Page.Survey);
                    console.log("username and psw match, ready to log in...");
                    loginHandle(e);
                } else {
                    setPasswordErr(true);
                    console.log("username exist but wrong password, cannot log in...");
                }
            } 
        }
        if (!foundUsername) {
            setUserNameErr(true);
            console.log("username not in system");
        }
    }

    const loginHandle = async(e:React.SyntheticEvent) => {
        e.preventDefault();
        console.log(userName, password);
        
        const myData = {
            user: userName,
            password: password
        }
        console.log("loginHandle function being called");

        const result = await fetch('http://localhost:5000/login/', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(myData)
        })
        .then((response) => console.log(response))
        .catch(err => console.log("ERROR:", err));
    }


    function usernameHandler(e:React.SyntheticEvent) {
        e.preventDefault();
        setUserNameErr(false);
        setUserName(e.target.value);
    }

    function passwordHandler(e:React.SyntheticEvent) {
        e.preventDefault();
        setPasswordErr(false);
        setPassword(e.target.value);
    }
    
    return(
        <div>
            <div className="log-in-form">
                <h1>Log in here...</h1>
                {/* {data.map(item => 
                    <div>
                        <h1>{Object.values(JSON.parse(item))}</h1>
                    </div>
                )} */}
                <form onSubmit={loginHandler}>
                    <label>User Name: </label>
                    <input 
                        type="text"
                        placeholder="Enter name"
                        // onChange={(e) =>setUserName(e.target.value)}
                        onChange={(e) => usernameHandler(e)}
                    />
                    {userNameErr?<span>&nbsp;User name does not exist in system...</span>:null}
                    <br/> <br/>
                    <label>Password: &nbsp;</label>
                    <input 
                        type="password"
                        placeholder="Enter password"
                        // onChange={(e) =>setPassword(e.target.value)}
                        onChange={passwordHandler}
                    />
                    {passwordErr?<span>&nbsp;Wrong Password...</span>:null}
                    <br/> <br/>
                    <select onChange={(e) => setInterest(e.target.value)}>
                        <option>Label</option>
                        <option>Comment</option>
                    </select>
                    <br /> <br />
                    <button type="submit">Log In</button>
                    <br /> <br />
                </form>
            </div>
        </div>
    )
}

export default LogIn