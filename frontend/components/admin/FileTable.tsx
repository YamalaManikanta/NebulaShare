
import React from 'react';
import { FileData } from '../../types';

interface FileTableProps {
  files: FileData[];
}

const FileTable = ({ files }: FileTableProps) => {

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
      };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border dark:divide-dark-border">
        <thead className="bg-background dark:bg-dark-background">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">File Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Type</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Size</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Uploaded At</th>
            {/* Add more columns like 'Owner' if the backend provides that data */}
          </tr>
        </thead>
        <tbody className="divide-y divide-border dark:divide-dark-border">
          {files.map((file) => (
            <tr key={file.id} className="hover:bg-surface dark:hover:bg-dark-border/20 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary dark:text-dark-text-primary">{file.fileName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-dark-text-secondary">{file.fileType}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-dark-text-secondary">{formatBytes(file.fileSize)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-dark-text-secondary">{new Date(file.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FileTable;