import React from 'react';
import ReactDOM from 'react-dom/client';
import AlertModal from './components/layout/AlertModal.jsx';

const BASE_URL = import.meta.env.VITE_APP_BACKEND_URL;


let loginModalRoot = null;

function showLoginRequiredModal() {
  
  if (loginModalRoot) return;

  const container = document.createElement('div');
  document.body.appendChild(container);

  loginModalRoot = ReactDOM.createRoot(container);

  const handleClose = () => {
    if (loginModalRoot) {
      loginModalRoot.unmount();
      loginModalRoot = null;
    }
    document.body.removeChild(container);

    
    window.location.href = '/';
  };

  
  loginModalRoot.render(
    React.createElement(AlertModal, {
      isOpen: true,
      message: '로그인이 필요합니다.',
      onClose: handleClose,
      showCancel: false,
    })
  );
}

/**
 * 401 자동 재발급 로직이 포함된 커스텀 fetch 함수
 * @param {string} url - BASE_URL을 제외한 API 경로 (예: '/user/profile')
 * @param {object} options - fetch에 전달할 옵션 (method, body 등)
 * @returns {Promise<Response>} - fetch의 원본 Response 객체
 */
async function apiFetch(url, options = {}) {
  
  const accessToken = localStorage.getItem('accessToken');

  
  const defaultHeaders = {};

  if (accessToken) {
    defaultHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  
  
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  
  const mergedOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  
  

  
  let response = await fetch(`${BASE_URL}${url}`, mergedOptions);

  
  if (response.status === 401 && !options._retry) {
    console.log('🔄 Access token 만료. 재발급 시도...');

    
    options._retry = true;

    try {
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');

      const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!refreshResponse.ok) {
        
        throw new Error('Failed to refresh token');
      }

      const refreshData = await refreshResponse.json();
      const {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      } = refreshData.data;

      
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      console.log('✅ 토큰 재발급 성공');

      
      
      mergedOptions.headers['Authorization'] = `Bearer ${newAccessToken}`;

      console.log('🔄 원래 요청 재시도...');
      response = await fetch(`${BASE_URL}${url}`, mergedOptions);
    } catch (refreshError) {
      console.error('❌ 토큰 재발급 실패. 강제 로그아웃.', refreshError);
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.dispatchEvent(new Event('force-logout')); 

      
      showLoginRequiredModal();

      
      return response;
    }
  }

  
  return response;
}


export default apiFetch;
