import { Bookmark } from "lucide-react"; // optional icon library

export default function Topbar() {
  return (
    <div className="flex items-center justify-between p-4 bg-transparent">
       {/* search bar */}
      <input
        type="text"
        placeholder="Search..."
        className="w-full max-w-md p-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
      />

      {/* kanan */}
      <div className="flex items-center space-x-4 ml-4">

        <Bookmark className="text-blue-600 w-6 h-6" />

        {/* Profile */}
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  );
}
