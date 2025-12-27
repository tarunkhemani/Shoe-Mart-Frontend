// components/Navbar.jsx
import React, { useState } from 'react';
import { ShoppingCart, User, Menu, Phone } from 'lucide-react'; // Install lucide-react for icons

const Navbar = ({ mode, setMode }) => {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      {/* Top Bar for Trust Signals */}
      <div className="bg-gray-900 text-gray-300 text-xs py-2 px-4 flex justify-between">
        <span>Agra's Trusted Shoe Wholesaler - Since 2003</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Phone size={14} /> +91 98765-XXXXX</span>
          <span className="text-yellow-500 font-bold cursor-pointer hover:underline">Request Sample Kit</span>
        </div>
      </div>

      {/* Main Nav */}
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold tracking-tighter text-gray-800">
          AGRA<span className="text-red-600">SHOES</span>
        </div>

        {/* Mode Switcher (The Core Logic) */}
        <div className="hidden md:flex bg-gray-100 rounded-full p-1">
          <button 
            onClick={() => setMode('retail')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              mode === 'retail' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
            }`}
          >
            Retail Shop
          </button>
          <button 
            onClick={() => setMode('wholesale')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              mode === 'wholesale' ? 'bg-gray-900 text-white shadow' : 'text-gray-500'
            }`}
          >
            Wholesale Portal
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <div className="relative cursor-pointer">
            <ShoppingCart className="text-gray-700" />
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">0</span>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            <User size={18} />
            {mode === 'wholesale' ? 'Distributor Login' : 'Login'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;