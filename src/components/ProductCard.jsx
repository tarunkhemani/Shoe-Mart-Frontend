// components/ProductCard.jsx
import React, { useState } from 'react';

const ProductCard = ({ product, mode }) => {
  const [showMatrix, setShowMatrix] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-shadow bg-white">
      {/* Image Section */}
      <div className="relative h-64 bg-gray-100">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
        {mode === 'wholesale' && (
          <span className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
            MOQ: 24 Pairs
          </span>
        )}
      </div>

      {/* Details */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800">{product.name}</h3>
        <p className="text-gray-500 text-sm mb-2">{product.category} • Agra Genuine Leather</p>
        
        <div className="flex justify-between items-end mt-4">
          <div>
            <p className="text-xs text-gray-500">Price per pair</p>
            <p className="text-xl font-bold text-blue-600">
              {mode === 'retail' ? `₹${product.retailPrice}` : `₹${product.wholesalePrice}*`}
            </p>
            {mode === 'wholesale' && <p className="text-[10px] text-red-500">*Excl. GST for bulk</p>}
          </div>

          {mode === 'retail' ? (
            <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800">
              Add to Cart
            </button>
          ) : (
            <button 
              onClick={() => setShowMatrix(!showMatrix)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 shadow-lg shadow-blue-200"
            >
              Bulk Order
            </button>
          )}
        </div>
      </div>

      {/* The "Efficiency" Size Matrix - Only visible in Wholesale Mode */}
      {mode === 'wholesale' && showMatrix && (
        <div className="bg-gray-50 p-4 border-t border-gray-100 animate-fade-in-down">
          <p className="text-xs font-bold text-gray-700 mb-2">ENTER QUANTITY PER SIZE:</p>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[6, 7, 8, 9].map((size) => (
              <div key={size} className="text-center">
                <label className="block text-xs text-gray-500 mb-1">UK {size}</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full border border-gray-300 rounded p-1 text-center text-sm"
                  placeholder="0"
                />
              </div>
            ))}
          </div>
          <button className="w-full bg-green-600 text-white py-2 rounded text-sm font-semibold">
            Add Batch to Cart
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;