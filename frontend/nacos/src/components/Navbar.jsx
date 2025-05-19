import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between items-center">
      <h1 className="text-xl font-bold">NACOS Portal</h1>
      <div className="space-x-4">
        <Link to="/" className="hover:underline">Home</Link>
        <Link to="/pay" className="hover:underline">Pay</Link>
        <Link to="/status" className="hover:underline">Check Status</Link>
        <Link to="/admin" className="hover:underline">Admin</Link>
      </div>
    </nav>
  );
};

export default Navbar;
