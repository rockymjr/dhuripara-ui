import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMemberAuth } from '../../context/MemberAuthContext';
import { LogIn, Smartphone, Lock, AlertCircle, ChevronDown } from 'lucide-react';
import { trackAuth, trackError } from '../../utils/analytics';

const UnifiedLogin = () => {
  const [loginType, setLoginType] = useState('member'); // 'member' or 'admin'
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: adminLogin } = useAuth();
  const { login: memberLogin } = useMemberAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (loginType === 'member') {
        const result = await memberLogin(phone, pin);
        if (result.success) {
          trackAuth('Member Login Success', 'Phone/PIN');
          navigate('/member/dashboard');
        } else {
          trackAuth('Member Login Failed', 'Phone/PIN');
          trackError('Login Failed', result.error);
          setError(result.error || 'Invalid credentials');
        }
      } else {
        // Admin must log in using password
        const result = await adminLogin(phone, null, password);
        if (result.success) {
          trackAuth('Admin Login Success', 'Phone/Password');
          navigate('/admin/dashboard');
        } else {
          trackAuth('Admin Login Failed', 'Phone/Password');
          trackError('Login Failed', result.error);
          setError(result.error || 'Invalid credentials');
        }
      }
    } catch (err) {
       trackError('Login Exception', err.message);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = loginType === 'member' ? (phone.length === 10 && pin.length === 4) : (phone.length === 10 && password.length > 0);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 ${loginType === 'member' ? 'bg-blue-100' : 'bg-green-100'
            } rounded-full mb-4`}>
            {loginType === 'member' ? (
              <Smartphone className={loginType === 'member' ? 'text-blue-600' : 'text-green-600'} size={32} />
            ) : (
              <LogIn className={loginType === 'member' ? 'text-blue-600' : 'text-green-600'} size={32} />
            )}
          </div>
          <h2 className="text-3xl font-bold text-gray-800">
            {loginType === 'member' ? 'Member Login' : 'Admin Login'}
          </h2>
          <p className="text-gray-600 mt-2">
            {loginType === 'member' ? 'Access your account' : 'Access the management dashboard'}
          </p>
        </div>

        {/* Login Type Selector */}
        <div className="mb-6">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-gray-400 transition"
            >
              <span className="text-gray-700 font-medium">
                {loginType === 'member' ? 'Member' : 'Admin'}
              </span>
              <ChevronDown size={20} className={`text-gray-400 transition ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                <button
                  type="button"
                  onClick={() => {
                    setLoginType('member');
                    setShowDropdown(false);
                    setError('');
                    setPhone('');
                    setPin('');
                    setPassword('');
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 text-gray-700 border-b border-gray-200 flex items-center space-x-2"
                >
                  <Smartphone size={18} className="text-blue-600" />
                  <span>Member</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginType('admin');
                    setShowDropdown(false);
                    setError('');
                    setPhone('');
                    setPin('');
                    setPassword('');
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-green-50 text-gray-700 flex items-center space-x-2"
                >
                  <LogIn size={18} className="text-green-600" />
                  <span>Admin</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
            <AlertCircle size={20} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {loginType === 'member' ? (
            <>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  maxLength="10"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="9876543210"
                  required
                />
              </div>

              <div>
                <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
                  4-Digit PIN
                </label>
                <input
                  type="password"
                  id="pin"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  maxLength="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••"
                  required
                />
              </div>
            </>
          ) : (
            <>
              <>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    maxLength="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="9876543210"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </>
            </>
          )}

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className={`w-full ${loginType === 'member' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
              } text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Logging in...</span>
              </>
            ) : (
              <>
                {loginType === 'member' ? <Lock size={20} /> : <LogIn size={20} />}
                <span>Login</span>
              </>
            )}
          </button>
        </form>

        {loginType === 'member' && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Contact admin if you forgot your PIN
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedLogin;
