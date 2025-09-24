import React, { useEffect, useState } from "react";
import Navbar from "./navbar";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/myorders", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          const validOrders = data.filter((order) => order.productId !== null);
          setOrders(validOrders);
        } else {
          alert(data.message || "Failed to load orders");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-6">
        <h2 className="text-3xl font-bold text-center mb-8 text-indigo-700">My Orders</h2>

        {orders.length === 0 ? (
          <p className="text-center text-gray-600">You have no orders yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 
                           hover:bg-gray-50 hover:shadow-2xl hover:scale-[1.02] 
                           transition-all duration-300"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {order.productId?.name}
                </h3>

                <p className="text-gray-600">
                  Price:{" "}
                  <span className="font-bold text-indigo-600">
                    ₹{order.productId?.price}
                  </span>
                </p>

                <p className="text-gray-600">Quantity: {order.quantity}</p>

                <p
                  className={`font-medium mt-2 ${
                    order.status === "Pending"
                      ? "text-yellow-600"
                      : order.status === "Accepted"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  Status: {order.status}
                </p>

                <p className="text-sm text-gray-500 mt-2">
                  Ordered on: {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyOrders;
