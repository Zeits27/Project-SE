import { Link } from "react-router-dom";

export default function CommunityCards({ name, people, description, image, slug }) {
  return (
    <Link to={`/community/${slug}`} className="block">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow hover:shadow-md transition cursor-pointer w-150 h-28">
        <div className="flex items-center gap-4">
          <img src={image} alt={name} className="w-16 h-16 rounded-full object-cover" />
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-sm text-gray-500">{people} members</p>
            <p className="text-sm text-gray-400">{description}</p>
          </div>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold hover:bg-blue-700 transition cursor-pointer"
          onClick={(e) => e.preventDefault()}
        >
          Join
        </button>
      </div>
    </Link>
  );
}