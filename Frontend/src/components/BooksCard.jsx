// components/BooksCard.jsx
import { Link } from "react-router-dom";

export default function BooksCard({ id, title, author, subject, image }) {
  return (
    <Link to={`/books/${id}`}>
      <div className="w-40 h-64 rounded-xl overflow-hidden shadow bg-white hover:shadow-lg transition">
        <img src={image} alt={title} className="w-full h-40 object-cover" />
        <div className="p-2">
          <h3 className="font-semibold text-sm truncate">{title}</h3>
          <p className="text-xs text-gray-500">by {author}</p>
          <p className="text-xs text-gray-400">#{subject}</p>
        </div>
      </div>
    </Link>
  );
}
