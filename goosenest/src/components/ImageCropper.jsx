// components/ImageCropper.jsx
import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";
import { Slider } from "@/components/ui/slider"; 

const ImageCropper = ({ image, onCropDone, onCancel, size = 300 }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleDone = async () => {
    const croppedImage = await getCroppedImg(image, croppedAreaPixels, size);
    onCropDone(croppedImage);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center">
      <div className="relative w-[80vw] h-[80vw] max-w-[90vmin] max-h-[90vmin] bg-white rounded-lg overflow-hidden">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      <div className="flex gap-4 mt-4 items-center w-full max-w-md px-4">
        <Slider
          min={1}
          max={3}
          step={0.1}
          value={[zoom]}
          onValueChange={(value) => setZoom(value[0])}
          className="
            w-full h-2 bg-gray-300 rounded-lg appearance-none 
            [&::-webkit-slider-thumb]:appearance-none 
            [&::-webkit-slider-thumb]:bg-green-500 
            [&::-webkit-slider-thumb]:h-4 
            [&::-webkit-slider-thumb]:w-4 
            [&::-webkit-slider-thumb]:rounded-full 
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:border-none
            "
        />
        <button
          onClick={handleDone}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          ยืนยัน
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          ยกเลิก
        </button>
      </div>
    </div>
  );
};

export default ImageCropper;
