import React, {useState} from "react";
import sunlifeLogo from "./assets/sunlife3.jpg";

export enum Page {
  Welcome,
  Login,
  Survey,
  LabelGeneral,
  CommentGeneral,
  Submitted
}

export enum Interest {
  Nonset,
  Label,
  Comment
}

export enum Tab {
  SenderInfo,
  ScatterPlot,
  EmailHistory,
}

export function StickyHeader() {
  const [fixed, setFixed] = useState(false);

  function handleHeaderChange() {
      if (window.scrollY >= 625) {
          setFixed(true)
      } else {
          setFixed(false)
      }
  }
  
  window.addEventListener("scroll", handleHeaderChange)

  return(
      <div className={fixed ? "sticky-header" : "sticky-header-two"}>
        <p className="sticky-name">MailLabeler</p>
      </div>
  )
}

export function Header() {

  return (
    <div>
      <div className="sunlife-header">
          <img src={sunlifeLogo} className="sunlife-logo" alt="Sunlife Logo" />
      </div>
    </div>
  );
}


