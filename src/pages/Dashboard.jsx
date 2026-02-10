import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ShieldAlert, Trash2, Store, ChevronRight, Mail, MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { TRANSLATIONS } from '../lib/translations';
import ContactModal from '../components/ContactModal';
import { addMessage, getRecentUpdates, getUnreadCount, getUnreadReplyCount, getUnreadInquiryCount } from '../lib/mockData';

const CategoryCard = ({ to, icon: Icon, title, description, categoryColor, index, unreadCount, t }) => (
    <Link
        to={to}
        className={cn(
            "group bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300",
            "flex flex-col h-full relative overflow-hidden"
        )}
        style={{ borderTopWidth: '6px', borderTopColor: categoryColor }}
    >
        <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-gray-50 group-hover:bg-gray-100 transition-colors relative">
                <Icon size={40} style={{ color: categoryColor }} />
            </div>
            <span className="text-4xl font-bold text-gray-100 absolute top-4 right-6 pointer-events-none select-none">
                0{index + 1}
            </span>
        </div>

        <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 flex items-center flex-wrap gap-2 leading-snug">
                <span className="min-w-0 break-words hyphens-auto">
                    {title}
                </span>
                {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                        {t.unread} {unreadCount} {t.items}
                    </span>
                )}
            </h3>
            <p className="text-body text-gray-500 leading-relaxed text-sm">
                {description}
            </p>
        </div>

        <div className="mt-auto pt-4 flex justify-end text-gray-300">
            <ChevronRight size={24} />
        </div>
    </Link>
);

const Dashboard = ({ user, language = 'ja', isAdmin }) => {
    console.log('[DEBUG] Dashboard render', { isAdmin, userRole: user?.role });
    const t = TRANSLATIONS[language];
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    const handleSendMessage = (data) => {
        addMessage({
            ...data,
            senderId: user.id || 'Unknown',
            senderName: user.name || 'Anonymous'
        });
        alert(language === 'ja' ? 'メッセージを送信しました' : 'Message sent successfully');
    };

    const categories = [
        {
            id: 'announcements',
            to: '/announcements',
            icon: Bell,
            title: t.categories.announcements.title,
            description: t.categories.announcements.description,
            categoryColor: '#E64A19', // Akane
        },
    ].map(cat => ({
        ...cat,
        unreadCount: (!isAdmin && cat.id === 'announcements')
            ? getUnreadCount(cat.id, user?.id)
            : 0
    }));

    return (
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:space-y-0 space-y-8 h-full">
            {/* Left Column: Welcome & Updates */}
            <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="bg-white rounded-lg p-6 border border-gray-200 border-l-8 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-h1 text-primary mb-2">
                        {t.welcome}、{user?.name ? `${user.name}${t.welcomeSuffix}` : t.welcomeSuffix}
                    </h2>
                    <p className="text-body text-text">
                        {t.dashboardDescription}<br />
                        {t.dashboardEmergency}
                    </p>

                    {/* Action Buttons based on Role */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        {isAdmin ? (
                            <div className="flex flex-col sm:flex-row gap-6">
                                <Link to="/messages" className="flex-1 flex items-center justify-center bg-white border border-gray-200 py-3 px-4 rounded-lg text-primary hover:bg-gray-50 hover:shadow-sm transition-all whitespace-nowrap relative">
                                    <Mail size={20} className="mr-2" />
                                    {language === 'ja' ? 'お問い合わせ一覧' : 'Inquiry List'}
                                    {getUnreadInquiryCount() > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md">
                                            {getUnreadInquiryCount()}
                                        </span>
                                    )}
                                </Link>
                                <Link to="/unread-management" className="flex-1 flex items-center justify-center bg-white border border-gray-200 py-3 px-4 rounded-lg text-[#E64A19] hover:bg-gray-50 hover:shadow-sm transition-all whitespace-nowrap">
                                    <Bell size={20} className="mr-2" />
                                    既読管理
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-6">
                                <button
                                    onClick={() => setIsContactModalOpen(true)}
                                    className="flex-1 flex items-center justify-center bg-white border border-gray-200 py-3 px-4 rounded-lg text-primary hover:bg-gray-50 hover:shadow-sm transition-all whitespace-nowrap"
                                >
                                    <MessageCircle size={20} className="mr-2" />
                                    {t.contact?.title || 'Contact Admin'}
                                </button>
                                <Link
                                    to="/my-messages"
                                    className="flex-1 flex items-center justify-center bg-white border border-gray-200 py-3 px-4 rounded-lg text-primary hover:bg-gray-50 hover:shadow-sm transition-all whitespace-nowrap relative"
                                >
                                    <Mail size={20} className="mr-2" />
                                    {language === 'ja' ? 'お問い合わせ履歴' : 'History'}
                                    {getUnreadReplyCount(user?.id) > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md">
                                            {getUnreadReplyCount(user?.id)}
                                        </span>
                                    )}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Updates Section */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm flex-grow">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                        <h3 className="text-menu font-bold text-gray-800 flex items-center">
                            <Bell size={24} className="mr-2 text-primary" />
                            {t.recentUpdates || 'Updates'}
                            <span className="ml-2 text-xs font-normal text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                                {language === 'ja' ? '1週間以内' : 'Last 7 days'}
                            </span>
                        </h3>
                    </div>

                    <div className="max-h-[400px] lg:max-h-[calc(100vh-450px)] overflow-y-auto">
                        {getRecentUpdates().length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {getRecentUpdates().map((post) => (
                                    <Link
                                        key={`${post.category}-${post.id}`}
                                        to={`/${post.category}`}
                                        className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                                            <span className="text-sm font-medium text-gray-400 w-24 flex-shrink-0">{post.date}</span>
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className={cn(
                                                    "inline-block px-2 py-0.5 rounded text-xs font-bold text-white whitespace-nowrap",
                                                    post.category === 'announcements' && "bg-[#E64A19]",

                                                )}>
                                                    {t.categories[post.category]?.title}
                                                </span>
                                                <span className="text-body text-gray-800 truncate">
                                                    {(() => {
                                                        if (language === 'en') return post.title_en || post.title;
                                                        if (language === 'zh') return post.title_zh || post.title;
                                                        if (language === 'es') return post.title_es || post.title;
                                                        return post.title;
                                                    })()}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-400">
                                {t.noPosts || 'No recent updates'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column: Categories */}
            <div className="lg:col-span-7 h-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                    {categories.map((cat, index) => (
                        <CategoryCard key={cat.to} {...cat} index={index} t={t} />
                    ))}
                </div>
            </div>

            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                onSubmit={handleSendMessage}
                language={language}
            />
        </div >
    );
};

export default Dashboard;
