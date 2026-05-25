import React, { useState, useEffect } from 'react';
import { X, Upload, Info } from 'lucide-react';

const MenuModels = ({ isOpen, onClose, onSubmit, editingItem }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [defaultPrice, setDefaultPrice] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [category, setCategory] = useState('Uncategorized'); 

    useEffect(() => {
        if (editingItem) {
            setName(editingItem.name || '');
            setDescription(editingItem.description || '');
            setDefaultPrice(editingItem.defaultPrice || '');
            setCategory(editingItem.category || 'Uncategorized');
        } else {
            setName('');
            setDescription('');
            setDefaultPrice('');
            setCategory('Uncategorized');
        }
        setImageFile(null);
    }, [editingItem, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('defaultPrice', defaultPrice);
        formData.append('category', category); 
        if (imageFile) {
            formData.append('image', imageFile);
        }
        
        // Let parent handle submits
        onSubmit(formData);
    };

    const handleClose = () => {
        setName('');
        setDescription('');
        setDefaultPrice('');
        setImageFile(null);
        setCategory('Uncategorized');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-[2px] z-[100] flex items-center justify-center p-4">
            <div className="bg-white/90 backdrop-blur-xl border border-white/40 p-8 rounded-3xl shadow-2xl w-full max-w-md transition-all duration-300">
                <div className="flex items-start justify-between mb-6">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        {editingItem ? '✏️ Edit Menu Item' : '🍽️ Add Global Item'}
                    </h2>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-full transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    <div>
                        <label className="block mb-1.5 text-xs font-black uppercase tracking-wider text-slate-500">Item Name</label>
                        <input 
                            type="text" 
                            className="w-full bg-white/70 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-green-500 font-bold text-xs text-slate-800 shadow-sm transition" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                            placeholder="e.g. Premium Paneer Roll"
                        />
                    </div>

                    <div>
                        <label className="block mb-1.5 text-xs font-black uppercase tracking-wider text-slate-500">Category</label>
                        <select
                            className="w-full bg-white/70 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-green-500 font-bold text-xs text-slate-800 shadow-sm cursor-pointer transition" 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="Uncategorized">Uncategorized</option>
                            <option value="Appetizer">Appetizer</option>
                            <option value="Main Course">Main Course</option>
                            <option value="Dessert">Dessert</option>
                            <option value="Beverage">Beverage</option>
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1.5 text-xs font-black uppercase tracking-wider text-slate-500">Description</label>
                        <textarea 
                            className="w-full bg-white/70 border border-slate-200 p-3 rounded-xl h-24 focus:outline-none focus:border-green-500 font-semibold text-xs text-slate-800 shadow-sm transition" 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe ingredients, spice levels, and portions..."
                        />
                    </div>

                    <div>
                        <label className="block mb-1.5 text-xs font-black uppercase tracking-wider text-slate-500">Default Global Price (₹)</label>
                        <input 
                            type="number" 
                            step="0.01" 
                            className="w-full bg-white/70 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-green-500 font-bold text-xs text-slate-800 shadow-sm transition" 
                            value={defaultPrice} 
                            onChange={(e) => setDefaultPrice(e.target.value)} 
                            required 
                            placeholder="e.g. 120.00"
                        />
                    </div>

                    <div>
                        <label className="block mb-1.5 text-xs font-black uppercase tracking-wider text-slate-500">Item Image</label>
                        <div className="mt-2 flex items-center gap-4">
                            <label htmlFor="file-upload" className="cursor-pointer rounded-xl bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-extrabold text-emerald-600 border border-emerald-200 flex items-center gap-1.5 shadow-sm active:scale-95 transition-all">
                                <Upload className="w-4 h-4" />
                                <span>Upload Image</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => setImageFile(e.target.files[0])} accept="image/*" />
                            </label>
                            {imageFile ? (
                                <span className="text-xs text-slate-500 font-semibold truncate max-w-[180px]">{imageFile.name}</span>
                            ) : editingItem?.imageUrl ? (
                                <span className="text-xs text-slate-400 font-semibold truncate max-w-[180px]">Existing image kept</span>
                            ) : (
                                <span className="text-[10px] text-slate-400 font-semibold">No image selected</span>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                        <button type="button" onClick={handleClose} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition active:scale-95">
                            Cancel
                        </button>
                        <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95">
                            {editingItem ? 'Save Changes' : 'Create Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MenuModels;