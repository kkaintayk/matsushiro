import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Bell, ShieldAlert, Trash2, LogOut, Globe } from 'lucide-react';
import { cn } from '../lib/utils';
import { TRANSLATIONS } from '../lib/translations';

const Layout = ({ isAdmin, onLogout, language = 'ja', setLanguage, fontSize, setFontSize }) => {
    const location = useLocation();
    const t = TRANSLATIONS[language];

    const navItems = [
        { icon: Home, label: t.nav.home, path: '/dashboard' },
        { icon: Bell, label: t.nav.announcements, path: '/announcements' },
        { icon: ShieldAlert, label: t.nav.disaster, path: '/disaster' },
        { icon: Trash2, label: t.nav.garbage, path: '/garbage' },
    ];

    const languages = [
        { code: 'ja', label: 'JA' },
        { code: 'en', label: 'EN' },
        { code: 'zh', label: 'CH' },
        { code: 'es', label: 'ES' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-primary tracking-tight truncate mr-2">
                        {t.headerTitle}
                        <span className="text-xs font-normal text-gray-500 ml-2 hidden sm:inline">
                            {t.headerSubtitle}
                        </span>
                    </h1>
                    <div className="flex items-center gap-2">
                        {/* Language Selector */}
                        <div className="relative group mr-1">
                            <button className="p-2 text-gray-400 hover:text-primary transition-colors flex items-center">
                                <Globe size={20} />
                                <span className="ml-1 text-xs font-bold uppercase">{language}</span>
                            </button>
                            <div className="absolute right-0 top-full mt-0 bg-white rounded-lg shadow-lg border border-gray-100 py-1 hidden group-hover:block w-16">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => setLanguage(lang.code)}
                                        className={cn(
                                            "w-full px-2 py-2 text-xs font-bold text-center hover:bg-gray-50 transition-colors",
                                            language === lang.code ? "text-primary" : "text-gray-500"
                                        )}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center bg-gray-100 rounded-lg p-1 mr-2">
                            <button
                                onClick={() => setFontSize('medium')}
                                className={cn(
                                    "px-2 py-1 text-xs rounded transition-colors",
                                    fontSize === 'medium' ? "bg-white shadow text-primary font-bold" : "text-gray-500"
                                )}
                            >
                                標準
                            </button>
                            <button
                                onClick={() => setFontSize('large')}
                                className={cn(
                                    "px-2 py-1 text-xs rounded transition-colors",
                                    fontSize === 'large' ? "bg-white shadow text-primary font-bold" : "text-gray-500"
                                )}
                            >
                                大
                            </button>
                        </div>
                        <button
                            onClick={onLogout}
                            className="p-2 text-gray-400 hover:text-accent transition-colors"
                            title={t.logout}
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 pb-24 lg:pb-8 animate-in fade-in duration-500">
                <Outlet />
            </main>

            {/* Bottom Navigation (Mobile Only) */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe">
                <div className="max-w-md mx-auto flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200",
                                    isActive
                                        ? "text-accent scale-105 font-bold"
                                        : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default Layout;
