import React, { useState, useLayoutEffect, useEffect } from "react";
import {
  Button,
  FormGroup,
  Alert,
  Slider,
  ProgressBar
} from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";
import { Page, Tab, twoDecimal } from "../common";
// import emailData from "../label_page/emailData";
import Carousel from "react-elastic-carousel";
import { pythonBridge } from "python-bridge";
import { json } from "stream/consumers";

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
    
    <div key={index} className="email-element">
      <div className="email-box-header">
        <p className="email-header">{"Email " + (index + 1)}</p>
        <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>

        {/*this part is the more info popover*/}
        {/* <FormGroup
          className="email-box-labels"
          inline={true}
          style={{ position: "relative", top: -10, left: 700 }}
        > */}
          {/* <Popover2
            interactionKind="click"
            isOpen={pop}
            fill={false}
            placement="bottom-end"
            content={
              
              <div className="popover">
                <div className="popover-button">
                  <div>
                    <button
                      className="popover-content-button"
                      onClick={handelSenderInfo}
                    >
                      {" "}
                      Sender Info
                    </button>
                    <hr className="popover-separator" />
                  </div>

                  <div>
                    <button
                      className="popover-content-button"
                      onClick={handelScatterPlot}
                    >
                      {" "}
                      Scatter Plot
                    </button>
                    <hr className="popover-separator" />
                  </div>

                  <div>
                    <button
                      className="popover-content-button"
                      onClick={handelEmailHistory}
                    >
                      {" "}
                      Email History
                    </button>
                  </div>
                </div>
                <div className="popover-content-detail">
                  {popoverContent === Tab.SenderInfo && (
                    <div>
                      <p>
                        Division:{" "}
                        {JSON.stringify(email.division, null, 2).slice(1, -1)}
                      </p>
                      <p>
                        EmailId:{" "}
                        {JSON.stringify(email.mid, null, 2).slice(1, -1)}
                      </p>
                    </div>
                  )}

                  {popoverContent === Tab.ScatterPlot && (
                    <div>
                      <p>Below display {email.sender} scatter plot: </p>
                    </div>
                  )}

                  {popoverContent === Tab.EmailHistory && (
                    <div>
                      <p>Below display {email.sender} email history: </p>
                    </div>
                  )}
                </div>
              </div>
            }
          >
            <button
              className="sender-button"
              id={"sender-button" + (index + 1)}
              onClick={() => {
                console.log("sender" + (index + 1));
                setPop(!pop);
              }}
            >
              More Info regarding Sender {email.sender}
            </button>
          </Popover2> */}
        {/* </FormGroup> */}
      </div>

      {/*this part is the email body display*/ }
      <hr className="separator" />
      <p> </p>
      <div className="email-content">
        <p>
          {" "}
          <b>DateSent:</b> {JSON.stringify(email.year, null, 2).slice(1, -1)}/
          {JSON.stringify(email.month, null, 2).slice(1, -1)}/
          {JSON.stringify(email.day, null, 2).slice(1, -1)}
        </p>
        <p> </p>
        <p>
          {" "}
          {/* showing query-mid just to check if correct emails are displayed, will remove later */}
          <b>Query_mid:</b> {JSON.stringify(email.query_mid, null, 2).slice(1, -1)} 
        </p>
        <p> </p>
        <p>
          {" "}
          <b>Sender:</b> {JSON.stringify(email.sender, null, 2).slice(1, -1)}
        </p>
        <p> </p>
        <p>
          {" "}
          <b>Recipient:</b> {JSON.stringify(email.rcpt, null, 2).slice(1, -1)}
        </p>
        <p> </p>
        <p>
          {" "}
          <b>Job Family:</b>{" "}
          {JSON.stringify(email.job_family, null, 2).slice(1, -1)}
        </p>
        <p> </p>
        <p>
          {" "}
          <b>Employment Type:</b>{" "}
          {JSON.stringify(email.employment_type, null, 2).slice(1, -1)}
        </p>
        <p> </p>
        <p>
          {" "}
          <b>Privileged User:</b>{" "}
          {JSON.stringify(email.privileged_user, null, 2).slice(1, -1)}
        </p>
        <p> </p>
        <p>
          {" "}
          <b>Day of Week:</b>{" "}
          {JSON.stringify(email.day_of_week, null, 2).slice(1, -1)}
        </p>
        <p> </p>
        <p>
          {" "}
          <b>Email Size:</b>{" "}
          {JSON.stringify(email.size, null, 2).slice(1, -1)}
        </p>
        <p> </p>
        <p>
          {" "}
          <b>File Count:</b>{" "}
          {JSON.stringify(email.file_count, null, 2).slice(1, -1)}
        </p>
        <p> </p>
        <p>
          {" "}
          <b>Recipient Count:</b>{" "}
          {JSON.stringify(email.rcpt_count, null, 2).slice(1, -1)}
        </p>
        <p> </p>
        <p>
          {" "}
          <b>Recipient Count Job Max:</b>{" "}
          {JSON.stringify(email.rcpt_count_job_max, null, 2).slice(1, -1)}
        </p>
        <p> </p>
        {/* <p>
          {" "}
          <b>Recipient Count:</b>{" "}
          {JSON.stringify(email.rcpt_count, null, 2).slice(1, -1)}
        </p>
        <p> </p>
        <p>
          {" "}
          <b>Files Sensitive Count:</b>{" "}
          {JSON.stringify(email.files_sensitive_count, null, 2).slice(1,-1)}
        </p> */}

        {/* <div className="email-bar-individual">
          <p> <b>Recipient Count:</b> {JSON.stringify(email.Rcpt_count, null, 2).slice(1, -1)}</p>
          <ProgressBar
            className="email-bar"
            animate={false}
            stripes={false}
            value={email.rcpt_count / visualItemMax.rcpt_count}
            intent={handleBarColor(
              email.rcpt_count / visualItemMax.rcpt_count
            )}
          />
          <p className="max">(max:{visualItemMax.rcpt_count})</p>
  
        </div> */}
        <p> </p>
        {/* <div className="email-bar-individual">
          <p> <b>Files Sensitive Count:</b>{JSON.stringify(email.files_sensitive_count, null, 2).slice(1,-1)}</p>
          <ProgressBar
            className="email-bar"
            animate={false}
            stripes={false}
            value={email.files_sensitive_count / visualItemMax.file_count}
            intent={handleBarColor(
              email.files_sensitive_count / visualItemMax.file_count
            )}
          />
          <p className="max">(max:{visualItemMax.file_count})</p>
        </div> */}
        <p> </p>
        {/* <div className="email-bar-individual">
          <p> <b>Files Size:</b>{JSON.stringify(email.size, null, 2).slice(1, -1)}</p>
          <ProgressBar
            className="email-bar"
            animate={false}
            stripes={false}
            value={email.size / visualItemMax.size}
            intent={handleBarColor(email.size / visualItemMax.size)}
          />
          <p className="max">(max: {visualItemMax.size})</p>
        </div> */}
        <p> </p>
        {/* <div className="email-bar-individual">
          <p> <b>Day since hire:</b>{JSON.stringify(email.day_since_hire, null, 2).slice(1,-1)}</p>
          <ProgressBar
            className="email-bar"
            animate={false}
            stripes={false}
            value={email.day_since_hire / visualItemMax.day_since_hire}
            intent={handleBarColor(
              email.day_since_hire / visualItemMax.day_since_hire
            )}
          />
          <p className="max">(max:{visualItemMax.day_since_hire})</p>
        </div> */}
      </div>
      <FormGroup
        className="email-box-labels"
        inline={true}
        style={{ position: "relative", top: -0.5 }}
      >
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
              "label-button-non-" + (index + 1)
            )!.style.backgroundColor = "rgb(255, 255, 255)";
            document.getElementById(
              "label-button-non-" + (index + 1)
            )!.style.color = "rgb(0, 0, 0)";
          }}
        >
          Sensitive
        </button> 

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
              "label-button-" + (index + 1)
            )!.style.backgroundColor = "rgb(255, 255, 255)";
            document.getElementById(
              "label-button-" + (index + 1)
            )!.style.color = "rgb(0, 0, 0)";
          }}
        >
          Non-Sensitive
        </button> 

        <h1 className="slider-notes">
          Confidence Slider: 1 being extremely inconfident, 10 being extremely
          confident
        </h1>
        <Slider
          className="confidence-slider"
          min={1}
          max={10}
          stepSize={0.1}
          labelPrecision={0.1}
          value={confidence}
          onChange={(val) => {
            setConfidence(val);
            const newMap = { ...sensitivityMap };
            newMap[index + 1]["confidence"] = val;
            setSensitivityMap(newMap);
          }}
          intent="none"
        />
        
      </FormGroup>
    </div>
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
  var info = {
    currentUser: currentUser
  }
  const [emailData, setEmailData] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);

  async function handleResponse(response:any) {
    const resData = await response.json();
    const emails = [];
    for (let i = 0; i < 10; i++) {
      emails.push(resData[i]);
    }

    setEmailData(resData);
    setEmails(emails);
    console.log("this is response body", resData);
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
  
  function handleSubmit() {
    setSubmit(true);
    setMarkedAll(false);
    setSensitivityMap(initialMap);
    setPage(Page.Submitted);
  }

  // var numEmails = 10;

  // useEffect(() => {
  //   const emailsToShow = [];
  //   for (let i = 0; i < numEmails; i++) {
  //     emailsToShow.push(emailData[i]);
  //   }
  //   setEmails(emailsToShow);
  // }, [numEmails]);
  
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

  console.log(
    emails.map((email: any, index: number) =>
      mappingFunc(email, index, sensitivityMap, setSensitivityMap)
    )
  );

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

    const result = await fetch('http://localhost:8000/submitLabel', {
    method: 'POST',
    mode: 'cors',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(dataToSubmit)
    })
    .then((response) => console.log(response))
    .catch(err => console.log("ERROR:", err));
  }

  return ( 
    <div className="email-grid-big-block">
      
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

      <pre>
        <div className="email-grid">
          {
            // @ts-ignore
            <Carousel>
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
        {markedAll === true && <button className="submit-button" type="submit">SUBMIT</button>}
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
  );
}

export default Label;
