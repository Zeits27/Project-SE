import { Link } from "react-router-dom";

export default function ClassCard({ name, slug, image }) {
  return (
    <Link to={`/class/${slug}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <img src={image} alt={name} className="w-full h-40 object-cover"
 />
          <div className="p-4">
            <h3 className="font-semibold text-lg">{name}</h3>
          </div>
      </div>
    </Link>
  );
}

