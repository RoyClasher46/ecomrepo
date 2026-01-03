import React, { useEffect, useState } from "react";
import Navbar from "./navbar";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returnPolicy, setReturnPolicy] = useState({ returnDays: 7 });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/myorders", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          const validOrders = data.filter((order) => order.productId !== null);
          // Sort by createdAt descending (newest first) as a safety measure
          const sortedOrders = validOrders.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA; // Descending order (newest first)
          });
          setOrders(sortedOrders);
        } else {
          toast.error(data.message || "Failed to load orders");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchReturnPolicy = async () => {
      try {
        const res = await fetch("/api/return-policy");
        const data = await res.json();
        if (res.ok) {
          setReturnPolicy(data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchOrders();
    fetchReturnPolicy();
  }, []);

  const canReturnOrder = (order) => {
    if (order.status !== "Delivered") return false;
    if (order.returnStatus && order.returnStatus !== "None") return false;
    if (!order.deliveredDate) return false;
    
    const deliveredDate = new Date(order.deliveredDate);
    const daysSinceDelivery = Math.floor((Date.now() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceDelivery <= returnPolicy.returnDays;
  };

  const getDaysRemaining = (order) => {
    if (!order.deliveredDate) return 0;
    const deliveredDate = new Date(order.deliveredDate);
    const daysSinceDelivery = Math.floor((Date.now() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, returnPolicy.returnDays - daysSinceDelivery);
  };

  const handleReturnClick = (order) => {
    navigate(`/return-order/${order._id}`);
  };

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
                  className="modern-card rounded-lg overflow-hidden hover:shadow-medium transition"
                >
                  {/* Product Image */}
                  {order.productId?.image && (
                    <div className="w-full h-48 overflow-hidden bg-gray-100">
                      <img
                        src={`data:image/jpeg;base64,${order.productId.image}`}
                        alt={order.productId?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {order.productId?.name}
                    </h3>

                    <div className="space-y-2 mb-4">
                    <p className="text-gray-600">
                      Price:{" "}
                      <span className="font-bold text-primary">
                        ₹{order.productId?.price}
                      </span>
                    </p>

                    <p className="text-gray-600">Quantity: <span className="font-medium">{order.quantity}</span></p>

                    {order.size && (
                      <p className="text-gray-600">
                        Size: <span className="font-medium">{order.size}</span>
                      </p>
                    )}

                    <p className="text-gray-600">
                      Total: <span className="font-bold text-primary">₹{(order.productId?.price * order.quantity).toFixed(2)}</span>
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
                    <div className="flex items-center justify-between mb-2">
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
                    {order.returnStatus && order.returnStatus !== "None" && (
                      <div className="mb-2">
                        <span className="text-xs text-gray-600">Return Status: </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            order.returnStatus === "Requested"
                              ? "bg-orange-100 text-orange-700"
                              : order.returnStatus === "Approved"
                              ? "bg-blue-100 text-blue-700"
                              : order.returnStatus === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : order.returnStatus === "Completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {order.returnStatus}
                        </span>
                        {order.returnReason && (
                          <p className="text-xs text-gray-600 mt-1">
                            Reason: {order.returnReason}
                          </p>
                        )}
                      </div>
                    )}
                    {canReturnOrder(order) && (
                      <button
                        onClick={() => handleReturnClick(order)}
                        className="w-full mt-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition"
                      >
                        Request Return ({getDaysRemaining(order)} days left)
                      </button>
                    )}
                    {order.status === "Delivered" && !canReturnOrder(order) && order.returnStatus === "None" && (
                      <p className="text-xs text-red-600 mt-2">
                        Return period expired ({returnPolicy.returnDays} days)
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-3">
                      Ordered on: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyOrders;
