import { RotateLoader } from "react-spinners";

export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <RotateLoader color="#3B82F6" size={20} />
    </div>
  );
}