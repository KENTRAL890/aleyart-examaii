import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { School, Eye, EyeOff, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid email or password');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-4">
            <School className="text-blue-600" size={48} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ALEYART EXAMAI PRO</h1>
          <p className="text-blue-200 text-lg">ALEYART ACADEMY</p>
          <p className="text-yellow-400 font-semibold mt-1">SEEKING WISDOM</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Welcome Back</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-3">Demo Credentials:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 p-2 rounded">
                <p className="font-semibold text-gray-700">Administrator</p>
                <p className="text-gray-500">admin@aleyart.edu.gh</p>
                <p className="text-gray-500">admin123</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="font-semibold text-gray-700">Headteacher</p>
                <p className="text-gray-500">headteacher@aleyart.edu.gh</p>
                <p className="text-gray-500">head123</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="font-semibold text-gray-700">Exam Officer</p>
                <p className="text-gray-500">exams@aleyart.edu.gh</p>
                <p className="text-gray-500">exams123</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="font-semibold text-gray-700">Teacher</p>
                <p className="text-gray-500">teacher@aleyart.edu.gh</p>
                <p className="text-gray-500">teacher123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-200 text-sm mt-6">
          AI-Powered Examination Management System
          <br />
          Compliant with GES, NaCCA, SBC & CCP Standards
        </p>
      </div>
    </div>
  );
};

export default Login;
