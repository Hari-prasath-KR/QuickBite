import React, { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Building, 
  ArrowRight, 
  Utensils, 
  ChevronRight,
  ShieldCheck
} from "lucide-react";

const CateringManagement = ({ catering, loading }) => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-6 text-left">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Catering Corporations</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Campus Catering Providers</p>
        </div>

        {/* Skeleton Search */}
        <div className="w-full md:max-w-xs h-11 bg-slate-200/50 rounded-2xl animate-pulse"></div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[...Array(4)].map((_, idx) => (
            <div
              key={idx}
              className="bg-white/40 border border-slate-200/30 rounded-3xl p-6 h-36 flex gap-4 items-center animate-pulse"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-200"></div>
              <div className="space-y-2 flex-grow">
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!loading && (!catering || catering.length === 0)) {
    return (
      <div className="p-8 text-center text-slate-500 font-bold text-xs bg-white/20 border border-white/20 rounded-3xl">
        No registered catering services available on campus.
      </div>
    );
  }

  const filteredCaterers = catering.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      
      {/* Header Block */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Catering Corporations</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Campus Catering Providers</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search catering brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-md border border-slate-200/50 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-500 shadow-inner"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </div>
      </div>

      {/* Caterers Premium Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filteredCaterers.map((caterer) => (
          <div
            key={caterer._id}
            onClick={() => navigate(`/admin/catering/${caterer._id}`)}
            className="bg-white/50 hover:bg-white/80 border border-white/60 hover:border-emerald-500/30 rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex gap-5 items-center relative group overflow-hidden cursor-pointer active:scale-[0.99]"
          >
            {/* Glowing Accent Gradient Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-[4rem] group-hover:scale-110 transition-all duration-500"></div>

            {/* Caterer Corporate Logo Container */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/50 shadow-inner flex items-center justify-center p-1 group-hover:shadow-emerald-500/10 group-hover:border-emerald-500/20 transition-all duration-300">
                <img
                  src={caterer.logo || "/default-logo.png"}
                  alt={caterer.name || "Caterer"}
                  className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-all duration-500"
                />
              </div>
            </div>

            {/* Brand Description & Details */}
            <div className="flex-grow space-y-1.5 text-left min-w-0 pr-4">
              <div className="flex items-center gap-1.5">
                <h4 className="font-black text-slate-950 text-base leading-tight truncate">
                  {caterer.name}
                </h4>
                {caterer.admin && (
                  <span className="text-emerald-600 shrink-0" title="Assigned Manager Account Active">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                )}
              </div>
              
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed line-clamp-2">
                {caterer.description || "Premium catering corporate provider servicing campus students and college faculty nodes."}
              </p>

              {/* Branch Stats Badge */}
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/10 text-[9px] uppercase font-black tracking-wider text-emerald-700">
                  <Building className="w-3 h-3" />
                  {(caterer.branches || []).length} {(caterer.branches || []).length === 1 ? "Canteen" : "Canteens"}
                </span>
              </div>
            </div>

            {/* Arrow action wrapper */}
            <div className="shrink-0 p-2 bg-slate-900/5 group-hover:bg-emerald-500 group-hover:text-white rounded-2xl text-slate-400 transition-all duration-300 shadow-sm">
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

CateringManagement.propTypes = {
  catering: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default CateringManagement;
