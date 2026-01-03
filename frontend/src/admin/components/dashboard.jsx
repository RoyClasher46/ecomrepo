  import React,{ useState,useEffect } from "react";
  import { toast } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css";

  const Dashboard = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
      fetch("/api/admin/stats")
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch((err) => console.error(err));
    }, []);
    
    return (
      <div className="min-h-screen">
        {stats && (
          <section className="px-6 md:px-10 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="modern-card p-5 rounded-lg">
                <div className="text-gray-600 text-sm">Total Products</div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalProducts}</div>
              </div>
              <div className="modern-card p-5 rounded-lg">
                <div className="text-gray-600 text-sm">Total Orders</div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalOrders}</div>
              </div>
              <div className="modern-card p-5 rounded-lg">
                <div className="text-gray-600 text-sm">Pending</div>
                <div className="text-3xl font-bold text-gray-900">{stats.statusCounts?.Pending || 0}</div>
              </div>
              <div className="modern-card p-5 rounded-lg">
                <div className="text-gray-600 text-sm">Accepted</div>
                <div className="text-3xl font-bold text-gray-900">{stats.statusCounts?.Accepted || 0}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="modern-card p-5 rounded-lg">
                <div className="text-gray-600 text-sm">Assigned</div>
                <div className="text-2xl font-bold text-gray-900">{stats.statusCounts?.Assigned || 0}</div>
              </div>
              <div className="modern-card p-5 rounded-lg">
                <div className="text-gray-600 text-sm">Rejected</div>
                <div className="text-2xl font-bold text-gray-900">{stats.statusCounts?.Rejected || 0}</div>
              </div>
              <div className="modern-card p-5 rounded-lg">
                <div className="text-gray-600 text-sm">Delivered</div>
                <div className="text-2xl font-bold text-gray-900">{stats.statusCounts?.Delivered || 0}</div>
              </div>
            </div>

            {/* Return Policy Section */}
            <ReturnPolicySection />
            
            {/* Return Statistics */}
            {stats.returnCounts && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div className="modern-card p-5 rounded-lg border-l-4 border-orange-500">
                  <div className="text-gray-600 text-sm">Return Requests</div>
                  <div className="text-2xl font-bold text-orange-600">{stats.returnCounts?.requested || 0}</div>
                </div>
                <div className="modern-card p-5 rounded-lg border-l-4 border-blue-500">
                  <div className="text-gray-600 text-sm">Approved Returns</div>
                  <div className="text-2xl font-bold text-blue-600">{stats.returnCounts?.approved || 0}</div>
                </div>
                <div className="modern-card p-5 rounded-lg border-l-4 border-green-500">
                  <div className="text-gray-600 text-sm">Completed Returns</div>
                  <div className="text-2xl font-bold text-green-600">{stats.returnCounts?.completed || 0}</div>
                </div>
              </div>
            )}
          </section>
        )}



        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-6 mt-16 text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} ShopEase. All rights reserved.
        </footer>
      </div>
    );
  };

  // Return Policy Section Component
  const ReturnPolicySection = () => {
    const [returnPolicy, setReturnPolicy] = useState({ returnDays: 7 });
    const [editMode, setEditMode] = useState(false);
    const [newReturnDays, setNewReturnDays] = useState(7);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      fetch("/api/admin/return-policy")
        .then((res) => res.json())
        .then((data) => {
          setReturnPolicy(data);
          setNewReturnDays(data.returnDays);
        })
        .catch((err) => console.error(err));
    }, []);

    const handleSave = async () => {
      if (newReturnDays < 1 || newReturnDays > 365) {
        toast.error("Return days must be between 1 and 365");
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("/api/admin/return-policy", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ returnDays: parseInt(newReturnDays) }),
        });
        const data = await res.json();
        if (res.ok) {
          setReturnPolicy(data.returnPolicy);
          setEditMode(false);
          toast.success("Return policy updated successfully");
        } else {
          toast.error(data.message || "Failed to update return policy");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error updating return policy");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="modern-card p-6 rounded-lg mt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Return Policy Settings</h3>
            <p className="text-sm text-gray-600 mt-1">Configure how many days users can return products after delivery</p>
          </div>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 rounded-lg modern-button text-sm font-semibold"
            >
              Edit
            </button>
          )}
        </div>
        {editMode ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Return Period (Days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={newReturnDays}
                onChange={(e) => setNewReturnDays(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">Users can return products within this many days after delivery</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 rounded-lg modern-button text-sm font-semibold"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setNewReturnDays(returnPolicy.returnDays);
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700">
              <span className="font-semibold">Current Return Period:</span>{" "}
              <span className="text-primary font-bold">{returnPolicy.returnDays} days</span>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Users can request returns within {returnPolicy.returnDays} days of delivery.
            </p>
          </div>
        )}
      </div>
    );
  };

  export default Dashboard;
