import React, { useState, useEffect } from 'react';
import { Mail, ChevronLeft, User, Calendar, MessageCircle, Send, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMessages, addReply, markAllMessagesAsRead, deleteMessage } from '../lib/mockData';
import { TRANSLATIONS } from '../lib/translations';

const AdminMessagesPage = ({ language = 'ja' }) => {
    const [messages, setMessages] = useState([]);
    const [replyText, setReplyText] = useState({}); // Map of messageId -> text

    // Load messages on mount and periodically to simulate updates
    useEffect(() => {
        const loadMessages = () => {
            const msgs = getMessages();
            // Sort by date desc
            msgs.sort((a, b) => new Date(b.date) - new Date(a.date));
            setMessages([...msgs]);

            // Mark all viewed as read
            markAllMessagesAsRead();
        };
        loadMessages();
        const interval = setInterval(loadMessages, 5000);
        return () => clearInterval(interval);
    }, []);

    const t = TRANSLATIONS[language];
    const pageTitle = language === 'ja' ? '住民からの連絡' : 'Messages from Residents';
    const noMessages = language === 'ja' ? 'メッセージはありません' : 'No messages';
    const sendReply = language === 'ja' ? '回答を送信' : 'Send Reply';
    const replyPlaceholder = language === 'ja' ? '回答を入力...' : 'Write a reply...';

    const handleReplyChange = (id, text) => {
        setReplyText(prev => ({ ...prev, [id]: text }));
    };

    const handleSendReply = (id) => {
        const text = replyText[id];
        if (!text || !text.trim()) return;

        addReply(id, text);
        setReplyText(prev => ({ ...prev, [id]: '' }));
        // Force refresh
        setMessages([...getMessages()]);
        alert(language === 'ja' ? '回答を送信しました' : 'Reply sent');
    };

    return (
        <div className="pb-24 pt-8 px-4 max-w-4xl mx-auto notranslate" translate="no">
            <div className="flex items-center mb-6">
                <Link to="/dashboard" className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <ChevronLeft size={24} className="text-gray-600" />
                </Link>
                <div className="flex items-center">
                    <div className="p-2 bg-primary/10 rounded-full mr-3 text-primary">
                        <Mail size={24} />
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
                    messages.map((msg) => (
                        <div key={msg.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Header */}
                            <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg mb-1">{msg.subject}</h3>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <User size={14} className="mr-1" />
                                        <span className="font-medium mr-2">{msg.senderName}</span>
                                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500 mr-3">ID: {msg.senderId}</span>
                                        <Calendar size={14} className="mr-1 ml-1" />
                                        <span>{msg.date}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {!msg.read && (
                                        <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full">New</span>
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
                                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-6">
                                    {msg.content}
                                </div>

                                {/* Replies Section */}
                                {msg.replies && msg.replies.length > 0 && (
                                    <div className="space-y-4 pt-4 border-t border-gray-100">
                                        {msg.replies.map(reply => (
                                            <div key={reply.id} className={`flex flex-col ${reply.sender === 'resident' ? 'items-start' : 'items-end'}`}>
                                                <div className={`max-w-[85%] p-4 rounded-lg ${reply.sender === 'resident'
                                                    ? 'bg-gray-100 rounded-tl-none'
                                                    : 'bg-primary/10 rounded-tr-none'
                                                    }`}>
                                                    <div className="flex justify-between items-center mb-1 gap-4">
                                                        <span className={`text-xs font-bold ${reply.sender === 'resident' ? 'text-gray-600' : 'text-primary'}`}>
                                                            {reply.sender === 'resident' ? msg.senderName : (language === 'ja' ? '管理者 (Admin)' : 'Admin')}
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
                                {(msg.replies?.length || 0) < 6 ? (
                                    <div className="flex items-end gap-2 mt-4">
                                        <textarea
                                            value={replyText[msg.id] || ''}
                                            onChange={(e) => handleReplyChange(msg.id, e.target.value)}
                                            placeholder={replyPlaceholder}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none text-sm"
                                            rows={2}
                                        />
                                        <button
                                            onClick={() => handleSendReply(msg.id)}
                                            disabled={!replyText[msg.id]?.trim()}
                                            className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-1"
                                            title={sendReply}
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
                    ))
                )}
            </div >
        </div >
    );
};

export default AdminMessagesPage;
