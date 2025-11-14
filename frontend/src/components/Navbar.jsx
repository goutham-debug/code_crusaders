import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center rounded-xl mb-6">
      <div className="text-2xl font-bold text-orange-500">CredenX</div>
      <div className="space-x-6">
        <Link className="hover:text-orange-400 transition" to="/">DID Creation</Link>
        <Link className="hover:text-orange-400 transition" to="/verification">Verification</Link>
      </div>
    </nav>
  );
}