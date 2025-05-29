import { Link } from "react-router-dom";

export default function CommunityCards({ name, people, description, image, slug }) {
  return (
    <Link to={`/community/${slug}`} >
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow hover:shadow-md transition cursor-pointer h-44 flex gap-4">
        <div className="flex items-center gap-4">
          <img src={image} alt={name} className="w-16 h-16 rounded-full object-cover" />
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-sm text-gray-500">{people} members</p>
            <p className="text-sm text-gray-400">{description}</p>
          </div>
        </div>

      </div>
    </Link>
  );
}