import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, ChevronLeft, Eye, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import PostModal from '../components/PostModal';
import ReadStatusModal from '../components/ReadStatusModal';
import { cn } from '../lib/utils';
import { getPosts, addPost, deletePost, markAsRead, MOCK_USERS, isTargetUser } from '../lib/mockData';
import { TRANSLATIONS } from '../lib/translations';

const CategoryPage = ({ title, category, isAdmin, currentUser, language = 'ja' }) => {
    const [posts, setPosts] = useState([]);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [isReadModalOpen, setIsReadModalOpen] = useState(false);
    const [selectedPostForReadStatus, setSelectedPostForReadStatus] = useState(null);
    const [expandedPostId, setExpandedPostId] = useState(null);
    const [activeTab, setActiveTab] = useState('all'); // all, unread, history

    // Filter posts based on active tab
    const displayedPosts = posts.filter(post => {
        if (!currentUser || isAdmin) return true;

        const isRead = post.readBy?.includes(currentUser.id);

        if (activeTab === 'unread') return !isRead;
        if (activeTab === 'history') return isRead; // History shows confirmed/read posts
        return true; // All
    });

    // Helper to get translated content
    const getTranslatedText = (post, field) => {
        if (language === 'ja') return post[field];
        return post[`${field}_${language}`] || post[field];
    };

    const t = TRANSLATIONS[language];

    // Load posts from store
    useEffect(() => {
        const allPosts = getPosts(category);
        const filteredPosts = isAdmin
            ? allPosts
            : allPosts.filter(post => isTargetUser(post, currentUser));
        const sortedPosts = [...filteredPosts].sort((a, b) => new Date(b.date) - new Date(a.date));
        setPosts(sortedPosts);
    }, [category, isAdmin, currentUser]);

    const simulateTranslate = (text, lang) => {
        if (!text) return '';
        const suffixes = {
            en: '[EN]',
            zh: '[CH]',
            es: '[ES]'
        };
        return `${text} ${suffixes[lang]}`;
    };

    const handleAddPost = (newPost) => {
        const postWithRead = {
            ...newPost,
            readBy: [],
            title_en: simulateTranslate(newPost.title, 'en'),
            title_zh: simulateTranslate(newPost.title, 'zh'),
            title_es: simulateTranslate(newPost.title, 'es'),
            content_en: simulateTranslate(newPost.content, 'en'),
            content_zh: simulateTranslate(newPost.content, 'zh'),
            content_es: simulateTranslate(newPost.content, 'es'),
        };
        addPost(category, postWithRead);
        setPosts(getPosts(category)); // Refresh
    };

    const handleDeletePost = (id, e) => {
        e.stopPropagation(); // Prevent expanding the post
        if (window.confirm(t.deleteConfirm)) {
            deletePost(category, id);
            setPosts(getPosts(category)); // Refresh
        }
    };

    const isReadReceiptEnabled = !['garbage', 'ads'].includes(category);

    const handlePostClick = (post) => {
        if (expandedPostId === post.id) {
            setExpandedPostId(null);
        } else {
            setExpandedPostId(post.id);
            // Mark as read if resident and enabled
            if (!isAdmin && currentUser && isReadReceiptEnabled) {
                markAsRead(category, post.id, currentUser.id);
                setPosts(getPosts(category)); // Refresh to show read status
            }
        }
    };

    const openReadStatus = (post, e) => {
        e.stopPropagation();
        setSelectedPostForReadStatus(post);
        setIsReadModalOpen(true);
    };

    return (
        <div className={cn("pb-20", isAdmin && "notranslate")} translate={isAdmin ? "no" : undefined}>
            {/* Header with Back Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center">
                    <Link to="/dashboard" className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <ChevronLeft size={24} className="text-gray-600" />
                    </Link>
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                </div>

                {/* Tabs */}
                {!isAdmin && isReadReceiptEnabled && (
                    <div className="flex bg-gray-100 p-1 rounded-lg self-start sm:self-auto">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={cn(
                                "px-4 py-2 rounded-md text-sm font-bold transition-all",
                                activeTab === 'all' ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {t.all || (language === 'ja' ? 'すべて' : 'All')}
                        </button>
                        <button
                            onClick={() => setActiveTab('unread')}
                            className={cn(
                                "px-4 py-2 rounded-md text-sm font-bold transition-all",
                                activeTab === 'unread' ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {t.unread || (language === 'ja' ? '未読' : 'Unread')}
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={cn(
                                "px-4 py-2 rounded-md text-sm font-bold transition-all",
                                activeTab === 'history' ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {t.history || (language === 'ja' ? '履歴' : 'History')}
                        </button>
                    </div>
                )}
            </div>

            {/* Post List */}
            <div className="space-y-4">
                {displayedPosts.map((post) => {
                    const isRead = !isAdmin && currentUser && post.readBy?.includes(currentUser.id);
                    const readCount = post.readBy?.length || 0;
                    const totalUsers = MOCK_USERS.length;
                    const isExpanded = expandedPostId === post.id;

                    const displayTitle = getTranslatedText(post, 'title');
                    const displayContent = getTranslatedText(post, 'content');

                    return (
                        <div
                            key={post.id}
                            onClick={() => handlePostClick(post)}
                            className={cn(
                                "bg-white rounded-xl shadow-sm border transition-all duration-300 overflow-hidden cursor-pointer",
                                isExpanded ? "ring-2 ring-primary border-transparent shadow-md" : "border-gray-100 hover:shadow-md",
                                isExpanded ? "ring-2 ring-primary border-transparent shadow-md" : "border-gray-100 hover:shadow-md",
                                !isAdmin && !isRead && isReadReceiptEnabled ? "border-l-4 border-l-accent bg-orange-50" : ""
                            )}
                        >
                            {post.image && isExpanded && (
                                <div className="h-48 w-full overflow-hidden animate-in fade-in duration-300">
                                    <img src={post.image} alt={displayTitle} className="w-full h-full object-cover" />
                                </div>
                            )}

                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1 pr-4">
                                        <div className="flex items-center mb-1">
                                            {!isAdmin && !isRead && isReadReceiptEnabled && (
                                                <span className="inline-block bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full mr-2 animate-pulse">
                                                    {t.new}
                                                </span>
                                            )}
                                            {!isAdmin && isRead && isReadReceiptEnabled && (
                                                <span className="inline-flex items-center text-green-600 text-[10px] font-bold px-2 py-0.5 bg-green-50 rounded-full mr-2">
                                                    <CheckCircle size={10} className="mr-1" />
                                                    {t.read}
                                                </span>
                                            )}
                                            <h3 className={cn("text-lg font-bold leading-tight", isRead && isReadReceiptEnabled ? "text-gray-600" : "text-gray-900")}>
                                                {displayTitle}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {/* Read Status Removed
                                        {isAdmin && isReadReceiptEnabled && (
                                            <button
                                                onClick={(e) => openReadStatus(post, e)}
                                                className="flex items-center text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md hover:bg-primary/20 transition-colors"
                                            >
                                                <Eye size={14} className="mr-1" />
                                                {readCount}/{totalUsers} {t.readCount}
                                            </button>
                                        )}
                                        */}
                                        {isAdmin && (
                                            <button
                                                onClick={(e) => handleDeletePost(post.id, e)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-100"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center text-xs text-gray-400 mb-3">
                                    <Calendar size={14} className="mr-1" />
                                    {post.date}
                                </div>

                                <div className={cn("text-gray-600 text-sm leading-relaxed whitespace-pre-wrap transition-all duration-300", isExpanded ? "opacity-100" : "line-clamp-2 opacity-80")}>
                                    {displayContent}
                                </div>

                                {!isExpanded && (
                                    <div className="mt-2 text-center">
                                        <span className="text-xs text-gray-400 font-medium">{t.tapToSeeDetails}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {posts.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        {t.noPosts}
                    </div>
                )}
            </div>

            {/* Floating Action Button for Admin */}
            {isAdmin && (
                <button
                    onClick={() => setIsPostModalOpen(true)}
                    className="fixed bottom-20 right-6 w-14 h-14 bg-accent text-white rounded-full shadow-lg flex items-center justify-center hover:bg-accent-hover hover:scale-105 transition-all duration-200 z-40"
                >
                    <Plus size={28} />
                </button>
            )}

            <PostModal
                isOpen={isPostModalOpen}
                onClose={() => setIsPostModalOpen(false)}
                onSubmit={handleAddPost}
                title={title}
                category={category}
            />

            <ReadStatusModal
                isOpen={isReadModalOpen}
                onClose={() => setIsReadModalOpen(false)}
                readBy={selectedPostForReadStatus?.readBy}
            />
        </div>
    );
};

export default CategoryPage;
