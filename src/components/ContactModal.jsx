import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/utils';
import { TRANSLATIONS } from '../lib/translations';

const ContactModal = ({ isOpen, onClose, onSubmit, language = 'ja' }) => {
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');

    // Translation helper
    const t = TRANSLATIONS[language]?.contact || {
        title: 'Contact Admin',
        subject: 'Subject',
        subjectPlaceholder: 'Enter subject',
        message: 'Message',
        messagePlaceholder: 'Enter your message',
        send: 'Send',
        cancel: 'Cancel'
    };

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!subject.trim() || !content.trim()) return;

        onSubmit({ subject, content });
        setSubject('');
        setContent('');
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm notranslate" translate="no">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">{t.title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 block">
                            {t.subject} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder={t.subjectPlaceholder}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 block">
                            {t.message} <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all min-h-[150px] resize-none"
                            placeholder={t.messagePlaceholder}
                            required
                        />
                    </div>

                    <div className="flex justify-end pt-4 space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                        >
                            {t.cancel}
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold shadow-md hover:bg-primary-dark hover:shadow-lg transition-all flex items-center"
                        >
                            {t.send}
                            <Send size={18} className="ml-2" />
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default ContactModal;
