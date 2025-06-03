import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Rightbar({ title, type }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        let endpoint = "";
        if (type === "community") endpoint = "/api/community";
        else if (type === "liveclass") endpoint = "/api/live-class";
        else return;

        const res = await axios.get(`http://localhost:8080${endpoint}`);
        const data = res.data.slice(0, 5); // Ambil 5 teratas saja
        setItems(data);
      } catch (err) {
        console.error("Failed to fetch rightbar items:", err);
      }
    };

    fetchItems();
  }, [type]);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h1 className="text-xl font-bold mb-4">{title}</h1>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <Link to={`/${type}/${item.slug}`} className="no-underline" key={index}>
          <li key={index} className="flex items-center space-x-3 p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <img
              src={item.cover_url || item.image}
              alt={item.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <span className="text-gray-800 hover:underline cursor-pointer text-xl font-bold">
              {item.name}
            </span>
          </li>
          </Link>
        ))}
      </ul>
    </div>
  );
}
