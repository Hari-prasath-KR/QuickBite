import React, { useState } from 'react';

const MenuModels = ({ isOpen, onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [defaultPrice, setDefaultPrice] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [category, setCategory] = useState('Uncategorized'); 

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
        setName('');
        setDescription('');
        setDefaultPrice('');
        setImageFile(null);
        setCategory('Uncategorized');
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="flex items-start justify-between mb-6">
                    <h2 className="text-2xl font-bold text-green-800">Add Item to Global Menu</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">Item Name</label>
                        <input type="text" className="w-full border p-3 rounded-lg  focus:outline-none focus:ring-2 focus:ring-yellow-400  focus:border-yellow-400" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">Category</label>
                        <select
                            className="w-full border p-3 rounded-lg bg-white  text-gray-700" 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option>Uncategorized</option>
                            <option>Appetizer</option>
                            <option>Main Course</option>
                            <option>Dessert</option>
                            <option>Beverage</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">Description</label>
                        <textarea className="w-full border p-3 rounded-lg h-24 focus:outline-none focus:ring-2 focus:ring-yellow-400  focus:border-yellow-400" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">Default Price</label>
                        <input type="number" step="0.01" className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400  focus:border-yellow-400" value={defaultPrice} onChange={(e) => setDefaultPrice(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">Item Image</label>
                        <div className="mt-2 flex items-center gap-4">
                            <label htmlFor="file-upload" className="cursor-pointer rounded-md bg-white px-4 py-2 text-sm font-semibold text-green-600 ring-1 ring-inset ring-green-300 hover:bg-green-50">
                                <span>Upload a file</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => setImageFile(e.target.files[0])} accept="image/*" />
                            </label>
                            {imageFile && <span className="text-sm text-gray-500 truncate">{imageFile.name}</span>}
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={handleClose} className="w-full py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">Add Item</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default MenuModels;