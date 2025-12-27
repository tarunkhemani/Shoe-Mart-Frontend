import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, User, Phone, Menu, X, CheckCircle, Truck, 
  ShieldCheck, Info, Package, ArrowRight, Trash2, Filter, 
  Search, ClipboardList, Users, LogOut, Plus, Save,
  ChevronLeft, ChevronRight, Upload, XCircle, FileText, MapPin, Calendar, Edit2
} from 'lucide-react';

// --- API CONNECTOR ---
// const API_URL = 'http://localhost:5000/api';
const API_URL = 'https://shoe-mart-backend-i0qr.onrender.com/api';

const api = {
  request: async (endpoint, method = 'GET', body = null) => {
    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (body) options.body = JSON.stringify(body);
      
      const response = await fetch(`${API_URL}${endpoint}`, options);
      return await response.json();
    } catch (error) {
      console.error("Connection Error:", error);
      return null;
    }
  },

  // Products
  getProducts: () => api.request('/products'),
  saveProduct: (product) => api.request('/products', 'POST', product),
  updateProduct: (product) => api.request(`/products/${product.id}`, 'PUT', product),
  deleteProduct: (id) => api.request(`/products/${id}`, 'DELETE'),

  // Orders
  getOrders: () => api.request('/orders'),
  createOrder: (order) => api.request('/orders', 'POST', order),

  // Auth with Persistence
  login: async (phone, password) => {
    const res = await api.request('/auth/login', 'POST', { phone, password });
    if (res && res.success) {
      localStorage.setItem('agra_user', JSON.stringify(res.user));
    }
    return res;
  },
  signup: async (userData) => {
    const res = await api.request('/auth/signup', 'POST', userData);
    if (res && res.success) {
      localStorage.setItem('agra_user', JSON.stringify(res.user));
    }
    return res;
  },
  logout: () => {
    localStorage.removeItem('agra_user');
  },
  getUser: () => {
    const user = localStorage.getItem('agra_user');
    return user ? JSON.parse(user) : null;
  }
};

const CATEGORIES = ['All', 'Men\'s Formal', 'Office Wear', 'Women\'s Comfort', 'Men\'s Boots', 'Casual', 'School'];

// --- COMPONENT: FEATURES ---
const Features = () => (
  <div className="bg-slate-50 py-12 border-y border-slate-200">
    <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-blue-600"><Truck /></div>
        <h3 className="font-bold text-slate-800 mb-2">Nationwide Delivery</h3>
        <p className="text-sm text-slate-500 px-4">From Agra to anywhere in India. We use trusted B2B logistics partners.</p>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-amber-500"><ShieldCheck /></div>
        <h3 className="font-bold text-slate-800 mb-2">Quality Guarantee</h3>
        <p className="text-sm text-slate-500 px-4">Every pair is inspected before packing. 20 years of reputation at stake.</p>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-red-600"><Info /></div>
        <h3 className="font-bold text-slate-800 mb-2">Direct Support</h3>
        <p className="text-sm text-slate-500 px-4">Call us anytime. We believe in building relationships, not just sales.</p>
      </div>
    </div>
  </div>
);

// --- COMPONENT: PRODUCT CARD (RICH VERSION) ---
const ProductCard = ({ product, mode, onAddToCart }) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [showMatrix, setShowMatrix] = useState(false);
  
  // Robust data handling
  const sizes = product.sizes || [];
  const images = product.images && product.images.length > 0 ? product.images : ['https://via.placeholder.com/300?text=No+Image'];
  
  const [quantities, setQuantities] = useState(
    sizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {})
  );
  
  const totalPairs = Object.values(quantities).reduce((a, b) => a + Number(b), 0);
  const price = mode === 'retail' ? Number(product.retailPrice) : Number(product.wholesalePrice);
  const matrixTotalCost = totalPairs * price;

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleWholesaleAdd = () => {
    if (totalPairs < product.moq) {
      alert(`Minimum Order Quantity is ${product.moq} pairs.`);
      return;
    }
    onAddToCart({
      ...product,
      type: 'wholesale',
      breakdown: quantities,
      quantity: totalPairs,
      price: product.wholesalePrice,
      image: images[0]
    });
    setQuantities(sizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {}));
    setShowMatrix(false);
  };

  const handleRetailAdd = () => {
    onAddToCart({
      ...product,
      type: 'retail',
      quantity: 1,
      price: product.retailPrice,
      image: images[0]
    });
  };

  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Image Carousel Section */}
      <div className="relative h-64 bg-slate-100 group">
        <img 
          src={images[currentImgIndex]} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500" 
        />
        
        {/* Tags */}
        {product.tag && <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] uppercase font-bold px-2 py-1 rounded backdrop-blur-sm z-10">{product.tag}</span>}
        {mode === 'wholesale' && <span className="absolute top-2 left-2 bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">MOQ: {product.moq}</span>}

        {/* Carousel Controls */}
        {images.length > 1 && (
          <>
            <button 
              onClick={prevImage} 
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full text-slate-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={nextImage} 
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full text-slate-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={20} />
            </button>
            
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
              {images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImgIndex ? 'bg-white scale-125' : 'bg-white/50'}`} 
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Details Section */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <span className="text-xs text-slate-500 uppercase tracking-wide">{product.category}</span>
          <h3 className="text-lg font-bold text-slate-800 leading-tight">{product.name}</h3>
        </div>
        
        <div className="mt-auto pt-4 border-t border-slate-100">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Price per pair</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900">₹{price}</span>
                {mode === 'retail' && <span className="text-xs text-red-500 line-through">₹{Math.floor(price * 1.2)}</span>}
              </div>
              {mode === 'wholesale' && <p className="text-[10px] text-red-600 font-medium">*Excl. GST</p>}
            </div>
            
            {mode === 'retail' ? (
              <button onClick={handleRetailAdd} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-200">Add</button>
            ) : (
              <button onClick={() => setShowMatrix(!showMatrix)} className={`px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg ${showMatrix ? 'bg-slate-200 text-slate-800' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}>{showMatrix ? 'Close' : 'Bulk'}</button>
            )}
          </div>

          {mode === 'wholesale' && showMatrix && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] font-bold text-slate-500">SELECT SIZES</span>
              </div>
              <div className="grid grid-cols-5 gap-1 mb-3">
                {sizes.map((size) => (
                  <div key={size} className="text-center">
                    <label className="block text-[10px] text-slate-500">UK {size}</label>
                    <input type="number" min="0" value={quantities[size] || ''} onChange={(e) => setQuantities(prev => ({...prev, [size]: e.target.value}))} className="w-full border border-slate-300 rounded p-1 text-center text-xs" placeholder="0" />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs mb-2">
                <span>Pairs: <strong>{totalPairs}</strong></span>
                <span>Total: <strong className="text-blue-600">₹{matrixTotalCost}</strong></span>
              </div>
              <button onClick={handleWholesaleAdd} disabled={totalPairs === 0} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white py-1.5 rounded text-xs font-bold uppercase">Add Batch</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: ADMIN PRODUCT FORM (RICH VERSION) ---
const ProductForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState(initialData ? {
    ...initialData,
    sizes: initialData.sizes.join(',') 
  } : {
    name: '', category: 'Men\'s Formal', retailPrice: '', wholesalePrice: '', 
    moq: 24, stock: 100, sizes: '6,7,8,9,10', tag: '', 
    images: [] 
  });
  
  const [urlInput, setUrlInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }
    const productToSave = {
      ...formData,
      retailPrice: Number(formData.retailPrice),
      wholesalePrice: Number(formData.wholesalePrice),
      moq: Number(formData.moq),
      stock: Number(formData.stock),
      sizes: typeof formData.sizes === 'string' ? formData.sizes.split(',').map(s => Number(s.trim())) : formData.sizes
    };
    onSave(productToSave);
  };

  // Convert File to Base64 for sending to Node Backend
  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, images: [...prev.images, reader.result] }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAddUrl = () => {
    if(urlInput) {
      setFormData(prev => ({...prev, images: [...prev.images, urlInput]}));
      setUrlInput('');
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== indexToRemove) }));
  };

  const fillRandomImage = () => {
    const urls = [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=800',
      'https://images.unsplash.com/photo-1560769629-975e13f0c470?q=80&w=800'
    ];
    setFormData(prev => ({...prev, images: [...prev.images, urls[Math.floor(Math.random() * urls.length)]]}));
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg mb-8 animate-in fade-in slide-in-from-bottom-4">
      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        {initialData ? <Edit2 className="text-blue-600" /> : <Plus className="text-green-600" />} 
        {initialData ? 'Edit Product' : 'Add New Product'}
      </h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Form Fields */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Product Name</label>
          <input required type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-slate-900 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Leather Oxford Pro" />
        </div>
        <div>
           <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Category</label>
           <select className="w-full border p-2 rounded outline-none bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
             {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
           </select>
        </div>
        <div>
           <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Sizes (Comma Sep)</label>
           <input required type="text" className="w-full border p-2 rounded outline-none" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} placeholder="6, 7, 8, 11, 12" />
        </div>
        <div className="grid grid-cols-2 gap-2">
           <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Retail Price (₹)</label><input required type="number" className="w-full border p-2 rounded outline-none" value={formData.retailPrice} onChange={e => setFormData({...formData, retailPrice: e.target.value})} /></div>
           <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Wholesale Price (₹)</label><input required type="number" className="w-full border p-2 rounded outline-none" value={formData.wholesalePrice} onChange={e => setFormData({...formData, wholesalePrice: e.target.value})} /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
           <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Min Order Qty</label><input required type="number" className="w-full border p-2 rounded outline-none" value={formData.moq} onChange={e => setFormData({...formData, moq: e.target.value})} /></div>
           <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Stock Qty</label><input required type="number" className="w-full border p-2 rounded outline-none" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} /></div>
        </div>
        <div className="md:col-span-2">
           <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Tag / Status</label>
           <input type="text" className="w-full border p-2 rounded outline-none" value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})} placeholder="Out of Stock / Best Seller" />
        </div>
        
        {/* IMAGE UPLOAD SECTION */}
        <div className="md:col-span-2">
           <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Product Images</label>
           
           {/* File Upload */}
           <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition cursor-pointer relative mb-3">
             <input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
             />
             <Upload className="mx-auto text-slate-400 mb-2" />
             <p className="text-sm text-slate-500 font-medium">Click to select images from device</p>
             <p className="text-[10px] text-slate-400">(Images are converted to Base64 for the backend)</p>
           </div>

           {/* URL Input */}
           <div className="flex gap-2 mb-3">
             <input type="text" placeholder="Or paste Image URL here..." className="flex-1 border p-2 rounded text-sm outline-none" value={urlInput} onChange={e => setUrlInput(e.target.value)} />
             <button type="button" onClick={handleAddUrl} className="bg-slate-200 px-3 rounded font-bold text-sm hover:bg-slate-300">Add URL</button>
             <button type="button" onClick={fillRandomImage} className="bg-blue-100 text-blue-700 px-3 rounded font-bold text-sm hover:bg-blue-200">Random</button>
           </div>

           {/* Preview Strip */}
           {formData.images.length > 0 && (
             <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
               {formData.images.map((img, idx) => (
                 <div key={idx} className="relative shrink-0 w-20 h-20 group">
                   <img src={img} alt="Preview" className="w-full h-full object-cover rounded-lg border border-slate-200" />
                   <button type="button" onClick={() => removeImage(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600"><X size={12} /></button>
                 </div>
               ))}
             </div>
           )}
        </div>

        <div className="md:col-span-2 flex gap-3 mt-2">
          <button type="button" onClick={onCancel} className="flex-1 py-2 border border-slate-300 rounded text-slate-600 font-bold hover:bg-slate-50">Cancel</button>
          <button type="submit" className="flex-1 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 flex justify-center items-center gap-2">
            <Save size={18}/> {initialData ? 'Update Product' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

// --- COMPONENT: ORDER MODAL (RICH VERSION) ---
const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="text-blue-600" size={20} /> Order #{order.id}
            </h3>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              <Calendar size={14} /> {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition">
            <XCircle size={28} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
              <h4 className="text-xs font-bold text-blue-800 uppercase mb-3 flex items-center gap-2"><User size={14}/> Customer Information</h4>
              <div className="space-y-2 text-sm text-slate-700">
                <p><span className="font-semibold text-slate-900">Name:</span> {order.customer.name}</p>
                <p className="flex items-start gap-2"><span className="font-semibold text-slate-900 whitespace-nowrap">Phone:</span> {order.customer.phone}</p>
                {/* FIXED: Added safety check for order.type */}
                <p><span className="font-semibold text-slate-900">Type:</span> <span className={`px-2 py-0.5 rounded text-xs font-bold ${order.type === 'wholesale' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{(order.type || 'Retail').toUpperCase()}</span></p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="text-xs font-bold text-slate-600 uppercase mb-3 flex items-center gap-2"><MapPin size={14}/> Delivery Address</h4>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{order.customer.address}</p>
            </div>
          </div>

          <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Package size={16}/> Order Items</h4>
          <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3 text-center">Type</th>
                  <th className="p-3">Breakdown</th>
                  <th className="p-3 text-right">Price</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt="" className="w-10 h-10 rounded object-cover bg-slate-100 border" />
                        <span className="font-medium text-slate-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                       {item.type === 'wholesale' 
                         ? <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">BULK</span> 
                         : <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">RETAIL</span>
                       }
                    </td>
                    <td className="p-3">
                      {item.type === 'wholesale' ? (
                        <div className="grid grid-cols-4 gap-1 w-max">
                          {Object.entries(item.breakdown).map(([size, qty]) => Number(qty) > 0 && (
                            <div key={size} className="text-[10px] bg-white border rounded px-1 text-slate-500 whitespace-nowrap">
                              UK{size}: <span className="font-bold text-slate-900">{qty}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs">1 Pair (Standard)</span>
                      )}
                    </td>
                    <td className="p-3 text-right text-slate-600">₹{item.price}</td>
                    <td className="p-3 text-right font-bold text-slate-900">₹{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-full md:w-64 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Subtotal</span>
                <span>₹{Math.floor(order.total / (order.type === 'wholesale' ? 1.12 : 1)) }</span>
              </div>
              {order.type === 'wholesale' && (
                <div className="flex justify-between text-sm text-slate-600 mb-2">
                  <span>GST (12%)</span>
                  <span>₹{Math.floor(order.total - (order.total / 1.12))}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg text-slate-900 pt-3 border-t border-slate-200">
                <span>Total</span>
                <span>₹{Math.round(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-bold hover:bg-white transition">Close</button>
          <button onClick={() => alert("Printing Feature would go here.")} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 flex items-center gap-2 transition"><ClipboardList size={18}/> Process Order</button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: ADMIN DASHBOARD (RICH VERSION) ---
const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('orders');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      const p = await api.getProducts();
      setProducts(p || []);
      const o = await api.getOrders();
      setOrders(o || []);
    } catch (e) { console.error(e); }
  };

  const handleSaveProduct = async (product) => {
    if (editingProduct) {
      await api.updateProduct(product);
      setEditingProduct(null);
    } else {
      await api.saveProduct(product);
      setShowAddForm(false);
    }
    refreshData();
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setActiveTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Delete product?")) {
      await api.deleteProduct(id);
      refreshData();
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const revenue = orders.reduce((acc, o) => acc + o.total, 0);

  return (
    <div className="container mx-auto px-4 py-8 bg-slate-50 min-h-screen">
      {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
      
      <div className="flex justify-between items-center mb-8">
        <div><h2 className="text-2xl font-bold text-slate-900">Owner Dashboard</h2><p className="text-slate-500 text-sm">Manage Inventory & Orders</p></div>
        <button onClick={onLogout} className="flex items-center gap-2 text-red-600 font-bold border border-red-200 bg-white px-4 py-2 rounded hover:bg-red-50"><LogOut size={18}/> Logout</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4"><div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><ClipboardList /></div><div><p className="text-slate-500 text-sm">Total Orders</p><h3 className="text-2xl font-bold text-slate-900">{orders.length}</h3></div></div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4"><div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><Package /></div><div><p className="text-slate-500 text-sm">Pending</p><h3 className="text-2xl font-bold text-slate-900">{pendingOrders}</h3></div></div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4"><div className="p-3 bg-green-100 text-green-600 rounded-lg"><Users /></div><div><p className="text-slate-500 text-sm">Revenue (Est)</p><h3 className="text-2xl font-bold text-slate-900">₹{revenue.toLocaleString()}</h3></div></div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 mb-6">
        <button onClick={() => setActiveTab('orders')} className={`pb-3 px-4 font-bold text-sm ${activeTab === 'orders' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500'}`}>Incoming Orders</button>
        <button onClick={() => setActiveTab('products')} className={`pb-3 px-4 font-bold text-sm ${activeTab === 'products' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500'}`}>Manage Products ({products.length})</button>
      </div>

      {activeTab === 'orders' ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500"><tr><th className="p-4">ID</th><th className="p-4">Customer</th><th className="p-4">Type</th><th className="p-4">Total</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? <tr><td colSpan="6" className="p-8 text-center text-slate-400">No orders yet.</td></tr> : orders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                  <td className="p-4 font-mono text-xs">{order.id}</td>
                  <td className="p-4 font-bold">{order.customer.name}<div className="text-xs font-normal text-slate-500">{order.customer.phone}</div></td>
                  <td className="p-4 font-bold">₹{Math.round(order.total)}</td>
                  <td className="p-4"><span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold">{order.status}</span></td>
                  <td className="p-4"><button className="text-blue-600 border border-blue-200 px-3 py-1 rounded hover:bg-blue-50 text-xs font-bold">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Inventory</h3>
            {!showAddForm && !editingProduct && <button onClick={() => setShowAddForm(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-800"><Plus size={18}/> Add Product</button>}
          </div>
          
          {(showAddForm || editingProduct) && (
            <ProductForm initialData={editingProduct} onSave={handleSaveProduct} onCancel={() => { setShowAddForm(false); setEditingProduct(null); }} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 shadow-sm hover:shadow-md transition">
                <img src={p.images[0]} className="w-24 h-24 object-cover rounded-lg bg-slate-100" alt={p.name} />
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900">{p.name}</h4>
                  <div className="text-xs text-slate-500 mb-2">{p.category}</div>
                  <div className="flex gap-3 text-sm mb-2">
                    <div><span className="text-[10px] uppercase text-slate-400 block">Retail</span><b>₹{p.retailPrice}</b></div>
                    <div><span className="text-[10px] uppercase text-slate-400 block">Wholesale</span><b className="text-blue-600">₹{p.wholesalePrice}</b></div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleEditClick(p)} className="flex-1 bg-blue-50 text-blue-600 text-xs font-bold py-1.5 rounded hover:bg-blue-100 flex items-center justify-center gap-1"><Edit2 size={12}/> Edit</button>
                    <button onClick={() => handleDeleteProduct(p.id)} className="flex-1 bg-red-50 text-red-600 text-xs font-bold py-1.5 rounded hover:bg-red-100 flex items-center justify-center gap-1"><Trash2 size={12}/> Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- COMPONENT: SHOP VIEW ---
const ShopView = ({ products, mode, onAddToCart }) => {
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredProducts = products.filter(p => {
    const matchesCategory = filter === 'All' || p.category === filter;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">{mode === 'wholesale' ? 'Wholesale Catalog' : 'Shop Collection'}</h2>
          <p className="text-slate-500 text-sm mt-1">{mode === 'wholesale' ? 'Bulk pricing applied. MOQ rules active.' : 'Latest trends from Agra.'}</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="Search shoes..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4">
        <Filter size={18} className="text-slate-400 shrink-0" />
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${filter === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {cat}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 text-slate-400">No products found matching your search.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} mode={mode} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}
    </div>
  );
};

// --- COMPONENT: HOME VIEW ---
const HomeView = ({ setView, mode }) => (
  <>
    <div className="bg-white border-b border-slate-200">
      <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold mb-6">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            {mode === 'wholesale' ? 'ACCEPTING NEW DISTRIBUTORS' : 'SEASONAL SALE IS LIVE'}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
            {mode === 'wholesale' ? <>Factory Direct.<br /><span className="text-blue-600">Maximize Margins.</span></> : <>Handcrafted in Agra.<br /><span className="text-red-600">Worn Everywhere.</span></>}
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
            {mode === 'wholesale' ? 'Connect directly with our 20-year-old manufacturing unit. Get transparent pricing, bulk shipping support, and custom branding options.' : 'Discover the finest leather shoes directly from the shoe capital of India. Premium quality, honest prices, delivered to your doorstep.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button onClick={() => setView('shop')} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2">
              {mode === 'wholesale' ? 'View Catalog' : 'Shop Collection'} <ArrowRight size={18} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 w-full max-w-md md:max-w-full">
           <div className="relative">
             <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-amber-50 rounded-2xl transform rotate-3"></div>
             <img 
               src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop" 
               alt="Shoe Craftsmanship" 
               className="relative rounded-2xl shadow-2xl w-full h-auto object-cover transform -rotate-2 hover:rotate-0 transition duration-700"
             />
             {mode === 'wholesale' && (
               <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3">
                 <div className="bg-green-100 p-2 rounded-full text-green-600"><CheckCircle size={24} /></div>
                 <div>
                   <p className="text-sm font-bold text-slate-800">Verified Manufacturer</p>
                   <p className="text-xs text-slate-500">GST Registered • IEC License</p>
                 </div>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
    <Features />
  </>
);

// --- COMPONENT: CART VIEW ---
const CartView = ({ cart, mode, removeFromCart, setView }) => {
  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalGST = mode === 'wholesale' ? totalAmount * 0.12 : 0; // 12% GST for wholesale
  const finalTotal = totalAmount + totalGST;

  if (cart.length === 0) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <ShoppingCart size={64} className="mx-auto text-slate-200 mb-4" />
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
      <button onClick={() => setView('shop')} className="text-blue-600 font-medium hover:underline">Start Shopping</button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-8">Shopping Cart ({cart.length} items)</h2>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {cart.map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl flex gap-4">
              <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg bg-slate-100" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900">{item.name}</h3>
                    <p className="text-sm text-slate-500">{item.category}</p>
                  </div>
                  <button onClick={() => removeFromCart(idx)} className="text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                </div>
                
                {item.type === 'wholesale' ? (
                   <div className="mt-2 bg-slate-50 p-2 rounded text-xs text-slate-600 grid grid-cols-5 gap-2">
                     {Object.entries(item.breakdown).map(([size, qty]) => Number(qty) > 0 && (
                       <div key={size} className="text-center bg-white border border-slate-200 rounded px-1">
                         <span className="block text-[10px] text-slate-400">UK {size}</span>
                         <span className="font-bold">{qty}</span>
                       </div>
                     ))}
                   </div>
                ) : (
                  <div className="mt-2 text-sm text-slate-600">Qty: {item.quantity} Pair</div>
                )}
                
                <div className="mt-3 flex justify-between items-center">
                   <div className="text-xs text-slate-500">{item.quantity} pairs x ₹{item.price}</div>
                   <div className="font-bold text-slate-900">₹{item.quantity * item.price}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full lg:w-96">
          <div className="bg-white border border-slate-200 p-6 rounded-xl sticky top-24 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Order Summary</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹{totalAmount}</span></div>
              {mode === 'wholesale' && (
                <div className="flex justify-between text-slate-600"><span>GST (12%)</span><span>₹{totalGST.toFixed(0)}</span></div>
              )}
              <div className="flex justify-between text-slate-600"><span>Shipping</span><span>{mode === 'wholesale' ? 'To be calculated' : 'Free'}</span></div>
              <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-lg text-slate-900">
                <span>Total</span><span>₹{finalTotal.toFixed(0)}</span>
              </div>
            </div>
            <button onClick={() => setView('checkout')} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg">
              Proceed to Checkout
            </button>
            <p className="text-xs text-slate-400 text-center mt-3">Secure Checkout via Agra Shoe Mart</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: CHECKOUT VIEW ---
const CheckoutView = ({ cart, mode, placeOrder, setView }) => {
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    placeOrder(form);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <button onClick={() => setView('cart')} className="text-sm text-slate-500 hover:text-slate-900 mb-6">← Back to Cart</button>
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">{mode === 'wholesale' ? 'Request Bulk Quote' : 'Checkout'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name / Shop Name</label>
            <input required type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number (WhatsApp)</label>
            <input required type="tel" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Address</label>
            <textarea required rows="3" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.address} onChange={e => setForm({...form, address: e.target.value})}></textarea>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
            {mode === 'wholesale' 
              ? "Note: This is a quote request. Our sales team will contact you on WhatsApp to confirm availability and shipping costs before payment."
              : "Note: Cash on Delivery is available for Agra. Online payment link will be sent for other cities."
            }
          </div>

          <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-md">
            {mode === 'wholesale' ? 'Submit Quote Request' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- COMPONENT: LOGIN VIEW ---
const LoginView = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Admin Backdoor
    if (form.phone === 'admin' || form.phone === 'admin@agra.com') {
        const res = await api.login(form.phone, form.password);
        if(res && res.success) onLoginSuccess({ ...res.user, role: 'admin' });
        return;
    }

    if (isRegistering) {
      if (!form.name || !form.phone || !form.password) return setError("All fields required");
      const res = await api.signup(form);
      if (res && res.success) onLoginSuccess(res.user);
      else setError(res?.message || "Registration failed");
    } else {
      if (!form.phone || !form.password) return setError("Enter credentials");
      const res = await api.login(form.phone, form.password);
      if (res && res.success) onLoginSuccess(res.user);
      else setError(res?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-xl shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg"><Package size={32}/></div>
          <h2 className="text-2xl font-bold text-slate-900">{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="text-slate-500 mt-2">{isRegistering ? 'Join the largest wholesale network in Agra' : 'Enter mobile to access wholesale rates'}</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4 text-center border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-bold text-slate-700 mb-1">Full Name / Shop Name</label>
              <input type="text" className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition" placeholder="Agra Footwear Co." value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Mobile Number</label>
            <input type="tel" className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition" placeholder="98765XXXXX" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
            <input type="password" className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg transform hover:-translate-y-0.5">
            {isRegistering ? 'Register Now' : 'Login Securely'}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-slate-100">
          <p className="text-slate-500 text-sm mb-2">{isRegistering ? 'Already have an account?' : 'New to Agra Shoe Mart?'}</p>
          <button onClick={() => setIsRegistering(!isRegistering)} className="text-blue-600 font-bold hover:underline text-sm">
            {isRegistering ? 'Login Instead' : 'Create New Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN CONTROLLER ---
const App = () => {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('retail'); 
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Restore user
    const savedUser = api.getUser();
    if (savedUser) {
        setUser(savedUser);
        if(savedUser.role === 'admin') setView('admin');
        else setMode('wholesale');
    }

    const fetchProds = async () => {
      const res = await api.getProducts();
      setProducts(res || []);
    };
    fetchProds();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.role === 'admin') setView('admin');
    else {
      setMode('wholesale');
      setView('shop');
    }
  };

  const handleLogout = () => {
    if (window.confirm("Logout?")) {
      api.logout();
      setUser(null);
      setMode('retail');
      setView('home');
    }
  };

  const addToCart = (item) => {
    if (!user) return alert("Please Login to Shop");
    setCart([...cart, item]);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const placeOrder = async (details) => {
    const total = cart.reduce((a, b) => a + (b.price * b.quantity), 0);
    // Add type: mode here
    await api.createOrder({ customer: details, items: cart, total, type: mode });
    setCart([]);
    setView('success');
  };

  if (view === 'admin') return <AdminDashboard onLogout={handleLogout} />;
  if (view === 'login') return <LoginView onLoginSuccess={handleLogin} />;
  
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 flex justify-between items-center">
          <span className="hidden sm:inline">Agra's Trusted Shoe Wholesaler - Since 2003</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 hover:text-white cursor-pointer transition">
              <Phone size={14} /> +91 98765-XXXXX
            </span>
            <span className="text-amber-500 font-bold cursor-pointer hover:underline hidden sm:block">
              Request Sample Kit
            </span>
          </div>
        </div>

        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div onClick={() => setView('home')} className="flex items-center gap-2 cursor-pointer">
              <div className="bg-red-600 text-white p-1 rounded font-bold text-xl">ASM</div>
              <div className="text-2xl font-bold tracking-tighter text-slate-800 leading-none">
                AGRA<span className="text-red-600">SHOES</span>
              </div>
            </div>

            <div className="hidden md:flex gap-8 font-medium text-slate-600 text-sm">
              <button onClick={() => setView('home')} className="hover:text-red-600 transition">Home</button>
              <button onClick={() => setView('shop')} className="hover:text-red-600 transition">Shop Catalog</button>
              <button onClick={() => setView('shop')} className="hover:text-red-600 transition">New Arrivals</button>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex bg-slate-100 rounded-full p-1 border border-slate-200 mr-2">
                <button onClick={() => setMode('retail')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${mode === 'retail' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Retail</button>
                <button onClick={() => setMode('wholesale')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${mode === 'wholesale' ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}>Wholesale</button>
              </div>

              <button onClick={() => setView('cart')} className="relative p-2 hover:bg-slate-100 rounded-full transition group">
                <ShoppingCart size={22} className="text-slate-700 group-hover:text-red-600" />
                {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">{cart.length}</span>}
              </button>
              
              {user ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => user.type === 'admin' ? setView('admin') : setView('home')} className="flex items-center gap-2 font-bold text-sm bg-slate-100 px-3 py-2 rounded-lg hover:bg-slate-200 transition">
                    <User size={18}/> <span className="hidden sm:inline">{user.name}</span>
                  </button>
                  <button onClick={handleLogout} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition shadow-sm" title="Logout">
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <button onClick={() => setView('login')} className="hidden sm:flex bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm">Login</button>
              )}

              <button className="md:hidden text-slate-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  {isMobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4">
                <div className="flex bg-slate-100 rounded-lg p-1 mb-4">
                <button onClick={() => { setMode('retail'); setIsMobileMenuOpen(false); }} className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === 'retail' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Retail</button>
                <button onClick={() => { setMode('wholesale'); setIsMobileMenuOpen(false); }} className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === 'wholesale' ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}>Wholesale</button>
              </div>
              <div className="space-y-3 text-slate-700 font-medium">
                <button onClick={() => { setView('home'); setIsMobileMenuOpen(false); }} className="block w-full text-left hover:text-red-600">Home</button>
                <button onClick={() => { setView('shop'); setIsMobileMenuOpen(false); }} className="block w-full text-left hover:text-red-600">Shop Catalog</button>
                <button onClick={() => { setView('login'); setIsMobileMenuOpen(false); }} className="block w-full text-left text-blue-600">Login / Register</button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1">
        {view === 'home' && <HomeView setView={setView} mode={mode} />}
        {view === 'shop' && <ShopView products={products} mode={mode} onAddToCart={addToCart} />}
        {view === 'cart' && <CartView cart={cart} mode={mode} removeFromCart={removeFromCart} setView={setView} />}
        {view === 'checkout' && <CheckoutView cart={cart} mode={mode} placeOrder={placeOrder} setView={setView} />}
        {view === 'success' && (
          <div className="text-center py-20">
            <CheckCircle size={64} className="mx-auto text-green-500 mb-4"/>
            <h2 className="text-3xl font-bold">Order Received!</h2>
            <button onClick={() => setView('home')} className="mt-4 text-blue-600 font-bold">Back Home</button>
          </div>
        )}
      </main>
      
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-black text-white px-6 py-3 rounded shadow-lg flex gap-2 animate-bounce">
          <CheckCircle size={20} className="text-green-400"/> Added to Cart
        </div>
      )}
      
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          <div>
            <h4 className="text-white font-bold text-lg mb-4">AGRA SHOES</h4>
            <p className="mb-4">Digitizing the legacy of Agra's shoemaking. We connect manufacturers directly to retailers across India.</p>
            <p>Agra, Uttar Pradesh, India - 282002</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Shop</h4>
            <ul className="space-y-2">
              <li className="hover:text-white cursor-pointer">Men's Formal</li>
              <li className="hover:text-white cursor-pointer">Casual Loafers</li>
              <li className="hover:text-white cursor-pointer">Safety Shoes</li>
              <li className="hover:text-white cursor-pointer">School Shoes</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Wholesale</h4>
            <ul className="space-y-2">
              <li className="hover:text-white cursor-pointer">Register as Distributor</li>
              <li className="hover:text-white cursor-pointer">Bulk Pricing Policy</li>
              <li className="hover:text-white cursor-pointer">Shipping & Logistics</li>
              <li className="hover:text-white cursor-pointer">Return Policy</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Stay Connected</h4>
            <p className="mb-4">Get latest design updates on WhatsApp.</p>
            <div className="flex gap-2">
              <input type="text" placeholder="+91 Mobile Number" className="bg-slate-800 border-none rounded px-3 py-2 w-full text-white outline-none focus:ring-1 focus:ring-slate-600" />
              <button className="bg-green-600 text-white px-3 py-2 rounded font-bold hover:bg-green-700">Join</button>
            </div>
          </div>
        </div>
        <div className="text-center mt-12 pt-8 border-t border-slate-800">
          &copy; 2025 Agra Wholesale Shoe Mart. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;
// import React, { useState, useEffect } from 'react';
// import { 
//   ShoppingCart, User, Phone, Menu, X, CheckCircle, Truck, 
//   ShieldCheck, Info, Package, ArrowRight, Trash2, Filter, 
//   Search, ClipboardList, Users, LogOut, Plus, Save,
//   ChevronLeft, ChevronRight, Upload, XCircle, FileText, MapPin, Calendar, Edit2
// } from 'lucide-react';

// // --- API CONNECTOR ---
// const API_URL = 'http://localhost:5000/api';

// const api = {
//   request: async (endpoint, method = 'GET', body = null) => {
//     try {
//       const options = {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//       };
//       if (body) options.body = JSON.stringify(body);
      
//       const response = await fetch(`${API_URL}${endpoint}`, options);
//       return await response.json();
//     } catch (error) {
//       console.error("Connection Error:", error);
//       return null;
//     }
//   },

//   // Products
//   getProducts: () => api.request('/products'),
//   saveProduct: (product) => api.request('/products', 'POST', product),
//   updateProduct: (product) => api.request(`/products/${product.id}`, 'PUT', product),
//   deleteProduct: (id) => api.request(`/products/${id}`, 'DELETE'),

//   // Orders
//   getOrders: () => api.request('/orders'),
//   createOrder: (order) => api.request('/orders', 'POST', order),

//   // Auth
//   login: (phone, password) => api.request('/auth/login', 'POST', { phone, password }),
//   signup: (userData) => api.request('/auth/signup', 'POST', userData),
// };

// const CATEGORIES = ['All', 'Men\'s Formal', 'Office Wear', 'Women\'s Comfort', 'Men\'s Boots', 'Casual', 'School'];

// // --- COMPONENT: FEATURES ---
// const Features = () => (
//   <div className="bg-slate-50 py-12 border-y border-slate-200">
//     <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-blue-600"><Truck /></div>
//         <h3 className="font-bold text-slate-800 mb-2">Nationwide Delivery</h3>
//         <p className="text-sm text-slate-500 px-4">From Agra to anywhere in India. We use trusted B2B logistics partners.</p>
//       </div>
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-amber-500"><ShieldCheck /></div>
//         <h3 className="font-bold text-slate-800 mb-2">Quality Guarantee</h3>
//         <p className="text-sm text-slate-500 px-4">Every pair is inspected before packing. 20 years of reputation at stake.</p>
//       </div>
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-red-600"><Info /></div>
//         <h3 className="font-bold text-slate-800 mb-2">Direct Support</h3>
//         <p className="text-sm text-slate-500 px-4">Call us anytime. We believe in building relationships, not just sales.</p>
//       </div>
//     </div>
//   </div>
// );

// // --- COMPONENT: PRODUCT CARD (RICH VERSION) ---
// const ProductCard = ({ product, mode, onAddToCart }) => {
//   const [currentImgIndex, setCurrentImgIndex] = useState(0);
//   const [showMatrix, setShowMatrix] = useState(false);
  
//   // Robust data handling
//   const sizes = product.sizes || [];
//   const images = product.images && product.images.length > 0 ? product.images : ['https://via.placeholder.com/300?text=No+Image'];
  
//   const [quantities, setQuantities] = useState(
//     sizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {})
//   );
  
//   const totalPairs = Object.values(quantities).reduce((a, b) => a + Number(b), 0);
//   const price = mode === 'retail' ? Number(product.retailPrice) : Number(product.wholesalePrice);
//   const matrixTotalCost = totalPairs * price;

//   const nextImage = (e) => {
//     e.stopPropagation();
//     setCurrentImgIndex((prev) => (prev + 1) % images.length);
//   };

//   const prevImage = (e) => {
//     e.stopPropagation();
//     setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
//   };

//   const handleWholesaleAdd = () => {
//     if (totalPairs < product.moq) {
//       alert(`Minimum Order Quantity is ${product.moq} pairs.`);
//       return;
//     }
//     onAddToCart({
//       ...product,
//       type: 'wholesale',
//       breakdown: quantities,
//       quantity: totalPairs,
//       price: product.wholesalePrice,
//       image: images[0]
//     });
//     setQuantities(sizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {}));
//     setShowMatrix(false);
//   };

//   const handleRetailAdd = () => {
//     onAddToCart({
//       ...product,
//       type: 'retail',
//       quantity: 1,
//       price: product.retailPrice,
//       image: images[0]
//     });
//   };

//   return (
//     <div className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
//       {/* Image Carousel Section */}
//       <div className="relative h-64 bg-slate-100 group">
//         <img 
//           src={images[currentImgIndex]} 
//           alt={product.name} 
//           className="w-full h-full object-cover transition-transform duration-500" 
//         />
        
//         {/* Tags */}
//         {product.tag && <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] uppercase font-bold px-2 py-1 rounded backdrop-blur-sm z-10">{product.tag}</span>}
//         {mode === 'wholesale' && <span className="absolute top-2 left-2 bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">MOQ: {product.moq}</span>}

//         {/* Carousel Controls */}
//         {images.length > 1 && (
//           <>
//             <button 
//               onClick={prevImage} 
//               className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full text-slate-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
//             >
//               <ChevronLeft size={20} />
//             </button>
//             <button 
//               onClick={nextImage} 
//               className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full text-slate-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
//             >
//               <ChevronRight size={20} />
//             </button>
            
//             <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
//               {images.map((_, idx) => (
//                 <div 
//                   key={idx} 
//                   className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImgIndex ? 'bg-white scale-125' : 'bg-white/50'}`} 
//                 />
//               ))}
//             </div>
//           </>
//         )}
//       </div>

//       {/* Details Section */}
//       <div className="p-4 flex-1 flex flex-col">
//         <div className="mb-2">
//           <span className="text-xs text-slate-500 uppercase tracking-wide">{product.category}</span>
//           <h3 className="text-lg font-bold text-slate-800 leading-tight">{product.name}</h3>
//         </div>
        
//         <div className="mt-auto pt-4 border-t border-slate-100">
//           <div className="flex justify-between items-end mb-4">
//             <div>
//               <p className="text-xs text-slate-500 mb-0.5">Price per pair</p>
//               <div className="flex items-baseline gap-2">
//                 <span className="text-xl font-bold text-slate-900">₹{price}</span>
//                 {mode === 'retail' && <span className="text-xs text-red-500 line-through">₹{Math.floor(price * 1.2)}</span>}
//               </div>
//               {mode === 'wholesale' && <p className="text-[10px] text-red-600 font-medium">*Excl. GST</p>}
//             </div>
            
//             {mode === 'retail' ? (
//               <button onClick={handleRetailAdd} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-200">Add</button>
//             ) : (
//               <button onClick={() => setShowMatrix(!showMatrix)} className={`px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg ${showMatrix ? 'bg-slate-200 text-slate-800' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}>{showMatrix ? 'Close' : 'Bulk'}</button>
//             )}
//           </div>

//           {mode === 'wholesale' && showMatrix && (
//             <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2">
//               <div className="flex justify-between items-center mb-2">
//                  <span className="text-[10px] font-bold text-slate-500">SELECT SIZES</span>
//               </div>
//               <div className="grid grid-cols-5 gap-1 mb-3">
//                 {sizes.map((size) => (
//                   <div key={size} className="text-center">
//                     <label className="block text-[10px] text-slate-500">UK {size}</label>
//                     <input type="number" min="0" value={quantities[size] || ''} onChange={(e) => setQuantities(prev => ({...prev, [size]: e.target.value}))} className="w-full border border-slate-300 rounded p-1 text-center text-xs" placeholder="0" />
//                   </div>
//                 ))}
//               </div>
//               <div className="flex justify-between text-xs mb-2">
//                 <span>Pairs: <strong>{totalPairs}</strong></span>
//                 <span>Total: <strong className="text-blue-600">₹{matrixTotalCost}</strong></span>
//               </div>
//               <button onClick={handleWholesaleAdd} disabled={totalPairs === 0} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white py-1.5 rounded text-xs font-bold uppercase">Add Batch</button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- COMPONENT: ADMIN PRODUCT FORM (RICH VERSION) ---
// const ProductForm = ({ initialData, onSave, onCancel }) => {
//   const [formData, setFormData] = useState(initialData ? {
//     ...initialData,
//     sizes: initialData.sizes.join(',') 
//   } : {
//     name: '', category: 'Men\'s Formal', retailPrice: '', wholesalePrice: '', 
//     moq: 24, stock: 100, sizes: '6,7,8,9,10', tag: '', 
//     images: [] 
//   });
  
//   const [urlInput, setUrlInput] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (formData.images.length === 0) {
//       alert("Please upload at least one image.");
//       return;
//     }
//     const productToSave = {
//       ...formData,
//       retailPrice: Number(formData.retailPrice),
//       wholesalePrice: Number(formData.wholesalePrice),
//       moq: Number(formData.moq),
//       stock: Number(formData.stock),
//       sizes: typeof formData.sizes === 'string' ? formData.sizes.split(',').map(s => Number(s.trim())) : formData.sizes
//     };
//     onSave(productToSave);
//   };

//   // Convert File to Base64 for sending to Node Backend
//   const handleImageUpload = (e) => {
//     if (e.target.files && e.target.files.length > 0) {
//       Array.from(e.target.files).forEach(file => {
//         const reader = new FileReader();
//         reader.onloadend = () => {
//           setFormData(prev => ({ ...prev, images: [...prev.images, reader.result] }));
//         };
//         reader.readAsDataURL(file);
//       });
//     }
//   };

//   const handleAddUrl = () => {
//     if(urlInput) {
//       setFormData(prev => ({...prev, images: [...prev.images, urlInput]}));
//       setUrlInput('');
//     }
//   };

//   const removeImage = (indexToRemove) => {
//     setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== indexToRemove) }));
//   };

//   const fillRandomImage = () => {
//     const urls = [
//       'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800',
//       'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800',
//       'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=800',
//       'https://images.unsplash.com/photo-1560769629-975e13f0c470?q=80&w=800'
//     ];
//     setFormData(prev => ({...prev, images: [...prev.images, urls[Math.floor(Math.random() * urls.length)]]}));
//   };

//   return (
//     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg mb-8 animate-in fade-in slide-in-from-bottom-4">
//       <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
//         {initialData ? <Edit2 className="text-blue-600" /> : <Plus className="text-green-600" />} 
//         {initialData ? 'Edit Product' : 'Add New Product'}
//       </h3>
//       <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {/* Form Fields */}
//         <div className="md:col-span-2">
//           <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Product Name</label>
//           <input required type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-slate-900 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Leather Oxford Pro" />
//         </div>
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Category</label>
//            <select className="w-full border p-2 rounded outline-none bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
//              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
//            </select>
//         </div>
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Sizes (Comma Sep)</label>
//            <input required type="text" className="w-full border p-2 rounded outline-none" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} placeholder="6, 7, 8, 11, 12" />
//         </div>
//         <div className="grid grid-cols-2 gap-2">
//            <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Retail Price (₹)</label><input required type="number" className="w-full border p-2 rounded outline-none" value={formData.retailPrice} onChange={e => setFormData({...formData, retailPrice: e.target.value})} /></div>
//            <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Wholesale Price (₹)</label><input required type="number" className="w-full border p-2 rounded outline-none" value={formData.wholesalePrice} onChange={e => setFormData({...formData, wholesalePrice: e.target.value})} /></div>
//         </div>
//         <div className="grid grid-cols-2 gap-2">
//            <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Min Order Qty</label><input required type="number" className="w-full border p-2 rounded outline-none" value={formData.moq} onChange={e => setFormData({...formData, moq: e.target.value})} /></div>
//            <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Stock Qty</label><input required type="number" className="w-full border p-2 rounded outline-none" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} /></div>
//         </div>
//         <div className="md:col-span-2">
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Tag / Status</label>
//            <input type="text" className="w-full border p-2 rounded outline-none" value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})} placeholder="Out of Stock / Best Seller" />
//         </div>
        
//         {/* IMAGE UPLOAD SECTION */}
//         <div className="md:col-span-2">
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Product Images</label>
           
//            {/* File Upload */}
//            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition cursor-pointer relative mb-3">
//              <input 
//                 type="file" 
//                 multiple 
//                 accept="image/*"
//                 onChange={handleImageUpload}
//                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//              />
//              <Upload className="mx-auto text-slate-400 mb-2" />
//              <p className="text-sm text-slate-500 font-medium">Click to select images from device</p>
//              <p className="text-[10px] text-slate-400">(Images are converted to Base64 for the backend)</p>
//            </div>

//            {/* URL Input */}
//            <div className="flex gap-2 mb-3">
//              <input type="text" placeholder="Or paste Image URL here..." className="flex-1 border p-2 rounded text-sm outline-none" value={urlInput} onChange={e => setUrlInput(e.target.value)} />
//              <button type="button" onClick={handleAddUrl} className="bg-slate-200 px-3 rounded font-bold text-sm hover:bg-slate-300">Add URL</button>
//              <button type="button" onClick={fillRandomImage} className="bg-blue-100 text-blue-700 px-3 rounded font-bold text-sm hover:bg-blue-200">Random</button>
//            </div>

//            {/* Preview Strip */}
//            {formData.images.length > 0 && (
//              <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
//                {formData.images.map((img, idx) => (
//                  <div key={idx} className="relative shrink-0 w-20 h-20 group">
//                    <img src={img} alt="Preview" className="w-full h-full object-cover rounded-lg border border-slate-200" />
//                    <button type="button" onClick={() => removeImage(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600"><X size={12} /></button>
//                  </div>
//                ))}
//              </div>
//            )}
//         </div>

//         <div className="md:col-span-2 flex gap-3 mt-2">
//           <button type="button" onClick={onCancel} className="flex-1 py-2 border border-slate-300 rounded text-slate-600 font-bold hover:bg-slate-50">Cancel</button>
//           <button type="submit" className="flex-1 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 flex justify-center items-center gap-2">
//             <Save size={18}/> {initialData ? 'Update Product' : 'Save Product'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// // --- COMPONENT: ORDER MODAL (RICH VERSION) ---
// const OrderDetailModal = ({ order, onClose }) => {
//   if (!order) return null;

//   return (
//     <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//       <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
//         <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
//           <div>
//             <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
//               <FileText className="text-blue-600" size={20} /> Order #{order.id}
//             </h3>
//             <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
//               <Calendar size={14} /> {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}
//             </p>
//           </div>
//           <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition">
//             <XCircle size={28} />
//           </button>
//         </div>

//         <div className="overflow-y-auto p-6 flex-1">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//             <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
//               <h4 className="text-xs font-bold text-blue-800 uppercase mb-3 flex items-center gap-2"><User size={14}/> Customer Information</h4>
//               <div className="space-y-2 text-sm text-slate-700">
//                 <p><span className="font-semibold text-slate-900">Name:</span> {order.customer.name}</p>
//                 <p className="flex items-start gap-2"><span className="font-semibold text-slate-900 whitespace-nowrap">Phone:</span> {order.customer.phone}</p>
//                 {/* FIXED: Added safety check for order.type */}
//                 <p><span className="font-semibold text-slate-900">Type:</span> <span className={`px-2 py-0.5 rounded text-xs font-bold ${order.type === 'wholesale' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{(order.type || 'Retail').toUpperCase()}</span></p>
//               </div>
//             </div>
//             <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
//               <h4 className="text-xs font-bold text-slate-600 uppercase mb-3 flex items-center gap-2"><MapPin size={14}/> Delivery Address</h4>
//               <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{order.customer.address}</p>
//             </div>
//           </div>

//           <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Package size={16}/> Order Items</h4>
//           <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
//             <table className="w-full text-left text-sm">
//               <thead className="bg-slate-50 text-slate-500 font-medium">
//                 <tr>
//                   <th className="p-3">Product</th>
//                   <th className="p-3 text-center">Type</th>
//                   <th className="p-3">Breakdown</th>
//                   <th className="p-3 text-right">Price</th>
//                   <th className="p-3 text-right">Total</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {order.items.map((item, idx) => (
//                   <tr key={idx} className="hover:bg-slate-50/50">
//                     <td className="p-3">
//                       <div className="flex items-center gap-3">
//                         <img src={item.image} alt="" className="w-10 h-10 rounded object-cover bg-slate-100 border" />
//                         <span className="font-medium text-slate-900">{item.name}</span>
//                       </div>
//                     </td>
//                     <td className="p-3 text-center">
//                        {item.type === 'wholesale' 
//                          ? <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">BULK</span> 
//                          : <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">RETAIL</span>
//                        }
//                     </td>
//                     <td className="p-3">
//                       {item.type === 'wholesale' ? (
//                         <div className="grid grid-cols-4 gap-1 w-max">
//                           {Object.entries(item.breakdown).map(([size, qty]) => Number(qty) > 0 && (
//                             <div key={size} className="text-[10px] bg-white border rounded px-1 text-slate-500 whitespace-nowrap">
//                               UK{size}: <span className="font-bold text-slate-900">{qty}</span>
//                             </div>
//                           ))}
//                         </div>
//                       ) : (
//                         <span className="text-slate-500 text-xs">1 Pair (Standard)</span>
//                       )}
//                     </td>
//                     <td className="p-3 text-right text-slate-600">₹{item.price}</td>
//                     <td className="p-3 text-right font-bold text-slate-900">₹{item.price * item.quantity}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <div className="flex justify-end">
//             <div className="w-full md:w-64 bg-slate-50 p-4 rounded-lg border border-slate-200">
//               <div className="flex justify-between text-sm text-slate-600 mb-2">
//                 <span>Subtotal</span>
//                 <span>₹{Math.floor(order.total / (order.type === 'wholesale' ? 1.12 : 1)) }</span>
//               </div>
//               {order.type === 'wholesale' && (
//                 <div className="flex justify-between text-sm text-slate-600 mb-2">
//                   <span>GST (12%)</span>
//                   <span>₹{Math.floor(order.total - (order.total / 1.12))}</span>
//                 </div>
//               )}
//               <div className="flex justify-between font-bold text-lg text-slate-900 pt-3 border-t border-slate-200">
//                 <span>Total</span>
//                 <span>₹{Math.round(order.total)}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
//           <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-bold hover:bg-white transition">Close</button>
//           <button onClick={() => alert("Printing Feature would go here.")} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 flex items-center gap-2 transition"><ClipboardList size={18}/> Process Order</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- COMPONENT: ADMIN DASHBOARD (RICH VERSION) ---
// const AdminDashboard = ({ onLogout }) => {
//   const [activeTab, setActiveTab] = useState('orders');
//   const [products, setProducts] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [isEditing, setIsEditing] = useState(null);
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [editingProduct, setEditingProduct] = useState(null);

//   useEffect(() => {
//     refreshData();
//   }, []);

//   const refreshData = async () => {
//     try {
//       const p = await api.getProducts();
//       setProducts(p || []);
//       const o = await api.getOrders();
//       setOrders(o || []);
//     } catch (e) { console.error(e); }
//   };

//   const handleSaveProduct = async (product) => {
//     if (editingProduct) {
//       await api.updateProduct(product);
//       setEditingProduct(null);
//     } else {
//       await api.saveProduct(product);
//       setShowAddForm(false);
//     }
//     refreshData();
//   };

//   const handleEditClick = (product) => {
//     setEditingProduct(product);
//     setActiveTab('products');
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const handleDeleteProduct = async (id) => {
//     if (window.confirm("Delete product?")) {
//       await api.deleteProduct(id);
//       refreshData();
//     }
//   };

//   const pendingOrders = orders.filter(o => o.status === 'Pending').length;
//   const revenue = orders.reduce((acc, o) => acc + o.total, 0);

//   return (
//     <div className="container mx-auto px-4 py-8 bg-slate-50 min-h-screen">
//       {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
      
//       <div className="flex justify-between items-center mb-8">
//         <div><h2 className="text-2xl font-bold text-slate-900">Owner Dashboard</h2><p className="text-slate-500 text-sm">Manage Inventory & Orders</p></div>
//         <button onClick={onLogout} className="flex items-center gap-2 text-red-600 font-bold border border-red-200 bg-white px-4 py-2 rounded hover:bg-red-50"><LogOut size={18}/> Logout</button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4"><div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><ClipboardList /></div><div><p className="text-slate-500 text-sm">Total Orders</p><h3 className="text-2xl font-bold text-slate-900">{orders.length}</h3></div></div>
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4"><div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><Package /></div><div><p className="text-slate-500 text-sm">Pending</p><h3 className="text-2xl font-bold text-slate-900">{pendingOrders}</h3></div></div>
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4"><div className="p-3 bg-green-100 text-green-600 rounded-lg"><Users /></div><div><p className="text-slate-500 text-sm">Revenue (Est)</p><h3 className="text-2xl font-bold text-slate-900">₹{revenue.toLocaleString()}</h3></div></div>
//       </div>

//       <div className="flex gap-4 border-b border-slate-200 mb-6">
//         <button onClick={() => setActiveTab('orders')} className={`pb-3 px-4 font-bold text-sm ${activeTab === 'orders' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500'}`}>Incoming Orders</button>
//         <button onClick={() => setActiveTab('products')} className={`pb-3 px-4 font-bold text-sm ${activeTab === 'products' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500'}`}>Manage Products ({products.length})</button>
//       </div>

//       {activeTab === 'orders' ? (
//         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//           <table className="w-full text-left text-sm">
//             <thead className="bg-slate-50 text-slate-500"><tr><th className="p-4">ID</th><th className="p-4">Customer</th><th className="p-4">Type</th><th className="p-4">Total</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead>
//             <tbody className="divide-y divide-slate-100">
//               {orders.length === 0 ? <tr><td colSpan="6" className="p-8 text-center text-slate-400">No orders yet.</td></tr> : orders.map(order => (
//                 <tr key={order.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedOrder(order)}>
//                   <td className="p-4 font-mono text-xs">{order.id}</td>
//                   <td className="p-4 font-bold">{order.customer.name}<div className="text-xs font-normal text-slate-500">{order.customer.phone}</div></td>
//                   <td className="p-4 font-bold">₹{Math.round(order.total)}</td>
//                   <td className="p-4"><span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold">{order.status}</span></td>
//                   <td className="p-4"><button className="text-blue-600 border border-blue-200 px-3 py-1 rounded hover:bg-blue-50 text-xs font-bold">View</button></td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         <div>
//           <div className="flex justify-between items-center mb-6">
//             <h3 className="font-bold text-lg">Inventory</h3>
//             {!showAddForm && !editingProduct && <button onClick={() => setShowAddForm(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-800"><Plus size={18}/> Add Product</button>}
//           </div>
          
//           {(showAddForm || editingProduct) && (
//             <ProductForm initialData={editingProduct} onSave={handleSaveProduct} onCancel={() => { setShowAddForm(false); setEditingProduct(null); }} />
//           )}

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {products.map(p => (
//               <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 shadow-sm hover:shadow-md transition">
//                 <img src={p.images[0]} className="w-24 h-24 object-cover rounded-lg bg-slate-100" alt={p.name} />
//                 <div className="flex-1">
//                   <h4 className="font-bold text-slate-900">{p.name}</h4>
//                   <div className="text-xs text-slate-500 mb-2">{p.category}</div>
//                   <div className="flex gap-3 text-sm mb-2">
//                     <div><span className="text-[10px] uppercase text-slate-400 block">Retail</span><b>₹{p.retailPrice}</b></div>
//                     <div><span className="text-[10px] uppercase text-slate-400 block">Wholesale</span><b className="text-blue-600">₹{p.wholesalePrice}</b></div>
//                   </div>
//                   <div className="flex gap-2 mt-2">
//                     <button onClick={() => handleEditClick(p)} className="flex-1 bg-blue-50 text-blue-600 text-xs font-bold py-1.5 rounded hover:bg-blue-100 flex items-center justify-center gap-1"><Edit2 size={12}/> Edit</button>
//                     <button onClick={() => handleDeleteProduct(p.id)} className="flex-1 bg-red-50 text-red-600 text-xs font-bold py-1.5 rounded hover:bg-red-100 flex items-center justify-center gap-1"><Trash2 size={12}/> Remove</button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // --- COMPONENT: SHOP VIEW ---
// const ShopView = ({ products, mode, onAddToCart }) => {
//   const [filter, setFilter] = useState('All');
//   const [searchTerm, setSearchTerm] = useState('');
  
//   const filteredProducts = products.filter(p => {
//     const matchesCategory = filter === 'All' || p.category === filter;
//     const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
//         <div>
//           <h2 className="text-3xl font-bold text-slate-900">{mode === 'wholesale' ? 'Wholesale Catalog' : 'Shop Collection'}</h2>
//           <p className="text-slate-500 text-sm mt-1">{mode === 'wholesale' ? 'Bulk pricing applied. MOQ rules active.' : 'Latest trends from Agra.'}</p>
//         </div>
        
//         {/* Search Bar */}
//         <div className="relative w-full md:w-64">
//           <input 
//             type="text" 
//             placeholder="Search shoes..." 
//             className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
//         </div>
//       </div>

//       {/* Category Pills */}
//       <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4">
//         <Filter size={18} className="text-slate-400 shrink-0" />
//         {CATEGORIES.map(cat => (
//           <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${filter === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
//             {cat}
//           </button>
//         ))}
//       </div>

//       {filteredProducts.length === 0 ? (
//         <div className="text-center py-20 text-slate-400">No products found matching your search.</div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {filteredProducts.map(product => (
//             <ProductCard key={product.id} product={product} mode={mode} onAddToCart={onAddToCart} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// // --- COMPONENT: HOME VIEW ---
// const HomeView = ({ setView, mode }) => (
//   <>
//     <div className="bg-white border-b border-slate-200">
//       <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row items-center gap-10">
//         <div className="flex-1 text-center md:text-left">
//           <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold mb-6">
//             <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
//             {mode === 'wholesale' ? 'ACCEPTING NEW DISTRIBUTORS' : 'SEASONAL SALE IS LIVE'}
//           </div>
//           <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
//             {mode === 'wholesale' ? <>Factory Direct.<br /><span className="text-blue-600">Maximize Margins.</span></> : <>Handcrafted in Agra.<br /><span className="text-red-600">Worn Everywhere.</span></>}
//           </h1>
//           <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
//             {mode === 'wholesale' ? 'Connect directly with our 20-year-old manufacturing unit. Get transparent pricing, bulk shipping support, and custom branding options.' : 'Discover the finest leather shoes directly from the shoe capital of India. Premium quality, honest prices, delivered to your doorstep.'}
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
//             <button onClick={() => setView('shop')} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2">
//               {mode === 'wholesale' ? 'View Catalog' : 'Shop Collection'} <ArrowRight size={18} />
//             </button>
//           </div>
//         </div>
        
//         <div className="flex-1 w-full max-w-md md:max-w-full">
//            <div className="relative">
//              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-amber-50 rounded-2xl transform rotate-3"></div>
//              <img 
//                src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop" 
//                alt="Shoe Craftsmanship" 
//                className="relative rounded-2xl shadow-2xl w-full h-auto object-cover transform -rotate-2 hover:rotate-0 transition duration-700"
//              />
//              {mode === 'wholesale' && (
//                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3">
//                  <div className="bg-green-100 p-2 rounded-full text-green-600"><CheckCircle size={24} /></div>
//                  <div>
//                    <p className="text-sm font-bold text-slate-800">Verified Manufacturer</p>
//                    <p className="text-xs text-slate-500">GST Registered • IEC License</p>
//                  </div>
//                </div>
//              )}
//            </div>
//         </div>
//       </div>
//     </div>
//     <Features />
//   </>
// );

// // --- COMPONENT: CART VIEW ---
// const CartView = ({ cart, mode, removeFromCart, setView }) => {
//   const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
//   const totalGST = mode === 'wholesale' ? totalAmount * 0.12 : 0; // 12% GST for wholesale
//   const finalTotal = totalAmount + totalGST;

//   if (cart.length === 0) return (
//     <div className="container mx-auto px-4 py-20 text-center">
//       <ShoppingCart size={64} className="mx-auto text-slate-200 mb-4" />
//       <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
//       <button onClick={() => setView('shop')} className="text-blue-600 font-medium hover:underline">Start Shopping</button>
//     </div>
//   );

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h2 className="text-2xl font-bold text-slate-900 mb-8">Shopping Cart ({cart.length} items)</h2>
//       <div className="flex flex-col lg:flex-row gap-8">
//         <div className="flex-1 space-y-4">
//           {cart.map((item, idx) => (
//             <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl flex gap-4">
//               <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg bg-slate-100" />
//               <div className="flex-1">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h3 className="font-bold text-slate-900">{item.name}</h3>
//                     <p className="text-sm text-slate-500">{item.category}</p>
//                   </div>
//                   <button onClick={() => removeFromCart(idx)} className="text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
//                 </div>
                
//                 {item.type === 'wholesale' ? (
//                    <div className="mt-2 bg-slate-50 p-2 rounded text-xs text-slate-600 grid grid-cols-5 gap-2">
//                      {Object.entries(item.breakdown).map(([size, qty]) => Number(qty) > 0 && (
//                        <div key={size} className="text-center bg-white border border-slate-200 rounded px-1">
//                          <span className="block text-[10px] text-slate-400">UK {size}</span>
//                          <span className="font-bold">{qty}</span>
//                        </div>
//                      ))}
//                    </div>
//                 ) : (
//                   <div className="mt-2 text-sm text-slate-600">Qty: {item.quantity} Pair</div>
//                 )}
                
//                 <div className="mt-3 flex justify-between items-center">
//                    <div className="text-xs text-slate-500">{item.quantity} pairs x ₹{item.price}</div>
//                    <div className="font-bold text-slate-900">₹{item.quantity * item.price}</div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="w-full lg:w-96">
//           <div className="bg-white border border-slate-200 p-6 rounded-xl sticky top-24 shadow-sm">
//             <h3 className="font-bold text-lg mb-4">Order Summary</h3>
//             <div className="space-y-3 mb-6">
//               <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹{totalAmount}</span></div>
//               {mode === 'wholesale' && (
//                 <div className="flex justify-between text-slate-600"><span>GST (12%)</span><span>₹{totalGST.toFixed(0)}</span></div>
//               )}
//               <div className="flex justify-between text-slate-600"><span>Shipping</span><span>{mode === 'wholesale' ? 'To be calculated' : 'Free'}</span></div>
//               <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-lg text-slate-900">
//                 <span>Total</span><span>₹{finalTotal.toFixed(0)}</span>
//               </div>
//             </div>
//             <button onClick={() => setView('checkout')} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg">
//               Proceed to Checkout
//             </button>
//             <p className="text-xs text-slate-400 text-center mt-3">Secure Checkout via Agra Shoe Mart</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- COMPONENT: CHECKOUT VIEW ---
// const CheckoutView = ({ cart, mode, placeOrder, setView }) => {
//   const [form, setForm] = useState({ name: '', phone: '', address: '' });
  
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     placeOrder(form);
//   };

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-2xl">
//       <button onClick={() => setView('cart')} className="text-sm text-slate-500 hover:text-slate-900 mb-6">← Back to Cart</button>
//       <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
//         <h2 className="text-2xl font-bold text-slate-900 mb-6">{mode === 'wholesale' ? 'Request Bulk Quote' : 'Checkout'}</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Full Name / Shop Name</label>
//             <input required type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number (WhatsApp)</label>
//             <input required type="tel" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Address</label>
//             <textarea required rows="3" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.address} onChange={e => setForm({...form, address: e.target.value})}></textarea>
//           </div>
          
//           <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
//             {mode === 'wholesale' 
//               ? "Note: This is a quote request. Our sales team will contact you on WhatsApp to confirm availability and shipping costs before payment."
//               : "Note: Cash on Delivery is available for Agra. Online payment link will be sent for other cities."
//             }
//           </div>

//           <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-md">
//             {mode === 'wholesale' ? 'Submit Quote Request' : 'Place Order'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// // --- COMPONENT: LOGIN VIEW ---
// const LoginView = ({ onLoginSuccess }) => {
//   const [isRegistering, setIsRegistering] = useState(false);
//   const [form, setForm] = useState({ name: '', phone: '', password: '' });
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
    
//     // Admin Backdoor
//     if (form.phone === 'admin' || form.phone === 'admin@agra.com') {
//         const res = await api.login(form.phone, form.password);
//         if(res && res.success) onLoginSuccess({ ...res.user, role: 'admin' });
//         return;
//     }

//     if (isRegistering) {
//       if (!form.name || !form.phone || !form.password) return setError("All fields required");
//       const res = await api.signup(form);
//       if (res && res.success) onLoginSuccess(res.user);
//       else setError(res?.message || "Registration failed");
//     } else {
//       if (!form.phone || !form.password) return setError("Enter credentials");
//       const res = await api.login(form.phone, form.password);
//       if (res && res.success) onLoginSuccess(res.user);
//       else setError(res?.message || "Login failed");
//     }
//   };

//   return (
//     <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-slate-50">
//       <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-xl shadow-xl">
//         <div className="text-center mb-8">
//           <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg"><Package size={32}/></div>
//           <h2 className="text-2xl font-bold text-slate-900">{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
//           <p className="text-slate-500 mt-2">{isRegistering ? 'Join the largest wholesale network in Agra' : 'Enter mobile to access wholesale rates'}</p>
//         </div>

//         {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4 text-center border border-red-100">{error}</div>}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {isRegistering && (
//             <div className="animate-in fade-in slide-in-from-top-2">
//               <label className="block text-sm font-bold text-slate-700 mb-1">Full Name / Shop Name</label>
//               <input type="text" className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition" placeholder="Agra Footwear Co." value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
//             </div>
//           )}
//           <div>
//             <label className="block text-sm font-bold text-slate-700 mb-1">Mobile Number</label>
//             <input type="tel" className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition" placeholder="98765XXXXX" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
//           </div>
//           <div>
//             <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
//             <input type="password" className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
//           </div>
//           <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg transform hover:-translate-y-0.5">
//             {isRegistering ? 'Register Now' : 'Login Securely'}
//           </button>
//         </form>

//         <div className="mt-8 text-center pt-6 border-t border-slate-100">
//           <p className="text-slate-500 text-sm mb-2">{isRegistering ? 'Already have an account?' : 'New to Agra Shoe Mart?'}</p>
//           <button onClick={() => setIsRegistering(!isRegistering)} className="text-blue-600 font-bold hover:underline text-sm">
//             {isRegistering ? 'Login Instead' : 'Create New Account'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- MAIN CONTROLLER ---
// const App = () => {
//   const [view, setView] = useState('home');
//   const [user, setUser] = useState(null);
//   const [mode, setMode] = useState('retail'); 
//   const [cart, setCart] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [showToast, setShowToast] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   useEffect(() => {
//     const fetchProds = async () => {
//       const res = await api.getProducts();
//       setProducts(res || []);
//     };
//     fetchProds();
//   }, []);

//   const handleLogin = (userData) => {
//     setUser(userData);
//     if (userData.role === 'admin') setView('admin');
//     else {
//       setMode('wholesale');
//       setView('shop');
//     }
//   };

//   const handleLogout = () => {
//     if (window.confirm("Logout?")) {
//       api.logout();
//       setUser(null);
//       setMode('retail');
//       setView('home');
//     }
//   };

//   const addToCart = (item) => {
//     if (!user) return alert("Please Login to Shop");
//     setCart([...cart, item]);
//     setShowToast(true);
//     setTimeout(() => setShowToast(false), 3000);
//   };

//   const removeFromCart = (index) => {
//     const newCart = [...cart];
//     newCart.splice(index, 1);
//     setCart(newCart);
//   };

//   const placeOrder = async (details) => {
//     const total = cart.reduce((a, b) => a + (b.price * b.quantity), 0);
//     // Add type: mode here
//     await api.createOrder({ customer: details, items: cart, total, type: mode });
//     setCart([]);
//     setView('success');
//   };

//   if (view === 'admin') return <AdminDashboard onLogout={handleLogout} />;
//   if (view === 'login') return <LoginView onLoginSuccess={handleLogin} />;
  
//   return (
//     <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
//       {/* Navbar */}
//       <nav className="bg-white shadow-md sticky top-0 z-50">
//         <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 flex justify-between items-center">
//           <span className="hidden sm:inline">Agra's Trusted Shoe Wholesaler - Since 2003</span>
//           <div className="flex items-center gap-4">
//             <span className="flex items-center gap-1 hover:text-white cursor-pointer transition">
//               <Phone size={14} /> +91 98765-XXXXX
//             </span>
//             <span className="text-amber-500 font-bold cursor-pointer hover:underline hidden sm:block">
//               Request Sample Kit
//             </span>
//           </div>
//         </div>

//         <div className="container mx-auto px-4 py-4">
//           <div className="flex justify-between items-center">
//             <div onClick={() => setView('home')} className="flex items-center gap-2 cursor-pointer">
//               <div className="bg-red-600 text-white p-1 rounded font-bold text-xl">ASM</div>
//               <div className="text-2xl font-bold tracking-tighter text-slate-800 leading-none">
//                 AGRA<span className="text-red-600">SHOES</span>
//               </div>
//             </div>

//             <div className="hidden md:flex gap-8 font-medium text-slate-600 text-sm">
//               <button onClick={() => setView('home')} className="hover:text-red-600 transition">Home</button>
//               <button onClick={() => setView('shop')} className="hover:text-red-600 transition">Shop Catalog</button>
//               <button onClick={() => setView('shop')} className="hover:text-red-600 transition">New Arrivals</button>
//             </div>

//             <div className="flex items-center gap-4">
//               <div className="hidden md:flex bg-slate-100 rounded-full p-1 border border-slate-200 mr-2">
//                 <button onClick={() => setMode('retail')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${mode === 'retail' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Retail</button>
//                 <button onClick={() => setMode('wholesale')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${mode === 'wholesale' ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}>Wholesale</button>
//               </div>

//               <button onClick={() => setView('cart')} className="relative p-2 hover:bg-slate-100 rounded-full transition group">
//                 <ShoppingCart size={22} className="text-slate-700 group-hover:text-red-600" />
//                 {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">{cart.length}</span>}
//               </button>
              
//               {user ? (
//                 <div className="flex items-center gap-2">
//                   <button onClick={() => user.type === 'admin' ? setView('admin') : setView('home')} className="flex items-center gap-2 font-bold text-sm bg-slate-100 px-3 py-2 rounded-lg hover:bg-slate-200 transition">
//                     <User size={18}/> <span className="hidden sm:inline">{user.name}</span>
//                   </button>
//                   <button onClick={handleLogout} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition shadow-sm" title="Logout">
//                     <LogOut size={18} />
//                   </button>
//                 </div>
//               ) : (
//                 <button onClick={() => setView('login')} className="hidden sm:flex bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm">Login</button>
//               )}

//               <button className="md:hidden text-slate-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
//                   {isMobileMenuOpen ? <X /> : <Menu />}
//               </button>
//             </div>
//           </div>

//           {isMobileMenuOpen && (
//             <div className="md:hidden mt-4 pb-4 border-t pt-4">
//                 <div className="flex bg-slate-100 rounded-lg p-1 mb-4">
//                 <button onClick={() => { setMode('retail'); setIsMobileMenuOpen(false); }} className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === 'retail' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Retail</button>
//                 <button onClick={() => { setMode('wholesale'); setIsMobileMenuOpen(false); }} className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === 'wholesale' ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}>Wholesale</button>
//               </div>
//               <div className="space-y-3 text-slate-700 font-medium">
//                 <button onClick={() => { setView('home'); setIsMobileMenuOpen(false); }} className="block w-full text-left hover:text-red-600">Home</button>
//                 <button onClick={() => { setView('shop'); setIsMobileMenuOpen(false); }} className="block w-full text-left hover:text-red-600">Shop Catalog</button>
//                 <button onClick={() => { setView('login'); setIsMobileMenuOpen(false); }} className="block w-full text-left text-blue-600">Login / Register</button>
//               </div>
//             </div>
//           )}
//         </div>
//       </nav>

//       <main className="flex-1">
//         {view === 'home' && <HomeView setView={setView} mode={mode} />}
//         {view === 'shop' && <ShopView products={products} mode={mode} onAddToCart={addToCart} />}
//         {view === 'cart' && <CartView cart={cart} mode={mode} removeFromCart={removeFromCart} setView={setView} />}
//         {view === 'checkout' && <CheckoutView cart={cart} mode={mode} placeOrder={placeOrder} setView={setView} />}
//         {view === 'success' && (
//           <div className="text-center py-20">
//             <CheckCircle size={64} className="mx-auto text-green-500 mb-4"/>
//             <h2 className="text-3xl font-bold">Order Received!</h2>
//             <button onClick={() => setView('home')} className="mt-4 text-blue-600 font-bold">Back Home</button>
//           </div>
//         )}
//       </main>
      
//       {showToast && (
//         <div className="fixed bottom-4 right-4 bg-black text-white px-6 py-3 rounded shadow-lg flex gap-2 animate-bounce">
//           <CheckCircle size={20} className="text-green-400"/> Added to Cart
//         </div>
//       )}
      
//       <footer className="bg-slate-900 text-slate-400 py-12">
//         <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
//           <div>
//             <h4 className="text-white font-bold text-lg mb-4">AGRA SHOES</h4>
//             <p className="mb-4">Digitizing the legacy of Agra's shoemaking. We connect manufacturers directly to retailers across India.</p>
//             <p>Agra, Uttar Pradesh, India - 282002</p>
//           </div>
//           <div>
//             <h4 className="text-white font-bold mb-4">Shop</h4>
//             <ul className="space-y-2">
//               <li className="hover:text-white cursor-pointer">Men's Formal</li>
//               <li className="hover:text-white cursor-pointer">Casual Loafers</li>
//               <li className="hover:text-white cursor-pointer">Safety Shoes</li>
//               <li className="hover:text-white cursor-pointer">School Shoes</li>
//             </ul>
//           </div>
//           <div>
//             <h4 className="text-white font-bold mb-4">Wholesale</h4>
//             <ul className="space-y-2">
//               <li className="hover:text-white cursor-pointer">Register as Distributor</li>
//               <li className="hover:text-white cursor-pointer">Bulk Pricing Policy</li>
//               <li className="hover:text-white cursor-pointer">Shipping & Logistics</li>
//               <li className="hover:text-white cursor-pointer">Return Policy</li>
//             </ul>
//           </div>
//           <div>
//             <h4 className="text-white font-bold mb-4">Stay Connected</h4>
//             <p className="mb-4">Get latest design updates on WhatsApp.</p>
//             <div className="flex gap-2">
//               <input type="text" placeholder="+91 Mobile Number" className="bg-slate-800 border-none rounded px-3 py-2 w-full text-white outline-none focus:ring-1 focus:ring-slate-600" />
//               <button className="bg-green-600 text-white px-3 py-2 rounded font-bold hover:bg-green-700">Join</button>
//             </div>
//           </div>
//         </div>
//         <div className="text-center mt-12 pt-8 border-t border-slate-800">
//           &copy; 2025 Agra Wholesale Shoe Mart. All rights reserved.
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default App;
// import React, { useState, useEffect } from 'react';
// import { 
//   ShoppingCart, User, Phone, Menu, X, CheckCircle, Truck, 
//   ShieldCheck, Info, Package, ArrowRight, Trash2, Filter, 
//   Search, ClipboardList, Users, LogOut, Plus, Save,
//   ChevronLeft, ChevronRight, Upload, XCircle, FileText, MapPin, Calendar, Edit2
// } from 'lucide-react';

// // --- API CONNECTOR ---
// const API_URL = 'http://localhost:5000/api';

// const api = {
//   request: async (endpoint, method = 'GET', body = null) => {
//     try {
//       const options = {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//       };
//       if (body) options.body = JSON.stringify(body);
      
//       const response = await fetch(`${API_URL}${endpoint}`, options);
//       return await response.json();
//     } catch (error) {
//       console.error("Connection Error:", error);
//       return null;
//     }
//   },

//   // Products
//   getProducts: () => api.request('/products'),
//   saveProduct: (product) => api.request('/products', 'POST', product),
//   updateProduct: (product) => api.request(`/products/${product.id}`, 'PUT', product),
//   deleteProduct: (id) => api.request(`/products/${id}`, 'DELETE'),

//   // Orders
//   getOrders: () => api.request('/orders'),
//   createOrder: (order) => api.request('/orders', 'POST', order),

//   // Auth (Enhanced with Local Persistence)
//   login: async (phone, password) => {
//     const res = await api.request('/auth/login', 'POST', { phone, password });
//     if (res && res.success) {
//       localStorage.setItem('agra_user', JSON.stringify(res.user));
//     }
//     return res;
//   },
//   signup: async (userData) => {
//     const res = await api.request('/auth/signup', 'POST', userData);
//     if (res && res.success) {
//       localStorage.setItem('agra_user', JSON.stringify(res.user));
//     }
//     return res;
//   },
//   logout: () => {
//     localStorage.removeItem('agra_user');
//   },
//   getSession: () => {
//     const user = localStorage.getItem('agra_user');
//     return user ? JSON.parse(user) : null;
//   }
// };

// const CATEGORIES = ['All', 'Men\'s Formal', 'Office Wear', 'Women\'s Comfort', 'Men\'s Boots', 'Casual', 'School'];

// // --- COMPONENT: FEATURES ---
// const Features = () => (
//   <div className="bg-slate-50 py-12 border-y border-slate-200">
//     <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-blue-600"><Truck /></div>
//         <h3 className="font-bold text-slate-800 mb-2">Nationwide Delivery</h3>
//         <p className="text-sm text-slate-500 px-4">From Agra to anywhere in India. We use trusted B2B logistics partners.</p>
//       </div>
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-amber-500"><ShieldCheck /></div>
//         <h3 className="font-bold text-slate-800 mb-2">Quality Guarantee</h3>
//         <p className="text-sm text-slate-500 px-4">Every pair is inspected before packing. 20 years of reputation at stake.</p>
//       </div>
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-red-600"><Info /></div>
//         <h3 className="font-bold text-slate-800 mb-2">Direct Support</h3>
//         <p className="text-sm text-slate-500 px-4">Call us anytime. We believe in building relationships, not just sales.</p>
//       </div>
//     </div>
//   </div>
// );

// // --- COMPONENT: PRODUCT CARD (RICH VERSION) ---
// const ProductCard = ({ product, mode, onAddToCart }) => {
//   const [currentImgIndex, setCurrentImgIndex] = useState(0);
//   const [showMatrix, setShowMatrix] = useState(false);
  
//   // Robust data handling
//   const sizes = product.sizes || [];
//   const images = product.images && product.images.length > 0 ? product.images : ['https://via.placeholder.com/300?text=No+Image'];
  
//   const [quantities, setQuantities] = useState(
//     sizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {})
//   );
  
//   const totalPairs = Object.values(quantities).reduce((a, b) => a + Number(b), 0);
//   const price = mode === 'retail' ? Number(product.retailPrice) : Number(product.wholesalePrice);
//   const matrixTotalCost = totalPairs * price;

//   const nextImage = (e) => {
//     e.stopPropagation();
//     setCurrentImgIndex((prev) => (prev + 1) % images.length);
//   };

//   const prevImage = (e) => {
//     e.stopPropagation();
//     setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
//   };

//   const handleWholesaleAdd = () => {
//     if (totalPairs < product.moq) {
//       alert(`Minimum Order Quantity is ${product.moq} pairs.`);
//       return;
//     }
//     onAddToCart({
//       ...product,
//       type: 'wholesale',
//       breakdown: quantities,
//       quantity: totalPairs,
//       price: product.wholesalePrice,
//       image: images[0]
//     });
//     setQuantities(sizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {}));
//     setShowMatrix(false);
//   };

//   const handleRetailAdd = () => {
//     onAddToCart({
//       ...product,
//       type: 'retail',
//       quantity: 1,
//       price: product.retailPrice,
//       image: images[0]
//     });
//   };

//   return (
//     <div className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
//       {/* Image Carousel Section */}
//       <div className="relative h-64 bg-slate-100 group">
//         <img 
//           src={images[currentImgIndex]} 
//           alt={product.name} 
//           className="w-full h-full object-cover transition-transform duration-500" 
//         />
        
//         {/* Tags */}
//         {product.tag && <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] uppercase font-bold px-2 py-1 rounded backdrop-blur-sm z-10">{product.tag}</span>}
//         {mode === 'wholesale' && <span className="absolute top-2 left-2 bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">MOQ: {product.moq}</span>}

//         {/* Carousel Controls */}
//         {images.length > 1 && (
//           <>
//             <button 
//               onClick={prevImage} 
//               className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full text-slate-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
//             >
//               <ChevronLeft size={20} />
//             </button>
//             <button 
//               onClick={nextImage} 
//               className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full text-slate-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
//             >
//               <ChevronRight size={20} />
//             </button>
            
//             <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
//               {images.map((_, idx) => (
//                 <div 
//                   key={idx} 
//                   className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImgIndex ? 'bg-white scale-125' : 'bg-white/50'}`} 
//                 />
//               ))}
//             </div>
//           </>
//         )}
//       </div>

//       {/* Details Section */}
//       <div className="p-4 flex-1 flex flex-col">
//         <div className="mb-2">
//           <span className="text-xs text-slate-500 uppercase tracking-wide">{product.category}</span>
//           <h3 className="text-lg font-bold text-slate-800 leading-tight">{product.name}</h3>
//         </div>
        
//         <div className="mt-auto pt-4 border-t border-slate-100">
//           <div className="flex justify-between items-end mb-4">
//             <div>
//               <p className="text-xs text-slate-500 mb-0.5">Price per pair</p>
//               <div className="flex items-baseline gap-2">
//                 <span className="text-xl font-bold text-slate-900">₹{price}</span>
//                 {mode === 'retail' && <span className="text-xs text-red-500 line-through">₹{Math.floor(price * 1.2)}</span>}
//               </div>
//               {mode === 'wholesale' && <p className="text-[10px] text-red-600 font-medium">*Excl. GST</p>}
//             </div>
            
//             {mode === 'retail' ? (
//               <button onClick={handleRetailAdd} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-200">Add</button>
//             ) : (
//               <button onClick={() => setShowMatrix(!showMatrix)} className={`px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg ${showMatrix ? 'bg-slate-200 text-slate-800' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}>{showMatrix ? 'Close' : 'Bulk'}</button>
//             )}
//           </div>

//           {mode === 'wholesale' && showMatrix && (
//             <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2">
//               <div className="flex justify-between items-center mb-2">
//                  <span className="text-[10px] font-bold text-slate-500">SELECT SIZES</span>
//               </div>
//               <div className="grid grid-cols-5 gap-1 mb-3">
//                 {sizes.map((size) => (
//                   <div key={size} className="text-center">
//                     <label className="block text-[10px] text-slate-500">UK {size}</label>
//                     <input type="number" min="0" value={quantities[size] || ''} onChange={(e) => setQuantities(prev => ({...prev, [size]: e.target.value}))} className="w-full border border-slate-300 rounded p-1 text-center text-xs" placeholder="0" />
//                   </div>
//                 ))}
//               </div>
//               <div className="flex justify-between text-xs mb-2">
//                 <span>Pairs: <strong>{totalPairs}</strong></span>
//                 <span>Total: <strong className="text-blue-600">₹{matrixTotalCost}</strong></span>
//               </div>
//               <button onClick={handleWholesaleAdd} disabled={totalPairs === 0} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white py-1.5 rounded text-xs font-bold uppercase">Add Batch</button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- COMPONENT: ADMIN PRODUCT FORM (RICH VERSION) ---
// const ProductForm = ({ initialData, onSave, onCancel }) => {
//   const [formData, setFormData] = useState(initialData ? {
//     ...initialData,
//     sizes: initialData.sizes.join(',') 
//   } : {
//     name: '', category: 'Men\'s Formal', retailPrice: '', wholesalePrice: '', 
//     moq: 24, stock: 100, sizes: '6,7,8,9,10', tag: '', 
//     images: [] 
//   });
  
//   const [urlInput, setUrlInput] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (formData.images.length === 0) {
//       alert("Please upload at least one image.");
//       return;
//     }
//     const productToSave = {
//       ...formData,
//       retailPrice: Number(formData.retailPrice),
//       wholesalePrice: Number(formData.wholesalePrice),
//       moq: Number(formData.moq),
//       stock: Number(formData.stock),
//       sizes: typeof formData.sizes === 'string' ? formData.sizes.split(',').map(s => Number(s.trim())) : formData.sizes
//     };
//     onSave(productToSave);
//   };

//   // Convert File to Base64 for sending to Node Backend
//   const handleImageUpload = (e) => {
//     if (e.target.files && e.target.files.length > 0) {
//       Array.from(e.target.files).forEach(file => {
//         const reader = new FileReader();
//         reader.onloadend = () => {
//           setFormData(prev => ({ ...prev, images: [...prev.images, reader.result] }));
//         };
//         reader.readAsDataURL(file);
//       });
//     }
//   };

//   const handleAddUrl = () => {
//     if(urlInput) {
//       setFormData(prev => ({...prev, images: [...prev.images, urlInput]}));
//       setUrlInput('');
//     }
//   };

//   const removeImage = (indexToRemove) => {
//     setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== indexToRemove) }));
//   };

//   const fillRandomImage = () => {
//     const urls = [
//       'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800',
//       'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800',
//       'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=800',
//       'https://images.unsplash.com/photo-1560769629-975e13f0c470?q=80&w=800'
//     ];
//     setFormData(prev => ({...prev, images: [...prev.images, urls[Math.floor(Math.random() * urls.length)]]}));
//   };

//   return (
//     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg mb-8 animate-in fade-in slide-in-from-bottom-4">
//       <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
//         {initialData ? <Edit2 className="text-blue-600" /> : <Plus className="text-green-600" />} 
//         {initialData ? 'Edit Product' : 'Add New Product'}
//       </h3>
//       <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {/* Form Fields */}
//         <div className="md:col-span-2">
//           <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Product Name</label>
//           <input required type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-slate-900 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Leather Oxford Pro" />
//         </div>
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Category</label>
//            <select className="w-full border p-2 rounded outline-none bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
//              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
//            </select>
//         </div>
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Sizes (Comma Sep)</label>
//            <input required type="text" className="w-full border p-2 rounded outline-none" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} placeholder="6, 7, 8, 11, 12" />
//         </div>
//         <div className="grid grid-cols-2 gap-2">
//            <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Retail Price (₹)</label><input required type="number" className="w-full border p-2 rounded outline-none" value={formData.retailPrice} onChange={e => setFormData({...formData, retailPrice: e.target.value})} /></div>
//            <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Wholesale Price (₹)</label><input required type="number" className="w-full border p-2 rounded outline-none" value={formData.wholesalePrice} onChange={e => setFormData({...formData, wholesalePrice: e.target.value})} /></div>
//         </div>
//         <div className="grid grid-cols-2 gap-2">
//            <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Min Order Qty</label><input required type="number" className="w-full border p-2 rounded outline-none" value={formData.moq} onChange={e => setFormData({...formData, moq: e.target.value})} /></div>
//            <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Stock Qty</label><input required type="number" className="w-full border p-2 rounded outline-none" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} /></div>
//         </div>
//         <div className="md:col-span-2">
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Tag / Status</label>
//            <input type="text" className="w-full border p-2 rounded outline-none" value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})} placeholder="Out of Stock / Best Seller" />
//         </div>
        
//         {/* IMAGE UPLOAD SECTION */}
//         <div className="md:col-span-2">
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Product Images</label>
           
//            {/* File Upload */}
//            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition cursor-pointer relative mb-3">
//              <input 
//                 type="file" 
//                 multiple 
//                 accept="image/*"
//                 onChange={handleImageUpload}
//                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//              />
//              <Upload className="mx-auto text-slate-400 mb-2" />
//              <p className="text-sm text-slate-500 font-medium">Click to select images from device</p>
//              <p className="text-[10px] text-slate-400">(Images are converted to Base64 for the backend)</p>
//            </div>

//            {/* URL Input */}
//            <div className="flex gap-2 mb-3">
//              <input type="text" placeholder="Or paste Image URL here..." className="flex-1 border p-2 rounded text-sm outline-none" value={urlInput} onChange={e => setUrlInput(e.target.value)} />
//              <button type="button" onClick={handleAddUrl} className="bg-slate-200 px-3 rounded font-bold text-sm hover:bg-slate-300">Add URL</button>
//              <button type="button" onClick={fillRandomImage} className="bg-blue-100 text-blue-700 px-3 rounded font-bold text-sm hover:bg-blue-200">Random</button>
//            </div>

//            {/* Preview Strip */}
//            {formData.images.length > 0 && (
//              <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
//                {formData.images.map((img, idx) => (
//                  <div key={idx} className="relative shrink-0 w-20 h-20 group">
//                    <img src={img} alt="Preview" className="w-full h-full object-cover rounded-lg border border-slate-200" />
//                    <button type="button" onClick={() => removeImage(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600"><X size={12} /></button>
//                  </div>
//                ))}
//              </div>
//            )}
//         </div>

//         <div className="md:col-span-2 flex gap-3 mt-2">
//           <button type="button" onClick={onCancel} className="flex-1 py-2 border border-slate-300 rounded text-slate-600 font-bold hover:bg-slate-50">Cancel</button>
//           <button type="submit" className="flex-1 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 flex justify-center items-center gap-2">
//             <Save size={18}/> {initialData ? 'Update Product' : 'Save Product'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// // --- COMPONENT: ORDER MODAL (RICH VERSION) ---
// const OrderDetailModal = ({ order, onClose }) => {
//   if (!order) return null;

//   return (
//     <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//       <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
//         <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
//           <div>
//             <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
//               <FileText className="text-blue-600" size={20} /> Order #{order.id}
//             </h3>
//             <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
//               <Calendar size={14} /> {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}
//             </p>
//           </div>
//           <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition">
//             <XCircle size={28} />
//           </button>
//         </div>

//         <div className="overflow-y-auto p-6 flex-1">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//             <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
//               <h4 className="text-xs font-bold text-blue-800 uppercase mb-3 flex items-center gap-2"><User size={14}/> Customer Information</h4>
//               <div className="space-y-2 text-sm text-slate-700">
//                 <p><span className="font-semibold text-slate-900">Name:</span> {order.customer.name}</p>
//                 <p className="flex items-start gap-2"><span className="font-semibold text-slate-900 whitespace-nowrap">Phone:</span> {order.customer.phone}</p>
//                 <p><span className="font-semibold text-slate-900">Type:</span> <span className={`px-2 py-0.5 rounded text-xs font-bold ${order.type === 'wholesale' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{order.type.toUpperCase()}</span></p>
//               </div>
//             </div>
//             <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
//               <h4 className="text-xs font-bold text-slate-600 uppercase mb-3 flex items-center gap-2"><MapPin size={14}/> Delivery Address</h4>
//               <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{order.customer.address}</p>
//             </div>
//           </div>

//           <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Package size={16}/> Order Items</h4>
//           <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
//             <table className="w-full text-left text-sm">
//               <thead className="bg-slate-50 text-slate-500 font-medium">
//                 <tr>
//                   <th className="p-3">Product</th>
//                   <th className="p-3 text-center">Type</th>
//                   <th className="p-3">Breakdown</th>
//                   <th className="p-3 text-right">Price</th>
//                   <th className="p-3 text-right">Total</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {order.items.map((item, idx) => (
//                   <tr key={idx} className="hover:bg-slate-50/50">
//                     <td className="p-3">
//                       <div className="flex items-center gap-3">
//                         <img src={item.image} alt="" className="w-10 h-10 rounded object-cover bg-slate-100 border" />
//                         <span className="font-medium text-slate-900">{item.name}</span>
//                       </div>
//                     </td>
//                     <td className="p-3 text-center">
//                        {item.type === 'wholesale' 
//                          ? <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">BULK</span> 
//                          : <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">RETAIL</span>
//                        }
//                     </td>
//                     <td className="p-3">
//                       {item.type === 'wholesale' ? (
//                         <div className="grid grid-cols-4 gap-1 w-max">
//                           {Object.entries(item.breakdown).map(([size, qty]) => Number(qty) > 0 && (
//                             <div key={size} className="text-[10px] bg-white border rounded px-1 text-slate-500 whitespace-nowrap">
//                               UK{size}: <span className="font-bold text-slate-900">{qty}</span>
//                             </div>
//                           ))}
//                         </div>
//                       ) : (
//                         <span className="text-slate-500 text-xs">1 Pair (Standard)</span>
//                       )}
//                     </td>
//                     <td className="p-3 text-right text-slate-600">₹{item.price}</td>
//                     <td className="p-3 text-right font-bold text-slate-900">₹{item.price * item.quantity}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <div className="flex justify-end">
//             <div className="w-full md:w-64 bg-slate-50 p-4 rounded-lg border border-slate-200">
//               <div className="flex justify-between text-sm text-slate-600 mb-2">
//                 <span>Subtotal</span>
//                 <span>₹{Math.floor(order.total / (order.type === 'wholesale' ? 1.12 : 1)) }</span>
//               </div>
//               {order.type === 'wholesale' && (
//                 <div className="flex justify-between text-sm text-slate-600 mb-2">
//                   <span>GST (12%)</span>
//                   <span>₹{Math.floor(order.total - (order.total / 1.12))}</span>
//                 </div>
//               )}
//               <div className="flex justify-between font-bold text-lg text-slate-900 pt-3 border-t border-slate-200">
//                 <span>Total</span>
//                 <span>₹{Math.round(order.total)}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
//           <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-bold hover:bg-white transition">Close</button>
//           <button onClick={() => alert("Printing Feature would go here.")} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 flex items-center gap-2 transition"><ClipboardList size={18}/> Process Order</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- COMPONENT: ADMIN DASHBOARD (RICH VERSION) ---
// const AdminDashboard = ({ onLogout }) => {
//   const [activeTab, setActiveTab] = useState('orders');
//   const [products, setProducts] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [isEditing, setIsEditing] = useState(null);
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [editingProduct, setEditingProduct] = useState(null);

//   useEffect(() => {
//     refreshData();
//   }, []);

//   const refreshData = async () => {
//     try {
//       const p = await api.getProducts();
//       setProducts(p || []);
//       const o = await api.getOrders();
//       setOrders(o || []);
//     } catch (e) { console.error(e); }
//   };

//   const handleSaveProduct = async (product) => {
//     if (editingProduct) {
//       await api.updateProduct(product);
//       setEditingProduct(null);
//     } else {
//       await api.saveProduct(product);
//       setShowAddForm(false);
//     }
//     refreshData();
//   };

//   const handleEditClick = (product) => {
//     setEditingProduct(product);
//     setActiveTab('products');
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const handleDeleteProduct = async (id) => {
//     if (window.confirm("Delete product?")) {
//       await api.deleteProduct(id);
//       refreshData();
//     }
//   };

//   const pendingOrders = orders.filter(o => o.status === 'Pending').length;
//   const revenue = orders.reduce((acc, o) => acc + o.total, 0);

//   return (
//     <div className="container mx-auto px-4 py-8 bg-slate-50 min-h-screen">
//       {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
      
//       <div className="flex justify-between items-center mb-8">
//         <div><h2 className="text-2xl font-bold text-slate-900">Owner Dashboard</h2><p className="text-slate-500 text-sm">Manage Inventory & Orders</p></div>
//         <button onClick={onLogout} className="flex items-center gap-2 text-red-600 font-bold border border-red-200 bg-white px-4 py-2 rounded hover:bg-red-50"><LogOut size={18}/> Logout</button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4"><div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><ClipboardList /></div><div><p className="text-slate-500 text-sm">Total Orders</p><h3 className="text-2xl font-bold text-slate-900">{orders.length}</h3></div></div>
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4"><div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><Package /></div><div><p className="text-slate-500 text-sm">Pending</p><h3 className="text-2xl font-bold text-slate-900">{pendingOrders}</h3></div></div>
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4"><div className="p-3 bg-green-100 text-green-600 rounded-lg"><Users /></div><div><p className="text-slate-500 text-sm">Revenue (Est)</p><h3 className="text-2xl font-bold text-slate-900">₹{revenue.toLocaleString()}</h3></div></div>
//       </div>

//       <div className="flex gap-4 border-b border-slate-200 mb-6">
//         <button onClick={() => setActiveTab('orders')} className={`pb-3 px-4 font-bold text-sm ${activeTab === 'orders' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500'}`}>Incoming Orders</button>
//         <button onClick={() => setActiveTab('products')} className={`pb-3 px-4 font-bold text-sm ${activeTab === 'products' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500'}`}>Manage Products ({products.length})</button>
//       </div>

//       {activeTab === 'orders' ? (
//         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//           <table className="w-full text-left text-sm">
//             <thead className="bg-slate-50 text-slate-500"><tr><th className="p-4">ID</th><th className="p-4">Customer</th><th className="p-4">Type</th><th className="p-4">Total</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead>
//             <tbody className="divide-y divide-slate-100">
//               {orders.length === 0 ? <tr><td colSpan="6" className="p-8 text-center text-slate-400">No orders yet.</td></tr> : orders.map(order => (
//                 <tr key={order.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedOrder(order)}>
//                   <td className="p-4 font-mono text-xs">{order.id}</td>
//                   <td className="p-4 font-bold">{order.customer.name}<div className="text-xs font-normal text-slate-500">{order.customer.phone}</div></td>
//                   <td className="p-4 font-bold">₹{Math.round(order.total)}</td>
//                   <td className="p-4"><span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold">{order.status}</span></td>
//                   <td className="p-4"><button className="text-blue-600 border border-blue-200 px-3 py-1 rounded hover:bg-blue-50 text-xs font-bold">View</button></td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         <div>
//           <div className="flex justify-between items-center mb-6">
//             <h3 className="font-bold text-lg">Inventory</h3>
//             {!showAddForm && !editingProduct && <button onClick={() => setShowAddForm(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-800"><Plus size={18}/> Add Product</button>}
//           </div>
          
//           {(showAddForm || editingProduct) && (
//             <ProductForm initialData={editingProduct} onSave={handleSaveProduct} onCancel={() => { setShowAddForm(false); setEditingProduct(null); }} />
//           )}

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {products.map(p => (
//               <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 shadow-sm hover:shadow-md transition">
//                 <img src={p.images[0]} className="w-24 h-24 object-cover rounded-lg bg-slate-100" alt={p.name} />
//                 <div className="flex-1">
//                   <h4 className="font-bold text-slate-900">{p.name}</h4>
//                   <div className="text-xs text-slate-500 mb-2">{p.category}</div>
//                   <div className="flex gap-3 text-sm mb-2">
//                     <div><span className="text-[10px] uppercase text-slate-400 block">Retail</span><b>₹{p.retailPrice}</b></div>
//                     <div><span className="text-[10px] uppercase text-slate-400 block">Wholesale</span><b className="text-blue-600">₹{p.wholesalePrice}</b></div>
//                   </div>
//                   <div className="flex gap-2 mt-2">
//                     <button onClick={() => handleEditClick(p)} className="flex-1 bg-blue-50 text-blue-600 text-xs font-bold py-1.5 rounded hover:bg-blue-100 flex items-center justify-center gap-1"><Edit2 size={12}/> Edit</button>
//                     <button onClick={() => handleDeleteProduct(p.id)} className="flex-1 bg-red-50 text-red-600 text-xs font-bold py-1.5 rounded hover:bg-red-100 flex items-center justify-center gap-1"><Trash2 size={12}/> Remove</button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // --- COMPONENT: SHOP VIEW ---
// const ShopView = ({ products, mode, onAddToCart }) => {
//   const [filter, setFilter] = useState('All');
//   const [searchTerm, setSearchTerm] = useState('');
  
//   const filteredProducts = products.filter(p => {
//     const matchesCategory = filter === 'All' || p.category === filter;
//     const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
//         <div>
//           <h2 className="text-3xl font-bold text-slate-900">{mode === 'wholesale' ? 'Wholesale Catalog' : 'Shop Collection'}</h2>
//           <p className="text-slate-500 text-sm mt-1">{mode === 'wholesale' ? 'Bulk pricing applied. MOQ rules active.' : 'Latest trends from Agra.'}</p>
//         </div>
        
//         {/* Search Bar */}
//         <div className="relative w-full md:w-64">
//           <input 
//             type="text" 
//             placeholder="Search shoes..." 
//             className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
//         </div>
//       </div>

//       {/* Category Pills */}
//       <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4">
//         <Filter size={18} className="text-slate-400 shrink-0" />
//         {CATEGORIES.map(cat => (
//           <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${filter === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
//             {cat}
//           </button>
//         ))}
//       </div>

//       {filteredProducts.length === 0 ? (
//         <div className="text-center py-20 text-slate-400">No products found matching your search.</div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {filteredProducts.map(product => (
//             <ProductCard key={product.id} product={product} mode={mode} onAddToCart={onAddToCart} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// // --- COMPONENT: HOME VIEW ---
// const HomeView = ({ setView, mode }) => (
//   <>
//     <div className="bg-white border-b border-slate-200">
//       <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row items-center gap-10">
//         <div className="flex-1 text-center md:text-left">
//           <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold mb-6">
//             <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
//             {mode === 'wholesale' ? 'ACCEPTING NEW DISTRIBUTORS' : 'SEASONAL SALE IS LIVE'}
//           </div>
//           <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
//             {mode === 'wholesale' ? <>Factory Direct.<br /><span className="text-blue-600">Maximize Margins.</span></> : <>Handcrafted in Agra.<br /><span className="text-red-600">Worn Everywhere.</span></>}
//           </h1>
//           <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
//             {mode === 'wholesale' ? 'Connect directly with our 20-year-old manufacturing unit. Get transparent pricing, bulk shipping support, and custom branding options.' : 'Discover the finest leather shoes directly from the shoe capital of India. Premium quality, honest prices, delivered to your doorstep.'}
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
//             <button onClick={() => setView('shop')} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2">
//               {mode === 'wholesale' ? 'View Catalog' : 'Shop Collection'} <ArrowRight size={18} />
//             </button>
//           </div>
//         </div>
        
//         <div className="flex-1 w-full max-w-md md:max-w-full">
//            <div className="relative">
//              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-amber-50 rounded-2xl transform rotate-3"></div>
//              <img 
//                src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop" 
//                alt="Shoe Craftsmanship" 
//                className="relative rounded-2xl shadow-2xl w-full h-auto object-cover transform -rotate-2 hover:rotate-0 transition duration-700"
//              />
//              {mode === 'wholesale' && (
//                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3">
//                  <div className="bg-green-100 p-2 rounded-full text-green-600"><CheckCircle size={24} /></div>
//                  <div>
//                    <p className="text-sm font-bold text-slate-800">Verified Manufacturer</p>
//                    <p className="text-xs text-slate-500">GST Registered • IEC License</p>
//                  </div>
//                </div>
//              )}
//            </div>
//         </div>
//       </div>
//     </div>
//     <Features />
//   </>
// );

// // --- COMPONENT: CART VIEW ---
// const CartView = ({ cart, mode, removeFromCart, setView }) => {
//   const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
//   const totalGST = mode === 'wholesale' ? totalAmount * 0.12 : 0; // 12% GST for wholesale
//   const finalTotal = totalAmount + totalGST;

//   if (cart.length === 0) return (
//     <div className="container mx-auto px-4 py-20 text-center">
//       <ShoppingCart size={64} className="mx-auto text-slate-200 mb-4" />
//       <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
//       <button onClick={() => setView('shop')} className="text-blue-600 font-medium hover:underline">Start Shopping</button>
//     </div>
//   );

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h2 className="text-2xl font-bold text-slate-900 mb-8">Shopping Cart ({cart.length} items)</h2>
//       <div className="flex flex-col lg:flex-row gap-8">
//         <div className="flex-1 space-y-4">
//           {cart.map((item, idx) => (
//             <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl flex gap-4">
//               <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg bg-slate-100" />
//               <div className="flex-1">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h3 className="font-bold text-slate-900">{item.name}</h3>
//                     <p className="text-sm text-slate-500">{item.category}</p>
//                   </div>
//                   <button onClick={() => removeFromCart(idx)} className="text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
//                 </div>
                
//                 {item.type === 'wholesale' ? (
//                    <div className="mt-2 bg-slate-50 p-2 rounded text-xs text-slate-600 grid grid-cols-5 gap-2">
//                      {Object.entries(item.breakdown).map(([size, qty]) => Number(qty) > 0 && (
//                        <div key={size} className="text-center bg-white border border-slate-200 rounded px-1">
//                          <span className="block text-[10px] text-slate-400">UK {size}</span>
//                          <span className="font-bold">{qty}</span>
//                        </div>
//                      ))}
//                    </div>
//                 ) : (
//                   <div className="mt-2 text-sm text-slate-600">Qty: {item.quantity} Pair</div>
//                 )}
                
//                 <div className="mt-3 flex justify-between items-center">
//                    <div className="text-xs text-slate-500">{item.quantity} pairs x ₹{item.price}</div>
//                    <div className="font-bold text-slate-900">₹{item.quantity * item.price}</div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="w-full lg:w-96">
//           <div className="bg-white border border-slate-200 p-6 rounded-xl sticky top-24 shadow-sm">
//             <h3 className="font-bold text-lg mb-4">Order Summary</h3>
//             <div className="space-y-3 mb-6">
//               <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹{totalAmount}</span></div>
//               {mode === 'wholesale' && (
//                 <div className="flex justify-between text-slate-600"><span>GST (12%)</span><span>₹{totalGST.toFixed(0)}</span></div>
//               )}
//               <div className="flex justify-between text-slate-600"><span>Shipping</span><span>{mode === 'wholesale' ? 'To be calculated' : 'Free'}</span></div>
//               <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-lg text-slate-900">
//                 <span>Total</span><span>₹{finalTotal.toFixed(0)}</span>
//               </div>
//             </div>
//             <button onClick={() => setView('checkout')} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg">
//               Proceed to Checkout
//             </button>
//             <p className="text-xs text-slate-400 text-center mt-3">Secure Checkout via Agra Shoe Mart</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- COMPONENT: CHECKOUT VIEW ---
// const CheckoutView = ({ cart, mode, placeOrder, setView }) => {
//   const [form, setForm] = useState({ name: '', phone: '', address: '' });
  
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     placeOrder(form);
//   };

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-2xl">
//       <button onClick={() => setView('cart')} className="text-sm text-slate-500 hover:text-slate-900 mb-6">← Back to Cart</button>
//       <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
//         <h2 className="text-2xl font-bold text-slate-900 mb-6">{mode === 'wholesale' ? 'Request Bulk Quote' : 'Checkout'}</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Full Name / Shop Name</label>
//             <input required type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number (WhatsApp)</label>
//             <input required type="tel" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Address</label>
//             <textarea required rows="3" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.address} onChange={e => setForm({...form, address: e.target.value})}></textarea>
//           </div>
          
//           <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
//             {mode === 'wholesale' 
//               ? "Note: This is a quote request. Our sales team will contact you on WhatsApp to confirm availability and shipping costs before payment."
//               : "Note: Cash on Delivery is available for Agra. Online payment link will be sent for other cities."
//             }
//           </div>

//           <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-md">
//             {mode === 'wholesale' ? 'Submit Quote Request' : 'Place Order'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// // --- COMPONENT: LOGIN VIEW ---
// const LoginView = ({ onLoginSuccess }) => {
//   const [isRegistering, setIsRegistering] = useState(false);
//   const [form, setForm] = useState({ name: '', phone: '', password: '' });
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
    
//     // Admin Backdoor
//     if (form.phone === 'admin' || form.phone === 'admin@agra.com') {
//         const res = await api.login(form.phone, form.password);
//         if(res && res.success) onLoginSuccess({ ...res.user, role: 'admin' });
//         return;
//     }

//     if (isRegistering) {
//       if (!form.name || !form.phone || !form.password) return setError("All fields required");
//       const res = await api.signup(form);
//       if (res && res.success) onLoginSuccess(res.user);
//       else setError(res?.message || "Registration failed");
//     } else {
//       if (!form.phone || !form.password) return setError("Enter credentials");
//       const res = await api.login(form.phone, form.password);
//       if (res && res.success) onLoginSuccess(res.user);
//       else setError(res?.message || "Login failed");
//     }
//   };

//   return (
//     <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-slate-50">
//       <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-xl shadow-xl">
//         <div className="text-center mb-8">
//           <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg"><Package size={32}/></div>
//           <h2 className="text-2xl font-bold text-slate-900">{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
//           <p className="text-slate-500 mt-2">{isRegistering ? 'Join the largest wholesale network in Agra' : 'Enter mobile to access wholesale rates'}</p>
//         </div>

//         {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4 text-center border border-red-100">{error}</div>}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {isRegistering && (
//             <div className="animate-in fade-in slide-in-from-top-2">
//               <label className="block text-sm font-bold text-slate-700 mb-1">Full Name / Shop Name</label>
//               <input type="text" className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition" placeholder="Agra Footwear Co." value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
//             </div>
//           )}
//           <div>
//             <label className="block text-sm font-bold text-slate-700 mb-1">Mobile Number</label>
//             <input type="tel" className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition" placeholder="98765XXXXX" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
//           </div>
//           <div>
//             <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
//             <input type="password" className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
//           </div>
//           <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg transform hover:-translate-y-0.5">
//             {isRegistering ? 'Register Now' : 'Login Securely'}
//           </button>
//         </form>

//         <div className="mt-8 text-center pt-6 border-t border-slate-100">
//           <p className="text-slate-500 text-sm mb-2">{isRegistering ? 'Already have an account?' : 'New to Agra Shoe Mart?'}</p>
//           <button onClick={() => setIsRegistering(!isRegistering)} className="text-blue-600 font-bold hover:underline text-sm">
//             {isRegistering ? 'Login Instead' : 'Create New Account'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- MAIN CONTROLLER ---
// const App = () => {
//   const [view, setView] = useState('home');
//   const [user, setUser] = useState(null);
//   const [mode, setMode] = useState('retail'); 
//   const [cart, setCart] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [showToast, setShowToast] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   useEffect(() => {
//     const fetchProds = async () => {
//       const res = await api.getProducts();
//       setProducts(res || []);
//     };
//     fetchProds();
//   }, []);

//   const handleLogin = (userData) => {
//     setUser(userData);
//     if (userData.role === 'admin') setView('admin');
//     else {
//       setMode('wholesale');
//       setView('shop');
//     }
//   };

//   const handleLogout = () => {
//     if (window.confirm("Logout?")) {
//       api.logout();
//       setUser(null);
//       setMode('retail');
//       setView('home');
//     }
//   };

//   const addToCart = (item) => {
//     if (!user) return alert("Please Login to Shop");
//     setCart([...cart, item]);
//     setShowToast(true);
//     setTimeout(() => setShowToast(false), 3000);
//   };

//   const removeFromCart = (index) => {
//     const newCart = [...cart];
//     newCart.splice(index, 1);
//     setCart(newCart);
//   };

//   const placeOrder = async (details) => {
//     const total = cart.reduce((a, b) => a + (b.price * b.quantity), 0);
//     await api.createOrder({ customer: details, items: cart, total });
//     setCart([]);
//     setView('success');
//   };

//   if (view === 'admin') return <AdminDashboard onLogout={handleLogout} />;
//   if (view === 'login') return <LoginView onLoginSuccess={handleLogin} />;
  
//   return (
//     <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
//       {/* Navbar */}
//       <nav className="bg-white shadow-md sticky top-0 z-50">
//         <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 flex justify-between items-center">
//           <span className="hidden sm:inline">Agra's Trusted Shoe Wholesaler - Since 2003</span>
//           <div className="flex items-center gap-4">
//             <span className="flex items-center gap-1 hover:text-white cursor-pointer transition">
//               <Phone size={14} /> +91 98765-XXXXX
//             </span>
//             <span className="text-amber-500 font-bold cursor-pointer hover:underline hidden sm:block">
//               Request Sample Kit
//             </span>
//           </div>
//         </div>

//         <div className="container mx-auto px-4 py-4">
//           <div className="flex justify-between items-center">
//             <div onClick={() => setView('home')} className="flex items-center gap-2 cursor-pointer">
//               <div className="bg-red-600 text-white p-1 rounded font-bold text-xl">ASM</div>
//               <div className="text-2xl font-bold tracking-tighter text-slate-800 leading-none">
//                 AGRA<span className="text-red-600">SHOES</span>
//               </div>
//             </div>

//             <div className="hidden md:flex gap-8 font-medium text-slate-600 text-sm">
//               <button onClick={() => setView('home')} className="hover:text-red-600 transition">Home</button>
//               <button onClick={() => setView('shop')} className="hover:text-red-600 transition">Shop Catalog</button>
//               <button onClick={() => setView('shop')} className="hover:text-red-600 transition">New Arrivals</button>
//             </div>

//             <div className="flex items-center gap-4">
//               <div className="hidden md:flex bg-slate-100 rounded-full p-1 border border-slate-200 mr-2">
//                 <button onClick={() => setMode('retail')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${mode === 'retail' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Retail</button>
//                 <button onClick={() => setMode('wholesale')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${mode === 'wholesale' ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}>Wholesale</button>
//               </div>

//               <button onClick={() => setView('cart')} className="relative p-2 hover:bg-slate-100 rounded-full transition group">
//                 <ShoppingCart size={22} className="text-slate-700 group-hover:text-red-600" />
//                 {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">{cart.length}</span>}
//               </button>
              
//               {user ? (
//                 <div className="flex items-center gap-2">
//                   <button onClick={() => user.type === 'admin' ? setView('admin') : setView('home')} className="flex items-center gap-2 font-bold text-sm bg-slate-100 px-3 py-2 rounded-lg hover:bg-slate-200 transition">
//                     <User size={18}/> <span className="hidden sm:inline">{user.name}</span>
//                   </button>
//                   <button onClick={handleLogout} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition shadow-sm" title="Logout">
//                     <LogOut size={18} />
//                   </button>
//                 </div>
//               ) : (
//                 <button onClick={() => setView('login')} className="hidden sm:flex bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm">Login</button>
//               )}

//               <button className="md:hidden text-slate-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
//                   {isMobileMenuOpen ? <X /> : <Menu />}
//               </button>
//             </div>
//           </div>

//           {isMobileMenuOpen && (
//             <div className="md:hidden mt-4 pb-4 border-t pt-4">
//                 <div className="flex bg-slate-100 rounded-lg p-1 mb-4">
//                 <button onClick={() => { setMode('retail'); setIsMobileMenuOpen(false); }} className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === 'retail' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Retail</button>
//                 <button onClick={() => { setMode('wholesale'); setIsMobileMenuOpen(false); }} className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === 'wholesale' ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}>Wholesale</button>
//               </div>
//               <div className="space-y-3 text-slate-700 font-medium">
//                 <button onClick={() => { setView('home'); setIsMobileMenuOpen(false); }} className="block w-full text-left hover:text-red-600">Home</button>
//                 <button onClick={() => { setView('shop'); setIsMobileMenuOpen(false); }} className="block w-full text-left hover:text-red-600">Shop Catalog</button>
//                 <button onClick={() => { setView('login'); setIsMobileMenuOpen(false); }} className="block w-full text-left text-blue-600">Login / Register</button>
//               </div>
//             </div>
//           )}
//         </div>
//       </nav>

//       <main className="flex-1">
//         {view === 'home' && <HomeView setView={setView} mode={mode} />}
//         {view === 'shop' && <ShopView products={products} mode={mode} onAddToCart={addToCart} />}
//         {view === 'cart' && <CartView cart={cart} mode={mode} removeFromCart={removeFromCart} setView={setView} />}
//         {view === 'checkout' && <CheckoutView cart={cart} mode={mode} placeOrder={placeOrder} setView={setView} />}
//         {view === 'success' && (
//           <div className="text-center py-20">
//             <CheckCircle size={64} className="mx-auto text-green-500 mb-4"/>
//             <h2 className="text-3xl font-bold">Order Received!</h2>
//             <button onClick={() => setView('home')} className="mt-4 text-blue-600 font-bold">Back Home</button>
//           </div>
//         )}
//       </main>
      
//       {showToast && (
//         <div className="fixed bottom-4 right-4 bg-black text-white px-6 py-3 rounded shadow-lg flex gap-2 animate-bounce">
//           <CheckCircle size={20} className="text-green-400"/> Added to Cart
//         </div>
//       )}
      
//       <footer className="bg-slate-900 text-slate-400 py-12">
//         <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
//           <div>
//             <h4 className="text-white font-bold text-lg mb-4">AGRA SHOES</h4>
//             <p className="mb-4">Digitizing the legacy of Agra's shoemaking. We connect manufacturers directly to retailers across India.</p>
//             <p>Agra, Uttar Pradesh, India - 282002</p>
//           </div>
//           <div>
//             <h4 className="text-white font-bold mb-4">Shop</h4>
//             <ul className="space-y-2">
//               <li className="hover:text-white cursor-pointer">Men's Formal</li>
//               <li className="hover:text-white cursor-pointer">Casual Loafers</li>
//               <li className="hover:text-white cursor-pointer">Safety Shoes</li>
//               <li className="hover:text-white cursor-pointer">School Shoes</li>
//             </ul>
//           </div>
//           <div>
//             <h4 className="text-white font-bold mb-4">Wholesale</h4>
//             <ul className="space-y-2">
//               <li className="hover:text-white cursor-pointer">Register as Distributor</li>
//               <li className="hover:text-white cursor-pointer">Bulk Pricing Policy</li>
//               <li className="hover:text-white cursor-pointer">Shipping & Logistics</li>
//               <li className="hover:text-white cursor-pointer">Return Policy</li>
//             </ul>
//           </div>
//           <div>
//             <h4 className="text-white font-bold mb-4">Stay Connected</h4>
//             <p className="mb-4">Get latest design updates on WhatsApp.</p>
//             <div className="flex gap-2">
//               <input type="text" placeholder="+91 Mobile Number" className="bg-slate-800 border-none rounded px-3 py-2 w-full text-white outline-none focus:ring-1 focus:ring-slate-600" />
//               <button className="bg-green-600 text-white px-3 py-2 rounded font-bold hover:bg-green-700">Join</button>
//             </div>
//           </div>
//         </div>
//         <div className="text-center mt-12 pt-8 border-t border-slate-800">
//           &copy; 2025 Agra Wholesale Shoe Mart. All rights reserved.
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default App;
// import React, { useState, useEffect } from 'react';
// import { 
//   ShoppingCart, User, Phone, Menu, X, CheckCircle, Truck, 
//   ShieldCheck, Info, Package, ArrowRight, Trash2, Filter, 
//   Search, ClipboardList, Users, LogOut, Plus, Save,
//   ChevronLeft, ChevronRight, Upload, XCircle, FileText, MapPin, Calendar, Edit2
// } from 'lucide-react';

// // --- API CONNECTOR ---
// const API_URL = 'http://localhost:5000/api';

// const api = {
//   request: async (endpoint, method = 'GET', body = null) => {
//     try {
//       const options = {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//       };
//       if (body) options.body = JSON.stringify(body);
      
//       const response = await fetch(`${API_URL}${endpoint}`, options);
//       return await response.json();
//     } catch (error) {
//       console.error("Connection Error:", error);
//       return null;
//     }
//   },

//   // Products
//   getProducts: () => api.request('/products'),
//   saveProduct: (product) => api.request('/products', 'POST', product),
//   updateProduct: (product) => api.request(`/products/${product.id}`, 'PUT', product),
//   deleteProduct: (id) => api.request(`/products/${id}`, 'DELETE'),

//   // Orders
//   getOrders: () => api.request('/orders'),
//   createOrder: (order) => api.request('/orders', 'POST', order),

//   // Auth
//   login: (phone, password) => api.request('/auth/login', 'POST', { phone, password }),
//   signup: (userData) => api.request('/auth/signup', 'POST', userData),
// };

// const CATEGORIES = ['All', 'Men\'s Formal', 'Office Wear', 'Women\'s Comfort', 'Men\'s Boots', 'Casual', 'School'];

// // --- COMPONENT: FEATURES ---
// const Features = () => (
//   <div className="bg-slate-50 py-12 border-y border-slate-200">
//     <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-blue-600"><Truck /></div>
//         <h3 className="font-bold text-slate-800 mb-2">Nationwide Delivery</h3>
//         <p className="text-sm text-slate-500 px-4">From Agra to anywhere in India. We use trusted B2B logistics partners.</p>
//       </div>
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-amber-500"><ShieldCheck /></div>
//         <h3 className="font-bold text-slate-800 mb-2">Quality Guarantee</h3>
//         <p className="text-sm text-slate-500 px-4">Every pair is inspected before packing. 20 years of reputation at stake.</p>
//       </div>
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-red-600"><Info /></div>
//         <h3 className="font-bold text-slate-800 mb-2">Direct Support</h3>
//         <p className="text-sm text-slate-500 px-4">Call us anytime. We believe in building relationships, not just sales.</p>
//       </div>
//     </div>
//   </div>
// );

// // --- COMPONENT: PRODUCT CARD (RICH VERSION) ---
// const ProductCard = ({ product, mode, onAddToCart }) => {
//   const [currentImgIndex, setCurrentImgIndex] = useState(0);
//   const [showMatrix, setShowMatrix] = useState(false);
  
//   // Robust data handling
//   const sizes = product.sizes || [];
//   const images = product.images && product.images.length > 0 ? product.images : ['https://via.placeholder.com/300?text=No+Image'];
  
//   const [quantities, setQuantities] = useState(
//     sizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {})
//   );
  
//   const totalPairs = Object.values(quantities).reduce((a, b) => a + Number(b), 0);
//   const price = mode === 'retail' ? Number(product.retailPrice) : Number(product.wholesalePrice);
//   const matrixTotalCost = totalPairs * price;

//   const nextImage = (e) => {
//     e.stopPropagation();
//     setCurrentImgIndex((prev) => (prev + 1) % images.length);
//   };

//   const prevImage = (e) => {
//     e.stopPropagation();
//     setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
//   };

//   const handleWholesaleAdd = () => {
//     if (totalPairs < product.moq) {
//       alert(`Minimum Order Quantity is ${product.moq} pairs.`);
//       return;
//     }
//     onAddToCart({
//       ...product,
//       type: 'wholesale',
//       breakdown: quantities,
//       quantity: totalPairs,
//       price: product.wholesalePrice,
//       image: images[0]
//     });
//     setQuantities(sizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {}));
//     setShowMatrix(false);
//   };

//   const handleRetailAdd = () => {
//     onAddToCart({
//       ...product,
//       type: 'retail',
//       quantity: 1,
//       price: product.retailPrice,
//       image: images[0]
//     });
//   };

//   return (
//     <div className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
//       {/* Image Carousel Section */}
//       <div className="relative h-64 bg-slate-100 group">
//         <img 
//           src={images[currentImgIndex]} 
//           alt={product.name} 
//           className="w-full h-full object-cover transition-transform duration-500" 
//         />
        
//         {/* Tags */}
//         {product.tag && <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] uppercase font-bold px-2 py-1 rounded backdrop-blur-sm z-10">{product.tag}</span>}
//         {mode === 'wholesale' && <span className="absolute top-2 left-2 bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">MOQ: {product.moq}</span>}

//         {/* Carousel Controls */}
//         {images.length > 1 && (
//           <>
//             <button 
//               onClick={prevImage} 
//               className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full text-slate-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
//             >
//               <ChevronLeft size={20} />
//             </button>
//             <button 
//               onClick={nextImage} 
//               className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full text-slate-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
//             >
//               <ChevronRight size={20} />
//             </button>
            
//             <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
//               {images.map((_, idx) => (
//                 <div 
//                   key={idx} 
//                   className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImgIndex ? 'bg-white scale-125' : 'bg-white/50'}`} 
//                 />
//               ))}
//             </div>
//           </>
//         )}
//       </div>

//       {/* Details Section */}
//       <div className="p-4 flex-1 flex flex-col">
//         <div className="mb-2">
//           <span className="text-xs text-slate-500 uppercase tracking-wide">{product.category}</span>
//           <h3 className="text-lg font-bold text-slate-800 leading-tight">{product.name}</h3>
//         </div>
        
//         <div className="mt-auto pt-4 border-t border-slate-100">
//           <div className="flex justify-between items-end mb-4">
//             <div>
//               <p className="text-xs text-slate-500 mb-0.5">Price per pair</p>
//               <div className="flex items-baseline gap-2">
//                 <span className="text-xl font-bold text-slate-900">₹{price}</span>
//                 {mode === 'retail' && <span className="text-xs text-red-500 line-through">₹{Math.floor(price * 1.2)}</span>}
//               </div>
//               {mode === 'wholesale' && <p className="text-[10px] text-red-600 font-medium">*Excl. GST</p>}
//             </div>
            
//             {mode === 'retail' ? (
//               <button onClick={handleRetailAdd} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-200">Add</button>
//             ) : (
//               <button onClick={() => setShowMatrix(!showMatrix)} className={`px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg ${showMatrix ? 'bg-slate-200 text-slate-800' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}>{showMatrix ? 'Close' : 'Bulk'}</button>
//             )}
//           </div>

//           {mode === 'wholesale' && showMatrix && (
//             <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2">
//               <div className="flex justify-between items-center mb-2">
//                  <span className="text-[10px] font-bold text-slate-500">SELECT SIZES</span>
//               </div>
//               <div className="grid grid-cols-5 gap-1 mb-3">
//                 {sizes.map((size) => (
//                   <div key={size} className="text-center">
//                     <label className="block text-[10px] text-slate-500">UK {size}</label>
//                     <input type="number" min="0" value={quantities[size] || ''} onChange={(e) => setQuantities(prev => ({...prev, [size]: e.target.value}))} className="w-full border border-slate-300 rounded p-1 text-center text-xs" placeholder="0" />
//                   </div>
//                 ))}
//               </div>
//               <div className="flex justify-between text-xs mb-2">
//                 <span>Pairs: <strong>{totalPairs}</strong></span>
//                 <span>Total: <strong className="text-blue-600">₹{matrixTotalCost}</strong></span>
//               </div>
//               <button onClick={handleWholesaleAdd} disabled={totalPairs === 0} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white py-1.5 rounded text-xs font-bold uppercase">Add Batch</button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- COMPONENT: ADMIN PRODUCT FORM (RICH VERSION) ---
// const ProductForm = ({ initialData, onSave, onCancel }) => {
//   const [formData, setFormData] = useState(initialData ? {
//     ...initialData,
//     sizes: initialData.sizes.join(',') 
//   } : {
//     name: '', category: 'Men\'s Formal', retailPrice: '', wholesalePrice: '', 
//     moq: 24, stock: 100, sizes: '6,7,8,9,10', tag: '', 
//     images: [] 
//   });
  
//   const [urlInput, setUrlInput] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (formData.images.length === 0) {
//       alert("Please upload at least one image.");
//       return;
//     }
//     const productToSave = {
//       ...formData,
//       retailPrice: Number(formData.retailPrice),
//       wholesalePrice: Number(formData.wholesalePrice),
//       moq: Number(formData.moq),
//       stock: Number(formData.stock),
//       sizes: typeof formData.sizes === 'string' ? formData.sizes.split(',').map(s => Number(s.trim())) : formData.sizes
//     };
//     onSave(productToSave);
//   };

//   // Convert File to Base64 for sending to Node Backend
//   const handleImageUpload = (e) => {
//     if (e.target.files && e.target.files.length > 0) {
//       Array.from(e.target.files).forEach(file => {
//         const reader = new FileReader();
//         reader.onloadend = () => {
//           setFormData(prev => ({ ...prev, images: [...prev.images, reader.result] }));
//         };
//         reader.readAsDataURL(file);
//       });
//     }
//   };

//   const handleAddUrl = () => {
//     if(urlInput) {
//       setFormData(prev => ({...prev, images: [...prev.images, urlInput]}));
//       setUrlInput('');
//     }
//   };

//   const removeImage = (indexToRemove) => {
//     setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== indexToRemove) }));
//   };

//   const fillRandomImage = () => {
//     const urls = [
//       'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800',
//       'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800',
//       'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=800',
//       'https://images.unsplash.com/photo-1560769629-975e13f0c470?q=80&w=800'
//     ];
//     setFormData(prev => ({...prev, images: [...prev.images, urls[Math.floor(Math.random() * urls.length)]]}));
//   };

//   return (
//     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg mb-8 animate-in fade-in slide-in-from-bottom-4">
//       <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
//         {initialData ? <Edit2 className="text-blue-600" /> : <Plus className="text-green-600" />} 
//         {initialData ? 'Edit Product' : 'Add New Product'}
//       </h3>
//       <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {/* Form Fields */}
//         <div className="md:col-span-2">
//           <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Product Name</label>
//           <input required type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-slate-900 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Leather Oxford Pro" />
//         </div>
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Category</label>
//            <select className="w-full border p-2 rounded outline-none bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
//              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
//            </select>
//         </div>
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Sizes (Comma Sep)</label>
//            <input required type="text" className="w-full border p-2 rounded outline-none" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} placeholder="6, 7, 8, 11, 12" />
//         </div>
//         <div className="grid grid-cols-2 gap-2">
//            <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Retail Price (₹)</label><input required type="number" className="w-full border p-2 rounded outline-none" value={formData.retailPrice} onChange={e => setFormData({...formData, retailPrice: e.target.value})} /></div>
//            <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Wholesale Price (₹)</label><input required type="number" className="w-full border p-2 rounded outline-none" value={formData.wholesalePrice} onChange={e => setFormData({...formData, wholesalePrice: e.target.value})} /></div>
//         </div>
//         <div className="grid grid-cols-2 gap-2">
//            <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Min Order Qty</label><input required type="number" className="w-full border p-2 rounded outline-none" value={formData.moq} onChange={e => setFormData({...formData, moq: e.target.value})} /></div>
//            <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Stock Qty</label><input required type="number" className="w-full border p-2 rounded outline-none" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} /></div>
//         </div>
//         <div className="md:col-span-2">
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Tag / Status</label>
//            <input type="text" className="w-full border p-2 rounded outline-none" value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})} placeholder="Out of Stock / Best Seller" />
//         </div>
        
//         {/* IMAGE UPLOAD SECTION */}
//         <div className="md:col-span-2">
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Product Images</label>
           
//            {/* File Upload */}
//            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition cursor-pointer relative mb-3">
//              <input 
//                 type="file" 
//                 multiple 
//                 accept="image/*"
//                 onChange={handleImageUpload}
//                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//              />
//              <Upload className="mx-auto text-slate-400 mb-2" />
//              <p className="text-sm text-slate-500 font-medium">Click to select images from device</p>
//              <p className="text-[10px] text-slate-400">(Images are converted to Base64 for the backend)</p>
//            </div>

//            {/* URL Input */}
//            <div className="flex gap-2 mb-3">
//              <input type="text" placeholder="Or paste Image URL here..." className="flex-1 border p-2 rounded text-sm outline-none" value={urlInput} onChange={e => setUrlInput(e.target.value)} />
//              <button type="button" onClick={handleAddUrl} className="bg-slate-200 px-3 rounded font-bold text-sm hover:bg-slate-300">Add URL</button>
//              <button type="button" onClick={fillRandomImage} className="bg-blue-100 text-blue-700 px-3 rounded font-bold text-sm hover:bg-blue-200">Random</button>
//            </div>

//            {/* Preview Strip */}
//            {formData.images.length > 0 && (
//              <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
//                {formData.images.map((img, idx) => (
//                  <div key={idx} className="relative shrink-0 w-20 h-20 group">
//                    <img src={img} alt="Preview" className="w-full h-full object-cover rounded-lg border border-slate-200" />
//                    <button type="button" onClick={() => removeImage(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600"><X size={12} /></button>
//                  </div>
//                ))}
//              </div>
//            )}
//         </div>

//         <div className="md:col-span-2 flex gap-3 mt-2">
//           <button type="button" onClick={onCancel} className="flex-1 py-2 border border-slate-300 rounded text-slate-600 font-bold hover:bg-slate-50">Cancel</button>
//           <button type="submit" className="flex-1 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 flex justify-center items-center gap-2">
//             <Save size={18}/> {initialData ? 'Update Product' : 'Save Product'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// // --- COMPONENT: ORDER MODAL (RICH VERSION) ---
// const OrderDetailModal = ({ order, onClose }) => {
//   if (!order) return null;

//   return (
//     <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//       <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
//         <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
//           <div>
//             <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
//               <FileText className="text-blue-600" size={20} /> Order #{order.id}
//             </h3>
//             <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
//               <Calendar size={14} /> {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}
//             </p>
//           </div>
//           <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition">
//             <XCircle size={28} />
//           </button>
//         </div>

//         <div className="overflow-y-auto p-6 flex-1">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//             <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
//               <h4 className="text-xs font-bold text-blue-800 uppercase mb-3 flex items-center gap-2"><User size={14}/> Customer Information</h4>
//               <div className="space-y-2 text-sm text-slate-700">
//                 <p><span className="font-semibold text-slate-900">Name:</span> {order.customer.name}</p>
//                 <p className="flex items-start gap-2"><span className="font-semibold text-slate-900 whitespace-nowrap">Phone:</span> {order.customer.phone}</p>
//                 <p><span className="font-semibold text-slate-900">Type:</span> <span className={`px-2 py-0.5 rounded text-xs font-bold ${order.type === 'wholesale' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{order.type.toUpperCase()}</span></p>
//               </div>
//             </div>
//             <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
//               <h4 className="text-xs font-bold text-slate-600 uppercase mb-3 flex items-center gap-2"><MapPin size={14}/> Delivery Address</h4>
//               <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{order.customer.address}</p>
//             </div>
//           </div>

//           <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Package size={16}/> Order Items</h4>
//           <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
//             <table className="w-full text-left text-sm">
//               <thead className="bg-slate-50 text-slate-500 font-medium">
//                 <tr>
//                   <th className="p-3">Product</th>
//                   <th className="p-3 text-center">Type</th>
//                   <th className="p-3">Breakdown</th>
//                   <th className="p-3 text-right">Price</th>
//                   <th className="p-3 text-right">Total</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {order.items.map((item, idx) => (
//                   <tr key={idx} className="hover:bg-slate-50/50">
//                     <td className="p-3">
//                       <div className="flex items-center gap-3">
//                         <img src={item.image} alt="" className="w-10 h-10 rounded object-cover bg-slate-100 border" />
//                         <span className="font-medium text-slate-900">{item.name}</span>
//                       </div>
//                     </td>
//                     <td className="p-3 text-center">
//                        {item.type === 'wholesale' 
//                          ? <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">BULK</span> 
//                          : <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">RETAIL</span>
//                        }
//                     </td>
//                     <td className="p-3">
//                       {item.type === 'wholesale' ? (
//                         <div className="grid grid-cols-4 gap-1 w-max">
//                           {Object.entries(item.breakdown).map(([size, qty]) => Number(qty) > 0 && (
//                             <div key={size} className="text-[10px] bg-white border rounded px-1 text-slate-500 whitespace-nowrap">
//                               UK{size}: <span className="font-bold text-slate-900">{qty}</span>
//                             </div>
//                           ))}
//                         </div>
//                       ) : (
//                         <span className="text-slate-500 text-xs">1 Pair (Standard)</span>
//                       )}
//                     </td>
//                     <td className="p-3 text-right text-slate-600">₹{item.price}</td>
//                     <td className="p-3 text-right font-bold text-slate-900">₹{item.price * item.quantity}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <div className="flex justify-end">
//             <div className="w-full md:w-64 bg-slate-50 p-4 rounded-lg border border-slate-200">
//               <div className="flex justify-between text-sm text-slate-600 mb-2">
//                 <span>Subtotal</span>
//                 <span>₹{Math.floor(order.total / (order.type === 'wholesale' ? 1.12 : 1)) }</span>
//               </div>
//               {order.type === 'wholesale' && (
//                 <div className="flex justify-between text-sm text-slate-600 mb-2">
//                   <span>GST (12%)</span>
//                   <span>₹{Math.floor(order.total - (order.total / 1.12))}</span>
//                 </div>
//               )}
//               <div className="flex justify-between font-bold text-lg text-slate-900 pt-3 border-t border-slate-200">
//                 <span>Total</span>
//                 <span>₹{Math.round(order.total)}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
//           <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-bold hover:bg-white transition">Close</button>
//           <button onClick={() => alert("Printing Feature would go here.")} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 flex items-center gap-2 transition"><ClipboardList size={18}/> Process Order</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- COMPONENT: ADMIN DASHBOARD (RICH VERSION) ---
// const AdminDashboard = ({ onLogout }) => {
//   const [activeTab, setActiveTab] = useState('orders');
//   const [products, setProducts] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [isEditing, setIsEditing] = useState(null);
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [editingProduct, setEditingProduct] = useState(null);

//   useEffect(() => {
//     refreshData();
//   }, []);

//   const refreshData = async () => {
//     try {
//       const p = await api.getProducts();
//       setProducts(p || []);
//       const o = await api.getOrders();
//       setOrders(o || []);
//     } catch (e) { console.error(e); }
//   };

//   const handleSaveProduct = async (product) => {
//     if (editingProduct) {
//       await api.updateProduct(product);
//       setEditingProduct(null);
//     } else {
//       await api.saveProduct(product);
//       setShowAddForm(false);
//     }
//     refreshData();
//   };

//   const handleEditClick = (product) => {
//     setEditingProduct(product);
//     setActiveTab('products');
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const handleDeleteProduct = async (id) => {
//     if (window.confirm("Delete product?")) {
//       await api.deleteProduct(id);
//       refreshData();
//     }
//   };

//   const pendingOrders = orders.filter(o => o.status === 'Pending').length;
//   const revenue = orders.reduce((acc, o) => acc + o.total, 0);

//   return (
//     <div className="container mx-auto px-4 py-8 bg-slate-50 min-h-screen">
//       {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
      
//       <div className="flex justify-between items-center mb-8">
//         <div><h2 className="text-2xl font-bold text-slate-900">Owner Dashboard</h2><p className="text-slate-500 text-sm">Manage Inventory & Orders</p></div>
//         <button onClick={onLogout} className="flex items-center gap-2 text-red-600 font-bold border border-red-200 bg-white px-4 py-2 rounded hover:bg-red-50"><LogOut size={18}/> Logout</button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4"><div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><ClipboardList /></div><div><p className="text-slate-500 text-sm">Total Orders</p><h3 className="text-2xl font-bold text-slate-900">{orders.length}</h3></div></div>
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4"><div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><Package /></div><div><p className="text-slate-500 text-sm">Pending</p><h3 className="text-2xl font-bold text-slate-900">{pendingOrders}</h3></div></div>
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4"><div className="p-3 bg-green-100 text-green-600 rounded-lg"><Users /></div><div><p className="text-slate-500 text-sm">Revenue (Est)</p><h3 className="text-2xl font-bold text-slate-900">₹{revenue.toLocaleString()}</h3></div></div>
//       </div>

//       <div className="flex gap-4 border-b border-slate-200 mb-6">
//         <button onClick={() => setActiveTab('orders')} className={`pb-3 px-4 font-bold text-sm ${activeTab === 'orders' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500'}`}>Incoming Orders</button>
//         <button onClick={() => setActiveTab('products')} className={`pb-3 px-4 font-bold text-sm ${activeTab === 'products' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500'}`}>Manage Products ({products.length})</button>
//       </div>

//       {activeTab === 'orders' ? (
//         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//           <table className="w-full text-left text-sm">
//             <thead className="bg-slate-50 text-slate-500"><tr><th className="p-4">ID</th><th className="p-4">Customer</th><th className="p-4">Type</th><th className="p-4">Total</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead>
//             <tbody className="divide-y divide-slate-100">
//               {orders.length === 0 ? <tr><td colSpan="6" className="p-8 text-center text-slate-400">No orders yet.</td></tr> : orders.map(order => (
//                 <tr key={order.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedOrder(order)}>
//                   <td className="p-4 font-mono text-xs">{order.id}</td>
//                   <td className="p-4 font-bold">{order.customer.name}<div className="text-xs font-normal text-slate-500">{order.customer.phone}</div></td>
//                   <td className="p-4 font-bold">₹{Math.round(order.total)}</td>
//                   <td className="p-4"><span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold">{order.status}</span></td>
//                   <td className="p-4"><button className="text-blue-600 border border-blue-200 px-3 py-1 rounded hover:bg-blue-50 text-xs font-bold">View</button></td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         <div>
//           <div className="flex justify-between items-center mb-6">
//             <h3 className="font-bold text-lg">Inventory</h3>
//             {!showAddForm && !editingProduct && <button onClick={() => setShowAddForm(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-800"><Plus size={18}/> Add Product</button>}
//           </div>
          
//           {(showAddForm || editingProduct) && (
//             <ProductForm initialData={editingProduct} onSave={handleSaveProduct} onCancel={() => { setShowAddForm(false); setEditingProduct(null); }} />
//           )}

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {products.map(p => (
//               <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 shadow-sm hover:shadow-md transition">
//                 <img src={p.images[0]} className="w-24 h-24 object-cover rounded-lg bg-slate-100" alt={p.name} />
//                 <div className="flex-1">
//                   <h4 className="font-bold text-slate-900">{p.name}</h4>
//                   <div className="text-xs text-slate-500 mb-2">{p.category}</div>
//                   <div className="flex gap-3 text-sm mb-2">
//                     <div><span className="text-[10px] uppercase text-slate-400 block">Retail</span><b>₹{p.retailPrice}</b></div>
//                     <div><span className="text-[10px] uppercase text-slate-400 block">Wholesale</span><b className="text-blue-600">₹{p.wholesalePrice}</b></div>
//                   </div>
//                   <div className="flex gap-2 mt-2">
//                     <button onClick={() => handleEditClick(p)} className="flex-1 bg-blue-50 text-blue-600 text-xs font-bold py-1.5 rounded hover:bg-blue-100 flex items-center justify-center gap-1"><Edit2 size={12}/> Edit</button>
//                     <button onClick={() => handleDeleteProduct(p.id)} className="flex-1 bg-red-50 text-red-600 text-xs font-bold py-1.5 rounded hover:bg-red-100 flex items-center justify-center gap-1"><Trash2 size={12}/> Remove</button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // --- COMPONENT: SHOP VIEW ---
// const ShopView = ({ products, mode, onAddToCart }) => {
//   const [filter, setFilter] = useState('All');
//   const [searchTerm, setSearchTerm] = useState('');
  
//   const filteredProducts = products.filter(p => {
//     const matchesCategory = filter === 'All' || p.category === filter;
//     const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
//         <div>
//           <h2 className="text-3xl font-bold text-slate-900">{mode === 'wholesale' ? 'Wholesale Catalog' : 'Shop Collection'}</h2>
//           <p className="text-slate-500 text-sm mt-1">{mode === 'wholesale' ? 'Bulk pricing applied. MOQ rules active.' : 'Latest trends from Agra.'}</p>
//         </div>
        
//         {/* Search Bar */}
//         <div className="relative w-full md:w-64">
//           <input 
//             type="text" 
//             placeholder="Search shoes..." 
//             className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
//         </div>
//       </div>

//       {/* Category Pills */}
//       <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4">
//         <Filter size={18} className="text-slate-400 shrink-0" />
//         {CATEGORIES.map(cat => (
//           <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${filter === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
//             {cat}
//           </button>
//         ))}
//       </div>

//       {filteredProducts.length === 0 ? (
//         <div className="text-center py-20 text-slate-400">No products found matching your search.</div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {filteredProducts.map(product => (
//             <ProductCard key={product.id} product={product} mode={mode} onAddToCart={onAddToCart} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// // --- COMPONENT: HOME VIEW ---
// const HomeView = ({ setView, mode }) => (
//   <>
//     <div className="bg-white border-b border-slate-200">
//       <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row items-center gap-10">
//         <div className="flex-1 text-center md:text-left">
//           <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold mb-6">
//             <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
//             {mode === 'wholesale' ? 'ACCEPTING NEW DISTRIBUTORS' : 'SEASONAL SALE IS LIVE'}
//           </div>
//           <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
//             {mode === 'wholesale' ? <>Factory Direct.<br /><span className="text-blue-600">Maximize Margins.</span></> : <>Handcrafted in Agra.<br /><span className="text-red-600">Worn Everywhere.</span></>}
//           </h1>
//           <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
//             {mode === 'wholesale' ? 'Connect directly with our 20-year-old manufacturing unit. Get transparent pricing, bulk shipping support, and custom branding options.' : 'Discover the finest leather shoes directly from the shoe capital of India. Premium quality, honest prices, delivered to your doorstep.'}
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
//             <button onClick={() => setView('shop')} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2">
//               {mode === 'wholesale' ? 'View Catalog' : 'Shop Collection'} <ArrowRight size={18} />
//             </button>
//           </div>
//         </div>
        
//         <div className="flex-1 w-full max-w-md md:max-w-full">
//            <div className="relative">
//              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-amber-50 rounded-2xl transform rotate-3"></div>
//              <img 
//                src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop" 
//                alt="Shoe Craftsmanship" 
//                className="relative rounded-2xl shadow-2xl w-full h-auto object-cover transform -rotate-2 hover:rotate-0 transition duration-700"
//              />
//              {mode === 'wholesale' && (
//                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3">
//                  <div className="bg-green-100 p-2 rounded-full text-green-600"><CheckCircle size={24} /></div>
//                  <div>
//                    <p className="text-sm font-bold text-slate-800">Verified Manufacturer</p>
//                    <p className="text-xs text-slate-500">GST Registered • IEC License</p>
//                  </div>
//                </div>
//              )}
//            </div>
//         </div>
//       </div>
//     </div>
//     <Features />
//   </>
// );

// // --- COMPONENT: CART VIEW ---
// const CartView = ({ cart, mode, removeFromCart, setView }) => {
//   const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
//   const totalGST = mode === 'wholesale' ? totalAmount * 0.12 : 0; // 12% GST for wholesale
//   const finalTotal = totalAmount + totalGST;

//   if (cart.length === 0) return (
//     <div className="container mx-auto px-4 py-20 text-center">
//       <ShoppingCart size={64} className="mx-auto text-slate-200 mb-4" />
//       <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
//       <button onClick={() => setView('shop')} className="text-blue-600 font-medium hover:underline">Start Shopping</button>
//     </div>
//   );

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h2 className="text-2xl font-bold text-slate-900 mb-8">Shopping Cart ({cart.length} items)</h2>
//       <div className="flex flex-col lg:flex-row gap-8">
//         <div className="flex-1 space-y-4">
//           {cart.map((item, idx) => (
//             <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl flex gap-4">
//               <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg bg-slate-100" />
//               <div className="flex-1">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h3 className="font-bold text-slate-900">{item.name}</h3>
//                     <p className="text-sm text-slate-500">{item.category}</p>
//                   </div>
//                   <button onClick={() => removeFromCart(idx)} className="text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
//                 </div>
                
//                 {item.type === 'wholesale' ? (
//                    <div className="mt-2 bg-slate-50 p-2 rounded text-xs text-slate-600 grid grid-cols-5 gap-2">
//                      {Object.entries(item.breakdown).map(([size, qty]) => Number(qty) > 0 && (
//                        <div key={size} className="text-center bg-white border border-slate-200 rounded px-1">
//                          <span className="block text-[10px] text-slate-400">UK {size}</span>
//                          <span className="font-bold">{qty}</span>
//                        </div>
//                      ))}
//                    </div>
//                 ) : (
//                   <div className="mt-2 text-sm text-slate-600">Qty: {item.quantity} Pair</div>
//                 )}
                
//                 <div className="mt-3 flex justify-between items-center">
//                    <div className="text-xs text-slate-500">{item.quantity} pairs x ₹{item.price}</div>
//                    <div className="font-bold text-slate-900">₹{item.quantity * item.price}</div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="w-full lg:w-96">
//           <div className="bg-white border border-slate-200 p-6 rounded-xl sticky top-24 shadow-sm">
//             <h3 className="font-bold text-lg mb-4">Order Summary</h3>
//             <div className="space-y-3 mb-6">
//               <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹{totalAmount}</span></div>
//               {mode === 'wholesale' && (
//                 <div className="flex justify-between text-slate-600"><span>GST (12%)</span><span>₹{totalGST.toFixed(0)}</span></div>
//               )}
//               <div className="flex justify-between text-slate-600"><span>Shipping</span><span>{mode === 'wholesale' ? 'To be calculated' : 'Free'}</span></div>
//               <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-lg text-slate-900">
//                 <span>Total</span><span>₹{finalTotal.toFixed(0)}</span>
//               </div>
//             </div>
//             <button onClick={() => setView('checkout')} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg">
//               Proceed to Checkout
//             </button>
//             <p className="text-xs text-slate-400 text-center mt-3">Secure Checkout via Agra Shoe Mart</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- COMPONENT: CHECKOUT VIEW ---
// const CheckoutView = ({ cart, mode, placeOrder, setView }) => {
//   const [form, setForm] = useState({ name: '', phone: '', address: '' });
  
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     placeOrder(form);
//   };

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-2xl">
//       <button onClick={() => setView('cart')} className="text-sm text-slate-500 hover:text-slate-900 mb-6">← Back to Cart</button>
//       <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
//         <h2 className="text-2xl font-bold text-slate-900 mb-6">{mode === 'wholesale' ? 'Request Bulk Quote' : 'Checkout'}</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Full Name / Shop Name</label>
//             <input required type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number (WhatsApp)</label>
//             <input required type="tel" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Address</label>
//             <textarea required rows="3" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.address} onChange={e => setForm({...form, address: e.target.value})}></textarea>
//           </div>
          
//           <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
//             {mode === 'wholesale' 
//               ? "Note: This is a quote request. Our sales team will contact you on WhatsApp to confirm availability and shipping costs before payment."
//               : "Note: Cash on Delivery is available for Agra. Online payment link will be sent for other cities."
//             }
//           </div>

//           <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-md">
//             {mode === 'wholesale' ? 'Submit Quote Request' : 'Place Order'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// // --- COMPONENT: LOGIN VIEW ---
// const LoginView = ({ onLoginSuccess }) => {
//   const [isRegistering, setIsRegistering] = useState(false);
//   const [form, setForm] = useState({ name: '', phone: '', password: '' });
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
    
//     // Admin Backdoor
//     if (form.phone === 'admin' || form.phone === 'admin@agra.com') {
//         const res = await api.login(form.phone, form.password);
//         if(res && res.success) onLoginSuccess({ ...res.user, role: 'admin' });
//         return;
//     }

//     if (isRegistering) {
//       if (!form.name || !form.phone || !form.password) return setError("All fields required");
//       const res = await api.signup(form);
//       if (res && res.success) onLoginSuccess(res.user);
//       else setError(res?.message || "Registration failed");
//     } else {
//       if (!form.phone || !form.password) return setError("Enter credentials");
//       const res = await api.login(form.phone, form.password);
//       if (res && res.success) onLoginSuccess(res.user);
//       else setError(res?.message || "Login failed");
//     }
//   };

//   return (
//     <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-slate-50">
//       <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-xl shadow-xl">
//         <div className="text-center mb-8">
//           <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg"><Package size={32}/></div>
//           <h2 className="text-2xl font-bold text-slate-900">{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
//           <p className="text-slate-500 mt-2">{isRegistering ? 'Join the largest wholesale network in Agra' : 'Enter mobile to access wholesale rates'}</p>
//         </div>

//         {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4 text-center border border-red-100">{error}</div>}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {isRegistering && (
//             <div className="animate-in fade-in slide-in-from-top-2">
//               <label className="block text-sm font-bold text-slate-700 mb-1">Full Name / Shop Name</label>
//               <input type="text" className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition" placeholder="Agra Footwear Co." value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
//             </div>
//           )}
//           <div>
//             <label className="block text-sm font-bold text-slate-700 mb-1">Mobile Number</label>
//             <input type="tel" className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition" placeholder="98765XXXXX" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
//           </div>
//           <div>
//             <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
//             <input type="password" className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
//           </div>
//           <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg transform hover:-translate-y-0.5">
//             {isRegistering ? 'Register Now' : 'Login Securely'}
//           </button>
//         </form>

//         <div className="mt-8 text-center pt-6 border-t border-slate-100">
//           <p className="text-slate-500 text-sm mb-2">{isRegistering ? 'Already have an account?' : 'New to Agra Shoe Mart?'}</p>
//           <button onClick={() => setIsRegistering(!isRegistering)} className="text-blue-600 font-bold hover:underline text-sm">
//             {isRegistering ? 'Login Instead' : 'Create New Account'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- MAIN CONTROLLER ---
// const App = () => {
//   const [view, setView] = useState('home');
//   const [user, setUser] = useState(null);
//   const [mode, setMode] = useState('retail'); 
//   const [cart, setCart] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [showToast, setShowToast] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   useEffect(() => {
//     const fetchProds = async () => {
//       const res = await api.getProducts();
//       setProducts(res || []);
//     };
//     fetchProds();
//   }, []);

//   const handleLogin = (userData) => {
//     setUser(userData);
//     if (userData.role === 'admin') setView('admin');
//     else {
//       setMode('wholesale');
//       setView('shop');
//     }
//   };

//   const handleLogout = () => {
//     if (window.confirm("Logout?")) {
//       api.logout();
//       setUser(null);
//       setMode('retail');
//       setView('home');
//     }
//   };

//   const addToCart = (item) => {
//     if (!user) return alert("Please Login to Shop");
//     setCart([...cart, item]);
//     setShowToast(true);
//     setTimeout(() => setShowToast(false), 3000);
//   };

//   const removeFromCart = (index) => {
//     const newCart = [...cart];
//     newCart.splice(index, 1);
//     setCart(newCart);
//   };

//   const placeOrder = async (details) => {
//     const total = cart.reduce((a, b) => a + (b.price * b.quantity), 0);
//     await api.createOrder({ customer: details, items: cart, total });
//     setCart([]);
//     setView('success');
//   };

//   if (view === 'admin') return <AdminDashboard onLogout={handleLogout} />;
//   if (view === 'login') return <LoginView onLoginSuccess={handleLogin} />;
  
//   return (
//     <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
//       {/* Navbar */}
//       <nav className="bg-white shadow-md sticky top-0 z-50">
//         <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 flex justify-between items-center">
//           <span className="hidden sm:inline">Agra's Trusted Shoe Wholesaler - Since 2003</span>
//           <div className="flex items-center gap-4">
//             <span className="flex items-center gap-1 hover:text-white cursor-pointer transition">
//               <Phone size={14} /> +91 98765-XXXXX
//             </span>
//             <span className="text-amber-500 font-bold cursor-pointer hover:underline hidden sm:block">
//               Request Sample Kit
//             </span>
//           </div>
//         </div>

//         <div className="container mx-auto px-4 py-4">
//           <div className="flex justify-between items-center">
//             <div onClick={() => setView('home')} className="flex items-center gap-2 cursor-pointer">
//               <div className="bg-red-600 text-white p-1 rounded font-bold text-xl">ASM</div>
//               <div className="text-2xl font-bold tracking-tighter text-slate-800 leading-none">
//                 AGRA<span className="text-red-600">SHOES</span>
//               </div>
//             </div>

//             <div className="hidden md:flex gap-8 font-medium text-slate-600 text-sm">
//               <button onClick={() => setView('home')} className="hover:text-red-600 transition">Home</button>
//               <button onClick={() => setView('shop')} className="hover:text-red-600 transition">Shop Catalog</button>
//               <button onClick={() => setView('shop')} className="hover:text-red-600 transition">New Arrivals</button>
//             </div>

//             <div className="flex items-center gap-4">
//               <div className="hidden md:flex bg-slate-100 rounded-full p-1 border border-slate-200 mr-2">
//                 <button onClick={() => setMode('retail')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${mode === 'retail' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Retail</button>
//                 <button onClick={() => setMode('wholesale')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${mode === 'wholesale' ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}>Wholesale</button>
//               </div>

//               <button onClick={() => setView('cart')} className="relative p-2 hover:bg-slate-100 rounded-full transition group">
//                 <ShoppingCart size={22} className="text-slate-700 group-hover:text-red-600" />
//                 {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">{cart.length}</span>}
//               </button>
              
//               {user ? (
//                 <div className="flex items-center gap-2">
//                   <button onClick={() => user.type === 'admin' ? setView('admin') : setView('home')} className="flex items-center gap-2 font-bold text-sm bg-slate-100 px-3 py-2 rounded-lg hover:bg-slate-200 transition">
//                     <User size={18}/> <span className="hidden sm:inline">{user.name}</span>
//                   </button>
//                   <button onClick={handleLogout} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition shadow-sm" title="Logout">
//                     <LogOut size={18} />
//                   </button>
//                 </div>
//               ) : (
//                 <button onClick={() => setView('login')} className="hidden sm:flex bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm">Login</button>
//               )}

//               <button className="md:hidden text-slate-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
//                   {isMobileMenuOpen ? <X /> : <Menu />}
//               </button>
//             </div>
//           </div>

//           {isMobileMenuOpen && (
//             <div className="md:hidden mt-4 pb-4 border-t pt-4">
//                 <div className="flex bg-slate-100 rounded-lg p-1 mb-4">
//                 <button onClick={() => { setMode('retail'); setIsMobileMenuOpen(false); }} className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === 'retail' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Retail</button>
//                 <button onClick={() => { setMode('wholesale'); setIsMobileMenuOpen(false); }} className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === 'wholesale' ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}>Wholesale</button>
//               </div>
//               <div className="space-y-3 text-slate-700 font-medium">
//                 <button onClick={() => { setView('home'); setIsMobileMenuOpen(false); }} className="block w-full text-left hover:text-red-600">Home</button>
//                 <button onClick={() => { setView('shop'); setIsMobileMenuOpen(false); }} className="block w-full text-left hover:text-red-600">Shop Catalog</button>
//                 <button onClick={() => { setView('login'); setIsMobileMenuOpen(false); }} className="block w-full text-left text-blue-600">Login / Register</button>
//               </div>
//             </div>
//           )}
//         </div>
//       </nav>

//       <main className="flex-1">
//         {view === 'home' && <HomeView setView={setView} mode={mode} />}
//         {view === 'shop' && <ShopView products={products} mode={mode} onAddToCart={addToCart} />}
//         {view === 'cart' && <CartView cart={cart} mode={mode} removeFromCart={removeFromCart} setView={setView} />}
//         {view === 'checkout' && <CheckoutView cart={cart} mode={mode} placeOrder={placeOrder} setView={setView} />}
//         {view === 'success' && (
//           <div className="text-center py-20">
//             <CheckCircle size={64} className="mx-auto text-green-500 mb-4"/>
//             <h2 className="text-3xl font-bold">Order Received!</h2>
//             <button onClick={() => setView('home')} className="mt-4 text-blue-600 font-bold">Back Home</button>
//           </div>
//         )}
//       </main>
      
//       {showToast && (
//         <div className="fixed bottom-4 right-4 bg-black text-white px-6 py-3 rounded shadow-lg flex gap-2 animate-bounce">
//           <CheckCircle size={20} className="text-green-400"/> Added to Cart
//         </div>
//       )}
      
//       <footer className="bg-slate-900 text-slate-400 py-12">
//         <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
//           <div>
//             <h4 className="text-white font-bold text-lg mb-4">AGRA SHOES</h4>
//             <p className="mb-4">Digitizing the legacy of Agra's shoemaking. We connect manufacturers directly to retailers across India.</p>
//             <p>Agra, Uttar Pradesh, India - 282002</p>
//           </div>
//           <div>
//             <h4 className="text-white font-bold mb-4">Shop</h4>
//             <ul className="space-y-2">
//               <li className="hover:text-white cursor-pointer">Men's Formal</li>
//               <li className="hover:text-white cursor-pointer">Casual Loafers</li>
//               <li className="hover:text-white cursor-pointer">Safety Shoes</li>
//               <li className="hover:text-white cursor-pointer">School Shoes</li>
//             </ul>
//           </div>
//           <div>
//             <h4 className="text-white font-bold mb-4">Wholesale</h4>
//             <ul className="space-y-2">
//               <li className="hover:text-white cursor-pointer">Register as Distributor</li>
//               <li className="hover:text-white cursor-pointer">Bulk Pricing Policy</li>
//               <li className="hover:text-white cursor-pointer">Shipping & Logistics</li>
//               <li className="hover:text-white cursor-pointer">Return Policy</li>
//             </ul>
//           </div>
//           <div>
//             <h4 className="text-white font-bold mb-4">Stay Connected</h4>
//             <p className="mb-4">Get latest design updates on WhatsApp.</p>
//             <div className="flex gap-2">
//               <input type="text" placeholder="+91 Mobile Number" className="bg-slate-800 border-none rounded px-3 py-2 w-full text-white outline-none focus:ring-1 focus:ring-slate-600" />
//               <button className="bg-green-600 text-white px-3 py-2 rounded font-bold hover:bg-green-700">Join</button>
//             </div>
//           </div>
//         </div>
//         <div className="text-center mt-12 pt-8 border-t border-slate-800">
//           &copy; 2025 Agra Wholesale Shoe Mart. All rights reserved.
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default App;
// import React, { useState } from 'react';
// import { 
//   ShoppingCart, User, Phone, Menu, X, CheckCircle, Truck, 
//   ShieldCheck, Info, Package, ArrowRight, Trash2, Filter, 
//   Search, ClipboardList, Users, LogOut, Plus, Save,
//   Tag, Layers, DollarSign, ChevronLeft, ChevronRight, Upload, 
//   XCircle, FileText, MapPin, Smartphone, Calendar, Edit2, Archive
// } from 'lucide-react';

// // --- MOCK DATABASE ---
// const INITIAL_PRODUCTS = [
//   { 
//     id: 1, 
//     name: 'Agra Classic Loafer', 
//     category: 'Men\'s Formal', 
//     retailPrice: 1499, 
//     wholesalePrice: 450, 
//     moq: 24, 
//     stock: 1000, 
//     sizes: [6,7,8,9,10], 
//     images: [
//       'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800&auto=format&fit=crop',
//       'https://images.unsplash.com/photo-1533867617858-e7b97e0605df?q=80&w=800&auto=format&fit=crop', 
//       'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop'
//     ], 
//     tag: 'Best Seller' 
//   },
//   { 
//     id: 2, 
//     name: 'Genuine Leather Oxford', 
//     category: 'Office Wear', 
//     retailPrice: 2199, 
//     wholesalePrice: 750, 
//     moq: 12, 
//     stock: 500, 
//     sizes: [6,7,8,9,10], 
//     images: ['https://images.unsplash.com/photo-1478186172493-493ca852a743?q=80&w=800&auto=format&fit=crop'], 
//     tag: 'Premium' 
//   },
//   { 
//     id: 3, 
//     name: 'Daily Soft Sandal', 
//     category: 'Women\'s Comfort', 
//     retailPrice: 899, 
//     wholesalePrice: 220, 
//     moq: 48, 
//     stock: 2000, 
//     sizes: [4,5,6,7,8], 
//     images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop'], 
//     tag: 'High Demand' 
//   },
//   { 
//     id: 4, 
//     name: 'Rugged Chelsea Boot', 
//     category: 'Men\'s Boots', 
//     retailPrice: 2899, 
//     wholesalePrice: 950, 
//     moq: 12, 
//     stock: 300, 
//     sizes: [7,8,9,10,11], 
//     images: ['https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800&auto=format&fit=crop'], 
//     tag: 'New Arrival' 
//   },
//   { 
//     id: 5, 
//     name: 'Canvas Sneaker', 
//     category: 'Casual', 
//     retailPrice: 999, 
//     wholesalePrice: 310, 
//     moq: 36, 
//     stock: 800, 
//     sizes: [6,7,8,9,10], 
//     images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop'], 
//     tag: null 
//   },
//   { 
//     id: 6, 
//     name: 'Kids School Shoe', 
//     category: 'School', 
//     retailPrice: 699, 
//     wholesalePrice: 180, 
//     moq: 60, 
//     stock: 5000, 
//     sizes: [1,2,3,4,5], 
//     images: ['https://images.unsplash.com/photo-1515347619252-60a6bf4fffce?q=80&w=800&auto=format&fit=crop'], 
//     tag: 'Back to School' 
//   },
// ];

// const CATEGORIES = ['All', 'Men\'s Formal', 'Office Wear', 'Women\'s Comfort', 'Men\'s Boots', 'Casual', 'School'];

// const generateId = () => Math.floor(Math.random() * 100000);

// // --- COMPONENTS ---

// const ProductCard = ({ product, mode, onAddToCart }) => {
//   const [showMatrix, setShowMatrix] = useState(false);
//   const [currentImgIndex, setCurrentImgIndex] = useState(0);
//   const [quantities, setQuantities] = useState(
//     product.sizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {})
//   );
  
//   const totalPairs = Object.values(quantities).reduce((a, b) => a + Number(b), 0);
//   const matrixTotalCost = totalPairs * product.wholesalePrice;

//   const nextImage = (e) => {
//     e.stopPropagation();
//     setCurrentImgIndex((prev) => (prev + 1) % product.images.length);
//   };

//   const prevImage = (e) => {
//     e.stopPropagation();
//     setCurrentImgIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
//   };

//   const handleWholesaleAdd = () => {
//     if (totalPairs < product.moq) {
//       alert(`Minimum Order Quantity is ${product.moq} pairs.`);
//       return;
//     }
//     onAddToCart({
//       ...product,
//       type: 'wholesale',
//       breakdown: quantities,
//       quantity: totalPairs,
//       price: product.wholesalePrice,
//       image: product.images[0]
//     });
//     setQuantities(product.sizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {}));
//     setShowMatrix(false);
//   };

//   const handleRetailAdd = () => {
//     onAddToCart({
//       ...product,
//       type: 'retail',
//       quantity: 1,
//       price: product.retailPrice,
//       image: product.images[0]
//     });
//   };

//   return (
//     <div className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
//       <div className="relative h-64 bg-slate-100 group">
//         <img 
//           src={product.images[currentImgIndex]} 
//           alt={product.name} 
//           className="w-full h-full object-cover transition-transform duration-500" 
//         />
//         {product.tag && <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] uppercase font-bold px-2 py-1 rounded backdrop-blur-sm z-10">{product.tag}</span>}
//         {mode === 'wholesale' && <span className="absolute top-2 left-2 bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">MOQ: {product.moq}</span>}

//         {product.images.length > 1 && (
//           <>
//             <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full text-slate-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft size={20} /></button>
//             <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full text-slate-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={20} /></button>
//             <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
//               {product.images.map((_, idx) => (
//                 <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImgIndex ? 'bg-white scale-125' : 'bg-white/50'}`} />
//               ))}
//             </div>
//           </>
//         )}
//       </div>

//       <div className="p-4 flex-1 flex flex-col">
//         <div className="mb-2">
//           <span className="text-xs text-slate-500 uppercase tracking-wide">{product.category}</span>
//           <h3 className="text-lg font-bold text-slate-800 leading-tight">{product.name}</h3>
//         </div>
        
//         <div className="mt-auto pt-4 border-t border-slate-100">
//           <div className="flex justify-between items-end mb-4">
//             <div>
//               <p className="text-xs text-slate-500 mb-0.5">Price per pair</p>
//               <div className="flex items-baseline gap-2">
//                 <span className="text-xl font-bold text-slate-900">₹{mode === 'retail' ? product.retailPrice : product.wholesalePrice}</span>
//                 {mode === 'retail' && <span className="text-xs text-red-500 line-through">₹{Math.floor(product.retailPrice * 1.2)}</span>}
//               </div>
//               {mode === 'wholesale' && <p className="text-[10px] text-red-600 font-medium">*Excl. GST</p>}
//             </div>
//             {mode === 'retail' ? (
//               <button onClick={handleRetailAdd} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-200">Add</button>
//             ) : (
//               <button onClick={() => setShowMatrix(!showMatrix)} className={`px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg ${showMatrix ? 'bg-slate-200 text-slate-800' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}>{showMatrix ? 'Close' : 'Bulk'}</button>
//             )}
//           </div>

//           {mode === 'wholesale' && showMatrix && (
//             <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2">
//               <div className="flex justify-between items-center mb-2">
//                  <span className="text-[10px] font-bold text-slate-500">SELECT SIZES</span>
//               </div>
//               <div className="grid grid-cols-5 gap-1 mb-3">
//                 {product.sizes.map((size) => (
//                   <div key={size} className="text-center">
//                     <label className="block text-[10px] text-slate-500">UK {size}</label>
//                     <input type="number" min="0" value={quantities[size] || ''} onChange={(e) => setQuantities(prev => ({...prev, [size]: e.target.value}))} className="w-full border border-slate-300 rounded p-1 text-center text-xs" placeholder="0" />
//                   </div>
//                 ))}
//               </div>
//               <div className="flex justify-between text-xs mb-2">
//                 <span>Pairs: <strong>{totalPairs}</strong></span>
//                 <span>Total: <strong className="text-blue-600">₹{matrixTotalCost}</strong></span>
//               </div>
//               <button onClick={handleWholesaleAdd} disabled={totalPairs === 0} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white py-1.5 rounded text-xs font-bold uppercase">Add Batch</button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// const Features = () => (
//   <div className="bg-slate-50 py-12 border-y border-slate-200">
//     <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-blue-600"><Truck /></div>
//         <h3 className="font-bold text-slate-800 mb-2">Nationwide Delivery</h3>
//         <p className="text-sm text-slate-500 px-4">From Agra to anywhere in India. We use trusted B2B logistics partners.</p>
//       </div>
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-amber-500"><ShieldCheck /></div>
//         <h3 className="font-bold text-slate-800 mb-2">Quality Guarantee</h3>
//         <p className="text-sm text-slate-500 px-4">Every pair is inspected before packing. 20 years of reputation at stake.</p>
//       </div>
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-red-600"><Info /></div>
//         <h3 className="font-bold text-slate-800 mb-2">Direct Support</h3>
//         <p className="text-sm text-slate-500 px-4">Call us anytime. We believe in building relationships, not just sales.</p>
//       </div>
//     </div>
//   </div>
// );

// // --- ADMIN COMPONENTS ---

// const ProductForm = ({ initialData, onSave, onCancel }) => {
//   const [formData, setFormData] = useState(initialData ? {
//     ...initialData,
//     sizes: initialData.sizes.join(',') 
//   } : {
//     name: '', category: 'Men\'s Formal', retailPrice: '', wholesalePrice: '', 
//     moq: 24, stock: 100, sizes: '6,7,8,9,10', tag: '', 
//     images: [] 
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (formData.images.length === 0) {
//       alert("Please upload at least one image.");
//       return;
//     }
//     const newProduct = {
//       ...formData,
//       id: formData.id || generateId(),
//       retailPrice: Number(formData.retailPrice),
//       wholesalePrice: Number(formData.wholesalePrice),
//       moq: Number(formData.moq),
//       stock: Number(formData.stock),
//       sizes: String(formData.sizes).split(',').map(s => Number(s.trim())).filter(n => !isNaN(n))
//     };
//     onSave(newProduct);
//   };

//   const handleImageUpload = (e) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const newImageUrls = Array.from(e.target.files).map(file => URL.createObjectURL(file));
//       setFormData(prev => ({ ...prev, images: [...prev.images, ...newImageUrls] }));
//     }
//   };

//   const removeImage = (indexToRemove) => {
//     setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== indexToRemove) }));
//   };

//   const fillRandomImage = () => {
//     const urls = [
//       'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800',
//       'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800',
//       'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=800',
//       'https://images.unsplash.com/photo-1560769629-975e13f0c470?q=80&w=800'
//     ];
//     setFormData({...formData, images: [...formData.images, urls[Math.floor(Math.random() * urls.length)]]});
//   };

//   return (
//     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg animate-in fade-in slide-in-from-bottom-4">
//       <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
//         {initialData ? <Edit2 className="text-blue-600" /> : <Plus className="text-green-600" />} 
//         {initialData ? 'Edit Product' : 'Add New Product'}
//       </h3>
//       <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div className="md:col-span-2">
//           <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Product Name</label>
//           <input required type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-slate-900 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Leather Oxford Pro" />
//         </div>
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Category</label>
//            <select className="w-full border p-2 rounded outline-none bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
//              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
//            </select>
//         </div>
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Sizes (Comma Sep)</label>
//            <input required type="text" className="w-full border p-2 rounded outline-none" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} placeholder="6, 7, 8, 11, 12" />
//         </div>
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Retail Price (₹)</label>
//            <input required type="number" className="w-full border p-2 rounded outline-none" value={formData.retailPrice} onChange={e => setFormData({...formData, retailPrice: e.target.value})} />
//         </div>
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Wholesale Price (₹)</label>
//            <input required type="number" className="w-full border p-2 rounded outline-none" value={formData.wholesalePrice} onChange={e => setFormData({...formData, wholesalePrice: e.target.value})} />
//         </div>
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Min Order Qty</label>
//            <input required type="number" className="w-full border p-2 rounded outline-none" value={formData.moq} onChange={e => setFormData({...formData, moq: e.target.value})} />
//         </div>
//         <div className="grid grid-cols-2 gap-2">
//            <div>
//              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Stock Qty</label>
//              <input required type="number" className="w-full border p-2 rounded outline-none" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
//            </div>
//            <div>
//              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Tag / Status</label>
//              <input type="text" className="w-full border p-2 rounded outline-none" value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})} placeholder="Out of Stock / Best Seller" />
//            </div>
//         </div>
//         <div className="md:col-span-2">
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Product Images</label>
//            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition cursor-pointer relative">
//              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
//              <Upload className="mx-auto text-slate-400 mb-2" />
//              <p className="text-sm text-slate-500 font-medium">Click to select images from device</p>
//              <p className="text-xs text-slate-400">JPG, PNG supported</p>
//            </div>
           
//            <div className="mt-2 flex gap-2">
//               <button type="button" onClick={fillRandomImage} className="text-xs text-blue-600 underline">Add Random Mock Image</button>
//            </div>

//            {formData.images.length > 0 && (
//              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
//                {formData.images.map((img, idx) => (
//                  <div key={idx} className="relative shrink-0 w-20 h-20 group">
//                    <img src={img} alt="Preview" className="w-full h-full object-cover rounded-lg border border-slate-200" />
//                    <button type="button" onClick={() => removeImage(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600"><X size={12} /></button>
//                  </div>
//                ))}
//              </div>
//            )}
//         </div>
//         <div className="md:col-span-2 flex gap-3 mt-2">
//           <button type="button" onClick={onCancel} className="flex-1 py-2 border border-slate-300 rounded text-slate-600 font-bold hover:bg-slate-50">Cancel</button>
//           <button type="submit" className="flex-1 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 flex justify-center items-center gap-2">
//             <Save size={18}/> {initialData ? 'Update Product' : 'Save Product'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// // Order Details Modal Component
// const OrderDetailModal = ({ order, onClose }) => {
//   if (!order) return null;

//   return (
//     <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//       <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
//         <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
//           <div>
//             <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
//               <FileText className="text-blue-600" size={20} /> Order #{order.id}
//             </h3>
//             <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
//               <Calendar size={14} /> {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}
//             </p>
//           </div>
//           <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition">
//             <XCircle size={28} />
//           </button>
//         </div>

//         <div className="overflow-y-auto p-6 flex-1">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//             <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
//               <h4 className="text-xs font-bold text-blue-800 uppercase mb-3 flex items-center gap-2"><User size={14}/> Customer Information</h4>
//               <div className="space-y-2 text-sm text-slate-700">
//                 <p><span className="font-semibold text-slate-900">Name:</span> {order.customer.name}</p>
//                 <p className="flex items-start gap-2"><span className="font-semibold text-slate-900 whitespace-nowrap">Phone:</span> {order.customer.phone}</p>
//                 <p><span className="font-semibold text-slate-900">Type:</span> <span className={`px-2 py-0.5 rounded text-xs font-bold ${order.type === 'wholesale' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{order.type.toUpperCase()}</span></p>
//               </div>
//             </div>
//             <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
//               <h4 className="text-xs font-bold text-slate-600 uppercase mb-3 flex items-center gap-2"><MapPin size={14}/> Delivery Address</h4>
//               <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{order.customer.address}</p>
//             </div>
//           </div>

//           <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Package size={16}/> Order Items</h4>
//           <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
//             <table className="w-full text-left text-sm">
//               <thead className="bg-slate-50 text-slate-500 font-medium">
//                 <tr>
//                   <th className="p-3">Product</th>
//                   <th className="p-3 text-center">Type</th>
//                   <th className="p-3">Breakdown</th>
//                   <th className="p-3 text-right">Price</th>
//                   <th className="p-3 text-right">Total</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {order.items.map((item, idx) => (
//                   <tr key={idx} className="hover:bg-slate-50/50">
//                     <td className="p-3">
//                       <div className="flex items-center gap-3">
//                         <img src={item.image} alt="" className="w-10 h-10 rounded object-cover bg-slate-100 border" />
//                         <span className="font-medium text-slate-900">{item.name}</span>
//                       </div>
//                     </td>
//                     <td className="p-3 text-center">
//                        {item.type === 'wholesale' 
//                          ? <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">BULK</span> 
//                          : <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">RETAIL</span>
//                        }
//                     </td>
//                     <td className="p-3">
//                       {item.type === 'wholesale' ? (
//                         <div className="grid grid-cols-4 gap-1 w-max">
//                           {Object.entries(item.breakdown).map(([size, qty]) => Number(qty) > 0 && (
//                             <div key={size} className="text-[10px] bg-white border rounded px-1 text-slate-500 whitespace-nowrap">
//                               UK{size}: <span className="font-bold text-slate-900">{qty}</span>
//                             </div>
//                           ))}
//                         </div>
//                       ) : (
//                         <span className="text-slate-500 text-xs">1 Pair (Standard)</span>
//                       )}
//                     </td>
//                     <td className="p-3 text-right text-slate-600">₹{item.price}</td>
//                     <td className="p-3 text-right font-bold text-slate-900">₹{item.price * item.quantity}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <div className="flex justify-end">
//             <div className="w-full md:w-64 bg-slate-50 p-4 rounded-lg border border-slate-200">
//               <div className="flex justify-between text-sm text-slate-600 mb-2">
//                 <span>Subtotal</span>
//                 <span>₹{order.total / (order.type === 'wholesale' ? 1.12 : 1) }</span>
//               </div>
//               {order.type === 'wholesale' && (
//                 <div className="flex justify-between text-sm text-slate-600 mb-2">
//                   <span>GST (12%)</span>
//                   <span>₹{(order.total - (order.total / 1.12)).toFixed(2)}</span>
//                 </div>
//               )}
//               <div className="flex justify-between font-bold text-lg text-slate-900 pt-3 border-t border-slate-200">
//                 <span>Total</span>
//                 <span>₹{Math.round(order.total)}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
//           <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-bold hover:bg-white transition">Close</button>
//           <button onClick={() => alert("Printing Feature would go here.")} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 flex items-center gap-2 transition"><ClipboardList size={18}/> Process Order</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const AdminDashboard = ({ orders, products, setProducts, setView, onLogout }) => {
//   const [activeTab, setActiveTab] = useState('orders');
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null); 
//   const [editingProduct, setEditingProduct] = useState(null);

//   const pendingOrders = orders.filter(o => o.status === 'Pending').length;
//   const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);

//   const handleSaveProduct = (productData) => {
//     if (editingProduct) {
//       setProducts(products.map(p => p.id === productData.id ? productData : p));
//       setEditingProduct(null);
//       alert("Product Updated Successfully!");
//     } else {
//       setProducts([productData, ...products]);
//       setShowAddForm(false);
//       alert("Product Added Successfully!");
//     }
//   };

//   const handleEditClick = (product) => {
//     setEditingProduct(product);
//     setActiveTab('products');
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const handleDeleteProduct = (id) => {
//     if (window.confirm("Are you sure you want to delete this product?")) {
//       setProducts(products.filter(p => p.id !== id));
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8 bg-slate-50 min-h-screen">
//       {selectedOrder && (
//         <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
//       )}

//       <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
//         <div>
//            <h2 className="text-2xl font-bold text-slate-900">Owner Dashboard</h2>
//            <p className="text-sm text-slate-500">Manage Orders & Inventory</p>
//         </div>
//         <div className="flex gap-3">
//           <button onClick={onLogout} className="bg-white border border-slate-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center gap-2 font-bold transition">
//             <LogOut size={16}/> Logout
//           </button>
//         </div>
//       </div>

//       <div className="flex gap-4 mb-6 border-b border-slate-200">
//         <button onClick={() => setActiveTab('orders')} className={`pb-3 px-2 font-bold text-sm ${activeTab === 'orders' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500'}`}>Incoming Orders</button>
//         <button onClick={() => setActiveTab('products')} className={`pb-3 px-2 font-bold text-sm ${activeTab === 'products' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500'}`}>Manage Products ({products.length})</button>
//       </div>

//       {activeTab === 'orders' && (
//         <div className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4"><div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><ClipboardList /></div><div><p className="text-slate-500 text-sm">Total Orders</p><h3 className="text-2xl font-bold text-slate-900">{orders.length}</h3></div></div>
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4"><div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><Package /></div><div><p className="text-slate-500 text-sm">Pending</p><h3 className="text-2xl font-bold text-slate-900">{pendingOrders}</h3></div></div>
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4"><div className="p-3 bg-green-100 text-green-600 rounded-lg"><Users /></div><div><p className="text-slate-500 text-sm">Revenue (Est)</p><h3 className="text-2xl font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</h3></div></div>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//             <div className="p-6 border-b border-slate-100"><h3 className="font-bold text-lg text-slate-800">Recent Orders</h3></div>
//             <div className="overflow-x-auto">
//               <table className="w-full text-left text-sm">
//                 <thead className="bg-slate-50 text-slate-500 font-medium">
//                   <tr><th className="p-4">ID</th><th className="p-4">Customer</th><th className="p-4">Type</th><th className="p-4">Total</th><th className="p-4">Status</th><th className="p-4">Action</th></tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100">
//                   {orders.length === 0 ? (<tr><td colSpan="6" className="p-8 text-center text-slate-400">No orders yet.</td></tr>) : orders.map((order) => (
//                     <tr key={order.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => setSelectedOrder(order)}>
//                       <td className="p-4 font-mono text-xs text-slate-500">{order.id}</td>
//                       <td className="p-4 font-bold text-slate-900">{order.customer.name}</td>
//                       <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${order.type === 'wholesale' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{order.type}</span></td>
//                       <td className="p-4 font-bold text-slate-900">₹{Math.round(order.total)}</td>
//                       <td className="p-4"><span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold">{order.status}</span></td>
//                       <td className="p-4">
//                         <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }} className="text-blue-600 hover:text-blue-800 font-bold text-xs border border-blue-200 px-3 py-1 rounded hover:bg-blue-50 transition">View Details</button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       )}

//       {activeTab === 'products' && (
//         <div>
//           <div className="flex justify-between items-center mb-6">
//             <h3 className="text-xl font-bold text-slate-900">Product Inventory</h3>
//             {!showAddForm && !editingProduct && (
//               <button onClick={() => setShowAddForm(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 flex items-center gap-2 shadow-lg">
//                 <Plus size={18} /> Add New Product
//               </button>
//             )}
//           </div>

//           {(showAddForm || editingProduct) && (
//             <div className="mb-8">
//               <ProductForm 
//                 initialData={editingProduct} 
//                 onSave={handleSaveProduct} 
//                 onCancel={() => { setShowAddForm(false); setEditingProduct(null); }} 
//               />
//             </div>
//           )}

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {products.map(product => (
//               <div key={product.id} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 items-start shadow-sm hover:shadow-md transition relative">
//                 <img src={product.images[0]} className="w-20 h-20 rounded-lg object-cover bg-slate-100" alt={product.name} />
//                 <div className="flex-1">
//                    <div className="flex justify-between items-start mb-1">
//                       <h4 className="font-bold text-slate-900 leading-tight">{product.name}</h4>
//                    </div>
//                    <p className="text-xs text-slate-500 mb-2">{product.category}</p>
//                    <div className="flex gap-4 text-sm mb-2">
//                       <div><span className="text-[10px] text-slate-400 uppercase block">Retail</span><span className="font-bold">₹{product.retailPrice}</span></div>
//                       <div><span className="text-[10px] text-slate-400 uppercase block">Wholesale</span><span className="font-bold text-blue-600">₹{product.wholesalePrice}</span></div>
//                    </div>
//                    <div className="flex flex-wrap gap-2 text-[10px]">
//                      <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">Stock: {product.stock}</span>
//                      {product.tag && <span className="bg-amber-100 px-2 py-1 rounded text-amber-800">{product.tag}</span>}
//                    </div>
                   
//                    <div className="flex gap-2 mt-4">
//                      <button onClick={() => handleEditClick(product)} className="flex-1 bg-blue-50 text-blue-600 text-xs font-bold py-1.5 rounded hover:bg-blue-100 flex items-center justify-center gap-1 transition"><Edit2 size={12} /> Edit</button>
//                      <button onClick={() => handleDeleteProduct(product.id)} className="flex-1 bg-red-50 text-red-600 text-xs font-bold py-1.5 rounded hover:bg-red-100 flex items-center justify-center gap-1 transition"><Trash2 size={12} /> Remove</button>
//                    </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const ShopView = ({ products, mode, onAddToCart }) => {
//   const [filter, setFilter] = useState('All');
//   const [searchTerm, setSearchTerm] = useState('');
  
//   const filteredProducts = products.filter(p => {
//     const matchesCategory = filter === 'All' || p.category === filter;
//     const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
//         <div>
//           <h2 className="text-3xl font-bold text-slate-900">{mode === 'wholesale' ? 'Wholesale Catalog' : 'Shop Collection'}</h2>
//           <p className="text-slate-500 text-sm mt-1">{mode === 'wholesale' ? 'Bulk pricing applied. MOQ rules active.' : 'Latest trends from Agra.'}</p>
//         </div>
//         <div className="relative w-full md:w-64">
//           <input type="text" placeholder="Search shoes..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
//           <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
//         </div>
//       </div>
//       <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4">
//         <Filter size={18} className="text-slate-400 shrink-0" />
//         {CATEGORIES.map(cat => (
//           <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${filter === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{cat}</button>
//         ))}
//       </div>
//       {filteredProducts.length === 0 ? <div className="text-center py-20 text-slate-400">No products found matching your search.</div> : 
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {filteredProducts.map(product => (
//             <ProductCard key={product.id} product={product} mode={mode} onAddToCart={onAddToCart} />
//           ))}
//         </div>
//       }
//     </div>
//   );
// };

// const HomeView = ({ setView, mode }) => (
//   <>
//     <div className="bg-white border-b border-slate-200">
//       <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row items-center gap-10">
//         <div className="flex-1 text-center md:text-left">
//           <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold mb-6">
//             <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
//             {mode === 'wholesale' ? 'ACCEPTING NEW DISTRIBUTORS' : 'SEASONAL SALE IS LIVE'}
//           </div>
//           <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
//             {mode === 'wholesale' ? <>Factory Direct.<br /><span className="text-blue-600">Maximize Margins.</span></> : <>Handcrafted in Agra.<br /><span className="text-red-600">Worn Everywhere.</span></>}
//           </h1>
//           <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
//             {mode === 'wholesale' ? 'Connect directly with our 20-year-old manufacturing unit. Get transparent pricing, bulk shipping support, and custom branding options.' : 'Discover the finest leather shoes directly from the shoe capital of India. Premium quality, honest prices, delivered to your doorstep.'}
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
//             <button onClick={() => setView('shop')} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2">
//               {mode === 'wholesale' ? 'View Catalog' : 'Shop Collection'} <ArrowRight size={18} />
//             </button>
//           </div>
//         </div>
//         <div className="flex-1 w-full max-w-md md:max-w-full">
//            <div className="relative">
//              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-amber-50 rounded-2xl transform rotate-3"></div>
//              <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop" alt="Shoe Craftsmanship" className="relative rounded-2xl shadow-2xl w-full h-auto object-cover transform -rotate-2 hover:rotate-0 transition duration-700" />
//              {mode === 'wholesale' && (
//                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3">
//                  <div className="bg-green-100 p-2 rounded-full text-green-600"><CheckCircle size={24} /></div>
//                  <div><p className="text-sm font-bold text-slate-800">Verified Manufacturer</p><p className="text-xs text-slate-500">GST Registered • IEC License</p></div>
//                </div>
//              )}
//            </div>
//         </div>
//       </div>
//     </div>
//     <Features />
//   </>
// );

// const CartView = ({ cart, mode, removeFromCart, setView }) => {
//   const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
//   const totalGST = mode === 'wholesale' ? totalAmount * 0.12 : 0; 
//   const finalTotal = totalAmount + totalGST;

//   if (cart.length === 0) return <div className="container mx-auto px-4 py-20 text-center"><ShoppingCart size={64} className="mx-auto text-slate-200 mb-4" /><h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2><button onClick={() => setView('shop')} className="text-blue-600 font-medium hover:underline">Start Shopping</button></div>;

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h2 className="text-2xl font-bold text-slate-900 mb-8">Shopping Cart ({cart.length} items)</h2>
//       <div className="flex flex-col lg:flex-row gap-8">
//         <div className="flex-1 space-y-4">
//           {cart.map((item, idx) => (
//             <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl flex gap-4">
//               <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg bg-slate-100" />
//               <div className="flex-1">
//                 <div className="flex justify-between items-start">
//                   <div><h3 className="font-bold text-slate-900">{item.name}</h3><p className="text-sm text-slate-500">{item.category}</p></div>
//                   <button onClick={() => removeFromCart(idx)} className="text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
//                 </div>
//                 {item.type === 'wholesale' ? (
//                    <div className="mt-2 bg-slate-50 p-2 rounded text-xs text-slate-600 grid grid-cols-5 gap-2">{Object.entries(item.breakdown).map(([size, qty]) => Number(qty) > 0 && (<div key={size} className="text-center bg-white border border-slate-200 rounded px-1"><span className="block text-[10px] text-slate-400">UK {size}</span><span className="font-bold">{qty}</span></div>))}</div>
//                 ) : <div className="mt-2 text-sm text-slate-600">Qty: {item.quantity} Pair</div>}
//                 <div className="mt-3 flex justify-between items-center"><div className="text-xs text-slate-500">{item.quantity} pairs x ₹{item.price}</div><div className="font-bold text-slate-900">₹{item.quantity * item.price}</div></div>
//               </div>
//             </div>
//           ))}
//         </div>
//         <div className="w-full lg:w-96">
//           <div className="bg-white border border-slate-200 p-6 rounded-xl sticky top-24 shadow-sm">
//             <h3 className="font-bold text-lg mb-4">Order Summary</h3>
//             <div className="space-y-3 mb-6">
//               <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹{totalAmount}</span></div>
//               {mode === 'wholesale' && <div className="flex justify-between text-slate-600"><span>GST (12%)</span><span>₹{totalGST.toFixed(0)}</span></div>}
//               <div className="flex justify-between text-slate-600"><span>Shipping</span><span>{mode === 'wholesale' ? 'To be calculated' : 'Free'}</span></div>
//               <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-lg text-slate-900"><span>Total</span><span>₹{finalTotal.toFixed(0)}</span></div>
//             </div>
//             <button onClick={() => setView('checkout')} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg">Proceed to Checkout</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const CheckoutView = ({ cart, mode, placeOrder, setView }) => {
//   const [form, setForm] = useState({ name: '', phone: '', address: '' });
//   const handleSubmit = (e) => { e.preventDefault(); placeOrder(form); };
//   return (
//     <div className="container mx-auto px-4 py-8 max-w-2xl">
//       <button onClick={() => setView('cart')} className="text-sm text-slate-500 hover:text-slate-900 mb-6">← Back to Cart</button>
//       <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
//         <h2 className="text-2xl font-bold text-slate-900 mb-6">{mode === 'wholesale' ? 'Request Bulk Quote' : 'Checkout'}</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div><label className="block text-sm font-medium text-slate-700 mb-1">Full Name / Shop Name</label><input required type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
//           <div><label className="block text-sm font-medium text-slate-700 mb-1">Phone Number (WhatsApp)</label><input required type="tel" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
//           <div><label className="block text-sm font-medium text-slate-700 mb-1">Delivery Address</label><textarea required rows="3" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.address} onChange={e => setForm({...form, address: e.target.value})}></textarea></div>
//           <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">{mode === 'wholesale' ? "Quote request only. We will contact you via WhatsApp." : "Cash on Delivery available for Agra."}</div>
//           <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-md">{mode === 'wholesale' ? 'Submit Quote Request' : 'Place Order'}</button>
//         </form>
//       </div>
//     </div>
//   );
// };

// // --- AUTH COMPONENTS ---

// const LoginView = ({ setMode, setView, setUser }) => {
//   const [isRegistering, setIsRegistering] = useState(false);
//   const [formData, setFormData] = useState({ name: '', phone: '', password: '' });

//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     // --- ADMIN BACKDOOR CHECK ---
//     // Allows admin to login with 'admin' or email
//     if (formData.phone === 'admin' || formData.phone === 'admin@agra.com') {
//        setUser({ name: 'Owner', type: 'admin', mobile: 'Admin' });
//        setView('admin');
//        return;
//     }

//     // --- REGULAR USER LOGIN/SIGNUP SIMULATION ---
//     if (isRegistering) {
//       // Simulate Registration Success
//       setUser({ name: formData.name, type: 'wholesale', mobile: formData.phone });
//     } else {
//       // Simulate Login Success (In real app, verify credentials here)
//       setUser({ name: 'Verified Buyer', type: 'wholesale', mobile: formData.phone });
//     }
//     setMode('wholesale'); // Default to wholesale for logged in users
//     setView('shop');
//   };

//   return (
//     <div className="min-h-[60vh] flex items-center justify-center px-4">
//       <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-xl shadow-lg transition-all duration-300">
//         <div className="text-center mb-8">
//           <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white mx-auto mb-4">
//             <Package size={32} />
//           </div>
//           <h2 className="text-2xl font-bold text-slate-900">
//             {isRegistering ? 'Create Account' : 'Welcome Back'}
//           </h2>
//           <p className="text-slate-500 mt-2">
//             {isRegistering ? 'Join 500+ Retailers across India' : 'Enter mobile to access wholesale rates'}
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Name Field - Only for Registration */}
//           {isRegistering && (
//             <div className="animate-in fade-in slide-in-from-top-2">
//               <label className="block text-sm font-medium text-slate-700 mb-1">Full Name / Shop Name</label>
//               <input 
//                 required 
//                 type="text" 
//                 placeholder="Agra Footwear Co." 
//                 className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500 transition"
//                 value={formData.name}
//                 onChange={e => setFormData({...formData, name: e.target.value})}
//               />
//             </div>
//           )}

//           {/* Phone Number Field - Primary ID */}
//           <div>
//              <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
//              <input 
//                type="text" 
//                required 
//                placeholder="98765XXXXX" 
//                className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500 transition" 
//                value={formData.phone}
//                onChange={e => setFormData({...formData, phone: e.target.value})}
//              />
//           </div>

//           {/* Password Field */}
//           <div>
//              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
//              <input 
//                type="password" 
//                placeholder="••••••••" 
//                className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500 transition" 
//                value={formData.password}
//                onChange={e => setFormData({...formData, password: e.target.value})}
//              />
//           </div>

//           <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-md">
//             {isRegistering ? 'Register Now' : 'Login Securely'}
//           </button>
//         </form>

//         {/* Toggle Switch */}
//         <div className="mt-6 text-center border-t border-slate-100 pt-6">
//           <p className="text-sm text-slate-500 mb-3">
//             {isRegistering ? 'Already have an account?' : 'New to Agra Shoe Mart?'}
//           </p>
//           <button 
//             onClick={() => setIsRegistering(!isRegistering)}
//             className="text-blue-600 font-bold hover:text-blue-800 text-sm border border-blue-200 px-4 py-2 rounded-full hover:bg-blue-50 transition"
//           >
//             {isRegistering ? 'Login Instead' : 'Create New Account'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- MAIN CONTROLLER ---

// const App = () => {
//   const [view, setView] = useState('home');
//   const [mode, setMode] = useState('retail');
//   const [cart, setCart] = useState([]);
//   const [user, setUser] = useState(null);
//   const [products, setProducts] = useState(INITIAL_PRODUCTS); // LIFTED STATE FOR PRODUCTS
//   const [orders, setOrders] = useState([]);
//   const [showToast, setShowToast] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   // --- LOGOUT LOGIC ---
//   const handleLogout = () => {
//     if (window.confirm("Are you sure you want to logout?")) {
//       setUser(null);
//       setMode('retail'); // Reset to default retail mode
//       setView('home');   // Go to home
//     }
//   };
//   // --------------------

//   const addToCart = (item) => {
//     // --- AUTH GUARD ---
//     if (!user) {
//       alert("Please login to add items to your cart.");
//       setView('login');
//       return;
//     }
//     // ------------------

//     setCart([...cart, item]);
//     setShowToast(true);
//     setTimeout(() => setShowToast(false), 3000);
//   };

//   const removeFromCart = (index) => {
//     const newCart = [...cart];
//     newCart.splice(index, 1);
//     setCart(newCart);
//   };

//   const placeOrder = (customerDetails) => {
//     const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
//     const gst = mode === 'wholesale' ? total * 0.12 : 0;
    
//     const newOrder = {
//       id: 'ORD-' + Math.floor(Math.random() * 10000),
//       customer: customerDetails,
//       items: cart,
//       total: total + gst,
//       type: mode,
//       status: 'Pending',
//       date: new Date().toISOString()
//     };

//     setOrders([newOrder, ...orders]); // Save to "Database"
//     setCart([]);
//     setView('success');
//   };

//   const renderView = () => {
//     switch(view) {
//       case 'home': return <HomeView setView={setView} mode={mode} />;
//       case 'shop': return <ShopView products={products} mode={mode} onAddToCart={addToCart} />;
//       case 'cart': return <CartView cart={cart} mode={mode} removeFromCart={removeFromCart} setView={setView} />;
//       case 'checkout': return <CheckoutView cart={cart} mode={mode} placeOrder={placeOrder} setView={setView} />;
//       case 'login': return <LoginView setMode={setMode} setView={setView} setUser={setUser} />;
//       case 'admin': return <AdminDashboard orders={orders} products={products} setProducts={setProducts} setView={setView} onLogout={handleLogout} />;
//       case 'success': return (
//         <div className="container mx-auto px-4 py-20 text-center">
//           <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} /></div>
//           <h2 className="text-3xl font-bold text-slate-900 mb-4">{mode === 'wholesale' ? 'Quote Request Sent!' : 'Order Placed Successfully!'}</h2>
//           <p className="text-slate-600 max-w-md mx-auto mb-8">
//             {mode === 'wholesale' 
//               ? 'Our team will review your bulk requirement and send a proforma invoice via WhatsApp shortly.' 
//               : 'Thank you for shopping with Agra Shoe Mart. Your shoes will be dispatched within 24 hours.'}
//           </p>
//           <button onClick={() => setView('home')} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold">Return Home</button>
//         </div>
//       );
//       default: return <HomeView setView={setView} mode={mode} />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
//       {/* Navbar (Hidden in Admin Mode) */}
//       {view !== 'admin' && (
//         <nav className="bg-white shadow-md sticky top-0 z-50">
//           <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 flex justify-between items-center">
//             <span className="hidden sm:inline">Agra's Trusted Shoe Wholesaler - Since 2003</span>
//             <div className="flex items-center gap-4">
//               <span className="flex items-center gap-1 hover:text-white cursor-pointer transition">
//                 <Phone size={14} /> +91 98765-XXXXX
//               </span>
//               <span className="text-amber-500 font-bold cursor-pointer hover:underline hidden sm:block">
//                 Request Sample Kit
//               </span>
//             </div>
//           </div>

//           <div className="container mx-auto px-4 py-4">
//             <div className="flex justify-between items-center">
//               <div onClick={() => setView('home')} className="flex items-center gap-2 cursor-pointer">
//                 <div className="bg-red-600 text-white p-1 rounded font-bold text-xl">ASM</div>
//                 <div className="text-2xl font-bold tracking-tighter text-slate-800 leading-none">
//                   AGRA<span className="text-red-600">SHOES</span>
//                 </div>
//               </div>

//               <div className="hidden md:flex gap-8 font-medium text-slate-600 text-sm">
//                 <button onClick={() => setView('home')} className="hover:text-red-600 transition">Home</button>
//                 <button onClick={() => setView('shop')} className="hover:text-red-600 transition">Shop Catalog</button>
//                 <button onClick={() => setView('shop')} className="hover:text-red-600 transition">New Arrivals</button>
//               </div>

//               <div className="flex items-center gap-4">
//                 <div className="hidden md:flex bg-slate-100 rounded-full p-1 border border-slate-200 mr-2">
//                   <button onClick={() => setMode('retail')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${mode === 'retail' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Retail</button>
//                   <button onClick={() => setMode('wholesale')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${mode === 'wholesale' ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}>Wholesale</button>
//                 </div>

//                 <button onClick={() => setView('cart')} className="relative p-2 hover:bg-slate-100 rounded-full transition group">
//                   <ShoppingCart size={22} className="text-slate-700 group-hover:text-red-600" />
//                   {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">{cart.length}</span>}
//                 </button>
                
//                 {user ? (
//                   <div className="flex items-center gap-2">
//                     <button onClick={() => user.type === 'admin' ? setView('admin') : setView('home')} className="flex items-center gap-2 font-bold text-sm bg-slate-100 px-3 py-2 rounded-lg hover:bg-slate-200 transition">
//                       <User size={18}/> <span className="hidden sm:inline">{user.name}</span>
//                     </button>
//                     {/* LOGOUT BUTTON */}
//                     <button onClick={handleLogout} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition shadow-sm" title="Logout">
//                       <LogOut size={18} />
//                     </button>
//                   </div>
//                 ) : (
//                   <button onClick={() => setView('login')} className="hidden sm:flex bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm">Login</button>
//                 )}

//                 <button className="md:hidden text-slate-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
//                    {isMobileMenuOpen ? <X /> : <Menu />}
//                 </button>
//               </div>
//             </div>

//             {isMobileMenuOpen && (
//               <div className="md:hidden mt-4 pb-4 border-t pt-4">
//                  <div className="flex bg-slate-100 rounded-lg p-1 mb-4">
//                   <button onClick={() => { setMode('retail'); setIsMobileMenuOpen(false); }} className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === 'retail' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Retail</button>
//                   <button onClick={() => { setMode('wholesale'); setIsMobileMenuOpen(false); }} className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === 'wholesale' ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}>Wholesale</button>
//                 </div>
//                 <div className="space-y-3 text-slate-700 font-medium">
//                   <button onClick={() => { setView('home'); setIsMobileMenuOpen(false); }} className="block w-full text-left hover:text-red-600">Home</button>
//                   <button onClick={() => { setView('shop'); setIsMobileMenuOpen(false); }} className="block w-full text-left hover:text-red-600">Shop Catalog</button>
//                   <button onClick={() => { setView('login'); setIsMobileMenuOpen(false); }} className="block w-full text-left text-blue-600">Login / Register</button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </nav>
//       )}

//       <main className="flex-1">{renderView()}</main>

//       {view !== 'admin' && (
//         <footer className="bg-slate-900 text-slate-400 py-12">
//           <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
//             <div>
//               <h4 className="text-white font-bold text-lg mb-4">AGRA SHOES</h4>
//               <p className="mb-4">Digitizing the legacy of Agra's shoemaking. We connect manufacturers directly to retailers across India.</p>
//               <p>Agra, Uttar Pradesh, India - 282002</p>
//             </div>
//             <div>
//               <h4 className="text-white font-bold mb-4">Shop</h4>
//               <ul className="space-y-2">
//                 <li className="hover:text-white cursor-pointer">Men's Formal</li>
//                 <li className="hover:text-white cursor-pointer">Casual Loafers</li>
//                 <li className="hover:text-white cursor-pointer">Safety Shoes</li>
//                 <li className="hover:text-white cursor-pointer">School Shoes</li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="text-white font-bold mb-4">Wholesale</h4>
//               <ul className="space-y-2">
//                 <li className="hover:text-white cursor-pointer">Register as Distributor</li>
//                 <li className="hover:text-white cursor-pointer">Bulk Pricing Policy</li>
//                 <li className="hover:text-white cursor-pointer">Shipping & Logistics</li>
//                 <li className="hover:text-white cursor-pointer">Return Policy</li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="text-white font-bold mb-4">Stay Connected</h4>
//               <p className="mb-4">Get latest design updates on WhatsApp.</p>
//               <div className="flex gap-2">
//                 <input type="text" placeholder="+91 Mobile Number" className="bg-slate-800 border-none rounded px-3 py-2 w-full text-white outline-none focus:ring-1 focus:ring-slate-600" />
//                 <button className="bg-green-600 text-white px-3 py-2 rounded font-bold hover:bg-green-700">Join</button>
//               </div>
//             </div>
//           </div>
//           <div className="text-center mt-12 pt-8 border-t border-slate-800">
//             &copy; 2025 Agra Wholesale Shoe Mart. All rights reserved.
//           </div>
//         </footer>
//       )}

//       {showToast && (
//         <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-bounce z-50">
//           <CheckCircle size={20} className="text-green-400" />
//           <p className="font-bold text-sm">Added to Cart</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;
// import React, { useState } from 'react';
// import { 
//   ShoppingCart, User, Phone, Menu, X, CheckCircle, Truck, 
//   ShieldCheck, Info, Package, ArrowRight, Trash2, Filter, 
//   Search, ClipboardList, Users, LogOut, Plus, Save,
//   Tag, Layers, DollarSign, ChevronLeft, ChevronRight, Upload, 
//   XCircle, FileText, MapPin, Smartphone, Calendar, Edit2, Archive
// } from 'lucide-react';

// // --- MOCK DATABASE ---
// const INITIAL_PRODUCTS = [
//   { 
//     id: 1, 
//     name: 'Agra Classic Loafer', 
//     category: 'Men\'s Formal', 
//     retailPrice: 1499, 
//     wholesalePrice: 450, 
//     moq: 24, 
//     stock: 1000, 
//     sizes: [6,7,8,9,10], 
//     images: [
//       'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800&auto=format&fit=crop',
//       'https://images.unsplash.com/photo-1533867617858-e7b97e0605df?q=80&w=800&auto=format&fit=crop', 
//       'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop'
//     ], 
//     tag: 'Best Seller' 
//   },
//   { 
//     id: 2, 
//     name: 'Genuine Leather Oxford', 
//     category: 'Office Wear', 
//     retailPrice: 2199, 
//     wholesalePrice: 750, 
//     moq: 12, 
//     stock: 500, 
//     sizes: [6,7,8,9,10], 
//     images: ['https://images.unsplash.com/photo-1478186172493-493ca852a743?q=80&w=800&auto=format&fit=crop'], 
//     tag: 'Premium' 
//   },
//   { 
//     id: 3, 
//     name: 'Daily Soft Sandal', 
//     category: 'Women\'s Comfort', 
//     retailPrice: 899, 
//     wholesalePrice: 220, 
//     moq: 48, 
//     stock: 2000, 
//     sizes: [4,5,6,7,8], 
//     images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop'], 
//     tag: 'High Demand' 
//   },
//   { 
//     id: 4, 
//     name: 'Rugged Chelsea Boot', 
//     category: 'Men\'s Boots', 
//     retailPrice: 2899, 
//     wholesalePrice: 950, 
//     moq: 12, 
//     stock: 300, 
//     sizes: [7,8,9,10,11], 
//     images: ['https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800&auto=format&fit=crop'], 
//     tag: 'New Arrival' 
//   },
//   { 
//     id: 5, 
//     name: 'Canvas Sneaker', 
//     category: 'Casual', 
//     retailPrice: 999, 
//     wholesalePrice: 310, 
//     moq: 36, 
//     stock: 800, 
//     sizes: [6,7,8,9,10], 
//     images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop'], 
//     tag: null 
//   },
//   { 
//     id: 6, 
//     name: 'Kids School Shoe', 
//     category: 'School', 
//     retailPrice: 699, 
//     wholesalePrice: 180, 
//     moq: 60, 
//     stock: 5000, 
//     sizes: [1,2,3,4,5], 
//     images: ['https://images.unsplash.com/photo-1515347619252-60a6bf4fffce?q=80&w=800&auto=format&fit=crop'], 
//     tag: 'Back to School' 
//   },
// ];

// const CATEGORIES = ['All', 'Men\'s Formal', 'Office Wear', 'Women\'s Comfort', 'Men\'s Boots', 'Casual', 'School'];

// const generateId = () => Math.floor(Math.random() * 100000);

// // --- COMPONENTS ---

// const ProductCard = ({ product, mode, onAddToCart }) => {
//   const [showMatrix, setShowMatrix] = useState(false);
//   const [currentImgIndex, setCurrentImgIndex] = useState(0);
//   const [quantities, setQuantities] = useState(
//     product.sizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {})
//   );
  
//   const totalPairs = Object.values(quantities).reduce((a, b) => a + Number(b), 0);
//   const matrixTotalCost = totalPairs * product.wholesalePrice;

//   const nextImage = (e) => {
//     e.stopPropagation();
//     setCurrentImgIndex((prev) => (prev + 1) % product.images.length);
//   };

//   const prevImage = (e) => {
//     e.stopPropagation();
//     setCurrentImgIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
//   };

//   const handleWholesaleAdd = () => {
//     if (totalPairs < product.moq) {
//       alert(`Minimum Order Quantity is ${product.moq} pairs.`);
//       return;
//     }
//     onAddToCart({
//       ...product,
//       type: 'wholesale',
//       breakdown: quantities,
//       quantity: totalPairs,
//       price: product.wholesalePrice,
//       image: product.images[0]
//     });
//     setQuantities(product.sizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {}));
//     setShowMatrix(false);
//   };

//   const handleRetailAdd = () => {
//     onAddToCart({
//       ...product,
//       type: 'retail',
//       quantity: 1,
//       price: product.retailPrice,
//       image: product.images[0]
//     });
//   };

//   return (
//     <div className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
//       <div className="relative h-64 bg-slate-100 group">
//         <img 
//           src={product.images[currentImgIndex]} 
//           alt={product.name} 
//           className="w-full h-full object-cover transition-transform duration-500" 
//         />
//         {product.tag && <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] uppercase font-bold px-2 py-1 rounded backdrop-blur-sm z-10">{product.tag}</span>}
//         {mode === 'wholesale' && <span className="absolute top-2 left-2 bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">MOQ: {product.moq}</span>}

//         {product.images.length > 1 && (
//           <>
//             <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full text-slate-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft size={20} /></button>
//             <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full text-slate-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={20} /></button>
//             <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
//               {product.images.map((_, idx) => (
//                 <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImgIndex ? 'bg-white scale-125' : 'bg-white/50'}`} />
//               ))}
//             </div>
//           </>
//         )}
//       </div>

//       <div className="p-4 flex-1 flex flex-col">
//         <div className="mb-2">
//           <span className="text-xs text-slate-500 uppercase tracking-wide">{product.category}</span>
//           <h3 className="text-lg font-bold text-slate-800 leading-tight">{product.name}</h3>
//         </div>
        
//         <div className="mt-auto pt-4 border-t border-slate-100">
//           <div className="flex justify-between items-end mb-4">
//             <div>
//               <p className="text-xs text-slate-500 mb-0.5">Price per pair</p>
//               <div className="flex items-baseline gap-2">
//                 <span className="text-xl font-bold text-slate-900">₹{mode === 'retail' ? product.retailPrice : product.wholesalePrice}</span>
//                 {mode === 'retail' && <span className="text-xs text-red-500 line-through">₹{Math.floor(product.retailPrice * 1.2)}</span>}
//               </div>
//               {mode === 'wholesale' && <p className="text-[10px] text-red-600 font-medium">*Excl. GST</p>}
//             </div>
//             {mode === 'retail' ? (
//               <button onClick={handleRetailAdd} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-200">Add</button>
//             ) : (
//               <button onClick={() => setShowMatrix(!showMatrix)} className={`px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg ${showMatrix ? 'bg-slate-200 text-slate-800' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}>{showMatrix ? 'Close' : 'Bulk'}</button>
//             )}
//           </div>

//           {mode === 'wholesale' && showMatrix && (
//             <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2">
//               <div className="flex justify-between items-center mb-2">
//                  <span className="text-[10px] font-bold text-slate-500">SELECT SIZES</span>
//               </div>
//               <div className="grid grid-cols-5 gap-1 mb-3">
//                 {product.sizes.map((size) => (
//                   <div key={size} className="text-center">
//                     <label className="block text-[10px] text-slate-500">UK {size}</label>
//                     <input type="number" min="0" value={quantities[size] || ''} onChange={(e) => setQuantities(prev => ({...prev, [size]: e.target.value}))} className="w-full border border-slate-300 rounded p-1 text-center text-xs" placeholder="0" />
//                   </div>
//                 ))}
//               </div>
//               <div className="flex justify-between text-xs mb-2">
//                 <span>Pairs: <strong>{totalPairs}</strong></span>
//                 <span>Total: <strong className="text-blue-600">₹{matrixTotalCost}</strong></span>
//               </div>
//               <button onClick={handleWholesaleAdd} disabled={totalPairs === 0} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white py-1.5 rounded text-xs font-bold uppercase">Add Batch</button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// const Features = () => (
//   <div className="bg-slate-50 py-12 border-y border-slate-200">
//     <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-blue-600"><Truck /></div>
//         <h3 className="font-bold text-slate-800 mb-2">Nationwide Delivery</h3>
//         <p className="text-sm text-slate-500 px-4">From Agra to anywhere in India. We use trusted B2B logistics partners.</p>
//       </div>
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-amber-500"><ShieldCheck /></div>
//         <h3 className="font-bold text-slate-800 mb-2">Quality Guarantee</h3>
//         <p className="text-sm text-slate-500 px-4">Every pair is inspected before packing. 20 years of reputation at stake.</p>
//       </div>
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-red-600"><Info /></div>
//         <h3 className="font-bold text-slate-800 mb-2">Direct Support</h3>
//         <p className="text-sm text-slate-500 px-4">Call us anytime. We believe in building relationships, not just sales.</p>
//       </div>
//     </div>
//   </div>
// );

// // --- ADMIN COMPONENTS ---

// const ProductForm = ({ initialData, onSave, onCancel }) => {
//   // If editing, use existing data. If new, use defaults.
//   const [formData, setFormData] = useState(initialData ? {
//     ...initialData,
//     sizes: initialData.sizes.join(',') // Convert array to string for input
//   } : {
//     name: '', category: 'Men\'s Formal', retailPrice: '', wholesalePrice: '', 
//     moq: 24, stock: 100, sizes: '6,7,8,9,10', tag: '', 
//     images: [] 
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (formData.images.length === 0) {
//       alert("Please upload at least one image.");
//       return;
//     }
//     const newProduct = {
//       ...formData,
//       id: formData.id || generateId(), // Preserve ID if editing
//       retailPrice: Number(formData.retailPrice),
//       wholesalePrice: Number(formData.wholesalePrice),
//       moq: Number(formData.moq),
//       stock: Number(formData.stock),
//       // Convert comma string back to number array, trimming whitespace
//       sizes: String(formData.sizes).split(',').map(s => Number(s.trim())).filter(n => !isNaN(n))
//     };
//     onSave(newProduct);
//   };

//   const handleImageUpload = (e) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const newImageUrls = Array.from(e.target.files).map(file => URL.createObjectURL(file));
//       setFormData(prev => ({ ...prev, images: [...prev.images, ...newImageUrls] }));
//     }
//   };

//   const removeImage = (indexToRemove) => {
//     setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== indexToRemove) }));
//   };

//   const fillRandomImage = () => {
//     const urls = [
//       'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800',
//       'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800',
//       'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=800',
//       'https://images.unsplash.com/photo-1560769629-975e13f0c470?q=80&w=800'
//     ];
//     setFormData({...formData, images: [...formData.images, urls[Math.floor(Math.random() * urls.length)]]});
//   };

//   return (
//     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg animate-in fade-in slide-in-from-bottom-4">
//       <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
//         {initialData ? <Edit2 className="text-blue-600" /> : <Plus className="text-green-600" />} 
//         {initialData ? 'Edit Product' : 'Add New Product'}
//       </h3>
//       <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div className="md:col-span-2">
//           <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Product Name</label>
//           <input required type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-slate-900 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Leather Oxford Pro" />
//         </div>
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Category</label>
//            <select className="w-full border p-2 rounded outline-none bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
//              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
//            </select>
//         </div>
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Sizes (Comma Sep)</label>
//            <input required type="text" className="w-full border p-2 rounded outline-none" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} placeholder="6, 7, 8, 11, 12" />
//         </div>
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Retail Price (₹)</label>
//            <input required type="number" className="w-full border p-2 rounded outline-none" value={formData.retailPrice} onChange={e => setFormData({...formData, retailPrice: e.target.value})} />
//         </div>
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Wholesale Price (₹)</label>
//            <input required type="number" className="w-full border p-2 rounded outline-none" value={formData.wholesalePrice} onChange={e => setFormData({...formData, wholesalePrice: e.target.value})} />
//         </div>
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Min Order Qty</label>
//            <input required type="number" className="w-full border p-2 rounded outline-none" value={formData.moq} onChange={e => setFormData({...formData, moq: e.target.value})} />
//         </div>
//         <div className="grid grid-cols-2 gap-2">
//            <div>
//              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Stock Qty</label>
//              <input required type="number" className="w-full border p-2 rounded outline-none" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
//            </div>
//            <div>
//              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Tag / Status</label>
//              <input type="text" className="w-full border p-2 rounded outline-none" value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})} placeholder="Out of Stock / Best Seller" />
//            </div>
//         </div>
//         <div className="md:col-span-2">
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Product Images</label>
//            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition cursor-pointer relative">
//              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
//              <Upload className="mx-auto text-slate-400 mb-2" />
//              <p className="text-sm text-slate-500 font-medium">Click to select images from device</p>
//              <p className="text-xs text-slate-400">JPG, PNG supported</p>
//            </div>
           
//            <div className="mt-2 flex gap-2">
//               <button type="button" onClick={fillRandomImage} className="text-xs text-blue-600 underline">Add Random Mock Image</button>
//            </div>

//            {formData.images.length > 0 && (
//              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
//                {formData.images.map((img, idx) => (
//                  <div key={idx} className="relative shrink-0 w-20 h-20 group">
//                    <img src={img} alt="Preview" className="w-full h-full object-cover rounded-lg border border-slate-200" />
//                    <button type="button" onClick={() => removeImage(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600"><X size={12} /></button>
//                  </div>
//                ))}
//              </div>
//            )}
//         </div>
//         <div className="md:col-span-2 flex gap-3 mt-2">
//           <button type="button" onClick={onCancel} className="flex-1 py-2 border border-slate-300 rounded text-slate-600 font-bold hover:bg-slate-50">Cancel</button>
//           <button type="submit" className="flex-1 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 flex justify-center items-center gap-2">
//             <Save size={18}/> {initialData ? 'Update Product' : 'Save Product'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// // Order Details Modal Component
// const OrderDetailModal = ({ order, onClose }) => {
//   if (!order) return null;

//   return (
//     <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//       <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
//         {/* Header */}
//         <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
//           <div>
//             <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
//               <FileText className="text-blue-600" size={20} /> Order #{order.id}
//             </h3>
//             <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
//               <Calendar size={14} /> {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}
//             </p>
//           </div>
//           <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition">
//             <XCircle size={28} />
//           </button>
//         </div>

//         {/* Scrollable Content */}
//         <div className="overflow-y-auto p-6 flex-1">
//           {/* Customer Details Section */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//             <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
//               <h4 className="text-xs font-bold text-blue-800 uppercase mb-3 flex items-center gap-2"><User size={14}/> Customer Information</h4>
//               <div className="space-y-2 text-sm text-slate-700">
//                 <p><span className="font-semibold text-slate-900">Name:</span> {order.customer.name}</p>
//                 <p className="flex items-start gap-2"><span className="font-semibold text-slate-900 whitespace-nowrap">Phone:</span> {order.customer.phone}</p>
//                 <p><span className="font-semibold text-slate-900">Type:</span> <span className={`px-2 py-0.5 rounded text-xs font-bold ${order.type === 'wholesale' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{order.type.toUpperCase()}</span></p>
//               </div>
//             </div>
//             <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
//               <h4 className="text-xs font-bold text-slate-600 uppercase mb-3 flex items-center gap-2"><MapPin size={14}/> Delivery Address</h4>
//               <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{order.customer.address}</p>
//             </div>
//           </div>

//           {/* Items Table */}
//           <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Package size={16}/> Order Items</h4>
//           <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
//             <table className="w-full text-left text-sm">
//               <thead className="bg-slate-50 text-slate-500 font-medium">
//                 <tr>
//                   <th className="p-3">Product</th>
//                   <th className="p-3 text-center">Type</th>
//                   <th className="p-3">Breakdown</th>
//                   <th className="p-3 text-right">Price</th>
//                   <th className="p-3 text-right">Total</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {order.items.map((item, idx) => (
//                   <tr key={idx} className="hover:bg-slate-50/50">
//                     <td className="p-3">
//                       <div className="flex items-center gap-3">
//                         <img src={item.image} alt="" className="w-10 h-10 rounded object-cover bg-slate-100 border" />
//                         <span className="font-medium text-slate-900">{item.name}</span>
//                       </div>
//                     </td>
//                     <td className="p-3 text-center">
//                        {item.type === 'wholesale' 
//                          ? <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">BULK</span> 
//                          : <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">RETAIL</span>
//                        }
//                     </td>
//                     <td className="p-3">
//                       {item.type === 'wholesale' ? (
//                         <div className="grid grid-cols-4 gap-1 w-max">
//                           {Object.entries(item.breakdown).map(([size, qty]) => Number(qty) > 0 && (
//                             <div key={size} className="text-[10px] bg-white border rounded px-1 text-slate-500 whitespace-nowrap">
//                               UK{size}: <span className="font-bold text-slate-900">{qty}</span>
//                             </div>
//                           ))}
//                         </div>
//                       ) : (
//                         <span className="text-slate-500 text-xs">1 Pair (Standard)</span>
//                       )}
//                     </td>
//                     <td className="p-3 text-right text-slate-600">₹{item.price}</td>
//                     <td className="p-3 text-right font-bold text-slate-900">₹{item.price * item.quantity}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Financials */}
//           <div className="flex justify-end">
//             <div className="w-full md:w-64 bg-slate-50 p-4 rounded-lg border border-slate-200">
//               <div className="flex justify-between text-sm text-slate-600 mb-2">
//                 <span>Subtotal</span>
//                 <span>₹{order.total / (order.type === 'wholesale' ? 1.12 : 1) }</span>
//               </div>
//               {order.type === 'wholesale' && (
//                 <div className="flex justify-between text-sm text-slate-600 mb-2">
//                   <span>GST (12%)</span>
//                   <span>₹{(order.total - (order.total / 1.12)).toFixed(2)}</span>
//                 </div>
//               )}
//               <div className="flex justify-between font-bold text-lg text-slate-900 pt-3 border-t border-slate-200">
//                 <span>Total</span>
//                 <span>₹{Math.round(order.total)}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer Actions */}
//         <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
//           <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-bold hover:bg-white transition">Close</button>
//           <button onClick={() => alert("Printing Feature would go here.")} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 flex items-center gap-2 transition"><ClipboardList size={18}/> Process Order</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const AdminDashboard = ({ orders, products, setProducts, setView, onLogout }) => {
//   const [activeTab, setActiveTab] = useState('orders');
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null); 
//   const [editingProduct, setEditingProduct] = useState(null); // STATE FOR EDITING

//   const pendingOrders = orders.filter(o => o.status === 'Pending').length;
//   const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);

//   const handleSaveProduct = (productData) => {
//     if (editingProduct) {
//       // Update existing
//       setProducts(products.map(p => p.id === productData.id ? productData : p));
//       setEditingProduct(null);
//       alert("Product Updated Successfully!");
//     } else {
//       // Create new
//       setProducts([productData, ...products]);
//       setShowAddForm(false);
//       alert("Product Added Successfully!");
//     }
//   };

//   const handleEditClick = (product) => {
//     setEditingProduct(product);
//     setActiveTab('products'); // Ensure we are on the tab
//     window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
//   };

//   const handleDeleteProduct = (id) => {
//     if (window.confirm("Are you sure you want to delete this product?")) {
//       setProducts(products.filter(p => p.id !== id));
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8 bg-slate-50 min-h-screen">
//       {/* ORDER DETAILS MODAL */}
//       {selectedOrder && (
//         <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
//       )}

//       {/* Header */}
//       <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
//         <div>
//            <h2 className="text-2xl font-bold text-slate-900">Owner Dashboard</h2>
//            <p className="text-sm text-slate-500">Manage Orders & Inventory</p>
//         </div>
//         <div className="flex gap-3">
//           <button onClick={onLogout} className="bg-white border border-slate-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center gap-2 font-bold transition">
//             <LogOut size={16}/> Logout
//           </button>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="flex gap-4 mb-6 border-b border-slate-200">
//         <button onClick={() => setActiveTab('orders')} className={`pb-3 px-2 font-bold text-sm ${activeTab === 'orders' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500'}`}>Incoming Orders</button>
//         <button onClick={() => setActiveTab('products')} className={`pb-3 px-2 font-bold text-sm ${activeTab === 'products' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500'}`}>Manage Products ({products.length})</button>
//       </div>

//       {/* ORDERS TAB */}
//       {activeTab === 'orders' && (
//         <div className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4"><div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><ClipboardList /></div><div><p className="text-slate-500 text-sm">Total Orders</p><h3 className="text-2xl font-bold text-slate-900">{orders.length}</h3></div></div>
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4"><div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><Package /></div><div><p className="text-slate-500 text-sm">Pending</p><h3 className="text-2xl font-bold text-slate-900">{pendingOrders}</h3></div></div>
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4"><div className="p-3 bg-green-100 text-green-600 rounded-lg"><Users /></div><div><p className="text-slate-500 text-sm">Revenue (Est)</p><h3 className="text-2xl font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</h3></div></div>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//             <div className="p-6 border-b border-slate-100"><h3 className="font-bold text-lg text-slate-800">Recent Orders</h3></div>
//             <div className="overflow-x-auto">
//               <table className="w-full text-left text-sm">
//                 <thead className="bg-slate-50 text-slate-500 font-medium">
//                   <tr><th className="p-4">ID</th><th className="p-4">Customer</th><th className="p-4">Type</th><th className="p-4">Total</th><th className="p-4">Status</th><th className="p-4">Action</th></tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100">
//                   {orders.length === 0 ? (<tr><td colSpan="6" className="p-8 text-center text-slate-400">No orders yet.</td></tr>) : orders.map((order) => (
//                     <tr key={order.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => setSelectedOrder(order)}>
//                       <td className="p-4 font-mono text-xs text-slate-500">{order.id}</td>
//                       <td className="p-4 font-bold text-slate-900">{order.customer.name}</td>
//                       <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${order.type === 'wholesale' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{order.type}</span></td>
//                       <td className="p-4 font-bold text-slate-900">₹{Math.round(order.total)}</td>
//                       <td className="p-4"><span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold">{order.status}</span></td>
//                       <td className="p-4">
//                         <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }} className="text-blue-600 hover:text-blue-800 font-bold text-xs border border-blue-200 px-3 py-1 rounded hover:bg-blue-50 transition">View Details</button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* PRODUCTS TAB */}
//       {activeTab === 'products' && (
//         <div>
//           <div className="flex justify-between items-center mb-6">
//             <h3 className="text-xl font-bold text-slate-900">Product Inventory</h3>
//             {!showAddForm && !editingProduct && (
//               <button onClick={() => setShowAddForm(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 flex items-center gap-2 shadow-lg">
//                 <Plus size={18} /> Add New Product
//               </button>
//             )}
//           </div>

//           {/* Form Area */}
//           {(showAddForm || editingProduct) && (
//             <div className="mb-8">
//               <ProductForm 
//                 initialData={editingProduct} 
//                 onSave={handleSaveProduct} 
//                 onCancel={() => { setShowAddForm(false); setEditingProduct(null); }} 
//               />
//             </div>
//           )}

//           {/* Product List */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {products.map(product => (
//               <div key={product.id} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 items-start shadow-sm hover:shadow-md transition relative">
//                 <img src={product.images[0]} className="w-20 h-20 rounded-lg object-cover bg-slate-100" alt={product.name} />
//                 <div className="flex-1">
//                    <div className="flex justify-between items-start mb-1">
//                       <h4 className="font-bold text-slate-900 leading-tight">{product.name}</h4>
//                    </div>
//                    <p className="text-xs text-slate-500 mb-2">{product.category}</p>
//                    <div className="flex gap-4 text-sm mb-2">
//                       <div><span className="text-[10px] text-slate-400 uppercase block">Retail</span><span className="font-bold">₹{product.retailPrice}</span></div>
//                       <div><span className="text-[10px] text-slate-400 uppercase block">Wholesale</span><span className="font-bold text-blue-600">₹{product.wholesalePrice}</span></div>
//                    </div>
//                    <div className="flex flex-wrap gap-2 text-[10px]">
//                      <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">Stock: {product.stock}</span>
//                      {product.tag && <span className="bg-amber-100 px-2 py-1 rounded text-amber-800">{product.tag}</span>}
//                    </div>
                   
//                    {/* ACTION BUTTONS */}
//                    <div className="flex gap-2 mt-4">
//                      <button 
//                        onClick={() => handleEditClick(product)}
//                        className="flex-1 bg-blue-50 text-blue-600 text-xs font-bold py-1.5 rounded hover:bg-blue-100 flex items-center justify-center gap-1 transition"
//                      >
//                        <Edit2 size={12} /> Edit
//                      </button>
//                      <button 
//                        onClick={() => handleDeleteProduct(product.id)}
//                        className="flex-1 bg-red-50 text-red-600 text-xs font-bold py-1.5 rounded hover:bg-red-100 flex items-center justify-center gap-1 transition"
//                      >
//                        <Trash2 size={12} /> Remove
//                      </button>
//                    </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // --- VIEWS ---

// const ShopView = ({ products, mode, onAddToCart }) => {
//   const [filter, setFilter] = useState('All');
//   const [searchTerm, setSearchTerm] = useState('');
  
//   const filteredProducts = products.filter(p => {
//     const matchesCategory = filter === 'All' || p.category === filter;
//     const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
//         <div>
//           <h2 className="text-3xl font-bold text-slate-900">{mode === 'wholesale' ? 'Wholesale Catalog' : 'Shop Collection'}</h2>
//           <p className="text-slate-500 text-sm mt-1">{mode === 'wholesale' ? 'Bulk pricing applied. MOQ rules active.' : 'Latest trends from Agra.'}</p>
//         </div>
        
//         {/* Search Bar */}
//         <div className="relative w-full md:w-64">
//           <input 
//             type="text" 
//             placeholder="Search shoes..." 
//             className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
//         </div>
//       </div>

//       {/* Category Pills */}
//       <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4">
//         <Filter size={18} className="text-slate-400 shrink-0" />
//         {CATEGORIES.map(cat => (
//           <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${filter === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
//             {cat}
//           </button>
//         ))}
//       </div>

//       {filteredProducts.length === 0 ? (
//         <div className="text-center py-20 text-slate-400">No products found matching your search.</div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {filteredProducts.map(product => (
//             <ProductCard key={product.id} product={product} mode={mode} onAddToCart={onAddToCart} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// const HomeView = ({ setView, mode }) => (
//   <>
//     <div className="bg-white border-b border-slate-200">
//       <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row items-center gap-10">
//         <div className="flex-1 text-center md:text-left">
//           <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold mb-6">
//             <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
//             {mode === 'wholesale' ? 'ACCEPTING NEW DISTRIBUTORS' : 'SEASONAL SALE IS LIVE'}
//           </div>
//           <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
//             {mode === 'wholesale' ? <>Factory Direct.<br /><span className="text-blue-600">Maximize Margins.</span></> : <>Handcrafted in Agra.<br /><span className="text-red-600">Worn Everywhere.</span></>}
//           </h1>
//           <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
//             {mode === 'wholesale' ? 'Connect directly with our 20-year-old manufacturing unit. Get transparent pricing, bulk shipping support, and custom branding options.' : 'Discover the finest leather shoes directly from the shoe capital of India. Premium quality, honest prices, delivered to your doorstep.'}
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
//             <button onClick={() => setView('shop')} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2">
//               {mode === 'wholesale' ? 'View Catalog' : 'Shop Collection'} <ArrowRight size={18} />
//             </button>
//           </div>
//         </div>
        
//         <div className="flex-1 w-full max-w-md md:max-w-full">
//            <div className="relative">
//              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-amber-50 rounded-2xl transform rotate-3"></div>
//              <img 
//                src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop" 
//                alt="Shoe Craftsmanship" 
//                className="relative rounded-2xl shadow-2xl w-full h-auto object-cover transform -rotate-2 hover:rotate-0 transition duration-700"
//              />
//              {mode === 'wholesale' && (
//                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3">
//                  <div className="bg-green-100 p-2 rounded-full text-green-600"><CheckCircle size={24} /></div>
//                  <div>
//                    <p className="text-sm font-bold text-slate-800">Verified Manufacturer</p>
//                    <p className="text-xs text-slate-500">GST Registered • IEC License</p>
//                  </div>
//                </div>
//              )}
//            </div>
//         </div>
//       </div>
//     </div>
//     <Features />
//   </>
// );

// const CartView = ({ cart, mode, removeFromCart, setView }) => {
//   const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
//   const totalGST = mode === 'wholesale' ? totalAmount * 0.12 : 0; // 12% GST for wholesale
//   const finalTotal = totalAmount + totalGST;

//   if (cart.length === 0) return (
//     <div className="container mx-auto px-4 py-20 text-center">
//       <ShoppingCart size={64} className="mx-auto text-slate-200 mb-4" />
//       <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
//       <button onClick={() => setView('shop')} className="text-blue-600 font-medium hover:underline">Start Shopping</button>
//     </div>
//   );

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h2 className="text-2xl font-bold text-slate-900 mb-8">Shopping Cart ({cart.length} items)</h2>
//       <div className="flex flex-col lg:flex-row gap-8">
//         <div className="flex-1 space-y-4">
//           {cart.map((item, idx) => (
//             <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl flex gap-4">
//               <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg bg-slate-100" />
//               <div className="flex-1">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h3 className="font-bold text-slate-900">{item.name}</h3>
//                     <p className="text-sm text-slate-500">{item.category}</p>
//                   </div>
//                   <button onClick={() => removeFromCart(idx)} className="text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
//                 </div>
                
//                 {item.type === 'wholesale' ? (
//                    <div className="mt-2 bg-slate-50 p-2 rounded text-xs text-slate-600 grid grid-cols-5 gap-2">
//                      {Object.entries(item.breakdown).map(([size, qty]) => Number(qty) > 0 && (
//                        <div key={size} className="text-center bg-white border border-slate-200 rounded px-1">
//                          <span className="block text-[10px] text-slate-400">UK {size}</span>
//                          <span className="font-bold">{qty}</span>
//                        </div>
//                      ))}
//                    </div>
//                 ) : (
//                   <div className="mt-2 text-sm text-slate-600">Qty: {item.quantity} Pair</div>
//                 )}
                
//                 <div className="mt-3 flex justify-between items-center">
//                    <div className="text-xs text-slate-500">{item.quantity} pairs x ₹{item.price}</div>
//                    <div className="font-bold text-slate-900">₹{item.quantity * item.price}</div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="w-full lg:w-96">
//           <div className="bg-white border border-slate-200 p-6 rounded-xl sticky top-24 shadow-sm">
//             <h3 className="font-bold text-lg mb-4">Order Summary</h3>
//             <div className="space-y-3 mb-6">
//               <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹{totalAmount}</span></div>
//               {mode === 'wholesale' && (
//                 <div className="flex justify-between text-slate-600"><span>GST (12%)</span><span>₹{totalGST.toFixed(0)}</span></div>
//               )}
//               <div className="flex justify-between text-slate-600"><span>Shipping</span><span>{mode === 'wholesale' ? 'To be calculated' : 'Free'}</span></div>
//               <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-lg text-slate-900">
//                 <span>Total</span><span>₹{finalTotal.toFixed(0)}</span>
//               </div>
//             </div>
//             <button onClick={() => setView('checkout')} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg">
//               Proceed to Checkout
//             </button>
//             <p className="text-xs text-slate-400 text-center mt-3">Secure Checkout via Agra Shoe Mart</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const CheckoutView = ({ cart, mode, placeOrder, setView }) => {
//   const [form, setForm] = useState({ name: '', phone: '', address: '' });
  
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     placeOrder(form);
//   };

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-2xl">
//       <button onClick={() => setView('cart')} className="text-sm text-slate-500 hover:text-slate-900 mb-6">← Back to Cart</button>
//       <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
//         <h2 className="text-2xl font-bold text-slate-900 mb-6">{mode === 'wholesale' ? 'Request Bulk Quote' : 'Checkout'}</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Full Name / Shop Name</label>
//             <input required type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number (WhatsApp)</label>
//             <input required type="tel" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Address</label>
//             <textarea required rows="3" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.address} onChange={e => setForm({...form, address: e.target.value})}></textarea>
//           </div>
          
//           <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
//             {mode === 'wholesale' 
//               ? "Note: This is a quote request. Our sales team will contact you on WhatsApp to confirm availability and shipping costs before payment."
//               : "Note: Cash on Delivery is available for Agra. Online payment link will be sent for other cities."
//             }
//           </div>

//           <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-md">
//             {mode === 'wholesale' ? 'Submit Quote Request' : 'Place Order'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// const LoginView = ({ setMode, setView, setUser }) => {
//   const [email, setEmail] = useState('');
  
//   const handleLogin = (e) => {
//     e.preventDefault();
//     if (email.includes('admin')) {
//       setUser({ name: 'Owner', type: 'admin', email });
//       setView('admin');
//     } else {
//       setUser({ name: 'Verified Buyer', type: 'wholesale', email });
//       setMode('wholesale');
//       setView('shop');
//     }
//   };

//   return (
//     <div className="min-h-[60vh] flex items-center justify-center px-4">
//       <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-xl shadow-lg">
//         <div className="text-center mb-8">
//           <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white mx-auto mb-4"><Package size={32} /></div>
//           <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
//           <p className="text-slate-500 mt-2">Enter credentials to access your dashboard</p>
//         </div>
//         <form onSubmit={handleLogin} className="space-y-4">
//           <div>
//              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
//              <input type="email" required placeholder="admin@agra.com" className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500" value={email} onChange={e => setEmail(e.target.value)} />
//           </div>
//           <div>
//              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
//              <input type="password" placeholder="••••••••" className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
//           </div>
//           <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition">Login</button>
//         </form>
//         <p className="text-center text-xs text-slate-400 mt-6">Use 'admin@agra.com' for Owner view</p>
//       </div>
//     </div>
//   );
// };

// // --- MAIN CONTROLLER ---

// const App = () => {
//   const [view, setView] = useState('home');
//   const [mode, setMode] = useState('retail');
//   const [cart, setCart] = useState([]);
//   const [user, setUser] = useState(null);
//   const [products, setProducts] = useState(INITIAL_PRODUCTS); // LIFTED STATE FOR PRODUCTS
//   const [orders, setOrders] = useState([]);
//   const [showToast, setShowToast] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   // --- LOGOUT LOGIC ---
//   const handleLogout = () => {
//     if (window.confirm("Are you sure you want to logout?")) {
//       setUser(null);
//       setMode('retail'); // Reset to default retail mode
//       setView('home');   // Go to home
//     }
//   };
//   // --------------------

//   const addToCart = (item) => {
//     // --- AUTH GUARD ---
//     if (!user) {
//       alert("Please login to add items to your cart.");
//       setView('login');
//       return;
//     }
//     // ------------------

//     setCart([...cart, item]);
//     setShowToast(true);
//     setTimeout(() => setShowToast(false), 3000);
//   };

//   const removeFromCart = (index) => {
//     const newCart = [...cart];
//     newCart.splice(index, 1);
//     setCart(newCart);
//   };

//   const placeOrder = (customerDetails) => {
//     const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
//     const gst = mode === 'wholesale' ? total * 0.12 : 0;
    
//     const newOrder = {
//       id: 'ORD-' + Math.floor(Math.random() * 10000),
//       customer: customerDetails,
//       items: cart,
//       total: total + gst,
//       type: mode,
//       status: 'Pending',
//       date: new Date().toISOString()
//     };

//     setOrders([newOrder, ...orders]); // Save to "Database"
//     setCart([]);
//     setView('success');
//   };

//   const renderView = () => {
//     switch(view) {
//       case 'home': return <HomeView setView={setView} mode={mode} />;
//       case 'shop': return <ShopView products={products} mode={mode} onAddToCart={addToCart} />;
//       case 'cart': return <CartView cart={cart} mode={mode} removeFromCart={removeFromCart} setView={setView} />;
//       case 'checkout': return <CheckoutView cart={cart} mode={mode} placeOrder={placeOrder} setView={setView} />;
//       case 'login': return <LoginView setMode={setMode} setView={setView} setUser={setUser} />;
//       case 'admin': return <AdminDashboard orders={orders} products={products} setProducts={setProducts} setView={setView} onLogout={handleLogout} />;
//       case 'success': return (
//         <div className="container mx-auto px-4 py-20 text-center">
//           <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} /></div>
//           <h2 className="text-3xl font-bold text-slate-900 mb-4">{mode === 'wholesale' ? 'Quote Request Sent!' : 'Order Placed Successfully!'}</h2>
//           <p className="text-slate-600 max-w-md mx-auto mb-8">
//             {mode === 'wholesale' 
//               ? 'Our team will review your bulk requirement and send a proforma invoice via WhatsApp shortly.' 
//               : 'Thank you for shopping with Agra Shoe Mart. Your shoes will be dispatched within 24 hours.'}
//           </p>
//           <button onClick={() => setView('home')} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold">Return Home</button>
//         </div>
//       );
//       default: return <HomeView setView={setView} mode={mode} />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
//       {/* Navbar (Hidden in Admin Mode) */}
//       {view !== 'admin' && (
//         <nav className="bg-white shadow-md sticky top-0 z-50">
//           <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 flex justify-between items-center">
//             <span className="hidden sm:inline">Agra's Trusted Shoe Wholesaler - Since 2003</span>
//             <div className="flex items-center gap-4">
//               <span className="flex items-center gap-1 hover:text-white cursor-pointer transition">
//                 <Phone size={14} /> +91 98765-XXXXX
//               </span>
//               <span className="text-amber-500 font-bold cursor-pointer hover:underline hidden sm:block">
//                 Request Sample Kit
//               </span>
//             </div>
//           </div>

//           <div className="container mx-auto px-4 py-4">
//             <div className="flex justify-between items-center">
//               <div onClick={() => setView('home')} className="flex items-center gap-2 cursor-pointer">
//                 <div className="bg-red-600 text-white p-1 rounded font-bold text-xl">ASM</div>
//                 <div className="text-2xl font-bold tracking-tighter text-slate-800 leading-none">
//                   AGRA<span className="text-red-600">SHOES</span>
//                 </div>
//               </div>

//               <div className="hidden md:flex gap-8 font-medium text-slate-600 text-sm">
//                 <button onClick={() => setView('home')} className="hover:text-red-600 transition">Home</button>
//                 <button onClick={() => setView('shop')} className="hover:text-red-600 transition">Shop Catalog</button>
//                 <button onClick={() => setView('shop')} className="hover:text-red-600 transition">New Arrivals</button>
//               </div>

//               <div className="flex items-center gap-4">
//                 <div className="hidden md:flex bg-slate-100 rounded-full p-1 border border-slate-200 mr-2">
//                   <button onClick={() => setMode('retail')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${mode === 'retail' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Retail</button>
//                   <button onClick={() => setMode('wholesale')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${mode === 'wholesale' ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}>Wholesale</button>
//                 </div>

//                 <button onClick={() => setView('cart')} className="relative p-2 hover:bg-slate-100 rounded-full transition group">
//                   <ShoppingCart size={22} className="text-slate-700 group-hover:text-red-600" />
//                   {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">{cart.length}</span>}
//                 </button>
                
//                 {user ? (
//                   <div className="flex items-center gap-2">
//                     <button onClick={() => user.type === 'admin' ? setView('admin') : setView('home')} className="flex items-center gap-2 font-bold text-sm bg-slate-100 px-3 py-2 rounded-lg hover:bg-slate-200 transition">
//                       <User size={18}/> <span className="hidden sm:inline">{user.name}</span>
//                     </button>
//                     {/* LOGOUT BUTTON */}
//                     <button onClick={handleLogout} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition shadow-sm" title="Logout">
//                       <LogOut size={18} />
//                     </button>
//                   </div>
//                 ) : (
//                   <button onClick={() => setView('login')} className="hidden sm:flex bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm">Login</button>
//                 )}

//                 <button className="md:hidden text-slate-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
//                    {isMobileMenuOpen ? <X /> : <Menu />}
//                 </button>
//               </div>
//             </div>

//             {isMobileMenuOpen && (
//               <div className="md:hidden mt-4 pb-4 border-t pt-4">
//                  <div className="flex bg-slate-100 rounded-lg p-1 mb-4">
//                   <button onClick={() => { setMode('retail'); setIsMobileMenuOpen(false); }} className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === 'retail' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Retail</button>
//                   <button onClick={() => { setMode('wholesale'); setIsMobileMenuOpen(false); }} className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === 'wholesale' ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}>Wholesale</button>
//                 </div>
//                 <div className="space-y-3 text-slate-700 font-medium">
//                   <button onClick={() => { setView('home'); setIsMobileMenuOpen(false); }} className="block w-full text-left hover:text-red-600">Home</button>
//                   <button onClick={() => { setView('shop'); setIsMobileMenuOpen(false); }} className="block w-full text-left hover:text-red-600">Shop Catalog</button>
//                   <button onClick={() => { setView('login'); setIsMobileMenuOpen(false); }} className="block w-full text-left text-blue-600">Login / Register</button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </nav>
//       )}

//       <main className="flex-1">{renderView()}</main>

//       {view !== 'admin' && (
//         <footer className="bg-slate-900 text-slate-400 py-12">
//           <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
//             <div>
//               <h4 className="text-white font-bold text-lg mb-4">AGRA SHOES</h4>
//               <p className="mb-4">Digitizing the legacy of Agra's shoemaking. We connect manufacturers directly to retailers across India.</p>
//               <p>Agra, Uttar Pradesh, India - 282002</p>
//             </div>
//             <div>
//               <h4 className="text-white font-bold mb-4">Shop</h4>
//               <ul className="space-y-2">
//                 <li className="hover:text-white cursor-pointer">Men's Formal</li>
//                 <li className="hover:text-white cursor-pointer">Casual Loafers</li>
//                 <li className="hover:text-white cursor-pointer">Safety Shoes</li>
//                 <li className="hover:text-white cursor-pointer">School Shoes</li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="text-white font-bold mb-4">Wholesale</h4>
//               <ul className="space-y-2">
//                 <li className="hover:text-white cursor-pointer">Register as Distributor</li>
//                 <li className="hover:text-white cursor-pointer">Bulk Pricing Policy</li>
//                 <li className="hover:text-white cursor-pointer">Shipping & Logistics</li>
//                 <li className="hover:text-white cursor-pointer">Return Policy</li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="text-white font-bold mb-4">Stay Connected</h4>
//               <p className="mb-4">Get latest design updates on WhatsApp.</p>
//               <div className="flex gap-2">
//                 <input type="text" placeholder="+91 Mobile Number" className="bg-slate-800 border-none rounded px-3 py-2 w-full text-white outline-none focus:ring-1 focus:ring-slate-600" />
//                 <button className="bg-green-600 text-white px-3 py-2 rounded font-bold hover:bg-green-700">Join</button>
//               </div>
//             </div>
//           </div>
//           <div className="text-center mt-12 pt-8 border-t border-slate-800">
//             &copy; 2025 Agra Wholesale Shoe Mart. All rights reserved.
//           </div>
//         </footer>
//       )}

//       {showToast && (
//         <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-bounce z-50">
//           <CheckCircle size={20} className="text-green-400" />
//           <p className="font-bold text-sm">Added to Cart</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;
// import React, { useState } from 'react';
// import { 
//   ShoppingCart, User, Phone, Menu, X, CheckCircle, Truck, 
//   ShieldCheck, Info, Package, ArrowRight, Trash2, Filter, 
//   Search, ClipboardList, Users, LogOut, Plus, Save,
//   Tag, Layers, DollarSign, ChevronLeft, ChevronRight, Upload, 
//   XCircle, FileText, MapPin, Smartphone, Calendar
// } from 'lucide-react';

// // --- MOCK DATABASE ---
// const INITIAL_PRODUCTS = [
//   { 
//     id: 1, 
//     name: 'Agra Classic Loafer', 
//     category: 'Men\'s Formal', 
//     retailPrice: 1499, 
//     wholesalePrice: 450, 
//     moq: 24, 
//     stock: 1000, 
//     sizes: [6,7,8,9,10], 
//     images: [
//       'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800&auto=format&fit=crop',
//       'https://images.unsplash.com/photo-1533867617858-e7b97e0605df?q=80&w=800&auto=format&fit=crop', 
//       'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop'
//     ], 
//     tag: 'Best Seller' 
//   },
//   { 
//     id: 2, 
//     name: 'Genuine Leather Oxford', 
//     category: 'Office Wear', 
//     retailPrice: 2199, 
//     wholesalePrice: 750, 
//     moq: 12, 
//     stock: 500, 
//     sizes: [6,7,8,9,10], 
//     images: ['https://images.unsplash.com/photo-1478186172493-493ca852a743?q=80&w=800&auto=format&fit=crop'], 
//     tag: 'Premium' 
//   },
//   { 
//     id: 3, 
//     name: 'Daily Soft Sandal', 
//     category: 'Women\'s Comfort', 
//     retailPrice: 899, 
//     wholesalePrice: 220, 
//     moq: 48, 
//     stock: 2000, 
//     sizes: [4,5,6,7,8], 
//     images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop'], 
//     tag: 'High Demand' 
//   },
//   { 
//     id: 4, 
//     name: 'Rugged Chelsea Boot', 
//     category: 'Men\'s Boots', 
//     retailPrice: 2899, 
//     wholesalePrice: 950, 
//     moq: 12, 
//     stock: 300, 
//     sizes: [7,8,9,10,11], 
//     images: ['https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800&auto=format&fit=crop'], 
//     tag: 'New Arrival' 
//   },
//   { 
//     id: 5, 
//     name: 'Canvas Sneaker', 
//     category: 'Casual', 
//     retailPrice: 999, 
//     wholesalePrice: 310, 
//     moq: 36, 
//     stock: 800, 
//     sizes: [6,7,8,9,10], 
//     images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop'], 
//     tag: null 
//   },
//   { 
//     id: 6, 
//     name: 'Kids School Shoe', 
//     category: 'School', 
//     retailPrice: 699, 
//     wholesalePrice: 180, 
//     moq: 60, 
//     stock: 5000, 
//     sizes: [1,2,3,4,5], 
//     images: ['https://images.unsplash.com/photo-1515347619252-60a6bf4fffce?q=80&w=800&auto=format&fit=crop'], 
//     tag: 'Back to School' 
//   },
// ];

// const CATEGORIES = ['All', 'Men\'s Formal', 'Office Wear', 'Women\'s Comfort', 'Men\'s Boots', 'Casual', 'School'];

// const generateId = () => Math.floor(Math.random() * 100000);

// // --- COMPONENTS ---

// const ProductCard = ({ product, mode, onAddToCart }) => {
//   const [showMatrix, setShowMatrix] = useState(false);
//   const [currentImgIndex, setCurrentImgIndex] = useState(0);
//   const [quantities, setQuantities] = useState(
//     product.sizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {})
//   );
  
//   const totalPairs = Object.values(quantities).reduce((a, b) => a + Number(b), 0);
//   const matrixTotalCost = totalPairs * product.wholesalePrice;

//   const nextImage = (e) => {
//     e.stopPropagation();
//     setCurrentImgIndex((prev) => (prev + 1) % product.images.length);
//   };

//   const prevImage = (e) => {
//     e.stopPropagation();
//     setCurrentImgIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
//   };

//   const handleWholesaleAdd = () => {
//     if (totalPairs < product.moq) {
//       alert(`Minimum Order Quantity is ${product.moq} pairs.`);
//       return;
//     }
//     onAddToCart({
//       ...product,
//       type: 'wholesale',
//       breakdown: quantities,
//       quantity: totalPairs,
//       price: product.wholesalePrice,
//       image: product.images[0]
//     });
//     setQuantities(product.sizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {}));
//     setShowMatrix(false);
//   };

//   const handleRetailAdd = () => {
//     onAddToCart({
//       ...product,
//       type: 'retail',
//       quantity: 1,
//       price: product.retailPrice,
//       image: product.images[0]
//     });
//   };

//   return (
//     <div className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
//       <div className="relative h-64 bg-slate-100 group">
//         <img 
//           src={product.images[currentImgIndex]} 
//           alt={product.name} 
//           className="w-full h-full object-cover transition-transform duration-500" 
//         />
//         {product.tag && <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] uppercase font-bold px-2 py-1 rounded backdrop-blur-sm z-10">{product.tag}</span>}
//         {mode === 'wholesale' && <span className="absolute top-2 left-2 bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">MOQ: {product.moq}</span>}

//         {product.images.length > 1 && (
//           <>
//             <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full text-slate-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft size={20} /></button>
//             <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full text-slate-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={20} /></button>
//             <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
//               {product.images.map((_, idx) => (
//                 <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImgIndex ? 'bg-white scale-125' : 'bg-white/50'}`} />
//               ))}
//             </div>
//           </>
//         )}
//       </div>

//       <div className="p-4 flex-1 flex flex-col">
//         <div className="mb-2">
//           <span className="text-xs text-slate-500 uppercase tracking-wide">{product.category}</span>
//           <h3 className="text-lg font-bold text-slate-800 leading-tight">{product.name}</h3>
//         </div>
        
//         <div className="mt-auto pt-4 border-t border-slate-100">
//           <div className="flex justify-between items-end mb-4">
//             <div>
//               <p className="text-xs text-slate-500 mb-0.5">Price per pair</p>
//               <div className="flex items-baseline gap-2">
//                 <span className="text-xl font-bold text-slate-900">₹{mode === 'retail' ? product.retailPrice : product.wholesalePrice}</span>
//                 {mode === 'retail' && <span className="text-xs text-red-500 line-through">₹{Math.floor(product.retailPrice * 1.2)}</span>}
//               </div>
//               {mode === 'wholesale' && <p className="text-[10px] text-red-600 font-medium">*Excl. GST</p>}
//             </div>
//             {mode === 'retail' ? (
//               <button onClick={handleRetailAdd} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-200">Add</button>
//             ) : (
//               <button onClick={() => setShowMatrix(!showMatrix)} className={`px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg ${showMatrix ? 'bg-slate-200 text-slate-800' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}>{showMatrix ? 'Close' : 'Bulk'}</button>
//             )}
//           </div>

//           {mode === 'wholesale' && showMatrix && (
//             <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2">
//               <div className="flex justify-between items-center mb-2">
//                  <span className="text-[10px] font-bold text-slate-500">SELECT SIZES</span>
//               </div>
//               <div className="grid grid-cols-5 gap-1 mb-3">
//                 {product.sizes.map((size) => (
//                   <div key={size} className="text-center">
//                     <label className="block text-[10px] text-slate-500">UK {size}</label>
//                     <input type="number" min="0" value={quantities[size] || ''} onChange={(e) => setQuantities(prev => ({...prev, [size]: e.target.value}))} className="w-full border border-slate-300 rounded p-1 text-center text-xs" placeholder="0" />
//                   </div>
//                 ))}
//               </div>
//               <div className="flex justify-between text-xs mb-2">
//                 <span>Pairs: <strong>{totalPairs}</strong></span>
//                 <span>Total: <strong className="text-blue-600">₹{matrixTotalCost}</strong></span>
//               </div>
//               <button onClick={handleWholesaleAdd} disabled={totalPairs === 0} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white py-1.5 rounded text-xs font-bold uppercase">Add Batch</button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// const Features = () => (
//   <div className="bg-slate-50 py-12 border-y border-slate-200">
//     <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-blue-600"><Truck /></div>
//         <h3 className="font-bold text-slate-800 mb-2">Nationwide Delivery</h3>
//         <p className="text-sm text-slate-500 px-4">From Agra to anywhere in India. We use trusted B2B logistics partners.</p>
//       </div>
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-amber-500"><ShieldCheck /></div>
//         <h3 className="font-bold text-slate-800 mb-2">Quality Guarantee</h3>
//         <p className="text-sm text-slate-500 px-4">Every pair is inspected before packing. 20 years of reputation at stake.</p>
//       </div>
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-red-600"><Info /></div>
//         <h3 className="font-bold text-slate-800 mb-2">Direct Support</h3>
//         <p className="text-sm text-slate-500 px-4">Call us anytime. We believe in building relationships, not just sales.</p>
//       </div>
//     </div>
//   </div>
// );

// // --- ADMIN COMPONENTS ---

// const ProductForm = ({ onSave, onCancel }) => {
//   const [formData, setFormData] = useState({
//     name: '', category: 'Men\'s Formal', retailPrice: '', wholesalePrice: '', 
//     moq: 24, sizes: '6,7,8,9,10', tag: '', 
//     images: [] 
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (formData.images.length === 0) {
//       alert("Please upload at least one image.");
//       return;
//     }
//     const newProduct = {
//       ...formData,
//       id: generateId(),
//       retailPrice: Number(formData.retailPrice),
//       wholesalePrice: Number(formData.wholesalePrice),
//       moq: Number(formData.moq),
//       sizes: formData.sizes.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n))
//     };
//     onSave(newProduct);
//   };

//   const handleImageUpload = (e) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const newImageUrls = Array.from(e.target.files).map(file => URL.createObjectURL(file));
//       setFormData(prev => ({ ...prev, images: [...prev.images, ...newImageUrls] }));
//     }
//   };

//   const removeImage = (indexToRemove) => {
//     setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== indexToRemove) }));
//   };

//   return (
//     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg animate-in fade-in slide-in-from-bottom-4">
//       <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
//         <Plus className="text-green-600" /> Add New Product
//       </h3>
//       <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div className="md:col-span-2">
//           <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Product Name</label>
//           <input required type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-slate-900 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Leather Oxford Pro" />
//         </div>
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Category</label>
//            <select className="w-full border p-2 rounded outline-none bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
//              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
//            </select>
//         </div>
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Available Sizes (Comma Sep)</label>
//            <input required type="text" className="w-full border p-2 rounded outline-none" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} placeholder="6,7,8,9,10" />
//         </div>
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Retail Price (₹)</label>
//            <input required type="number" className="w-full border p-2 rounded outline-none" value={formData.retailPrice} onChange={e => setFormData({...formData, retailPrice: e.target.value})} />
//         </div>
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Wholesale Price (₹)</label>
//            <input required type="number" className="w-full border p-2 rounded outline-none" value={formData.wholesalePrice} onChange={e => setFormData({...formData, wholesalePrice: e.target.value})} />
//         </div>
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Min Order Qty</label>
//            <input required type="number" className="w-full border p-2 rounded outline-none" value={formData.moq} onChange={e => setFormData({...formData, moq: e.target.value})} />
//         </div>
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Marketing Tag (Optional)</label>
//            <input type="text" className="w-full border p-2 rounded outline-none" value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})} placeholder="e.g. New Arrival" />
//         </div>
//         <div className="md:col-span-2">
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Product Images</label>
//            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition cursor-pointer relative">
//              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
//              <Upload className="mx-auto text-slate-400 mb-2" />
//              <p className="text-sm text-slate-500 font-medium">Click to select images from device</p>
//              <p className="text-xs text-slate-400">JPG, PNG supported</p>
//            </div>
//            {formData.images.length > 0 && (
//              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
//                {formData.images.map((img, idx) => (
//                  <div key={idx} className="relative shrink-0 w-20 h-20 group">
//                    <img src={img} alt="Preview" className="w-full h-full object-cover rounded-lg border border-slate-200" />
//                    <button type="button" onClick={() => removeImage(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600"><X size={12} /></button>
//                  </div>
//                ))}
//              </div>
//            )}
//         </div>
//         <div className="md:col-span-2 flex gap-3 mt-2">
//           <button type="button" onClick={onCancel} className="flex-1 py-2 border border-slate-300 rounded text-slate-600 font-bold hover:bg-slate-50">Cancel</button>
//           <button type="submit" className="flex-1 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 flex justify-center items-center gap-2"><Save size={18}/> Save Product</button>
//         </div>
//       </form>
//     </div>
//   );
// };

// // Order Details Modal Component
// const OrderDetailModal = ({ order, onClose }) => {
//   if (!order) return null;

//   return (
//     <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//       <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
//         {/* Header */}
//         <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
//           <div>
//             <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
//               <FileText className="text-blue-600" size={20} /> Order #{order.id}
//             </h3>
//             <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
//               <Calendar size={14} /> {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}
//             </p>
//           </div>
//           <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition">
//             <XCircle size={28} />
//           </button>
//         </div>

//         {/* Scrollable Content */}
//         <div className="overflow-y-auto p-6 flex-1">
//           {/* Customer Details Section */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//             <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
//               <h4 className="text-xs font-bold text-blue-800 uppercase mb-3 flex items-center gap-2"><User size={14}/> Customer Information</h4>
//               <div className="space-y-2 text-sm text-slate-700">
//                 <p><span className="font-semibold text-slate-900">Name:</span> {order.customer.name}</p>
//                 <p className="flex items-start gap-2"><span className="font-semibold text-slate-900 whitespace-nowrap">Phone:</span> {order.customer.phone}</p>
//                 <p><span className="font-semibold text-slate-900">Type:</span> <span className={`px-2 py-0.5 rounded text-xs font-bold ${order.type === 'wholesale' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{order.type.toUpperCase()}</span></p>
//               </div>
//             </div>
//             <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
//               <h4 className="text-xs font-bold text-slate-600 uppercase mb-3 flex items-center gap-2"><MapPin size={14}/> Delivery Address</h4>
//               <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{order.customer.address}</p>
//             </div>
//           </div>

//           {/* Items Table */}
//           <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Package size={16}/> Order Items</h4>
//           <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
//             <table className="w-full text-left text-sm">
//               <thead className="bg-slate-50 text-slate-500 font-medium">
//                 <tr>
//                   <th className="p-3">Product</th>
//                   <th className="p-3 text-center">Type</th>
//                   <th className="p-3">Breakdown</th>
//                   <th className="p-3 text-right">Price</th>
//                   <th className="p-3 text-right">Total</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {order.items.map((item, idx) => (
//                   <tr key={idx} className="hover:bg-slate-50/50">
//                     <td className="p-3">
//                       <div className="flex items-center gap-3">
//                         <img src={item.image} alt="" className="w-10 h-10 rounded object-cover bg-slate-100 border" />
//                         <span className="font-medium text-slate-900">{item.name}</span>
//                       </div>
//                     </td>
//                     <td className="p-3 text-center">
//                        {item.type === 'wholesale' 
//                          ? <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">BULK</span> 
//                          : <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">RETAIL</span>
//                        }
//                     </td>
//                     <td className="p-3">
//                       {item.type === 'wholesale' ? (
//                         <div className="grid grid-cols-4 gap-1 w-max">
//                           {Object.entries(item.breakdown).map(([size, qty]) => Number(qty) > 0 && (
//                             <div key={size} className="text-[10px] bg-white border rounded px-1 text-slate-500 whitespace-nowrap">
//                               UK{size}: <span className="font-bold text-slate-900">{qty}</span>
//                             </div>
//                           ))}
//                         </div>
//                       ) : (
//                         <span className="text-slate-500 text-xs">1 Pair (Standard)</span>
//                       )}
//                     </td>
//                     <td className="p-3 text-right text-slate-600">₹{item.price}</td>
//                     <td className="p-3 text-right font-bold text-slate-900">₹{item.price * item.quantity}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Financials */}
//           <div className="flex justify-end">
//             <div className="w-full md:w-64 bg-slate-50 p-4 rounded-lg border border-slate-200">
//               <div className="flex justify-between text-sm text-slate-600 mb-2">
//                 <span>Subtotal</span>
//                 <span>₹{order.total / (order.type === 'wholesale' ? 1.12 : 1) }</span>
//               </div>
//               {order.type === 'wholesale' && (
//                 <div className="flex justify-between text-sm text-slate-600 mb-2">
//                   <span>GST (12%)</span>
//                   <span>₹{(order.total - (order.total / 1.12)).toFixed(2)}</span>
//                 </div>
//               )}
//               <div className="flex justify-between font-bold text-lg text-slate-900 pt-3 border-t border-slate-200">
//                 <span>Total</span>
//                 <span>₹{Math.round(order.total)}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer Actions */}
//         <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
//           <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-bold hover:bg-white transition">Close</button>
//           <button onClick={() => alert("Printing Feature would go here.")} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 flex items-center gap-2 transition"><ClipboardList size={18}/> Process Order</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const AdminDashboard = ({ orders, products, setProducts, setView, onLogout }) => {
//   const [activeTab, setActiveTab] = useState('orders');
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null); // STATE FOR MODAL

//   const pendingOrders = orders.filter(o => o.status === 'Pending').length;
//   const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);

//   const handleAddProduct = (newProduct) => {
//     setProducts([newProduct, ...products]);
//     setShowAddForm(false);
//     alert("Product Added Successfully!");
//   };

//   const handleDeleteProduct = (id) => {
//     if (window.confirm("Are you sure you want to delete this product?")) {
//       setProducts(products.filter(p => p.id !== id));
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8 bg-slate-50 min-h-screen">
//       {/* ORDER DETAILS MODAL */}
//       {selectedOrder && (
//         <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
//       )}

//       {/* Header */}
//       <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
//         <div>
//            <h2 className="text-2xl font-bold text-slate-900">Owner Dashboard</h2>
//            <p className="text-sm text-slate-500">Manage Orders & Inventory</p>
//         </div>
//         <div className="flex gap-3">
//           <button onClick={onLogout} className="bg-white border border-slate-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center gap-2 font-bold transition">
//             <LogOut size={16}/> Logout
//           </button>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="flex gap-4 mb-6 border-b border-slate-200">
//         <button onClick={() => setActiveTab('orders')} className={`pb-3 px-2 font-bold text-sm ${activeTab === 'orders' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500'}`}>Incoming Orders</button>
//         <button onClick={() => setActiveTab('products')} className={`pb-3 px-2 font-bold text-sm ${activeTab === 'products' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500'}`}>Manage Products ({products.length})</button>
//       </div>

//       {/* ORDERS TAB */}
//       {activeTab === 'orders' && (
//         <div className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4"><div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><ClipboardList /></div><div><p className="text-slate-500 text-sm">Total Orders</p><h3 className="text-2xl font-bold text-slate-900">{orders.length}</h3></div></div>
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4"><div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><Package /></div><div><p className="text-slate-500 text-sm">Pending</p><h3 className="text-2xl font-bold text-slate-900">{pendingOrders}</h3></div></div>
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4"><div className="p-3 bg-green-100 text-green-600 rounded-lg"><Users /></div><div><p className="text-slate-500 text-sm">Revenue (Est)</p><h3 className="text-2xl font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</h3></div></div>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//             <div className="p-6 border-b border-slate-100"><h3 className="font-bold text-lg text-slate-800">Recent Orders</h3></div>
//             <div className="overflow-x-auto">
//               <table className="w-full text-left text-sm">
//                 <thead className="bg-slate-50 text-slate-500 font-medium">
//                   <tr><th className="p-4">ID</th><th className="p-4">Customer</th><th className="p-4">Type</th><th className="p-4">Total</th><th className="p-4">Status</th><th className="p-4">Action</th></tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100">
//                   {orders.length === 0 ? (<tr><td colSpan="6" className="p-8 text-center text-slate-400">No orders yet.</td></tr>) : orders.map((order) => (
//                     <tr key={order.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => setSelectedOrder(order)}>
//                       <td className="p-4 font-mono text-xs text-slate-500">{order.id}</td>
//                       <td className="p-4 font-bold text-slate-900">{order.customer.name}</td>
//                       <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${order.type === 'wholesale' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{order.type}</span></td>
//                       <td className="p-4 font-bold text-slate-900">₹{Math.round(order.total)}</td>
//                       <td className="p-4"><span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold">{order.status}</span></td>
//                       <td className="p-4">
//                         <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }} className="text-blue-600 hover:text-blue-800 font-bold text-xs border border-blue-200 px-3 py-1 rounded hover:bg-blue-50 transition">View Details</button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* PRODUCTS TAB */}
//       {activeTab === 'products' && (
//         <div>
//           <div className="flex justify-between items-center mb-6">
//             <h3 className="text-xl font-bold text-slate-900">Product Inventory</h3>
//             {!showAddForm && (
//               <button onClick={() => setShowAddForm(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 flex items-center gap-2 shadow-lg">
//                 <Plus size={18} /> Add New Product
//               </button>
//             )}
//           </div>
//           {showAddForm && <div className="mb-8"><ProductForm onSave={handleAddProduct} onCancel={() => setShowAddForm(false)} /></div>}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {products.map(product => (
//               <div key={product.id} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 items-start shadow-sm hover:shadow-md transition">
//                 <img src={product.images[0]} className="w-20 h-20 rounded-lg object-cover bg-slate-100" alt={product.name} />
//                 <div className="flex-1">
//                    <div className="flex justify-between items-start">
//                       <h4 className="font-bold text-slate-900 leading-tight">{product.name}</h4>
//                       <button onClick={() => handleDeleteProduct(product.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
//                    </div>
//                    <p className="text-xs text-slate-500 mb-2">{product.category}</p>
//                    <div className="flex gap-4 text-sm">
//                       <div><span className="text-[10px] text-slate-400 uppercase block">Retail</span><span className="font-bold">₹{product.retailPrice}</span></div>
//                       <div><span className="text-[10px] text-slate-400 uppercase block">Wholesale</span><span className="font-bold text-blue-600">₹{product.wholesalePrice}</span></div>
//                    </div>
//                    <div className="mt-2 text-[10px] text-slate-500 bg-slate-50 inline-block px-2 py-1 rounded">Sizes: {product.sizes.join(', ')}</div>
//                    <div className="mt-1 text-[10px] text-slate-400">{product.images.length} images</div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // --- VIEWS ---

// const ShopView = ({ products, mode, onAddToCart }) => {
//   const [filter, setFilter] = useState('All');
//   const [searchTerm, setSearchTerm] = useState('');
  
//   const filteredProducts = products.filter(p => {
//     const matchesCategory = filter === 'All' || p.category === filter;
//     const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
//         <div>
//           <h2 className="text-3xl font-bold text-slate-900">{mode === 'wholesale' ? 'Wholesale Catalog' : 'Shop Collection'}</h2>
//           <p className="text-slate-500 text-sm mt-1">{mode === 'wholesale' ? 'Bulk pricing applied. MOQ rules active.' : 'Latest trends from Agra.'}</p>
//         </div>
        
//         {/* Search Bar */}
//         <div className="relative w-full md:w-64">
//           <input 
//             type="text" 
//             placeholder="Search shoes..." 
//             className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
//         </div>
//       </div>

//       {/* Category Pills */}
//       <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4">
//         <Filter size={18} className="text-slate-400 shrink-0" />
//         {CATEGORIES.map(cat => (
//           <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${filter === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
//             {cat}
//           </button>
//         ))}
//       </div>

//       {filteredProducts.length === 0 ? (
//         <div className="text-center py-20 text-slate-400">No products found matching your search.</div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {filteredProducts.map(product => (
//             <ProductCard key={product.id} product={product} mode={mode} onAddToCart={onAddToCart} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// const HomeView = ({ setView, mode }) => (
//   <>
//     <div className="bg-white border-b border-slate-200">
//       <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row items-center gap-10">
//         <div className="flex-1 text-center md:text-left">
//           <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold mb-6">
//             <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
//             {mode === 'wholesale' ? 'ACCEPTING NEW DISTRIBUTORS' : 'SEASONAL SALE IS LIVE'}
//           </div>
//           <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
//             {mode === 'wholesale' ? <>Factory Direct.<br /><span className="text-blue-600">Maximize Margins.</span></> : <>Handcrafted in Agra.<br /><span className="text-red-600">Worn Everywhere.</span></>}
//           </h1>
//           <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
//             {mode === 'wholesale' ? 'Connect directly with our 20-year-old manufacturing unit. Get transparent pricing, bulk shipping support, and custom branding options.' : 'Discover the finest leather shoes directly from the shoe capital of India. Premium quality, honest prices, delivered to your doorstep.'}
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
//             <button onClick={() => setView('shop')} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2">
//               {mode === 'wholesale' ? 'View Catalog' : 'Shop Collection'} <ArrowRight size={18} />
//             </button>
//           </div>
//         </div>
        
//         <div className="flex-1 w-full max-w-md md:max-w-full">
//            <div className="relative">
//              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-amber-50 rounded-2xl transform rotate-3"></div>
//              <img 
//                src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop" 
//                alt="Shoe Craftsmanship" 
//                className="relative rounded-2xl shadow-2xl w-full h-auto object-cover transform -rotate-2 hover:rotate-0 transition duration-700"
//              />
//              {mode === 'wholesale' && (
//                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3">
//                  <div className="bg-green-100 p-2 rounded-full text-green-600"><CheckCircle size={24} /></div>
//                  <div>
//                    <p className="text-sm font-bold text-slate-800">Verified Manufacturer</p>
//                    <p className="text-xs text-slate-500">GST Registered • IEC License</p>
//                  </div>
//                </div>
//              )}
//            </div>
//         </div>
//       </div>
//     </div>
//     <Features />
//   </>
// );

// const CartView = ({ cart, mode, removeFromCart, setView }) => {
//   const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
//   const totalGST = mode === 'wholesale' ? totalAmount * 0.12 : 0; // 12% GST for wholesale
//   const finalTotal = totalAmount + totalGST;

//   if (cart.length === 0) return (
//     <div className="container mx-auto px-4 py-20 text-center">
//       <ShoppingCart size={64} className="mx-auto text-slate-200 mb-4" />
//       <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
//       <button onClick={() => setView('shop')} className="text-blue-600 font-medium hover:underline">Start Shopping</button>
//     </div>
//   );

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h2 className="text-2xl font-bold text-slate-900 mb-8">Shopping Cart ({cart.length} items)</h2>
//       <div className="flex flex-col lg:flex-row gap-8">
//         <div className="flex-1 space-y-4">
//           {cart.map((item, idx) => (
//             <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl flex gap-4">
//               <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg bg-slate-100" />
//               <div className="flex-1">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h3 className="font-bold text-slate-900">{item.name}</h3>
//                     <p className="text-sm text-slate-500">{item.category}</p>
//                   </div>
//                   <button onClick={() => removeFromCart(idx)} className="text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
//                 </div>
                
//                 {item.type === 'wholesale' ? (
//                    <div className="mt-2 bg-slate-50 p-2 rounded text-xs text-slate-600 grid grid-cols-5 gap-2">
//                      {Object.entries(item.breakdown).map(([size, qty]) => Number(qty) > 0 && (
//                        <div key={size} className="text-center bg-white border border-slate-200 rounded px-1">
//                          <span className="block text-[10px] text-slate-400">UK {size}</span>
//                          <span className="font-bold">{qty}</span>
//                        </div>
//                      ))}
//                    </div>
//                 ) : (
//                   <div className="mt-2 text-sm text-slate-600">Qty: {item.quantity} Pair</div>
//                 )}
                
//                 <div className="mt-3 flex justify-between items-center">
//                    <div className="text-xs text-slate-500">{item.quantity} pairs x ₹{item.price}</div>
//                    <div className="font-bold text-slate-900">₹{item.quantity * item.price}</div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="w-full lg:w-96">
//           <div className="bg-white border border-slate-200 p-6 rounded-xl sticky top-24 shadow-sm">
//             <h3 className="font-bold text-lg mb-4">Order Summary</h3>
//             <div className="space-y-3 mb-6">
//               <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹{totalAmount}</span></div>
//               {mode === 'wholesale' && (
//                 <div className="flex justify-between text-slate-600"><span>GST (12%)</span><span>₹{totalGST.toFixed(0)}</span></div>
//               )}
//               <div className="flex justify-between text-slate-600"><span>Shipping</span><span>{mode === 'wholesale' ? 'To be calculated' : 'Free'}</span></div>
//               <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-lg text-slate-900">
//                 <span>Total</span><span>₹{finalTotal.toFixed(0)}</span>
//               </div>
//             </div>
//             <button onClick={() => setView('checkout')} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg">
//               Proceed to Checkout
//             </button>
//             <p className="text-xs text-slate-400 text-center mt-3">Secure Checkout via Agra Shoe Mart</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const CheckoutView = ({ cart, mode, placeOrder, setView }) => {
//   const [form, setForm] = useState({ name: '', phone: '', address: '' });
  
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     placeOrder(form);
//   };

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-2xl">
//       <button onClick={() => setView('cart')} className="text-sm text-slate-500 hover:text-slate-900 mb-6">← Back to Cart</button>
//       <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
//         <h2 className="text-2xl font-bold text-slate-900 mb-6">{mode === 'wholesale' ? 'Request Bulk Quote' : 'Checkout'}</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Full Name / Shop Name</label>
//             <input required type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number (WhatsApp)</label>
//             <input required type="tel" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Address</label>
//             <textarea required rows="3" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.address} onChange={e => setForm({...form, address: e.target.value})}></textarea>
//           </div>
          
//           <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
//             {mode === 'wholesale' 
//               ? "Note: This is a quote request. Our sales team will contact you on WhatsApp to confirm availability and shipping costs before payment."
//               : "Note: Cash on Delivery is available for Agra. Online payment link will be sent for other cities."
//             }
//           </div>

//           <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-md">
//             {mode === 'wholesale' ? 'Submit Quote Request' : 'Place Order'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// const LoginView = ({ setMode, setView, setUser }) => {
//   const [email, setEmail] = useState('');
  
//   const handleLogin = (e) => {
//     e.preventDefault();
//     if (email.includes('admin')) {
//       setUser({ name: 'Owner', type: 'admin', email });
//       setView('admin');
//     } else {
//       setUser({ name: 'Verified Buyer', type: 'wholesale', email });
//       setMode('wholesale');
//       setView('shop');
//     }
//   };

//   return (
//     <div className="min-h-[60vh] flex items-center justify-center px-4">
//       <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-xl shadow-lg">
//         <div className="text-center mb-8">
//           <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white mx-auto mb-4"><Package size={32} /></div>
//           <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
//           <p className="text-slate-500 mt-2">Enter credentials to access your dashboard</p>
//         </div>
//         <form onSubmit={handleLogin} className="space-y-4">
//           <div>
//              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
//              <input type="email" required placeholder="admin@agra.com" className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500" value={email} onChange={e => setEmail(e.target.value)} />
//           </div>
//           <div>
//              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
//              <input type="password" placeholder="••••••••" className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
//           </div>
//           <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition">Login</button>
//         </form>
//         <p className="text-center text-xs text-slate-400 mt-6">Use 'admin@agra.com' for Owner view</p>
//       </div>
//     </div>
//   );
// };

// // --- MAIN CONTROLLER ---

// const App = () => {
//   const [view, setView] = useState('home');
//   const [mode, setMode] = useState('retail');
//   const [cart, setCart] = useState([]);
//   const [user, setUser] = useState(null);
//   const [products, setProducts] = useState(INITIAL_PRODUCTS); // LIFTED STATE FOR PRODUCTS
//   const [orders, setOrders] = useState([]);
//   const [showToast, setShowToast] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   // --- LOGOUT LOGIC ---
//   const handleLogout = () => {
//     if (window.confirm("Are you sure you want to logout?")) {
//       setUser(null);
//       setMode('retail'); // Reset to default retail mode
//       setView('home');   // Go to home
//     }
//   };
//   // --------------------

//   const addToCart = (item) => {
//     // --- AUTH GUARD ---
//     if (!user) {
//       alert("Please login to add items to your cart.");
//       setView('login');
//       return;
//     }
//     // ------------------

//     setCart([...cart, item]);
//     setShowToast(true);
//     setTimeout(() => setShowToast(false), 3000);
//   };

//   const removeFromCart = (index) => {
//     const newCart = [...cart];
//     newCart.splice(index, 1);
//     setCart(newCart);
//   };

//   const placeOrder = (customerDetails) => {
//     const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
//     const gst = mode === 'wholesale' ? total * 0.12 : 0;
    
//     const newOrder = {
//       id: 'ORD-' + Math.floor(Math.random() * 10000),
//       customer: customerDetails,
//       items: cart,
//       total: total + gst,
//       type: mode,
//       status: 'Pending',
//       date: new Date().toISOString()
//     };

//     setOrders([newOrder, ...orders]); // Save to "Database"
//     setCart([]);
//     setView('success');
//   };

//   const renderView = () => {
//     switch(view) {
//       case 'home': return <HomeView setView={setView} mode={mode} />;
//       case 'shop': return <ShopView products={products} mode={mode} onAddToCart={addToCart} />;
//       case 'cart': return <CartView cart={cart} mode={mode} removeFromCart={removeFromCart} setView={setView} />;
//       case 'checkout': return <CheckoutView cart={cart} mode={mode} placeOrder={placeOrder} setView={setView} />;
//       case 'login': return <LoginView setMode={setMode} setView={setView} setUser={setUser} />;
//       case 'admin': return <AdminDashboard orders={orders} products={products} setProducts={setProducts} setView={setView} onLogout={handleLogout} />;
//       case 'success': return (
//         <div className="container mx-auto px-4 py-20 text-center">
//           <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} /></div>
//           <h2 className="text-3xl font-bold text-slate-900 mb-4">{mode === 'wholesale' ? 'Quote Request Sent!' : 'Order Placed Successfully!'}</h2>
//           <p className="text-slate-600 max-w-md mx-auto mb-8">
//             {mode === 'wholesale' 
//               ? 'Our team will review your bulk requirement and send a proforma invoice via WhatsApp shortly.' 
//               : 'Thank you for shopping with Agra Shoe Mart. Your shoes will be dispatched within 24 hours.'}
//           </p>
//           <button onClick={() => setView('home')} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold">Return Home</button>
//         </div>
//       );
//       default: return <HomeView setView={setView} mode={mode} />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
//       {/* Navbar (Hidden in Admin Mode) */}
//       {view !== 'admin' && (
//         <nav className="bg-white shadow-md sticky top-0 z-50">
//           <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 flex justify-between items-center">
//             <span className="hidden sm:inline">Agra's Trusted Shoe Wholesaler - Since 2003</span>
//             <div className="flex items-center gap-4">
//               <span className="flex items-center gap-1 hover:text-white cursor-pointer transition">
//                 <Phone size={14} /> +91 98765-XXXXX
//               </span>
//               <span className="text-amber-500 font-bold cursor-pointer hover:underline hidden sm:block">
//                 Request Sample Kit
//               </span>
//             </div>
//           </div>

//           <div className="container mx-auto px-4 py-4">
//             <div className="flex justify-between items-center">
//               <div onClick={() => setView('home')} className="flex items-center gap-2 cursor-pointer">
//                 <div className="bg-red-600 text-white p-1 rounded font-bold text-xl">ASM</div>
//                 <div className="text-2xl font-bold tracking-tighter text-slate-800 leading-none">
//                   AGRA<span className="text-red-600">SHOES</span>
//                 </div>
//               </div>

//               <div className="hidden md:flex gap-8 font-medium text-slate-600 text-sm">
//                 <button onClick={() => setView('home')} className="hover:text-red-600 transition">Home</button>
//                 <button onClick={() => setView('shop')} className="hover:text-red-600 transition">Shop Catalog</button>
//                 <button onClick={() => setView('shop')} className="hover:text-red-600 transition">New Arrivals</button>
//               </div>

//               <div className="flex items-center gap-4">
//                 <div className="hidden md:flex bg-slate-100 rounded-full p-1 border border-slate-200 mr-2">
//                   <button onClick={() => setMode('retail')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${mode === 'retail' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Retail</button>
//                   <button onClick={() => setMode('wholesale')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${mode === 'wholesale' ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}>Wholesale</button>
//                 </div>

//                 <button onClick={() => setView('cart')} className="relative p-2 hover:bg-slate-100 rounded-full transition group">
//                   <ShoppingCart size={22} className="text-slate-700 group-hover:text-red-600" />
//                   {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">{cart.length}</span>}
//                 </button>
                
//                 {user ? (
//                   <div className="flex items-center gap-2">
//                     <button onClick={() => user.type === 'admin' ? setView('admin') : setView('home')} className="flex items-center gap-2 font-bold text-sm bg-slate-100 px-3 py-2 rounded-lg hover:bg-slate-200 transition">
//                       <User size={18}/> <span className="hidden sm:inline">{user.name}</span>
//                     </button>
//                     {/* LOGOUT BUTTON */}
//                     <button onClick={handleLogout} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition shadow-sm" title="Logout">
//                       <LogOut size={18} />
//                     </button>
//                   </div>
//                 ) : (
//                   <button onClick={() => setView('login')} className="hidden sm:flex bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm">Login</button>
//                 )}

//                 <button className="md:hidden text-slate-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
//                    {isMobileMenuOpen ? <X /> : <Menu />}
//                 </button>
//               </div>
//             </div>

//             {isMobileMenuOpen && (
//               <div className="md:hidden mt-4 pb-4 border-t pt-4">
//                  <div className="flex bg-slate-100 rounded-lg p-1 mb-4">
//                   <button onClick={() => { setMode('retail'); setIsMobileMenuOpen(false); }} className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === 'retail' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Retail</button>
//                   <button onClick={() => { setMode('wholesale'); setIsMobileMenuOpen(false); }} className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === 'wholesale' ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}>Wholesale</button>
//                 </div>
//                 <div className="space-y-3 text-slate-700 font-medium">
//                   <button onClick={() => { setView('home'); setIsMobileMenuOpen(false); }} className="block w-full text-left hover:text-red-600">Home</button>
//                   <button onClick={() => { setView('shop'); setIsMobileMenuOpen(false); }} className="block w-full text-left hover:text-red-600">Shop Catalog</button>
//                   <button onClick={() => { setView('login'); setIsMobileMenuOpen(false); }} className="block w-full text-left text-blue-600">Login / Register</button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </nav>
//       )}

//       <main className="flex-1">{renderView()}</main>

//       {view !== 'admin' && (
//         <footer className="bg-slate-900 text-slate-400 py-12">
//           <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
//             <div>
//               <h4 className="text-white font-bold text-lg mb-4">AGRA SHOES</h4>
//               <p className="mb-4">Digitizing the legacy of Agra's shoemaking. We connect manufacturers directly to retailers across India.</p>
//               <p>Agra, Uttar Pradesh, India - 282002</p>
//             </div>
//             <div>
//               <h4 className="text-white font-bold mb-4">Shop</h4>
//               <ul className="space-y-2">
//                 <li className="hover:text-white cursor-pointer">Men's Formal</li>
//                 <li className="hover:text-white cursor-pointer">Casual Loafers</li>
//                 <li className="hover:text-white cursor-pointer">Safety Shoes</li>
//                 <li className="hover:text-white cursor-pointer">School Shoes</li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="text-white font-bold mb-4">Wholesale</h4>
//               <ul className="space-y-2">
//                 <li className="hover:text-white cursor-pointer">Register as Distributor</li>
//                 <li className="hover:text-white cursor-pointer">Bulk Pricing Policy</li>
//                 <li className="hover:text-white cursor-pointer">Shipping & Logistics</li>
//                 <li className="hover:text-white cursor-pointer">Return Policy</li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="text-white font-bold mb-4">Stay Connected</h4>
//               <p className="mb-4">Get latest design updates on WhatsApp.</p>
//               <div className="flex gap-2">
//                 <input type="text" placeholder="+91 Mobile Number" className="bg-slate-800 border-none rounded px-3 py-2 w-full text-white outline-none focus:ring-1 focus:ring-slate-600" />
//                 <button className="bg-green-600 text-white px-3 py-2 rounded font-bold hover:bg-green-700">Join</button>
//               </div>
//             </div>
//           </div>
//           <div className="text-center mt-12 pt-8 border-t border-slate-800">
//             &copy; 2025 Agra Wholesale Shoe Mart. All rights reserved.
//           </div>
//         </footer>
//       )}

//       {showToast && (
//         <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-bounce z-50">
//           <CheckCircle size={20} className="text-green-400" />
//           <p className="font-bold text-sm">Added to Cart</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;
// import React, { useState } from 'react';
// import { 
//   ShoppingCart, User, Phone, Menu, X, CheckCircle, Truck, 
//   ShieldCheck, Info, Package, ArrowRight, Trash2, Filter, 
//   Search, ClipboardList, Users, LogOut, Plus, Save,
//   Tag, Layers, DollarSign, ChevronLeft, ChevronRight, Upload, XCircle
// } from 'lucide-react';

// // --- MOCK DATABASE ---
// // Updated: 'images' is now an ARRAY of strings.
// const INITIAL_PRODUCTS = [
//   { 
//     id: 1, 
//     name: 'Agra Classic Loafer', 
//     category: 'Men\'s Formal', 
//     retailPrice: 1499, 
//     wholesalePrice: 450, 
//     moq: 24, 
//     stock: 1000, 
//     sizes: [6,7,8,9,10], 
//     images: [
//       'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800&auto=format&fit=crop',
//       'https://images.unsplash.com/photo-1533867617858-e7b97e0605df?q=80&w=800&auto=format&fit=crop', // Side view
//       'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop'  // Sole view
//     ], 
//     tag: 'Best Seller' 
//   },
//   { 
//     id: 2, 
//     name: 'Genuine Leather Oxford', 
//     category: 'Office Wear', 
//     retailPrice: 2199, 
//     wholesalePrice: 750, 
//     moq: 12, 
//     stock: 500, 
//     sizes: [6,7,8,9,10], 
//     images: ['https://images.unsplash.com/photo-1478186172493-493ca852a743?q=80&w=800&auto=format&fit=crop'], 
//     tag: 'Premium' 
//   },
//   { 
//     id: 3, 
//     name: 'Daily Soft Sandal', 
//     category: 'Women\'s Comfort', 
//     retailPrice: 899, 
//     wholesalePrice: 220, 
//     moq: 48, 
//     stock: 2000, 
//     sizes: [4,5,6,7,8], 
//     images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop'], 
//     tag: 'High Demand' 
//   },
//   { 
//     id: 4, 
//     name: 'Rugged Chelsea Boot', 
//     category: 'Men\'s Boots', 
//     retailPrice: 2899, 
//     wholesalePrice: 950, 
//     moq: 12, 
//     stock: 300, 
//     sizes: [7,8,9,10,11], 
//     images: ['https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800&auto=format&fit=crop'], 
//     tag: 'New Arrival' 
//   },
//   { 
//     id: 5, 
//     name: 'Canvas Sneaker', 
//     category: 'Casual', 
//     retailPrice: 999, 
//     wholesalePrice: 310, 
//     moq: 36, 
//     stock: 800, 
//     sizes: [6,7,8,9,10], 
//     images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop'], 
//     tag: null 
//   },
//   { 
//     id: 6, 
//     name: 'Kids School Shoe', 
//     category: 'School', 
//     retailPrice: 699, 
//     wholesalePrice: 180, 
//     moq: 60, 
//     stock: 5000, 
//     sizes: [1,2,3,4,5], 
//     images: ['https://images.unsplash.com/photo-1515347619252-60a6bf4fffce?q=80&w=800&auto=format&fit=crop'], 
//     tag: 'Back to School' 
//   },
// ];

// const CATEGORIES = ['All', 'Men\'s Formal', 'Office Wear', 'Women\'s Comfort', 'Men\'s Boots', 'Casual', 'School'];

// const generateId = () => Math.floor(Math.random() * 100000);

// // --- COMPONENTS ---

// // 1. Product Card with CAROUSEL
// const ProductCard = ({ product, mode, onAddToCart }) => {
//   const [showMatrix, setShowMatrix] = useState(false);
//   const [currentImgIndex, setCurrentImgIndex] = useState(0); // For Carousel
//   const [quantities, setQuantities] = useState(
//     product.sizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {})
//   );
  
//   const totalPairs = Object.values(quantities).reduce((a, b) => a + Number(b), 0);
//   const matrixTotalCost = totalPairs * product.wholesalePrice;

//   // Carousel Logic
//   const nextImage = (e) => {
//     e.stopPropagation();
//     setCurrentImgIndex((prev) => (prev + 1) % product.images.length);
//   };

//   const prevImage = (e) => {
//     e.stopPropagation();
//     setCurrentImgIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
//   };

//   const handleWholesaleAdd = () => {
//     if (totalPairs < product.moq) {
//       alert(`Minimum Order Quantity is ${product.moq} pairs.`);
//       return;
//     }
//     onAddToCart({
//       ...product,
//       type: 'wholesale',
//       breakdown: quantities,
//       quantity: totalPairs,
//       price: product.wholesalePrice,
//       image: product.images[0] // Use main image for cart thumbnail
//     });
//     setQuantities(product.sizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {}));
//     setShowMatrix(false);
//   };

//   const handleRetailAdd = () => {
//     onAddToCart({
//       ...product,
//       type: 'retail',
//       quantity: 1,
//       price: product.retailPrice,
//       image: product.images[0]
//     });
//   };

//   return (
//     <div className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
//       {/* Image Carousel Section */}
//       <div className="relative h-64 bg-slate-100 group">
//         <img 
//           src={product.images[currentImgIndex]} 
//           alt={product.name} 
//           className="w-full h-full object-cover transition-transform duration-500" 
//         />
        
//         {/* Tags */}
//         {product.tag && <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] uppercase font-bold px-2 py-1 rounded backdrop-blur-sm z-10">{product.tag}</span>}
//         {mode === 'wholesale' && <span className="absolute top-2 left-2 bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">MOQ: {product.moq}</span>}

//         {/* Carousel Controls (Only if > 1 image) */}
//         {product.images.length > 1 && (
//           <>
//             <button 
//               onClick={prevImage} 
//               className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full text-slate-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
//             >
//               <ChevronLeft size={20} />
//             </button>
//             <button 
//               onClick={nextImage} 
//               className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full text-slate-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
//             >
//               <ChevronRight size={20} />
//             </button>
            
//             {/* Dots */}
//             <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
//               {product.images.map((_, idx) => (
//                 <div 
//                   key={idx} 
//                   className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImgIndex ? 'bg-white scale-125' : 'bg-white/50'}`} 
//                 />
//               ))}
//             </div>
//           </>
//         )}
//       </div>

//       {/* Details Section */}
//       <div className="p-4 flex-1 flex flex-col">
//         <div className="mb-2">
//           <span className="text-xs text-slate-500 uppercase tracking-wide">{product.category}</span>
//           <h3 className="text-lg font-bold text-slate-800 leading-tight">{product.name}</h3>
//         </div>
        
//         <div className="mt-auto pt-4 border-t border-slate-100">
//           <div className="flex justify-between items-end mb-4">
//             <div>
//               <p className="text-xs text-slate-500 mb-0.5">Price per pair</p>
//               <div className="flex items-baseline gap-2">
//                 <span className="text-xl font-bold text-slate-900">₹{mode === 'retail' ? product.retailPrice : product.wholesalePrice}</span>
//                 {mode === 'retail' && <span className="text-xs text-red-500 line-through">₹{Math.floor(product.retailPrice * 1.2)}</span>}
//               </div>
//               {mode === 'wholesale' && <p className="text-[10px] text-red-600 font-medium">*Excl. GST</p>}
//             </div>
            
//             {mode === 'retail' ? (
//               <button onClick={handleRetailAdd} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-200">Add</button>
//             ) : (
//               <button onClick={() => setShowMatrix(!showMatrix)} className={`px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg ${showMatrix ? 'bg-slate-200 text-slate-800' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}>{showMatrix ? 'Close' : 'Bulk'}</button>
//             )}
//           </div>

//           {mode === 'wholesale' && showMatrix && (
//             <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2">
//               <div className="flex justify-between items-center mb-2">
//                  <span className="text-[10px] font-bold text-slate-500">SELECT SIZES</span>
//               </div>
//               <div className="grid grid-cols-5 gap-1 mb-3">
//                 {product.sizes.map((size) => (
//                   <div key={size} className="text-center">
//                     <label className="block text-[10px] text-slate-500">UK {size}</label>
//                     <input type="number" min="0" value={quantities[size] || ''} onChange={(e) => setQuantities(prev => ({...prev, [size]: e.target.value}))} className="w-full border border-slate-300 rounded p-1 text-center text-xs" placeholder="0" />
//                   </div>
//                 ))}
//               </div>
//               <div className="flex justify-between text-xs mb-2">
//                 <span>Pairs: <strong>{totalPairs}</strong></span>
//                 <span>Total: <strong className="text-blue-600">₹{matrixTotalCost}</strong></span>
//               </div>
//               <button onClick={handleWholesaleAdd} disabled={totalPairs === 0} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white py-1.5 rounded text-xs font-bold uppercase">Add Batch</button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // 2. Features Section
// const Features = () => (
//   <div className="bg-slate-50 py-12 border-y border-slate-200">
//     <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-blue-600">
//           <Truck />
//         </div>
//         <h3 className="font-bold text-slate-800 mb-2">Nationwide Delivery</h3>
//         <p className="text-sm text-slate-500 px-4">From Agra to anywhere in India. We use trusted B2B logistics partners.</p>
//       </div>
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-amber-500">
//           <ShieldCheck />
//         </div>
//         <h3 className="font-bold text-slate-800 mb-2">Quality Guarantee</h3>
//         <p className="text-sm text-slate-500 px-4">Every pair is inspected before packing. 20 years of reputation at stake.</p>
//       </div>
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-red-600">
//           <Info />
//         </div>
//         <h3 className="font-bold text-slate-800 mb-2">Direct Support</h3>
//         <p className="text-sm text-slate-500 px-4">Call us anytime. We believe in building relationships, not just sales.</p>
//       </div>
//     </div>
//   </div>
// );

// // --- ADMIN COMPONENTS ---

// // Updated ProductForm with Local File Upload
// const ProductForm = ({ onSave, onCancel }) => {
//   const [formData, setFormData] = useState({
//     name: '', category: 'Men\'s Formal', retailPrice: '', wholesalePrice: '', 
//     moq: 24, sizes: '6,7,8,9,10', tag: '', 
//     images: [] // Now an array
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (formData.images.length === 0) {
//       alert("Please upload at least one image.");
//       return;
//     }
//     const newProduct = {
//       ...formData,
//       id: generateId(),
//       retailPrice: Number(formData.retailPrice),
//       wholesalePrice: Number(formData.wholesalePrice),
//       moq: Number(formData.moq),
//       sizes: formData.sizes.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n))
//     };
//     onSave(newProduct);
//   };

//   // Handle Local Image Selection
//   const handleImageUpload = (e) => {
//     if (e.target.files && e.target.files.length > 0) {
//       // Create temporary URLs for the uploaded files
//       const newImageUrls = Array.from(e.target.files).map(file => URL.createObjectURL(file));
//       setFormData(prev => ({
//         ...prev,
//         images: [...prev.images, ...newImageUrls]
//       }));
//     }
//   };

//   const removeImage = (indexToRemove) => {
//     setFormData(prev => ({
//       ...prev,
//       images: prev.images.filter((_, idx) => idx !== indexToRemove)
//     }));
//   };

//   return (
//     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg animate-in fade-in slide-in-from-bottom-4">
//       <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
//         <Plus className="text-green-600" /> Add New Product
//       </h3>
//       <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {/* Name */}
//         <div className="md:col-span-2">
//           <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Product Name</label>
//           <input required type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-slate-900 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Leather Oxford Pro" />
//         </div>
        
//         {/* Category */}
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Category</label>
//            <select className="w-full border p-2 rounded outline-none bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
//              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
//            </select>
//         </div>

//         {/* Sizes */}
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Available Sizes (Comma Sep)</label>
//            <input required type="text" className="w-full border p-2 rounded outline-none" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} placeholder="6,7,8,9,10" />
//         </div>

//         {/* Pricing */}
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Retail Price (₹)</label>
//            <input required type="number" className="w-full border p-2 rounded outline-none" value={formData.retailPrice} onChange={e => setFormData({...formData, retailPrice: e.target.value})} />
//         </div>
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Wholesale Price (₹)</label>
//            <input required type="number" className="w-full border p-2 rounded outline-none" value={formData.wholesalePrice} onChange={e => setFormData({...formData, wholesalePrice: e.target.value})} />
//         </div>

//         {/* MOQ & Tag */}
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Min Order Qty</label>
//            <input required type="number" className="w-full border p-2 rounded outline-none" value={formData.moq} onChange={e => setFormData({...formData, moq: e.target.value})} />
//         </div>
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Marketing Tag (Optional)</label>
//            <input type="text" className="w-full border p-2 rounded outline-none" value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})} placeholder="e.g. New Arrival" />
//         </div>

//         {/* Image Upload Section */}
//         <div className="md:col-span-2">
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Product Images</label>
           
//            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition cursor-pointer relative">
//              <input 
//                 type="file" 
//                 multiple 
//                 accept="image/*"
//                 onChange={handleImageUpload}
//                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//              />
//              <Upload className="mx-auto text-slate-400 mb-2" />
//              <p className="text-sm text-slate-500 font-medium">Click to select images from device</p>
//              <p className="text-xs text-slate-400">JPG, PNG supported</p>
//            </div>

//            {/* Preview Gallery */}
//            {formData.images.length > 0 && (
//              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
//                {formData.images.map((img, idx) => (
//                  <div key={idx} className="relative shrink-0 w-20 h-20 group">
//                    <img src={img} alt="Preview" className="w-full h-full object-cover rounded-lg border border-slate-200" />
//                    <button 
//                     type="button"
//                     onClick={() => removeImage(idx)}
//                     className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600"
//                    >
//                      <X size={12} />
//                    </button>
//                  </div>
//                ))}
//              </div>
//            )}
//         </div>

//         {/* Actions */}
//         <div className="md:col-span-2 flex gap-3 mt-2">
//           <button type="button" onClick={onCancel} className="flex-1 py-2 border border-slate-300 rounded text-slate-600 font-bold hover:bg-slate-50">Cancel</button>
//           <button type="submit" className="flex-1 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 flex justify-center items-center gap-2"><Save size={18}/> Save Product</button>
//         </div>
//       </form>
//     </div>
//   );
// };

// const AdminDashboard = ({ orders, products, setProducts, setView, onLogout }) => {
//   const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'products'
//   const [showAddForm, setShowAddForm] = useState(false);

//   const pendingOrders = orders.filter(o => o.status === 'Pending').length;
//   const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);

//   const handleAddProduct = (newProduct) => {
//     setProducts([newProduct, ...products]);
//     setShowAddForm(false);
//     alert("Product Added Successfully!");
//   };

//   const handleDeleteProduct = (id) => {
//     if (window.confirm("Are you sure you want to delete this product?")) {
//       setProducts(products.filter(p => p.id !== id));
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8 bg-slate-50 min-h-screen">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
//         <div>
//            <h2 className="text-2xl font-bold text-slate-900">Owner Dashboard</h2>
//            <p className="text-sm text-slate-500">Manage Orders & Inventory</p>
//         </div>
//         <div className="flex gap-3">
//           <button onClick={onLogout} className="bg-white border border-slate-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center gap-2 font-bold transition">
//             <LogOut size={16}/> Logout
//           </button>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="flex gap-4 mb-6 border-b border-slate-200">
//         <button 
//           onClick={() => setActiveTab('orders')} 
//           className={`pb-3 px-2 font-bold text-sm ${activeTab === 'orders' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500'}`}
//         >
//           Incoming Orders
//         </button>
//         <button 
//           onClick={() => setActiveTab('products')} 
//           className={`pb-3 px-2 font-bold text-sm ${activeTab === 'products' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500'}`}
//         >
//           Manage Products ({products.length})
//         </button>
//       </div>

//       {/* ORDERS TAB */}
//       {activeTab === 'orders' && (
//         <div className="space-y-6">
//           {/* Stats */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
//               <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><ClipboardList /></div>
//               <div><p className="text-slate-500 text-sm">Total Orders</p><h3 className="text-2xl font-bold text-slate-900">{orders.length}</h3></div>
//             </div>
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
//               <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><Package /></div>
//               <div><p className="text-slate-500 text-sm">Pending</p><h3 className="text-2xl font-bold text-slate-900">{pendingOrders}</h3></div>
//             </div>
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
//               <div className="p-3 bg-green-100 text-green-600 rounded-lg"><Users /></div>
//               <div><p className="text-slate-500 text-sm">Revenue (Est)</p><h3 className="text-2xl font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</h3></div>
//             </div>
//           </div>

//           {/* Table */}
//           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//             <div className="p-6 border-b border-slate-100">
//               <h3 className="font-bold text-lg text-slate-800">Recent Orders</h3>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full text-left text-sm">
//                 <thead className="bg-slate-50 text-slate-500 font-medium">
//                   <tr>
//                     <th className="p-4">ID</th>
//                     <th className="p-4">Customer</th>
//                     <th className="p-4">Type</th>
//                     <th className="p-4">Total</th>
//                     <th className="p-4">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100">
//                   {orders.length === 0 ? (
//                     <tr><td colSpan="5" className="p-8 text-center text-slate-400">No orders yet.</td></tr>
//                   ) : orders.map((order) => (
//                     <tr key={order.id} className="hover:bg-slate-50">
//                       <td className="p-4 font-mono text-xs">{order.id}</td>
//                       <td className="p-4 font-bold">{order.customer.name}</td>
//                       <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${order.type === 'wholesale' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{order.type}</span></td>
//                       <td className="p-4 font-bold">₹{order.total}</td>
//                       <td className="p-4"><span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold">{order.status}</span></td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* PRODUCTS TAB */}
//       {activeTab === 'products' && (
//         <div>
//           <div className="flex justify-between items-center mb-6">
//             <h3 className="text-xl font-bold text-slate-900">Product Inventory</h3>
//             {!showAddForm && (
//               <button onClick={() => setShowAddForm(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 flex items-center gap-2 shadow-lg">
//                 <Plus size={18} /> Add New Product
//               </button>
//             )}
//           </div>

//           {/* Add Product Form */}
//           {showAddForm && (
//             <div className="mb-8">
//               <ProductForm onSave={handleAddProduct} onCancel={() => setShowAddForm(false)} />
//             </div>
//           )}

//           {/* Product List */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {products.map(product => (
//               <div key={product.id} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 items-start shadow-sm hover:shadow-md transition">
//                 <img src={product.images[0]} className="w-20 h-20 rounded-lg object-cover bg-slate-100" alt={product.name} />
//                 <div className="flex-1">
//                    <div className="flex justify-between items-start">
//                       <h4 className="font-bold text-slate-900 leading-tight">{product.name}</h4>
//                       <button onClick={() => handleDeleteProduct(product.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
//                    </div>
//                    <p className="text-xs text-slate-500 mb-2">{product.category}</p>
//                    <div className="flex gap-4 text-sm">
//                       <div><span className="text-[10px] text-slate-400 uppercase block">Retail</span><span className="font-bold">₹{product.retailPrice}</span></div>
//                       <div><span className="text-[10px] text-slate-400 uppercase block">Wholesale</span><span className="font-bold text-blue-600">₹{product.wholesalePrice}</span></div>
//                    </div>
//                    <div className="mt-2 text-[10px] text-slate-500 bg-slate-50 inline-block px-2 py-1 rounded">
//                      Sizes: {product.sizes.join(', ')}
//                    </div>
//                    <div className="mt-1 text-[10px] text-slate-400">
//                      {product.images.length} images uploaded
//                    </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // --- VIEWS ---

// const ShopView = ({ products, mode, onAddToCart }) => {
//   const [filter, setFilter] = useState('All');
//   const [searchTerm, setSearchTerm] = useState('');
  
//   const filteredProducts = products.filter(p => {
//     const matchesCategory = filter === 'All' || p.category === filter;
//     const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
//         <div>
//           <h2 className="text-3xl font-bold text-slate-900">{mode === 'wholesale' ? 'Wholesale Catalog' : 'Shop Collection'}</h2>
//           <p className="text-slate-500 text-sm mt-1">{mode === 'wholesale' ? 'Bulk pricing applied. MOQ rules active.' : 'Latest trends from Agra.'}</p>
//         </div>
        
//         {/* Search Bar */}
//         <div className="relative w-full md:w-64">
//           <input 
//             type="text" 
//             placeholder="Search shoes..." 
//             className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
//         </div>
//       </div>

//       {/* Category Pills */}
//       <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4">
//         <Filter size={18} className="text-slate-400 shrink-0" />
//         {CATEGORIES.map(cat => (
//           <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${filter === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
//             {cat}
//           </button>
//         ))}
//       </div>

//       {filteredProducts.length === 0 ? (
//         <div className="text-center py-20 text-slate-400">No products found matching your search.</div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {filteredProducts.map(product => (
//             <ProductCard key={product.id} product={product} mode={mode} onAddToCart={onAddToCart} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// const HomeView = ({ setView, mode }) => (
//   <>
//     <div className="bg-white border-b border-slate-200">
//       <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row items-center gap-10">
//         <div className="flex-1 text-center md:text-left">
//           <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold mb-6">
//             <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
//             {mode === 'wholesale' ? 'ACCEPTING NEW DISTRIBUTORS' : 'SEASONAL SALE IS LIVE'}
//           </div>
//           <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
//             {mode === 'wholesale' ? <>Factory Direct.<br /><span className="text-blue-600">Maximize Margins.</span></> : <>Handcrafted in Agra.<br /><span className="text-red-600">Worn Everywhere.</span></>}
//           </h1>
//           <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
//             {mode === 'wholesale' ? 'Connect directly with our 20-year-old manufacturing unit. Get transparent pricing, bulk shipping support, and custom branding options.' : 'Discover the finest leather shoes directly from the shoe capital of India. Premium quality, honest prices, delivered to your doorstep.'}
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
//             <button onClick={() => setView('shop')} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2">
//               {mode === 'wholesale' ? 'View Catalog' : 'Shop Collection'} <ArrowRight size={18} />
//             </button>
//           </div>
//         </div>
        
//         <div className="flex-1 w-full max-w-md md:max-w-full">
//            <div className="relative">
//              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-amber-50 rounded-2xl transform rotate-3"></div>
//              <img 
//                src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop" 
//                alt="Shoe Craftsmanship" 
//                className="relative rounded-2xl shadow-2xl w-full h-auto object-cover transform -rotate-2 hover:rotate-0 transition duration-700"
//              />
//              {mode === 'wholesale' && (
//                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3">
//                  <div className="bg-green-100 p-2 rounded-full text-green-600"><CheckCircle size={24} /></div>
//                  <div>
//                    <p className="text-sm font-bold text-slate-800">Verified Manufacturer</p>
//                    <p className="text-xs text-slate-500">GST Registered • IEC License</p>
//                  </div>
//                </div>
//              )}
//            </div>
//         </div>
//       </div>
//     </div>
//     <Features />
//   </>
// );

// const CartView = ({ cart, mode, removeFromCart, setView }) => {
//   const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
//   const totalGST = mode === 'wholesale' ? totalAmount * 0.12 : 0; // 12% GST for wholesale
//   const finalTotal = totalAmount + totalGST;

//   if (cart.length === 0) return (
//     <div className="container mx-auto px-4 py-20 text-center">
//       <ShoppingCart size={64} className="mx-auto text-slate-200 mb-4" />
//       <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
//       <button onClick={() => setView('shop')} className="text-blue-600 font-medium hover:underline">Start Shopping</button>
//     </div>
//   );

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h2 className="text-2xl font-bold text-slate-900 mb-8">Shopping Cart ({cart.length} items)</h2>
//       <div className="flex flex-col lg:flex-row gap-8">
//         <div className="flex-1 space-y-4">
//           {cart.map((item, idx) => (
//             <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl flex gap-4">
//               <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg bg-slate-100" />
//               <div className="flex-1">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h3 className="font-bold text-slate-900">{item.name}</h3>
//                     <p className="text-sm text-slate-500">{item.category}</p>
//                   </div>
//                   <button onClick={() => removeFromCart(idx)} className="text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
//                 </div>
                
//                 {item.type === 'wholesale' ? (
//                    <div className="mt-2 bg-slate-50 p-2 rounded text-xs text-slate-600 grid grid-cols-5 gap-2">
//                      {Object.entries(item.breakdown).map(([size, qty]) => Number(qty) > 0 && (
//                        <div key={size} className="text-center bg-white border border-slate-200 rounded px-1">
//                          <span className="block text-[10px] text-slate-400">UK {size}</span>
//                          <span className="font-bold">{qty}</span>
//                        </div>
//                      ))}
//                    </div>
//                 ) : (
//                   <div className="mt-2 text-sm text-slate-600">Qty: {item.quantity} Pair</div>
//                 )}
                
//                 <div className="mt-3 flex justify-between items-center">
//                    <div className="text-xs text-slate-500">{item.quantity} pairs x ₹{item.price}</div>
//                    <div className="font-bold text-slate-900">₹{item.quantity * item.price}</div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="w-full lg:w-96">
//           <div className="bg-white border border-slate-200 p-6 rounded-xl sticky top-24 shadow-sm">
//             <h3 className="font-bold text-lg mb-4">Order Summary</h3>
//             <div className="space-y-3 mb-6">
//               <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹{totalAmount}</span></div>
//               {mode === 'wholesale' && (
//                 <div className="flex justify-between text-slate-600"><span>GST (12%)</span><span>₹{totalGST.toFixed(0)}</span></div>
//               )}
//               <div className="flex justify-between text-slate-600"><span>Shipping</span><span>{mode === 'wholesale' ? 'To be calculated' : 'Free'}</span></div>
//               <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-lg text-slate-900">
//                 <span>Total</span><span>₹{finalTotal.toFixed(0)}</span>
//               </div>
//             </div>
//             <button onClick={() => setView('checkout')} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg">
//               Proceed to Checkout
//             </button>
//             <p className="text-xs text-slate-400 text-center mt-3">Secure Checkout via Agra Shoe Mart</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const CheckoutView = ({ cart, mode, placeOrder, setView }) => {
//   const [form, setForm] = useState({ name: '', phone: '', address: '' });
  
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     placeOrder(form);
//   };

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-2xl">
//       <button onClick={() => setView('cart')} className="text-sm text-slate-500 hover:text-slate-900 mb-6">← Back to Cart</button>
//       <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
//         <h2 className="text-2xl font-bold text-slate-900 mb-6">{mode === 'wholesale' ? 'Request Bulk Quote' : 'Checkout'}</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Full Name / Shop Name</label>
//             <input required type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number (WhatsApp)</label>
//             <input required type="tel" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Address</label>
//             <textarea required rows="3" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.address} onChange={e => setForm({...form, address: e.target.value})}></textarea>
//           </div>
          
//           <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
//             {mode === 'wholesale' 
//               ? "Note: This is a quote request. Our sales team will contact you on WhatsApp to confirm availability and shipping costs before payment."
//               : "Note: Cash on Delivery is available for Agra. Online payment link will be sent for other cities."
//             }
//           </div>

//           <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-md">
//             {mode === 'wholesale' ? 'Submit Quote Request' : 'Place Order'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// const LoginView = ({ setMode, setView, setUser }) => {
//   const [email, setEmail] = useState('');
  
//   const handleLogin = (e) => {
//     e.preventDefault();
//     if (email.includes('admin')) {
//       setUser({ name: 'Owner', type: 'admin', email });
//       setView('admin');
//     } else {
//       setUser({ name: 'Verified Buyer', type: 'wholesale', email });
//       setMode('wholesale');
//       setView('shop');
//     }
//   };

//   return (
//     <div className="min-h-[60vh] flex items-center justify-center px-4">
//       <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-xl shadow-lg">
//         <div className="text-center mb-8">
//           <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white mx-auto mb-4"><Package size={32} /></div>
//           <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
//           <p className="text-slate-500 mt-2">Enter credentials to access your dashboard</p>
//         </div>
//         <form onSubmit={handleLogin} className="space-y-4">
//           <div>
//              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
//              <input type="email" required placeholder="admin@agra.com" className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500" value={email} onChange={e => setEmail(e.target.value)} />
//           </div>
//           <div>
//              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
//              <input type="password" placeholder="••••••••" className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
//           </div>
//           <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition">Login</button>
//         </form>
//         <p className="text-center text-xs text-slate-400 mt-6">Use 'admin@agra.com' for Owner view</p>
//       </div>
//     </div>
//   );
// };

// // --- MAIN CONTROLLER ---

// const App = () => {
//   const [view, setView] = useState('home');
//   const [mode, setMode] = useState('retail');
//   const [cart, setCart] = useState([]);
//   const [user, setUser] = useState(null);
//   const [products, setProducts] = useState(INITIAL_PRODUCTS); // LIFTED STATE FOR PRODUCTS
//   const [orders, setOrders] = useState([]);
//   const [showToast, setShowToast] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   // --- LOGOUT LOGIC ---
//   const handleLogout = () => {
//     if (window.confirm("Are you sure you want to logout?")) {
//       setUser(null);
//       setMode('retail'); // Reset to default retail mode
//       setView('home');   // Go to home
//     }
//   };
//   // --------------------

//   const addToCart = (item) => {
//     // --- AUTH GUARD ---
//     if (!user) {
//       alert("Please login to add items to your cart.");
//       setView('login');
//       return;
//     }
//     // ------------------

//     setCart([...cart, item]);
//     setShowToast(true);
//     setTimeout(() => setShowToast(false), 3000);
//   };

//   const removeFromCart = (index) => {
//     const newCart = [...cart];
//     newCart.splice(index, 1);
//     setCart(newCart);
//   };

//   const placeOrder = (customerDetails) => {
//     const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
//     const gst = mode === 'wholesale' ? total * 0.12 : 0;
    
//     const newOrder = {
//       id: 'ORD-' + Math.floor(Math.random() * 10000),
//       customer: customerDetails,
//       items: cart,
//       total: total + gst,
//       type: mode,
//       status: 'Pending',
//       date: new Date().toISOString()
//     };

//     setOrders([newOrder, ...orders]); // Save to "Database"
//     setCart([]);
//     setView('success');
//   };

//   const renderView = () => {
//     switch(view) {
//       case 'home': return <HomeView setView={setView} mode={mode} />;
//       case 'shop': return <ShopView products={products} mode={mode} onAddToCart={addToCart} />;
//       case 'cart': return <CartView cart={cart} mode={mode} removeFromCart={removeFromCart} setView={setView} />;
//       case 'checkout': return <CheckoutView cart={cart} mode={mode} placeOrder={placeOrder} setView={setView} />;
//       case 'login': return <LoginView setMode={setMode} setView={setView} setUser={setUser} />;
//       case 'admin': return <AdminDashboard orders={orders} products={products} setProducts={setProducts} setView={setView} onLogout={handleLogout} />;
//       case 'success': return (
//         <div className="container mx-auto px-4 py-20 text-center">
//           <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} /></div>
//           <h2 className="text-3xl font-bold text-slate-900 mb-4">{mode === 'wholesale' ? 'Quote Request Sent!' : 'Order Placed Successfully!'}</h2>
//           <p className="text-slate-600 max-w-md mx-auto mb-8">
//             {mode === 'wholesale' 
//               ? 'Our team will review your bulk requirement and send a proforma invoice via WhatsApp shortly.' 
//               : 'Thank you for shopping with Agra Shoe Mart. Your shoes will be dispatched within 24 hours.'}
//           </p>
//           <button onClick={() => setView('home')} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold">Return Home</button>
//         </div>
//       );
//       default: return <HomeView setView={setView} mode={mode} />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
//       {/* Navbar (Hidden in Admin Mode) */}
//       {view !== 'admin' && (
//         <nav className="bg-white shadow-md sticky top-0 z-50">
//           <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 flex justify-between items-center">
//             <span className="hidden sm:inline">Agra's Trusted Shoe Wholesaler - Since 2003</span>
//             <div className="flex items-center gap-4">
//               <span className="flex items-center gap-1 hover:text-white cursor-pointer transition">
//                 <Phone size={14} /> +91 98765-XXXXX
//               </span>
//               <span className="text-amber-500 font-bold cursor-pointer hover:underline hidden sm:block">
//                 Request Sample Kit
//               </span>
//             </div>
//           </div>

//           <div className="container mx-auto px-4 py-4">
//             <div className="flex justify-between items-center">
//               <div onClick={() => setView('home')} className="flex items-center gap-2 cursor-pointer">
//                 <div className="bg-red-600 text-white p-1 rounded font-bold text-xl">ASM</div>
//                 <div className="text-2xl font-bold tracking-tighter text-slate-800 leading-none">
//                   AGRA<span className="text-red-600">SHOES</span>
//                 </div>
//               </div>

//               <div className="hidden md:flex gap-8 font-medium text-slate-600 text-sm">
//                 <button onClick={() => setView('home')} className="hover:text-red-600 transition">Home</button>
//                 <button onClick={() => setView('shop')} className="hover:text-red-600 transition">Shop Catalog</button>
//                 <button onClick={() => setView('shop')} className="hover:text-red-600 transition">New Arrivals</button>
//               </div>

//               <div className="flex items-center gap-4">
//                 <div className="hidden md:flex bg-slate-100 rounded-full p-1 border border-slate-200 mr-2">
//                   <button onClick={() => setMode('retail')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${mode === 'retail' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Retail</button>
//                   <button onClick={() => setMode('wholesale')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${mode === 'wholesale' ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}>Wholesale</button>
//                 </div>

//                 <button onClick={() => setView('cart')} className="relative p-2 hover:bg-slate-100 rounded-full transition group">
//                   <ShoppingCart size={22} className="text-slate-700 group-hover:text-red-600" />
//                   {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">{cart.length}</span>}
//                 </button>
                
//                 {user ? (
//                   <div className="flex items-center gap-2">
//                     <button onClick={() => user.type === 'admin' ? setView('admin') : setView('home')} className="flex items-center gap-2 font-bold text-sm bg-slate-100 px-3 py-2 rounded-lg hover:bg-slate-200 transition">
//                       <User size={18}/> <span className="hidden sm:inline">{user.name}</span>
//                     </button>
//                     {/* LOGOUT BUTTON */}
//                     <button onClick={handleLogout} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition shadow-sm" title="Logout">
//                       <LogOut size={18} />
//                     </button>
//                   </div>
//                 ) : (
//                   <button onClick={() => setView('login')} className="hidden sm:flex bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm">Login</button>
//                 )}

//                 <button className="md:hidden text-slate-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
//                    {isMobileMenuOpen ? <X /> : <Menu />}
//                 </button>
//               </div>
//             </div>

//             {isMobileMenuOpen && (
//               <div className="md:hidden mt-4 pb-4 border-t pt-4">
//                  <div className="flex bg-slate-100 rounded-lg p-1 mb-4">
//                   <button onClick={() => { setMode('retail'); setIsMobileMenuOpen(false); }} className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === 'retail' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Retail</button>
//                   <button onClick={() => { setMode('wholesale'); setIsMobileMenuOpen(false); }} className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === 'wholesale' ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}>Wholesale</button>
//                 </div>
//                 <div className="space-y-3 text-slate-700 font-medium">
//                   <button onClick={() => { setView('home'); setIsMobileMenuOpen(false); }} className="block w-full text-left hover:text-red-600">Home</button>
//                   <button onClick={() => { setView('shop'); setIsMobileMenuOpen(false); }} className="block w-full text-left hover:text-red-600">Shop Catalog</button>
//                   <button onClick={() => { setView('login'); setIsMobileMenuOpen(false); }} className="block w-full text-left text-blue-600">Login / Register</button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </nav>
//       )}

//       <main className="flex-1">{renderView()}</main>

//       {view !== 'admin' && (
//         <footer className="bg-slate-900 text-slate-400 py-12">
//           <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
//             <div>
//               <h4 className="text-white font-bold text-lg mb-4">AGRA SHOES</h4>
//               <p className="mb-4">Digitizing the legacy of Agra's shoemaking. We connect manufacturers directly to retailers across India.</p>
//               <p>Agra, Uttar Pradesh, India - 282002</p>
//             </div>
//             <div>
//               <h4 className="text-white font-bold mb-4">Shop</h4>
//               <ul className="space-y-2">
//                 <li className="hover:text-white cursor-pointer">Men's Formal</li>
//                 <li className="hover:text-white cursor-pointer">Casual Loafers</li>
//                 <li className="hover:text-white cursor-pointer">Safety Shoes</li>
//                 <li className="hover:text-white cursor-pointer">School Shoes</li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="text-white font-bold mb-4">Wholesale</h4>
//               <ul className="space-y-2">
//                 <li className="hover:text-white cursor-pointer">Register as Distributor</li>
//                 <li className="hover:text-white cursor-pointer">Bulk Pricing Policy</li>
//                 <li className="hover:text-white cursor-pointer">Shipping & Logistics</li>
//                 <li className="hover:text-white cursor-pointer">Return Policy</li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="text-white font-bold mb-4">Stay Connected</h4>
//               <p className="mb-4">Get latest design updates on WhatsApp.</p>
//               <div className="flex gap-2">
//                 <input type="text" placeholder="+91 Mobile Number" className="bg-slate-800 border-none rounded px-3 py-2 w-full text-white outline-none focus:ring-1 focus:ring-slate-600" />
//                 <button className="bg-green-600 text-white px-3 py-2 rounded font-bold hover:bg-green-700">Join</button>
//               </div>
//             </div>
//           </div>
//           <div className="text-center mt-12 pt-8 border-t border-slate-800">
//             &copy; 2025 Agra Wholesale Shoe Mart. All rights reserved.
//           </div>
//         </footer>
//       )}

//       {showToast && (
//         <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-bounce z-50">
//           <CheckCircle size={20} className="text-green-400" />
//           <p className="font-bold text-sm">Added to Cart</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;
// import React, { useState } from 'react';
// import { 
//   ShoppingCart, User, Phone, Menu, X, CheckCircle, Truck, 
//   ShieldCheck, Info, Package, ArrowRight, Trash2, Filter, 
//   Search, ClipboardList, Users, LogOut, Plus, Save,
//   Tag, Layers, DollarSign
// } from 'lucide-react';

// // --- MOCK DATABASE ---
// const INITIAL_PRODUCTS = [
//   { id: 1, name: 'Agra Classic Loafer', category: 'Men\'s Formal', retailPrice: 1499, wholesalePrice: 450, moq: 24, stock: 1000, sizes: [6,7,8,9,10], image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800&auto=format&fit=crop', tag: 'Best Seller' },
//   { id: 2, name: 'Genuine Leather Oxford', category: 'Office Wear', retailPrice: 2199, wholesalePrice: 750, moq: 12, stock: 500, sizes: [6,7,8,9,10], image: 'https://images.unsplash.com/photo-1478186172493-493ca852a743?q=80&w=800&auto=format&fit=crop', tag: 'Premium' },
//   { id: 3, name: 'Daily Soft Sandal', category: 'Women\'s Comfort', retailPrice: 899, wholesalePrice: 220, moq: 48, stock: 2000, sizes: [4,5,6,7,8], image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop', tag: 'High Demand' },
//   { id: 4, name: 'Rugged Chelsea Boot', category: 'Men\'s Boots', retailPrice: 2899, wholesalePrice: 950, moq: 12, stock: 300, sizes: [7,8,9,10,11], image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800&auto=format&fit=crop', tag: 'New Arrival' },
//   { id: 5, name: 'Canvas Sneaker', category: 'Casual', retailPrice: 999, wholesalePrice: 310, moq: 36, stock: 800, sizes: [6,7,8,9,10], image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop', tag: null },
//   { id: 6, name: 'Kids School Shoe', category: 'School', retailPrice: 699, wholesalePrice: 180, moq: 60, stock: 5000, sizes: [1,2,3,4,5], image: 'https://images.unsplash.com/photo-1515347619252-60a6bf4fffce?q=80&w=800&auto=format&fit=crop', tag: 'Back to School' },
// ];

// const CATEGORIES = ['All', 'Men\'s Formal', 'Office Wear', 'Women\'s Comfort', 'Men\'s Boots', 'Casual', 'School'];

// const generateId = () => Math.floor(Math.random() * 100000);

// // --- COMPONENTS ---

// // 1. Product Card
// const ProductCard = ({ product, mode, onAddToCart }) => {
//   const [showMatrix, setShowMatrix] = useState(false);
//   const [quantities, setQuantities] = useState(
//     product.sizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {})
//   );
  
//   const totalPairs = Object.values(quantities).reduce((a, b) => a + Number(b), 0);
//   const matrixTotalCost = totalPairs * product.wholesalePrice;

//   const handleWholesaleAdd = () => {
//     if (totalPairs < product.moq) {
//       alert(`Minimum Order Quantity is ${product.moq} pairs.`);
//       return;
//     }
//     onAddToCart({
//       ...product,
//       type: 'wholesale',
//       breakdown: quantities,
//       quantity: totalPairs,
//       price: product.wholesalePrice
//     });
//     setQuantities(product.sizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {}));
//     setShowMatrix(false);
//   };

//   const handleRetailAdd = () => {
//     onAddToCart({
//       ...product,
//       type: 'retail',
//       quantity: 1,
//       price: product.retailPrice
//     });
//   };

//   return (
//     <div className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
//       <div className="relative h-64 overflow-hidden bg-slate-100">
//         <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
//         {product.tag && <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] uppercase font-bold px-2 py-1 rounded backdrop-blur-sm">{product.tag}</span>}
//         {mode === 'wholesale' && <span className="absolute top-2 left-2 bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm">MOQ: {product.moq}</span>}
//       </div>

//       <div className="p-4 flex-1 flex flex-col">
//         <div className="mb-2">
//           <span className="text-xs text-slate-500 uppercase tracking-wide">{product.category}</span>
//           <h3 className="text-lg font-bold text-slate-800 leading-tight">{product.name}</h3>
//         </div>
        
//         <div className="mt-auto pt-4 border-t border-slate-100">
//           <div className="flex justify-between items-end mb-4">
//             <div>
//               <p className="text-xs text-slate-500 mb-0.5">Price per pair</p>
//               <div className="flex items-baseline gap-2">
//                 <span className="text-xl font-bold text-slate-900">₹{mode === 'retail' ? product.retailPrice : product.wholesalePrice}</span>
//                 {mode === 'retail' && <span className="text-xs text-red-500 line-through">₹{Math.floor(product.retailPrice * 1.2)}</span>}
//               </div>
//               {mode === 'wholesale' && <p className="text-[10px] text-red-600 font-medium">*Excl. GST</p>}
//             </div>
            
//             {mode === 'retail' ? (
//               <button onClick={handleRetailAdd} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-200">Add</button>
//             ) : (
//               <button onClick={() => setShowMatrix(!showMatrix)} className={`px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg ${showMatrix ? 'bg-slate-200 text-slate-800' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}>{showMatrix ? 'Close' : 'Bulk'}</button>
//             )}
//           </div>

//           {mode === 'wholesale' && showMatrix && (
//             <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2">
//               <div className="flex justify-between items-center mb-2">
//                  <span className="text-[10px] font-bold text-slate-500">SELECT SIZES</span>
//               </div>
//               <div className="grid grid-cols-5 gap-1 mb-3">
//                 {product.sizes.map((size) => (
//                   <div key={size} className="text-center">
//                     <label className="block text-[10px] text-slate-500">UK {size}</label>
//                     <input type="number" min="0" value={quantities[size] || ''} onChange={(e) => setQuantities(prev => ({...prev, [size]: e.target.value}))} className="w-full border border-slate-300 rounded p-1 text-center text-xs" placeholder="0" />
//                   </div>
//                 ))}
//               </div>
//               <div className="flex justify-between text-xs mb-2">
//                 <span>Pairs: <strong>{totalPairs}</strong></span>
//                 <span>Total: <strong className="text-blue-600">₹{matrixTotalCost}</strong></span>
//               </div>
//               <button onClick={handleWholesaleAdd} disabled={totalPairs === 0} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white py-1.5 rounded text-xs font-bold uppercase">Add Batch</button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // 2. Features Section
// const Features = () => (
//   <div className="bg-slate-50 py-12 border-y border-slate-200">
//     <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-blue-600">
//           <Truck />
//         </div>
//         <h3 className="font-bold text-slate-800 mb-2">Nationwide Delivery</h3>
//         <p className="text-sm text-slate-500 px-4">From Agra to anywhere in India. We use trusted B2B logistics partners.</p>
//       </div>
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-amber-500">
//           <ShieldCheck />
//         </div>
//         <h3 className="font-bold text-slate-800 mb-2">Quality Guarantee</h3>
//         <p className="text-sm text-slate-500 px-4">Every pair is inspected before packing. 20 years of reputation at stake.</p>
//       </div>
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-red-600">
//           <Info />
//         </div>
//         <h3 className="font-bold text-slate-800 mb-2">Direct Support</h3>
//         <p className="text-sm text-slate-500 px-4">Call us anytime. We believe in building relationships, not just sales.</p>
//       </div>
//     </div>
//   </div>
// );

// // --- ADMIN COMPONENTS ---

// const ProductForm = ({ onSave, onCancel }) => {
//   const [formData, setFormData] = useState({
//     name: '', category: 'Men\'s Formal', retailPrice: '', wholesalePrice: '', 
//     moq: 24, sizes: '6,7,8,9,10', tag: '', 
//     image: 'https://images.unsplash.com/photo-1560769629-975e13f0c470?q=80&w=800&auto=format&fit=crop'
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const newProduct = {
//       ...formData,
//       id: generateId(),
//       retailPrice: Number(formData.retailPrice),
//       wholesalePrice: Number(formData.wholesalePrice),
//       moq: Number(formData.moq),
//       sizes: formData.sizes.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n))
//     };
//     onSave(newProduct);
//   };

//   const fillRandomImage = () => {
//     const urls = [
//       'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800',
//       'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800',
//       'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=800',
//       'https://images.unsplash.com/photo-1560769629-975e13f0c470?q=80&w=800'
//     ];
//     setFormData({...formData, image: urls[Math.floor(Math.random() * urls.length)]});
//   };

//   return (
//     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg animate-in fade-in slide-in-from-bottom-4">
//       <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
//         <Plus className="text-green-600" /> Add New Product
//       </h3>
//       <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {/* Name */}
//         <div className="md:col-span-2">
//           <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Product Name</label>
//           <input required type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-slate-900 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Leather Oxford Pro" />
//         </div>
        
//         {/* Category */}
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Category</label>
//            <select className="w-full border p-2 rounded outline-none bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
//              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
//            </select>
//         </div>

//         {/* Sizes */}
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Available Sizes (Comma Sep)</label>
//            <input required type="text" className="w-full border p-2 rounded outline-none" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} placeholder="6,7,8,9,10" />
//         </div>

//         {/* Pricing */}
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Retail Price (₹)</label>
//            <input required type="number" className="w-full border p-2 rounded outline-none" value={formData.retailPrice} onChange={e => setFormData({...formData, retailPrice: e.target.value})} />
//         </div>
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Wholesale Price (₹)</label>
//            <input required type="number" className="w-full border p-2 rounded outline-none" value={formData.wholesalePrice} onChange={e => setFormData({...formData, wholesalePrice: e.target.value})} />
//         </div>

//         {/* MOQ & Tag */}
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Min Order Qty</label>
//            <input required type="number" className="w-full border p-2 rounded outline-none" value={formData.moq} onChange={e => setFormData({...formData, moq: e.target.value})} />
//         </div>
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Marketing Tag (Optional)</label>
//            <input type="text" className="w-full border p-2 rounded outline-none" value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})} placeholder="e.g. New Arrival" />
//         </div>

//         {/* Image URL */}
//         <div className="md:col-span-2">
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Image URL</label>
//            <div className="flex gap-2">
//              <input required type="text" className="w-full border p-2 rounded outline-none" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
//              <button type="button" onClick={fillRandomImage} className="bg-slate-100 px-3 rounded text-xs font-bold hover:bg-slate-200 whitespace-nowrap">Random Image</button>
//            </div>
//         </div>

//         {/* Actions */}
//         <div className="md:col-span-2 flex gap-3 mt-2">
//           <button type="button" onClick={onCancel} className="flex-1 py-2 border border-slate-300 rounded text-slate-600 font-bold hover:bg-slate-50">Cancel</button>
//           <button type="submit" className="flex-1 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 flex justify-center items-center gap-2"><Save size={18}/> Save Product</button>
//         </div>
//       </form>
//     </div>
//   );
// };

// const AdminDashboard = ({ orders, products, setProducts, setView, onLogout }) => {
//   const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'products'
//   const [showAddForm, setShowAddForm] = useState(false);

//   const pendingOrders = orders.filter(o => o.status === 'Pending').length;
//   const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);

//   const handleAddProduct = (newProduct) => {
//     setProducts([newProduct, ...products]);
//     setShowAddForm(false);
//     alert("Product Added Successfully!");
//   };

//   const handleDeleteProduct = (id) => {
//     if (window.confirm("Are you sure you want to delete this product?")) {
//       setProducts(products.filter(p => p.id !== id));
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8 bg-slate-50 min-h-screen">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
//         <div>
//            <h2 className="text-2xl font-bold text-slate-900">Owner Dashboard</h2>
//            <p className="text-sm text-slate-500">Manage Orders & Inventory</p>
//         </div>
//         <div className="flex gap-3">
//           <button onClick={onLogout} className="bg-white border border-slate-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center gap-2 font-bold transition">
//             <LogOut size={16}/> Logout
//           </button>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="flex gap-4 mb-6 border-b border-slate-200">
//         <button 
//           onClick={() => setActiveTab('orders')} 
//           className={`pb-3 px-2 font-bold text-sm ${activeTab === 'orders' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500'}`}
//         >
//           Incoming Orders
//         </button>
//         <button 
//           onClick={() => setActiveTab('products')} 
//           className={`pb-3 px-2 font-bold text-sm ${activeTab === 'products' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500'}`}
//         >
//           Manage Products ({products.length})
//         </button>
//       </div>

//       {/* ORDERS TAB */}
//       {activeTab === 'orders' && (
//         <div className="space-y-6">
//           {/* Stats */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
//               <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><ClipboardList /></div>
//               <div><p className="text-slate-500 text-sm">Total Orders</p><h3 className="text-2xl font-bold text-slate-900">{orders.length}</h3></div>
//             </div>
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
//               <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><Package /></div>
//               <div><p className="text-slate-500 text-sm">Pending</p><h3 className="text-2xl font-bold text-slate-900">{pendingOrders}</h3></div>
//             </div>
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
//               <div className="p-3 bg-green-100 text-green-600 rounded-lg"><Users /></div>
//               <div><p className="text-slate-500 text-sm">Revenue (Est)</p><h3 className="text-2xl font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</h3></div>
//             </div>
//           </div>

//           {/* Table */}
//           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//             <div className="p-6 border-b border-slate-100">
//               <h3 className="font-bold text-lg text-slate-800">Recent Orders</h3>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full text-left text-sm">
//                 <thead className="bg-slate-50 text-slate-500 font-medium">
//                   <tr>
//                     <th className="p-4">ID</th>
//                     <th className="p-4">Customer</th>
//                     <th className="p-4">Type</th>
//                     <th className="p-4">Total</th>
//                     <th className="p-4">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100">
//                   {orders.length === 0 ? (
//                     <tr><td colSpan="5" className="p-8 text-center text-slate-400">No orders yet.</td></tr>
//                   ) : orders.map((order) => (
//                     <tr key={order.id} className="hover:bg-slate-50">
//                       <td className="p-4 font-mono text-xs">{order.id}</td>
//                       <td className="p-4 font-bold">{order.customer.name}</td>
//                       <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${order.type === 'wholesale' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{order.type}</span></td>
//                       <td className="p-4 font-bold">₹{order.total}</td>
//                       <td className="p-4"><span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold">{order.status}</span></td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* PRODUCTS TAB */}
//       {activeTab === 'products' && (
//         <div>
//           <div className="flex justify-between items-center mb-6">
//             <h3 className="text-xl font-bold text-slate-900">Product Inventory</h3>
//             {!showAddForm && (
//               <button onClick={() => setShowAddForm(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 flex items-center gap-2 shadow-lg">
//                 <Plus size={18} /> Add New Product
//               </button>
//             )}
//           </div>

//           {/* Add Product Form */}
//           {showAddForm && (
//             <div className="mb-8">
//               <ProductForm onSave={handleAddProduct} onCancel={() => setShowAddForm(false)} />
//             </div>
//           )}

//           {/* Product List */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {products.map(product => (
//               <div key={product.id} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 items-start shadow-sm hover:shadow-md transition">
//                 <img src={product.image} className="w-20 h-20 rounded-lg object-cover bg-slate-100" alt={product.name} />
//                 <div className="flex-1">
//                    <div className="flex justify-between items-start">
//                       <h4 className="font-bold text-slate-900 leading-tight">{product.name}</h4>
//                       <button onClick={() => handleDeleteProduct(product.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
//                    </div>
//                    <p className="text-xs text-slate-500 mb-2">{product.category}</p>
//                    <div className="flex gap-4 text-sm">
//                       <div><span className="text-[10px] text-slate-400 uppercase block">Retail</span><span className="font-bold">₹{product.retailPrice}</span></div>
//                       <div><span className="text-[10px] text-slate-400 uppercase block">Wholesale</span><span className="font-bold text-blue-600">₹{product.wholesalePrice}</span></div>
//                    </div>
//                    <div className="mt-2 text-[10px] text-slate-500 bg-slate-50 inline-block px-2 py-1 rounded">
//                      Sizes: {product.sizes.join(', ')}
//                    </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // --- VIEWS ---

// const ShopView = ({ products, mode, onAddToCart }) => {
//   const [filter, setFilter] = useState('All');
//   const [searchTerm, setSearchTerm] = useState('');
  
//   const filteredProducts = products.filter(p => {
//     const matchesCategory = filter === 'All' || p.category === filter;
//     const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
//         <div>
//           <h2 className="text-3xl font-bold text-slate-900">{mode === 'wholesale' ? 'Wholesale Catalog' : 'Shop Collection'}</h2>
//           <p className="text-slate-500 text-sm mt-1">{mode === 'wholesale' ? 'Bulk pricing applied. MOQ rules active.' : 'Latest trends from Agra.'}</p>
//         </div>
        
//         {/* Search Bar */}
//         <div className="relative w-full md:w-64">
//           <input 
//             type="text" 
//             placeholder="Search shoes..." 
//             className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
//         </div>
//       </div>

//       {/* Category Pills */}
//       <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4">
//         <Filter size={18} className="text-slate-400 shrink-0" />
//         {CATEGORIES.map(cat => (
//           <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${filter === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
//             {cat}
//           </button>
//         ))}
//       </div>

//       {filteredProducts.length === 0 ? (
//         <div className="text-center py-20 text-slate-400">No products found matching your search.</div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {filteredProducts.map(product => (
//             <ProductCard key={product.id} product={product} mode={mode} onAddToCart={onAddToCart} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// const HomeView = ({ setView, mode }) => (
//   <>
//     <div className="bg-white border-b border-slate-200">
//       <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row items-center gap-10">
//         <div className="flex-1 text-center md:text-left">
//           <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold mb-6">
//             <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
//             {mode === 'wholesale' ? 'ACCEPTING NEW DISTRIBUTORS' : 'SEASONAL SALE IS LIVE'}
//           </div>
//           <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
//             {mode === 'wholesale' ? <>Factory Direct.<br /><span className="text-blue-600">Maximize Margins.</span></> : <>Handcrafted in Agra.<br /><span className="text-red-600">Worn Everywhere.</span></>}
//           </h1>
//           <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
//             {mode === 'wholesale' ? 'Connect directly with our 20-year-old manufacturing unit. Get transparent pricing, bulk shipping support, and custom branding options.' : 'Discover the finest leather shoes directly from the shoe capital of India. Premium quality, honest prices, delivered to your doorstep.'}
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
//             <button onClick={() => setView('shop')} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2">
//               {mode === 'wholesale' ? 'View Catalog' : 'Shop Collection'} <ArrowRight size={18} />
//             </button>
//           </div>
//         </div>
        
//         <div className="flex-1 w-full max-w-md md:max-w-full">
//            <div className="relative">
//              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-amber-50 rounded-2xl transform rotate-3"></div>
//              <img 
//                src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop" 
//                alt="Shoe Craftsmanship" 
//                className="relative rounded-2xl shadow-2xl w-full h-auto object-cover transform -rotate-2 hover:rotate-0 transition duration-700"
//              />
//              {mode === 'wholesale' && (
//                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3">
//                  <div className="bg-green-100 p-2 rounded-full text-green-600"><CheckCircle size={24} /></div>
//                  <div>
//                    <p className="text-sm font-bold text-slate-800">Verified Manufacturer</p>
//                    <p className="text-xs text-slate-500">GST Registered • IEC License</p>
//                  </div>
//                </div>
//              )}
//            </div>
//         </div>
//       </div>
//     </div>
//     <Features />
//   </>
// );

// const CartView = ({ cart, mode, removeFromCart, setView }) => {
//   const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
//   const totalGST = mode === 'wholesale' ? totalAmount * 0.12 : 0; // 12% GST for wholesale
//   const finalTotal = totalAmount + totalGST;

//   if (cart.length === 0) return (
//     <div className="container mx-auto px-4 py-20 text-center">
//       <ShoppingCart size={64} className="mx-auto text-slate-200 mb-4" />
//       <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
//       <button onClick={() => setView('shop')} className="text-blue-600 font-medium hover:underline">Start Shopping</button>
//     </div>
//   );

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h2 className="text-2xl font-bold text-slate-900 mb-8">Shopping Cart ({cart.length} items)</h2>
//       <div className="flex flex-col lg:flex-row gap-8">
//         <div className="flex-1 space-y-4">
//           {cart.map((item, idx) => (
//             <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl flex gap-4">
//               <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg bg-slate-100" />
//               <div className="flex-1">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h3 className="font-bold text-slate-900">{item.name}</h3>
//                     <p className="text-sm text-slate-500">{item.category}</p>
//                   </div>
//                   <button onClick={() => removeFromCart(idx)} className="text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
//                 </div>
                
//                 {item.type === 'wholesale' ? (
//                    <div className="mt-2 bg-slate-50 p-2 rounded text-xs text-slate-600 grid grid-cols-5 gap-2">
//                      {Object.entries(item.breakdown).map(([size, qty]) => Number(qty) > 0 && (
//                        <div key={size} className="text-center bg-white border border-slate-200 rounded px-1">
//                          <span className="block text-[10px] text-slate-400">UK {size}</span>
//                          <span className="font-bold">{qty}</span>
//                        </div>
//                      ))}
//                    </div>
//                 ) : (
//                   <div className="mt-2 text-sm text-slate-600">Qty: {item.quantity} Pair</div>
//                 )}
                
//                 <div className="mt-3 flex justify-between items-center">
//                    <div className="text-xs text-slate-500">{item.quantity} pairs x ₹{item.price}</div>
//                    <div className="font-bold text-slate-900">₹{item.quantity * item.price}</div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="w-full lg:w-96">
//           <div className="bg-white border border-slate-200 p-6 rounded-xl sticky top-24 shadow-sm">
//             <h3 className="font-bold text-lg mb-4">Order Summary</h3>
//             <div className="space-y-3 mb-6">
//               <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹{totalAmount}</span></div>
//               {mode === 'wholesale' && (
//                 <div className="flex justify-between text-slate-600"><span>GST (12%)</span><span>₹{totalGST.toFixed(0)}</span></div>
//               )}
//               <div className="flex justify-between text-slate-600"><span>Shipping</span><span>{mode === 'wholesale' ? 'To be calculated' : 'Free'}</span></div>
//               <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-lg text-slate-900">
//                 <span>Total</span><span>₹{finalTotal.toFixed(0)}</span>
//               </div>
//             </div>
//             <button onClick={() => setView('checkout')} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg">
//               Proceed to Checkout
//             </button>
//             <p className="text-xs text-slate-400 text-center mt-3">Secure Checkout via Agra Shoe Mart</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const CheckoutView = ({ cart, mode, placeOrder, setView }) => {
//   const [form, setForm] = useState({ name: '', phone: '', address: '' });
  
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     placeOrder(form);
//   };

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-2xl">
//       <button onClick={() => setView('cart')} className="text-sm text-slate-500 hover:text-slate-900 mb-6">← Back to Cart</button>
//       <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
//         <h2 className="text-2xl font-bold text-slate-900 mb-6">{mode === 'wholesale' ? 'Request Bulk Quote' : 'Checkout'}</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Full Name / Shop Name</label>
//             <input required type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number (WhatsApp)</label>
//             <input required type="tel" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Address</label>
//             <textarea required rows="3" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.address} onChange={e => setForm({...form, address: e.target.value})}></textarea>
//           </div>
          
//           <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
//             {mode === 'wholesale' 
//               ? "Note: This is a quote request. Our sales team will contact you on WhatsApp to confirm availability and shipping costs before payment."
//               : "Note: Cash on Delivery is available for Agra. Online payment link will be sent for other cities."
//             }
//           </div>

//           <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-md">
//             {mode === 'wholesale' ? 'Submit Quote Request' : 'Place Order'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// const LoginView = ({ setMode, setView, setUser }) => {
//   const [email, setEmail] = useState('');
  
//   const handleLogin = (e) => {
//     e.preventDefault();
//     if (email.includes('admin')) {
//       setUser({ name: 'Owner', type: 'admin', email });
//       setView('admin');
//     } else {
//       setUser({ name: 'Verified Buyer', type: 'wholesale', email });
//       setMode('wholesale');
//       setView('shop');
//     }
//   };

//   return (
//     <div className="min-h-[60vh] flex items-center justify-center px-4">
//       <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-xl shadow-lg">
//         <div className="text-center mb-8">
//           <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white mx-auto mb-4"><Package size={32} /></div>
//           <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
//           <p className="text-slate-500 mt-2">Enter credentials to access your dashboard</p>
//         </div>
//         <form onSubmit={handleLogin} className="space-y-4">
//           <div>
//              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
//              <input type="email" required placeholder="admin@agra.com" className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500" value={email} onChange={e => setEmail(e.target.value)} />
//           </div>
//           <div>
//              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
//              <input type="password" placeholder="••••••••" className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
//           </div>
//           <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition">Login</button>
//         </form>
//         <p className="text-center text-xs text-slate-400 mt-6">Use 'admin@agra.com' for Owner view</p>
//       </div>
//     </div>
//   );
// };

// // --- MAIN CONTROLLER ---

// const App = () => {
//   const [view, setView] = useState('home');
//   const [mode, setMode] = useState('retail');
//   const [cart, setCart] = useState([]);
//   const [user, setUser] = useState(null);
//   const [products, setProducts] = useState(INITIAL_PRODUCTS); // LIFTED STATE FOR PRODUCTS
//   const [orders, setOrders] = useState([]);
//   const [showToast, setShowToast] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   // --- LOGOUT LOGIC ---
//   const handleLogout = () => {
//     if (window.confirm("Are you sure you want to logout?")) {
//       setUser(null);
//       setMode('retail'); // Reset to default retail mode
//       setView('home');   // Go to home
//     }
//   };
//   // --------------------

//   const addToCart = (item) => {
//     // --- AUTH GUARD ---
//     if (!user) {
//       alert("Please login to add items to your cart.");
//       setView('login');
//       return;
//     }
//     // ------------------

//     setCart([...cart, item]);
//     setShowToast(true);
//     setTimeout(() => setShowToast(false), 3000);
//   };

//   const removeFromCart = (index) => {
//     const newCart = [...cart];
//     newCart.splice(index, 1);
//     setCart(newCart);
//   };

//   const placeOrder = (customerDetails) => {
//     const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
//     const gst = mode === 'wholesale' ? total * 0.12 : 0;
    
//     const newOrder = {
//       id: 'ORD-' + Math.floor(Math.random() * 10000),
//       customer: customerDetails,
//       items: cart,
//       total: total + gst,
//       type: mode,
//       status: 'Pending',
//       date: new Date().toISOString()
//     };

//     setOrders([newOrder, ...orders]); // Save to "Database"
//     setCart([]);
//     setView('success');
//   };

//   const renderView = () => {
//     switch(view) {
//       case 'home': return <HomeView setView={setView} mode={mode} />;
//       case 'shop': return <ShopView products={products} mode={mode} onAddToCart={addToCart} />;
//       case 'cart': return <CartView cart={cart} mode={mode} removeFromCart={removeFromCart} setView={setView} />;
//       case 'checkout': return <CheckoutView cart={cart} mode={mode} placeOrder={placeOrder} setView={setView} />;
//       case 'login': return <LoginView setMode={setMode} setView={setView} setUser={setUser} />;
//       case 'admin': return <AdminDashboard orders={orders} products={products} setProducts={setProducts} setView={setView} onLogout={handleLogout} />;
//       case 'success': return (
//         <div className="container mx-auto px-4 py-20 text-center">
//           <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} /></div>
//           <h2 className="text-3xl font-bold text-slate-900 mb-4">{mode === 'wholesale' ? 'Quote Request Sent!' : 'Order Placed Successfully!'}</h2>
//           <p className="text-slate-600 max-w-md mx-auto mb-8">
//             {mode === 'wholesale' 
//               ? 'Our team will review your bulk requirement and send a proforma invoice via WhatsApp shortly.' 
//               : 'Thank you for shopping with Agra Shoe Mart. Your shoes will be dispatched within 24 hours.'}
//           </p>
//           <button onClick={() => setView('home')} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold">Return Home</button>
//         </div>
//       );
//       default: return <HomeView setView={setView} mode={mode} />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
//       {/* Navbar (Hidden in Admin Mode) */}
//       {view !== 'admin' && (
//         <nav className="bg-white shadow-md sticky top-0 z-50">
//           <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 flex justify-between items-center">
//             <span className="hidden sm:inline">Agra's Trusted Shoe Wholesaler - Since 2003</span>
//             <div className="flex items-center gap-4">
//               <span className="flex items-center gap-1 hover:text-white cursor-pointer transition">
//                 <Phone size={14} /> +91 98765-XXXXX
//               </span>
//               <span className="text-amber-500 font-bold cursor-pointer hover:underline hidden sm:block">
//                 Request Sample Kit
//               </span>
//             </div>
//           </div>

//           <div className="container mx-auto px-4 py-4">
//             <div className="flex justify-between items-center">
//               <div onClick={() => setView('home')} className="flex items-center gap-2 cursor-pointer">
//                 <div className="bg-red-600 text-white p-1 rounded font-bold text-xl">ASM</div>
//                 <div className="text-2xl font-bold tracking-tighter text-slate-800 leading-none">
//                   AGRA<span className="text-red-600">SHOES</span>
//                 </div>
//               </div>

//               <div className="hidden md:flex gap-8 font-medium text-slate-600 text-sm">
//                 <button onClick={() => setView('home')} className="hover:text-red-600 transition">Home</button>
//                 <button onClick={() => setView('shop')} className="hover:text-red-600 transition">Shop Catalog</button>
//                 <button onClick={() => setView('shop')} className="hover:text-red-600 transition">New Arrivals</button>
//               </div>

//               <div className="flex items-center gap-4">
//                 <div className="hidden md:flex bg-slate-100 rounded-full p-1 border border-slate-200 mr-2">
//                   <button onClick={() => setMode('retail')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${mode === 'retail' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Retail</button>
//                   <button onClick={() => setMode('wholesale')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${mode === 'wholesale' ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}>Wholesale</button>
//                 </div>

//                 <button onClick={() => setView('cart')} className="relative p-2 hover:bg-slate-100 rounded-full transition group">
//                   <ShoppingCart size={22} className="text-slate-700 group-hover:text-red-600" />
//                   {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">{cart.length}</span>}
//                 </button>
                
//                 {user ? (
//                   <div className="flex items-center gap-2">
//                     <button onClick={() => user.type === 'admin' ? setView('admin') : setView('home')} className="flex items-center gap-2 font-bold text-sm bg-slate-100 px-3 py-2 rounded-lg hover:bg-slate-200 transition">
//                       <User size={18}/> <span className="hidden sm:inline">{user.name}</span>
//                     </button>
//                     {/* LOGOUT BUTTON */}
//                     <button onClick={handleLogout} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition shadow-sm" title="Logout">
//                       <LogOut size={18} />
//                     </button>
//                   </div>
//                 ) : (
//                   <button onClick={() => setView('login')} className="hidden sm:flex bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm">Login</button>
//                 )}

//                 <button className="md:hidden text-slate-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
//                    {isMobileMenuOpen ? <X /> : <Menu />}
//                 </button>
//               </div>
//             </div>

//             {isMobileMenuOpen && (
//               <div className="md:hidden mt-4 pb-4 border-t pt-4">
//                  <div className="flex bg-slate-100 rounded-lg p-1 mb-4">
//                   <button onClick={() => { setMode('retail'); setIsMobileMenuOpen(false); }} className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === 'retail' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Retail</button>
//                   <button onClick={() => { setMode('wholesale'); setIsMobileMenuOpen(false); }} className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === 'wholesale' ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}>Wholesale</button>
//                 </div>
//                 <div className="space-y-3 text-slate-700 font-medium">
//                   <button onClick={() => { setView('home'); setIsMobileMenuOpen(false); }} className="block w-full text-left hover:text-red-600">Home</button>
//                   <button onClick={() => { setView('shop'); setIsMobileMenuOpen(false); }} className="block w-full text-left hover:text-red-600">Shop Catalog</button>
//                   <button onClick={() => { setView('login'); setIsMobileMenuOpen(false); }} className="block w-full text-left text-blue-600">Login / Register</button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </nav>
//       )}

//       <main className="flex-1">{renderView()}</main>

//       {view !== 'admin' && (
//         <footer className="bg-slate-900 text-slate-400 py-12">
//           <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
//             <div>
//               <h4 className="text-white font-bold text-lg mb-4">AGRA SHOES</h4>
//               <p className="mb-4">Digitizing the legacy of Agra's shoemaking. We connect manufacturers directly to retailers across India.</p>
//               <p>Agra, Uttar Pradesh, India - 282002</p>
//             </div>
//             <div>
//               <h4 className="text-white font-bold mb-4">Shop</h4>
//               <ul className="space-y-2">
//                 <li className="hover:text-white cursor-pointer">Men's Formal</li>
//                 <li className="hover:text-white cursor-pointer">Casual Loafers</li>
//                 <li className="hover:text-white cursor-pointer">Safety Shoes</li>
//                 <li className="hover:text-white cursor-pointer">School Shoes</li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="text-white font-bold mb-4">Wholesale</h4>
//               <ul className="space-y-2">
//                 <li className="hover:text-white cursor-pointer">Register as Distributor</li>
//                 <li className="hover:text-white cursor-pointer">Bulk Pricing Policy</li>
//                 <li className="hover:text-white cursor-pointer">Shipping & Logistics</li>
//                 <li className="hover:text-white cursor-pointer">Return Policy</li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="text-white font-bold mb-4">Stay Connected</h4>
//               <p className="mb-4">Get latest design updates on WhatsApp.</p>
//               <div className="flex gap-2">
//                 <input type="text" placeholder="+91 Mobile Number" className="bg-slate-800 border-none rounded px-3 py-2 w-full text-white outline-none focus:ring-1 focus:ring-slate-600" />
//                 <button className="bg-green-600 text-white px-3 py-2 rounded font-bold hover:bg-green-700">Join</button>
//               </div>
//             </div>
//           </div>
//           <div className="text-center mt-12 pt-8 border-t border-slate-800">
//             &copy; 2025 Agra Wholesale Shoe Mart. All rights reserved.
//           </div>
//         </footer>
//       )}

//       {showToast && (
//         <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-bounce z-50">
//           <CheckCircle size={20} className="text-green-400" />
//           <p className="font-bold text-sm">Added to Cart</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;
// import React, { useState } from 'react';
// import { 
//   ShoppingCart, User, Phone, Menu, X, CheckCircle, Truck, 
//   ShieldCheck, Info, Package, ArrowRight, Trash2, Filter, 
//   Search, ClipboardList, Users, LogOut, Plus, Save,
//   Tag, Layers, DollarSign
// } from 'lucide-react';

// // --- MOCK DATABASE ---
// // Note: Added 'sizes' array to support dynamic size ranges per product
// const INITIAL_PRODUCTS = [
//   { id: 1, name: 'Agra Classic Loafer', category: 'Men\'s Formal', retailPrice: 1499, wholesalePrice: 450, moq: 24, stock: 1000, sizes: [6,7,8,9,10], image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800&auto=format&fit=crop', tag: 'Best Seller' },
//   { id: 2, name: 'Genuine Leather Oxford', category: 'Office Wear', retailPrice: 2199, wholesalePrice: 750, moq: 12, stock: 500, sizes: [6,7,8,9,10], image: 'https://images.unsplash.com/photo-1478186172493-493ca852a743?q=80&w=800&auto=format&fit=crop', tag: 'Premium' },
//   { id: 3, name: 'Daily Soft Sandal', category: 'Women\'s Comfort', retailPrice: 899, wholesalePrice: 220, moq: 48, stock: 2000, sizes: [4,5,6,7,8], image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop', tag: 'High Demand' },
//   { id: 4, name: 'Rugged Chelsea Boot', category: 'Men\'s Boots', retailPrice: 2899, wholesalePrice: 950, moq: 12, stock: 300, sizes: [7,8,9,10,11], image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800&auto=format&fit=crop', tag: 'New Arrival' },
//   { id: 5, name: 'Canvas Sneaker', category: 'Casual', retailPrice: 999, wholesalePrice: 310, moq: 36, stock: 800, sizes: [6,7,8,9,10], image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop', tag: null },
//   { id: 6, name: 'Kids School Shoe', category: 'School', retailPrice: 699, wholesalePrice: 180, moq: 60, stock: 5000, sizes: [1,2,3,4,5], image: 'https://images.unsplash.com/photo-1515347619252-60a6bf4fffce?q=80&w=800&auto=format&fit=crop', tag: 'Back to School' },
// ];

// const CATEGORIES = ['All', 'Men\'s Formal', 'Office Wear', 'Women\'s Comfort', 'Men\'s Boots', 'Casual', 'School'];

// // Helper to generate random ID
// const generateId = () => Math.floor(Math.random() * 100000);

// // --- COMPONENTS ---

// // 1. Product Card (With Dynamic Size Matrix)
// const ProductCard = ({ product, mode, onAddToCart }) => {
//   const [showMatrix, setShowMatrix] = useState(false);
//   // Initialize quantities for dynamic sizes
//   const [quantities, setQuantities] = useState(
//     product.sizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {})
//   );
  
//   const totalPairs = Object.values(quantities).reduce((a, b) => a + Number(b), 0);
//   const matrixTotalCost = totalPairs * product.wholesalePrice;

//   const handleWholesaleAdd = () => {
//     if (totalPairs < product.moq) {
//       alert(`Minimum Order Quantity is ${product.moq} pairs.`);
//       return;
//     }
//     onAddToCart({
//       ...product,
//       type: 'wholesale',
//       breakdown: quantities,
//       quantity: totalPairs,
//       price: product.wholesalePrice
//     });
//     // Reset
//     setQuantities(product.sizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {}));
//     setShowMatrix(false);
//   };

//   const handleRetailAdd = () => {
//     onAddToCart({
//       ...product,
//       type: 'retail',
//       quantity: 1,
//       price: product.retailPrice
//     });
//   };

//   return (
//     <div className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
//       <div className="relative h-64 overflow-hidden bg-slate-100">
//         <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
//         {product.tag && <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] uppercase font-bold px-2 py-1 rounded backdrop-blur-sm">{product.tag}</span>}
//         {mode === 'wholesale' && <span className="absolute top-2 left-2 bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm">MOQ: {product.moq}</span>}
//       </div>

//       <div className="p-4 flex-1 flex flex-col">
//         <div className="mb-2">
//           <span className="text-xs text-slate-500 uppercase tracking-wide">{product.category}</span>
//           <h3 className="text-lg font-bold text-slate-800 leading-tight">{product.name}</h3>
//         </div>
        
//         <div className="mt-auto pt-4 border-t border-slate-100">
//           <div className="flex justify-between items-end mb-4">
//             <div>
//               <p className="text-xs text-slate-500 mb-0.5">Price per pair</p>
//               <div className="flex items-baseline gap-2">
//                 <span className="text-xl font-bold text-slate-900">₹{mode === 'retail' ? product.retailPrice : product.wholesalePrice}</span>
//                 {mode === 'retail' && <span className="text-xs text-red-500 line-through">₹{Math.floor(product.retailPrice * 1.2)}</span>}
//               </div>
//               {mode === 'wholesale' && <p className="text-[10px] text-red-600 font-medium">*Excl. GST</p>}
//             </div>
            
//             {mode === 'retail' ? (
//               <button onClick={handleRetailAdd} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-200">Add</button>
//             ) : (
//               <button onClick={() => setShowMatrix(!showMatrix)} className={`px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg ${showMatrix ? 'bg-slate-200 text-slate-800' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}>{showMatrix ? 'Close' : 'Bulk'}</button>
//             )}
//           </div>

//           {mode === 'wholesale' && showMatrix && (
//             <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2">
//               <div className="flex justify-between items-center mb-2">
//                  <span className="text-[10px] font-bold text-slate-500">SELECT SIZES</span>
//               </div>
//               <div className="grid grid-cols-5 gap-1 mb-3">
//                 {product.sizes.map((size) => (
//                   <div key={size} className="text-center">
//                     <label className="block text-[10px] text-slate-500">UK {size}</label>
//                     <input type="number" min="0" value={quantities[size] || ''} onChange={(e) => setQuantities(prev => ({...prev, [size]: e.target.value}))} className="w-full border border-slate-300 rounded p-1 text-center text-xs" placeholder="0" />
//                   </div>
//                 ))}
//               </div>
//               <div className="flex justify-between text-xs mb-2">
//                 <span>Pairs: <strong>{totalPairs}</strong></span>
//                 <span>Total: <strong className="text-blue-600">₹{matrixTotalCost}</strong></span>
//               </div>
//               <button onClick={handleWholesaleAdd} disabled={totalPairs === 0} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white py-1.5 rounded text-xs font-bold uppercase">Add Batch</button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // 2. Features Section
// const Features = () => (
//   <div className="bg-slate-50 py-12 border-y border-slate-200">
//     <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-blue-600">
//           <Truck />
//         </div>
//         <h3 className="font-bold text-slate-800 mb-2">Nationwide Delivery</h3>
//         <p className="text-sm text-slate-500 px-4">From Agra to anywhere in India. We use trusted B2B logistics partners.</p>
//       </div>
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-amber-500">
//           <ShieldCheck />
//         </div>
//         <h3 className="font-bold text-slate-800 mb-2">Quality Guarantee</h3>
//         <p className="text-sm text-slate-500 px-4">Every pair is inspected before packing. 20 years of reputation at stake.</p>
//       </div>
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-red-600">
//           <Info />
//         </div>
//         <h3 className="font-bold text-slate-800 mb-2">Direct Support</h3>
//         <p className="text-sm text-slate-500 px-4">Call us anytime. We believe in building relationships, not just sales.</p>
//       </div>
//     </div>
//   </div>
// );

// // --- ADMIN COMPONENTS ---

// const ProductForm = ({ onSave, onCancel }) => {
//   const [formData, setFormData] = useState({
//     name: '', category: 'Men\'s Formal', retailPrice: '', wholesalePrice: '', 
//     moq: 24, sizes: '6,7,8,9,10', tag: '', 
//     image: 'https://images.unsplash.com/photo-1560769629-975e13f0c470?q=80&w=800&auto=format&fit=crop'
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const newProduct = {
//       ...formData,
//       id: generateId(),
//       retailPrice: Number(formData.retailPrice),
//       wholesalePrice: Number(formData.wholesalePrice),
//       moq: Number(formData.moq),
//       sizes: formData.sizes.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n))
//     };
//     onSave(newProduct);
//   };

//   const fillRandomImage = () => {
//     const urls = [
//       'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800',
//       'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800',
//       'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=800',
//       'https://images.unsplash.com/photo-1560769629-975e13f0c470?q=80&w=800'
//     ];
//     setFormData({...formData, image: urls[Math.floor(Math.random() * urls.length)]});
//   };

//   return (
//     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg animate-in fade-in slide-in-from-bottom-4">
//       <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
//         <Plus className="text-green-600" /> Add New Product
//       </h3>
//       <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {/* Name */}
//         <div className="md:col-span-2">
//           <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Product Name</label>
//           <input required type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-slate-900 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Leather Oxford Pro" />
//         </div>
        
//         {/* Category */}
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Category</label>
//            <select className="w-full border p-2 rounded outline-none bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
//              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
//            </select>
//         </div>

//         {/* Sizes */}
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Available Sizes (Comma Sep)</label>
//            <input required type="text" className="w-full border p-2 rounded outline-none" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} placeholder="6,7,8,9,10" />
//         </div>

//         {/* Pricing */}
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Retail Price (₹)</label>
//            <input required type="number" className="w-full border p-2 rounded outline-none" value={formData.retailPrice} onChange={e => setFormData({...formData, retailPrice: e.target.value})} />
//         </div>
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Wholesale Price (₹)</label>
//            <input required type="number" className="w-full border p-2 rounded outline-none" value={formData.wholesalePrice} onChange={e => setFormData({...formData, wholesalePrice: e.target.value})} />
//         </div>

//         {/* MOQ & Tag */}
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Min Order Qty</label>
//            <input required type="number" className="w-full border p-2 rounded outline-none" value={formData.moq} onChange={e => setFormData({...formData, moq: e.target.value})} />
//         </div>
//         <div>
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Marketing Tag (Optional)</label>
//            <input type="text" className="w-full border p-2 rounded outline-none" value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})} placeholder="e.g. New Arrival" />
//         </div>

//         {/* Image URL */}
//         <div className="md:col-span-2">
//            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Image URL</label>
//            <div className="flex gap-2">
//              <input required type="text" className="w-full border p-2 rounded outline-none" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
//              <button type="button" onClick={fillRandomImage} className="bg-slate-100 px-3 rounded text-xs font-bold hover:bg-slate-200 whitespace-nowrap">Random Image</button>
//            </div>
//         </div>

//         {/* Actions */}
//         <div className="md:col-span-2 flex gap-3 mt-2">
//           <button type="button" onClick={onCancel} className="flex-1 py-2 border border-slate-300 rounded text-slate-600 font-bold hover:bg-slate-50">Cancel</button>
//           <button type="submit" className="flex-1 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 flex justify-center items-center gap-2"><Save size={18}/> Save Product</button>
//         </div>
//       </form>
//     </div>
//   );
// };

// const AdminDashboard = ({ orders, products, setProducts, setView }) => {
//   const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'products'
//   const [showAddForm, setShowAddForm] = useState(false);

//   const pendingOrders = orders.filter(o => o.status === 'Pending').length;
//   const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);

//   const handleAddProduct = (newProduct) => {
//     setProducts([newProduct, ...products]);
//     setShowAddForm(false);
//     alert("Product Added Successfully!");
//   };

//   const handleDeleteProduct = (id) => {
//     if (window.confirm("Are you sure you want to delete this product?")) {
//       setProducts(products.filter(p => p.id !== id));
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8 bg-slate-50 min-h-screen">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
//         <div>
//            <h2 className="text-2xl font-bold text-slate-900">Owner Dashboard</h2>
//            <p className="text-sm text-slate-500">Manage Orders & Inventory</p>
//         </div>
//         <div className="flex gap-3">
//           <button onClick={() => setView('home')} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2 font-medium">
//             <LogOut size={16}/> Exit
//           </button>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="flex gap-4 mb-6 border-b border-slate-200">
//         <button 
//           onClick={() => setActiveTab('orders')} 
//           className={`pb-3 px-2 font-bold text-sm ${activeTab === 'orders' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500'}`}
//         >
//           Incoming Orders
//         </button>
//         <button 
//           onClick={() => setActiveTab('products')} 
//           className={`pb-3 px-2 font-bold text-sm ${activeTab === 'products' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500'}`}
//         >
//           Manage Products ({products.length})
//         </button>
//       </div>

//       {/* ORDERS TAB */}
//       {activeTab === 'orders' && (
//         <div className="space-y-6">
//           {/* Stats */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
//               <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><ClipboardList /></div>
//               <div><p className="text-slate-500 text-sm">Total Orders</p><h3 className="text-2xl font-bold text-slate-900">{orders.length}</h3></div>
//             </div>
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
//               <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><Package /></div>
//               <div><p className="text-slate-500 text-sm">Pending</p><h3 className="text-2xl font-bold text-slate-900">{pendingOrders}</h3></div>
//             </div>
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
//               <div className="p-3 bg-green-100 text-green-600 rounded-lg"><Users /></div>
//               <div><p className="text-slate-500 text-sm">Revenue (Est)</p><h3 className="text-2xl font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</h3></div>
//             </div>
//           </div>

//           {/* Table */}
//           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//             <div className="p-6 border-b border-slate-100">
//               <h3 className="font-bold text-lg text-slate-800">Recent Orders</h3>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full text-left text-sm">
//                 <thead className="bg-slate-50 text-slate-500 font-medium">
//                   <tr>
//                     <th className="p-4">ID</th>
//                     <th className="p-4">Customer</th>
//                     <th className="p-4">Type</th>
//                     <th className="p-4">Total</th>
//                     <th className="p-4">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100">
//                   {orders.length === 0 ? (
//                     <tr><td colSpan="5" className="p-8 text-center text-slate-400">No orders yet.</td></tr>
//                   ) : orders.map((order) => (
//                     <tr key={order.id} className="hover:bg-slate-50">
//                       <td className="p-4 font-mono text-xs">{order.id}</td>
//                       <td className="p-4 font-bold">{order.customer.name}</td>
//                       <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${order.type === 'wholesale' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{order.type}</span></td>
//                       <td className="p-4 font-bold">₹{order.total}</td>
//                       <td className="p-4"><span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold">{order.status}</span></td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* PRODUCTS TAB */}
//       {activeTab === 'products' && (
//         <div>
//           <div className="flex justify-between items-center mb-6">
//             <h3 className="text-xl font-bold text-slate-900">Product Inventory</h3>
//             {!showAddForm && (
//               <button onClick={() => setShowAddForm(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 flex items-center gap-2 shadow-lg">
//                 <Plus size={18} /> Add New Product
//               </button>
//             )}
//           </div>

//           {/* Add Product Form */}
//           {showAddForm && (
//             <div className="mb-8">
//               <ProductForm onSave={handleAddProduct} onCancel={() => setShowAddForm(false)} />
//             </div>
//           )}

//           {/* Product List */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {products.map(product => (
//               <div key={product.id} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 items-start shadow-sm hover:shadow-md transition">
//                 <img src={product.image} className="w-20 h-20 rounded-lg object-cover bg-slate-100" alt={product.name} />
//                 <div className="flex-1">
//                    <div className="flex justify-between items-start">
//                       <h4 className="font-bold text-slate-900 leading-tight">{product.name}</h4>
//                       <button onClick={() => handleDeleteProduct(product.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
//                    </div>
//                    <p className="text-xs text-slate-500 mb-2">{product.category}</p>
//                    <div className="flex gap-4 text-sm">
//                       <div><span className="text-[10px] text-slate-400 uppercase block">Retail</span><span className="font-bold">₹{product.retailPrice}</span></div>
//                       <div><span className="text-[10px] text-slate-400 uppercase block">Wholesale</span><span className="font-bold text-blue-600">₹{product.wholesalePrice}</span></div>
//                    </div>
//                    <div className="mt-2 text-[10px] text-slate-500 bg-slate-50 inline-block px-2 py-1 rounded">
//                      Sizes: {product.sizes.join(', ')}
//                    </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // --- VIEWS ---

// const ShopView = ({ products, mode, onAddToCart }) => {
//   const [filter, setFilter] = useState('All');
//   const [searchTerm, setSearchTerm] = useState('');
  
//   const filteredProducts = products.filter(p => {
//     const matchesCategory = filter === 'All' || p.category === filter;
//     const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
//         <div>
//           <h2 className="text-3xl font-bold text-slate-900">{mode === 'wholesale' ? 'Wholesale Catalog' : 'Shop Collection'}</h2>
//           <p className="text-slate-500 text-sm mt-1">{mode === 'wholesale' ? 'Bulk pricing applied. MOQ rules active.' : 'Latest trends from Agra.'}</p>
//         </div>
        
//         {/* Search Bar */}
//         <div className="relative w-full md:w-64">
//           <input 
//             type="text" 
//             placeholder="Search shoes..." 
//             className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
//         </div>
//       </div>

//       {/* Category Pills */}
//       <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4">
//         <Filter size={18} className="text-slate-400 shrink-0" />
//         {CATEGORIES.map(cat => (
//           <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${filter === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
//             {cat}
//           </button>
//         ))}
//       </div>

//       {filteredProducts.length === 0 ? (
//         <div className="text-center py-20 text-slate-400">No products found matching your search.</div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {filteredProducts.map(product => (
//             <ProductCard key={product.id} product={product} mode={mode} onAddToCart={onAddToCart} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// const HomeView = ({ setView, mode }) => (
//   <>
//     <div className="bg-white border-b border-slate-200">
//       <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row items-center gap-10">
//         <div className="flex-1 text-center md:text-left">
//           <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold mb-6">
//             <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
//             {mode === 'wholesale' ? 'ACCEPTING NEW DISTRIBUTORS' : 'SEASONAL SALE IS LIVE'}
//           </div>
//           <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
//             {mode === 'wholesale' ? <>Factory Direct.<br /><span className="text-blue-600">Maximize Margins.</span></> : <>Handcrafted in Agra.<br /><span className="text-red-600">Worn Everywhere.</span></>}
//           </h1>
//           <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
//             {mode === 'wholesale' ? 'Connect directly with our 20-year-old manufacturing unit. Get transparent pricing, bulk shipping support, and custom branding options.' : 'Discover the finest leather shoes directly from the shoe capital of India. Premium quality, honest prices, delivered to your doorstep.'}
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
//             <button onClick={() => setView('shop')} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2">
//               {mode === 'wholesale' ? 'View Catalog' : 'Shop Collection'} <ArrowRight size={18} />
//             </button>
//           </div>
//         </div>
        
//         <div className="flex-1 w-full max-w-md md:max-w-full">
//            <div className="relative">
//              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-amber-50 rounded-2xl transform rotate-3"></div>
//              <img 
//                src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop" 
//                alt="Shoe Craftsmanship" 
//                className="relative rounded-2xl shadow-2xl w-full h-auto object-cover transform -rotate-2 hover:rotate-0 transition duration-700"
//              />
//              {mode === 'wholesale' && (
//                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3">
//                  <div className="bg-green-100 p-2 rounded-full text-green-600"><CheckCircle size={24} /></div>
//                  <div>
//                    <p className="text-sm font-bold text-slate-800">Verified Manufacturer</p>
//                    <p className="text-xs text-slate-500">GST Registered • IEC License</p>
//                  </div>
//                </div>
//              )}
//            </div>
//         </div>
//       </div>
//     </div>
//     <Features />
//   </>
// );

// const CartView = ({ cart, mode, removeFromCart, setView }) => {
//   const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
//   const totalGST = mode === 'wholesale' ? totalAmount * 0.12 : 0; // 12% GST for wholesale
//   const finalTotal = totalAmount + totalGST;

//   if (cart.length === 0) return (
//     <div className="container mx-auto px-4 py-20 text-center">
//       <ShoppingCart size={64} className="mx-auto text-slate-200 mb-4" />
//       <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
//       <button onClick={() => setView('shop')} className="text-blue-600 font-medium hover:underline">Start Shopping</button>
//     </div>
//   );

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h2 className="text-2xl font-bold text-slate-900 mb-8">Shopping Cart ({cart.length} items)</h2>
//       <div className="flex flex-col lg:flex-row gap-8">
//         <div className="flex-1 space-y-4">
//           {cart.map((item, idx) => (
//             <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl flex gap-4">
//               <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg bg-slate-100" />
//               <div className="flex-1">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h3 className="font-bold text-slate-900">{item.name}</h3>
//                     <p className="text-sm text-slate-500">{item.category}</p>
//                   </div>
//                   <button onClick={() => removeFromCart(idx)} className="text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
//                 </div>
                
//                 {item.type === 'wholesale' ? (
//                    <div className="mt-2 bg-slate-50 p-2 rounded text-xs text-slate-600 grid grid-cols-5 gap-2">
//                      {Object.entries(item.breakdown).map(([size, qty]) => Number(qty) > 0 && (
//                        <div key={size} className="text-center bg-white border border-slate-200 rounded px-1">
//                          <span className="block text-[10px] text-slate-400">UK {size}</span>
//                          <span className="font-bold">{qty}</span>
//                        </div>
//                      ))}
//                    </div>
//                 ) : (
//                   <div className="mt-2 text-sm text-slate-600">Qty: {item.quantity} Pair</div>
//                 )}
                
//                 <div className="mt-3 flex justify-between items-center">
//                    <div className="text-xs text-slate-500">{item.quantity} pairs x ₹{item.price}</div>
//                    <div className="font-bold text-slate-900">₹{item.quantity * item.price}</div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="w-full lg:w-96">
//           <div className="bg-white border border-slate-200 p-6 rounded-xl sticky top-24 shadow-sm">
//             <h3 className="font-bold text-lg mb-4">Order Summary</h3>
//             <div className="space-y-3 mb-6">
//               <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹{totalAmount}</span></div>
//               {mode === 'wholesale' && (
//                 <div className="flex justify-between text-slate-600"><span>GST (12%)</span><span>₹{totalGST.toFixed(0)}</span></div>
//               )}
//               <div className="flex justify-between text-slate-600"><span>Shipping</span><span>{mode === 'wholesale' ? 'To be calculated' : 'Free'}</span></div>
//               <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-lg text-slate-900">
//                 <span>Total</span><span>₹{finalTotal.toFixed(0)}</span>
//               </div>
//             </div>
//             <button onClick={() => setView('checkout')} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg">
//               Proceed to Checkout
//             </button>
//             <p className="text-xs text-slate-400 text-center mt-3">Secure Checkout via Agra Shoe Mart</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const CheckoutView = ({ cart, mode, placeOrder, setView }) => {
//   const [form, setForm] = useState({ name: '', phone: '', address: '' });
  
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     placeOrder(form);
//   };

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-2xl">
//       <button onClick={() => setView('cart')} className="text-sm text-slate-500 hover:text-slate-900 mb-6">← Back to Cart</button>
//       <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
//         <h2 className="text-2xl font-bold text-slate-900 mb-6">{mode === 'wholesale' ? 'Request Bulk Quote' : 'Checkout'}</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Full Name / Shop Name</label>
//             <input required type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number (WhatsApp)</label>
//             <input required type="tel" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Address</label>
//             <textarea required rows="3" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.address} onChange={e => setForm({...form, address: e.target.value})}></textarea>
//           </div>
          
//           <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
//             {mode === 'wholesale' 
//               ? "Note: This is a quote request. Our sales team will contact you on WhatsApp to confirm availability and shipping costs before payment."
//               : "Note: Cash on Delivery is available for Agra. Online payment link will be sent for other cities."
//             }
//           </div>

//           <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-md">
//             {mode === 'wholesale' ? 'Submit Quote Request' : 'Place Order'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// const LoginView = ({ setMode, setView, setUser }) => {
//   const [email, setEmail] = useState('');
  
//   const handleLogin = (e) => {
//     e.preventDefault();
//     if (email.includes('admin')) {
//       setUser({ name: 'Owner', type: 'admin', email });
//       setView('admin');
//     } else {
//       setUser({ name: 'Verified Buyer', type: 'wholesale', email });
//       setMode('wholesale');
//       setView('shop');
//     }
//   };

//   return (
//     <div className="min-h-[60vh] flex items-center justify-center px-4">
//       <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-xl shadow-lg">
//         <div className="text-center mb-8">
//           <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white mx-auto mb-4"><Package size={32} /></div>
//           <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
//           <p className="text-slate-500 mt-2">Enter credentials to access your dashboard</p>
//         </div>
//         <form onSubmit={handleLogin} className="space-y-4">
//           <div>
//              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
//              <input type="email" required placeholder="admin@agra.com" className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500" value={email} onChange={e => setEmail(e.target.value)} />
//           </div>
//           <div>
//              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
//              <input type="password" placeholder="••••••••" className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
//           </div>
//           <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition">Login</button>
//         </form>
//         <p className="text-center text-xs text-slate-400 mt-6">Use 'admin@agra.com' for Owner view</p>
//       </div>
//     </div>
//   );
// };

// // --- MAIN CONTROLLER ---

// const App = () => {
//   const [view, setView] = useState('home');
//   const [mode, setMode] = useState('retail');
//   const [cart, setCart] = useState([]);
//   const [user, setUser] = useState(null);
//   const [products, setProducts] = useState(INITIAL_PRODUCTS); // LIFTED STATE FOR PRODUCTS
//   const [orders, setOrders] = useState([]);
//   const [showToast, setShowToast] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   const addToCart = (item) => {
//     // --- AUTH GUARD ---
//     if (!user) {
//       alert("Please login to add items to your cart.");
//       setView('login');
//       return;
//     }
//     // ------------------

//     setCart([...cart, item]);
//     setShowToast(true);
//     setTimeout(() => setShowToast(false), 3000);
//   };

//   const removeFromCart = (index) => {
//     const newCart = [...cart];
//     newCart.splice(index, 1);
//     setCart(newCart);
//   };

//   const placeOrder = (customerDetails) => {
//     const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
//     const gst = mode === 'wholesale' ? total * 0.12 : 0;
    
//     const newOrder = {
//       id: 'ORD-' + Math.floor(Math.random() * 10000),
//       customer: customerDetails,
//       items: cart,
//       total: total + gst,
//       type: mode,
//       status: 'Pending',
//       date: new Date().toISOString()
//     };

//     setOrders([newOrder, ...orders]); // Save to "Database"
//     setCart([]);
//     setView('success');
//   };

//   const renderView = () => {
//     switch(view) {
//       case 'home': return <HomeView setView={setView} mode={mode} />;
//       case 'shop': return <ShopView products={products} mode={mode} onAddToCart={addToCart} />;
//       case 'cart': return <CartView cart={cart} mode={mode} removeFromCart={removeFromCart} setView={setView} />;
//       case 'checkout': return <CheckoutView cart={cart} mode={mode} placeOrder={placeOrder} setView={setView} />;
//       case 'login': return <LoginView setMode={setMode} setView={setView} setUser={setUser} />;
//       case 'admin': return <AdminDashboard orders={orders} products={products} setProducts={setProducts} setView={setView} />;
//       case 'success': return (
//         <div className="container mx-auto px-4 py-20 text-center">
//           <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} /></div>
//           <h2 className="text-3xl font-bold text-slate-900 mb-4">{mode === 'wholesale' ? 'Quote Request Sent!' : 'Order Placed Successfully!'}</h2>
//           <p className="text-slate-600 max-w-md mx-auto mb-8">
//             {mode === 'wholesale' 
//               ? 'Our team will review your bulk requirement and send a proforma invoice via WhatsApp shortly.' 
//               : 'Thank you for shopping with Agra Shoe Mart. Your shoes will be dispatched within 24 hours.'}
//           </p>
//           <button onClick={() => setView('home')} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold">Return Home</button>
//         </div>
//       );
//       default: return <HomeView setView={setView} mode={mode} />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
//       {/* Navbar (Hidden in Admin Mode) */}
//       {view !== 'admin' && (
//         <nav className="bg-white shadow-md sticky top-0 z-50">
//           <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 flex justify-between items-center">
//             <span className="hidden sm:inline">Agra's Trusted Shoe Wholesaler - Since 2003</span>
//             <div className="flex items-center gap-4">
//               <span className="flex items-center gap-1 hover:text-white cursor-pointer transition">
//                 <Phone size={14} /> +91 98765-XXXXX
//               </span>
//               <span className="text-amber-500 font-bold cursor-pointer hover:underline hidden sm:block">
//                 Request Sample Kit
//               </span>
//             </div>
//           </div>

//           <div className="container mx-auto px-4 py-4">
//             <div className="flex justify-between items-center">
//               <div onClick={() => setView('home')} className="flex items-center gap-2 cursor-pointer">
//                 <div className="bg-red-600 text-white p-1 rounded font-bold text-xl">ASM</div>
//                 <div className="text-2xl font-bold tracking-tighter text-slate-800 leading-none">
//                   AGRA<span className="text-red-600">SHOES</span>
//                 </div>
//               </div>

//               <div className="hidden md:flex gap-8 font-medium text-slate-600 text-sm">
//                 <button onClick={() => setView('home')} className="hover:text-red-600 transition">Home</button>
//                 <button onClick={() => setView('shop')} className="hover:text-red-600 transition">Shop Catalog</button>
//                 <button onClick={() => setView('shop')} className="hover:text-red-600 transition">New Arrivals</button>
//               </div>

//               <div className="flex items-center gap-4">
//                 <div className="hidden md:flex bg-slate-100 rounded-full p-1 border border-slate-200 mr-2">
//                   <button onClick={() => setMode('retail')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${mode === 'retail' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Retail</button>
//                   <button onClick={() => setMode('wholesale')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${mode === 'wholesale' ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}>Wholesale</button>
//                 </div>

//                 <button onClick={() => setView('cart')} className="relative p-2 hover:bg-slate-100 rounded-full transition group">
//                   <ShoppingCart size={22} className="text-slate-700 group-hover:text-red-600" />
//                   {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">{cart.length}</span>}
//                 </button>
                
//                 {user ? (
//                   <button onClick={() => user.type === 'admin' ? setView('admin') : setView('home')} className="flex items-center gap-2 font-bold text-sm bg-slate-100 px-3 py-2 rounded-lg hover:bg-slate-200 transition">
//                     <User size={18}/> <span className="hidden sm:inline">{user.name}</span>
//                   </button>
//                 ) : (
//                   <button onClick={() => setView('login')} className="hidden sm:flex bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm">Login</button>
//                 )}

//                 <button className="md:hidden text-slate-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
//                    {isMobileMenuOpen ? <X /> : <Menu />}
//                 </button>
//               </div>
//             </div>

//             {isMobileMenuOpen && (
//               <div className="md:hidden mt-4 pb-4 border-t pt-4">
//                  <div className="flex bg-slate-100 rounded-lg p-1 mb-4">
//                   <button onClick={() => { setMode('retail'); setIsMobileMenuOpen(false); }} className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === 'retail' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Retail</button>
//                   <button onClick={() => { setMode('wholesale'); setIsMobileMenuOpen(false); }} className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === 'wholesale' ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}>Wholesale</button>
//                 </div>
//                 <div className="space-y-3 text-slate-700 font-medium">
//                   <button onClick={() => { setView('home'); setIsMobileMenuOpen(false); }} className="block w-full text-left hover:text-red-600">Home</button>
//                   <button onClick={() => { setView('shop'); setIsMobileMenuOpen(false); }} className="block w-full text-left hover:text-red-600">Shop Catalog</button>
//                   <button onClick={() => { setView('login'); setIsMobileMenuOpen(false); }} className="block w-full text-left text-blue-600">Login / Register</button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </nav>
//       )}

//       <main className="flex-1">{renderView()}</main>

//       {view !== 'admin' && (
//         <footer className="bg-slate-900 text-slate-400 py-12">
//           <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
//             <div>
//               <h4 className="text-white font-bold text-lg mb-4">AGRA SHOES</h4>
//               <p className="mb-4">Digitizing the legacy of Agra's shoemaking. We connect manufacturers directly to retailers across India.</p>
//               <p>Agra, Uttar Pradesh, India - 282002</p>
//             </div>
//             <div>
//               <h4 className="text-white font-bold mb-4">Shop</h4>
//               <ul className="space-y-2">
//                 <li className="hover:text-white cursor-pointer">Men's Formal</li>
//                 <li className="hover:text-white cursor-pointer">Casual Loafers</li>
//                 <li className="hover:text-white cursor-pointer">Safety Shoes</li>
//                 <li className="hover:text-white cursor-pointer">School Shoes</li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="text-white font-bold mb-4">Wholesale</h4>
//               <ul className="space-y-2">
//                 <li className="hover:text-white cursor-pointer">Register as Distributor</li>
//                 <li className="hover:text-white cursor-pointer">Bulk Pricing Policy</li>
//                 <li className="hover:text-white cursor-pointer">Shipping & Logistics</li>
//                 <li className="hover:text-white cursor-pointer">Return Policy</li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="text-white font-bold mb-4">Stay Connected</h4>
//               <p className="mb-4">Get latest design updates on WhatsApp.</p>
//               <div className="flex gap-2">
//                 <input type="text" placeholder="+91 Mobile Number" className="bg-slate-800 border-none rounded px-3 py-2 w-full text-white outline-none focus:ring-1 focus:ring-slate-600" />
//                 <button className="bg-green-600 text-white px-3 py-2 rounded font-bold hover:bg-green-700">Join</button>
//               </div>
//             </div>
//           </div>
//           <div className="text-center mt-12 pt-8 border-t border-slate-800">
//             &copy; 2025 Agra Wholesale Shoe Mart. All rights reserved.
//           </div>
//         </footer>
//       )}

//       {showToast && (
//         <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-bounce z-50">
//           <CheckCircle size={20} className="text-green-400" />
//           <p className="font-bold text-sm">Added to Cart</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;
// import React, { useState } from 'react';
// import { 
//   ShoppingCart, User, Phone, Menu, X, CheckCircle, Truck, 
//   ShieldCheck, Info, Package, ArrowRight, Trash2, Filter, 
//   Search, ClipboardList, Users, LogOut
// } from 'lucide-react';

// // --- MOCK DATABASE (Simulating a Backend) ---
// const INITIAL_PRODUCTS = [
//   { id: 1, name: 'Agra Classic Loafer', category: 'Men\'s Formal', retailPrice: 1499, wholesalePrice: 450, moq: 24, stock: 1000, image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800&auto=format&fit=crop', tag: 'Best Seller' },
//   { id: 2, name: 'Genuine Leather Oxford', category: 'Office Wear', retailPrice: 2199, wholesalePrice: 750, moq: 12, stock: 500, image: 'https://images.unsplash.com/photo-1478186172493-493ca852a743?q=80&w=800&auto=format&fit=crop', tag: 'Premium' },
//   { id: 3, name: 'Daily Soft Sandal', category: 'Women\'s Comfort', retailPrice: 899, wholesalePrice: 220, moq: 48, stock: 2000, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop', tag: 'High Demand' },
//   { id: 4, name: 'Rugged Chelsea Boot', category: 'Men\'s Boots', retailPrice: 2899, wholesalePrice: 950, moq: 12, stock: 300, image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800&auto=format&fit=crop', tag: 'New Arrival' },
//   { id: 5, name: 'Canvas Sneaker', category: 'Casual', retailPrice: 999, wholesalePrice: 310, moq: 36, stock: 800, image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop', tag: null },
//   { id: 6, name: 'Kids School Shoe', category: 'School', retailPrice: 699, wholesalePrice: 180, moq: 60, stock: 5000, image: 'https://images.unsplash.com/photo-1515347619252-60a6bf4fffce?q=80&w=800&auto=format&fit=crop', tag: 'Back to School' },
// ];

// const CATEGORIES = ['All', 'Men\'s Formal', 'Office Wear', 'Women\'s Comfort', 'Men\'s Boots', 'Casual', 'School'];

// // --- COMPONENTS ---

// // 1. Product Card (With Efficiency Matrix)
// const ProductCard = ({ product, mode, onAddToCart }) => {
//   const [showMatrix, setShowMatrix] = useState(false);
//   const [quantities, setQuantities] = useState({ 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 });
  
//   const totalPairs = Object.values(quantities).reduce((a, b) => a + Number(b), 0);
//   const matrixTotalCost = totalPairs * product.wholesalePrice;

//   const handleWholesaleAdd = () => {
//     if (totalPairs < product.moq) {
//       alert(`Minimum Order Quantity is ${product.moq} pairs.`);
//       return;
//     }
//     onAddToCart({
//       ...product,
//       type: 'wholesale',
//       breakdown: quantities,
//       quantity: totalPairs,
//       price: product.wholesalePrice
//     });
//     setQuantities({ 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 });
//     setShowMatrix(false);
//   };

//   const handleRetailAdd = () => {
//     onAddToCart({
//       ...product,
//       type: 'retail',
//       quantity: 1,
//       price: product.retailPrice
//     });
//   };

//   return (
//     <div className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
//       <div className="relative h-64 overflow-hidden bg-slate-100">
//         <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
//         {product.tag && <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] uppercase font-bold px-2 py-1 rounded backdrop-blur-sm">{product.tag}</span>}
//         {mode === 'wholesale' && <span className="absolute top-2 left-2 bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm">MOQ: {product.moq}</span>}
//       </div>

//       <div className="p-4 flex-1 flex flex-col">
//         <div className="mb-2">
//           <span className="text-xs text-slate-500 uppercase tracking-wide">{product.category}</span>
//           <h3 className="text-lg font-bold text-slate-800 leading-tight">{product.name}</h3>
//         </div>
        
//         <div className="mt-auto pt-4 border-t border-slate-100">
//           <div className="flex justify-between items-end mb-4">
//             <div>
//               <p className="text-xs text-slate-500 mb-0.5">Price per pair</p>
//               <div className="flex items-baseline gap-2">
//                 <span className="text-xl font-bold text-slate-900">₹{mode === 'retail' ? product.retailPrice : product.wholesalePrice}</span>
//                 {mode === 'retail' && <span className="text-xs text-red-500 line-through">₹{Math.floor(product.retailPrice * 1.2)}</span>}
//               </div>
//               {mode === 'wholesale' && <p className="text-[10px] text-red-600 font-medium">*Excl. GST</p>}
//             </div>
            
//             {mode === 'retail' ? (
//               <button onClick={handleRetailAdd} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-200">Add</button>
//             ) : (
//               <button onClick={() => setShowMatrix(!showMatrix)} className={`px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg ${showMatrix ? 'bg-slate-200 text-slate-800' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}>{showMatrix ? 'Close' : 'Bulk'}</button>
//             )}
//           </div>

//           {mode === 'wholesale' && showMatrix && (
//             <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2">
//               <div className="grid grid-cols-5 gap-1 mb-3">
//                 {[6, 7, 8, 9, 10].map((size) => (
//                   <div key={size} className="text-center">
//                     <label className="block text-[10px] text-slate-500">UK {size}</label>
//                     <input type="number" min="0" value={quantities[size] || ''} onChange={(e) => setQuantities(prev => ({...prev, [size]: e.target.value}))} className="w-full border border-slate-300 rounded p-1 text-center text-xs" placeholder="0" />
//                   </div>
//                 ))}
//               </div>
//               <div className="flex justify-between text-xs mb-2">
//                 <span>Pairs: <strong>{totalPairs}</strong></span>
//                 <span>Total: <strong className="text-blue-600">₹{matrixTotalCost}</strong></span>
//               </div>
//               <button onClick={handleWholesaleAdd} disabled={totalPairs === 0} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white py-1.5 rounded text-xs font-bold uppercase">Add Batch</button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // 2. Features Section
// const Features = () => (
//   <div className="bg-slate-50 py-12 border-y border-slate-200">
//     <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-blue-600">
//           <Truck />
//         </div>
//         <h3 className="font-bold text-slate-800 mb-2">Nationwide Delivery</h3>
//         <p className="text-sm text-slate-500 px-4">From Agra to anywhere in India. Trusted logistics partners.</p>
//       </div>
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-amber-500">
//           <ShieldCheck />
//         </div>
//         <h3 className="font-bold text-slate-800 mb-2">Quality Guarantee</h3>
//         <p className="text-sm text-slate-500 px-4">Every pair is inspected before packing. 20 years of reputation.</p>
//       </div>
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-red-600">
//           <Info />
//         </div>
//         <h3 className="font-bold text-slate-800 mb-2">Direct Support</h3>
//         <p className="text-sm text-slate-500 px-4">Call us anytime. We believe in relationships, not just sales.</p>
//       </div>
//     </div>
//   </div>
// );

// // --- VIEWS ---

// const AdminDashboard = ({ orders, setView }) => {
//   const pendingOrders = orders.filter(o => o.status === 'Pending').length;
//   const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);

//   return (
//     <div className="container mx-auto px-4 py-8 bg-slate-50 min-h-screen">
//       <div className="flex justify-between items-center mb-8">
//         <div>
//            <h2 className="text-2xl font-bold text-slate-900">Owner Dashboard</h2>
//            <p className="text-sm text-slate-500">Manage your digital wholesale business</p>
//         </div>
//         <button onClick={() => setView('home')} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2 font-medium">
//           <LogOut size={16}/> Exit Admin
//         </button>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
//           <div className="flex items-center gap-4">
//             <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><ClipboardList /></div>
//             <div>
//               <p className="text-slate-500 text-sm">Total Orders</p>
//               <h3 className="text-2xl font-bold text-slate-900">{orders.length}</h3>
//             </div>
//           </div>
//         </div>
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
//           <div className="flex items-center gap-4">
//             <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><Package /></div>
//             <div>
//               <p className="text-slate-500 text-sm">Pending Shipments</p>
//               <h3 className="text-2xl font-bold text-slate-900">{pendingOrders}</h3>
//             </div>
//           </div>
//         </div>
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
//           <div className="flex items-center gap-4">
//             <div className="p-3 bg-green-100 text-green-600 rounded-lg"><Users /></div>
//             <div>
//               <p className="text-slate-500 text-sm">Total Revenue (Est)</p>
//               <h3 className="text-2xl font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</h3>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Orders Table */}
//       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//         <div className="p-6 border-b border-slate-100 flex justify-between items-center">
//           <h3 className="font-bold text-lg text-slate-800">Recent Orders</h3>
//           <button className="text-sm text-blue-600 font-medium">View All</button>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full text-left text-sm">
//             <thead className="bg-slate-50 text-slate-500 font-medium">
//               <tr>
//                 <th className="p-4">Order ID</th>
//                 <th className="p-4">Customer</th>
//                 <th className="p-4">Type</th>
//                 <th className="p-4">Items</th>
//                 <th className="p-4">Total</th>
//                 <th className="p-4">Status</th>
//                 <th className="p-4">Action</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {orders.length === 0 ? (
//                 <tr><td colSpan="7" className="p-8 text-center text-slate-400">No orders received yet.</td></tr>
//               ) : orders.map((order) => (
//                 <tr key={order.id} className="hover:bg-slate-50 transition">
//                   <td className="p-4 font-mono text-xs text-slate-500">{order.id}</td>
//                   <td className="p-4">
//                     <div className="font-bold text-slate-900">{order.customer.name}</div>
//                     <div className="text-xs text-slate-500">{order.customer.phone}</div>
//                   </td>
//                   <td className="p-4">
//                     <span className={`px-2 py-1 rounded text-xs font-bold ${order.type === 'wholesale' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
//                       {order.type.toUpperCase()}
//                     </span>
//                   </td>
//                   <td className="p-4 text-slate-600">{order.items.length} Products</td>
//                   <td className="p-4 font-bold text-slate-900">₹{order.total}</td>
//                   <td className="p-4">
//                     <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold">{order.status}</span>
//                   </td>
//                   <td className="p-4">
//                     <button className="text-blue-600 hover:underline font-medium">Process</button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// const ShopView = ({ products, mode, onAddToCart }) => {
//   const [filter, setFilter] = useState('All');
//   const [searchTerm, setSearchTerm] = useState('');
  
//   const filteredProducts = products.filter(p => {
//     const matchesCategory = filter === 'All' || p.category === filter;
//     const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
//         <div>
//           <h2 className="text-3xl font-bold text-slate-900">{mode === 'wholesale' ? 'Wholesale Catalog' : 'Shop Collection'}</h2>
//           <p className="text-slate-500 text-sm mt-1">{mode === 'wholesale' ? 'Bulk pricing applied. MOQ rules active.' : 'Latest trends from Agra.'}</p>
//         </div>
        
//         {/* Search Bar */}
//         <div className="relative w-full md:w-64">
//           <input 
//             type="text" 
//             placeholder="Search shoes..." 
//             className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
//         </div>
//       </div>

//       {/* Category Pills */}
//       <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4">
//         <Filter size={18} className="text-slate-400 shrink-0" />
//         {CATEGORIES.map(cat => (
//           <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${filter === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
//             {cat}
//           </button>
//         ))}
//       </div>

//       {filteredProducts.length === 0 ? (
//         <div className="text-center py-20 text-slate-400">No products found matching your search.</div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {filteredProducts.map(product => (
//             <ProductCard key={product.id} product={product} mode={mode} onAddToCart={onAddToCart} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// const HomeView = ({ setView, mode }) => (
//   <>
//     <div className="bg-white border-b border-slate-200">
//       <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row items-center gap-10">
//         <div className="flex-1 text-center md:text-left">
//           <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold mb-6">
//             <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
//             {mode === 'wholesale' ? 'ACCEPTING NEW DISTRIBUTORS' : 'SEASONAL SALE IS LIVE'}
//           </div>
//           <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
//             {mode === 'wholesale' ? <>Factory Direct.<br /><span className="text-blue-600">Maximize Margins.</span></> : <>Handcrafted in Agra.<br /><span className="text-red-600">Worn Everywhere.</span></>}
//           </h1>
//           <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
//             {mode === 'wholesale' ? 'Connect directly with our 20-year-old manufacturing unit. Get transparent pricing, bulk shipping support, and custom branding options.' : 'Discover the finest leather shoes directly from the shoe capital of India. Premium quality, honest prices, delivered to your doorstep.'}
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
//             <button onClick={() => setView('shop')} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2">
//               {mode === 'wholesale' ? 'View Catalog' : 'Shop Collection'} <ArrowRight size={18} />
//             </button>
//           </div>
//         </div>
        
//         <div className="flex-1 w-full max-w-md md:max-w-full">
//            <div className="relative">
//              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-amber-50 rounded-2xl transform rotate-3"></div>
//              <img 
//                src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop" 
//                alt="Shoe Craftsmanship" 
//                className="relative rounded-2xl shadow-2xl w-full h-auto object-cover transform -rotate-2 hover:rotate-0 transition duration-700"
//              />
//              {mode === 'wholesale' && (
//                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3">
//                  <div className="bg-green-100 p-2 rounded-full text-green-600"><CheckCircle size={24} /></div>
//                  <div>
//                    <p className="text-sm font-bold text-slate-800">Verified Manufacturer</p>
//                    <p className="text-xs text-slate-500">GST Registered • IEC License</p>
//                  </div>
//                </div>
//              )}
//            </div>
//         </div>
//       </div>
//     </div>
//     <Features />
//   </>
// );

// const CartView = ({ cart, mode, removeFromCart, setView }) => {
//   const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
//   const totalGST = mode === 'wholesale' ? totalAmount * 0.12 : 0; // 12% GST for wholesale
//   const finalTotal = totalAmount + totalGST;

//   if (cart.length === 0) return (
//     <div className="container mx-auto px-4 py-20 text-center">
//       <ShoppingCart size={64} className="mx-auto text-slate-200 mb-4" />
//       <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
//       <button onClick={() => setView('shop')} className="text-blue-600 font-medium hover:underline">Start Shopping</button>
//     </div>
//   );

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h2 className="text-2xl font-bold text-slate-900 mb-8">Shopping Cart ({cart.length} items)</h2>
//       <div className="flex flex-col lg:flex-row gap-8">
//         <div className="flex-1 space-y-4">
//           {cart.map((item, idx) => (
//             <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl flex gap-4">
//               <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg bg-slate-100" />
//               <div className="flex-1">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h3 className="font-bold text-slate-900">{item.name}</h3>
//                     <p className="text-sm text-slate-500">{item.category}</p>
//                   </div>
//                   <button onClick={() => removeFromCart(idx)} className="text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
//                 </div>
                
//                 {item.type === 'wholesale' ? (
//                    <div className="mt-2 bg-slate-50 p-2 rounded text-xs text-slate-600 grid grid-cols-5 gap-2">
//                      {Object.entries(item.breakdown).map(([size, qty]) => Number(qty) > 0 && (
//                        <div key={size} className="text-center bg-white border border-slate-200 rounded px-1">
//                          <span className="block text-[10px] text-slate-400">UK {size}</span>
//                          <span className="font-bold">{qty}</span>
//                        </div>
//                      ))}
//                    </div>
//                 ) : (
//                   <div className="mt-2 text-sm text-slate-600">Qty: {item.quantity} Pair</div>
//                 )}
                
//                 <div className="mt-3 flex justify-between items-center">
//                    <div className="text-xs text-slate-500">{item.quantity} pairs x ₹{item.price}</div>
//                    <div className="font-bold text-slate-900">₹{item.quantity * item.price}</div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="w-full lg:w-96">
//           <div className="bg-white border border-slate-200 p-6 rounded-xl sticky top-24 shadow-sm">
//             <h3 className="font-bold text-lg mb-4">Order Summary</h3>
//             <div className="space-y-3 mb-6">
//               <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹{totalAmount}</span></div>
//               {mode === 'wholesale' && (
//                 <div className="flex justify-between text-slate-600"><span>GST (12%)</span><span>₹{totalGST.toFixed(0)}</span></div>
//               )}
//               <div className="flex justify-between text-slate-600"><span>Shipping</span><span>{mode === 'wholesale' ? 'To be calculated' : 'Free'}</span></div>
//               <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-lg text-slate-900">
//                 <span>Total</span><span>₹{finalTotal.toFixed(0)}</span>
//               </div>
//             </div>
//             <button onClick={() => setView('checkout')} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg">
//               Proceed to Checkout
//             </button>
//             <p className="text-xs text-slate-400 text-center mt-3">Secure Checkout via Agra Shoe Mart</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const CheckoutView = ({ cart, mode, placeOrder, setView }) => {
//   const [form, setForm] = useState({ name: '', phone: '', address: '' });
  
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     placeOrder(form);
//   };

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-2xl">
//       <button onClick={() => setView('cart')} className="text-sm text-slate-500 hover:text-slate-900 mb-6">← Back to Cart</button>
//       <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
//         <h2 className="text-2xl font-bold text-slate-900 mb-6">{mode === 'wholesale' ? 'Request Bulk Quote' : 'Checkout'}</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Full Name / Shop Name</label>
//             <input required type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number (WhatsApp)</label>
//             <input required type="tel" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Address</label>
//             <textarea required rows="3" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.address} onChange={e => setForm({...form, address: e.target.value})}></textarea>
//           </div>
          
//           <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
//             {mode === 'wholesale' 
//               ? "Note: This is a quote request. Our sales team will contact you on WhatsApp to confirm availability and shipping costs before payment."
//               : "Note: Cash on Delivery is available for Agra. Online payment link will be sent for other cities."
//             }
//           </div>

//           <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-md">
//             {mode === 'wholesale' ? 'Submit Quote Request' : 'Place Order'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// const LoginView = ({ setMode, setView, setUser }) => {
//   const [email, setEmail] = useState('');
  
//   const handleLogin = (e) => {
//     e.preventDefault();
//     if (email.includes('admin')) {
//       setUser({ name: 'Owner', type: 'admin', email });
//       setView('admin');
//     } else {
//       setUser({ name: 'Verified Buyer', type: 'wholesale', email });
//       setMode('wholesale');
//       setView('shop');
//     }
//   };

//   return (
//     <div className="min-h-[60vh] flex items-center justify-center px-4">
//       <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-xl shadow-lg">
//         <div className="text-center mb-8">
//           <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white mx-auto mb-4"><Package size={32} /></div>
//           <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
//           <p className="text-slate-500 mt-2">Enter credentials to access your dashboard</p>
//         </div>
//         <form onSubmit={handleLogin} className="space-y-4">
//           <div>
//              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
//              <input type="email" required placeholder="admin@agra.com" className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500" value={email} onChange={e => setEmail(e.target.value)} />
//           </div>
//           <div>
//              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
//              <input type="password" placeholder="••••••••" className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
//           </div>
//           <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition">Login</button>
//         </form>
//         <p className="text-center text-xs text-slate-400 mt-6">Use 'admin@agra.com' for Owner view</p>
//       </div>
//     </div>
//   );
// };

// // --- MAIN CONTROLLER ---

// const App = () => {
//   const [view, setView] = useState('home');
//   const [mode, setMode] = useState('retail');
//   const [cart, setCart] = useState([]);
//   const [user, setUser] = useState(null);
//   const [products] = useState(INITIAL_PRODUCTS);
//   const [orders, setOrders] = useState([]); // This acts as our database
//   const [showToast, setShowToast] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   const addToCart = (item) => {
//     // --- AUTH GUARD ---
//     if (!user) {
//       alert("Please login to add items to your cart.");
//       setView('login');
//       return;
//     }
//     // ------------------

//     setCart([...cart, item]);
//     setShowToast(true);
//     setTimeout(() => setShowToast(false), 3000);
//   };

//   const removeFromCart = (index) => {
//     const newCart = [...cart];
//     newCart.splice(index, 1);
//     setCart(newCart);
//   };

//   const placeOrder = (customerDetails) => {
//     const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
//     const gst = mode === 'wholesale' ? total * 0.12 : 0;
    
//     const newOrder = {
//       id: 'ORD-' + Math.floor(Math.random() * 10000),
//       customer: customerDetails,
//       items: cart,
//       total: total + gst,
//       type: mode,
//       status: 'Pending',
//       date: new Date().toISOString()
//     };

//     setOrders([newOrder, ...orders]); // Save to "Database"
//     setCart([]);
//     setView('success');
//   };

//   const renderView = () => {
//     switch(view) {
//       case 'home': return <HomeView setView={setView} mode={mode} />;
//       case 'shop': return <ShopView products={products} mode={mode} onAddToCart={addToCart} />;
//       case 'cart': return <CartView cart={cart} mode={mode} removeFromCart={removeFromCart} setView={setView} />;
//       case 'checkout': return <CheckoutView cart={cart} mode={mode} placeOrder={placeOrder} setView={setView} />;
//       case 'login': return <LoginView setMode={setMode} setView={setView} setUser={setUser} />;
//       case 'admin': return <AdminDashboard orders={orders} setView={setView} />;
//       case 'success': return (
//         <div className="container mx-auto px-4 py-20 text-center">
//           <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} /></div>
//           <h2 className="text-3xl font-bold text-slate-900 mb-4">{mode === 'wholesale' ? 'Quote Request Sent!' : 'Order Placed Successfully!'}</h2>
//           <p className="text-slate-600 max-w-md mx-auto mb-8">
//             {mode === 'wholesale' 
//               ? 'Our team will review your bulk requirement and send a proforma invoice via WhatsApp shortly.' 
//               : 'Thank you for shopping with Agra Shoe Mart. Your shoes will be dispatched within 24 hours.'}
//           </p>
//           <button onClick={() => setView('home')} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold">Return Home</button>
//         </div>
//       );
//       default: return <HomeView setView={setView} mode={mode} />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
//       {/* Navbar (Hidden in Admin Mode) */}
//       {view !== 'admin' && (
//         <nav className="bg-white shadow-md sticky top-0 z-50">
//           {/* Top Bar Restored */}
//           <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 flex justify-between items-center">
//             <span className="hidden sm:inline">Agra's Trusted Shoe Wholesaler - Since 2003</span>
//             <div className="flex items-center gap-4">
//               <span className="flex items-center gap-1 hover:text-white cursor-pointer transition">
//                 <Phone size={14} /> +91 98765-XXXXX
//               </span>
//               <span className="text-amber-500 font-bold cursor-pointer hover:underline hidden sm:block">
//                 Request Sample Kit
//               </span>
//             </div>
//           </div>

//           <div className="container mx-auto px-4 py-4">
//             <div className="flex justify-between items-center">
//               {/* Logo */}
//               <div onClick={() => setView('home')} className="flex items-center gap-2 cursor-pointer">
//                 <div className="bg-red-600 text-white p-1 rounded font-bold text-xl">ASM</div>
//                 <div className="text-2xl font-bold tracking-tighter text-slate-800 leading-none">
//                   AGRA<span className="text-red-600">SHOES</span>
//                 </div>
//               </div>

//               {/* Desktop Nav Restored */}
//               <div className="hidden md:flex gap-8 font-medium text-slate-600 text-sm">
//                 <button onClick={() => setView('home')} className="hover:text-red-600 transition">Home</button>
//                 <button onClick={() => setView('shop')} className="hover:text-red-600 transition">Shop Catalog</button>
//                 <button onClick={() => setView('shop')} className="hover:text-red-600 transition">New Arrivals</button>
//               </div>

//               {/* Actions */}
//               <div className="flex items-center gap-4">
//                 {/* Mode Toggle */}
//                 <div className="hidden md:flex bg-slate-100 rounded-full p-1 border border-slate-200 mr-2">
//                   <button onClick={() => setMode('retail')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${mode === 'retail' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Retail</button>
//                   <button onClick={() => setMode('wholesale')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${mode === 'wholesale' ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}>Wholesale</button>
//                 </div>

//                 <button onClick={() => setView('cart')} className="relative p-2 hover:bg-slate-100 rounded-full transition group">
//                   <ShoppingCart size={22} className="text-slate-700 group-hover:text-red-600" />
//                   {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">{cart.length}</span>}
//                 </button>
                
//                 {user ? (
//                   <button onClick={() => user.type === 'admin' ? setView('admin') : setView('home')} className="flex items-center gap-2 font-bold text-sm bg-slate-100 px-3 py-2 rounded-lg hover:bg-slate-200 transition">
//                     <User size={18}/> <span className="hidden sm:inline">{user.name}</span>
//                   </button>
//                 ) : (
//                   <button onClick={() => setView('login')} className="hidden sm:flex bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm">Login</button>
//                 )}

//                 {/* Mobile Menu Button */}
//                 <button className="md:hidden text-slate-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
//                    {isMobileMenuOpen ? <X /> : <Menu />}
//                 </button>
//               </div>
//             </div>

//             {/* Mobile Menu Restored */}
//             {isMobileMenuOpen && (
//               <div className="md:hidden mt-4 pb-4 border-t pt-4">
//                  <div className="flex bg-slate-100 rounded-lg p-1 mb-4">
//                   <button 
//                     onClick={() => { setMode('retail'); setIsMobileMenuOpen(false); }}
//                     className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === 'retail' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
//                   >
//                     Retail
//                   </button>
//                   <button 
//                     onClick={() => { setMode('wholesale'); setIsMobileMenuOpen(false); }}
//                     className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === 'wholesale' ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}
//                   >
//                     Wholesale
//                   </button>
//                 </div>
//                 <div className="space-y-3 text-slate-700 font-medium">
//                   <button onClick={() => { setView('home'); setIsMobileMenuOpen(false); }} className="block w-full text-left hover:text-red-600">Home</button>
//                   <button onClick={() => { setView('shop'); setIsMobileMenuOpen(false); }} className="block w-full text-left hover:text-red-600">Shop Catalog</button>
//                   <button onClick={() => { setView('login'); setIsMobileMenuOpen(false); }} className="block w-full text-left text-blue-600">Login / Register</button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </nav>
//       )}

//       <main className="flex-1">{renderView()}</main>

//       {/* Detailed Footer Restored */}
//       {view !== 'admin' && (
//         <footer className="bg-slate-900 text-slate-400 py-12">
//           <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
//             <div>
//               <h4 className="text-white font-bold text-lg mb-4">AGRA SHOES</h4>
//               <p className="mb-4">Digitizing the legacy of Agra's shoemaking. We connect manufacturers directly to retailers across India.</p>
//               <p>Agra, Uttar Pradesh, India - 282002</p>
//             </div>
//             <div>
//               <h4 className="text-white font-bold mb-4">Shop</h4>
//               <ul className="space-y-2">
//                 <li className="hover:text-white cursor-pointer">Men's Formal</li>
//                 <li className="hover:text-white cursor-pointer">Casual Loafers</li>
//                 <li className="hover:text-white cursor-pointer">Safety Shoes</li>
//                 <li className="hover:text-white cursor-pointer">School Shoes</li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="text-white font-bold mb-4">Wholesale</h4>
//               <ul className="space-y-2">
//                 <li className="hover:text-white cursor-pointer">Register as Distributor</li>
//                 <li className="hover:text-white cursor-pointer">Bulk Pricing Policy</li>
//                 <li className="hover:text-white cursor-pointer">Shipping & Logistics</li>
//                 <li className="hover:text-white cursor-pointer">Return Policy</li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="text-white font-bold mb-4">Stay Connected</h4>
//               <p className="mb-4">Get latest design updates on WhatsApp.</p>
//               <div className="flex gap-2">
//                 <input type="text" placeholder="+91 Mobile Number" className="bg-slate-800 border-none rounded px-3 py-2 w-full text-white outline-none focus:ring-1 focus:ring-slate-600" />
//                 <button className="bg-green-600 text-white px-3 py-2 rounded font-bold hover:bg-green-700">Join</button>
//               </div>
//             </div>
//           </div>
//           <div className="text-center mt-12 pt-8 border-t border-slate-800">
//             &copy; 2025 Agra Wholesale Shoe Mart. All rights reserved.
//           </div>
//         </footer>
//       )}

//       {showToast && (
//         <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-bounce z-50">
//           <CheckCircle size={20} className="text-green-400" />
//           <p className="font-bold text-sm">Added to Cart</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;
// import React, { useState } from 'react';
// import { 
//   ShoppingCart, User, Phone, Menu, X, CheckCircle, Truck, 
//   ShieldCheck, Info, Package, ArrowRight, Trash2, Filter, 
//   Search, ClipboardList, Users, LogOut
// } from 'lucide-react';

// // --- MOCK DATABASE (Simulating a Backend) ---
// const INITIAL_PRODUCTS = [
//   { id: 1, name: 'Agra Classic Loafer', category: 'Men\'s Formal', retailPrice: 1499, wholesalePrice: 450, moq: 24, stock: 1000, image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800&auto=format&fit=crop', tag: 'Best Seller' },
//   { id: 2, name: 'Genuine Leather Oxford', category: 'Office Wear', retailPrice: 2199, wholesalePrice: 750, moq: 12, stock: 500, image: 'https://images.unsplash.com/photo-1478186172493-493ca852a743?q=80&w=800&auto=format&fit=crop', tag: 'Premium' },
//   { id: 3, name: 'Daily Soft Sandal', category: 'Women\'s Comfort', retailPrice: 899, wholesalePrice: 220, moq: 48, stock: 2000, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop', tag: 'High Demand' },
//   { id: 4, name: 'Rugged Chelsea Boot', category: 'Men\'s Boots', retailPrice: 2899, wholesalePrice: 950, moq: 12, stock: 300, image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800&auto=format&fit=crop', tag: 'New Arrival' },
//   { id: 5, name: 'Canvas Sneaker', category: 'Casual', retailPrice: 999, wholesalePrice: 310, moq: 36, stock: 800, image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop', tag: null },
//   { id: 6, name: 'Kids School Shoe', category: 'School', retailPrice: 699, wholesalePrice: 180, moq: 60, stock: 5000, image: 'https://images.unsplash.com/photo-1515347619252-60a6bf4fffce?q=80&w=800&auto=format&fit=crop', tag: 'Back to School' },
// ];

// const CATEGORIES = ['All', 'Men\'s Formal', 'Office Wear', 'Women\'s Comfort', 'Men\'s Boots', 'Casual', 'School'];

// // --- COMPONENTS ---

// // 1. Product Card (With Efficiency Matrix)
// const ProductCard = ({ product, mode, onAddToCart }) => {
//   const [showMatrix, setShowMatrix] = useState(false);
//   const [quantities, setQuantities] = useState({ 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 });
  
//   const totalPairs = Object.values(quantities).reduce((a, b) => a + Number(b), 0);
//   const matrixTotalCost = totalPairs * product.wholesalePrice;

//   const handleWholesaleAdd = () => {
//     if (totalPairs < product.moq) {
//       alert(`Minimum Order Quantity is ${product.moq} pairs.`);
//       return;
//     }
//     onAddToCart({
//       ...product,
//       type: 'wholesale',
//       breakdown: quantities,
//       quantity: totalPairs,
//       price: product.wholesalePrice
//     });
//     setQuantities({ 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 });
//     setShowMatrix(false);
//   };

//   const handleRetailAdd = () => {
//     onAddToCart({
//       ...product,
//       type: 'retail',
//       quantity: 1,
//       price: product.retailPrice
//     });
//   };

//   return (
//     <div className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
//       <div className="relative h-64 overflow-hidden bg-slate-100">
//         <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
//         {product.tag && <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] uppercase font-bold px-2 py-1 rounded backdrop-blur-sm">{product.tag}</span>}
//         {mode === 'wholesale' && <span className="absolute top-2 left-2 bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm">MOQ: {product.moq}</span>}
//       </div>

//       <div className="p-4 flex-1 flex flex-col">
//         <div className="mb-2">
//           <span className="text-xs text-slate-500 uppercase tracking-wide">{product.category}</span>
//           <h3 className="text-lg font-bold text-slate-800 leading-tight">{product.name}</h3>
//         </div>
        
//         <div className="mt-auto pt-4 border-t border-slate-100">
//           <div className="flex justify-between items-end mb-4">
//             <div>
//               <p className="text-xs text-slate-500 mb-0.5">Price per pair</p>
//               <div className="flex items-baseline gap-2">
//                 <span className="text-xl font-bold text-slate-900">₹{mode === 'retail' ? product.retailPrice : product.wholesalePrice}</span>
//                 {mode === 'retail' && <span className="text-xs text-red-500 line-through">₹{Math.floor(product.retailPrice * 1.2)}</span>}
//               </div>
//               {mode === 'wholesale' && <p className="text-[10px] text-red-600 font-medium">*Excl. GST</p>}
//             </div>
            
//             {mode === 'retail' ? (
//               <button onClick={handleRetailAdd} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-200">Add</button>
//             ) : (
//               <button onClick={() => setShowMatrix(!showMatrix)} className={`px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg ${showMatrix ? 'bg-slate-200 text-slate-800' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}>{showMatrix ? 'Close' : 'Bulk'}</button>
//             )}
//           </div>

//           {mode === 'wholesale' && showMatrix && (
//             <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2">
//               <div className="grid grid-cols-5 gap-1 mb-3">
//                 {[6, 7, 8, 9, 10].map((size) => (
//                   <div key={size} className="text-center">
//                     <label className="block text-[10px] text-slate-500">UK {size}</label>
//                     <input type="number" min="0" value={quantities[size] || ''} onChange={(e) => setQuantities(prev => ({...prev, [size]: e.target.value}))} className="w-full border border-slate-300 rounded p-1 text-center text-xs" placeholder="0" />
//                   </div>
//                 ))}
//               </div>
//               <div className="flex justify-between text-xs mb-2">
//                 <span>Pairs: <strong>{totalPairs}</strong></span>
//                 <span>Total: <strong className="text-blue-600">₹{matrixTotalCost}</strong></span>
//               </div>
//               <button onClick={handleWholesaleAdd} disabled={totalPairs === 0} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white py-1.5 rounded text-xs font-bold uppercase">Add Batch</button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // 2. Features Section (Restored)
// const Features = () => (
//   <div className="bg-slate-50 py-12 border-y border-slate-200">
//     <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-blue-600">
//           <Truck />
//         </div>
//         <h3 className="font-bold text-slate-800 mb-2">Nationwide Delivery</h3>
//         <p className="text-sm text-slate-500 px-4">From Agra to anywhere in India. Trusted logistics partners.</p>
//       </div>
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-amber-500">
//           <ShieldCheck />
//         </div>
//         <h3 className="font-bold text-slate-800 mb-2">Quality Guarantee</h3>
//         <p className="text-sm text-slate-500 px-4">Every pair is inspected before packing. 20 years of reputation.</p>
//       </div>
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-red-600">
//           <Info />
//         </div>
//         <h3 className="font-bold text-slate-800 mb-2">Direct Support</h3>
//         <p className="text-sm text-slate-500 px-4">Call us anytime. We believe in relationships, not just sales.</p>
//       </div>
//     </div>
//   </div>
// );

// // --- VIEWS ---

// const AdminDashboard = ({ orders, setView }) => {
//   const pendingOrders = orders.filter(o => o.status === 'Pending').length;
//   const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);

//   return (
//     <div className="container mx-auto px-4 py-8 bg-slate-50 min-h-screen">
//       <div className="flex justify-between items-center mb-8">
//         <div>
//            <h2 className="text-2xl font-bold text-slate-900">Owner Dashboard</h2>
//            <p className="text-sm text-slate-500">Manage your digital wholesale business</p>
//         </div>
//         <button onClick={() => setView('home')} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2 font-medium">
//           <LogOut size={16}/> Exit Admin
//         </button>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
//           <div className="flex items-center gap-4">
//             <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><ClipboardList /></div>
//             <div>
//               <p className="text-slate-500 text-sm">Total Orders</p>
//               <h3 className="text-2xl font-bold text-slate-900">{orders.length}</h3>
//             </div>
//           </div>
//         </div>
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
//           <div className="flex items-center gap-4">
//             <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><Package /></div>
//             <div>
//               <p className="text-slate-500 text-sm">Pending Shipments</p>
//               <h3 className="text-2xl font-bold text-slate-900">{pendingOrders}</h3>
//             </div>
//           </div>
//         </div>
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
//           <div className="flex items-center gap-4">
//             <div className="p-3 bg-green-100 text-green-600 rounded-lg"><Users /></div>
//             <div>
//               <p className="text-slate-500 text-sm">Total Revenue (Est)</p>
//               <h3 className="text-2xl font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</h3>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Orders Table */}
//       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//         <div className="p-6 border-b border-slate-100 flex justify-between items-center">
//           <h3 className="font-bold text-lg text-slate-800">Recent Orders</h3>
//           <button className="text-sm text-blue-600 font-medium">View All</button>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full text-left text-sm">
//             <thead className="bg-slate-50 text-slate-500 font-medium">
//               <tr>
//                 <th className="p-4">Order ID</th>
//                 <th className="p-4">Customer</th>
//                 <th className="p-4">Type</th>
//                 <th className="p-4">Items</th>
//                 <th className="p-4">Total</th>
//                 <th className="p-4">Status</th>
//                 <th className="p-4">Action</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {orders.length === 0 ? (
//                 <tr><td colSpan="7" className="p-8 text-center text-slate-400">No orders received yet.</td></tr>
//               ) : orders.map((order) => (
//                 <tr key={order.id} className="hover:bg-slate-50 transition">
//                   <td className="p-4 font-mono text-xs text-slate-500">{order.id}</td>
//                   <td className="p-4">
//                     <div className="font-bold text-slate-900">{order.customer.name}</div>
//                     <div className="text-xs text-slate-500">{order.customer.phone}</div>
//                   </td>
//                   <td className="p-4">
//                     <span className={`px-2 py-1 rounded text-xs font-bold ${order.type === 'wholesale' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
//                       {order.type.toUpperCase()}
//                     </span>
//                   </td>
//                   <td className="p-4 text-slate-600">{order.items.length} Products</td>
//                   <td className="p-4 font-bold text-slate-900">₹{order.total}</td>
//                   <td className="p-4">
//                     <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold">{order.status}</span>
//                   </td>
//                   <td className="p-4">
//                     <button className="text-blue-600 hover:underline font-medium">Process</button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// const ShopView = ({ products, mode, onAddToCart }) => {
//   const [filter, setFilter] = useState('All');
//   const [searchTerm, setSearchTerm] = useState('');
  
//   const filteredProducts = products.filter(p => {
//     const matchesCategory = filter === 'All' || p.category === filter;
//     const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
//         <div>
//           <h2 className="text-3xl font-bold text-slate-900">{mode === 'wholesale' ? 'Wholesale Catalog' : 'Shop Collection'}</h2>
//           <p className="text-slate-500 text-sm mt-1">{mode === 'wholesale' ? 'Bulk pricing applied. MOQ rules active.' : 'Latest trends from Agra.'}</p>
//         </div>
        
//         {/* Search Bar */}
//         <div className="relative w-full md:w-64">
//           <input 
//             type="text" 
//             placeholder="Search shoes..." 
//             className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
//         </div>
//       </div>

//       {/* Category Pills */}
//       <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4">
//         <Filter size={18} className="text-slate-400 shrink-0" />
//         {CATEGORIES.map(cat => (
//           <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${filter === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
//             {cat}
//           </button>
//         ))}
//       </div>

//       {filteredProducts.length === 0 ? (
//         <div className="text-center py-20 text-slate-400">No products found matching your search.</div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {filteredProducts.map(product => (
//             <ProductCard key={product.id} product={product} mode={mode} onAddToCart={onAddToCart} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// const HomeView = ({ setView, mode }) => (
//   <>
//     <div className="bg-white border-b border-slate-200">
//       <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row items-center gap-10">
//         <div className="flex-1 text-center md:text-left">
//           <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold mb-6">
//             <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
//             {mode === 'wholesale' ? 'ACCEPTING NEW DISTRIBUTORS' : 'SEASONAL SALE IS LIVE'}
//           </div>
//           <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
//             {mode === 'wholesale' ? <>Factory Direct.<br /><span className="text-blue-600">Maximize Margins.</span></> : <>Handcrafted in Agra.<br /><span className="text-red-600">Worn Everywhere.</span></>}
//           </h1>
//           <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
//             {mode === 'wholesale' ? 'Connect directly with our 20-year-old manufacturing unit. Get transparent pricing, bulk shipping support, and custom branding options.' : 'Discover the finest leather shoes directly from the shoe capital of India. Premium quality, honest prices, delivered to your doorstep.'}
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
//             <button onClick={() => setView('shop')} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2">
//               {mode === 'wholesale' ? 'View Catalog' : 'Shop Collection'} <ArrowRight size={18} />
//             </button>
//           </div>
//         </div>
        
//         {/* Abstract/Hero Image Area */}
//         <div className="flex-1 w-full max-w-md md:max-w-full">
//            <div className="relative">
//              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-amber-50 rounded-2xl transform rotate-3"></div>
//              <img 
//                src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop" 
//                alt="Shoe Craftsmanship" 
//                className="relative rounded-2xl shadow-2xl w-full h-auto object-cover transform -rotate-2 hover:rotate-0 transition duration-700"
//              />
//              {mode === 'wholesale' && (
//                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3">
//                  <div className="bg-green-100 p-2 rounded-full text-green-600"><CheckCircle size={24} /></div>
//                  <div>
//                    <p className="text-sm font-bold text-slate-800">Verified Manufacturer</p>
//                    <p className="text-xs text-slate-500">GST Registered • IEC License</p>
//                  </div>
//                </div>
//              )}
//            </div>
//         </div>
//       </div>
//     </div>
//     <Features />
//   </>
// );

// const CartView = ({ cart, mode, removeFromCart, setView }) => {
//   const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
//   const totalGST = mode === 'wholesale' ? totalAmount * 0.12 : 0; // 12% GST for wholesale
//   const finalTotal = totalAmount + totalGST;

//   if (cart.length === 0) return (
//     <div className="container mx-auto px-4 py-20 text-center">
//       <ShoppingCart size={64} className="mx-auto text-slate-200 mb-4" />
//       <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
//       <button onClick={() => setView('shop')} className="text-blue-600 font-medium hover:underline">Start Shopping</button>
//     </div>
//   );

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h2 className="text-2xl font-bold text-slate-900 mb-8">Shopping Cart ({cart.length} items)</h2>
//       <div className="flex flex-col lg:flex-row gap-8">
//         {/* Cart Items List */}
//         <div className="flex-1 space-y-4">
//           {cart.map((item, idx) => (
//             <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl flex gap-4">
//               <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg bg-slate-100" />
//               <div className="flex-1">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h3 className="font-bold text-slate-900">{item.name}</h3>
//                     <p className="text-sm text-slate-500">{item.category}</p>
//                   </div>
//                   <button onClick={() => removeFromCart(idx)} className="text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
//                 </div>
                
//                 {item.type === 'wholesale' ? (
//                    <div className="mt-2 bg-slate-50 p-2 rounded text-xs text-slate-600 grid grid-cols-5 gap-2">
//                      {Object.entries(item.breakdown).map(([size, qty]) => Number(qty) > 0 && (
//                        <div key={size} className="text-center bg-white border border-slate-200 rounded px-1">
//                          <span className="block text-[10px] text-slate-400">UK {size}</span>
//                          <span className="font-bold">{qty}</span>
//                        </div>
//                      ))}
//                    </div>
//                 ) : (
//                   <div className="mt-2 text-sm text-slate-600">Qty: {item.quantity} Pair</div>
//                 )}
                
//                 <div className="mt-3 flex justify-between items-center">
//                    <div className="text-xs text-slate-500">{item.quantity} pairs x ₹{item.price}</div>
//                    <div className="font-bold text-slate-900">₹{item.quantity * item.price}</div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Order Summary */}
//         <div className="w-full lg:w-96">
//           <div className="bg-white border border-slate-200 p-6 rounded-xl sticky top-24 shadow-sm">
//             <h3 className="font-bold text-lg mb-4">Order Summary</h3>
//             <div className="space-y-3 mb-6">
//               <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹{totalAmount}</span></div>
//               {mode === 'wholesale' && (
//                 <div className="flex justify-between text-slate-600"><span>GST (12%)</span><span>₹{totalGST.toFixed(0)}</span></div>
//               )}
//               <div className="flex justify-between text-slate-600"><span>Shipping</span><span>{mode === 'wholesale' ? 'To be calculated' : 'Free'}</span></div>
//               <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-lg text-slate-900">
//                 <span>Total</span><span>₹{finalTotal.toFixed(0)}</span>
//               </div>
//             </div>
//             <button onClick={() => setView('checkout')} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg">
//               Proceed to Checkout
//             </button>
//             <p className="text-xs text-slate-400 text-center mt-3">Secure Checkout via Agra Shoe Mart</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const CheckoutView = ({ cart, mode, placeOrder, setView }) => {
//   const [form, setForm] = useState({ name: '', phone: '', address: '' });
  
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     placeOrder(form);
//   };

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-2xl">
//       <button onClick={() => setView('cart')} className="text-sm text-slate-500 hover:text-slate-900 mb-6">← Back to Cart</button>
//       <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
//         <h2 className="text-2xl font-bold text-slate-900 mb-6">{mode === 'wholesale' ? 'Request Bulk Quote' : 'Checkout'}</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Full Name / Shop Name</label>
//             <input required type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number (WhatsApp)</label>
//             <input required type="tel" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Address</label>
//             <textarea required rows="3" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.address} onChange={e => setForm({...form, address: e.target.value})}></textarea>
//           </div>
          
//           <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
//             {mode === 'wholesale' 
//               ? "Note: This is a quote request. Our sales team will contact you on WhatsApp to confirm availability and shipping costs before payment."
//               : "Note: Cash on Delivery is available for Agra. Online payment link will be sent for other cities."
//             }
//           </div>

//           <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-md">
//             {mode === 'wholesale' ? 'Submit Quote Request' : 'Place Order'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// const LoginView = ({ setMode, setView, setUser }) => {
//   const [email, setEmail] = useState('');
  
//   const handleLogin = (e) => {
//     e.preventDefault();
//     if (email.includes('admin')) {
//       setUser({ name: 'Owner', type: 'admin', email });
//       setView('admin');
//     } else {
//       setUser({ name: 'Verified Buyer', type: 'wholesale', email });
//       setMode('wholesale');
//       setView('shop');
//     }
//   };

//   return (
//     <div className="min-h-[60vh] flex items-center justify-center px-4">
//       <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-xl shadow-lg">
//         <div className="text-center mb-8">
//           <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white mx-auto mb-4"><Package size={32} /></div>
//           <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
//           <p className="text-slate-500 mt-2">Enter credentials to access your dashboard</p>
//         </div>
//         <form onSubmit={handleLogin} className="space-y-4">
//           <div>
//              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
//              <input type="email" required placeholder="admin@agra.com" className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500" value={email} onChange={e => setEmail(e.target.value)} />
//           </div>
//           <div>
//              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
//              <input type="password" placeholder="••••••••" className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
//           </div>
//           <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition">Login</button>
//         </form>
//         <p className="text-center text-xs text-slate-400 mt-6">Use 'admin@agra.com' for Owner view</p>
//       </div>
//     </div>
//   );
// };

// // --- MAIN CONTROLLER ---

// const App = () => {
//   const [view, setView] = useState('home');
//   const [mode, setMode] = useState('retail');
//   const [cart, setCart] = useState([]);
//   const [user, setUser] = useState(null);
//   const [products] = useState(INITIAL_PRODUCTS);
//   const [orders, setOrders] = useState([]); // This acts as our database
//   const [showToast, setShowToast] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   const addToCart = (item) => {
//     setCart([...cart, item]);
//     setShowToast(true);
//     setTimeout(() => setShowToast(false), 3000);
//   };

//   const removeFromCart = (index) => {
//     const newCart = [...cart];
//     newCart.splice(index, 1);
//     setCart(newCart);
//   };

//   const placeOrder = (customerDetails) => {
//     const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
//     const gst = mode === 'wholesale' ? total * 0.12 : 0;
    
//     const newOrder = {
//       id: 'ORD-' + Math.floor(Math.random() * 10000),
//       customer: customerDetails,
//       items: cart,
//       total: total + gst,
//       type: mode,
//       status: 'Pending',
//       date: new Date().toISOString()
//     };

//     setOrders([newOrder, ...orders]); // Save to "Database"
//     setCart([]);
//     setView('success');
//   };

//   const renderView = () => {
//     switch(view) {
//       case 'home': return <HomeView setView={setView} mode={mode} />;
//       case 'shop': return <ShopView products={products} mode={mode} onAddToCart={addToCart} />;
//       case 'cart': return <CartView cart={cart} mode={mode} removeFromCart={removeFromCart} setView={setView} />;
//       case 'checkout': return <CheckoutView cart={cart} mode={mode} placeOrder={placeOrder} setView={setView} />;
//       case 'login': return <LoginView setMode={setMode} setView={setView} setUser={setUser} />;
//       case 'admin': return <AdminDashboard orders={orders} setView={setView} />;
//       case 'success': return (
//         <div className="container mx-auto px-4 py-20 text-center">
//           <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} /></div>
//           <h2 className="text-3xl font-bold text-slate-900 mb-4">{mode === 'wholesale' ? 'Quote Request Sent!' : 'Order Placed Successfully!'}</h2>
//           <p className="text-slate-600 max-w-md mx-auto mb-8">
//             {mode === 'wholesale' 
//               ? 'Our team will review your bulk requirement and send a proforma invoice via WhatsApp shortly.' 
//               : 'Thank you for shopping with Agra Shoe Mart. Your shoes will be dispatched within 24 hours.'}
//           </p>
//           <button onClick={() => setView('home')} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold">Return Home</button>
//         </div>
//       );
//       default: return <HomeView setView={setView} mode={mode} />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
//       {/* Navbar (Hidden in Admin Mode) */}
//       {view !== 'admin' && (
//         <nav className="bg-white shadow-md sticky top-0 z-50">
//           {/* Top Bar Restored */}
//           <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 flex justify-between items-center">
//             <span className="hidden sm:inline">Agra's Trusted Shoe Wholesaler - Since 2003</span>
//             <div className="flex items-center gap-4">
//               <span className="flex items-center gap-1 hover:text-white cursor-pointer transition">
//                 <Phone size={14} /> +91 98765-XXXXX
//               </span>
//               <span className="text-amber-500 font-bold cursor-pointer hover:underline hidden sm:block">
//                 Request Sample Kit
//               </span>
//             </div>
//           </div>

//           <div className="container mx-auto px-4 py-4">
//             <div className="flex justify-between items-center">
//               {/* Logo */}
//               <div onClick={() => setView('home')} className="flex items-center gap-2 cursor-pointer">
//                 <div className="bg-red-600 text-white p-1 rounded font-bold text-xl">ASM</div>
//                 <div className="text-2xl font-bold tracking-tighter text-slate-800 leading-none">
//                   AGRA<span className="text-red-600">SHOES</span>
//                 </div>
//               </div>

//               {/* Desktop Nav Restored */}
//               <div className="hidden md:flex gap-8 font-medium text-slate-600 text-sm">
//                 <button onClick={() => setView('home')} className="hover:text-red-600 transition">Home</button>
//                 <button onClick={() => setView('shop')} className="hover:text-red-600 transition">Shop Catalog</button>
//                 <button onClick={() => setView('shop')} className="hover:text-red-600 transition">New Arrivals</button>
//               </div>

//               {/* Actions */}
//               <div className="flex items-center gap-4">
//                 {/* Mode Toggle */}
//                 <div className="hidden md:flex bg-slate-100 rounded-full p-1 border border-slate-200 mr-2">
//                   <button onClick={() => setMode('retail')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${mode === 'retail' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Retail</button>
//                   <button onClick={() => setMode('wholesale')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${mode === 'wholesale' ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}>Wholesale</button>
//                 </div>

//                 <button onClick={() => setView('cart')} className="relative p-2 hover:bg-slate-100 rounded-full transition group">
//                   <ShoppingCart size={22} className="text-slate-700 group-hover:text-red-600" />
//                   {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">{cart.length}</span>}
//                 </button>
                
//                 {user ? (
//                   <button onClick={() => user.type === 'admin' ? setView('admin') : setView('home')} className="flex items-center gap-2 font-bold text-sm bg-slate-100 px-3 py-2 rounded-lg hover:bg-slate-200 transition">
//                     <User size={18}/> <span className="hidden sm:inline">{user.name}</span>
//                   </button>
//                 ) : (
//                   <button onClick={() => setView('login')} className="hidden sm:flex bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm">Login</button>
//                 )}

//                 {/* Mobile Menu Button */}
//                 <button className="md:hidden text-slate-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
//                    {isMobileMenuOpen ? <X /> : <Menu />}
//                 </button>
//               </div>
//             </div>

//             {/* Mobile Menu Restored */}
//             {isMobileMenuOpen && (
//               <div className="md:hidden mt-4 pb-4 border-t pt-4">
//                  <div className="flex bg-slate-100 rounded-lg p-1 mb-4">
//                   <button 
//                     onClick={() => { setMode('retail'); setIsMobileMenuOpen(false); }}
//                     className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === 'retail' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
//                   >
//                     Retail
//                   </button>
//                   <button 
//                     onClick={() => { setMode('wholesale'); setIsMobileMenuOpen(false); }}
//                     className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === 'wholesale' ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}
//                   >
//                     Wholesale
//                   </button>
//                 </div>
//                 <div className="space-y-3 text-slate-700 font-medium">
//                   <button onClick={() => { setView('home'); setIsMobileMenuOpen(false); }} className="block w-full text-left hover:text-red-600">Home</button>
//                   <button onClick={() => { setView('shop'); setIsMobileMenuOpen(false); }} className="block w-full text-left hover:text-red-600">Shop Catalog</button>
//                   <button onClick={() => { setView('login'); setIsMobileMenuOpen(false); }} className="block w-full text-left text-blue-600">Login / Register</button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </nav>
//       )}

//       <main className="flex-1">{renderView()}</main>

//       {/* Detailed Footer Restored */}
//       {view !== 'admin' && (
//         <footer className="bg-slate-900 text-slate-400 py-12">
//           <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
//             <div>
//               <h4 className="text-white font-bold text-lg mb-4">AGRA SHOES</h4>
//               <p className="mb-4">Digitizing the legacy of Agra's shoemaking. We connect manufacturers directly to retailers across India.</p>
//               <p>Agra, Uttar Pradesh, India - 282002</p>
//             </div>
//             <div>
//               <h4 className="text-white font-bold mb-4">Shop</h4>
//               <ul className="space-y-2">
//                 <li className="hover:text-white cursor-pointer">Men's Formal</li>
//                 <li className="hover:text-white cursor-pointer">Casual Loafers</li>
//                 <li className="hover:text-white cursor-pointer">Safety Shoes</li>
//                 <li className="hover:text-white cursor-pointer">School Shoes</li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="text-white font-bold mb-4">Wholesale</h4>
//               <ul className="space-y-2">
//                 <li className="hover:text-white cursor-pointer">Register as Distributor</li>
//                 <li className="hover:text-white cursor-pointer">Bulk Pricing Policy</li>
//                 <li className="hover:text-white cursor-pointer">Shipping & Logistics</li>
//                 <li className="hover:text-white cursor-pointer">Return Policy</li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="text-white font-bold mb-4">Stay Connected</h4>
//               <p className="mb-4">Get latest design updates on WhatsApp.</p>
//               <div className="flex gap-2">
//                 <input type="text" placeholder="+91 Mobile Number" className="bg-slate-800 border-none rounded px-3 py-2 w-full text-white outline-none focus:ring-1 focus:ring-slate-600" />
//                 <button className="bg-green-600 text-white px-3 py-2 rounded font-bold hover:bg-green-700">Join</button>
//               </div>
//             </div>
//           </div>
//           <div className="text-center mt-12 pt-8 border-t border-slate-800">
//             &copy; 2025 Agra Wholesale Shoe Mart. All rights reserved.
//           </div>
//         </footer>
//       )}

//       {showToast && (
//         <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-bounce z-50">
//           <CheckCircle size={20} className="text-green-400" />
//           <p className="font-bold text-sm">Added to Cart</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;
// import React, { useState, useEffect } from 'react';
// import { 
//   ShoppingCart, User, Phone, Menu, X, CheckCircle, Truck, 
//   ShieldCheck, Info, Package, ArrowRight, Trash2, Filter, 
//   Search, LayoutDashboard, LogOut, ClipboardList, Users
// } from 'lucide-react';

// // --- MOCK DATABASE (Simulating a Backend) ---
// const INITIAL_PRODUCTS = [
//   { id: 1, name: 'Agra Classic Loafer', category: 'Men\'s Formal', retailPrice: 1499, wholesalePrice: 450, moq: 24, stock: 1000, image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800&auto=format&fit=crop', tag: 'Best Seller' },
//   { id: 2, name: 'Genuine Leather Oxford', category: 'Office Wear', retailPrice: 2199, wholesalePrice: 750, moq: 12, stock: 500, image: 'https://images.unsplash.com/photo-1478186172493-493ca852a743?q=80&w=800&auto=format&fit=crop', tag: 'Premium' },
//   { id: 3, name: 'Daily Soft Sandal', category: 'Women\'s Comfort', retailPrice: 899, wholesalePrice: 220, moq: 48, stock: 2000, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop', tag: 'High Demand' },
//   { id: 4, name: 'Rugged Chelsea Boot', category: 'Men\'s Boots', retailPrice: 2899, wholesalePrice: 950, moq: 12, stock: 300, image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800&auto=format&fit=crop', tag: 'New Arrival' },
//   { id: 5, name: 'Canvas Sneaker', category: 'Casual', retailPrice: 999, wholesalePrice: 310, moq: 36, stock: 800, image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop', tag: null },
//   { id: 6, name: 'Kids School Shoe', category: 'School', retailPrice: 699, wholesalePrice: 180, moq: 60, stock: 5000, image: 'https://images.unsplash.com/photo-1515347619252-60a6bf4fffce?q=80&w=800&auto=format&fit=crop', tag: 'Back to School' },
// ];

// const CATEGORIES = ['All', 'Men\'s Formal', 'Office Wear', 'Women\'s Comfort', 'Men\'s Boots', 'Casual', 'School'];

// // --- COMPONENTS ---

// const ProductCard = ({ product, mode, onAddToCart }) => {
//   const [showMatrix, setShowMatrix] = useState(false);
//   const [quantities, setQuantities] = useState({ 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 });
  
//   const totalPairs = Object.values(quantities).reduce((a, b) => a + Number(b), 0);
//   const matrixTotalCost = totalPairs * product.wholesalePrice;

//   const handleWholesaleAdd = () => {
//     if (totalPairs < product.moq) {
//       alert(`Minimum Order Quantity is ${product.moq} pairs.`);
//       return;
//     }
//     onAddToCart({
//       ...product,
//       type: 'wholesale',
//       breakdown: quantities,
//       quantity: totalPairs,
//       price: product.wholesalePrice
//     });
//     setQuantities({ 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 });
//     setShowMatrix(false);
//   };

//   const handleRetailAdd = () => {
//     onAddToCart({
//       ...product,
//       type: 'retail',
//       quantity: 1,
//       price: product.retailPrice
//     });
//   };

//   return (
//     <div className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
//       <div className="relative h-64 overflow-hidden bg-slate-100">
//         <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
//         {product.tag && <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] uppercase font-bold px-2 py-1 rounded backdrop-blur-sm">{product.tag}</span>}
//         {mode === 'wholesale' && <span className="absolute top-2 left-2 bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm">MOQ: {product.moq}</span>}
//       </div>

//       <div className="p-4 flex-1 flex flex-col">
//         <div className="mb-2">
//           <span className="text-xs text-slate-500 uppercase tracking-wide">{product.category}</span>
//           <h3 className="text-lg font-bold text-slate-800 leading-tight">{product.name}</h3>
//         </div>
        
//         <div className="mt-auto pt-4 border-t border-slate-100">
//           <div className="flex justify-between items-end mb-4">
//             <div>
//               <p className="text-xs text-slate-500 mb-0.5">Price per pair</p>
//               <div className="flex items-baseline gap-2">
//                 <span className="text-xl font-bold text-slate-900">₹{mode === 'retail' ? product.retailPrice : product.wholesalePrice}</span>
//                 {mode === 'retail' && <span className="text-xs text-red-500 line-through">₹{Math.floor(product.retailPrice * 1.2)}</span>}
//               </div>
//               {mode === 'wholesale' && <p className="text-[10px] text-red-600 font-medium">*Excl. GST</p>}
//             </div>
            
//             {mode === 'retail' ? (
//               <button onClick={handleRetailAdd} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-200">Add</button>
//             ) : (
//               <button onClick={() => setShowMatrix(!showMatrix)} className={`px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg ${showMatrix ? 'bg-slate-200 text-slate-800' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}>{showMatrix ? 'Close' : 'Bulk'}</button>
//             )}
//           </div>

//           {mode === 'wholesale' && showMatrix && (
//             <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2">
//               <div className="grid grid-cols-5 gap-1 mb-3">
//                 {[6, 7, 8, 9, 10].map((size) => (
//                   <div key={size} className="text-center">
//                     <label className="block text-[10px] text-slate-500">UK {size}</label>
//                     <input type="number" min="0" value={quantities[size] || ''} onChange={(e) => setQuantities(prev => ({...prev, [size]: e.target.value}))} className="w-full border border-slate-300 rounded p-1 text-center text-xs" placeholder="0" />
//                   </div>
//                 ))}
//               </div>
//               <div className="flex justify-between text-xs mb-2">
//                 <span>Pairs: <strong>{totalPairs}</strong></span>
//                 <span>Total: <strong className="text-blue-600">₹{matrixTotalCost}</strong></span>
//               </div>
//               <button onClick={handleWholesaleAdd} disabled={totalPairs === 0} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white py-1.5 rounded text-xs font-bold uppercase">Add Batch</button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- VIEWS ---

// const AdminDashboard = ({ orders, setView }) => {
//   const pendingOrders = orders.filter(o => o.status === 'Pending').length;
//   const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);

//   return (
//     <div className="container mx-auto px-4 py-8 bg-slate-50 min-h-screen">
//       <div className="flex justify-between items-center mb-8">
//         <h2 className="text-2xl font-bold text-slate-900">Owner Dashboard</h2>
//         <button onClick={() => setView('home')} className="text-slate-500 hover:text-red-600 flex items-center gap-2"><LogOut size={16}/> Exit Admin</button>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
//           <div className="flex items-center gap-4">
//             <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><ClipboardList /></div>
//             <div>
//               <p className="text-slate-500 text-sm">Total Orders</p>
//               <h3 className="text-2xl font-bold text-slate-900">{orders.length}</h3>
//             </div>
//           </div>
//         </div>
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
//           <div className="flex items-center gap-4">
//             <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><Package /></div>
//             <div>
//               <p className="text-slate-500 text-sm">Pending Shipments</p>
//               <h3 className="text-2xl font-bold text-slate-900">{pendingOrders}</h3>
//             </div>
//           </div>
//         </div>
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
//           <div className="flex items-center gap-4">
//             <div className="p-3 bg-green-100 text-green-600 rounded-lg"><Users /></div>
//             <div>
//               <p className="text-slate-500 text-sm">Total Revenue (Est)</p>
//               <h3 className="text-2xl font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</h3>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Orders Table */}
//       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//         <div className="p-6 border-b border-slate-100">
//           <h3 className="font-bold text-lg text-slate-800">Recent Orders</h3>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full text-left text-sm">
//             <thead className="bg-slate-50 text-slate-500 font-medium">
//               <tr>
//                 <th className="p-4">Order ID</th>
//                 <th className="p-4">Customer</th>
//                 <th className="p-4">Type</th>
//                 <th className="p-4">Items</th>
//                 <th className="p-4">Total</th>
//                 <th className="p-4">Status</th>
//                 <th className="p-4">Action</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {orders.length === 0 ? (
//                 <tr><td colSpan="7" className="p-8 text-center text-slate-400">No orders received yet.</td></tr>
//               ) : orders.map((order) => (
//                 <tr key={order.id} className="hover:bg-slate-50 transition">
//                   <td className="p-4 font-mono text-xs">{order.id}</td>
//                   <td className="p-4">
//                     <div className="font-bold text-slate-900">{order.customer.name}</div>
//                     <div className="text-xs text-slate-500">{order.customer.phone}</div>
//                   </td>
//                   <td className="p-4">
//                     <span className={`px-2 py-1 rounded text-xs font-bold ${order.type === 'wholesale' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
//                       {order.type.toUpperCase()}
//                     </span>
//                   </td>
//                   <td className="p-4 text-slate-600">{order.items.length} Products</td>
//                   <td className="p-4 font-bold text-slate-900">₹{order.total}</td>
//                   <td className="p-4">
//                     <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold">{order.status}</span>
//                   </td>
//                   <td className="p-4">
//                     <button className="text-blue-600 hover:underline">View Details</button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// const ShopView = ({ products, mode, onAddToCart }) => {
//   const [filter, setFilter] = useState('All');
//   const [searchTerm, setSearchTerm] = useState('');
  
//   const filteredProducts = products.filter(p => {
//     const matchesCategory = filter === 'All' || p.category === filter;
//     const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
//         <h2 className="text-3xl font-bold text-slate-900">{mode === 'wholesale' ? 'Wholesale Catalog' : 'Shop All'}</h2>
        
//         {/* Search Bar */}
//         <div className="relative w-full md:w-64">
//           <input 
//             type="text" 
//             placeholder="Search shoes..." 
//             className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
//         </div>
//       </div>

//       {/* Category Pills */}
//       <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4">
//         <Filter size={18} className="text-slate-400 shrink-0" />
//         {CATEGORIES.map(cat => (
//           <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${filter === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
//             {cat}
//           </button>
//         ))}
//       </div>

//       {filteredProducts.length === 0 ? (
//         <div className="text-center py-20 text-slate-400">No products found matching your search.</div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {filteredProducts.map(product => (
//             <ProductCard key={product.id} product={product} mode={mode} onAddToCart={onAddToCart} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// // ... (CartView, CheckoutView, HomeView reused with minimal changes)
// // For brevity, using simplified versions of Cart/Checkout/Home but integrated fully

// const HomeView = ({ setView, mode }) => (
//   <div className="bg-white">
//     <div className="container mx-auto px-4 py-16 flex flex-col md:flex-row items-center gap-12">
//       <div className="flex-1">
//         <h1 className="text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
//           {mode === 'wholesale' ? 'Agra to India.' : 'Walk with Pride.'} <br/>
//           <span className="text-red-600">{mode === 'wholesale' ? 'Bulk Direct.' : 'Agra Handcrafted.'}</span>
//         </h1>
//         <p className="text-lg text-slate-600 mb-8">
//           {mode === 'wholesale' ? 'Join 500+ retailers sourcing directly from our factory. Best rates, guaranteed quality.' : 'Premium leather shoes delivered from the manufacturing capital of India.'}
//         </p>
//         <button onClick={() => setView('shop')} className="bg-slate-900 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-slate-800 transition shadow-lg">
//           {mode === 'wholesale' ? 'Browse Catalog' : 'Shop Now'}
//         </button>
//       </div>
//       <div className="flex-1">
//          <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop" className="rounded-2xl shadow-2xl rotate-2 hover:rotate-0 transition duration-500" alt="Hero"/>
//       </div>
//     </div>
//   </div>
// );

// const CartView = ({ cart, mode, removeFromCart, setView }) => {
//   const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
//   const gst = mode === 'wholesale' ? total * 0.12 : 0;

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-4xl">
//       <h2 className="text-2xl font-bold mb-6">Your Cart</h2>
//       {cart.length === 0 ? <p>Empty Cart</p> : (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//           <div className="md:col-span-2 space-y-4">
//             {cart.map((item, idx) => (
//               <div key={idx} className="flex gap-4 border p-4 rounded-lg bg-white">
//                 <img src={item.image} className="w-20 h-20 object-cover rounded" alt=""/>
//                 <div className="flex-1">
//                   <div className="flex justify-between">
//                     <h3 className="font-bold">{item.name}</h3>
//                     <button onClick={() => removeFromCart(idx)}><Trash2 size={16} className="text-red-500"/></button>
//                   </div>
//                   <p className="text-sm text-slate-500">{item.type === 'wholesale' ? `Bulk Batch (${item.quantity} pairs)` : '1 Pair'}</p>
//                   <p className="font-bold mt-2">₹{item.price * item.quantity}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//           <div className="bg-slate-50 p-6 rounded-lg h-fit">
//             <h3 className="font-bold mb-4">Summary</h3>
//             <div className="flex justify-between mb-2"><span>Subtotal</span><span>₹{total}</span></div>
//             {mode === 'wholesale' && <div className="flex justify-between mb-2 text-sm text-slate-500"><span>GST (12%)</span><span>₹{gst}</span></div>}
//             <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Total</span><span>₹{total + gst}</span></div>
//             <button onClick={() => setView('checkout')} className="w-full bg-slate-900 text-white py-3 rounded mt-4 font-bold">Checkout</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const CheckoutView = ({ cart, mode, placeOrder, setView }) => {
//   const [form, setForm] = useState({ name: '', phone: '', address: '' });
//   return (
//     <div className="container mx-auto px-4 py-8 max-w-lg">
//       <h2 className="text-2xl font-bold mb-6">Finalize Order</h2>
//       <form onSubmit={(e) => { e.preventDefault(); placeOrder(form); }} className="space-y-4">
//         <input required placeholder="Name" className="w-full border p-3 rounded" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
//         <input required placeholder="Phone" className="w-full border p-3 rounded" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
//         <textarea required placeholder="Address" className="w-full border p-3 rounded" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
//         <button className="w-full bg-green-600 text-white py-3 rounded font-bold">Confirm Order</button>
//       </form>
//     </div>
//   );
// };

// const LoginView = ({ setMode, setView, setUser }) => {
//   const [email, setEmail] = useState('');
  
//   const handleLogin = (e) => {
//     e.preventDefault();
//     if (email.includes('admin')) {
//       setUser({ name: 'Owner', type: 'admin', email });
//       setView('admin');
//     } else {
//       setUser({ name: 'Verified Buyer', type: 'wholesale', email });
//       setMode('wholesale');
//       setView('shop');
//     }
//   };

//   return (
//     <div className="min-h-[60vh] flex items-center justify-center px-4">
//       <div className="w-full max-w-md bg-white border p-8 rounded-xl shadow-lg">
//         <h2 className="text-2xl font-bold mb-2">Login</h2>
//         <p className="text-slate-500 mb-6 text-sm">Use 'admin@agra.com' for Owner Dashboard</p>
//         <form onSubmit={handleLogin} className="space-y-4">
//           <input type="email" required placeholder="Email" className="w-full border p-3 rounded" value={email} onChange={e => setEmail(e.target.value)} />
//           <input type="password" placeholder="Password (Any)" className="w-full border p-3 rounded" />
//           <button className="w-full bg-slate-900 text-white py-3 rounded font-bold">Login</button>
//         </form>
//       </div>
//     </div>
//   );
// };

// // --- MAIN CONTROLLER ---

// const App = () => {
//   const [view, setView] = useState('home');
//   const [mode, setMode] = useState('retail');
//   const [cart, setCart] = useState([]);
//   const [user, setUser] = useState(null);
//   const [products] = useState(INITIAL_PRODUCTS);
//   const [orders, setOrders] = useState([]); // This acts as our database
//   const [showToast, setShowToast] = useState(false);

//   const addToCart = (item) => {
//     setCart([...cart, item]);
//     setShowToast(true);
//     setTimeout(() => setShowToast(false), 3000);
//   };

//   const removeFromCart = (index) => {
//     const newCart = [...cart];
//     newCart.splice(index, 1);
//     setCart(newCart);
//   };

//   const placeOrder = (customerDetails) => {
//     const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
//     const gst = mode === 'wholesale' ? total * 0.12 : 0;
    
//     const newOrder = {
//       id: 'ORD-' + Math.floor(Math.random() * 10000),
//       customer: customerDetails,
//       items: cart,
//       total: total + gst,
//       type: mode,
//       status: 'Pending',
//       date: new Date().toISOString()
//     };

//     setOrders([newOrder, ...orders]); // Save to "Database"
//     setCart([]);
//     setView('success');
//   };

//   const renderView = () => {
//     switch(view) {
//       case 'home': return <HomeView setView={setView} mode={mode} />;
//       case 'shop': return <ShopView products={products} mode={mode} onAddToCart={addToCart} />;
//       case 'cart': return <CartView cart={cart} mode={mode} removeFromCart={removeFromCart} setView={setView} />;
//       case 'checkout': return <CheckoutView cart={cart} mode={mode} placeOrder={placeOrder} setView={setView} />;
//       case 'login': return <LoginView setMode={setMode} setView={setView} setUser={setUser} />;
//       case 'admin': return <AdminDashboard orders={orders} setView={setView} />;
//       case 'success': return (
//         <div className="container mx-auto px-4 py-20 text-center">
//           <CheckCircle size={64} className="mx-auto text-green-500 mb-4"/>
//           <h2 className="text-3xl font-bold mb-4">Order Received!</h2>
//           <p className="mb-8">Order ID generated. Check Admin Dashboard to see it.</p>
//           <button onClick={() => setView('home')} className="bg-slate-900 text-white px-6 py-2 rounded">Continue</button>
//         </div>
//       );
//       default: return <HomeView setView={setView} mode={mode} />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
//       {/* Navbar (Hidden in Admin Mode) */}
//       {view !== 'admin' && (
//         <nav className="bg-white shadow-md sticky top-0 z-50">
//           <div className="container mx-auto px-4 py-4 flex justify-between items-center">
//             <div onClick={() => setView('home')} className="flex items-center gap-2 cursor-pointer">
//               <div className="bg-red-600 text-white p-1 rounded font-bold text-xl">ASM</div>
//               <div className="text-2xl font-bold tracking-tighter leading-none hidden sm:block">AGRA<span className="text-red-600">SHOES</span></div>
//             </div>

//             <div className="flex items-center gap-4">
//               <div className="hidden md:flex bg-slate-100 rounded-full p-1 mr-2">
//                 <button onClick={() => setMode('retail')} className={`px-4 py-1 text-xs font-bold rounded-full ${mode === 'retail' ? 'bg-white shadow' : ''}`}>Retail</button>
//                 <button onClick={() => setMode('wholesale')} className={`px-4 py-1 text-xs font-bold rounded-full ${mode === 'wholesale' ? 'bg-slate-900 text-white shadow' : ''}`}>Wholesale</button>
//               </div>
//               <button onClick={() => setView('cart')} className="relative">
//                 <ShoppingCart size={24} />
//                 {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">{cart.length}</span>}
//               </button>
//               {user ? (
//                 <button onClick={() => user.type === 'admin' ? setView('admin') : setView('home')} className="flex items-center gap-2 font-bold text-sm bg-slate-100 px-3 py-2 rounded-lg">
//                   <User size={16}/> {user.name}
//                 </button>
//               ) : (
//                 <button onClick={() => setView('login')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Login</button>
//               )}
//             </div>
//           </div>
//         </nav>
//       )}

//       <main className="flex-1">{renderView()}</main>

//       {view !== 'admin' && (
//         <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
//           <p>&copy; 2025 Agra Shoe Mart. Wholesale & Retail.</p>
//         </footer>
//       )}

//       {showToast && (
//         <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-bounce z-50">
//           <CheckCircle size={20} className="text-green-400" />
//           <p className="font-bold text-sm">Added to Cart</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;
// import React, { useState, useEffect } from 'react';
// import { 
//   ShoppingCart, 
//   User, 
//   Phone, 
//   Menu, 
//   X, 
//   CheckCircle, 
//   Truck, 
//   ShieldCheck, 
//   Info,
//   Package,
//   ArrowRight
// } from 'lucide-react';

// // --- MOCK DATA ---
// const PRODUCTS = [
//   { 
//     id: 1, 
//     name: 'Agra Classic Loafer', 
//     category: 'Men\'s Formal', 
//     retailPrice: 1499, 
//     wholesalePrice: 450, 
//     moq: 24,
//     image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800&auto=format&fit=crop',
//     tag: 'Best Seller'
//   },
//   { 
//     id: 2, 
//     name: 'Genuine Leather Oxford', 
//     category: 'Office Wear', 
//     retailPrice: 2199, 
//     wholesalePrice: 750, 
//     moq: 12,
//     image: 'https://images.unsplash.com/photo-1478186172493-493ca852a743?q=80&w=800&auto=format&fit=crop',
//     tag: 'Premium'
//   },
//   { 
//     id: 3, 
//     name: 'Daily Soft Sandal', 
//     category: 'Women\'s Comfort', 
//     retailPrice: 899, 
//     wholesalePrice: 220, 
//     moq: 48,
//     image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop',
//     tag: 'High Demand'
//   },
//   { 
//     id: 4, 
//     name: 'Rugged Chelsea Boot', 
//     category: 'Men\'s Boots', 
//     retailPrice: 2899, 
//     wholesalePrice: 950, 
//     moq: 12,
//     image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800&auto=format&fit=crop',
//     tag: 'New Arrival'
//   },
//   { 
//     id: 5, 
//     name: 'Canvas Sneaker', 
//     category: 'Casual', 
//     retailPrice: 999, 
//     wholesalePrice: 310, 
//     moq: 36,
//     image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop',
//     tag: null
//   },
//   { 
//     id: 6, 
//     name: 'Kids School Shoe', 
//     category: 'School', 
//     retailPrice: 699, 
//     wholesalePrice: 180, 
//     moq: 60,
//     image: 'https://images.unsplash.com/photo-1515347619252-60a6bf4fffce?q=80&w=800&auto=format&fit=crop',
//     tag: 'Back to School'
//   },
// ];

// // --- COMPONENTS ---

// // 1. Navigation Bar
// const Navbar = ({ mode, setMode, cartCount }) => {
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   return (
//     <nav className="bg-white shadow-md sticky top-0 z-50">
//       {/* Top Bar - Trust Signals */}
//       <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 flex justify-between items-center">
//         <span className="hidden sm:inline">Agra's Trusted Shoe Wholesaler - Since 2003</span>
//         <span className="sm:hidden">Agra Shoe Mart - Est. 2003</span>
//         <div className="flex items-center gap-4">
//           <span className="flex items-center gap-1 hover:text-white cursor-pointer transition">
//             <Phone size={14} /> +91 98765-XXXXX
//           </span>
//           <span className="text-amber-500 font-bold cursor-pointer hover:underline hidden sm:block">
//             Request Sample Kit
//           </span>
//         </div>
//       </div>

//       {/* Main Nav */}
//       <div className="container mx-auto px-4 py-4">
//         <div className="flex justify-between items-center">
//           {/* Logo */}
//           <div className="flex items-center gap-2">
//             <div className="bg-red-600 text-white p-1 rounded font-bold text-xl">ASM</div>
//             <div className="text-2xl font-bold tracking-tighter text-slate-800 leading-none">
//               AGRA<span className="text-red-600">SHOES</span>
//               <div className="text-[10px] text-slate-500 font-normal tracking-wide">
//                 WHOLESALE & RETAIL
//               </div>
//             </div>
//           </div>

//           {/* Mode Switcher (Desktop) */}
//           <div className="hidden md:flex bg-slate-100 rounded-full p-1 border border-slate-200">
//             <button 
//               onClick={() => setMode('retail')}
//               className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
//                 mode === 'retail' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
//               }`}
//             >
//               Retail Shop
//             </button>
//             <button 
//               onClick={() => setMode('wholesale')}
//               className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
//                 mode === 'wholesale' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
//               }`}
//             >
//               Wholesale Portal <Package size={14} />
//             </button>
//           </div>

//           {/* Actions */}
//           <div className="flex items-center gap-4 sm:gap-6">
//             <div className="relative cursor-pointer group">
//               <ShoppingCart className="text-slate-700 group-hover:text-red-600 transition" />
//               {cartCount > 0 && (
//                 <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
//                   {cartCount}
//                 </span>
//               )}
//             </div>
//             <button className="hidden sm:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm">
//               <User size={18} />
//               {mode === 'wholesale' ? 'Distributor Login' : 'Login'}
//             </button>
//             <button 
//               className="md:hidden text-slate-700"
//               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//             >
//               {isMobileMenuOpen ? <X /> : <Menu />}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Menu & Mode Switcher */}
//         {isMobileMenuOpen && (
//           <div className="md:hidden mt-4 pb-4 border-t pt-4">
//              <div className="flex bg-slate-100 rounded-lg p-1 mb-4">
//               <button 
//                 onClick={() => { setMode('retail'); setIsMobileMenuOpen(false); }}
//                 className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === 'retail' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
//               >
//                 Retail
//               </button>
//               <button 
//                 onClick={() => { setMode('wholesale'); setIsMobileMenuOpen(false); }}
//                 className={`flex-1 py-2 rounded-md text-sm font-medium ${mode === 'wholesale' ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}
//               >
//                 Wholesale
//               </button>
//             </div>
//             <div className="space-y-3 text-slate-700 font-medium">
//               <a href="#" className="block hover:text-red-600">Categories</a>
//               <a href="#" className="block hover:text-red-600">About Agra Heritage</a>
//               <a href="#" className="block hover:text-red-600">Contact Us</a>
//               <a href="#" className="block text-blue-600">Login / Register</a>
//             </div>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// };

// // 2. Product Card with Size Matrix
// const ProductCard = ({ product, mode, onAddToCart }) => {
//   const [showMatrix, setShowMatrix] = useState(false);
//   const [quantities, setQuantities] = useState({ 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 });
  
//   // Calculate total pairs selected in matrix
//   const totalPairs = Object.values(quantities).reduce((a, b) => a + Number(b), 0);
//   const matrixTotalCost = totalPairs * product.wholesalePrice;

//   const handleQuantityChange = (size, qty) => {
//     setQuantities(prev => ({ ...prev, [size]: qty }));
//   };

//   const handleWholesaleAdd = () => {
//     if (totalPairs < product.moq) {
//       alert(`Minimum Order Quantity is ${product.moq} pairs for wholesale pricing.`);
//       return;
//     }
//     onAddToCart(totalPairs);
//     setQuantities({ 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 }); // Reset
//     setShowMatrix(false);
//     alert(`${totalPairs} pairs added to bulk order!`);
//   };

//   return (
//     <div className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
//       {/* Image Area */}
//       <div className="relative h-64 overflow-hidden bg-slate-100">
//         <img 
//           src={product.image} 
//           alt={product.name} 
//           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//         />
//         {product.tag && (
//           <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] uppercase font-bold px-2 py-1 rounded backdrop-blur-sm">
//             {product.tag}
//           </span>
//         )}
//         {mode === 'wholesale' && (
//           <div className="absolute top-2 left-2 flex flex-col gap-1">
//             <span className="bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm">
//               MOQ: {product.moq} Pairs
//             </span>
//           </div>
//         )}
//       </div>

//       {/* Content Area */}
//       <div className="p-4 flex-1 flex flex-col">
//         <div className="mb-2">
//           <span className="text-xs text-slate-500 uppercase tracking-wide">{product.category}</span>
//           <h3 className="text-lg font-bold text-slate-800 leading-tight">{product.name}</h3>
//         </div>
        
//         <div className="mt-auto pt-4 border-t border-slate-100">
//           <div className="flex justify-between items-end mb-4">
//             <div>
//               <p className="text-xs text-slate-500 mb-0.5">Price per pair</p>
//               <div className="flex items-baseline gap-2">
//                 <span className="text-xl font-bold text-slate-900">
//                   ₹{mode === 'retail' ? product.retailPrice : product.wholesalePrice}
//                 </span>
//                 {mode === 'retail' && (
//                    <span className="text-xs text-red-500 line-through">₹{Math.floor(product.retailPrice * 1.2)}</span>
//                 )}
//               </div>
//               {mode === 'wholesale' && (
//                 <p className="text-[10px] text-red-600 font-medium">*Excl. 12% GST</p>
//               )}
//             </div>
            
//             {mode === 'retail' ? (
//               <button 
//                 onClick={() => onAddToCart(1)}
//                 className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-200"
//               >
//                 Add to Cart
//               </button>
//             ) : (
//               <button 
//                 onClick={() => setShowMatrix(!showMatrix)}
//                 className={`px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg ${
//                   showMatrix ? 'bg-slate-200 text-slate-800' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
//                 }`}
//               >
//                 {showMatrix ? 'Close' : 'Bulk Order'}
//               </button>
//             )}
//           </div>

//           {/* WHOLESALE MATRIX - THE EFFICIENCY FEATURE */}
//           {mode === 'wholesale' && showMatrix && (
//             <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
//               <div className="flex justify-between items-center mb-2">
//                 <p className="text-xs font-bold text-slate-700">ENTER QUANTITY:</p>
//                 <p className="text-[10px] text-slate-500">Min Total: {product.moq}</p>
//               </div>
              
//               <div className="grid grid-cols-5 gap-1 mb-3">
//                 {[6, 7, 8, 9, 10].map((size) => (
//                   <div key={size} className="text-center">
//                     <label className="block text-[10px] text-slate-500 mb-0.5">UK {size}</label>
//                     <input 
//                       type="number" 
//                       min="0"
//                       value={quantities[size] || ''}
//                       onChange={(e) => handleQuantityChange(size, e.target.value)}
//                       className="w-full border border-slate-300 rounded p-1 text-center text-xs focus:ring-1 focus:ring-blue-500 outline-none"
//                       placeholder="0"
//                     />
//                   </div>
//                 ))}
//               </div>

//               <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-100 mb-2">
//                 <span className="text-xs text-slate-500">Total Pairs: <strong className="text-slate-800">{totalPairs}</strong></span>
//                 <span className="text-xs text-slate-500">Total: <strong className="text-blue-600">₹{matrixTotalCost}</strong></span>
//               </div>

//               <button 
//                 onClick={handleWholesaleAdd}
//                 disabled={totalPairs === 0}
//                 className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-1.5 rounded text-xs font-bold uppercase tracking-wide transition"
//               >
//                 Add Batch
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // 3. Hero Section
// const Hero = ({ mode }) => {
//   return (
//     <div className="bg-white border-b border-slate-200">
//       <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row items-center gap-10">
//         <div className="flex-1 text-center md:text-left">
//           <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold mb-6">
//             <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
//             {mode === 'wholesale' ? 'ACCEPTING NEW DISTRIBUTORS' : 'SEASONAL SALE IS LIVE'}
//           </div>
//           <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
//             {mode === 'wholesale' ? (
//               <>
//                 Factory Direct.<br />
//                 <span className="text-blue-600">Maximize Margins.</span>
//               </>
//             ) : (
//               <>
//                 Handcrafted in Agra.<br />
//                 <span className="text-red-600">Worn Everywhere.</span>
//               </>
//             )}
//           </h1>
//           <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
//             {mode === 'wholesale' 
//               ? 'Connect directly with our 20-year-old manufacturing unit. Get transparent pricing, bulk shipping support, and custom branding options.' 
//               : 'Discover the finest leather shoes directly from the shoe capital of India. Premium quality, honest prices, delivered to your doorstep.'}
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
//             <button className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2">
//               {mode === 'wholesale' ? 'View Catalog' : 'Shop Collection'} <ArrowRight size={18} />
//             </button>
//             {mode === 'wholesale' && (
//               <button className="border border-slate-300 text-slate-700 px-8 py-3 rounded-lg font-semibold hover:bg-slate-50 transition">
//                 Talk to Sales
//               </button>
//             )}
//           </div>
//         </div>
        
//         {/* Abstract/Hero Image Area */}
//         <div className="flex-1 w-full max-w-md md:max-w-full">
//            <div className="relative">
//              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-amber-50 rounded-2xl transform rotate-3"></div>
//              <img 
//                src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop" 
//                alt="Shoe Craftsmanship" 
//                className="relative rounded-2xl shadow-2xl w-full h-auto object-cover transform -rotate-2 hover:rotate-0 transition duration-700"
//              />
//              {mode === 'wholesale' && (
//                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3">
//                  <div className="bg-green-100 p-2 rounded-full text-green-600"><CheckCircle size={24} /></div>
//                  <div>
//                    <p className="text-sm font-bold text-slate-800">Verified Manufacturer</p>
//                    <p className="text-xs text-slate-500">GST Registered • IEC License</p>
//                  </div>
//                </div>
//              )}
//            </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // 4. Features/Trust Section
// const Features = () => (
//   <div className="bg-slate-50 py-12 border-y border-slate-200">
//     <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-blue-600">
//           <Truck />
//         </div>
//         <h3 className="font-bold text-slate-800 mb-2">Nationwide Delivery</h3>
//         <p className="text-sm text-slate-500 px-4">From Agra to anywhere in India. We use trusted B2B logistics partners.</p>
//       </div>
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-amber-500">
//           <ShieldCheck />
//         </div>
//         <h3 className="font-bold text-slate-800 mb-2">Quality Guarantee</h3>
//         <p className="text-sm text-slate-500 px-4">Every pair is inspected before packing. 20 years of reputation at stake.</p>
//       </div>
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-red-600">
//           <Info />
//         </div>
//         <h3 className="font-bold text-slate-800 mb-2">Direct Support</h3>
//         <p className="text-sm text-slate-500 px-4">Call us anytime. We believe in building relationships, not just sales.</p>
//       </div>
//     </div>
//   </div>
// );

// // --- MAIN APP ---
// const App = () => {
//   const [mode, setMode] = useState('wholesale');
//   const [cartCount, setCartCount] = useState(0);
//   const [showNotification, setShowNotification] = useState(false);

//   // Simulate adding to cart
//   const handleAddToCart = (quantity) => {
//     setCartCount(prev => prev + quantity);
//     setShowNotification(true);
//     setTimeout(() => setShowNotification(false), 3000);
//   };

//   return (
//     <div className="min-h-screen bg-white font-sans text-slate-900">
//       <Navbar mode={mode} setMode={setMode} cartCount={cartCount} />
      
//       <Hero mode={mode} />
      
//       <main className="container mx-auto px-4 py-16">
//         <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
//           <div>
//             <h2 className="text-3xl font-bold text-slate-900 mb-2">
//               {mode === 'wholesale' ? 'Wholesale Catalog' : 'Featured Collection'}
//             </h2>
//             <p className="text-slate-500">
//               {mode === 'wholesale' 
//                 ? 'Bulk pricing applies automatically based on order volume.' 
//                 : 'Browse our latest designs available for immediate dispatch.'}
//             </p>
//           </div>
          
//           {/* Filter / Sort Mockup */}
//           <div className="flex gap-2">
//             <select className="bg-white border border-slate-300 text-sm rounded-lg px-4 py-2 outline-none focus:border-blue-500">
//               <option>All Categories</option>
//               <option>Men's Formal</option>
//               <option>Casual</option>
//               <option>Boots</option>
//             </select>
//             <select className="bg-white border border-slate-300 text-sm rounded-lg px-4 py-2 outline-none focus:border-blue-500">
//               <option>Sort by Price</option>
//               <option>Newest First</option>
//             </select>
//           </div>
//         </div>

//         {/* Product Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
//           {PRODUCTS.map((product) => (
//             <ProductCard 
//               key={product.id} 
//               product={product} 
//               mode={mode} 
//               onAddToCart={handleAddToCart}
//             />
//           ))}
//         </div>
//       </main>

//       <Features />

//       {/* Footer */}
//       <footer className="bg-slate-900 text-slate-400 py-12">
//         <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
//           <div>
//             <h4 className="text-white font-bold text-lg mb-4">AGRA SHOES</h4>
//             <p className="mb-4">Digitizing the legacy of Agra's shoemaking. We connect manufacturers directly to retailers across India.</p>
//             <p>Agra, Uttar Pradesh, India - 282002</p>
//           </div>
//           <div>
//             <h4 className="text-white font-bold mb-4">Shop</h4>
//             <ul className="space-y-2">
//               <li className="hover:text-white cursor-pointer">Men's Formal</li>
//               <li className="hover:text-white cursor-pointer">Casual Loafers</li>
//               <li className="hover:text-white cursor-pointer">Safety Shoes</li>
//               <li className="hover:text-white cursor-pointer">School Shoes</li>
//             </ul>
//           </div>
//           <div>
//             <h4 className="text-white font-bold mb-4">Wholesale</h4>
//             <ul className="space-y-2">
//               <li className="hover:text-white cursor-pointer">Register as Distributor</li>
//               <li className="hover:text-white cursor-pointer">Bulk Pricing Policy</li>
//               <li className="hover:text-white cursor-pointer">Shipping & Logistics</li>
//               <li className="hover:text-white cursor-pointer">Return Policy</li>
//             </ul>
//           </div>
//           <div>
//             <h4 className="text-white font-bold mb-4">Stay Connected</h4>
//             <p className="mb-4">Get latest design updates on WhatsApp.</p>
//             <div className="flex gap-2">
//               <input type="text" placeholder="+91 Mobile Number" className="bg-slate-800 border-none rounded px-3 py-2 w-full text-white" />
//               <button className="bg-green-600 text-white px-3 py-2 rounded font-bold hover:bg-green-700">Join</button>
//             </div>
//           </div>
//         </div>
//         <div className="text-center mt-12 pt-8 border-t border-slate-800">
//           &copy; 2024 Agra Wholesale Shoe Mart. All rights reserved.
//         </div>
//       </footer>

//       {/* Toast Notification */}
//       {showNotification && (
//         <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-bounce">
//           <CheckCircle size={20} className="text-green-400" />
//           <div>
//             <p className="font-bold text-sm">Added to Cart</p>
//             <p className="text-xs text-slate-300">Your selection has been saved.</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;