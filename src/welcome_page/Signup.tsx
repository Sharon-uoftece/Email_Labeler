import react, {useEffect, useState} from "react";
import axios from "axios";
import {Page, Header} from "../common";
import { exit } from "process";

//updated signup logic, user no longer can sign up with same ID
//if user attempt signup with already-registered ID, frontend shows error msg "user already exist"
//now signup system will not cause any kind of backend crash
//after successful sign up, user is automatically logged in and will be directed to USERINFO page 
//USERINFO page allows user to start labelling
//user can log in with the ID and psw that they used to sign up, backend fully functional
function Signup({ page, setPage, currentUser, setCurrentUser}: { page: number, setPage: (page: number) => void, currentUser: string, setCurrentUser: (currentUser: string) => void}) {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [alreadyExist, setAlreadyExist] = useState(false);

    function signupResponseHandle(response:any) {
        if (response.status === 401) {
            setAlreadyExist(true);
        } else if (response.status === 200){
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
                        onChange={(e) => usernameHandler(e)}
                    />
                    <br/> <br/>
                    <label>Password: &nbsp;</label>
                    <input 
                        type="password"
                        placeholder="Enter password"
                        onChange={passwordHandler}
                    />
                    <br/> <br/>
                    {alreadyExist?<span>&nbsp; user already exist</span>:null}
                    <button type="submit">Sign up</button>
                    <br /><br />
                </form>
            </div>
        </div>
    )
}

export default Signup