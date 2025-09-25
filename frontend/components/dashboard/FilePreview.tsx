
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Spinner from '../common/Spinner';
import { FileWarning } from 'lucide-react';

interface FilePreviewProps {
  fileId: string;
  fileType: string;
  fileName: string;
}

const FilePreview = ({ fileId, fileType, fileName }: FilePreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl: string;
    const fetchPreview = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await api.get(`/files/download/${fileId}`, { responseType: 'blob' });
        const blob = new Blob([response.data], { type: response.headers['content-type'] || fileType });
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      } catch (err) {
        console.error("Failed to fetch file preview", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileId, fileType]);

  const previewContainerClasses = "h-32 w-full flex items-center justify-center bg-background dark:bg-dark-background";

  if (loading) {
    return <div className={previewContainerClasses}><Spinner /></div>;
  }

  if (error || !previewUrl) {
    return (
      <div className={`${previewContainerClasses} flex-col text-center p-2`}>
        <FileWarning className="h-8 w-8 text-danger dark:text-dark-danger mb-2" />
        <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Preview not available</p>
      </div>
    );
  }

  if (fileType.startsWith('image/')) {
    return (
      <div className={previewContainerClasses}>
        <img src={previewUrl} alt={fileName} className="h-full w-full object-cover" />
      </div>
    );
  }

  if (fileType === 'application/pdf') {
    return (
      <div className={previewContainerClasses}>
        <iframe src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={fileName} className="h-full w-full border-none"></iframe>
      </div>
    );
  }

  return (
    <div className={`${previewContainerClasses} flex-col text-center p-2`}>
      <FileWarning className="h-8 w-8 text-danger dark:text-dark-danger mb-2" />
      <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Unsupported preview type</p>
    </div>
  );
};

export default FilePreview;