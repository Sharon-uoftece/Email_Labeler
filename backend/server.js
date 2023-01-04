// const {readFileSync, writeFileSync} = require('fs');
// const first = readFileSync('./first.txt', 'utf8');
// const second = readFileSync('./second.txt', 'utf8');
// console.log(first,second);
// writeFileSync("./result.txt", `Here is the result: ${first}, ${second}`);

// const http = require('http');
// const server = http.createServer((req, res) => {
//         const url = req.url;
//         if (url != '/' && url != '/login') {
//             res.writeHead(404, {'content-type':'text/html'});
//             res.write('page does not exist');
//             res.end();
//         }
//         else {
//             res.writeHead(200, {'content-type':'text/html'})
//             res.write('<h1>home page<h1>');
//             console.log("sharon is creating the website");
//             res.end();
//         }
//     }
// );

// server.listen(5000);

const express = require('express');
const app = express(); 
app.use(express.json());
const {users} = require('./user');
const fs = require('fs');

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ["*"]);
    res.append("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT");
    res.append("Access-Control-Allow-Headers", "Content-Type");
    next();
});

app.get('/testTimeStamp',(req,res) => {
    const newUser = req.data;

    let date_time = new Date();
    let date = ("0" + date_time.getDate()).slice(-2);
    let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
    let year = date_time.getFullYear();
    let hours = date_time.getHours();
    let minutes = date_time.getMinutes();
    let seconds = date_time.getSeconds();

    var dataToPush = {
        user: newUser,
        timestamp: year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds
    }

    fs.appendFileSync('./timeStampTest.txt', JSON.stringify(dataToPush) + '\r\n');

    return res.json("already write data to test.txt");
})

app.get('/users/:userToLogIn/:password',(req,res) => {
    console.log(req.params);

    for(let i= 0; i < users.length; i++) {
        if (users[i].username == req.params.userToLogIn) {
            console.log("user found inside database");
            if (users[i].password == req.params.password) {
                console.log("user/psw matched, ready to log in");
            }
        }
    }

    const newUser = users.map((user) => {
        const {username} = user;
        let date_time = new Date();
        let date = ("0" + date_time.getDate()).slice(-2);
        let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        let year = date_time.getFullYear();
        let hours = date_time.getHours();
        let minutes = date_time.getMinutes();
        let seconds = date_time.getSeconds();

        var dataToPush = {
            user: username,
            timestamp: year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds
        }

        fs.appendFileSync('./timeStampTest.txt', JSON.stringify(dataToPush) + '\r\n');
        return {dataToPush}; 
    })
    return res.json(newUser);
})

app.post('/login',async (req,res) => {
    console.log("testing /login");
    console.log(req.body);
    const userName = req.body.user;
    let date_time = new Date();
        let date = ("0" + date_time.getDate()).slice(-2);
        let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        let year = date_time.getFullYear();
        let hours = date_time.getHours();
        let minutes = date_time.getMinutes();
        let seconds = date_time.getSeconds();
        var dataToPush = {
            user: userName,
            timestamp: year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds
        }
        fs.appendFileSync('./timeStampTest.txt', JSON.stringify(dataToPush) + '\r\n');
        // const newUser = users.map((user) => {
        //     const {username} = user;
        //     let date_time = new Date();
        //     let date = ("0" + date_time.getDate()).slice(-2);
        //     let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        //     let year = date_time.getFullYear();
        //     let hours = date_time.getHours();
        //     let minutes = date_time.getMinutes();
        //     let seconds = date_time.getSeconds();

        //     var dataToPush = {
        //         user: username,
        //         timestamp: year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds
        //     }

        //     fs.appendFileSync('./timeStampTest.txt', JSON.stringify(dataToPush) + '\r\n');
        //     return {dataToPush}; 
        // })

    return res.json("end of /login function, check timeStampTest to see result");
})

// app.get('/users/:targetUser', (req,res) => {
//     const {targetUser} = req.params;
//     const userSharon = users.find((user) => user.username === targetUser);
//     return res.json(userSharon);
// })

// app.get('/about', (req,res)=>{
//     res.status(200).send('about page');
// })

// app.all('*', (req,res) => {
//     res.status(404).send('resource not found');
// })

app.listen(5000, ()=> {
    console.log("server is listening on port 5000");
})


