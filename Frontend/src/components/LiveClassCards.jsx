import { Link } from "react-router-dom";

export default function LiveClassCards({ name, date, description, image, subject, slug }) {
  const formattedDate = date
    ? new Date(date).toLocaleString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <Link
      to={`/liveclass/${slug}`}
      className="flex items-center gap-6 bg-white p-4 rounded-xl shadow hover:shadow-md transition"
    >
      <img
        src={image}
        alt={name}
        className="w-32 h-32 rounded-lg object-cover flex-shrink-0"
      />

      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
        <p className="text-gray-600 text-sm line-clamp-2">{description}</p>
        <p className="text-sm text-gray-500 italic">Subject: {subject}</p>
        {formattedDate && (
          <p className="text-sm text-indigo-600 font-medium">Live at {formattedDate}</p>
        )}
      </div>
    </Link>
  );
}
