import React, { useEffect, useState } from 'react';
import { MapPin, ArrowLeft, Building2, Bed, Bath, Maximize, ArrowRight } from 'lucide-react';

export default function ProjectDetailPage({ projectId, onNavigate }: { projectId: string, onNavigate: (page: string, id?: string) => void }) {
  const [properties, setProperties] = useState<any[]>([]);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    // Fetch Project Info
    fetch(`/api/erp/method/realtor_x.api.v1.get_public_project_details?project_id=${projectId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.message) setProject(data.message);
      });

    // Fetch Properties for this project
    fetch(`/api/erp/method/realtor_x.api.v1.get_project_properties?project_id=${projectId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.message) setProperties(data.message);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [projectId]);

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `PKR ${(price / 10000000).toFixed(2)} Crore`;
    if (price >= 100000) return `PKR ${(price / 100000).toFixed(2)} Lakh`;
    return `PKR ${price.toLocaleString()}`;
  };

  if (loading) return <div className="min-h-screen bg-[#0B1A30] flex items-center justify-center text-[#F5A623]">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0B1A30] pb-20">
      
      {/* Top Banner (Hero) */}
      <div className="relative h-[300px] bg-slate-800 flex items-end">
        {project?.project_image ? (
          <img src={project.project_image} alt="Project" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1A30] to-slate-800" />
        )}
        
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 pb-8">
          <button onClick={() => onNavigate('projects')} className="flex items-center gap-2 text-slate-300 hover:text-white mb-4 text-sm font-medium bg-black/30 w-fit px-3 py-1.5 rounded-lg backdrop-blur-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </button>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{project?.project_name || 'Project Details'}</h1>
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {project?.city || 'Karachi'}</span>
            <span>•</span>
            <span>{project?.project_type || 'Residential'}</span>
            <span>•</span>
            <span className="text-[#F5A623] font-semibold">{project?.status}</span>
          </div>
        </div>
      </div>

      {/* Properties List */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Properties in this Project</h2>
        
        {properties.length === 0 ? (
          <div className="text-center bg-[#081221] border border-white/10 p-12 rounded-2xl">
            <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Properties Found</h3>
            <p className="text-slate-400">There are currently no properties listed under this project.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((prop) => (
              <div 
                key={prop.name} 
                onClick={() => onNavigate('property-details', prop.name)}
                className="bg-[#081221] border border-white/10 rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-300 group cursor-pointer shadow-lg"
              >
                <div className="h-48 bg-slate-800 relative overflow-hidden">
                  {prop.custom_image_1 ? (
                    <img src={prop.custom_image_1} alt={prop.property_title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">No Image</div>
                  )}
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#F5A623] border border-[#F5A623]/30">
                    {prop.status || 'Available'}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#F5A623] transition-colors">{prop.property_title}</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-300 mb-4 bg-white/5 p-2.5 rounded-lg">
                    <div className="flex items-center gap-1"><Bed className="w-3.5 h-3.5 text-slate-500" /> {prop.bedrooms || 0}</div>
                    <div className="flex items-center gap-1"><Bath className="w-3.5 h-3.5 text-slate-500" /> {prop.bathrooms || 0}</div>
                    <div className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5 text-slate-500" /> {prop.size} {prop.size_unit}</div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                    <p className="text-lg font-bold text-[#F5A623]">{formatPrice(prop.list_price || 0)}</p>
                    <button className="text-slate-400 group-hover:text-[#F5A623] transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
