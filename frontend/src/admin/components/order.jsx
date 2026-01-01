import React, { useEffect, useState } from "react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignOrderId, setAssignOrderId] = useState(null);
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

    fetch("http://localhost:5000/api/orders")
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.message || "Failed to load orders");
        }
        if (!Array.isArray(data)) {
          throw new Error("Invalid response from server");
        }
        const validOrders = data.filter((order) => order.productId !== null);
        setOrders(validOrders);
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
      const res = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
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
      const res = await fetch(`http://localhost:5000/api/orders/${assignOrderId}/assign-delivery`, {
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

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 gradient-text">Manage Orders</h2>

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

      {!loading && !error && orders.length === 0 ? (
        <div className="modern-card p-8 rounded-xl text-center">
          <p className="text-gray-700">No Orders listed yet.</p>
        </div>
      ) : !loading && !error ? (
        <div className="overflow-x-auto">
          <div className="modern-card rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 text-left text-gray-900">#</th>
                  <th className="py-3 px-4 text-left text-gray-900">User</th>
                  <th className="py-3 px-4 text-left text-gray-900">Product</th>
                  <th className="py-3 px-4 text-left text-gray-900">Qty</th>
                  <th className="py-3 px-4 text-left text-gray-900">Address</th>
                  <th className="py-3 px-4 text-left text-gray-900">Action</th>
                  <th className="py-3 px-4 text-left text-gray-900">Delivery</th>
                  <th className="py-3 px-4 text-left text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr key={order._id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="py-3 px-4 text-gray-900">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="text-gray-900 font-semibold">{order.userId?.name}</div>
                      <div className="text-sm text-gray-600">
                        {order.userId?.email}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-800">{order.productId?.name}</td>
                    <td className="py-3 px-4 text-blue-600 font-bold">{order.quantity}</td>
                    <td className="py-3 px-4 text-gray-700 text-sm">
                      <div>{order.deliveryAddress || "-"}</div>
                      <div className="text-gray-500">{order.deliveryPhone || ""}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          disabled={order.status !== "Pending"}
                          className={`px-3 py-1 rounded-lg transition ${
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
                          className={`px-3 py-1 rounded-lg transition ${
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
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                            onClick={() => openAssign(order)}
                          >
                            Assign
                          </button>
                        )}
                        {order.status === "Assigned" && (
                          <button
                            className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition"
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
                      <div className="text-gray-500">{order.trackingId || ""}</div>
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
