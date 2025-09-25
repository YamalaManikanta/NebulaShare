
import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, X, DownloadCloud } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  onDelete: () => void;
  onDownload: () => void;
  onClear: () => void;
  isLoading?: boolean;
}

const BulkActionBar = ({ selectedCount, onDelete, onDownload, onClear, isLoading = false }: BulkActionBarProps) => {
  return (
    <motion.div
      layout
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-auto min-w-[300px] bg-surface dark:bg-dark-surface rounded-2xl shadow-2xl p-3 flex items-center justify-between z-20"
    >
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-text-primary dark:text-dark-text-primary">
          <span className="bg-primary dark:bg-dark-primary text-white rounded-full px-2.5 py-1 text-xs mr-2">{selectedCount}</span>
          item(s) selected
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onDownload}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary dark:bg-dark-secondary rounded-lg hover:bg-cyan-600 dark:hover:bg-cyan-500 transition-colors disabled:opacity-50"
        >
          <DownloadCloud size={16} />
          {isLoading ? 'Processing...' : 'Download ZIP'}
        </button>
        <button
          onClick={onDelete}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-danger dark:bg-dark-danger rounded-lg hover:bg-red-700 dark:hover:bg-red-500 transition-colors disabled:opacity-50"
        >
          <Trash2 size={16} />
          Delete
        </button>
        <button
          onClick={onClear}
          disabled={isLoading}
          className="p-2 text-text-secondary dark:text-dark-text-secondary hover:bg-border dark:hover:bg-dark-border rounded-full disabled:opacity-50"
          title="Clear selection"
        >
          <X size={20} />
        </button>
      </div>
    </motion.div>
  );
};

export default BulkActionBar;