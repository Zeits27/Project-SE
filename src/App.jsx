
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./page/Login";
import Register from "./page/Register";
import SetProfile from "./page/SetProfile";
import Home from "./page/Home";
import Community from "./page/Community";
import LiveClasses from "./page/LiveClasses";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} />         
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/set-profile" element={<SetProfile />} />
        <Route path="/community" element={<Community />} />
        <Route path="/liveclasses" element={<LiveClasses />} />
      </Routes>
    </Router>
  );
}