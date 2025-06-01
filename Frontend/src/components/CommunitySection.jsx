import Card from "./Card";


export default function LiveclassSection({ title, items }) {
  return (
    <div className="pl-6">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="flex flex-wrap gap-4">

        {items.map((item) => (
         <Card
            type="community"
            name={item.name}
            cover_url={item.cover_url}
            members={item.members}
            slug={item.slug}
            />

        ))}
      </div>
    </div>
  );
}
