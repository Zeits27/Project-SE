import CommunityForm from "./CommunityForm"; 


export default function ClassesForm({ name, setName, description, setDescription, subject, setSubject }) {
    return (
      <>
        <div>
          <label className="block text-sm font-medium mb-1">Class Name</label>
          <input
            type="text"
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
  
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <input
            type="text"
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
      </>
    );
  }
  