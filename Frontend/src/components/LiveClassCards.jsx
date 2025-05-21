import { Link } from "react-router-dom";


export default function LiveClassCards({ name, date, description, image,subject,slug }) {
    return (
      <Link to={`/liveclass/${slug}`}className="flex items-center gap-4 bg-white p-4  rounded-xl shadow">

        <img src={image} alt={name} className="w-30 h-30 object-cover" />
          <div>
            <h3 className="font-semibold text-3xl">{name}</h3>
            <h2 className="text-2xl text-gray-500">{description}</h2>
            <p className="text-sm text-gray-500">{subject}</p>
            <p className="text-sm text-gray-500">
              {new Date(date).toLocaleDateString()}
            </p>
          </div>

      </Link>
    );
  }