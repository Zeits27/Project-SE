
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./page/Login";
import Register from "./page/Register";
import SetProfile from "./page/SetProfile";
import Home from "./page/Home";
import Community from "./page/Community";
import LiveClasses from "./page/LiveClasses";
import Libraries from "./page/Libraries";
import Classes from "./page/Classes";
import BookDetail from "./page/BookDetail";
import axios from "axios";
// import { useState, useEffect } from "react";


export default function App() {

    // const fetchAPI = async () => {
    //   const response = await axios.get("http://localhost:8080/api/users");
    //   console.log(response.data.users);
    // };
  
    // useEffect(() => {
    //   fetchAPI();
    // }
    // , []);

  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} />         
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/set-profile" element={<SetProfile />} />
        <Route path="/community" element={<Community />} />
        <Route path="/liveclasses" element={<LiveClasses />} />
        <Route path="/libraries" element={<Libraries />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/books/:bookId" element={<BookDetail />} />

      </Routes>
    </Router>
  );
}