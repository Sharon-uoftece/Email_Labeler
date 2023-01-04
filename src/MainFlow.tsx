import React, {useState } from "react";
import Welcome from "./welcome_page/Welcome";
import Label from "./label_page/Label";
import Comment from "./label_page/Comment";
import StartSurvey from "./selection_page/StartSurvey";
import { Page, Interest } from "./common"
import { Header } from "./common"
import Navbar from "./welcome_page/Navbar"
import VideoStep from "./welcome_page/VideoStep"
import ModelIllustrate from "./welcome_page/ModelIllustrate";
import PreviousLabels from "./welcome_page/PreviousLabels";
import Submission from "./Submission";
import Login from "./welcome_page/LogIn";
import { json } from "stream/consumers";



function MainFlow() {
  const [page, setPage] = useState(Page.Welcome);
  const [numEmails, setNumEmails] = useState(10);

  //initialize an empty initialMap
  const initialMap: Record<string, Record<string, any>> = {};
  for (let i = 0; i < numEmails; i++) {
    initialMap[i + 1] = {
      sensitive: false, 
      confidence: 0,
      marked: false
    };
  }

  const [sensitivityMap, setSensitivityMap] = useState(initialMap);

  // if (page === Page.Welcome) {
  if (page === Page.Welcome) {
    return (
      <div>
        <Header />
        <Navbar page={page} setPage={setPage}/>
        <Welcome page={page} setPage={setPage}/>
        <Login page={page} setPage={setPage} />
        <VideoStep />
        <ModelIllustrate />
        <PreviousLabels />
      </div>
    );
  } else if (page === Page.Survey) {
    return (
      <StartSurvey
        numEmails={numEmails}
        setNumEmails={setNumEmails}
        page={page}
        setPage={setPage}
      />
    );
  } else if (page === Page.LabelGeneral) {
    return (
      <div className="label">
        <Comment 
          numEmails={numEmails} 
          page={page} 
          setPage={setPage} 
          sensitivityMap={sensitivityMap}
          setSensitivityMap={setSensitivityMap}
        />
      </div>
    )
  } else if (page === Page.CommentGeneral) {
    return (
      <div className="label">
        <Comment 
          numEmails={numEmails} 
          page={page} 
          setPage={setPage} 
          sensitivityMap={sensitivityMap}
          setSensitivityMap={setSensitivityMap}
        />
      </div>
    )
  } else{
    //page === Page.submitted
    return (
      <div>
        <Submission
          page={page} 
          setPage={setPage}
          sensitivityMap={sensitivityMap}
          numEmails={numEmails}
        />
      </div>
    )
  } 
}

export default MainFlow;
