import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CONFIG } from '../config';

const Home = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CONFIG.PASSWORD) {
      sessionStorage.setItem('isAuthenticated', 'true');
      navigate('/tree');
    } else {
      setError('Mật khẩu không đúng, vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-amber-200">
        <h1 className="text-3xl font-bold text-center text-amber-900 mb-2">Gia Phả Dòng Họ</h1>
        <p className="text-center text-amber-700 mb-8">Vui lòng nhập mật khẩu để truy cập</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              className="w-full px-4 py-3 rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          
          <button
            type="submit"
            className="w-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-md transform hover:-translate-y-0.5"
          >
            Truy Cập
          </button>
        </form>
        
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Phiên bản 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
