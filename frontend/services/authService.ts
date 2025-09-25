
import api from './api';

export const signup = (data: any) => {
  return api.post('/auth/signup', data);
};

export const verifyOtp = (data: any) => {
  return api.post('/auth/verify-otp', data);
};

export const login = (data: any) => {
  return api.post('/auth/login', data);
};

export const updateProfile = (data: any) => {
    return api.put('/user/profile', data);
}

export const changePassword = (data: any) => {
    return api.put('/user/change-password', data);
}
