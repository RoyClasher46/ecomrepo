import React, { useEffect, useState } from "react";
import { ShoppingCart, Filter, CheckCircle, XCircle, Truck, Clock, RotateCcw } from "lucide-react";
import { toast } from "react-toastify";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignOrderId, setAssignOrderId] = useState(null);
  const [filterReturn, setFilterReturn] = useState("all"); // all, requested, approved, rejected, completed
  const [filterStatus, setFilterStatus] = useState("all"); // all, Pending, Accepted, Rejected, Assigned, Delivered
  const [assignForm, setAssignForm] = useState({
    deliveryPartnerName: "",
    deliveryPartnerPhone: "",
    estimatedDelivery: "",
  });

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Fetch orders on mount
  useEffect(() => {
    setLoading(true);
    setError("");

    fetch("/api/orders")
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.message || "Failed to load orders");
        }
        if (!Array.isArray(data)) {
          throw new Error("Invalid response from server");
        }
        const validOrders = data.filter((order) => order.productId !== null);
        // Sort by createdAt descending (newest first) as a safety measure
        const sortedOrders = validOrders.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA; // Descending order (newest first)
        });
        setOrders(sortedOrders);
      })
      .catch((err) => {
        console.error(err);
        setError(err?.message || "Failed to load orders");
        setOrders([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ✅ Function to update order status (Accept / Reject)
  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const updatedOrder = await res.json();

      if (res.ok) {
        // update state so UI changes instantly
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === id ? { ...order, status: updatedOrder.status } : order
          )
        );
        toast.success(`Order status updated to ${newStatus}`);
      } else {
        toast.error(updatedOrder.message || "Failed to update order");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating order status");
    }
  };

  const openAssign = (order) => {
    setAssignOrderId(order._id);
    setAssignForm({
      deliveryPartnerName: order.deliveryPartnerName || "",
      deliveryPartnerPhone: order.deliveryPartnerPhone || "",
      estimatedDelivery: order.estimatedDelivery
        ? new Date(order.estimatedDelivery).toISOString().slice(0, 10)
        : "",
    });
    setAssignOpen(true);
  };

  const closeAssign = () => {
    setAssignOpen(false);
    setAssignOrderId(null);
    setAssignForm({ deliveryPartnerName: "", deliveryPartnerPhone: "", estimatedDelivery: "" });
  };

  const submitAssign = async () => {
    if (!assignOrderId) return;
    const deliveryPartnerName = String(assignForm.deliveryPartnerName || "").trim();
    const deliveryPartnerPhone = String(assignForm.deliveryPartnerPhone || "").trim();
    const estimatedDelivery = String(assignForm.estimatedDelivery || "").trim();

    if (deliveryPartnerName.length < 2) {
      alert("Please enter delivery partner name");
      return;
    }
    if (deliveryPartnerPhone.length < 6) {
      alert("Please enter delivery partner phone");
      return;
    }
    if (!estimatedDelivery) {
      alert("Please select estimated delivery date");
      return;
    }
    if (estimatedDelivery < todayStr) {
      alert("Estimated delivery date cannot be in the past");
      return;
    }

    try {
      const res = await fetch(`/api/orders/${assignOrderId}/assign-delivery`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryPartnerName, deliveryPartnerPhone, estimatedDelivery }),
      });
      const updatedOrder = await res.json();
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o._id === assignOrderId ? updatedOrder : o)));
        closeAssign();
        toast.success("Delivery partner assigned successfully!");
      } else {
        toast.error(updatedOrder.message || "Failed to assign delivery");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error assigning delivery");
    }
  };

  const handleReturnStatus = async (orderId, returnStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/return-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? data.order : o)));
        toast.success(data.message || `Return ${returnStatus.toLowerCase()} successfully`);
      } else {
        toast.error(data.message || "Failed to update return status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating return status");
    }
  };

  const handlePaymentVerification = async (orderId, paymentStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/verify-payment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? data.order : o)));
        toast.success(data.message || `Payment ${paymentStatus.toLowerCase()} verified successfully`);
      } else {
        toast.error(data.message || "Failed to verify payment");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error verifying payment");
    }
  };

  const filteredOrders = orders
    .filter((order) => {
      // Filter by return status
      if (filterReturn !== "all") {
        if (filterReturn === "none") {
          if (order.returnStatus && order.returnStatus !== "None") return false;
        } else {
          if (order.returnStatus !== filterReturn) return false;
        }
      }
      // Filter by order status
      if (filterStatus !== "all") {
        if (order.status !== filterStatus) return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Ensure descending order by createdAt (newest first)
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary dark:bg-accent flex items-center justify-center shadow-lg flex-shrink-0">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">Manage Orders</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">View and manage all customer orders</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="modern-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-primary dark:text-accent" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Order Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent transition-all outline-none"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Assigned">Assigned</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Return Status
            </label>
            <select
              value={filterReturn}
              onChange={(e) => setFilterReturn(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent transition-all outline-none"
            >
              <option value="all">All Orders</option>
              <option value="none">No Returns</option>
              <option value="Requested">Return Requested</option>
              <option value="Approved">Return Approved</option>
              <option value="Rejected">Return Rejected</option>
              <option value="Completed">Return Completed</option>
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="modern-card rounded-2xl p-12 text-center">
          <div className="w-12 h-12 border-4 border-primary dark:border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading orders...</p>
        </div>
      )}

      {!loading && error && (
        <div className="modern-card rounded-2xl p-8 text-center border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 dark:text-red-400 font-semibold">{error}</p>
        </div>
      )}

      {!loading && !error && filteredOrders.length === 0 ? (
        <div className="modern-card rounded-2xl p-12 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-300 text-lg font-semibold mb-2">
            {orders.length === 0 ? "No Orders listed yet." : "No orders match the selected filter."}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Try adjusting your filters or check back later.</p>
        </div>
      ) : !loading && !error ? (
        <div className="modern-card rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="py-4 px-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">#</th>
                    <th className="py-4 px-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Order ID</th>
                    <th className="py-4 px-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                    <th className="py-4 px-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Product</th>
                    <th className="py-4 px-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Qty</th>
                    <th className="py-4 px-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Size</th>
                    <th className="py-4 px-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Address</th>
                    <th className="py-4 px-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    <th className="py-4 px-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Delivery</th>
                    <th className="py-4 px-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="py-4 px-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[200px]">Payment</th>
                    <th className="py-4 px-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Return</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredOrders.map((order, index) => (
                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 text-gray-900 dark:text-gray-100 font-semibold">{index + 1}</td>
                      <td className="py-3 px-4">
                        <div className="text-xs font-mono text-gray-600 dark:text-gray-400">
                          {order._id.toString().slice(-8).toUpperCase()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-gray-900 dark:text-gray-100 font-semibold">{order.userId?.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {order.userId?.email}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{order.productId?.name}</td>
                      <td className="py-3 px-4 text-blue-600 dark:text-blue-400 font-bold">{order.quantity}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300 text-sm">
                        {order.size ? (
                          <span className="font-medium">{order.size}</span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300 text-sm">
                        <div>{order.deliveryAddress || "-"}</div>
                        <div className="text-gray-500 dark:text-gray-400">{order.deliveryPhone || ""}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-2">
                          {order.status === "Pending" && (
                            <>
                              <button
                                className="px-3 py-1.5 rounded-lg transition text-xs font-semibold bg-success hover:bg-success-dark text-white flex items-center gap-1"
                                onClick={() => {
                                  const ok = window.confirm("Accept this order?");
                                  if (!ok) return;
                                  updateStatus(order._id, "Accepted");
                                  toast.success("Order accepted!");
                                }}
                              >
                                <CheckCircle className="w-3 h-3" />
                                Accept
                              </button>
                              <button
                                className="px-3 py-1.5 rounded-lg transition text-xs font-semibold bg-red-500 hover:bg-red-600 text-white flex items-center gap-1"
                                onClick={() => {
                                  const ok = window.confirm("Reject this order?");
                                  if (!ok) return;
                                  updateStatus(order._id, "Rejected");
                                  toast.error("Order rejected!");
                                }}
                              >
                                <XCircle className="w-3 h-3" />
                                Reject
                              </button>
                            </>
                          )}
                          {order.status === "Accepted" && !order.deliveryPartnerName && (
                            <button
                              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition text-xs font-semibold flex items-center gap-1"
                              onClick={() => openAssign(order)}
                            >
                              <Truck className="w-3 h-3" />
                              Assign
                            </button>
                          )}
                          {order.status === "Assigned" && (
                            <button
                              className="px-3 py-1.5 bg-primary dark:bg-accent hover:bg-primary-dark dark:hover:bg-accent-dark text-white rounded-lg transition text-xs font-semibold flex items-center gap-1"
                              onClick={() => {
                                const ok = window.confirm("Mark this order as Delivered?");
                                if (!ok) return;
                                updateStatus(order._id, "Delivered");
                                toast.success("Order marked as delivered!");
                              }}
                            >
                              <CheckCircle className="w-3 h-3" />
                              Delivered
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300 text-sm">
                        <div>{order.deliveryPartnerName || "Not assigned"}</div>
                        <div className="text-gray-500 dark:text-gray-400">{order.deliveryPartnerPhone || ""}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">{order.trackingId || ""}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${order.status === "Delivered" ? "text-emerald-600 dark:text-emerald-400" :
                            order.status === "Assigned" ? "text-blue-600 dark:text-blue-400" :
                              order.status === "Accepted" ? "text-success" :
                                order.status === "Rejected" ? "text-red-600 dark:text-red-400" :
                                  "text-yellow-600 dark:text-yellow-400"
                          }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${order.paymentStatus === "Paid" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                                order.paymentStatus === "Pending" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" :
                                  order.paymentStatus === "Failed" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" :
                                    "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                              }`}>
                              {order.paymentStatus || "Pending"}
                            </span>
                            {order.paymentVerified && (
                              <span className="text-xs text-success font-semibold">✓ Verified</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            <div><span className="font-medium">Type:</span> {order.paymentType || "Cash on Delivery"}</div>
                            <div><span className="font-medium">Method:</span> {order.paymentMethod || "Cash"}</div>
                            {order.paymentId && (
                              <div className="text-xs font-mono text-gray-500 dark:text-gray-400">ID: {order.paymentId}</div>
                            )}
                            {order.paymentAmount > 0 && (
                              <div className="font-semibold text-gray-900 dark:text-gray-100">₹{order.paymentAmount.toFixed(2)}</div>
                            )}
                          </div>
                          {order.paymentType === "Online" && !order.paymentVerified && (
                            <div className="flex gap-1 mt-1">
                              <button
                                onClick={() => {
                                  const ok = window.confirm("Verify this payment as Paid?");
                                  if (!ok) return;
                                  handlePaymentVerification(order._id, "Paid");
                                }}
                                className="px-2 py-1 bg-success hover:bg-success-dark text-white rounded text-xs"
                              >
                                Verify Paid
                              </button>
                              <button
                                onClick={() => {
                                  const ok = window.confirm("Mark this payment as Failed?");
                                  if (!ok) return;
                                  handlePaymentVerification(order._id, "Failed");
                                }}
                                className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                              >
                                Mark Failed
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {order.returnStatus && order.returnStatus !== "None" ? (
                          <div className="space-y-1">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${order.returnStatus === "Requested" ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400" :
                                order.returnStatus === "Approved" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" :
                                  order.returnStatus === "Rejected" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" :
                                    order.returnStatus === "Completed" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                                      "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                              }`}>
                              {order.returnStatus}
                            </span>
                            {order.returnReason && (
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 max-w-xs">
                                <span className="font-medium">Reason:</span> {order.returnReason}
                              </div>
                            )}
                            {order.returnStatus === "Requested" && (
                              <div className="flex gap-1 mt-1">
                                <button
                                  onClick={() => {
                                    const ok = window.confirm("Approve this return request?");
                                    if (!ok) return;
                                    handleReturnStatus(order._id, "Approved");
                                  }}
                                  className="px-2 py-1 bg-success hover:bg-success-dark text-white rounded text-xs"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    const ok = window.confirm("Reject this return request?");
                                    if (!ok) return;
                                    handleReturnStatus(order._id, "Rejected");
                                  }}
                                  className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {order.returnStatus === "Approved" && (
                              <div className="flex gap-1 mt-1">
                                <button
                                  onClick={() => {
                                    const ok = window.confirm("Mark this return as completed? This means the refund has been processed and the return is finished.");
                                    if (!ok) return;
                                    handleReturnStatus(order._id, "Completed");
                                  }}
                                  className="px-2 py-1 bg-success hover:bg-success-dark text-white rounded text-xs font-semibold"
                                >
                                  Complete Return
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 dark:text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {assignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary dark:bg-accent flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Assign Delivery</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Enter delivery partner details</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Delivery Partner Name</label>
                <input
                  value={assignForm.deliveryPartnerName}
                  onChange={(e) => setAssignForm((p) => ({ ...p, deliveryPartnerName: e.target.value }))}
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent transition-all outline-none"
                  placeholder="e.g. Ravi Kumar"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Delivery Partner Phone</label>
                <input
                  value={assignForm.deliveryPartnerPhone}
                  onChange={(e) => setAssignForm((p) => ({ ...p, deliveryPartnerPhone: e.target.value }))}
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent transition-all outline-none"
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Estimated Delivery Date</label>
                <input
                  type="date"
                  value={assignForm.estimatedDelivery}
                  onChange={(e) => setAssignForm((p) => ({ ...p, estimatedDelivery: e.target.value }))}
                  min={todayStr}
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50">
              <button
                onClick={closeAssign}
                className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitAssign}
                className="px-6 py-3 rounded-xl modern-button font-semibold flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Save & Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
