import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import './App.scss';
import MainFlow from './MainFlow';


function App() {
  return (
    
    <BrowserRouter>
      {/* <a href="/"> <Logo /></a> */}
      <div>
          <Routes> 
            <Route path="/" element={<MainFlow />}/>
          </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
