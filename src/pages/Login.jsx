import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ShieldCheck, ArrowRight, User, Mail } from 'lucide-react';
import { cn } from '../lib/utils';
import { TRANSLATIONS } from '../lib/translations';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [role, setRole] = useState('resident'); // 'resident' or 'admin'
  const [password, setPassword] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginAdmin, loginResident } = useAuth();

  // Always use Japanese
  const t = TRANSLATIONS['ja'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (role === 'admin') {
        await loginAdmin(password);
      } else {
        await loginResident(selectedUserId, password);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('ログインに失敗しました。IDまたはパスワードを確認してください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4 notranslate" translate="no">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-none border border-gray-200 overflow-hidden">
        <div className="bg-primary px-8 pb-10 pt-12 text-center">
          <h1 className="text-h1 text-white mb-2 tracking-wide">{t.title}</h1>
          <p className="text-white/80 text-body">{t.subtitle}</p>
        </div>

        <div className="p-8">
          {/* Role Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-lg mb-8">
            <button
              type="button"
              onClick={() => setRole('resident')}
              className={cn(
                "flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all duration-200",
                role === 'resident'
                  ? "bg-white text-accent shadow-sm ring-1 ring-accent"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Users size={16} className="mr-2" />
              {t.resident}
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={cn(
                "flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all duration-200",
                role === 'admin'
                  ? "bg-white text-accent shadow-sm ring-1 ring-accent"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <ShieldCheck size={16} className="mr-2" />
              {t.admin}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {role === 'admin' && (
              <div className="space-y-3">
                <div className="space-y-3">
                  <label className="text-body font-bold text-text">{t.adminPasswordLabel}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-4 rounded-lg border-2 border-gray-300 focus:border-primary focus:ring-0 outline-none text-body transition-all"
                    placeholder={t.passwordPlaceholder}
                    required
                  />
                </div>
              </div>
            )}

            {role === 'resident' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-body font-bold text-text">{t.idLabel}</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value.toUpperCase())}
                      className="w-full px-4 py-4 pl-12 rounded-lg border-2 border-gray-300 focus:border-primary focus:ring-0 outline-none text-body transition-all upppercase placeholder-gray-400"
                      placeholder={t.idPlaceholder}
                      pattern="^[A-Za-z][0-9]{3}$"
                      title="英字1文字と数字3桁を入力してください (例: A001)"
                      required
                    />
                    <User size={24} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">{t.idNote}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-body font-bold text-text">{t.passwordLabel}</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-4 pl-12 rounded-lg border-2 border-gray-300 focus:border-primary focus:ring-0 outline-none text-body transition-all placeholder-gray-400"
                      placeholder={t.passwordPlaceholder}
                      pattern="[0-9]{4}"
                      maxLength={4}
                      title="数字4桁を入力してください"
                      required
                    />
                    <ShieldCheck size={24} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                  <p className="text-sm text-primary font-medium">※初回ログイン時に設定したパスワードを入力してください（未設定の場合はここで設定されます）</p>
                </div>
              </div>
            )}

            {error && (
              <div className="text-red-500 text-body font-bold text-center bg-red-50 p-3 rounded border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-lg bg-primary text-white text-menu font-bold shadow-none hover:bg-primary-dark transition-all flex items-center justify-center border-2 border-transparent disabled:opacity-50"
            >
              {loading ? 'Logging in...' : (
                <>
                  {t.loginButton}
                  <ArrowRight size={24} className="ml-3" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
