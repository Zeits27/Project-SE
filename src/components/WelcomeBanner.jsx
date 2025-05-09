export default function WelcomeBanner({ name, Description }) {
    return (
      <div className="bg-gradient-to-r from-blue-400 to-purple-500 text-white p-6  rounded-xl mb-6">
        <h1 className="text-xl font-bold">{name}</h1>
        <p>{Description}</p>
        {/* <button className="mt-2 px-4 py-1 bg-white text-blue-600 rounded">Learn More</button> */}
      </div>
    );
  }

  