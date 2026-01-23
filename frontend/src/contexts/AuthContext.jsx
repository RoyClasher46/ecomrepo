import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/checkauth', {
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                setIsAuthenticated(true);
                return data.user;
            } else {
                setUser(null);
                setIsAuthenticated(false);
                return null;
            }
        } catch (err) {
            console.error('Auth check error:', err);
            setUser(null);
            setIsAuthenticated(false);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const refreshAuth = async () => {
        setLoading(true);
        return await checkAuth();
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
    };

    useEffect(() => {
        // Only check auth once on mount
        checkAuth();
    }, []);

    const value = {
        user,
        loading,
        isAuthenticated,
        checkAuth,
        refreshAuth,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
