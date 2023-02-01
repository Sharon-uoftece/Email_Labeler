import react, {useEffect, useState} from "react";
import axios from "axios";
import {Page, Header} from "../common";
import { exit } from "process";

function Signup({ page, setPage, currentUser, setCurrentUser}: { page: number, setPage: (page: number) => void, currentUser: string, setCurrentUser: (currentUser: string) => void}) {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [noAccess, setNoAccess] = useState(false);
    const [alreadyExist, setAlreadyExist] = useState(false);

    function signupResponseHandle(response:any) {
        if (response.status == 400) {
            setNoAccess(true);
        } else if (response.status == 401) {
            setAlreadyExist(true);
        } else {
            setPage(Page.UserInfo);
            setCurrentUser(userName);
        }
    }
    const signupHandle = async(e:React.SyntheticEvent) => {
        e.preventDefault();
        
        const myData = {
            user: userName,
            password: password
        }

        const result = await fetch('http://localhost:8000/signup', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(myData)
        })
        .then((response) => signupResponseHandle(response))
        .catch(err => console.log("ERROR:", err));
        console.log(JSON.stringify(result));
    }


    function usernameHandler(e:React.SyntheticEvent) {
        const element = e.currentTarget as HTMLInputElement;
        const value = element.value;
        e.preventDefault();
        setUserName(value);
    }

    function passwordHandler(e:React.SyntheticEvent) {
        const element = e.currentTarget as HTMLInputElement;
        const value = element.value;
        e.preventDefault();
        setPassword(value);
    }
    
    return(
        <div>
            <div className="sign-up-form">
                <h1>Sign up here...</h1>
                <form onSubmit={signupHandle}>
                    <label>ID: </label>
                    <input 
                        type="text"
                        placeholder="Enter name"
                        // onChange={(e) =>setUserName(e.target.value)}
                        onChange={(e) => usernameHandler(e)}
                    />
                    {/* {userNameErr?<span>&nbsp;User name does not exist in system...</span>:null} */}
                    <br/> <br/>
                    <label>Password: &nbsp;</label>
                    <input 
                        type="password"
                        placeholder="Enter password"
                        // onChange={(e) =>setPassword(e.target.value)}
                        onChange={passwordHandler}
                    />
                    {/* {passwordErr?<span>&nbsp;Wrong Password...</span>:null} */}
                    <br/> <br/>
                    {/* <select onChange={(e) => setInterest(e.target.value)}>
                        <option>Label</option>
                        <option>Comment</option>
                    </select> */}
                    {/* {(userNameErr || passwordErr)?<span>&nbsp;Wrong Credentials...</span>:null} */}
                    {noAccess?<span>&nbsp; no access</span>:null}
                    {alreadyExist?<span>&nbsp; user already exist</span>:null}
                    <button type="submit">Sign up</button>
                    <br /><br />
                </form>
            </div>
        </div>
    )
}

export default Signup