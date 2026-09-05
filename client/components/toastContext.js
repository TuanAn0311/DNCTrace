// toastContext.js để tạo một Context cho hệ thống thông báo (toast) trong ứng dụng React. Context này sẽ cung cấp một hàm showToast để hiển thị thông báo với các loại khác nhau (info, success, error). ToastProvider sẽ quản lý trạng thái của các thông báo và tự động xóa chúng sau một khoảng thời gian nhất định. Các component con có thể sử dụng useToast hook để truy cập vào hàm showToast và hiển thị thông báo khi cần thiết.
import { createContext, useContext } from 'react';

export const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
};
