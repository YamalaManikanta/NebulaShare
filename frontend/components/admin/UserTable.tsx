
import React from 'react';
import { User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Trash2 } from 'lucide-react';

interface UserTableProps {
  users: User[];
  onDelete: (userId: string) => void;
}

const UserTable = ({ users, onDelete }: UserTableProps) => {
  const { user: currentUser } = useAuth();
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border dark:divide-dark-border">
        <thead className="bg-background dark:bg-dark-background">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Username</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Email</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Role</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border dark:divide-dark-border">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-surface dark:hover:bg-dark-border/20 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary dark:text-dark-text-primary">{user.username}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-dark-text-secondary">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-dark-text-secondary">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {currentUser?.id !== user.id && user.role !== 'ADMIN' && (
                     <button onClick={() => onDelete(user.id)} className="text-danger dark:text-dark-danger hover:underline flex items-center gap-1 ml-auto">
                        <Trash2 size={14} /> Delete
                    </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;