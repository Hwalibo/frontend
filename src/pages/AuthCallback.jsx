

import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  
  const [searchParams] = useSearchParams();
  
  
  const navigate = useNavigate();

  useEffect(() => {
    
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    
    if (accessToken && refreshToken) {
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      
      console.log('로그인 성공: AccessToken과 RefreshToken을 로컬 스토리지에 저장했습니다.');

      
      
      navigate('/homepage', { replace: true });

    } else {
      
      console.error('인증 실패: URL 쿼리 파라미터에 토큰이 없습니다.');
      alert('로그인에 실패하였습니다. 로그인 페이지로 돌아갑니다.');
      navigate('/', { replace: true });
    }
    
    
  }, [searchParams, navigate]);

  
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h2>로그인 처리 중입니다...</h2>
      <p>잠시만 기다려주세요.</p>
    </div>
  );
}