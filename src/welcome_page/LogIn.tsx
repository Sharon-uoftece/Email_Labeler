import react, {useState} from "react";
import {Page} from "../common";

function LogIn({ page, setPage, currentUser, setCurrentUser}: { page: number, setPage: (page: number) => void, currentUser: string, setCurrentUser: (currentUser: string) => void}) {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [loginErr, setLoginErr] = useState(false);
 
    function loginResponseHandle(response:any) {
        if (response.status == 200) {
            setLoginErr(false);
            setPage(Page.UserInfo);
            setCurrentUser(userName);
        }
        else {
            setLoginErr(false);
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
                    {(loginErr)?<span>&nbsp;Wrong Credentials...</span>:null}

                    <button type="submit">Log In</button>
                    <br /><br />
                </form>
            </div>
        </div>
    )
}

export default LogIn