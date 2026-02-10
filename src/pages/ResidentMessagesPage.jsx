import React, { useState, useEffect } from 'react';
import { Mail, ChevronLeft, User, Calendar, MessageCircle, Trash2, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMessages, markAllRepliesAsRead, deleteMessage, addReply } from '../lib/mockData';
import { TRANSLATIONS } from '../lib/translations';

const ResidentMessagesPage = ({ currentUser, language = 'ja' }) => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const loadMessages = () => {
            const allMsgs = getMessages();
            // Filter for current user
            const myMsgs = allMsgs.filter(m => m.senderId === currentUser?.id);
            // Sort by date desc
            myMsgs.sort((a, b) => new Date(b.date) - new Date(a.date));
            setMessages(myMsgs);

            // Mark any unread replies as read
            markAllRepliesAsRead(currentUser?.id);
        };
        loadMessages();
        const interval = setInterval(loadMessages, 5000); // Auto-refresh for new replies
        return () => clearInterval(interval);
    }, [currentUser]);

    const t = TRANSLATIONS[language];
    const pageTitle = language === 'ja' ? 'お問い合わせ履歴' : 'My Inquiries';
    const noMessages = language === 'ja' ? 'お問い合わせ履歴はありません' : 'No inquiries history';

    const [replyText, setReplyText] = useState({});

    const handleSendReply = (msgId) => {
        const text = replyText[msgId];
        if (!text || !text.trim()) return;

        addReply(msgId, text, 'resident');
        setReplyText(prev => ({ ...prev, [msgId]: '' }));
        // Force refresh
        setMessages(prev => {
            const msgs = getMessages();
            const myMsgs = msgs.filter(m => m.senderId === currentUser?.id);
            myMsgs.sort((a, b) => new Date(b.date) - new Date(a.date));
            return myMsgs;
        });
    };

    return (
        <div className="pb-24 pt-8 px-4 max-w-4xl mx-auto notranslate" translate="no">
            <div className="flex items-center mb-6">
                <Link to="/dashboard" className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <ChevronLeft size={24} className="text-gray-600" />
                </Link>
                <div className="flex items-center">
                    <div className="p-2 bg-primary/10 rounded-full mr-3 text-primary">
                        <MessageCircle size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{pageTitle}</h2>
                </div>
            </div>

            <div className="space-y-6">
                {messages.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail size={32} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">{noMessages}</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const replyCount = msg.replies ? msg.replies.length : 0;
                        const canReply = replyCount < 6; // 3 turns (3 resident + 3 admin)

                        return (
                            <div key={msg.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                {/* Header */}
                                <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg mb-1">{msg.subject}</h3>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Calendar size={14} className="mr-1" />
                                            <span>{msg.date}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {msg.replies && msg.replies.length > 0 && (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                                {language === 'ja' ? '回答あり' : 'Replied'}
                                            </span>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                if (window.confirm(language === 'ja' ? 'このメッセージを削除してもよろしいですか？' : 'Delete this message?')) {
                                                    deleteMessage(msg.id);
                                                    setMessages(prev => prev.filter(m => m.id !== msg.id));
                                                }
                                            }}
                                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors"
                                            title={language === 'ja' ? '削除' : 'Delete'}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <div className="bg-blue-50 p-4 rounded-lg rounded-tl-none mb-6 ml-4 relative">
                                        <div className="absolute top-0 left-0 -ml-2 -mt-2 w-4 h-4 bg-blue-50 transform rotate-45"></div>
                                        <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                            {msg.content}
                                        </div>
                                    </div>

                                    {/* Replies Conversation */}
                                    {msg.replies && msg.replies.length > 0 && (
                                        <div className="space-y-4 pt-4 border-t border-gray-100">
                                            {msg.replies.map(reply => (
                                                <div key={reply.id} className={`flex flex-col ${reply.sender === 'resident' ? 'items-end' : 'items-start'}`}>
                                                    <div className={`max-w-[85%] p-4 rounded-lg ${reply.sender === 'resident'
                                                        ? 'bg-blue-50 rounded-tr-none'
                                                        : 'bg-gray-100 rounded-tl-none'
                                                        }`}>
                                                        <div className="flex justify-between items-center mb-1 gap-4">
                                                            <span className={`text-xs font-bold ${reply.sender === 'resident' ? 'text-primary' : 'text-gray-600'}`}>
                                                                {reply.sender === 'resident' ? (language === 'ja' ? 'あなた' : 'You') : (language === 'ja' ? '管理者' : 'Admin')}
                                                            </span>
                                                            <span className="text-xs text-gray-400">{reply.date}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Reply Input */}
                                    {canReply ? (
                                        <div className="flex gap-2 items-start mt-6 pt-4 border-t border-gray-100 animate-in fade-in">
                                            <div className="pt-2 text-gray-400">
                                                <MessageCircle size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <textarea
                                                    value={replyText[msg.id] || ''}
                                                    onChange={(e) => setReplyText(prev => ({ ...prev, [msg.id]: e.target.value }))}
                                                    placeholder={language === 'ja' ? '返信を入力...' : 'Write a reply...'}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none text-sm"
                                                    rows={1}
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleSendReply(msg.id)}
                                                disabled={!replyText[msg.id]?.trim()}
                                                className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-1"
                                            >
                                                <Send size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="mt-4 text-center text-xs text-gray-400 bg-gray-50 py-2 rounded">
                                            {language === 'ja' ? 'この会話は終了しました（最大3往復）' : 'Conversation ended (Max 3 turns)'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ResidentMessagesPage;
