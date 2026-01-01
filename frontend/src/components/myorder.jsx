import React, { useEffect, useState } from "react";
import Navbar from "./navbar";
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

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
          toast.error(data.message || "Failed to load orders");
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
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen bg-gray-50">
          <div className="text-gray-600">Loading orders...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">My Orders</h2>
          <p className="text-center text-gray-600 mb-8">View all your order history</p>

          {orders.length === 0 ? (
            <div className="modern-card p-12 rounded-lg text-center">
              <p className="text-gray-600 text-lg mb-2">You have no orders yet.</p>
              <p className="text-gray-500 text-sm">Start shopping to see your orders here!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="modern-card rounded-lg p-6 hover:shadow-medium transition"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {order.productId?.name}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <p className="text-gray-600">
                      Price:{" "}
                      <span className="font-bold text-primary">
                        ${order.productId?.price}
                      </span>
                    </p>

                    <p className="text-gray-600">Quantity: <span className="font-medium">{order.quantity}</span></p>

                    <p className="text-gray-600">
                      Total: <span className="font-bold text-primary">${(order.productId?.price * order.quantity).toFixed(2)}</span>
                    </p>

                    {order.deliveryAddress && (
                      <p className="text-gray-600">
                        Address: <span className="font-medium">{order.deliveryAddress}</span>
                      </p>
                    )}

                    {order.deliveryPhone && (
                      <p className="text-gray-600">
                        Mobile: <span className="font-medium">{order.deliveryPhone}</span>
                      </p>
                    )}

                    {(order.deliveryPartnerName || order.deliveryPartnerPhone) && (
                      <p className="text-gray-600">
                        Delivery Guy: <span className="font-medium">{order.deliveryPartnerName} {order.deliveryPartnerPhone ? `(${order.deliveryPartnerPhone})` : ""}</span>
                      </p>
                    )}

                    {order.trackingId && (
                      <p className="text-gray-600">
                        Tracking: <span className="font-medium">{order.trackingId}</span>
                      </p>
                    )}

                    {order.estimatedDelivery && (
                      <p className="text-gray-600">
                        Est. Delivery: <span className="font-medium">{new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === "Pending"
                            ? "bg-warning/20 text-warning-dark"
                            : order.status === "Accepted"
                            ? "bg-success/20 text-success-dark"
                            : order.status === "Assigned"
                            ? "bg-blue-100 text-blue-700"
                            : order.status === "Delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      Ordered on: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyOrders;
