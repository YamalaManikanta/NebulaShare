
import api from './api';

export const getAllUsers = () => {
    return api.get('/admin/users');
};

export const deleteUser = (userId: string) => {
    return api.delete(`/admin/users/${userId}`);
};

export const getAllFiles = () => {
    return api.get('/admin/files');
};
