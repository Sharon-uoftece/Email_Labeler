import react, {useState} from "react";
import {Page} from "../common";

//SCENARIOS: 1. for newly signed up users, you are automaticaly logged in you do not need to use login function again
//2. for newly signed up users, for testing, you can refresh the page and try log in with your credentials
//3. NOTE: each user can only do one round of labelling, reason being python backend is not conencted yet to generate new round of email instructions
//all user can only do one round, which is with the emails identified in day0.json, will implement later round logic when python backend connected
//if a user attempt to do the second round of labelling, backend will crash and THIS IS EXPECTED
function LogIn({ page, setPage, currentUser, setCurrentUser}: { page: number, setPage: (page: number) => void, currentUser: string, setCurrentUser: (currentUser: string) => void}) {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [noUserErr, setNoUserErr] = useState(false);
    const [pswErr, setPswErr] = useState(false);
 
    function loginResponseHandle(response:any) {
        if (response.status === 200) {
            setPage(Page.UserInfo);
            setCurrentUser(userName);
        }
        else if (response.status === 404) {
            setNoUserErr(true);
        } else {
            setPswErr(true);
        }
    }

    const loginHandle = async(e:React.SyntheticEvent) => {
        e.preventDefault();
        
        const myData = {
            user: userName,
            password: password
        }
        console.log("frontend loginHandle ready to send user input to backend");

        const result = await fetch('http://localhost:8000/login', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(myData)
        })
        .then((response) => loginResponseHandle(response))
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
            <div className="log-in-form">
                <h1>Log in here...</h1>
                <form onSubmit={loginHandle}>
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
                    {noUserErr?<span>&nbsp;User does not exist, sign up first&nbsp;</span>:null}
                    {pswErr?<span>&nbsp;Wrong credentials &nbsp;</span>:null}


                    <button type="submit">Log In</button>
                    <br /><br />
                </form>
            </div>
        </div>
    )
}

export default LogIn