
import React from 'react';
import { FileData } from '../../types';
import { downloadFile } from '../../services/fileService';
import { motion } from 'framer-motion';
import { FileText, FileImage, FileVideo, FileAudio, FileArchive, FileCode, File as FileIcon, Download, Share2, Trash2, FolderOpen, Square, CheckSquare, SearchX } from 'lucide-react';
import FilePreview from './FilePreview';

interface FileListProps {
  files: FileData[];
  totalFileCount: number;
  onDelete: (file: FileData) => void;
  onShare: (fileId: string, type: 'PERMANENT' | 'ONE_TIME') => void;
  selectedFiles: Set<string>;
  onFileSelect: (fileId: string) => void;
}

const getFileIcon = (fileType: string): React.ReactElement => {
    if (fileType.startsWith('image/')) return <FileImage className="h-12 w-12 text-blue-500" />;
    if (fileType.startsWith('video/')) return <FileVideo className="h-12 w-12 text-purple-500" />;
    if (fileType.startsWith('audio/')) return <FileAudio className="h-12 w-12 text-pink-500" />;
    if (fileType === 'application/pdf') return <FileText className="h-12 w-12 text-red-500" />;
    if (fileType.includes('zip') || fileType.includes('archive')) return <FileArchive className="h-12 w-12 text-yellow-500" />;
    if (fileType.startsWith('text/')) return <FileCode className="h-12 w-12 text-green-500" />;
    return <FileIcon className="h-12 w-12 text-gray-500" />;
};

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// FIX: Removed React.FC and typed props directly to fix framer-motion prop type errors.
const FileList = ({ files, totalFileCount, onDelete, onShare, selectedFiles, onFileSelect }: FileListProps) => {
  if (files.length === 0) {
    const emptyStateClasses = "text-center py-20 bg-surface dark:bg-dark-surface rounded-2xl flex flex-col items-center justify-center";
    if (totalFileCount === 0) {
      return (
        <div className={emptyStateClasses}>
          <FolderOpen className="h-16 w-16 text-text-secondary dark:text-dark-text-secondary mb-4" />
          <p className="text-text-secondary dark:text-dark-text-secondary">You haven't uploaded any files yet.</p>
        </div>
      );
    }
    return (
        <div className={emptyStateClasses}>
            <SearchX className="h-16 w-16 text-text-secondary dark:text-dark-text-secondary mb-4" />
            <p className="text-text-secondary dark:text-dark-text-secondary">No files found matching your search.</p>
        </div>
    );
  }
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07
      }
    }
  };

  // FIX: Add 'as const' to fix framer-motion variants prop type error.
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  } as const;

  return (
    <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
      {files.map((file) => {
        const isPreviewable = file.fileType.startsWith('image/') || file.fileType === 'application/pdf';
        const isSelected = selectedFiles.has(file.id);
        return (
            <motion.div 
                key={file.id} 
                className={`bg-surface dark:bg-dark-surface shadow-lg rounded-2xl flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden group relative cursor-pointer ${isSelected ? 'ring-2 ring-primary dark:ring-dark-primary' : 'ring-2 ring-transparent'}`}
                variants={itemVariants}
                onClick={() => onFileSelect(file.id)}
            >
                <div className={`absolute top-3 left-3 z-10 text-primary dark:text-dark-primary bg-surface dark:bg-dark-surface rounded-sm p-0.5`}>
                    {isSelected ? <CheckSquare size={20} /> : <Square size={20} className="text-text-secondary dark:text-dark-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />}
                </div>
                <div className="flex-grow text-center">
                    {isPreviewable ? (
                        <FilePreview fileId={file.id} fileType={file.fileType} fileName={file.fileName} />
                    ) : (
                        <div className="pt-6 pb-2 flex justify-center">{getFileIcon(file.fileType)}</div>
                    )}
                    <div className="p-4">
                        <p className="w-full text-sm font-medium text-text-primary dark:text-dark-text-primary truncate" title={file.fileName}>{file.fileName}</p>
                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{formatBytes(file.fileSize)}</p>
                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">{new Date(file.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="p-2 border-t border-border dark:border-dark-border flex justify-around items-center" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => downloadFile(file.id, file.fileName)} className="p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900 text-green-500" title="Download"><Download size={18} /></button>
                    <button onClick={() => onShare(file.id, 'PERMANENT')} className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-500" title="Share"><Share2 size={18} /></button>
                    <button onClick={() => onDelete(file)} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-danger dark:text-dark-danger" title="Delete"><Trash2 size={18} /></button>
                </div>
            </motion.div>
        );
      })}
    </motion.div>
  );
};

export default FileList;
