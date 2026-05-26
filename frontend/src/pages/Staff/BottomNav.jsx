import { NavLink, Link } from "react-router-dom";
import { FaHome, FaConciergeBell } from "react-icons/fa";
import { MdOutlineReorder, MdOutlineRestaurantMenu } from "react-icons/md";
import { CiCircleMore } from "react-icons/ci";

const BottomNav = () => {
  const linkClasses = `
    flex flex-col items-center justify-center gap-1 w-16
    text-gray-500 rounded-lg transition-all duration-300 ease-in-out
    transform hover:text-green-600 hover:scale-110
  `;

  const activeLinkClasses = "text-green-600 bg-green-50 scale-110 font-semibold";

  return (
    <nav className="
        fixed bottom-4 left-1/2 -translate-x-1/2
        w-[calc(100%-2rem)] max-w-md h-16
        bg-white shadow-xl rounded-2xl
        flex justify-evenly items-center" >
      <NavLink
        to="/staff/dashboard"
        className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ""}`}
      >
        <FaHome size={22} />
        <span className="text-xs">Home</span>
      </NavLink>
      <NavLink
        to="/staff/order"
        className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ""}`}
      >
        <MdOutlineReorder size={22} />
        <span className="text-xs">Orders</span>
      </NavLink>

      {/* --- Floating Action Button (No changes here) --- */}
      <div className="relative w-16 h-16">
        <Link
          to="/staff/service"
          className="
            absolute -top-7 left-1/2 -translate-x-1/2
            w-16 h-16 bg-yellow-500 rounded-full
            flex items-center justify-center
            text-white shadow-lg border-4 border-white
            transition-transform duration-300 ease-in-out transform hover:scale-110
          "
        >
          <FaConciergeBell size={28} />
        </Link>
      </div>

      <NavLink
        to="/staff/menu"
        className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ""}`}
      >
        <MdOutlineRestaurantMenu size={22} />
        <span className="text-xs">Menu</span>
      </NavLink>
      <NavLink
        to="/staff/more"
        className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ""}`}
      >
        <CiCircleMore size={24} />
        <span className="text-xs">More</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;