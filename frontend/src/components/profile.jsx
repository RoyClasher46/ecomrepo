import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./navbar";
import Footer from "./Footer";
import FloatingCart from "./FloatingCart";
import { User, Phone, Home, Briefcase, Save, ArrowLeft } from "lucide-react";
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    homeAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    workAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetch("/api/profile", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setFormData({
          name: data.user.name || "",
          email: data.user.email || "",
          mobile: data.user.mobile || "",
          homeAddress: {
            street: data.user.homeAddress?.street || "",
            city: data.user.homeAddress?.city || "",
            state: data.user.homeAddress?.state || "",
            zipCode: data.user.homeAddress?.zipCode || "",
            country: data.user.homeAddress?.country || "",
          },
          workAddress: {
            street: data.user.workAddress?.street || "",
            city: data.user.workAddress?.city || "",
            state: data.user.workAddress?.state || "",
            zipCode: data.user.workAddress?.zipCode || "",
            country: data.user.workAddress?.country || "",
          },
        });
      } else {
        toast.error("Failed to load profile");
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("homeAddress.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        homeAddress: {
          ...formData.homeAddress,
          [field]: value,
        },
      });
    } else if (name.startsWith("workAddress.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        workAddress: {
          ...formData.workAddress,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 pt-24 md:pt-28 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50/50 to-gray-100/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-24 md:pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary dark:bg-accent flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold gradient-text">Edit Profile</h1>
                <p className="text-gray-600 mt-1">Manage your personal information and addresses</p>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="modern-card rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <User className="w-5 h-5 text-primary dark:text-accent" />
                Basic Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent transition-all outline-none text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="+91 1234567890"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent transition-all outline-none text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Home Address */}
            <div className="modern-card rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Home className="w-5 h-5 text-primary dark:text-accent" />
                Home Address
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="homeAddress.street"
                    value={formData.homeAddress.street}
                    onChange={handleChange}
                    placeholder="123 Main Street"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent transition-all outline-none text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="homeAddress.city"
                      value={formData.homeAddress.city}
                      onChange={handleChange}
                      placeholder="City"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent transition-all outline-none text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="homeAddress.state"
                      value={formData.homeAddress.state}
                      onChange={handleChange}
                      placeholder="State"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent transition-all outline-none text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="homeAddress.zipCode"
                      value={formData.homeAddress.zipCode}
                      onChange={handleChange}
                      placeholder="123456"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent transition-all outline-none text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="homeAddress.country"
                      value={formData.homeAddress.country}
                      onChange={handleChange}
                      placeholder="Country"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent transition-all outline-none text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Work Address */}
            <div className="modern-card rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary dark:text-accent" />
                Work Address
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="workAddress.street"
                    value={formData.workAddress.street}
                    onChange={handleChange}
                    placeholder="456 Business Avenue"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent transition-all outline-none text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="workAddress.city"
                      value={formData.workAddress.city}
                      onChange={handleChange}
                      placeholder="City"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent transition-all outline-none text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="workAddress.state"
                      value={formData.workAddress.state}
                      onChange={handleChange}
                      placeholder="State"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent transition-all outline-none text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="workAddress.zipCode"
                      value={formData.workAddress.zipCode}
                      onChange={handleChange}
                      placeholder="123456"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent transition-all outline-none text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="workAddress.country"
                      value={formData.workAddress.country}
                      onChange={handleChange}
                      placeholder="Country"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent transition-all outline-none text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-4 rounded-xl modern-button font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-4 rounded-xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      <FloatingCart />
      <Footer />
    </>
  );
}

