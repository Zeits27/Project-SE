    import { Link } from "react-router-dom";

    export default function BooksCard({ name, people, image, id }) {
    return (
        <Link to={`/books/${id}`}>
        <div className="relative group w-40 h-64 rounded-xl overflow-hidden shadow bg-white cursor-pointer">
            <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
            <h3 className="font-semibold text-base text-gray-800">{name}</h3>
            <p className="text-sm text-gray-600">{people} people</p>
            </div>
        </div>
        </Link>
    );
    }

    