import React from 'react';
import { X, Check, Minus } from 'lucide-react';
import { MOCK_USERS } from '../lib/mockData';

const ReadStatusModal = ({ isOpen, onClose, readBy = [] }) => {
    if (!isOpen) return null;

    const [selectedBlock, setSelectedBlock] = React.useState('A');
    const blocks = ['A', 'B', 'C', 'D', 'E'];

    // Filter users by selected block and targetBlock logic (if passed, but currently mockData logic handles general list)
    // Here we just filter the base MOCK_USERS by block
    const blockUsers = MOCK_USERS.filter(u => u.block === selectedBlock);

    // In this modal, readBy contains IDs of users who read the post.
    // Unread users are those in the block NOT in readBy
    const unreadUsers = blockUsers.filter(user => !readBy.includes(user.id));
    const readUsersInBlock = blockUsers.filter(user => readBy.includes(user.id));

    // Calculate stats for this block
    const blockReadCount = readUsersInBlock.length;
    const blockTotal = blockUsers.length;
    const blockReadRate = Math.round((blockReadCount / blockTotal) * 100);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">既読状況確認</h3>
                        <p className="text-xs text-gray-500">
                            {selectedBlock}ブロック: {blockReadRate}% ({blockReadCount}/{blockTotal}人)
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>

                {/* Block Tabs */}
                <div className="flex overflow-x-auto border-b border-gray-100 p-2 gap-2 flex-shrink-0 hide-scrollbar">
                    {blocks.map(block => (
                        <button
                            key={block}
                            onClick={() => setSelectedBlock(block)}
                            className={`flex-1 min-w-[60px] py-2 rounded-lg text-sm font-bold transition-all ${selectedBlock === block
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            {block}
                        </button>
                    ))}
                </div>

                <div className="overflow-y-auto flex-1 p-0">
                    {unreadUsers.length === 0 && (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full mb-3">
                                <Check size={24} />
                            </div>
                            <p>{selectedBlock}ブロックは全員既読です</p>
                        </div>
                    )}

                    {unreadUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mr-3 bg-red-50 text-red-500 border border-red-100">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-gray-800">
                                            {user.name}
                                        </span>
                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                            {selectedBlock}-{user.id}
                                        </span>
                                    </div>
                                    <span className="text-xs text-red-400 font-medium">未読</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Separator if needed, or just show unread first. 
                        Let's optionally show read users at the bottom or just stick to "Unread" focus as requested.
                        The request was to see "Unread: A Block Tanaka Taro". 
                        The current implementation focuses on Unread users list per block.
                    */}
                </div>
            </div>
        </div>
    );
};

export default ReadStatusModal;
