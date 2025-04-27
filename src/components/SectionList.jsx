export default function SectionList({ title, subtitle }) {
    return (
      <section>
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        {subtitle && <p className="text-gray-500 mb-4">{subtitle}</p>}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">Item 1</div>
          <div className="bg-white p-4 rounded-lg shadow">Item 2</div>
        </div>
      </section>
    );
  }

  