  import React,{ useState,useEffect } from "react";
  import { toast } from "react-toastify";
  import { Package, ShoppingCart, Clock, CheckCircle, Truck, XCircle, RotateCcw, TrendingUp, Settings } from "lucide-react";
  import "react-toastify/dist/ReactToastify.css";

  const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      fetch("/api/admin/stats")
        .then((res) => res.json())
        .then((data) => {
          setStats(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }, []);
    
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-primary dark:border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (!stats) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-700 dark:text-gray-300">Failed to load statistics</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-2">Dashboard Overview</h1>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Monitor your store's performance and statistics</p>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            icon={Package}
            label="Total Products"
            value={stats.totalProducts}
            color="bg-primary dark:bg-accent"
            bgColor="bg-gray-50 dark:bg-gray-900/50"
          />
          <StatCard
            icon={ShoppingCart}
            label="Total Orders"
            value={stats.totalOrders}
            color="bg-primary dark:bg-accent"
            bgColor="bg-gray-50 dark:bg-gray-900/50"
          />
          <StatCard
            icon={Clock}
            label="Pending Orders"
            value={stats.statusCounts?.Pending || 0}
            color="bg-warning"
            bgColor="bg-warning/10 dark:bg-warning/20"
          />
          <StatCard
            icon={CheckCircle}
            label="Accepted"
            value={stats.statusCounts?.Accepted || 0}
            color="bg-success"
            bgColor="bg-success/10 dark:bg-success/20"
          />
        </div>

        {/* Order Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <StatCard
            icon={Truck}
            label="Assigned"
            value={stats.statusCounts?.Assigned || 0}
            color="bg-primary dark:bg-accent"
            bgColor="bg-gray-50 dark:bg-gray-900/50"
            size="medium"
          />
          <StatCard
            icon={XCircle}
            label="Rejected"
            value={stats.statusCounts?.Rejected || 0}
            color="bg-error"
            bgColor="bg-error/10 dark:bg-error/20"
            size="medium"
          />
          <StatCard
            icon={TrendingUp}
            label="Delivered"
            value={stats.statusCounts?.Delivered || 0}
            color="bg-success"
            bgColor="bg-success/10 dark:bg-success/20"
            size="medium"
          />
        </div>

        {/* Return Policy Section */}
        <ReturnPolicySection />

        {/* Return Statistics */}
        {stats.returnCounts && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <StatCard
              icon={RotateCcw}
              label="Return Requests"
              value={stats.returnCounts?.requested || 0}
              color="bg-warning"
              bgColor="bg-warning/10 dark:bg-warning/20"
              size="medium"
            />
            <StatCard
              icon={CheckCircle}
              label="Approved Returns"
              value={stats.returnCounts?.approved || 0}
              color="bg-primary dark:bg-accent"
              bgColor="bg-gray-50 dark:bg-gray-900/50"
              size="medium"
            />
            <StatCard
              icon={TrendingUp}
              label="Completed Returns"
              value={stats.returnCounts?.completed || 0}
              color="bg-success"
              bgColor="bg-success/10 dark:bg-success/20"
              size="medium"
            />
          </div>
        )}
      </div>
    );
  };

  // StatCard Component
  const StatCard = ({ icon: Icon, label, value, color, bgColor, size = "large" }) => {
    return (
      <div className={`modern-card rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 ${bgColor}`}>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${color} flex items-center justify-center shadow-lg`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</p>
            <p className={`font-bold text-primary dark:text-accent ${size === "large" ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"}`}>
              {value}
            </p>
          </div>
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
      <div className="modern-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold gradient-text mb-2">Return Policy Settings</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Configure how many days users can return products after delivery</p>
          </div>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl modern-button text-sm font-semibold flex items-center justify-center gap-2 self-start sm:self-auto"
            >
              <Settings className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>
        {editMode ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Return Period (Days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={newReturnDays}
                onChange={(e) => setNewReturnDays(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent transition-all outline-none"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Users can return products within this many days after delivery</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl modern-button text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setNewReturnDays(returnPolicy.returnDays);
                }}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-1">Current Return Period</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary dark:text-accent">{returnPolicy.returnDays} days</p>
              </div>
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary dark:bg-accent flex items-center justify-center shadow-lg flex-shrink-0">
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Users can request returns within {returnPolicy.returnDays} days of delivery.
            </p>
          </div>
        )}
      </div>
    );
  };

  export default Dashboard;
