
import React, { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';
import UserTable from '../components/admin/UserTable';
import FileTable from '../components/admin/FileTable';
import Spinner from '../components/common/Spinner';
import { getAllUsers, deleteUser as deleteUserService, getAllFiles } from '../services/adminService';
import { User, FileData } from '../types';
import { Users, Files } from 'lucide-react';

enum AdminTab {
    Users = 'users',
    Files = 'files'
}

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>(AdminTab.Users);
  const [users, setUsers] = useState<User[]>([]);
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotification();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      setUsers(response.data);
    } catch (error) {
      addNotification('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  }, [addNotification]);
  
  const fetchFiles = useCallback(async () => {
      setLoading(true);
      try {
        const response = await getAllFiles();
        setFiles(response.data);
      } catch (error) {
        addNotification('Failed to fetch files', 'error');
      } finally {
        setLoading(false);
      }
    }, [addNotification]);


  useEffect(() => {
    if (activeTab === AdminTab.Users) {
      fetchUsers();
    } else {
      fetchFiles();
    }
  }, [activeTab, fetchUsers, fetchFiles]);
  
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This is irreversible.')) {
        try {
            await deleteUserService(userId);
            addNotification('User deleted successfully', 'success');
            setUsers(users.filter(u => u.id !== userId));
        } catch (error) {
            addNotification('Failed to delete user', 'error');
        }
    }
  };

  const renderContent = () => {
    if (loading) return <div className="flex justify-center p-8"><Spinner /></div>;
    
    switch (activeTab) {
      case AdminTab.Users:
        return <UserTable users={users} onDelete={handleDeleteUser} />;
      case AdminTab.Files:
        return <FileTable files={files} />;
      default:
        return null;
    }
  };

  const getTabClass = (tab: AdminTab) => 
    `flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
      activeTab === tab 
      ? 'bg-primary dark:bg-dark-primary text-white' 
      : 'text-text-secondary dark:text-dark-text-secondary hover:bg-surface dark:hover:bg-dark-surface'
    }`;
  

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-text-primary dark:text-dark-text-primary">Admin Dashboard</h1>
      <div className="bg-surface dark:bg-dark-surface p-6 rounded-2xl shadow-xl">
        <div className="mb-6">
            <nav className="flex space-x-2 bg-background dark:bg-dark-background p-2 rounded-xl">
                <button onClick={() => setActiveTab(AdminTab.Users)} className={getTabClass(AdminTab.Users)}>
                    <Users size={16} /> Manage Users
                </button>
                <button onClick={() => setActiveTab(AdminTab.Files)} className={getTabClass(AdminTab.Files)}>
                    <Files size={16} /> Manage Files
                </button>
            </nav>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminPage;