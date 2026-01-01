import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./navbar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    addressLine: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  useEffect(() => {
    const loadCart = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/get-cart", {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.cart) {
          setCartItems(data.cart);
        } else {
          toast.error(data.message || "Failed to load cart");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load cart");
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.addressLine.trim()) return "Address is required";
    if (!form.city.trim()) return "City is required";
    if (!form.state.trim()) return "State is required";
    if (!form.pincode.trim() || form.pincode.trim().length < 4) return "Pincode is required";
    if (!form.phone.trim() || form.phone.trim().length < 6) return "Mobile number is required";
    if (cartItems.length === 0) return "Your cart is empty";
    return "";
  };

  const placeOrder = async () => {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }

    try {
      const orderPromises = cartItems.map((item) =>
        fetch("http://localhost:5000/api/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            productId: item._id,
            quantity: item.quantity,
            deliveryPhone: form.phone,
            addressLine: form.addressLine,
            area: form.area,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
          }),
        })
      );

      const results = await Promise.all(orderPromises);
      const anyFailed = results.find((r) => !r.ok);
      if (anyFailed) {
        const data = await anyFailed.json().catch(() => ({}));
        toast.error(data.message || "Failed to place order");
        return;
      }

      await fetch("http://localhost:5000/api/clear-cart", {
        method: "POST",
        credentials: "include",
      });

      toast.success(`Order placed! Total: $${totalPrice.toFixed(2)}`);
      navigate("/myorders");
    } catch (e) {
      console.error(e);
      toast.error("Failed to place order");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="modern-card p-8 rounded-lg">Loading checkout...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 modern-card rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Checkout</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  name="addressLine"
                  value={form.addressLine}
                  onChange={onChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="House no, Street, Landmark"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                <input
                  name="area"
                  value={form.area}
                  onChange={onChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Area / Locality"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={onChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  name="state"
                  value={form.state}
                  onChange={onChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={onChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Pincode"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Mobile Number"
                />
              </div>
            </div>

            <button
              onClick={placeOrder}
              className="mt-6 w-full py-3 rounded-lg modern-button font-bold"
              disabled={cartItems.length === 0}
            >
              Place Order
            </button>
          </div>

          <div className="modern-card rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item._id} className="flex justify-between text-sm text-gray-700">
                  <div className="max-w-[70%]">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-gray-600">Qty: {item.quantity}</div>
                  </div>
                  <div className="font-semibold">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between text-gray-900 font-bold">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
