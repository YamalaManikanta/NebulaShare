export interface User {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface FileData {
  id:string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  shareableLink?: string;
}

export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationPayload {
  id: number;
  message: string;
  type: NotificationType;
}