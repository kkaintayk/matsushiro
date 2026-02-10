import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { cn } from '../lib/utils';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);

            // Check if already installed
            const isInstalled = localStorage.getItem('pwa-installed') === 'true';

            if (isInstalled) return;

            // Always show for demo purposes, even if event doesn't fire immediately
            // In a real PWA, you might wait for the event, but for this request we force it.
            // setIsVisible(true); // handled by initial state or timeout
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Fallback: If event doesn't fire quickly (e.g. dev environment), show it anyway
        const timer = setTimeout(() => {
            const isInstalled = localStorage.getItem('pwa-installed') === 'true';
            if (!isInstalled) setIsVisible(true);
        }, 1000);

        // Optional: Detect if app was installed successfully
        window.addEventListener('appinstalled', () => {
            localStorage.setItem('pwa-installed', 'true');
            setIsVisible(false);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            clearTimeout(timer);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            // Fallback for demo/dev when event didn't fire
            alert('ブラウザのメニューから「アプリをインストール」または「ホーム画面に追加」を選択してください。\n(開発環境や一部ブラウザでは自動プロンプトが無効な場合があります)');
            return;
        }

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsVisible(false);

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
            localStorage.setItem('pwa-installed', 'true');
        } else {
            console.log('User dismissed the install prompt');
        }
    };

    const handleCloseClick = () => {
        setIsVisible(false);
        // Do NOT save dismissal timestamp so it shows again next time
    };

    if (!isVisible) return null;

    return (
        <div className={cn(
            "fixed bottom-6 right-6 z-50",
            "bg-white rounded-xl shadow-2xl border border-orange-100",
            "p-4 flex flex-col gap-3 max-w-[280px]",
            "animate-in slide-in-from-right duration-500"
        )}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className="bg-[#E64A19] p-2 rounded-lg flex-shrink-0">
                        <Download size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-sm">アプリを入手</h3>
                        <p className="text-xs text-gray-500 leading-tight mt-0.5">ホーム画面に追加</p>
                    </div>
                </div>
                <button
                    onClick={handleCloseClick}
                    className="text-gray-400 hover:text-gray-600 -mt-1 -mr-1 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="閉じる"
                >
                    <X size={16} />
                </button>
            </div>

            <button
                onClick={handleInstallClick}
                className="w-full bg-[#E64A19] hover:bg-[#D84315] text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors shadow-sm"
            >
                インストール
            </button>
        </div>
    );
};

export default InstallPrompt;
