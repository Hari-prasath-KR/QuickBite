import React, { useEffect, useState } from 'react'
import axios from "axios"
import AdminNavbar from '../components/AdminNavbar';

function ManageCateringAdmins() {

   const [admins,setAdmins]= useState([]);

   useEffect(()=>{
      const fetchadmins = async ()=>{
         try {
           // const token = localStorage.getItem("token"); 
          const res = await axios.get("http://localhost:5001/api/admin/catering-admins", { withCredentials: true });
            setAdmins(res.data);
         } catch (error) {
            console.log("Error fetching Data",error);
         }
      };
      fetchadmins();
   },[]);

   const handleDelete = async (id) =>{
     if (!window.confirm("Are you sure you want to delete this admin?")) return;

     try {
       //const token = localStorage.getItem("token");
       await axios.delete(`http://localhost:5001/api/admin/manage-catering-admins/${id}`,{ withCredentials: true });
        setAdmins(admins.filter((a) => a._id !== id));
     } catch (error) {
        console.log("Error Deleting Date",error);
     }
   }
  return (
        <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white">
        <div className="fixed top-0 left-0 w-full z-50">
          <AdminNavbar />
        </div>
        <div className="pt-24 p-8"> 
          <h1 className="text-3xl font-bold  mb-8 text-white">
            Manage Catering Admins 👨‍💼
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {admins.map((admin) => (
              <div
                key={admin._id}
                className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center border border-yellow-300"
              >
                <img
                  src={admin.cateringId?.logo}
                  alt={admin.cateringId?.name}
                  className="h-20 w-20 object-contain mb-3"
                />
                <h2 className="text-xl font-bold text-gray-800">{admin.name}</h2>
                <p className="text-gray-600 text-sm">{admin.email}</p>

                <h3 className="mt-3 text-green-700 font-semibold">
                  {admin.cateringId?.name}
                </h3>
                <p className="text-gray-500 text-sm text-center">
                  {admin.cateringId?.description}
                </p>

                <button
                  onClick={() => handleDelete(admin._id)}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Delete Admin
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
  )
}

export default ManageCateringAdmins
