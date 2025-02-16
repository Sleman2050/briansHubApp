import "./App.css";
import Pages from "./Components/Pages/Pages";
import { BrowserRouter } from "react-router-dom";
import AppContext from "./Components/AppContext/AppContext";
import ReactDOM from 'react-dom/client';
import React from 'react';

function App() {
  return (
    <div className="App">
      <React.StrictMode>
    <BrowserRouter>
      <AppContext>
        <Pages />
      </AppContext>
    </BrowserRouter>
  </React.StrictMode>



    </div>
  );
  
}

export default App;
