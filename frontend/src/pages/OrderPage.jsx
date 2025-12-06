import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CustomerNavbar from "../components/CustomerNavbar";

// Floating Cart Icon/Summary Component
const CartSummary = ({ cart, totalPrice }) => {
  const totalItems = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);

  // Simple, prominent display for total items and price
  return (
    <div className="flex items-center space-x-2 bg-yellow-500 text-white font-bold p-2 rounded-full shadow-lg cursor-pointer hover:bg-yellow-600 transition duration-300">
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        ></path>
      </svg>
      {totalItems > 0 && (
        <span className="text-sm">
          {totalItems} items | ₹{totalPrice.toFixed(2)}
        </span>
      )}
    </div>
  );
};


const OrderPage = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [isCartVisible, setIsCartVisible] = useState(false); // State for mobile cart view

  // Filters
  const [category, setCategory] = useState("All");

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get(
          // Assuming branchId is part of the URL path
          `http://localhost:5001/api/menu/branch/${branchId}` 
        );
        setMenuItems(res.data);
      } catch (err) {
        console.error("Error fetching menu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [branchId]);

  // Derive unique categories for the dropdown menu
  const uniqueCategories = useMemo(() => {
    return ["All", ...new Set(menuItems.map((m) => m.menuItemId.category))];
  }, [menuItems]);

  // ⭐ FILTER LOGIC (Search removed)
  const filteredMenu = menuItems.filter((item) => {
    // Search is removed, only filter by category
    const matchesCategory =
      category === "All" || item.menuItemId.category === category;

    return matchesCategory;
  });

  const handleAddToCart = (item) => {
    setCart((prev) => {
      const newQuantity = (prev[item.menuItemId._id] || 0) + 1;
      return { ...prev, [item.menuItemId._id]: newQuantity };
    });
    setTotalPrice((prev) => prev + item.price);
  };

  const handleRemoveFromCart = (item) => {
    setCart((prev) => {
      const currentQuantity = prev[item.menuItemId._id] || 0;
      if (currentQuantity === 0) return prev;

      const newQuantity = currentQuantity - 1;
      const newCart = { ...prev, [item.menuItemId._id]: newQuantity };

      if (newQuantity === 0) delete newCart[item.menuItemId._id];

      return newCart;
    });

    setTotalPrice((prev) => Math.max(0, prev - item.price));
  };

  const handlePlaceOrder = async () => {
    const items = Object.entries(cart).map(([itemId, quantity]) => {
      const menuItem = menuItems.find((m) => m.menuItemId._id === itemId);

      return {
        itemId,
        name: menuItem.menuItemId.name,
        price: menuItem.price,
        quantity,
      };
    });

    if (items.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    try {
      let userId;
      try {
        const userRes = await axios.get(
          "http://localhost:5001/api/auth/profile",
          { withCredentials: true }
        );
        console.log(userRes.data)
        userId = userRes.data.data._id;
        console.log("User ID:", userId);
      } catch (e) {
        console.log(e);
        alert("Please login to place an order.");
        navigate("/login");
        return;
      }
      
      // Safety check for menuItems[0]
      const cateringId = menuItems.length > 0 ? menuItems[0].menuItemId.cateringId : null;

      const orderData = {
        userId,
        cateringId,
        branchId,
        items,
        total: totalPrice,
        payment: {
          method: "Online",
          paid: true,
        },
      };
     console.log("Sending order data:", orderData);

      await axios.post("http://localhost:5001/api/order/", orderData);
      alert("Order placed successfully!");
      setCart({});
      setTotalPrice(0);
      setIsCartVisible(false); // Close cart after placing order

    } catch (err) {
      console.error("Error placing order:", err);
      alert("Failed to place order. Please try again.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading menu...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white">
      {/* Navbar - Fixed top, higher z-index */}
      <div className="fixed top-0 left-0 w-full z-50 shadow-lg">
        <CustomerNavbar />
      </div>

      <div className="pt-24 px-6 container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Menu</h1>

        {/* 🌟 NEW HEADER WITH FILTER AND CART BUTTON */}
        <div className="flex justify-between items-center mb-8">
            {/* ⬅️ CATEGORY FILTER DROPDOWN */}
            <div className="flex items-center space-x-4">
                <label htmlFor="category-select" className="font-semibold text-gray-700">Filter:</label>
                <select
                    id="category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-4 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-yellow-400"
                >
                    {uniqueCategories.map((c) => (
                        <option key={c}>{c}</option>
                    ))}
                </select>
            </div>

            {/* ➡️ CART BUTTON (Visible on small screens) */}
            <div className="md:hidden" onClick={() => setIsCartVisible(true)}>
                <CartSummary cart={cart} totalPrice={totalPrice} />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 🍽 MENU GRID */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredMenu.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 transition hover:shadow-2xl"
              >
                <img
                  src={
                    item.menuItemId.imageUrl ||
                    "https://via.placeholder.com/150"
                  }
                  alt={item.menuItemId.name}
                  className="w-full h-40 object-cover rounded-lg"
                />

                <h3 className="text-xl font-semibold mt-3">
                  {item.menuItemId.name}
                </h3>

                <p className="text-gray-500 text-sm h-10 overflow-hidden">
                  {item.menuItemId.description}
                </p>

                <p className="text-green-600 font-bold text-lg mt-2">
                  ₹{item.price}
                </p>

                {cart[item.menuItemId._id] ? (
                  <div className="flex items-center mt-4 bg-green-100 rounded-lg justify-between p-1">
                    <button
                      onClick={() => handleRemoveFromCart(item)}
                      className="px-3 text-lg font-bold text-red-500 hover:bg-green-200 rounded-lg"
                    >
                      -
                    </button>
                    <span className="mx-2 font-bold text-green-700">
                      {cart[item.menuItemId._id]}
                    </span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="px-3 text-lg font-bold text-green-700 hover:bg-green-200 rounded-lg"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full mt-4 bg-yellow-500 text-white font-bold py-2 rounded-lg hover:bg-yellow-600 transition"
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* 🛒 FIXED CART (Desktop only) */}
          <div className="hidden md:block">
            <div className="sticky top-28 w-full z-30"> {/* Changed 'fixed' to 'sticky' for better scroll behavior */}
              <div className="bg-white rounded-xl shadow-xl p-6 border border-yellow-300">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Your Cart
                </h2>
                <CartContent 
                    cart={cart} 
                    menuItems={menuItems} 
                    totalPrice={totalPrice} 
                    handlePlaceOrder={handlePlaceOrder} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 📱 MOBILE CART MODAL */}
      <MobileCartModal 
          isVisible={isCartVisible}
          onClose={() => setIsCartVisible(false)}
          cart={cart}
          menuItems={menuItems}
          totalPrice={totalPrice}
          handlePlaceOrder={handlePlaceOrder}
      />
    </div>
  );
};


// Helper component for Cart content (reused for desktop and mobile)
const CartContent = ({ cart, menuItems, totalPrice, handlePlaceOrder }) => (
    <>
      {Object.keys(cart).length === 0 ? (
        <p className="text-gray-500">Your cart is empty. Add some delicious food!</p>
      ) : (
        <>
          <div className="max-h-60 overflow-y-auto mb-4">
            {Object.entries(cart).map(([itemId, quantity]) => {
              const item = menuItems.find(
                (m) => m.menuItemId._id === itemId
              );
              // Safety check: ensure item is found
              if (!item) return null; 

              return (
                <div
                  key={itemId}
                  className="flex justify-between items-center py-2 border-b last:border-b-0"
                >
                  <span className="text-sm truncate mr-2">{item.menuItemId.name} × {quantity}</span>
                  <span className="font-semibold text-sm">
                    ₹{(item.price * quantity).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-xl font-bold mt-4 pt-2 border-t border-dashed">
            <span>Total</span>
            <span className="text-green-700">₹{totalPrice.toFixed(2)}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="w-full mt-6 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition"
          >
            Place Order
          </button>
        </>
      )}
    </>
);

// Helper component for Mobile Cart Modal
const MobileCartModal = ({ isVisible, onClose, ...props }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-[60] flex items-end md:hidden">
            <div className="bg-white w-full p-6 rounded-t-xl shadow-2xl transform transition-all duration-300 ease-out">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Your Cart</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <CartContent {...props} />
            </div>
        </div>
    );
};


export default OrderPage;