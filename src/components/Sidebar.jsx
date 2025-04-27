import {
  Home,
  BarChart,
  Users,
  Briefcase,
  Video,
  Settings,
  Flag,
} from "lucide-react";

const navItems = [
  { label: "Home", icon: Home },
  { label: "Classes", icon: BarChart },
  { label: "Community", icon: Users },
  { label: "The Experts", icon: Briefcase },
  { label: "Live Class", icon: Video },
  { label: "Settings", icon: Settings },
  { label: "Report", icon: Flag },
];

export default function Sidebar() {
  return (
    <div className="bg-white h-full w-64 p-6 shadow-md">
      <nav className="flex flex-col space-y-6">
        {navItems.map(({ label, icon: Icon }) => (
          <a
            key={label}
            href="#"
            className="flex items-center space-x-3 text-blue-600 text-lg font-medium hover:text-blue-800"
          >
            <Icon size={24} />
            <span>{label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
