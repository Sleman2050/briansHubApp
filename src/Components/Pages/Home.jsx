import React from "react";
import LeftSide from "../LeftSidebar/LeftSide";
//import CardSection from "../Main/CardSection";
import Navbar from "../Navbar/Navbar";
import RightSide from "../RightSidebar/RightSide";
import Main from "../Main/Main";
import Dashboard from "./Student/Dashboard";

const Home = () => {
  return (
    <div className="w-full bg-gray-100">
      <div className="fixed top-0 z-10 w-full bg-white">
        <Navbar></Navbar>
        <RightSide></RightSide>
      </div>
      <br />
      <div className="w-[100%] mx-auto ">
          
            <Main></Main>
          </div>
      
       
 
    </div>
  );
};

export default Home;



