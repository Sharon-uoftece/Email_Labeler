const express = require('express');
const app = express(); 
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
    var sha512 = require('js-sha512').sha512;
    const userName = req.body.user;
    var hashedUsername = sha512(userName);
    const password = req.body.password;
    var hashedPwd = sha512(password);

    const registeredUser = fs.readFileSync('./records/registeredUser.txt', {encoding:'utf8', flag:'r'});
    const registeredJson = JSON.parse(registeredUser);

    for (let i = 0; i < registeredJson.length; i++) {
        if (registeredJson[i].hashedUser === hashedUsername) {
            res.status(401).send('already registered');
            return next();
        } 
    }

    var fileUsername = hashedUsername.slice(0,5);
    let fileLocation = '../history/';
    let fileSuffix = '.json';
    var fileName = fileLocation.concat(fileUsername, fileSuffix);  
    
    console.log("inside backend /signup", fileUsername);

    const day0ToRead = fs.readFileSync('../history/history_day0.json', {encoding:'utf8', flag:'r'});
    var toReadList = JSON.parse(day0ToRead);
    // console.log("toReadList",toReadList);

    fs.writeFileSync(fileName, JSON.stringify(toReadList, null, 2) + "\r\n");
    
    let date_time = new Date();
    let date = ("0" + date_time.getDate()).slice(-2);
    let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
    let year = date_time.getFullYear();
    let hours = date_time.getHours();
    let minutes = date_time.getMinutes();
    let seconds = date_time.getSeconds();
    let timestamp = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

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

app.post('/getRound',async (req,res) => {
    console.log("Inside /getRound")
    var sha512 = require('js-sha512').sha512;
    var hUsername = sha512(req.body.currentUser);
    var fileUsername = hUsername.slice(0,5);
    let fileLocation = '../history/';
    let fileSuffix = '.json';
    var fileName = fileLocation.concat(fileUsername, fileSuffix); 
    const userFile = fs.readFileSync(fileName, {encoding:'utf8', flag:'r'});

    var userFileJson = JSON.parse(userFile);
    var userFileLen = Object.keys(userFileJson).length;

    return res.send(JSON.stringify(userFileLen));
})

//this backend function sends frontend the emails that the currentUser supposed to see
//for day0 users, they will see the ten fixed emails in history_day0.json
//for other users that had done day0, they will see the ten emails assigned to them
//fully functional now, next step to do is to have the model_type correctly updated
//need to send model_type info as well to frontend, so then when frontend calls /submitLabel, it has the correct model_type
//currently model_type is hardcoded to "EDIG"
//NOTE: the column titles of casestudy2_var_only are reformatted and uniformed, spaces are omitted
//if possible please keep them that way in the future
app.post('/fetchEmailToShow',(req,res,next) => {
    
    let currentUser = req.body.currentUser;
    var sha512 = require('js-sha512').sha512;
    var hashedUsername = sha512(currentUser);
    var fileUsername = hashedUsername.slice(0,5);
    let fileLocation = '../history/';
    let fileSuffix = '.json';
    var fileName = fileLocation.concat(fileUsername, fileSuffix);   

    console.log("inside backend fetchEmailToShow" , fileUsername);

    const csvPool = fs.readFileSync('../history/casestudy2_var_only.csv', {encoding:'utf8', flag:'r'});
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

    const userFile = fs.readFileSync(fileName, {encoding:'utf8', flag:'r'});
    var userFileJson = JSON.parse(userFile);
    var jsonPool = CSVToJSON(csvPool); 
    var dataToSendBack = [];

    var keysArray = Object.keys(userFileJson);
    var userFileLen = Object.keys(userFileJson).length;
    // if (userFileLen === 10) {
    //     res.status(200).send('user finished all ten rounds');
    // } 
    var lastKey = keysArray[userFileLen - 1];
    
    for (const element of Object.keys(userFileJson)) {
        console.log("element in object.keys(userFileJson)", element);
        if (element === lastKey) {
            var toReadList = userFileJson[element];
            console.log("toReadList", userFileJson[element]);
        }
    }

    for( let i = 0; i < 10; i++) {
        var index = toReadList[i].query_mid - 1;
        dataToSendBack.push(jsonPool[index]);
    }
    return res.send(dataToSendBack);
})

app.post('/submitLabel',async (req,res,next) => {

    const userName = req.body[0].user;
    var sha512 = require('js-sha512').sha512;
    var hashedUsername = sha512(userName);
    console.log("inside backend /submitLabel", hashedUsername.slice(0,5)); 
    
    var fileUsername = hashedUsername.slice(0,5);
    let fileLocation = '../history/';
    let fileSuffix = '.json';
    var fileName = fileLocation.concat(fileUsername, fileSuffix);  

    const userFile = fs.readFileSync(fileName, {encoding:'utf8', flag:'r'});
    var userFileJson = JSON.parse(userFile);
    var keysArray = Object.keys(userFileJson);
    var userFileLen = Object.keys(userFileJson).length;
    var lastKey = keysArray[userFileLen - 1];
    var i = 0;

    for (const element of Object.keys(userFileJson)) {
        console.log("element in object.keys(userFileJson)", element);
        if (element === lastKey) {
            for (const reqElement of Object.keys(req.body)) {
                userFileJson[element][i].label = req.body[reqElement].label;
                userFileJson[element][i].confidence = req.body[reqElement].confidence;
                i++;
            }
            
        }
    }

    fs.writeFileSync(fileName, JSON.stringify(userFileJson, null, 2) + "\r\n");
    console.log("inside /submitLabel, this is userFileJson length",Object.keys(userFileJson).length);
    var fileObjectCount = Object.keys(userFileJson).length;
    console.log("fileObjectCount",fileObjectCount);
    if (fileObjectCount === 10) {
        var response = "ok";
        res.send(JSON.stringify(response));
    }
})


app.listen(8000, '0.0.0.0');


