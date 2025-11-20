// src/pages/MyPage/LoginPage.jsx

import './LoginPage.css';
import TopHeader from '../../components/layout/TopHeader';
import AlertModal from '../../components/layout/AlertModal'; // ✅ 모달 컴포넌트 추가
import { useState } from 'react'; // ✅ state 사용

export default function LoginPage() {
    const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL
    const NAVER_LOGIN_URL = `${BACKEND_URL}/oauth2/authorization/naver`;

    // ✅ 개인정보 보호책임자 팝업 상태
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ✅ 팝업에 표시할 내용
    const privacyMessage = `
개인정보 보호책임자 연락처
개인정보 관련 문의는 아래로 연락하시기 바랍니다.

이름: 조효원
이메일: hwalibo@gmail.com
서비스명: 화리보
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
                isOpen={isModalOpen}          // 모달 열림 여부
                message={privacyMessage}      // 위에서 만든 안내 문구
                onClose={() => setIsModalOpen(false)} // 확인 버튼 눌렀을 때 닫기
            />
        </div>
    );
}
