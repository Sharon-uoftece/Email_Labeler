import React, {useState } from "react";
import Welcome from "./welcome_page/Welcome";
import Label from "./label_page/Label";
import StartSurvey from "./selection_page/StartSurvey";
import { Page } from "./common"
import {Header} from "./common"
import Navbar from "./welcome_page/Navbar"
import VideoStep from "./welcome_page/VideoStep"
import ModelIllustrate from "./welcome_page/ModelIllustrate";
import PreviousLabels from "./welcome_page/PreviousLabels";
import Submission from "./Submission";

function MainFlow() {
  const [page, setPage] = useState(Page.Welcome);
  const [numEmails, setNumEmails] = useState(10);
  const [submit, setSubmit] = useState(false);

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

  function handleSubmit() {
    setSubmit(!submit);
  }

  function handlePage2() {
    setPage(Page.Survey);
  }

  if (page === Page.Welcome) {
    return (
      <div>
        <Header />
        <Navbar />
        <Welcome page={page} setPage={setPage}/>
        <button className="sunlife-header-quick-start">
          Get to know more about our project --&gt;
        </button>
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
        <Label 
          numEmails={numEmails} 
          page={page} 
          setPage={setPage} 
          sensitivityMap={sensitivityMap}
          setSensitivityMap={setSensitivityMap}
        />
      </div>
    )
  } else {
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
