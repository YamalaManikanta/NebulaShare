
import api from './api';
import JSZip from 'jszip';
import { FileData } from '../types';

export const uploadFile = (formData: FormData, onUploadProgress: (progressEvent: any) => void) => {
  return api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
};

export const getUserFiles = () => {
  return api.get('/files/user');
};

export const deleteFile = (fileId: string) => {
  return api.delete(`/files/${fileId}`);
};

export const createShareableLink = (fileId: string, type: 'PERMANENT' | 'ONE_TIME') => {
  return api.post(`/files/share/${fileId}`, { type });
};

export const downloadFile = async (fileId: string, fileName: string) => {
    const response = await api.get(`/files/download/${fileId}`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
}

export const downloadFilesAsZip = async (files: FileData[]) => {
    const zip = new JSZip();

    const filePromises = files.map(file => {
        return api.get(`/files/download/${file.id}`, { responseType: 'blob' })
            .then(response => {
                zip.file(file.fileName, response.data);
            });
    });

    await Promise.all(filePromises);

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    const url = window.URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'NebulaShare_Archive.zip');
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
};