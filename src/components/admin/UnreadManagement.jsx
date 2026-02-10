import React, { useState, useMemo } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { Eye, Download, X, ListFilter, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { getAllPosts, MOCK_USERS } from '../../lib/mockData';
import { cn } from '../../lib/utils';

// --- Constants & Config ---
const COLORS = {
    high: '#4CAF50',  // 90% and above
    medium: '#FFC107', // 70% - 90%
    low: '#F44336',   // Below 70%
    primary: '#E64A19', // Akane Red
    text: '#374151'
};

// 【拡張ポイント1】ページサイズを変更可能にする場合
const PAGE_SIZE = 50;

const BLOCKS = ['A', 'B', 'C', 'D', 'E'];

const UnreadManagement = () => {
    const [selectedPost, setSelectedPost] = useState(null);
    const [filterBlock, setFilterBlock] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    // 【拡張ポイント2】名前検索を追加する場合: const [searchQuery, setSearchQuery] = useState('');

    // --- Data Processing ---
    const { processedPosts, blockStats, recentStats } = useMemo(() => {
        const posts = getAllPosts().filter(p => p.category === 'announcements');
        const users = MOCK_USERS;

        // Process each post
        const processed = posts.map(post => {
            const targetBlocks = post.targetBlocks || [];
            // 2. Identify target users
            const targetUsers = targetBlocks.length === 0
                ? users
                : users.filter(u => targetBlocks.includes(u.block));

            // 3. Identify unread users
            const unreadUsers = targetUsers.filter(u => !post.readBy || !post.readBy.includes(u.id));

            // 4. Calculate Rate
            const targetCount = targetUsers.length;
            const readCount = targetUsers.length - unreadUsers.length;
            const readRate = targetCount > 0 ? (readCount / targetCount) * 100 : 0;

            return {
                ...post,
                targetUsers,
                unreadUsers,
                targetCount,
                readCount,
                readRate,
                targetDisplay: targetBlocks.length > 0 ? targetBlocks.join(', ') + 'ブロック' : '全ブロック'
            };
        }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date desc

        // --- Graph 1 Data: Average Read Rate by Block ---
        const blockStats = BLOCKS.map(block => {
            // Filter target users in this block
            const blockUsers = users.filter(u => u.block === block);
            if (blockUsers.length === 0) return { name: `${block}ブロック`, value: 0 };

            // Calculate average read rate for this block across all posts
            // Note: Simplification - Average of rates (could be weighted)
            const rates = processed.map(post => {
                // Was this block targeted?
                if (post.targetBlocks && post.targetBlocks.length > 0 && !post.targetBlocks.includes(block)) {
                    return null; // Skip if not targeted
                }
                // Calculate rate for this block specifically for this post
                const blockTargets = post.targetUsers.filter(u => u.block === block);
                const blockRead = blockTargets.filter(u => post.readBy && post.readBy.includes(u.id));
                return blockTargets.length > 0 ? (blockRead.length / blockTargets.length) * 100 : 0;
            }).filter(r => r !== null);

            const avgRate = rates.length > 0
                ? rates.reduce((a, b) => a + b, 0) / rates.length
                : 0;

            return { name: `${block}ブロック`, value: parseFloat(avgRate.toFixed(1)) };
        });

        // --- Graph 2 Data: Recent 10 Posts ---
        const recentStats = processed.slice(0, 10).map(p => ({
            name: p.title.length > 15 ? p.title.substring(0, 15) + '...' : p.title,
            fullName: p.title,
            rate: parseFloat(p.readRate.toFixed(1))
        })).reverse(); // Oldest to newest for bar chart usually better, but recent first is ok too. Let's do recent 10.

        return {
            processedPosts: processed,
            blockStats: blockStats, // Renamed variable in logic for clarity, actually block meaningfulStats
            recentStats
        };
    }, []);

    // --- Handlers ---
    const handleOpenModal = (post) => {
        setSelectedPost(post);
        setFilterBlock('all');
        setCurrentPage(1);
    };

    const handleCloseModal = () => {
        setSelectedPost(null);
    };

    const handleDownloadCSV = () => {
        if (!selectedPost) return;

        // Apply same filters as view? Requirement says "Unread List", implies all unread. 
        // But usually WYSIWYG. Let's download ALL unread users for consistency with "Download List".
        // Requirement 6 says: Title, Date, Name, Block, UserID

        const headers = ['記事タイトル', '配信日', '氏名', 'ブロック', 'ユーザーID'];
        const rows = selectedPost.unreadUsers.map(u => [
            selectedPost.title,
            selectedPost.date,
            u.name,
            `${u.block}ブロック`,
            u.id
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

        // UTF-8 BOM
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `未読者リスト_${selectedPost.title}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Modal Logic ---
    const filteredModalUsers = useMemo(() => {
        if (!selectedPost) return [];
        let users = selectedPost.unreadUsers;
        if (filterBlock !== 'all') {
            users = users.filter(u => u.block === filterBlock);
        }
        return users;
    }, [selectedPost, filterBlock]);

    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredModalUsers.slice(start, start + PAGE_SIZE);
    }, [filteredModalUsers, currentPage]);

    const totalPages = Math.ceil(filteredModalUsers.length / PAGE_SIZE);

    // --- Render Helpers ---
    const getRateColor = (rate) => {
        if (rate >= 90) return 'text-green-600';
        if (rate >= 70) return 'text-yellow-600';
        return 'text-red-500';
    };

    const getProgessColor = (rate) => {
        if (rate >= 90) return COLORS.high;
        if (rate >= 70) return COLORS.medium;
        return COLORS.low;
    };

    return (
        <div className="space-y-8 font-sans">
            {/* --- 2. Graphs Section --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Graph 1: Block Average */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-[#E64A19] pl-3">
                        ブロック別 平均既読率
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={blockStats}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={({ name, value }) => `${name}: ${value}%`}
                                >
                                    {blockStats && blockStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getProgessColor(entry.value)} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Graph 2: Recent Posts */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-[#E64A19] pl-3">
                        最近の記事の既読率 (最新10件)
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={recentStats || []} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" domain={[0, 100]} unit="%" />
                                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                                <Tooltip content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-white p-2 border border-gray-200 shadow-sm text-sm rounded">
                                                <p className="font-bold">{data.fullName}</p>
                                                <p>既読率: {data.rate}%</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }} />
                                <Bar dataKey="rate" fill={COLORS.primary} radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* --- 3. Table Section --- */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-[#E64A19] px-6 py-4 flex items-center text-white">
                    <FileText className="mr-2" size={24} />
                    <h3 className="text-lg font-bold">記事別 既読状況一覧</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                                <th className="px-6 py-4 font-medium min-w-[200px]">記事タイトル</th>
                                <th className="px-6 py-4 font-medium whitespace-nowrap">配信日</th>
                                <th className="px-6 py-4 font-medium">配信対象</th>
                                <th className="px-6 py-4 font-medium text-center">既読数 / 対象</th>
                                <th className="px-6 py-4 font-medium text-center">既読率</th>
                                <th className="px-6 py-4 font-medium text-right">詳細</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {processedPosts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">データがありません</td>
                                </tr>
                            ) : (
                                processedPosts.map((post, index) => (
                                    <tr
                                        key={post.id}
                                        className={cn(
                                            "hover:bg-orange-50 transition-colors",
                                            index % 2 !== 0 ? "bg-gray-50/50" : "bg-white"
                                        )}
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-800">
                                            <div className="flex items-center gap-2">
                                                {post.importance === 'urgent' && (
                                                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded border border-red-200">緊急</span>
                                                )}
                                                {post.importance === 'high' && (
                                                    <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded border border-orange-200">重要</span>
                                                )}
                                                {post.title}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{post.date}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-[150px] truncate" title={post.targetDisplay}>
                                            {post.targetDisplay}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-center">
                                            <span className="font-bold">{post.readCount}</span>
                                            <span className="text-gray-400 mx-1">/</span>
                                            <span>{post.targetCount}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={cn("font-bold", getRateColor(post.readRate))}>
                                                {post.readRate.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleOpenModal(post)}
                                                className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-[#E64A19] hover:bg-orange-50 rounded-full transition-colors"
                                                title="詳細を見る"
                                            >
                                                <Eye size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- 5. Modal Section --- */}
            {selectedPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">未読者リスト</h3>
                                <p className="text-sm text-gray-500 mt-1 max-w-lg truncate">{selectedPost.title}</p>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Filter Area */}
                        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-3">
                                <ListFilter size={18} className="text-gray-400" />
                                <select
                                    className="border border-gray-300 rounded-md text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#E64A19]"
                                    value={filterBlock}
                                    onChange={(e) => {
                                        setFilterBlock(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="all">全ブロック</option>
                                    {BLOCKS.map(block => (
                                        <option key={block} value={block}>{block}ブロック</option>
                                    ))}
                                </select>
                            </div>
                            <span className="text-sm text-gray-500">
                                全{filteredModalUsers.length}件中 {paginatedUsers.length}件を表示
                            </span>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto px-6 py-2">
                            {/* 【拡張ポイント3】仮想スクロール導入の場合: FixedSizeList here */}
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-white shadow-sm z-10">
                                    <tr className="border-b border-gray-200 text-sm text-gray-500">
                                        <th className="py-3 pl-2">氏名</th>
                                        <th className="py-3">ブロック</th>
                                        <th className="py-3">ユーザーID</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {paginatedUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="py-8 text-center text-gray-400">
                                                {selectedPost.unreadUsers.length === 0 ? "全員が既読です" : "条件に一致する未読者はいません"}
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedUsers.map(user => (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="py-3 pl-2 font-medium text-gray-800">{user.name}</td>
                                                <td className="py-3 text-sm">
                                                    <span className="inline-block bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                                                        {user.block}ブロック
                                                    </span>
                                                </td>
                                                <td className="py-3 text-sm font-mono text-gray-400">{user.id}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer & Pagination */}
                        <div className="border-t border-gray-100 bg-gray-50 p-4 rounded-b-xl flex flex-col sm:flex-row items-center justify-between gap-4">

                            {/* Pagination Controls */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="text-sm font-medium text-gray-600">
                                    Page {currentPage} / {totalPages || 1}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                                >
                                    閉じる
                                </button>
                                <button
                                    onClick={handleDownloadCSV}
                                    disabled={selectedPost.unreadUsers.length === 0}
                                    className="flex items-center px-4 py-2 bg-[#E64A19] text-white rounded-lg hover:bg-[#D84315] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm"
                                >
                                    <Download size={16} className="mr-2" />
                                    CSVでダウンロード
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnreadManagement;
