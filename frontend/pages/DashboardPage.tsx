
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import FileUpload from '../components/dashboard/FileUpload';
import FileList from '../components/dashboard/FileList';
import { FileData } from '../types';
import { getUserFiles, deleteFile as deleteFileService, createShareableLink as createLinkService, downloadFilesAsZip } from '../services/fileService';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';
import { motion } from 'framer-motion';
import { Copy, AlertTriangle, CheckSquare, Square, Search } from 'lucide-react';
import BulkActionBar from '../components/dashboard/BulkActionBar';

// FIX: Removed React.FC to fix framer-motion prop type errors.
const DashboardPage = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  const [fileToDelete, setFileToDelete] = useState<FileData | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');


  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getUserFiles();
      setFiles(response.data);
    } catch (error) {
      addNotification('Failed to fetch files.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const onUploadSuccess = () => {
    addNotification('File uploaded successfully!', 'success');
    fetchFiles();
  };
  
  const requestDeleteFile = (file: FileData) => {
    setFileToDelete(file);
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;

    try {
        await deleteFileService(fileToDelete.id);
        addNotification('File deleted successfully.', 'success');
        setFiles(files.filter(f => f.id !== fileToDelete.id));
    } catch (error) {
        addNotification('Failed to delete file.', 'error');
    } finally {
        setFileToDelete(null);
    }
  };


  const handleCreateLink = async (fileId: string, type: 'PERMANENT' | 'ONE_TIME') => {
      try {
          const response = await createLinkService(fileId, type);
          setShareableLink(response.data.link); // Assuming the backend returns { link: "..." }
          setShowModal(true);
      } catch (error) {
           addNotification('Failed to create shareable link.', 'error');
      }
  }

  // --- Bulk Action Handlers ---
  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prevSelected => {
        const newSelected = new Set(prevSelected);
        if (newSelected.has(fileId)) {
            newSelected.delete(fileId);
        } else {
            newSelected.add(fileId);
        }
        return newSelected;
    });
  };

  const filteredFiles = files.filter(file =>
    file.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAllFilteredSelected = filteredFiles.length > 0 && filteredFiles.every(f => selectedFiles.has(f.id));

  const handleSelectAll = () => {
    const filteredFileIds = new Set(filteredFiles.map(f => f.id));
    if (isAllFilteredSelected) {
        // Deselect all filtered files
        setSelectedFiles(prevSelected => {
            const newSelected = new Set(prevSelected);
            filteredFileIds.forEach(id => newSelected.delete(id));
            return newSelected;
        });
    } else {
        // Select all filtered files
        setSelectedFiles(prevSelected => new Set([...prevSelected, ...filteredFileIds]));
    }
  };
  
  const confirmBulkDelete = async () => {
    setShowBulkDeleteModal(false);
    setIsBulkLoading(true);
    const filesToDelete = Array.from(selectedFiles);
    try {
        await Promise.all(filesToDelete.map(id => deleteFileService(id)));
        addNotification(`${filesToDelete.length} file(s) deleted successfully.`, 'success');
        setFiles(prevFiles => prevFiles.filter(f => !filesToDelete.includes(f.id)));
    } catch (error) {
        addNotification('An error occurred while deleting files.', 'error');
    } finally {
        setIsBulkLoading(false);
        setSelectedFiles(new Set());
    }
  };

  const handleBulkDownload = async () => {
    setIsBulkLoading(true);
    addNotification('Preparing your ZIP file, this may take a moment...', 'info');
    try {
      const filesToDownload = files.filter(f => selectedFiles.has(f.id));
      await downloadFilesAsZip(filesToDownload);
      // No success message here as the browser handles the download prompt
    } catch (error) {
        addNotification('Failed to create ZIP file.', 'error');
        console.error(error);
    } finally {
        setIsBulkLoading(false);
        setSelectedFiles(new Set());
    }
  };
  // --- End Bulk Action Handlers ---

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-4xl font-bold mb-2 text-text-primary dark:text-dark-text-primary">Welcome, {user?.username}</h1>
      <p className="text-text-secondary dark:text-dark-text-secondary mb-8">Manage your files securely and efficiently.</p>
      
      <div className="mb-12">
        <FileUpload onUploadSuccess={onUploadSuccess} />
      </div>

      <div>
        <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary dark:text-dark-text-secondary pointer-events-none" />
            <input
            type="text"
            placeholder="Search your files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-text-primary dark:text-dark-text-primary bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary transition-all"
            />
        </div>

        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-text-primary dark:text-dark-text-primary">Your Files</h2>
            {!loading && files.length > 0 && (
                <button 
                    onClick={handleSelectAll} 
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg text-primary dark:text-dark-primary hover:bg-primary/10 dark:hover:bg-dark-primary/10 transition-colors"
                >
                    {isAllFilteredSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                    <span>{isAllFilteredSelected ? 'Deselect All' : 'Select All'}</span>
                </button>
            )}
        </div>
        {loading ? (
          <div className="flex justify-center p-8"><Spinner /></div>
        ) : (
          <FileList 
            files={filteredFiles} 
            totalFileCount={files.length}
            onDelete={requestDeleteFile} 
            onShare={handleCreateLink}
            selectedFiles={selectedFiles}
            onFileSelect={handleFileSelect}
          />
        )}
      </div>

      {selectedFiles.size > 0 && (
        <BulkActionBar 
            selectedCount={selectedFiles.size}
            onDelete={() => setShowBulkDeleteModal(true)}
            onDownload={handleBulkDownload}
            onClear={() => setSelectedFiles(new Set())}
            isLoading={isBulkLoading}
        />
      )}

      <Modal isVisible={showModal} onClose={() => setShowModal(false)} title="Shareable Link">
          <p className="text-text-secondary dark:text-dark-text-secondary mb-4">Here is your shareable link. Copy and share it as you wish.</p>
          <div className="relative flex items-center">
             <input type="text" value={shareableLink} readOnly className="w-full p-2 pr-12 bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-lg text-text-primary dark:text-dark-text-primary"/>
             <motion.button 
                onClick={() => {
                    navigator.clipboard.writeText(shareableLink);
                    addNotification('Link copied to clipboard!', 'info');
                }} 
                className="absolute right-2 p-2 rounded-md text-text-secondary dark:text-dark-text-secondary hover:bg-border dark:hover:bg-dark-border"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                 <Copy size={18}/>
             </motion.button>
          </div>
      </Modal>

      <Modal isVisible={!!fileToDelete} onClose={() => setFileToDelete(null)} title="Confirm Deletion">
        {fileToDelete && (
            <div className="text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-danger dark:text-dark-danger" />
                <p className="mt-4 text-text-primary dark:text-dark-text-primary">
                    Are you sure you want to delete <strong className="font-semibold">{fileToDelete.fileName}</strong>?
                </p>
                <p className="mt-2 text-sm text-text-secondary dark:text-dark-text-secondary">
                    This action is permanent and cannot be undone.
                </p>
                <div className="mt-6 flex justify-center gap-4">
                    <motion.button
                        onClick={() => setFileToDelete(null)}
                        className="px-6 py-2 rounded-lg bg-border dark:bg-dark-border text-text-primary dark:text-dark-text-primary font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        onClick={confirmDeleteFile}
                        className="px-6 py-2 rounded-lg bg-danger dark:bg-dark-danger text-white font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Delete
                    </motion.button>
                </div>
            </div>
        )}
      </Modal>

      <Modal isVisible={showBulkDeleteModal} onClose={() => setShowBulkDeleteModal(false)} title="Confirm Bulk Deletion">
            <div className="text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-danger dark:text-dark-danger" />
                <p className="mt-4 text-text-primary dark:text-dark-text-primary">
                    Are you sure you want to delete <strong className="font-semibold">{selectedFiles.size} selected items</strong>?
                </p>
                <p className="mt-2 text-sm text-text-secondary dark:text-dark-text-secondary">
                    This action is permanent and cannot be undone.
                </p>
                <div className="mt-6 flex justify-center gap-4">
                    <motion.button
                        onClick={() => setShowBulkDeleteModal(false)}
                        className="px-6 py-2 rounded-lg bg-border dark:bg-dark-border text-text-primary dark:text-dark-text-primary font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        onClick={confirmBulkDelete}
                        className="px-6 py-2 rounded-lg bg-danger dark:bg-dark-danger text-white font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Delete
                    </motion.button>
                </div>
            </div>
      </Modal>
    </motion.div>
  );
};

export default DashboardPage;
