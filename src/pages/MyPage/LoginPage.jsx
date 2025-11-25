// src/pages/MyPage/LoginPage.jsx

import './LoginPage.css';
import TopHeader from '../../components/layout/TopHeader';
import AlertModal from '../../components/layout/AlertModal';
import { useState, useEffect } from 'react'; // ✅ useEffect 추가
import { useNavigate } from 'react-router-dom'; // ✅ useNavigate 추가

export default function LoginPage() {
    const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;
    const NAVER_LOGIN_URL = `${BACKEND_URL}/oauth2/authorization/naver`;

    const nav = useNavigate(); // ✅ 페이지 이동을 위한 훅

    // ✅ 컴포넌트 마운트 시 토큰 확인 로직
    useEffect(() => {
        // 1. 로컬 스토리지에서 리프레쉬 토큰(또는 액세스 토큰)을 가져옵니다.
        // (프로젝트 저장 방식에 따라 키 이름이 'refreshToken'이 아닐 수 있으니 확인 필요)
        const refreshToken = localStorage.getItem('refreshToken');
        const accessToken = localStorage.getItem('accessToken');

        // 2. 토큰이 존재한다면 이미 로그인된 상태로 간주하고 이동
        if (refreshToken || accessToken) {
            // replace: true 옵션을 주면 뒤로가기 했을 때 다시 로그인 페이지로 오지 않습니다.
            nav('/homepage', { replace: true });
        }
    }, [nav]);

    // ✅ 개인정보 보호책임자 팝업 상태
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ✅ 팝업에 표시할 내용
    const privacyMessage = `
개인정보 보호책임자 연락처
개인정보 관련 문의는 아래로 연락하시기 바랍니다.

이름: 조효원
이메일: hwalibo@gmail.com
서비스명: 화리보

리뷰에 업로드 된 이미지 및 텍스트는 인공지능 학습에 사용될 수 있습니다
    `;

    return (
        <div className="login-con">
            <TopHeader />
            <div className="container">
                <div className="login-con">
                    <a href={NAVER_LOGIN_URL}>
                        <button className="to-login">
                            네이버 아이디로 로그인하기
                        </button>
                    </a>

                    {/* ✅ 클릭 시 팝업 열기 */}
                    <div
                        className="contact"
                        onClick={() => setIsModalOpen(true)}
                    >
                        개인정보 보호책임자 정보
                    </div>
                    {/* <div className="other" onClick={()=>{nav("/signup")}}>회원가입하기</div> */}
                </div>
            </div>

            {/* ✅ 개인정보 보호책임자 정보 팝업 */}
            <AlertModal
                isOpen={isModalOpen}
                message={privacyMessage}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}