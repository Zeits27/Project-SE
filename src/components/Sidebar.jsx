import {
  Home,
  BarChart,
  Users,
  Briefcase,
  Video,
  Settings,
  Flag,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Home", icon: Home, to: "/home" },
  { label: "Classes", icon: BarChart },
  { label: "Community", icon: Users, to: "/community" },
  { label: "The Experts", icon: Briefcase },
  { label: "Live Class", icon: Video },
  { label: "Settings", icon: Settings },
  { label: "Report", icon: Flag },
];

export default function Sidebar() {
  return (
    <div className="bg-white h-full w-64 p-6 shadow-md">
      <nav className="flex flex-col space-y-6">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `flex items-center space-x-3 text-lg font-medium ${
                isActive ? "text-blue-800" : "text-blue-600"
              } hover:text-blue-800`
            }
          >
            <Icon size={24} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}