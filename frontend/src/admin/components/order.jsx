import React, { useEffect, useState } from "react";

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
      } else {
        alert(updatedOrder.message || "Failed to update order");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating order status");
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
      } else {
        alert(updatedOrder.message || "Failed to assign delivery");
      }
    } catch (err) {
      console.error(err);
      alert("Error assigning delivery");
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
        alert(data.message || `Return ${returnStatus.toLowerCase()} successfully`);
      } else {
        alert(data.message || "Failed to update return status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating return status");
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
        alert(data.message || `Payment ${paymentStatus.toLowerCase()} verified successfully`);
      } else {
        alert(data.message || "Failed to verify payment");
      }
    } catch (err) {
      console.error(err);
      alert("Error verifying payment");
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
    <div className="w-full">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-2xl md:text-3xl font-bold gradient-text">Manage Orders</h2>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 font-medium">Filter by Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Assigned">Assigned</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 font-medium">Filter Returns:</label>
            <select
              value={filterReturn}
              onChange={(e) => setFilterReturn(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
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
        <div className="modern-card p-6 rounded-xl text-center">
          <p className="text-gray-700">Loading orders...</p>
        </div>
      )}

      {!loading && error && (
        <div className="modern-card p-6 rounded-xl text-center">
          <p className="text-gray-700">{error}</p>
        </div>
      )}

      {!loading && !error && filteredOrders.length === 0 ? (
        <div className="modern-card p-8 rounded-xl text-center">
          <p className="text-gray-700">
            {orders.length === 0 ? "No Orders listed yet." : "No orders match the selected filter."}
          </p>
        </div>
      ) : !loading && !error ? (
        <div className="overflow-x-auto -mx-6 px-6">
          <div className="modern-card rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 text-left text-gray-900">#</th>
                  <th className="py-3 px-4 text-left text-gray-900">Order #</th>
                  <th className="py-3 px-4 text-left text-gray-900">User</th>
                  <th className="py-3 px-4 text-left text-gray-900">Product</th>
                  <th className="py-3 px-4 text-left text-gray-900">Qty</th>
                  <th className="py-3 px-4 text-left text-gray-900">Size</th>
                  <th className="py-3 px-4 text-left text-gray-900">Address</th>
                  <th className="py-3 px-4 text-left text-gray-900">Action</th>
                  <th className="py-3 px-4 text-left text-gray-900">Delivery</th>
                  <th className="py-3 px-4 text-left text-gray-900">Status</th>
                  <th className="py-3 px-4 text-left text-gray-900">Payment</th>
                  <th className="py-3 px-4 text-left text-gray-900">Return</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <tr key={order._id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="py-3 px-4 text-gray-900">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="text-xs font-mono text-gray-600">
                        {order._id.toString().slice(-8).toUpperCase()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-900 font-semibold">{order.userId?.name}</div>
                      <div className="text-sm text-gray-600">
                        {order.userId?.email}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-800">{order.productId?.name}</td>
                    <td className="py-3 px-4 text-blue-600 font-bold">{order.quantity}</td>
                    <td className="py-3 px-4 text-gray-700 text-sm">
                      {order.size ? (
                        <span className="font-medium">{order.size}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-700 text-sm">
                      <div>{order.deliveryAddress || "-"}</div>
                      <div className="text-gray-500">{order.deliveryPhone || ""}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          disabled={order.status !== "Pending"}
                          className={`px-3 py-1 rounded-lg transition text-xs ${
                            order.status !== "Pending"
                              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                              : "bg-green-500 hover:bg-green-600 text-white"
                          }`}
                          onClick={() => {
                            if (order.status !== "Pending") return;
                            const ok = window.confirm("Accept this order?");
                            if (!ok) return;
                            updateStatus(order._id, "Accepted");
                          }}
                        >
                          Accept
                        </button>
                        <button
                          disabled={order.status !== "Pending"}
                          className={`px-3 py-1 rounded-lg transition text-xs ${
                            order.status !== "Pending"
                              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                              : "bg-red-500 hover:bg-red-600 text-white"
                          }`}
                          onClick={() => {
                            if (order.status !== "Pending") return;
                            const ok = window.confirm("Reject this order?");
                            if (!ok) return;
                            updateStatus(order._id, "Rejected");
                          }}
                        >
                          Reject
                        </button>
                        {order.status === "Accepted" && !order.deliveryPartnerName && (
                          <button
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition text-xs"
                            onClick={() => openAssign(order)}
                          >
                            Assign
                          </button>
                        )}
                        {order.status === "Assigned" && (
                          <button
                            className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition text-xs"
                            onClick={() => {
                              const ok = window.confirm("Mark this order as Delivered?");
                              if (!ok) return;
                              updateStatus(order._id, "Delivered");
                            }}
                          >
                            Delivered
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700 text-sm">
                      <div>{order.deliveryPartnerName || "Not assigned"}</div>
                      <div className="text-gray-500">{order.deliveryPartnerPhone || ""}</div>
                      <div className="text-gray-500 text-xs">{order.trackingId || ""}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${
                        order.status === "Delivered" ? "text-emerald-600" :
                        order.status === "Assigned" ? "text-blue-600" :
                        order.status === "Accepted" ? "text-green-600" :
                        order.status === "Rejected" ? "text-red-600" :
                        "text-yellow-600"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            order.paymentStatus === "Paid" ? "bg-green-100 text-green-700" :
                            order.paymentStatus === "Pending" ? "bg-yellow-100 text-yellow-700" :
                            order.paymentStatus === "Failed" ? "bg-red-100 text-red-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {order.paymentStatus || "Pending"}
                          </span>
                          {order.paymentVerified && (
                            <span className="text-xs text-green-600 font-semibold">✓ Verified</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600">
                          <div><span className="font-medium">Type:</span> {order.paymentType || "Cash on Delivery"}</div>
                          <div><span className="font-medium">Method:</span> {order.paymentMethod || "Cash"}</div>
                          {order.paymentId && (
                            <div className="text-xs font-mono text-gray-500">ID: {order.paymentId}</div>
                          )}
                          {order.paymentAmount > 0 && (
                            <div className="font-semibold text-gray-900">₹{order.paymentAmount.toFixed(2)}</div>
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
                              className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs"
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
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            order.returnStatus === "Requested" ? "bg-orange-100 text-orange-700" :
                            order.returnStatus === "Approved" ? "bg-blue-100 text-blue-700" :
                            order.returnStatus === "Rejected" ? "bg-red-100 text-red-700" :
                            order.returnStatus === "Completed" ? "bg-green-100 text-green-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {order.returnStatus}
                          </span>
                          {order.returnReason && (
                            <div className="text-xs text-gray-600 mt-1 max-w-xs">
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
                                className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs"
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
                                className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold"
                              >
                                Complete Return
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {assignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Assign Delivery</h3>
              <p className="text-sm text-gray-600">Enter delivery partner details</p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Partner Name</label>
                <input
                  value={assignForm.deliveryPartnerName}
                  onChange={(e) => setAssignForm((p) => ({ ...p, deliveryPartnerName: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="e.g. Ravi Kumar"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Partner Phone</label>
                <input
                  value={assignForm.deliveryPartnerPhone}
                  onChange={(e) => setAssignForm((p) => ({ ...p, deliveryPartnerPhone: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery Date</label>
                <input
                  type="date"
                  value={assignForm.estimatedDelivery}
                  onChange={(e) => setAssignForm((p) => ({ ...p, estimatedDelivery: e.target.value }))}
                  min={todayStr}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={closeAssign}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={submitAssign}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
