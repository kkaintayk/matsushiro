import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Image as ImageIcon, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';

const PostModal = ({ isOpen, onClose, onSubmit, title, category }) => {
    // Renamed state variables to avoid any potential conflicts
    const [valTitle, setValTitle] = useState('');
    const [valContent, setValContent] = useState('');
    const [valDate, setValDate] = useState(new Date().toISOString().split('T')[0]);
    const [valImage, setValImage] = useState(null);
    const [valImportance, setValImportance] = useState('normal');
    const [selectedBlocks, setSelectedBlocks] = useState([]);

    const blocks = ['A', 'B', 'C', 'D', 'E'];

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            id: Date.now(),
            title: valTitle,
            content: valContent,
            date: valDate,
            image: valImage,
            targetBlocks: selectedBlocks,
            importance: valImportance,
            likes: 0
        });
        onClose();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setValImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm notranslate" translate="no">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
                    <h3 className="text-lg font-bold text-gray-900">{title}を作成</h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">タイトル</label>
                            <span className={`text-xs font-bold ${valTitle.length >= 50 ? "text-red-500" : "text-blue-500"}`}>
                                {valTitle.length}/50
                            </span>
                        </div>
                        <input
                            type="text"
                            required
                            maxLength={50}
                            value={valTitle}
                            onChange={(e) => setValTitle(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            placeholder="タイトルを入力 (50文字以内)"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
                        <div className="relative">
                            <input
                                type="date"
                                required
                                value={valDate}
                                onChange={(e) => setValDate(e.target.value)}
                                className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                            <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">内容</label>
                            <span className={`text-xs font-bold ${valContent.length >= 500 ? "text-red-500" : "text-blue-500"}`}>
                                {valContent.length}/500
                            </span>
                        </div>
                        <textarea
                            required
                            maxLength={500}
                            rows={4}
                            value={valContent}
                            onChange={(e) => setValContent(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                            placeholder="詳細を入力してください (500文字以内)..."
                        />
                    </div>

                    {category === 'announcements' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">重要度</label>
                            <div className="flex space-x-4">
                                {['normal', 'high', 'urgent'].map((option) => (
                                    <label key={option} className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="importance"
                                            value={option}
                                            checked={valImportance === option}
                                            onChange={(e) => setValImportance(e.target.value)}
                                            className="mr-2 text-primary focus:ring-primary"
                                        />
                                        <span className={cn(
                                            "text-sm font-medium px-2 py-0.5 rounded",
                                            option === 'urgent' ? 'bg-red-100 text-red-600' :
                                                option === 'high' ? 'bg-orange-100 text-orange-600' :
                                                    'text-gray-700'
                                        )}>
                                            {option === 'normal' ? '通常' :
                                                option === 'high' ? '重要' : '緊急'}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {category === 'announcements' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">配信対象ブロック (任意・選択なしで全員)</label>
                            <div className="flex flex-wrap gap-2">
                                {blocks.map((block) => (
                                    <button
                                        key={block}
                                        type="button"
                                        onClick={() => {
                                            setSelectedBlocks(prev =>
                                                prev.includes(block)
                                                    ? prev.filter(b => b !== block)
                                                    : [...prev, block]
                                            );
                                        }}
                                        className={cn(
                                            "px-3 py-1.5 rounded-full text-sm font-bold border transition-all",
                                            selectedBlocks.includes(block)
                                                ? "bg-primary text-white border-primary"
                                                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                                        )}
                                    >
                                        Block {block}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">画像 (任意)</label>
                        <div className="flex items-center space-x-4">
                            <label className="cursor-pointer flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 text-sm">
                                <ImageIcon size={18} className="mr-2" />
                                画像を選択
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                            {valImage && (
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                                    <img src={valImage} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setValImage(null)}
                                        className="absolute top-0 right-0 bg-black/50 text-white p-0.5"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-dark transition-colors"
                        >
                            投稿する
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default PostModal;
