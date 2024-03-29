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

// server.listen(1234, '0.0.0.0');

const express = require('express');
// const cors = require('cors');
const app = express(); 
// app.use(cors);
app.use(express.json());
const fs = require('fs');


app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ["*"]);
    res.append("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT");
    res.append("Access-Control-Allow-Headers", "Content-Type");
    next();
});

app.post('/login',async (req,res) => {
    console.log("Inside /login")
    const registeredUser = fs.readFileSync('./records/registeredUser.txt', {encoding:'utf8', flag:'r'});
    const registeredJson = JSON.parse(registeredUser);
    let foundUser = false;
    var sha512 = require('js-sha512').sha512;
    var hUsername = sha512(req.body.user);
    var hPwd = sha512(req.body.password);

    for (let i = 0; i < registeredJson.length; i++) {
        if (registeredJson[i].hashedUser === hUsername) {
            foundUser = true;
            if (registeredJson[i].hashedPassword === hPwd) {
                console.log("BREAKPOINT success backend /login");
                
                res.status(200).send('success');
                // const userName = req.body.user;
                let date_time = new Date();
                let date = ("0" + date_time.getDate()).slice(-2);
                let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
                let year = date_time.getFullYear();
                let hours = date_time.getHours();
                let minutes = date_time.getMinutes();
                let seconds = date_time.getSeconds();
                var dataToPush = {
                    user: hUsername,
                    timestamp: year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds
                }
                fs.appendFileSync('./records/userLogInRecords.txt', JSON.stringify(dataToPush) + '\r\n');
                
            } else {
                res.status(401).send('wrong password');
            }
            
        } 
    }
    
    if (foundUser === false) {
        console.log("BREAKPOINT wrong credentials backend /login");
        res.status(404).send('wrong credentials');
    } 
})

app.post('/signup/',async (req,res,next) => {
    console.log("inside backend /signup");

    var sha512 = require('js-sha512').sha512;

    const userName = req.body.user;
    var hashedUsername = sha512(userName);
    const password = req.body.password;
    var hashedPwd = sha512(password);

    let date_time = new Date();
    let date = ("0" + date_time.getDate()).slice(-2);
    let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
    let year = date_time.getFullYear();
    let hours = date_time.getHours();
    let minutes = date_time.getMinutes();
    let seconds = date_time.getSeconds();
    let timestamp = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

    const registeredUser = fs.readFileSync('./records/registeredUser.txt', {encoding:'utf8', flag:'r'});
    const registeredJson = JSON.parse(registeredUser);

    for (let i = 0; i < registeredJson.length; i++) {
        if (registeredJson[i].hashedUser === hashedUsername) {
            res.status(401).send('already registered');
            return next();
        } 
    }
    
    //appending unhashed user and psw just for purpose of testing whether multiple signup can occur, unhashed info will be removed later
    var dataToPush = {
        hashedUser: hashedUsername, 
        hashedPassword: hashedPwd,
        user: userName,
        password: password,
        timestamp: timestamp
    }
    registeredJson.push(dataToPush);
    fs.writeFileSync('./records/registeredUser.txt', JSON.stringify(registeredJson, null, 2));

    var data = {
        user: hashedUsername,
        timestamp: timestamp
    }
    fs.appendFileSync('./records/userLogInRecords.txt', JSON.stringify(data) + '\r\n');

    res.status(200).send('user successfully created');
})

app.post('/submitLabel',async (req,res,next) => {
    console.log("inside backend /submitLabel"); 

    const userName = req.body[0].user;
    var sha512 = require('js-sha512').sha512;
    var hashedUsername = sha512(userName);
    
    var fileUsername = hashedUsername.slice(0,5);
    let fileLocation = '../history/';
    let fileSuffix = '.json';
    var fileName = fileLocation.concat(fileUsername, fileSuffix);   

    var labelToPush = [];

    for (const element of Object.keys(req.body)) {
        const emailId = req.body[element].emailId;
        const label = req.body[element].label;
        const confidence = req.body[element].confidence;

        var dataToPush = {
            query_mid: emailId,
            model_type: "EDIG",
            sensitive: label,
            confidence: confidence,
        }
        labelToPush.push(dataToPush);
    }

    var recordToPush = {
    }

    recordToPush["0"] = labelToPush;

    // console.log("this is record to push", recordToPush);
    fs.writeFileSync(fileName, JSON.stringify(recordToPush, null, 2) + "\r\n");


    /////////////////adding code to update userDoneDay0.txt to see if user should see email from history_day_0.json
    const userDoneDay0= fs.readFileSync('./records/userDoneDay0.txt', {encoding:'utf8', flag:'r'});
    const noneFirstTimeUsers = JSON.parse(userDoneDay0);

    for (let i = 0; i < noneFirstTimeUsers.length; i++) {
        if (noneFirstTimeUsers[i].user === hashedUsername) {
            return next();
        } 
    }
    
    //if the user is not already in this list, then we need to append for future reference
    var userReady = {
        user: hashedUsername, 
    }
    noneFirstTimeUsers.push(userReady);
    fs.writeFileSync('./records/userDoneDay0.txt', JSON.stringify(noneFirstTimeUsers, null, 2));
})

// app.get('/getLabelHistory',(req,res) => {
//     const {readFileSync} = require('fs');
//     var sha512 = require('js-sha512').sha512;
//     var hUsername = sha512(req.body.user);

//     const registeredUser = fs.readFileSync('./records/registeredUser.txt', {encoding:'utf8', flag:'r'});
//     const registeredJson = JSON.parse(registeredUser);
//     for (let i = 0; i < registeredJson.length; i++) {
//         if (registeredJson[i].user === hUsername ) {
//             var labelHistory = readFileSync("../history/history_day0.json", 'utf-8');
//         } else {
//             var fileUsername = hUsername.slice(0,5);
//             let fileLocation = '../history/';
//             let fileSuffix = '.json';
//             var fileName = fileLocation.concat(fileUsername, fileSuffix);
            
//             // const labelHistory = readFileSync("../history/{fileUsername}.json", 'utf-8');
//             labelHistory = readFileSync(fileName, 'utf-8');
//         }
//     }

//     // // read history_day0.json for day 0
//     // // if username !isin(allowedUser): 
//     //         var labelHistory = readFileSync("../history/history_day0.json", 'utf-8');
//     // // else:
//     // // read dynamic history for each user for the rest of the experiment
//     //         var fileUsername = hUsername.slice(0,5);
//     //         let fileLocation = '../history/';
//     //         let fileSuffix = '.json';
//     //         var fileName = fileLocation.concat(fileUsername, fileSuffix);
            
//     //         // const labelHistory = readFileSync("../history/{fileUsername}.json", 'utf-8');
//     //         labelHistory = readFileSync(fileName, 'utf-8');
            
//     //const readFileSync('./labelRecords.txt', 'utf8'); 
//     var historyArr = labelHistory.split("\r\n");
//     // historyArr.pop();
//     return res.json(historyArr.map((value) => JSON.parse(value)));
// })

//this backend function sends frontend the emails that the currentUser supposed to see
//for day0 users, they will see the ten fixed emails in history_day0.json
//for other users that had done day0, they will see the ten emails assigned to them
//fully functional now, next step to do is to have the model_type correctly updated
//need to send model_type info as well to frontend, so then when frontend calls /submitLabel, it has the correct model_type
//currently model_type is hardcoded to "EDIG"
//NOTE: the column titles of casestudy2_var_only are reformatted and uniformed, spaces are omitted
//if possible please keep them that way in the future
app.post('/fetchEmailToShow',(req,res,next) => {
    console.log("inside backend fetchEmailToShow", req.body.currentUser);
    
    let currentUser = req.body.currentUser;
    var sha512 = require('js-sha512').sha512;
    var hashedUsername = sha512(currentUser);
    var showDay0Data = true;

    const userDoneDay0= fs.readFileSync('./records/userDoneDay0.txt', {encoding:'utf8', flag:'r'});
    const noneFirstTimeUsers = JSON.parse(userDoneDay0);

    for (let i = 0; i < noneFirstTimeUsers.length; i++) {
        if (noneFirstTimeUsers[i].user === hashedUsername) {
            showDay0Data = false;
        } 
    }

    if (showDay0Data === false) {
        //show ten random emails from the casestudy2_var_only pool
        console.log("show ten random emails from the casestudy2_var_only pool");
    } else {
        //show the emails in history_day0.json
        console.log("show the emails in history_day0.json");

        const day0ToRead = fs.readFileSync('../history/history_day0.json', {encoding:'utf8', flag:'r'});
        var toReadList = JSON.parse(day0ToRead);
        const csvPool = fs.readFileSync('../history/casestudy2_var_only.csv', {encoding:'utf8', flag:'r'});

        // console.log("toReadList", toReadList[0]);
        const CSVToJSON = csv => {
            const lines = csv.split('\n');
            const keys = lines[0].split(',');
            return lines.slice(1).map(line => { 
                return line.split(',').reduce((acc, cur, i) => {
                    const toAdd = {};
                    toAdd[keys[i]] = cur;
                    return { ...acc, ...toAdd };
                }, {});
            });
        };
        var jsonPool = CSVToJSON(csvPool); 
        var dataToSendBack = [];

        for( let i = 0; i < toReadList[0].length; i++) {
            var index = toReadList[0][i].query_mid - 1;
            console.log(i, index);
            dataToSendBack.push(jsonPool[index]);
        }
        
        console.log("this is data to sent back", dataToSendBack);
        return res.send(dataToSendBack);
    }

    
    // fs.appendFileSync('./timeStampTest.txt', JSON.stringify(dataToPush) + '\r\n');

    return res.json("testing fetchEmailToShow");
})

app.get('/testTimeStamp',(req,res) => {
    console.log("Inside test timestamp")
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

// app.get('/users/:userToLogIn/:password',(req,res) => {
//     console.log(req.params);

//     for(let i= 0; i < users.length; i++) {
//         if (users[i].username == req.params.userToLogIn) {
//             console.log("user found inside database");
//             if (users[i].password == req.params.password) {
//                 console.log("user/psw matched, ready to log in");
//             }
//         }
//     }

//     const newUser = users.map((user) => {
//         const {username} = user;
//         let date_time = new Date();
//         let date = ("0" + date_time.getDate()).slice(-2);
//         let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
//         let year = date_time.getFullYear();
//         let hours = date_time.getHours();
//         let minutes = date_time.getMinutes();
//         let seconds = date_time.getSeconds();

//         var dataToPush = {
//             user: username,
//             timestamp: year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds
//         }

//         fs.appendFileSync('./timeStampTest.txt', JSON.stringify(dataToPush) + '\r\n');
//         return {dataToPush}; 
//     })
//     return res.json(newUser);
// })


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

// app.listen(8000, ()=> {
//     console.log("server is listening on port 8000");
// })

app.listen(8000, '0.0.0.0');


