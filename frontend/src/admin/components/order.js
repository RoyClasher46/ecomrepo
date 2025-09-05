import React, { useEffect, useState } from "react";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  // Fetch orders on mount
  useEffect(() => {
    fetch("http://localhost:5000/api/orders")
      .then((res) => res.json())
      .then((data) => {
        // ✅ Filter out orders where productId is null (product deleted)
        const validOrders = data.filter((order) => order.productId !== null);
        setOrders(validOrders);
      })
      .catch((err) => console.error(err));
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

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Orders</h2>

      {orders.length === 0 ? (
        <p className="text-gray-500">No Orders listed yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-4">#</th>
                <th className="py-2 px-4">User</th>
                <th className="py-2 px-4">Product</th>
                <th className="py-2 px-4">Qty</th>
                <th className="py-2 px-4">Action</th>
                <th className="py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order._id}>
                  <td className="py-2 px-4">{index + 1}</td>
                  <td className="py-2 px-4">
                    {order.userId?.name}
                    <br />
                    <span className="text-sm text-gray-500">
                      {order.userId?.email}
                    </span>
                  </td>
                  <td className="py-2 px-4">{order.productId?.name}</td>
                  <td className="py-2 px-4">{order.quantity}</td>
                  <td className="py-2 px-4">
                    <button
                      className="mr-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      onClick={() => updateStatus(order._id, "Accepted")}
                    >
                      Accept
                    </button>
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={() => updateStatus(order._id, "Rejected")}
                    >
                      Reject
                    </button>
                  </td>
                  <td className="py-2 px-4 font-semibold">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
