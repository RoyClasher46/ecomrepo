import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./navbar";
import Footer from "./Footer";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentType, setPaymentType] = useState("Cash on Delivery"); // "Online" or "Cash on Delivery"
  const [paymentMethod, setPaymentMethod] = useState("Cash"); // UPI, GPay, Card, QR, PhonePe, Paytm, Cash
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

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
        const res = await fetch("/api/get-cart", {
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

    const loadProfile = async () => {
      try {
        const res = await fetch("/api/profile", {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.user) {
          // Pre-fill form with profile data
          if (data.user.mobile) {
            setForm(prev => ({ ...prev, phone: data.user.mobile }));
          }
          // Pre-fill with home address if available
          if (data.user.homeAddress && data.user.homeAddress.street) {
            setForm(prev => ({
              ...prev,
              addressLine: data.user.homeAddress.street || "",
              city: data.user.homeAddress.city || "",
              state: data.user.homeAddress.state || "",
              pincode: data.user.homeAddress.zipCode || "",
              area: data.user.homeAddress.city || "",
            }));
          }
        }
      } catch (err) {
        // Profile not loaded, user can fill manually
      }
    };

    loadCart();
    loadProfile();
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
    if (paymentType === "Online" && !paymentMethod) return "Please select a payment method";
    if (paymentType === "Online" && paymentMethod === "UPI" && !upiId.trim()) return "Please enter UPI ID";
    if (paymentType === "Online" && paymentMethod === "Card" && (!cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim())) {
      return "Please enter complete card details";
    }
    return "";
  };

  const simulatePayment = async () => {
    // Simulate payment processing
    setProcessingPayment(true);
    
    // Generate a payment ID
    const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
    
    // Simulate payment gateway delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate 95% success rate (realistic payment gateway)
    const success = Math.random() > 0.05;
    
    setProcessingPayment(false);
    
    if (success) {
      return { success: true, paymentId };
    } else {
      return { success: false, message: "Payment failed. Please try again." };
    }
  };

  const handlePlaceOrder = async () => {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }

    // If online payment, show payment gateway first
    if (paymentType === "Online") {
      setShowPaymentGateway(true);
      return;
    }

    // For Cash on Delivery, place order directly
    await placeOrder("Cash", "Cash on Delivery", "", false);
  };

  const handlePayment = async () => {
    // Validate payment details
    if (paymentMethod === "UPI" && !upiId.trim()) {
      toast.error("Please enter UPI ID");
      return;
    }
    if (paymentMethod === "Card" && (!cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim())) {
      toast.error("Please enter complete card details");
      return;
    }

    // Simulate payment
    const paymentResult = await simulatePayment();
    
    if (paymentResult.success) {
      toast.success("Payment successful! Placing your order...");
      setShowPaymentGateway(false);
      await placeOrder(paymentMethod, "Online", paymentResult.paymentId, false);
    } else {
      toast.error(paymentResult.message || "Payment failed. Please try again.");
    }
  };

  const placeOrder = async (method, type, paymentId, verified) => {
    try {
      const orderPromises = cartItems.map((item) =>
        fetch("/api/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            productId: item._id,
            quantity: item.quantity,
            size: item.size || "",
            deliveryPhone: form.phone,
            addressLine: form.addressLine,
            area: form.area,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
            paymentType: type,
            paymentMethod: method,
            paymentId: paymentId,
            paymentAmount: totalPrice,
            paymentStatus: type === "Online" ? "Paid" : "Pending",
            paymentVerified: verified,
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

      await fetch("/api/clear-cart", {
        method: "POST",
        credentials: "include",
      });

      toast.success(`Order placed! Total: ₹${totalPrice.toFixed(2)}`);
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-50/50 to-gray-100/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-24 md:pt-28">
          <div className="modern-card p-8 rounded-lg">Loading checkout...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50/50 to-gray-100/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6 pt-24 md:pt-28">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 modern-card rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Checkout</h1>

            <div className="space-y-6">
              {/* Address Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Delivery Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
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
              </div>

              {/* Payment Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Payment Method</h2>
                
                <div className="space-y-4">
                  {/* Payment Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                    <div className="flex gap-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="paymentType"
                          value="Cash on Delivery"
                          checked={paymentType === "Cash on Delivery"}
                          onChange={(e) => {
                            setPaymentType(e.target.value);
                            setPaymentMethod("Cash");
                          }}
                          className="mr-2"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Cash on Delivery</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="paymentType"
                          value="Online"
                          checked={paymentType === "Online"}
                          onChange={(e) => setPaymentType(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Online Payment</span>
                      </label>
                    </div>
                  </div>

                  {/* Payment Method Selection (for Online) */}
                  {paymentType === "Online" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Payment Method</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {["UPI", "GPay", "PhonePe", "Paytm", "Card", "QR"].map((method) => (
                          <label
                            key={method}
                            className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition ${
                              paymentMethod === method
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method}
                              checked={paymentMethod === method}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="mr-2"
                            />
                            <span className="text-sm font-medium text-gray-700">{method}</span>
                          </label>
                        ))}
                      </div>

                      {/* UPI ID Input */}
                      {paymentMethod === "UPI" && (
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            placeholder="yourname@upi"
                          />
                        </div>
                      )}

                      {/* Card Details */}
                      {paymentMethod === "Card" && (
                        <div className="mt-3 space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              placeholder="1234 5678 9012 3456"
                              maxLength={16}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry (MM/YY)</label>
                              <input
                                type="text"
                                value={cardExpiry}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                                  if (val.length <= 2) {
                                    setCardExpiry(val);
                                  } else {
                                    setCardExpiry(val.slice(0, 2) + "/" + val.slice(2));
                                  }
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                placeholder="MM/YY"
                                maxLength={5}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                              <input
                                type="text"
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                placeholder="123"
                                maxLength={3}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* QR Code Info */}
                      {paymentMethod === "QR" && (
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700 mb-2">Scan the QR code shown during payment to complete your transaction.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              className="mt-6 w-full py-3 rounded-lg modern-button font-bold"
              disabled={cartItems.length === 0}
            >
              {paymentType === "Online" ? "Proceed to Payment" : "Place Order"}
            </button>
          </div>

          <div className="modern-card rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item._id} className="flex justify-between text-sm text-gray-700">
                  <div className="max-w-[70%]">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-gray-600">
                      Qty: {item.quantity}
                      {item.size && <span className="ml-2">Size: {item.size}</span>}
                    </div>
                  </div>
                  <div className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between text-gray-900 font-bold">
              <span>Total</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>

            {paymentType === "Cash on Delivery" && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                <p className="text-xs text-gray-600">Pay ₹{totalPrice.toFixed(2)} when your order is delivered</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      {showPaymentGateway && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Complete Payment</h3>
              <button
                onClick={() => setShowPaymentGateway(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Amount to Pay</span>
                  <span className="font-bold text-gray-900">₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Payment Method</span>
                  <span className="font-medium">{paymentMethod}</span>
                </div>
              </div>

              {paymentMethod === "GPay" && (
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <div className="text-4xl mb-2">📱</div>
                  <p className="text-sm text-gray-700">Redirecting to Google Pay...</p>
                </div>
              )}

              {paymentMethod === "PhonePe" && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-center">
                  <div className="text-4xl mb-2">💳</div>
                  <p className="text-sm text-gray-700">Redirecting to PhonePe...</p>
                </div>
              )}

              {paymentMethod === "Paytm" && (
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <div className="text-4xl mb-2">💳</div>
                  <p className="text-sm text-gray-700">Redirecting to Paytm...</p>
                </div>
              )}

              {paymentMethod === "QR" && (
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="w-48 h-48 mx-auto mb-3 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-6xl">📱</span>
                  </div>
                  <p className="text-sm text-gray-700">Scan this QR code with your UPI app</p>
                </div>
              )}

              {processingPayment && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                  <p className="text-sm text-gray-600">Processing payment...</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentGateway(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                  disabled={processingPayment}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  disabled={processingPayment}
                >
                  {processingPayment ? "Processing..." : "Pay Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
