


import {
  Home,
  BarChart,
  Users,
  Video,
  Book,
} from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import Create from "../components/Create"; 
const navItems = [
  { label: "Home", icon: Home, to: "/home" },
  { label: "Classes", icon: BarChart, to: "/classes" },
  { label: "Libraries", icon: Book, to: "/libraries" },
  { label: "Community", icon: Users, to: "/community" },
  { label: "Live Class", icon: Video, to: "/liveclasses" }
];

export default function Sidebar() {
  return (
    <div className="bg-white h-full w-64 p-6 shadow-md flex flex-col font-mono">
      {/* Logo */}
      <div className="mb-10 flex ">
        <Link to="/home">
          <img src={logo} alt="EduVerse Logo" className="h-18 w-auto cursor-pointer object-left" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col space-y-6">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to || "#"}
            className={({ isActive }) =>
              `flex items-center space-x-3 text-lg px-4 py-2 rounded-md transition-colors ${
                isActive ? "bg-blue-100 text-blue-800 font-bold" : "text-blue-600 hover:bg-blue-50"
              }`
            }
          >
            <Icon size={24} />
            <span>{label}</span>
          </NavLink>
        ))}
      {/* <div className="flex items-center space-x-3 text-lg px-4 py-2 rounded-md transition-colors text-blue-600 hover:bg-blue-50">
        <Plus className="w-5 h-5" />
        <span>Create</span>
      </div> */}
        <Create />
        </nav>

   
      


     
    </div>
  );
}
