import React from "react";
import Navbar from "./navbar";

export default function About() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-14">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">About ShopEase</h1>
            <p className="text-gray-600 text-lg max-w-3xl">
              ShopEase is a simple e-commerce platform built to help you discover products, add them to your cart,
              and place orders easily. We focus on a clean UI, fast browsing, and transparent order tracking.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 md:px-10 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="modern-card rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Our Mission</h2>
              <p className="text-gray-600">
                Make online shopping easy for everyone with a smooth cart experience and clear order updates.
              </p>
            </div>
            <div className="modern-card rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Quality & Value</h2>
              <p className="text-gray-600">
                We aim to list products with clear pricing, details, and categories so you can choose confidently.
              </p>
            </div>
            <div className="modern-card rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Support</h2>
              <p className="text-gray-600">
                Need help? Reach out anytime at support@shopease.com. We’ll assist with orders and delivery queries.
              </p>
            </div>
          </div>

          <div className="modern-card rounded-lg p-6 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">What’s new we’re adding</h2>
            <div className="text-gray-600 space-y-2">
              <div>- Address & phone collection during checkout</div>
              <div>- Delivery partner (delivery guy) details on order tracking</div>
              <div>- Better order status timeline</div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
