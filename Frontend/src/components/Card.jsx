import { Link } from "react-router-dom";

export default function Card({
  image,
  title,
  name,
  author,
  subject,
  slug,
  date,
  amount,
  type, // "book", "live-class", "class", or "community"
  cover_url,
  members,
}) {
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

  const displayTitle = title || name;
  const linkPath =
    type === "book"
      ? `/books/${slug}`
      : type === "live-class"
      ? `/liveclass/${slug}`
      : type === "community"
      ? `/community/${slug}`
      : "#";

  return (
    <Link to={linkPath}>
      <div
        className={`w-40 rounded-xl overflow-hidden shadow bg-white hover:shadow-lg transition relative ${
          type === "class" ? "h-48" : "h-64"
        }`}
      >
        {/* COMMUNITY CARD */}
        {type === "community" ? (
          <>
            <div className="relative w-40 h-64 rounded-xl overflow-hidden shadow bg-white hover:shadow-lg transition group">
              <img
                src={cover_url || "/placeholder-community.png"}
                alt={`${name} cover`}
                className="w-full h-40 object-cover"
              />
              <div className="p-2">
                <h3 className="font-semibold text-sm truncate">{name}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {members ?? 0} members
                </p>
              </div>
            </div>
          </>
        ) : type === "book" ? (
          <>
            <div className="relative w-40 h-64 rounded-xl overflow-hidden shadow bg-white hover:shadow-lg transition group">
              <img
                src={image}
                alt={displayTitle}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none"></div>
              <div className="absolute inset-0 flex flex-col justify-center p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <h3 className="font-semibold text-sm truncate">
                  {displayTitle}
                </h3>
                {author && <p className="text-xs mt-1">by {author}</p>}
                {subject && <p className="text-xs mt-1">#{subject}</p>}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Live class & class */}
            {type !== "class" && (
              <img
                src={image}
                alt={displayTitle}
                className="w-full h-40 object-cover"
              />
            )}
            <div
              className={`p-2 ${
                type === "class" ? "flex flex-col justify-between h-full" : ""
              }`}
            >
              <h3 className="font-semibold text-sm truncate">{displayTitle}</h3>

              {type === "live-class" && formattedDate && (
                <p className="text-xs text-gray-500">{formattedDate}</p>
              )}

              {type === "book" && author && (
                <p className="text-xs text-gray-500">by {author}</p>
              )}

              {type === "class" && amount && (
                <p className="text-sm font-medium text-indigo-600 mt-1">
                  {amount} classes
                </p>
              )}

              {subject && (
                <p className="text-xs text-gray-400 mt-1">
                  {type === "book" ? `#${subject}` : subject}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </Link>
  );
}
