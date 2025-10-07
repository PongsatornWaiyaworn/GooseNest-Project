import React from 'react';

interface FullImageModalProps {
  imageUrl: string;
  alt?: string;
  onClose: () => void;
}

const FullImageModal: React.FC<FullImageModalProps> = ({ imageUrl, alt = 'Full Image', onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 z-[999] flex items-center justify-center"
      onClick={onClose}
    >
      <img
        src={imageUrl}
        alt={alt}
        className="max-w-full max-h-full object-contain rounded-lg"
      />
    </div>
  );
};

export default FullImageModal;
