import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Props = {
  inline?: boolean;
};

const LogoutButton: React.FC<Props> = ({ inline }) => {
  const navigate = useNavigate();

  const onLogout = () => {
    try {
      sessionStorage.removeItem('isAuthenticated');
    } finally {
      navigate('/', { replace: true });
    }
  };

  if (inline) {
    return (
      <button
        onClick={onLogout}
        className="p-2 hover:bg-gray-100 rounded-md text-gray-700 flex items-center justify-center gap-2 border border-gray-200 bg-white"
        title="Đăng xuất"
      >
        <LogOut size={16} />
      </button>
    );
  }

  return (
    <button
      onClick={onLogout}
      className="absolute top-4 right-4 z-10 bg-white px-3 py-2 rounded-lg shadow-md border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
      title="Đăng xuất"
    >
      <LogOut size={16} />
      Đăng xuất
    </button>
  );
};

export default LogoutButton;
