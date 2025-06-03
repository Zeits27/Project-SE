import Card from "./Card";


export default function LiveclassSection({ title, items }) {
  return (
    <div className="pl-6">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="flex flex-wrap gap-4">

        {items.map((item) => (
         <Card
            key={item._id}
            image={item.image}
            name={item.name}
            date={item.date_time}
            slug={item.slug}
            subject={item.subject}
            type = "live-class"
          />
        ))}
      </div>
    </div>
  );
}
