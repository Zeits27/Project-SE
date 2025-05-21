// src/components/CommunityCard.jsx

export default function CommunityCards({ name, people }) {
    return (
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow ">
        <div className="w-24 h-24 bg-gray-300 rounded"></div>
        <div>
          <h3 className="font-semibold text-xl">{name}</h3>
          <p className="text-sm text-gray-500">{people} people</p>
        </div>
      </div>
    );
  } 
  