import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FamilyTree from '../components/FamilyTree';
import SearchFilter from '../components/SearchFilter';
import MemberDetail from '../components/MemberDetail';
import RelationshipModal from '../components/RelationshipModal';

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
      <RelationshipModal />
    </div>
  );
};

export default TreePage;
