import { X } from 'lucide-react';

export default function ImagePreview({ imageUrl, onClose }) {
  if (!imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all"
      >
        <X className="w-5 h-5" />
      </button>
      
      <img
        src={imageUrl}
        alt="放大预览"
        className="max-w-full max-h-[85vh] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
