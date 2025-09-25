import React, { useState, useRef } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { uploadFile } from '../../services/fileService';
import { motion } from 'framer-motion';
import { UploadCloud, File, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

// FIX: Removed React.FC and typed props directly to fix framer-motion prop type errors.
const FileUpload = ({ onUploadSuccess }: FileUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useNotification();

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      setSelectedFile(files[0]);
      setUploadComplete(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      addNotification('Please select a file first.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setIsUploading(true);
    setUploadProgress(0);
    setUploadComplete(false);

    try {
      await uploadFile(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });
      setUploadComplete(true);
      onUploadSuccess();
      setTimeout(() => {
        setSelectedFile(null);
        setIsUploading(false);
        setUploadComplete(false);
      }, 1500);

    } catch (error) {
      addNotification('File upload failed.', 'error');
      setIsUploading(false);
    } 
  };

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  return (
    <div className="bg-surface dark:bg-dark-surface p-8 rounded-2xl shadow-xl">
      <div
        className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300
                    ${isDragging ? 'border-primary dark:border-dark-primary bg-primary/10 dark:bg-dark-primary/10 scale-105' : 'border-border dark:border-dark-border'}`}
        onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDragOver={onDragOver} onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="absolute inset-0 bg-primary dark:bg-dark-primary rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-10" style={{ opacity: isDragging ? 0.1 : 0 }}></div>
        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileChange(e.target.files)} />
        <div className="flex flex-col items-center justify-center">
            <UploadCloud className="h-12 w-12 text-text-secondary dark:text-dark-text-secondary mb-4" />
            <p className="text-text-secondary dark:text-dark-text-secondary">Drag & drop a file here, or click to select a file</p>
            {selectedFile && !isUploading && <p className="mt-2 text-primary dark:text-dark-primary flex items-center gap-2"><File size={16}/>{selectedFile.name}</p>}
        </div>
      </div>

      {isUploading && (
        <div className="mt-4">
            <div className="w-full bg-border dark:bg-dark-border rounded-full h-2.5">
                <motion.div
                className="bg-success dark:bg-dark-success h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.5 }}
                />
            </div>
            <p className="text-center text-sm mt-1 text-text-secondary dark:text-dark-text-secondary">{!uploadComplete ? `${uploadProgress}%` : "Upload Complete!"}</p>
        </div>
      )}

      {uploadComplete && (
        <div className="flex justify-center mt-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <CheckCircle className="h-10 w-10 text-success dark:text-dark-success"/>
            </motion.div>
        </div>
      )}


      <div className="mt-6 text-center">
        <motion.button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="bg-primary dark:bg-dark-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-hover dark:hover:bg-dark-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isUploading ? (uploadComplete ? 'Done' : 'Uploading...') : 'Upload File'}
        </motion.button>
      </div>
    </div>
  );
};

export default FileUpload;