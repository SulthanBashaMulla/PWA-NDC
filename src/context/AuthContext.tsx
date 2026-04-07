import React, { createContext, useContext, useState, useCallback } from 'react';

export type UserRole = 'admin' | 'lecturer' | 'student';

export interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  // Student fields
  rollNo?: string;
  group?: string;
  section?: string;
  semester?: number;
  phone?: string;
  // Lecturer fields
  lecturerId?: string;
  department?: string;
  designation?: string;
  isIncharge?: boolean;
  // Admin fields
  adminId?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (id: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo users for development
const DEMO_USERS: Record<string, User> = {
  'admin001': {
    uid: '1', email: 'admin001@college.admin', name: 'Dr. Suresh Kumar',
    role: 'admin', adminId: 'admin001', designation: 'Principal', phone: '9876543210',
  },
  'LEC001': {
    uid: '2', email: 'LEC001@college.lecturer', name: 'Prof. Anitha Rao',
    role: 'lecturer', lecturerId: 'LEC001', department: 'Computer Science',
    designation: 'Class Incharge', isIncharge: true, group: 'MPC', section: 'A',
  },
  'LEC002': {
    uid: '3', email: 'LEC002@college.lecturer', name: 'Prof. Ramesh Babu',
    role: 'lecturer', lecturerId: 'LEC002', department: 'Physics',
    designation: 'Assistant Professor', isIncharge: false,
  },
  '23CS001': {
    uid: '4', email: '23CS001@college.student', name: 'Ravi Kumar',
    role: 'student', rollNo: '23CS001', group: 'MPC', section: 'A', semester: 3, phone: '9876543211',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (id: string, _password: string, role: UserRole) => {
    setLoading(true);
    // Simulate network delay
    await new Promise(r => setTimeout(r, 1200));

    const demoUser = DEMO_USERS[id];
    if (demoUser && demoUser.role === role) {
      setUser(demoUser);
    } else {
      // For demo, create a generic user
      const genericUser: User = {
        uid: Date.now().toString(),
        email: `${id}@college.${role}`,
        name: id,
        role,
        ...(role === 'student' ? { rollNo: id, group: 'MPC', section: 'A', semester: 3 } : {}),
        ...(role === 'lecturer' ? { lecturerId: id, department: 'General', designation: 'Lecturer', isIncharge: false } : {}),
        ...(role === 'admin' ? { adminId: id, designation: 'Admin' } : {}),
      };
      setUser(genericUser);
    }
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
