import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
export const SearchableSelect = ({ options, value, onChange, placeholder = "Select..." }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const filteredOptions = options.filter((opt: any) => opt.label.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectedLabel = options.find((o: any) => o.value === value)?.label || '';
  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="w-full bg-[#0B1A30] border border-white/10 p-3 rounded-lg text-white text-sm flex justify-between items-center cursor-pointer hover:border-[#F5A623]/50 transition">
        <span className={selectedLabel ? 'text-white' : 'text-slate-500'}>{selectedLabel || placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#081221] border border-white/10 rounded-lg shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-white/10 flex items-center gap-2 bg-[#0B1A30]">
            <Search className="w-4 h-4 text-slate-400" />
            <input type="text" autoFocus placeholder="Search..." className="bg-transparent text-white text-sm w-full outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? <div className="p-3 text-sm text-slate-500 text-center">No results</div> : filteredOptions.map((opt: any) => (
              <div key={opt.value} onClick={() => { onChange(opt.value); setIsOpen(false); setSearchTerm(''); }} className={`p-3 text-sm cursor-pointer transition ${value === opt.value ? 'bg-[#F5A623]/10 text-[#F5A623]' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>{opt.label}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
