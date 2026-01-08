import React, { useEffect, useState } from "react";
import Navbar from "./navbar";
import Footer from "./Footer";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const ReturnOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [returnPolicy, setReturnPolicy] = useState({ returnDays: 7 });
  const [returnReason, setReturnReason] = useState("");
  const [returnType, setReturnType] = useState("defective"); // defective, wrong-item, not-as-described, other

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch("/api/myorders", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          const foundOrder = data.find((o) => o._id === orderId);
          if (foundOrder) {
            setOrder(foundOrder);
          } else {
            toast.error("Order not found");
            navigate("/myorders");
          }
        } else {
          toast.error(data.message || "Failed to load order");
          navigate("/myorders");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading order");
        navigate("/myorders");
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

    if (orderId) {
      fetchOrder();
      fetchReturnPolicy();
    } else {
      navigate("/myorders");
    }
  }, [orderId, navigate]);

  const canReturnOrder = () => {
    if (!order) return false;
    if (order.status !== "Delivered") return false;
    if (order.returnStatus && order.returnStatus !== "None") return false;
    if (!order.deliveredDate) return false;
    
    const deliveredDate = new Date(order.deliveredDate);
    const daysSinceDelivery = Math.floor((Date.now() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceDelivery <= returnPolicy.returnDays;
  };

  const getDaysRemaining = () => {
    if (!order || !order.deliveredDate) return 0;
    const deliveredDate = new Date(order.deliveredDate);
    const daysSinceDelivery = Math.floor((Date.now() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, returnPolicy.returnDays - daysSinceDelivery);
  };

  const submitReturnRequest = async () => {
    if (!order) return;
    
    if (!returnReason || returnReason.trim().length < 10) {
      toast.error("Please provide a detailed return reason (at least 10 characters)");
      return;
    }

    const fullReason = `Type: ${returnType}\nReason: ${returnReason.trim()}`;

    try {
      const res = await fetch(`/api/orders/${order._id}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason: fullReason }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Return request submitted successfully! We will review it shortly.");
        setTimeout(() => {
          navigate("/myorders");
        }, 2000);
      } else {
        toast.error(data.message || "Failed to submit return request");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error submitting return request");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 via-gray-50/50 to-gray-100/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-24 md:pt-28">
          <div className="text-gray-700 dark:text-gray-300">Loading order details...</div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 via-gray-50/50 to-gray-100/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-24 md:pt-28">
          <div className="text-gray-700 dark:text-gray-300">Order not found</div>
        </div>
      </>
    );
  }

  const canReturn = canReturnOrder();
  const daysRemaining = getDaysRemaining();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50/50 to-gray-100/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6 pt-24 md:pt-28">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/myorders")}
            className="mb-4 text-primary hover:text-primary-dark font-medium flex items-center gap-2"
          >
            ← Back to My Orders
          </button>

          <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">Return Order</h2>
          <p className="text-center text-gray-700 dark:text-gray-300 mb-8">Request a return for your delivered order</p>

          {/* Order Details Card */}
          <div className="modern-card rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Order Details</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                {order.productId?.image && (
                  <img
                    src={order.productId.image.startsWith('data:') ? order.productId.image : order.productId.image.startsWith('/uploads/') ? order.productId.image : `data:image/jpeg;base64,${order.productId.image}`}
                    alt={order.productId?.name}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Product:</span>
                  <p className="text-lg font-semibold text-gray-900">{order.productId?.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Quantity:</span>
                  <p className="text-gray-900 font-medium">{order.quantity}</p>
                </div>
                {order.size && (
                  <div>
                    <span className="text-sm text-gray-600">Size:</span>
                    <p className="text-gray-900 font-medium">{order.size}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-600">Price:</span>
                  <p className="text-gray-900 font-bold text-xl text-primary">
                    ₹{order.productId?.price}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Total:</span>
                  <p className="text-gray-900 font-bold text-xl text-primary">
                    ₹{(order.productId?.price * order.quantity).toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Order Date:</span>
                  <p className="text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                {order.deliveredDate && (
                  <div>
                    <span className="text-sm text-gray-600">Delivered Date:</span>
                    <p className="text-gray-900">{new Date(order.deliveredDate).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-600">Order Number:</span>
                  <p className="text-gray-900 font-mono text-sm">{order._id.toString().slice(-8).toUpperCase()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Return Eligibility Check */}
          {!canReturn && (
            <div className="modern-card rounded-lg p-6 mb-6 bg-red-50 border border-red-200">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Return Not Available</h3>
              {order.status !== "Delivered" ? (
                <p className="text-red-700">
                  This order has not been delivered yet. You can only return delivered orders.
                </p>
              ) : order.returnStatus && order.returnStatus !== "None" ? (
                <div>
                  <p className="text-red-700 mb-2">
                    Return Status: <span className="font-semibold">{order.returnStatus}</span>
                  </p>
                  {order.returnReason && (
                    <p className="text-red-600 text-sm">Reason: {order.returnReason}</p>
                  )}
                </div>
              ) : (
                <p className="text-red-700">
                  The return period has expired. You can only return products within {returnPolicy.returnDays} days of delivery.
                </p>
              )}
            </div>
          )}

          {/* Return Form */}
          {canReturn && (
            <div className="modern-card rounded-lg p-6 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Return Policy</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>You have <span className="font-bold">{daysRemaining} days</span> remaining to return this product</li>
                  <li>Returns are accepted within {returnPolicy.returnDays} days of delivery</li>
                  <li>Product must be in original condition with all tags and packaging</li>
                  <li>Refund will be processed after we receive and inspect the returned item</li>
                  <li>Return shipping costs may apply depending on the reason for return</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">Return Request Form</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Why are you returning this product? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={returnType}
                    onChange={(e) => setReturnType(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white"
                  >
                    <option value="defective">Product is defective or damaged</option>
                    <option value="wrong-item">Wrong item received</option>
                    <option value="not-as-described">Product not as described</option>
                    <option value="size-issue">Size/Size issue</option>
                    <option value="changed-mind">Changed my mind</option>
                    <option value="other">Other reason</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Detailed Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 min-h-[120px]"
                    placeholder="Please provide detailed information about why you want to return this product. Include any relevant details about defects, issues, or concerns..."
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {returnReason.length}/10 characters (minimum required)
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">What happens next?</h4>
                  <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-decimal list-inside">
                    <li>Submit your return request</li>
                    <li>Our team will review your request (usually within 1-2 business days)</li>
                    <li>If approved, you'll receive return instructions and a return label</li>
                    <li>Package the item securely and ship it back</li>
                    <li>Once we receive and inspect the item, your refund will be processed</li>
                  </ol>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => navigate("/myorders")}
                    className="flex-1 px-4 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitReturnRequest}
                    disabled={returnReason.trim().length < 10}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${
                      returnReason.trim().length < 10
                        ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        : "bg-orange-500 hover:bg-orange-600 text-white"
                    }`}
                  >
                    Submit Return Request
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ReturnOrder;

