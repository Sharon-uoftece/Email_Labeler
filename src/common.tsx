import React, { useState, useEffect } from "react";
import sunlifeLogo from "./assets/sunlife3.jpg";
import Navbar from "./welcome_page/Navbar"

export enum Page {
  Welcome,
  Survey,
  LabelGeneral,
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


