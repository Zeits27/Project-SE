// components/BooksSection.jsx
import Card from "./Card";

export default function BooksSection({ title, items }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="flex flex-wrap gap-4">

        {items.map((book) => (
          <Card
            key={book.id}
            id={book.id}
            title={book.title}
            author={book.author}
            subject={book.subject}
            image={book.image}
            slug={book.slug}
            type="book"
          />
        ))}
      </div>
    </div>
  );
}
