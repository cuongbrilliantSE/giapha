import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FamilyTree from '../components/FamilyTree';
import SearchFilter from '../components/SearchFilter';
import MemberDetail from '../components/MemberDetail';

const TreePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      <SearchFilter />
      <FamilyTree />
      <MemberDetail />
    </div>
  );
};

export default TreePage;
