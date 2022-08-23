import React, { useState, useLayoutEffect } from "react";
import { Header } from "../common";
import Navbar from "./Navbar"
import { Page } from "../common";

function Welcome({ page, setPage }:
  {
      page: number,
      setPage: (page: number) => void,
  }) {

  function handlePage2() {
     setPage(Page.Survey);
  }
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="welcome" id='welcome'>
      <p className="welcome-text">WELCOME!</p>
      <p className="welcome-sub-block"> <mark className="mark">
        &nbsp;This is the space where you could help &nbsp; &nbsp;improve accuracy
        of our Machine&nbsp; &nbsp;Learning Model to identify Data Breach.&nbsp; </mark>
      </p>
      <button className="welcome-button" onClick={handlePage2}>GET STARTED</button>
    </div>
  );
}

export default Welcome;
