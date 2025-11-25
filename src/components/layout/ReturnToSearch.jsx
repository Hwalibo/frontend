import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ReturnToSearch.css'; // 2. 이 컴포넌트 전용 CSS를 임포트

/**
 * '검색으로 돌아가기' 버튼을 표시하는 공용 컴포넌트입니다.
 * 클릭 시 메인 홈('/') 페이지로 이동합니다.
 */
function ReturnToSearchButton() {
  const navigate = useNavigate();

  return (
    <div className="return-to-search-container">
      <button
        className="return-to-search-btn"
        onClick={() => navigate('/homepage')} // 클릭 시 홈('/')으로 이동
      >
        검색으로 돌아가기
      </button>
    </div>
  );
}

export default ReturnToSearchButton;