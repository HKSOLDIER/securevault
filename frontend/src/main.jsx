// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App.jsx';


// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode 
//     future={{
//     v7_startTransition: true,
//     v7_relativeSplatPath: true,
//   }}>
//     <App />
//   </React.StrictMode>
// );
// ReactDOM.createRoot(document.getElementById('root')).render(
//     <App />
// );
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);