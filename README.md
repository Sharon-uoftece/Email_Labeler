# EmailLabler frontend and backend

## JavaScript's requirements before running this project
- npm version 8.5.5
- node version 16.15.0
- react version 18.2.0

## Main Features
- *records of all registered users are saved in registeredUser.txt, all newly signup users's credentials should be included upon registration
- *records of all labelling made by registered users are saved in labelRecords.txt, all newly submitted labelling should be included upon submition 
- *records of all user login history are saved in userLoginRecords.txt, when you successfully login/signup, a new record(with timestamp) will be included


## Steps to run (preferable to run them in order)
### JS
- `node server.js` at `./backend`
- `npm start` at `./` then open (click or copy-and-paste on any web browser) `link` shown in your terminal
### Python
- `python main.py` at `./pyscript`

## EmailLabeler frontend
The emailLabeler frontend currently consists of four pages. 
- main page
- survey page
- label page
- reward page

### Main page features
* quick start button (to be replaced by LogIn/SignIn button)
* on-page video tutorial 
* model performance line chart
* labelling history fetcher

### Survey page feature
This page allows user to choose the number of email to label for this time. The min is set to 1 and the max is set to 10.

### Label page feature
This page allows user to identify each email as sensitvie or not-sensitive using given information. Given information includes DateSent, SenderName, RecipientName, EmailSubject, RecipientCount, FileSensitiveCount, FileSize and DaySinceHire. To label each email, simply click the sensitive button if you suspecct the email to contain sensitive information, click the non-sensitive button otherwise. There is also a confidence slider bar for you to mark your confidence level of such choice. 

### Reward page feature
This page shows how many email you have correctly label, for each correctly labeled email, the user will get one reward point.



