import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiHome, FiFolder, FiCheckSquare, FiMenu, FiX } from "react-icons/fi";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { path: "/dashboard", icon: FiHome, label: "Dashboard" },
    { path: "/projects", icon: FiFolder, label: "Projects" },
    { path: "/tasks", icon: FiCheckSquare, label: "Tasks" },
  ];

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-dark-700 rounded-lg border border-dark-500"
        aria-label="Toggle menu"
      >
        {isOpen ? <FiX size={24} className="text-gray-300" /> : <FiMenu size={24} className="text-gray-300" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="lg:hidden fixed inset-0 bg-black bg-opacity-70 z-40"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          w-64 bg-dark-800 border-r border-dark-600 min-h-screen p-4
          fixed lg:static inset-y-0 left-0 z-40
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <nav className="space-y-1 mt-16 lg:mt-0">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-primary-600 text-white font-medium shadow-lg shadow-primary-900/40"
                    : "text-gray-400 hover:bg-dark-700 hover:text-gray-200"
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
