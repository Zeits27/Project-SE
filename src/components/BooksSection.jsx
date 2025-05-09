// components/BooksSection.jsx
import BooksCard from "./BooksCard.jsx";

export default function BooksSection({ title, items }) {
  return (
    <section className="mb-6">
      <div className="flex justify-between items-center px-4 mb-2">
        <h2 className="text-2xl font-bold">{title}</h2>
        <button className="text-blue-600 text-sm hover:underline">See All</button>
      </div>

      <div className="flex flex-wrap gap-4 px-4 bg-white pt-5 pb-5">
        {items.map((item, index) => (
          <BooksCard
            key={index}
            id={item.id}
            name={item.name}
            people={item.people}
            image={item.image}
          />
        ))}
      </div>
    </section>
  );
}
