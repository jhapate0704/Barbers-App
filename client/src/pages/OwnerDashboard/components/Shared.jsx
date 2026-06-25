import React from 'react';
import { X } from 'lucide-react';

export const Label = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className={`block mb-1.5 text-[11px] font-bold tracking-[0.08em] uppercase text-white/30 ${htmlFor ? 'cursor-pointer' : 'cursor-default'}`}>
    {children}
  </label>
);

export const InputField = ({ className = '', ...props }) => (
  <input {...props} className={`w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-200 text-sm outline-none font-inherit box-border focus:border-violet-500/55 focus:bg-violet-500/5 transition-colors ${className}`} />
);

export const SelectField = ({ className = '', children, ...props }) => (
  <select {...props} className={`w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-200 text-sm outline-none cursor-pointer font-inherit box-border appearance-none transition-colors ${className}`}>
    {children}
  </select>
);

export const Badge = ({ children, color = 'violet' }) => {
  const colors = {
    violet: 'bg-violet-500/15 text-violet-300',
    green: 'bg-green-500/15 text-green-300',
    red: 'bg-red-500/15 text-red-300',
    blue: 'bg-blue-500/15 text-blue-300',
    amber: 'bg-amber-500/15 text-amber-300',
  };
  const c = colors[color] || colors.violet;
  return (
    <span className={`inline-flex items-center px-2.5 py-[3px] rounded-full text-[11px] font-bold uppercase tracking-[0.06em] whitespace-nowrap ${c}`}>
      {children}
    </span>
  );
};

export const IconBtn = ({ onClick, danger, children, className = '', title }) => (
  <button onClick={onClick} title={title} className={`inline-flex items-center justify-center p-2 border-none rounded-lg cursor-pointer transition-all duration-150 ${danger ? 'bg-red-500/10 text-red-300 hover:bg-red-500/20' : 'bg-white/5 text-white/40 hover:bg-white/10'} ${className}`}>
    {children}
  </button>
);

export const PrimaryBtn = ({ children, className = '', ...props }) => (
  <button {...props} className={`inline-flex items-center justify-center gap-[7px] px-5 py-2.5 bg-gradient-to-br from-violet-600 to-violet-700 border-none rounded-[10px] text-white text-sm font-semibold cursor-pointer font-inherit transition-all duration-150 whitespace-nowrap hover:-translate-y-[1px] hover:shadow-[0_8px_20px_rgba(139,92,246,0.3)] ${className}`}>
    {children}
  </button>
);

export const Card = ({ children, className = '' }) => (
  <div className={`bg-[#13131f] border border-white/10 rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

export const SectionTitle = ({ icon: Icon, children, badge }) => (
  <div className="flex items-center gap-2.5 mb-5">
    {Icon && <Icon size={18} className="text-violet-500 shrink-0" />}
    <h2 className="text-[15px] font-bold text-white flex-1">{children}</h2>
    {badge != null && <Badge color="violet">{badge}</Badge>}
  </div>
);

export const ModalClose = ({ onClick }) => (
  <button onClick={onClick} className="flex items-center justify-center w-8 h-8 shrink-0 bg-white/5 border border-white/10 rounded-lg cursor-pointer text-white/50 hover:bg-white/10 transition-colors">
    <X size={15} />
  </button>
);

export const ImageDropZone = ({ onDropFiles, children, className = '' }) => {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (onDropFiles) {
      if (e.dataTransfer && e.dataTransfer.files) {
        onDropFiles(e.dataTransfer.files);
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`transition-all duration-200 ${
        isDragging ? 'border-violet-500 bg-violet-500/10' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

