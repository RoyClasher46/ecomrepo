import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-300 dark:text-gray-300 mt-auto overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary dark:bg-accent flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">S</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">ShopEase</h3>
                <p className="text-xs text-gray-400">Premium Shopping</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your trusted destination for premium products. We deliver quality, style, and satisfaction right to your doorstep.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-primary dark:hover:bg-accent text-gray-300 hover:text-white transition-all flex items-center justify-center backdrop-blur-sm"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-primary dark:hover:bg-accent text-gray-300 hover:text-white transition-all flex items-center justify-center backdrop-blur-sm"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-primary dark:hover:bg-accent text-gray-300 hover:text-white transition-all flex items-center justify-center backdrop-blur-sm"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-primary dark:group-hover:bg-accent transition-colors"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/category/all" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-indigo-400 transition-colors"></span>
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-indigo-400 transition-colors"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-indigo-400 transition-colors"></span>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Customer Service</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-primary dark:group-hover:bg-accent transition-colors"></span>
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-primary dark:group-hover:bg-accent transition-colors"></span>
                  Returns & Exchanges
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-primary dark:group-hover:bg-accent transition-colors"></span>
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-primary dark:group-hover:bg-accent transition-colors"></span>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-primary dark:group-hover:bg-accent transition-colors"></span>
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Contact Us</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-primary dark:group-hover:bg-accent transition-all flex-shrink-0">
                  <Mail className="w-5 h-5 text-gray-300 group-hover:text-white" />
                </div>
                <span className="pt-2 group-hover:text-primary dark:group-hover:text-accent transition-colors">support@shopease.com</span>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-primary dark:group-hover:bg-accent transition-all flex-shrink-0">
                  <Phone className="w-5 h-5 text-gray-300 group-hover:text-white" />
                </div>
                <span className="pt-2 group-hover:text-primary dark:group-hover:text-accent transition-colors">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-primary dark:group-hover:bg-accent transition-all flex-shrink-0">
                  <MapPin className="w-5 h-5 text-gray-300 group-hover:text-white" />
                </div>
                <span className="pt-2 group-hover:text-primary dark:group-hover:text-accent transition-colors">123 Shopping Street, Commerce City, CC 12345</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 flex items-center gap-2">
              Made with <Heart className="w-4 h-4 text-red-400 fill-red-400" /> © {new Date().getFullYear()} ShopEase. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-primary dark:hover:text-accent transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-primary dark:hover:text-accent transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-primary dark:hover:text-accent transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

