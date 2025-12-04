import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomerNavbar from '../components/CustomerNavbar';

const OrderPage = () => {
    const { branchId } = useParams();
    const navigate = useNavigate();
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState({}); // { menuItemId: quantity }
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/menu/public/branch/${branchId}`);
                setMenuItems(res.data);
            } catch (err) {
                console.error("Error fetching menu:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, [branchId]);

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
            const menuItem = menuItems.find(m => m.menuItemId._id === itemId);
            return {
                itemId: itemId,
                name: menuItem.menuItemId.name,
                price: menuItem.price,
                quantity: quantity
            };
        });

        if (items.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        // Assuming user is logged in and we can get userId from somewhere (e.g., context or local storage)
        // For now, let's prompt for login if not logged in, or handle it gracefully.
        // Since this is a public page, we might need to check auth status before placing order.

        // For this implementation, I'll assume we need to be logged in to place an order.
        // We can check for a token or user info in local storage/cookies.

        try {
            // Retrieve user info from local storage or context if available
            // This part depends on how auth is handled in the app. 
            // Based on CustomerDashboard, it seems we use cookies.

            // We need the cateringId. We can get it from the first menu item.
            const cateringId = menuItems[0]?.menuItemId.cateringId;

            // We need userId. If not available, redirect to login.
            // For now, let's try to place the order and see if backend rejects it (it requires userId).
            // Actually, the backend requires userId in the body.

            // Let's assume we have a way to get the current user. 
            // If not, we should redirect to login.
            // For this task, I'll add a check.

            // NOTE: In a real app, we'd use a context for auth.
            // I'll try to fetch the current user profile first to get the ID.

            let userId;
            try {
                const userRes = await axios.get("http://localhost:5001/api/users/profile", { withCredentials: true });
                userId = userRes.data._id;
            } catch (e) {
                alert("Please login to place an order.");
                navigate("/login");
                console.log(e);
                return;
            }

            const orderData = {
                userId,
                cateringId,
                branchId,
                items,
                total: totalPrice,
                payment: {
                    method: "Online",
                    paid: true // Simulating successful payment for now
                }
            };

            await axios.post("http://localhost:5001/api/orders", orderData, { withCredentials: true });
            alert("Order placed successfully!");
            setCart({});
            setTotalPrice(0);
            navigate("/customer/dashboard"); // Redirect to dashboard

        } catch (err) {
            console.error("Error placing order:", err);
            alert("Failed to place order. Please try again.");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading menu...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="fixed top-0 left-0 w-full z-50 shadow-lg">
                <CustomerNavbar />
            </div>
            <div className="pt-24 px-6 container mx-auto max-w-6xl">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Menu</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Menu Items */}
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {menuItems.map((item) => (
                            <div key={item._id} className="bg-white rounded-xl shadow-md p-4 flex flex-col justify-between border border-gray-100">
                                <div>
                                    <img
                                        src={item.menuItemId.imageUrl || "https://via.placeholder.com/150"}
                                        alt={item.menuItemId.name}
                                        className="w-full h-40 object-cover rounded-lg mb-4"
                                    />
                                    <h3 className="text-xl font-semibold text-gray-800">{item.menuItemId.name}</h3>
                                    <p className="text-gray-500 text-sm mt-1">{item.menuItemId.description}</p>
                                    <p className="text-lg font-bold text-green-600 mt-2">₹{item.price}</p>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    {cart[item.menuItemId._id] ? (
                                        <div className="flex items-center bg-green-100 rounded-lg px-2 py-1">
                                            <button onClick={() => handleRemoveFromCart(item)} className="px-2 text-green-700 font-bold text-lg">-</button>
                                            <span className="mx-2 font-semibold text-green-800">{cart[item.menuItemId._id]}</span>
                                            <button onClick={() => handleAddToCart(item)} className="px-2 text-green-700 font-bold text-lg">+</button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleAddToCart(item)}
                                            className="w-full bg-yellow-500 text-white font-semibold py-2 rounded-lg hover:bg-yellow-600 transition"
                                        >
                                            Add to Cart
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Cart Summary (Sticky) */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-28 border border-yellow-200">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Cart</h2>
                            {Object.keys(cart).length === 0 ? (
                                <p className="text-gray-500">Your cart is empty.</p>
                            ) : (
                                <div className="space-y-4">
                                    {Object.entries(cart).map(([itemId, quantity]) => {
                                        const item = menuItems.find(m => m.menuItemId._id === itemId);
                                        return (
                                            <div key={itemId} className="flex justify-between items-center text-sm">
                                                <span className="text-gray-700">{item.menuItemId.name} x {quantity}</span>
                                                <span className="font-semibold">₹{item.price * quantity}</span>
                                            </div>
                                        );
                                    })}
                                    <hr className="border-gray-200 my-4" />
                                    <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                                        <span>Total</span>
                                        <span>₹{totalPrice}</span>
                                    </div>
                                    <button
                                        onClick={handlePlaceOrder}
                                        className="w-full mt-6 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition shadow-md hover:shadow-lg"
                                    >
                                        Place Order
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderPage;
