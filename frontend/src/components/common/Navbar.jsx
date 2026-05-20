import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiLogOut } from "react-icons/fi";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-dark-800 border-b border-dark-600 px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="text-lg sm:text-xl font-bold text-white">TaskFlow</span>
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 bg-dark-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-dark-500">
            <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-medium text-gray-200 truncate max-w-[100px] sm:max-w-none">
                {user?.name}
              </span>
              <span className={`text-xs font-semibold ${
                user?.role === 'admin' ? 'text-primary-400' : 'text-gray-500'
              }`}>
                {user?.role === 'admin' ? '⚡ Admin' : 'Member'}
              </span>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center gap-1 sm:gap-2 text-gray-400 hover:text-red-400 transition-colors px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-dark-700"
            aria-label="Logout"
          >
            <FiLogOut size={18} />
            <span className="text-xs sm:text-sm hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
