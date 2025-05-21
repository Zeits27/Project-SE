import { Link } from "react-router-dom";

export default function LiveClassSectionCard({ image, name, subject, slug ,date }) {
    const formattedDate = new Date(date).toLocaleString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
  
    return (
    <Link to={`/books/${slug}`}>
      <div className="w-40 h-64 rounded-xl overflow-hidden shadow bg-white hover:shadow-lg transition">
        <img src={image} alt={name} className="w-full h-40 object-cover" />
        <div className="p-2">
          <h3 className="font-semibold text-sm truncate">{name}</h3>
          <p className="text-xs text-gray-500"> {formattedDate}</p>
          <p className="text-xs text-gray-400">{subject}</p>
        </div>
      </div>
    </Link>
  );
}
