import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ReturnToSearch.css'; 

function ReturnToSearchButton() {
  const navigate = useNavigate();

  return (
    <div className="return-to-search-container">
      <button
        className="return-to-search-btn"
        onClick={() => navigate('/homepage')} 
      >
        검색으로 돌아가기
      </button>
    </div>
  );
}

export default ReturnToSearchButton;