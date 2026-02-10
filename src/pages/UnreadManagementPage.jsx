import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import UnreadManagement from '../components/admin/UnreadManagement';

const UnreadManagementPage = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">既読管理ダッシュボード</h1>
            </div>

            <UnreadManagement />
        </div>
    );
};

export default UnreadManagementPage;
