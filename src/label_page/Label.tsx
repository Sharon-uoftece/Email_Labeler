import React, { useState, useLayoutEffect, useEffect } from "react";
import {
  Button,
  FormGroup,
  Alert,
  Slider,
  ProgressBar,
  Checkbox
} from "@blueprintjs/core";
import { Box,
         Grid,
         Container,
         Pagination,
         PaginationItem
} from '@mui/material/';
// import { CheckBox,
//          WarningAmber,
//          Check
// } from '@mui/icons-material/';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Popover2, Tooltip2 } from "@blueprintjs/popover2";
import { Icon, IconSize } from "@blueprintjs/core";
import { Page, Tab, twoDecimal } from "../common";
// import emailData from "../label_page/emailData";
import Carousel from "react-elastic-carousel";
import { pythonBridge } from "python-bridge";
import { json } from "stream/consumers";
import { exit } from "process";

function getMax(emailData:any) {
  const elementsOfInterest: any[] = [
    "day_since_hire",
    "size",
    "files_sensitive_count",
    "file_count",
    "rcpt_count",
  ];

  const visualDic: any = {};

  for (const element of elementsOfInterest) {
    visualDic[element] = -1;
  }

  for (let i = 0; i < 10; i++) {
    for (const element of elementsOfInterest) {
      const number = emailData[i][element];
      if (Number.isNaN(parseInt(number))) {
        console.error("Value in find max is not a number");
        continue;
      }
      visualDic[element] = Math.max(visualDic[element], parseInt(number));
    }
  }
  return visualDic;
}

function EmailBox({
  index,
  email,
  sensitivityMap,
  setSensitivityMap,
  emailData
}: {
  index: number; 
  email: any;
  sensitivityMap: Record<string, Record<string, any>>;
  setSensitivityMap: (val: any) => void;
  emailData: any[];
}) {
  console.log("EMAIL DATA IN EMAIL BOX: ", emailData);
  //the initial value of the confidence slider is set to 5, to improve user interaction
  const [confidence, setConfidence] = useState(5);
  const [pop, setPop] = useState(false);
  const [popoverContent, setPopoverContent] = useState(Tab.SenderInfo);
  const visualItemMax = getMax(emailData);


  function handelScatterPlot() {
    setPopoverContent(Tab.ScatterPlot);
  }

  function handelEmailHistory() {
    setPopoverContent(Tab.EmailHistory);
  }

  function handelSenderInfo() {
    setPopoverContent(Tab.SenderInfo);
  }

  function handleBarColor(value: any) {
    if (value < 0.3) {
      return "success";
    } else if (value > 0.3 && value < 0.7) {
      return "primary";
    } else {
      return "danger";
    }
  }

  //only a few elements are shown for now, dw it was just for the simplicity of comparing for correctness (frontend VS csv pool)
  //will include all required element-to-display later, now only a few elements are shown 
  //NOTE: query_mid will be removed later, again, it is just here now for the sake of easiness of testing

  return (
    
    <Box className="email-element" width="100%">

      <FormGroup
        inline={false}
      >
          <Grid item xs={12} display="flex" justifyContent="center" mb={4}>
            <p>{index + 1} of 10</p>
          </Grid>
          <Grid container spacing={1} display="flex" flexDirection="row" alignItems="center"
            width="100%" mb={4} wrap="wrap"
          >
            <Grid item xs={4}>
              <p className="question">
                1. Do you consider the email below as sensitive?
              </p>
            </Grid>
            <Grid item xs={4}>
              <button
                className={"label-button"}
                id={"label-button-" + (index + 1)}  
                onClick={() => {
                  const newMap = { ...sensitivityMap };
                  newMap[index + 1]["sensitive"] = true;
                  newMap[index + 1]["marked"] = true;
                  newMap[index + 1]["emailId"] = email.query_mid;
                  setSensitivityMap(newMap);

                  document.getElementById(
                    "label-button-" + (index + 1)
                  )!.style.backgroundColor = "rgb(182, 59, 59)";
                  document.getElementById(
                    "label-button-" + (index + 1)
                  )!.style.color = "rgb(255,255,255)";
                  document.getElementById(
                    "label-button-icon-" + (index + 1)
                  )!.style.color = "rgb(255,255,255)";
                  document.getElementById(
                    "label-button-non-" + (index + 1)
                  )!.style.backgroundColor = "rgb(255, 255, 255)";
                  document.getElementById(
                    "label-button-non-" + (index + 1)
                  )!.style.color = "rgb(0, 0, 0)";
                  document.getElementById(
                    "label-button-non-icon-" + (index + 1)
                  )!.style.color = "rgb(45, 125, 45)";
                }}
              >
                <Icon id={"label-button-icon-" + (index + 1)}
                  className="label-button-icon"
                  icon="warning-sign" iconSize={24}
                /> Sensitive
              </button>
            </Grid>
          
            <Grid item xs={4}>
              <button
                className={"label-button-non"}
                id={"label-button-non-" + (index + 1)}
                onClick={() => {
                  const newMap = { ...sensitivityMap };
                  newMap[index + 1]["sensitive"] = false;
                  newMap[index + 1]["marked"] = true;
                  newMap[index + 1]["emailId"] = email.query_mid;
                  setSensitivityMap(newMap);

                  document.getElementById(
                    "label-button-non-" + (index + 1)
                  )!.style.backgroundColor = "rgb(45, 125, 45)";
                  document.getElementById(
                    "label-button-non-" + (index + 1)
                  )!.style.color = "rgb(255,255,255)";
                  document.getElementById(
                    "label-button-non-icon-" + (index + 1)
                  )!.style.color = "rgb(255,255,255)";
                  document.getElementById(
                    "label-button-" + (index + 1)
                  )!.style.backgroundColor = "rgb(255, 255, 255)";
                  document.getElementById(
                    "label-button-" + (index + 1)
                  )!.style.color = "rgb(0, 0, 0)";
                  document.getElementById(
                    "label-button-icon-" + (index + 1)
                  )!.style.color = "rgb(182, 59, 59)";
                }}
              >
                <Icon
                  id={"label-button-non-icon-" + (index + 1)}
                  className="label-button-non-icon"
                  icon="tick"
                  iconSize={24}
                /> Normal
              </button>
            </Grid>
          </Grid>
          
          <Grid container spacing={1} wrap="wrap">
            <Grid item xs={4}>
              <p className="question">
                2. How confident are you about your answer?
              </p>
            </Grid>
            <Grid item xs={8} px={5}>
              <Slider
                className="confidence-slider"
                min={0}
                max={100}
                initialValue={50}
                stepSize={1}
                labelStepSize={10}
                value={confidence}
                onChange={(val) => {
                  setConfidence(val);
                  const newMap = { ...sensitivityMap };
                  newMap[index + 1]["confidence"] = val;
                  setSensitivityMap(newMap);
                }}
                intent="none"
              />
            </Grid>
          </Grid>
          <Grid container spacing={1} wrap="wrap">
            <Grid item xs={12}>
              <p className="question">
                3. Please tick the boxes (
                  <Icon
                  icon="tick"
                  color='rgb(255, 255, 255)'
                  iconSize={12}
                  style={{ border: '1px solid rgb(0, 0, 0)',
                    padding: '1px',
                    borderRadius: '2px',
                    backgroundColor:'rgb(45, 114, 210'
                  }}
                  />
                ) of email attributes below that affect your labeling decision the most.
              </p>
            </Grid>
          </Grid>
      

      {/*this part is the email body display*/ }
      <hr className="separator" />
      <p> </p>
      <div className="email-content">
      <h2>{"Email " + (index + 1)}</h2>
        {/* <p>
          {" "}
          <b>DateSent:</b> {JSON.stringify(email.year, null, 2).slice(1, -1)}/
          {JSON.stringify(email.month, null, 2).slice(1, -1)}/
          {JSON.stringify(email.day, null, 2).slice(1, -1)}
        </p> */}
        {/* <p> </p> */}
        {/* <p> */}
          {/* {" "} */}
          {/* showing query-mid just to check if correct emails are displayed, will remove later */}
          {/* <b>Query_mid:</b> {JSON.stringify(email.query_mid, null, 2).slice(1, -1)} 
        </p>
        <p> </p> */}
        <Box sx={{ my: 10 }}>
        <h3><Checkbox label="Email Info" /></h3>
        <p>
          <b>Sender:</b> {JSON.stringify(email.sender, null, 2).slice(1, -1)}
        </p>
        <p>
          <b>Recipient:</b> {JSON.stringify(email.rcpt, null, 2).slice(1,-1)}
        </p>
        <p>
          <b>Email Subject:</b> {JSON.stringify(email.subject, null, 2).slice(1,-1)}
        </p>
        <p>
          <Tooltip2
            placement="top"
            content={<div>File: {email.files}</div>}
          >
            <div><b>File:</b> {JSON.stringify(email.files, null, 2).slice(1,-1).substring(0, 20)} ...</div>
          </Tooltip2>       
        </p>
        <p>
          <b>Day of Week:</b>{" "}
          {JSON.stringify(email.day_of_week, null, 2).slice(1, -1)}
        </p>
        </Box>
        
        <Box sx={{ my:10 }}>
        <h3><Checkbox label="Sender Statistics" /></h3>
          <Grid container spacing={4} mx={0} wrap="wrap">
            <Grid item md={6} sm={12} display="flex" flexDirection="column">
              <Grid container spacing={2} width='100%' my={1}>
                <Grid item xs={5}>
                  <b>Recipient Count: </b>
                </Grid>
                <Grid item xs={1} display="flex" justifyContent="flex-end">
                  {JSON.stringify(email.rcpt_count, null, 2).slice(1, -1)}
                </Grid>
                <Grid item xs={5} display="flex" justifyContent="center">
                  <ProgressBar
                    className="email-bar"
                    animate={false}
                    stripes={false}
                    value={email.rcpt_count / email.rcpt_count_personal_max}
                    intent={handleBarColor(
                      email.rcpt_count / email.rcpt_count_personal_max
                    )}
                  />
                </Grid>
                <Grid item xs={1} >
                  {JSON.stringify(email.rcpt_count_personal_max, null, 2).slice(1, -1)}
                </Grid>
              </Grid>
              <Grid container spacing={2} width='100%' my={1}>
                <Grid item xs={5}>
                  <b>Attachment File Count: </b>
                </Grid>
                <Grid item xs={1} display="flex" justifyContent="flex-end">
                  {JSON.stringify(email.file_count, null, 2).slice(1, -1)}
                </Grid>
                <Grid item xs={5} display="flex" justifyContent="center">
                  <ProgressBar
                    className="email-bar"
                    animate={false}
                    stripes={false}
                    value={email.file_count / email.file_count_personal_max}
                    intent={handleBarColor(
                      email.file_count / email.file_count_personal_max
                    )}
                  />
                </Grid>
                <Grid item xs={1}>
                {JSON.stringify(email.file_count_personal_max, null, 2).slice(1, -1)}
                </Grid>
              </Grid>
            {/* <p>
              {" "}
              <b>rcpt count job max:</b>{" "}
              {JSON.stringify(email.rcpt_count_job_max, null, 2).slice(1, -1)}
              <ProgressBar
                className="email-bar"
                animate={false}
                stripes={false}
                value={email.rcpt_count / email.rcpt_count_job_max}
                intent={handleBarColor(
                  email.rcpt_count / email.rcpt_count_job_max
                )}
              />
            </p> */}
            </Grid>
            <Grid item md={6} sm={12} display="flex" flexDirection="column">
              <Grid container spacing={2} width='100%' my={1}>
                <Grid item xs={5}>
                  <b>Email Size: </b>
                </Grid>
                <Grid item xs={1} display="flex" justifyContent="flex-end">
                  {JSON.stringify(email.size, null, 2).slice(1, -1)}
                </Grid>
                <Grid item xs={5} display="flex" justifyContent="center">
                  <ProgressBar
                      className="email-bar"
                      animate={false}
                      stripes={false}
                      value={email.size / email.size_personal_max}
                      intent={handleBarColor(
                        email.size / email.size_personal_max
                      )}
                    />
                </Grid>
                <Grid item xs={1} >
                  {JSON.stringify(email.size_personal_max, null, 2).slice(1, -1)}
                </Grid>
              </Grid>
              <Grid container spacing={2} width='100%' my={1}>
                <Grid item xs={5}>
                  <b>Sensitive Words<br/>in Subject Line: </b>
                </Grid>
                <Grid item xs={1} display="flex" justifyContent="flex-end">
                  {JSON.stringify(email.sub_sensitive_count, null, 2).slice(1, -1)}
                </Grid>
                <Grid item xs={5} display="flex" justifyContent="center">
                  <ProgressBar
                      className="email-bar"
                      animate={false}
                      stripes={false}
                      value={email.sub_sensitive_count / email.sub_sensitive_count_personal_max}
                      intent={handleBarColor(
                        email.sub_sensitive_count / email.sub_sensitive_count_personal_max
                      )}
                    />
                </Grid>
                <Grid item xs={1} >
                  {JSON.stringify(email.sub_sensitive_count_personal_max, null, 2).slice(1, -1)}
                </Grid>
              </Grid>
                {/* <p>
                  {" "}
                  <b>file count job max:</b>{" "}
                  {JSON.stringify(email.file_count_job_max, null, 2).slice(1, -1)}
                  <ProgressBar
                    className="email-bar"
                    animate={false}
                    stripes={false}
                    value={email.file_count / email.file_count_job_max}
                    intent={handleBarColor(
                      email.file_count / email.file_count_job_max
                    )}
                  />
                    </p> */}
                {/* <p>
                  {" "}
                  <b>size job max:</b>{" "}
                  {JSON.stringify(email.size_job_max, null, 2).slice(1, -1)}
                  <ProgressBar
                    className="email-bar"
                    animate={false}
                    stripes={false}
                    value={email.size / email.size_job_max}
                    intent={handleBarColor(
                      email.size / email.size_job_max
                    )}
                  />
                </p> */}
            </Grid>
          </Grid>
        </Box>
        
        <Box sx={{ my:10 }}>
          <h3><Checkbox label="Sender Profile" /></h3>
          <Grid container spacing={4} mx={0} wrap="wrap">
            <Grid item md={6} sm={12}>
              <p>
                <b>Manager Name:</b>{" "}
                {JSON.stringify(email.manager_name, null, 2).slice(1, -1)}
              </p>
              <p>
                <b>Job Family:</b>{" "}
                {JSON.stringify(email.job_family, null, 2).slice(1, -1)}
              </p>
              <p>
                <b>Employment Type:</b>{" "}
                {JSON.stringify(email.employment_type, null, 2).slice(1, -1)}
              </p>
              <p>
                <b>Business Location:</b>{" "}
                {JSON.stringify(email.business_location, null, 2).slice(1, -1)}
              </p>
              <p>
                <b>Hire Date:</b>{" "}
                {JSON.stringify(email.hire_date, null, 2).slice(1, -1)}
              </p>
            </Grid>
            <Grid item sm={6} xs={12}>
              <p>
                <b>Employee Status:</b>{" "}
                {JSON.stringify(email.employee_status, null, 2).slice(1, -1)}
              </p>
              <p>
                <b>Government Cleared:</b>{" "}
                {JSON.stringify(email.government_cleared, null, 2).slice(1, -1)}
              </p>
              <p>
                <b>Privileged User:</b>{" "}
                {JSON.stringify(email.privileged_user, null, 2).slice(1, -1)}
              </p>
              <p>
                <b>Local Admin:</b>{" "}
                {JSON.stringify(email.local_admin, null, 2).slice(1, -1)}
              </p>
            </Grid>
          </Grid>
          
        </Box>

        </div>
        </FormGroup>
    </Box>
  );
}

function Label({
  page,
  setPage,
  initialMap,
  sensitivityMap,
  setSensitivityMap,
  currentUser,
  setCurrentUser
}: {
  page: number;
  setPage: (page: number) => void;
  initialMap: Record<string, Record<string, any>>;
  sensitivityMap: Record<string, Record<string, any>>;
  setSensitivityMap: (map: Record<string, Record<string, any>>) => void;
  currentUser: string;
  setCurrentUser: (currentUser: string) => void;
}) {

  const [doneTen, setDoneTen] = useState(false);

  var info = {
    currentUser: currentUser
  }

  const [emailData, setEmailData] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);
  const [emailPage, setEmailPage] = useState(1);

  async function handleResponse(response:any) {

    const resData = await response.json();
    const emails = [];
    for (let i = 0; i < 10; i++) {
      emails.push(resData[i]);
    }

    setEmailData(resData);
    setEmails(emails);
    // console.log("this is response body", resData);
  }

  //send request to backend to identify which data to show (history_day0 V.S. casestudy2_var_only)
  //information that backend need for identification of rounds, emails to send back: currentUser
  useEffect(()=>{
    console.log("Current User: ", currentUser);
    async function fetchData() {
      const result = await fetch('http://localhost:8000/fetchEmailToShow', {
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


  const [alertExitPage, setAlertExitPage] = useState(false);
  const [confidence, setConfidence] = useState(5);
  const [submit, setSubmit] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [markedAll, setMarkedAll] = useState(false);

  const sunlifeTheme = createTheme({
    palette: {
      primary: {
        main: 'rgb(253, 192, 60)',
      },
      secondary: {
        main: 'rgb(14, 56, 70)'
      }
    }
  });
  
  function handleSubmit() {
    setSubmit(true);
    setMarkedAll(false);
    setSensitivityMap(initialMap);
    setPage(Page.Submitted);
  }
  
  useEffect(() => {
    let markedCount = 0;
    for (const element of Object.keys(sensitivityMap)) {
      if (sensitivityMap[element]["marked"] === true) {
        markedCount += 1;
      }
    }
    if (markedCount === 10) {
      setMarkedAll(true);
    } 
  }, [sensitivityMap]);

  const mappingFunc = (email: any, index: number, map: any, setMap: any) => {
    return (
      <EmailBox
        index={index}
        email={email}
        sensitivityMap={map}
        setSensitivityMap={setMap}
        emailData={emailData}
      />
    );
  };

  const handleExitCancel = () => {
    setAlertExitPage(!alertExitPage);
  };

  const handleExitConfirm = () => {
    setPage(Page.UserInfo);
  };

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  console.log('THESE ARE THE EMAILS '+
    emails.map((email: any, index: number) =>
      mappingFunc(email, index, sensitivityMap, setSensitivityMap)
    )
  );

  const handleEmailPageChange = (event:any, page:any) => {
    setEmailPage(page);
  }

  const labelSubmitHandler = async(e:React.SyntheticEvent) => {
    handleSubmit();
    e.preventDefault();
    const dataToSubmit = [];
    console.log(sensitivityMap);
    for (const element of Object.keys(sensitivityMap)) {
      
      const myData = {
        user: currentUser,
        emailId: sensitivityMap[element]["emailId"],
        label: sensitivityMap[element]["sensitive"],
        confidence: twoDecimal(sensitivityMap[element]["confidence"])
      }

      dataToSubmit.push(myData);
    }

    function handleSubmitResponse(response:any) {
      console.log("inside handleSubmitResponse");
      if (response.status === 200) {
        setDoneTen(true);
        console.log("this is set to ten");
      }
    }
    const result = await fetch('http://localhost:8000/submitLabel', {
    method: 'POST',
    mode: 'cors',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(dataToSubmit)
    })
    .then((response) => handleSubmitResponse(response))
    .catch(err => console.log("ERROR:", err));
  }

  return (
    <ThemeProvider theme={sunlifeTheme}>
      <Container maxWidth="xl">
          <div>
          <Button
            icon="arrow-left"
            intent="warning"
            text={"Back to User Info Page"}
            onClick={() => {
              setAlertExitPage(!alertExitPage);
            }}
          />

          <Alert
            className="alert-box"
            isOpen={alertExitPage}
            confirmButtonText="Exit"
            cancelButtonText="Cancel"
            icon="undo"
            intent="danger"
            onCancel={handleExitCancel}
            onConfirm={handleExitConfirm}
          >
            <h2 className="alert-header">Are you sure you want to exit?</h2>
            <p className="alert-sub">Your data will be lost.</p>
          </Alert>

          <Pagination
              count={10}
              page={emailPage}
              siblingCount={9}
              hideNextButton={true}
              hidePrevButton={true}
              size="small"
              color="primary"
              onChange={handleEmailPageChange}
              />

          <pre>
            <div className="email-grid">

              {
                // @ts-ignore
                <Carousel
                  enableSwipe={false}
                  enableMouseSwipe={false}
                >
                  {
                    (emailData.length > 0 && emails.map((email: any, index: number) =>
                    mappingFunc(email, index, sensitivityMap, setSensitivityMap))) || 
                    (emailData.length === 0 && <div></div>)
                  }
                </Carousel>
              }
            </div>
          </pre>

          <form onSubmit={labelSubmitHandler}>
            {/* {markedAll === true && <button className="submit-button" type="submit">SUBMIT</button>} */}
            {markedAll === true && <button className="submit-button" type="submit">SUBMIT</button>}
            {/* {doneTen === true && <h5>do you allow us to use your data?</h5>} */}
          </form>
    
          <Alert
            className="submit-box"
            isOpen={showSubmit}
            icon="clean"
            intent="success"
            confirmButtonText="Submit"
            cancelButtonText="Cancel"
            onConfirm={handleSubmit}
            onCancel={() => {
              setShowSubmit(false);
            }}
          >
            <h2 className="submit-header">Are you sure you want to submit?</h2>
            <p className="submit-sub">You can't undo this submit.</p>
          </Alert>
          </div>
      </Container>
    </ThemeProvider>
  );
}

export default Label;
