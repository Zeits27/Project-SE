export default function SectionList({ title, items }) {
  return (
    <section className="mb-6">
      <div className="flex justify-between items-center px-4 mb-2">
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <div className="flex flex-wrap gap-2 pl-4 ">
        {items.map((item, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg inline-flex flex-col items-start"
          >
            <div className="w-30 h-30 bg-gray-300 rounded mt-2"></div>
            <span className="font-bold text-xl pt-1">{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
