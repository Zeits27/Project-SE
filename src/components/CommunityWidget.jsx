export default function CommunityWidget({ title, items }) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        <ul className="space-y-2">
          {items.map(item => (
            <li key={item} className="text-blue-600 hover:underline">{item}</li>
          ))}
        </ul>
      </div>
    );
  }

  