import React from "react";
import Navbar from "./navbar";
import Footer from "./Footer";
import FloatingCart from "./FloatingCart";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-primary-dark text-white">
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">About ShopEase</h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Your trusted destination for premium products. We deliver quality, style, and satisfaction right to your doorstep.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 flex-grow">
          {/* Mission Section */}
          <section className="mb-12">
            <div className="modern-card rounded-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                At ShopEase, we're committed to making online shopping effortless and enjoyable. Our mission is to provide 
                a seamless shopping experience with a clean, intuitive interface, fast browsing, and transparent order tracking. 
                We believe everyone deserves access to quality products with exceptional customer service.
              </p>
            </div>
          </section>

          {/* Values Grid */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="modern-card rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality & Value</h3>
                <p className="text-gray-600">
                  We carefully curate products with clear pricing, detailed descriptions, and organized categories 
                  so you can make confident purchasing decisions.
                </p>
              </div>
              
              <div className="modern-card rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast & Reliable</h3>
                <p className="text-gray-600">
                  Experience lightning-fast browsing, quick checkout, and reliable delivery. We ensure your orders 
                  are processed efficiently and tracked transparently.
                </p>
              </div>
              
              <div className="modern-card rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer Support</h3>
                <p className="text-gray-600">
                  Our dedicated support team is here to help with any questions about orders, delivery, or products. 
                  Reach out anytime at <a href="mailto:support@shopease.com" className="text-primary hover:underline">support@shopease.com</a>.
                </p>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What We Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="modern-card rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Easy Shopping Experience</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Intuitive product browsing and search</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Detailed product information and reviews</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Secure checkout process</span>
                  </li>
                </ul>
              </div>
              
              <div className="modern-card rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Order Management</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Real-time order tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Delivery partner details and tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Easy return and exchange process</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="modern-card rounded-lg p-8 bg-gradient-to-r from-primary/10 to-primary-dark/10">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Shopping?</h2>
              <p className="text-gray-600 text-lg mb-6">
                Explore our wide range of products and discover something amazing today.
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  to="/category/all"
                  className="px-6 py-3 rounded-lg modern-button font-semibold"
                >
                  Browse Products
                </Link>
                <Link
                  to="/contact"
                  className="px-6 py-3 rounded-lg modern-button-secondary font-semibold"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </section>
        </div>
        <FloatingCart />
        <Footer />
      </div>
    </>
  );
}
