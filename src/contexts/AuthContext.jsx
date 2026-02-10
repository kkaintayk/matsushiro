import React, { createContext, useState, useEffect, useContext } from 'react';
import { MOCK_USERS } from '../lib/mockData';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simple initialization - just check localStorage
        const storedResident = localStorage.getItem('matsushiro_resident');
        if (storedResident) {
            try {
                setUser(JSON.parse(storedResident));
            } catch (e) {
                localStorage.removeItem('matsushiro_resident');
            }
        }
        setLoading(false);
    }, []);

    const loginAdmin = async (password) => {
        // Mock Admin Login 
        if (password === 'admin123') {
            const mockAdmin = { id: 'admin-mock', name: '管理者', role: 'admin', email: 'admin@matsushiro.local' };
            setUser(mockAdmin);
            return;
        }
        throw new Error('Invalid credentials');
    };

    const loginResident = async (residentId, password) => {
        // Mock Data Only
        const mockUser = MOCK_USERS.find(u => u.id === residentId);
        if (mockUser) {
            // Check for stored passwords
            const storedPasswords = JSON.parse(localStorage.getItem('matsushiro_passwords') || '{}');

            if (storedPasswords[residentId]) {
                // Password exists, verify it
                if (storedPasswords[residentId] !== password) {
                    throw new Error('パスワードが間違っています。');
                }
            } else {
                // First time login - Validate password complexity
                // 1. Check for identical numbers (e.g., 1111)
                if (/^(\d)\1+$/.test(password)) {
                    throw new Error('推測されやすいパスワード（連番や同じ数字の繰り返し）は使用できません。');
                }

                // 2. Check for sequential numbers (e.g., 1234, 4321)
                const isSequential = (str) => {
                    const nums = str.split('').map(Number);
                    let ascending = true;
                    let descending = true;
                    for (let i = 0; i < nums.length - 1; i++) {
                        if (nums[i + 1] !== nums[i] + 1) ascending = false;
                        if (nums[i + 1] !== nums[i] - 1) descending = false;
                    }
                    return ascending || descending;
                };

                if (isSequential(password)) {
                    throw new Error('推測されやすいパスワード（連番や同じ数字の繰り返し）は使用できません。');
                }

                // First time login, set the password
                storedPasswords[residentId] = password;
                localStorage.setItem('matsushiro_passwords', JSON.stringify(storedPasswords));
            }

            const residentUser = { ...mockUser, role: 'resident' };
            setUser(residentUser);
            localStorage.setItem('matsushiro_resident', JSON.stringify(residentUser));
            return residentUser;
        }
        throw new Error('Resident ID not found');
    };

    const logout = async () => {
        setUser(null);
        localStorage.removeItem('matsushiro_resident');
    };

    return (
        <AuthContext.Provider value={{ user, loginAdmin, loginResident, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
