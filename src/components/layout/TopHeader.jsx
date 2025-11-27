import "./TopHeader.css"
import logo from "../../assets/logo.svg"
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react"; 
import AlertModal from "../../components/layout/AlertModal";
import apiFetch from '../../api.js'; 

export default function TopHeader() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalCloseAction, setModalCloseAction] = useState(null);

    // refreshToken 존재 여부로 로그인 상태 초기화
    useEffect(() => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, []); 

    //  인터셉터로부터 강제 로그아웃 이벤트 수신
    useEffect(() => {
        const handleForceLogout = () => {
            setIsLoggedIn(false);
            showModal("세션이 만료되었습니다. 다시 로그인해주세요.", () => navigate('/'));
        };

        window.addEventListener('force-logout', handleForceLogout);

        return () => {
            window.removeEventListener('force-logout', handleForceLogout);
        };
    }, [navigate]);

    const showModal = (message, action = null) => {
        setModalMessage(message);
        setModalCloseAction(() => action);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalMessage("");
        if (typeof modalCloseAction === 'function') {
            modalCloseAction();
        }
        setModalCloseAction(null);
    };

    // 로그아웃 핸들러
    const handleLogout = async () => {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
            showModal('이미 로그아웃 상태입니다.');
            return;
        }

        let messageToShow = '';

        try {
            const response = await apiFetch('/auth/logout', {
                method: 'POST'
            });
            
            if (!response.ok) {
                console.error('로그아웃 API 응답 오류', response.status);
            }
            
            messageToShow = '로그아웃되었습니다.';

        } catch (err) {
            console.error('로그아웃 API 통신 실패 (네트워크 오류):', err);
            messageToShow = '로그아웃 API 통신에 실패했습니다. 로컬 토큰을 강제로 삭제합니다.';
        
        } finally {
            //  1) 토큰 삭제
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');

            //  2) 헤더 상태 업데이트 → 로그아웃 버튼 숨김
            setIsLoggedIn(false);

            // 3) 안내 모달 (있어도 되고, 빼도 됨)
            showModal(messageToShow || '로그아웃되었습니다.');

            //  4) 바로 메인으로 이동 (모달에 의존 X)
            navigate('/');
        }
    };

    return (
        <>
            <div className="top-header-con">
                <div className="content">
                    <img src={logo} onClick={() => { navigate("/homepage") }} />
                    
                    {isLoggedIn && (
                        <div className="header-actions">
                            {/* 여기서는 오직 handleLogout만 호출 */}
                            <div className="log-out" onClick={handleLogout}>
                                로그아웃
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <AlertModal 
                // 🔧 MyPage에서 Popup이 isOpen을 쓰고 있으니 여기도 isOpen으로 맞추는 게 안전
                isOpen={isModalOpen}
                message={modalMessage}
                onClose={closeModal}
            />
        </>
    );
}
