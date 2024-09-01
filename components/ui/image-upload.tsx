import React, { useState } from 'react';

interface ImageUploadProps {
  value: string[];
  onChange: (file: File) => void;
  onRemove: (url: string) => void;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, onRemove, disabled }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const filesArray = Array.from(files);
      setSelectedFiles((prevFiles) => [...prevFiles, ...filesArray]);

      filesArray.forEach((file) => {
        onChange(file);
      });
    }
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={handleFileChange} 
        disabled={disabled}
        accept="image/*"
        multiple 
      />
      <div className="grid grid-cols-3 gap-4 mt-4">
        {value.map((url, index) => (
          <div key={index} className="relative">
            <img src={url} alt={`Uploaded ${index}`} className="object-cover w-full h-32" />
            <button 
              type="button"
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
              onClick={() => onRemove(url)}
              disabled={disabled}
            >
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUpload;