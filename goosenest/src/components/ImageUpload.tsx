import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Upload, X, ImageIcon } from 'lucide-react';

interface ImageTypeFile {
  type: 'file';
  file: File;
}

interface ImageTypeUrl {
  type: 'url';
  url: string;
}

type ImageType = ImageTypeFile | ImageTypeUrl;

interface ImageUploadProps {
  onImagesChange: (images: ImageType[]) => void;
  maxImages?: number;
  className?: string;
  initialUrls?: string[];
}

const ImageUpload = ({
  onImagesChange,
  maxImages = 10,
  className,
  initialUrls = [],
}: ImageUploadProps) => {
  const [selectedImages, setSelectedImages] = useState<ImageType[]>(() =>
    initialUrls.map((url) => ({ type: 'url', url }))
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const notifyParent = (images: ImageType[]) => {
    onImagesChange(images);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const remainingSlots = maxImages - selectedImages.length;
    if (remainingSlots <= 0) return;

    const newFiles = Array.from(files)
      .slice(0, remainingSlots)
      .map((file) => ({ type: 'file' as const, file }));

    const updatedImages = [...selectedImages, ...newFiles];
    setSelectedImages(updatedImages);
    notifyParent(updatedImages);
  };

  const removeImage = (index: number) => {
    const imgToRemove = selectedImages[index];
    if (imgToRemove.type === 'file') {
      const previewUrl = URL.createObjectURL(imgToRemove.file);
      URL.revokeObjectURL(previewUrl);
    }

    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
    notifyParent(updatedImages);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  useEffect(() => {
    return () => {
      selectedImages.forEach((img) => {
        if (img.type === 'file') {
          const url = URL.createObjectURL(img.file);
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [selectedImages]);

  return (
    <div className={cn('space-y-4', className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer',
          dragOver
            ? 'border-cyan-400 bg-cyan-400/10'
            : 'border-gray-600 hover:border-cyan-400 hover:bg-cyan-400/5',
          selectedImages.length >= maxImages && 'opacity-50 cursor-not-allowed'
        )}
        onClick={() =>
          selectedImages.length < maxImages && fileInputRef.current?.click()
        }
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={selectedImages.length >= maxImages}
        />

        <div className="text-center">
          <motion.div
            animate={{ scale: dragOver ? 1.1 : 1 }}
            className="flex justify-center mb-4"
          >
            <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full">
              <Upload size={32} className="text-cyan-400" />
            </div>
          </motion.div>

          <h3 className="text-lg font-semibold text-white mb-2">
            {selectedImages.length >= maxImages
              ? 'ครบจำนวนรูปภาพแล้ว'
              : 'อัปโหลดรูปภาพ'}
          </h3>

          <p className="text-gray-400 text-sm mb-4">
            ลากและวางไฟล์ที่นี่ หรือคลิกเพื่อเลือกไฟล์
          </p>

          <div className="text-xs text-gray-500">
            <p>รองรับไฟล์: JPG, PNG, GIF</p>
            <p>
              จำนวนสูงสุด: {selectedImages.length}/{maxImages} รูป
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-semibold text-cyan-400 flex items-center">
              <ImageIcon size={16} className="mr-2" />
              รูปภาพที่เลือก ({selectedImages.length})
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {selectedImages.map((img, index) => {
                let previewUrl = '';
                if (img.type === 'file') {
                  previewUrl = URL.createObjectURL(img.file);
                } else {
                  previewUrl = img.url;
                }

                return (
                  <motion.div
                    key={previewUrl + index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-cyan-400/50 transition-colors"
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-1 right-1 h-7 w-7 p-0 bg-red-500/80 hover:bg-red-500 text-white z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (img.type === 'file') {
                          URL.revokeObjectURL(previewUrl);
                        }
                        removeImage(index);
                      }}
                    >
                      <X size={14} />
                    </Button>

                    <img
                      src={previewUrl}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-xs text-white truncate">
                        {img.type === 'file'
                          ? img.file.name
                          : previewUrl.split('/').pop()}
                      </p>
                      <p className="text-xs text-gray-300">
                        {img.type === 'file'
                          ? (img.file.size / 1024 / 1024).toFixed(1) + ' MB'
                          : ''}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUpload;