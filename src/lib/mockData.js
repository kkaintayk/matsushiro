// Mock Data Store to simulate backend persistence

// Mock Data Store to simulate backend persistence

export const MOCK_USERS = Array.from({ length: 250 }, (_, i) => {
    const blockIndex = Math.floor(i / 50);
    const block = ['A', 'B', 'C', 'D', 'E'][blockIndex];
    // ID format: Block + 3 digits (e.g., A001)
    const number = (i % 50 + 1).toString().padStart(3, '0');
    const id = `${block}${number}`;

    return {
        id: id,
        name: `Resident ${id}`,
        block: block
    };
});

// Maintain legacy specific names for the first few
const EXISTING_USERS = [
    { id: 'A001', name: '田中 太郎' },
    { id: 'A002', name: '鈴木 花子' },
    { id: 'A003', name: '佐藤 次郎' },
    { id: 'A004', name: '高橋 優子' },
    { id: 'A005', name: '伊藤 健太' },
];

// Overwrite the first 5 generated users with existing ones
EXISTING_USERS.forEach((user, index) => {
    if (MOCK_USERS[index]) {
        MOCK_USERS[index] = { ...MOCK_USERS[index], ...user };
    }
});

const INITIAL_POSTS = {
    announcements: [
        {
            id: 1,
            title: '定例総会のお知らせ',
            title_en: 'Regular General Meeting Notice',
            title_zh: '定期大会通知',
            title_es: 'Aviso de Asamblea General Ordinaria',
            date: '2025-12-01',
            content: '来週の日曜日に公民館で定例総会を行います。',
            content_en: 'The regular general meeting will be held at the community center next Sunday.',
            content_zh: '下周日将在社区中心举行定期大会。',
            content_es: 'La asamblea general ordinaria se llevará a cabo en el centro comunitario el próximo domingo.',
            likes: 12,
            readBy: ['A002'],
            importance: 'normal'
        },
        {
            id: 2,
            title: '年末の大掃除について',
            title_en: 'Year-end Cleaning',
            title_zh: '关于年末大扫除',
            title_es: 'Sobre la limpieza de fin de año',
            date: '2025-12-15',
            content: '年末の地域清掃にご協力をお願いします。',
            content_en: 'Please cooperate with the year-end community cleaning.',
            content_zh: '请配合年末的社区清扫。',
            content_es: 'Por favor coopere con la limpieza comunitaria de fin de año.',
            likes: 8,
            readBy: [],
            importance: 'high'
        },
        {
            id: 3,
            title: '町内清掃の報告',
            title_en: 'Community Cleaning Report',
            title_zh: '社区清扫报告',
            title_es: 'Informe de Limpieza Comunitaria',
            date: '2026-01-18',
            content: '先日の町内清掃へのご協力ありがとうございました。',
            content_en: 'Thank you for your cooperation in the recent community cleaning.',
            content_zh: '感谢您在社区清扫中的配合。',
            content_es: 'Gracias por su cooperación en la reciente limpieza comunitaria.',
            likes: 15,
            readBy: [],
            importance: 'normal'
        },
        {
            id: 4,
            title: '資源回収のお知らせ',
            title_en: 'Resource Collection Notice',
            title_zh: '资源回收通知',
            title_es: 'Aviso de Recolección de Recursos',
            date: '2026-01-25',
            content: '明日は資源回収の日です。',
            content_en: 'Tomorrow is resource collection day.',
            content_zh: '明天是资源回收日。',
            content_es: 'Mañana es el día de la recolección de recursos.',
            likes: 5,
            readBy: [],
            importance: 'urgent'
        },
    ],

};

const STORAGE_KEY = 'matsushiro_mock_data_v2';

const loadStore = () => {
    let data = {
        posts: { ...INITIAL_POSTS },
        messages: []
    };

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Merge parsed data with defaults to ensure structure exists
            if (parsed && typeof parsed === 'object') {
                data = {
                    posts: parsed.posts || { ...INITIAL_POSTS },
                    messages: Array.isArray(parsed.messages) ? parsed.messages : []
                };
            }
        }
    } catch (e) {
        console.error('Failed to load store', e);
    }
    return data;
};

// Simple in-memory store initialized from local storage
let store = loadStore();

const saveStore = () => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {
        console.error('Failed to save store', e);
    }
};

export const getPosts = (category) => {
    return store.posts[category] || [];
};

export const addPost = (category, post) => {
    if (!store.posts[category]) store.posts[category] = [];
    store.posts[category] = [post, ...store.posts[category]];
    saveStore();
};

export const deletePost = (category, id) => {
    if (!store.posts[category]) return;
    store.posts[category] = store.posts[category].filter(p => p.id !== id);
    saveStore();
};

export const markAsRead = (category, postId, userId) => {
    const posts = store.posts[category];
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex > -1) {
        const post = posts[postIndex];
        if (!post.readBy) post.readBy = [];
        if (!post.readBy.includes(userId)) {
            post.readBy.push(userId);
            // Update store
            posts[postIndex] = { ...post };
            saveStore();
        }
    }
};

export const getMessages = () => {
    return store.messages;
};

export const addMessage = (message) => {
    const newMessage = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        read: false,
        replies: [], // Array of { content: string, date: string, sender: 'admin' }
        ...message
    };
    store.messages = [newMessage, ...store.messages];
    saveStore();
    return newMessage;
};

export const markMessageAsRead = (id) => {
    const msg = store.messages.find(m => m.id === id);
    if (msg) {
        msg.read = true;
        saveStore();
    }
};

export const addReply = (messageId, replyContent, sender = 'admin') => {
    const msg = store.messages.find(m => m.id === messageId);
    if (msg) {
        if (!msg.replies) msg.replies = [];

        // Check turn limit (3 turns = 6 messages usually, but logic should be length check)
        // Actually, UI will disable input, but good to have check here too? 
        // Let's keep it simple and just add. UI handles limit.

        msg.replies.push({
            id: Date.now(),
            content: replyContent,
            date: new Date().toISOString().split('T')[0],
            sender: sender // 'admin' or 'resident'
        });

        // Update store
        const msgIndex = store.messages.findIndex(m => m.id === messageId);

        if (sender === 'admin') {
            store.messages[msgIndex] = { ...msg, hasUnreadReply: true }; // Unread for resident
        } else {
            store.messages[msgIndex] = { ...msg, read: false }; // Unread for admin (mark thread as unread)
        }

        saveStore();
    }
};

// Helper to check if a date is within the last 7 days
const isWithinLastWeek = (dateString, referenceDate = new Date()) => {
    const postDate = new Date(dateString);
    const oneWeekAgo = new Date(referenceDate);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return postDate >= oneWeekAgo;
};

// Helper to check if a date is within retention period (3 months)
const isWithinRetentionPeriod = (dateString, referenceDate = new Date()) => {
    const postDate = new Date(dateString);
    const threeMonthsAgo = new Date(referenceDate);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return postDate >= threeMonthsAgo;
};

// Helper to check if a user is in the target block
export const isTargetUser = (post, user) => {
    if (!post.targetBlocks || post.targetBlocks.length === 0) return true;
    if (!user) return true; // Public view
    return post.targetBlocks.includes(user.block);
};

export const getAllPosts = () => {
    const allPosts = [];
    Object.keys(store.posts).forEach(category => {
        store.posts[category].forEach(post => {
            if (isWithinRetentionPeriod(post.date)) {
                allPosts.push({
                    ...post,
                    category: category
                });
            }
        });
    });
    // Sort by date descending (newest first)
    return allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const getRecentUpdates = () => {
    return getAllPosts().filter(post => isWithinLastWeek(post.date));
};

export const getUnreadCount = (category, userId) => {
    const posts = store.posts[category] || [];
    return posts.filter(post =>
        isWithinRetentionPeriod(post.date) &&
        (!post.readBy || !post.readBy.includes(userId))
    ).length;
};

export const getUnreadInquiryCount = () => {
    return store.messages.filter(m => !m.read).length;
};

export const getUnreadReplyCount = (userId) => {
    return store.messages.filter(m => m.senderId === userId && m.hasUnreadReply).length;
};

export const markAllRepliesAsRead = (userId) => {
    store.messages.filter(m => m.senderId === userId && m.hasUnreadReply).forEach(m => {
        m.hasUnreadReply = false;
    });
    saveStore();
};

export const markAllMessagesAsRead = () => {
    store.messages.filter(m => !m.read).forEach(m => {
        m.read = true;
    });
    saveStore();
};

export const deleteMessage = (id) => {
    store.messages = store.messages.filter(m => m.id !== id);
    saveStore();
};
