import { useState } from "react";
import "./ChangeName.css";
import TopHeader from "../../components/layout/TopHeader";
import { useNavigate } from "react-router-dom";
import Popup from "../../components/layout/AlertModal"; // ✅ 모달 컴포넌트 (대문자!)

export default function ChangeName() {
  const BACKEND_ON = true; // 실제 백엔드 쓸 때 true 로
  const API_URL = import.meta.env.VITE_APP_BACKEND_URL;

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalAction, setModalAction] = useState(null); // 닫을 때 실행할 추가 동작(옵션)

  const openModal = (message, action = null) => {
    setModalMessage(message);
    setModalAction(() => action);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (typeof modalAction === "function") {
      modalAction();
    }
    setModalAction(null);
    setModalMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      openModal("새 닉네임을 입력해주세요.");
      return;
    }

    if (!BACKEND_ON) {
      console.log("백엔드 비활성 상태입니다. BACKEND_ON 을 true 로 변경하세요.");
      return;
    }

    if (!API_URL) {
      openModal("백엔드 URL이 설정되지 않았습니다. VITE_APP_BACKEND_URL 환경 변수를 확인하세요.");
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      openModal("로그인 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/user/profile/name`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data?.message || "닉네임 변경 중 오류가 발생했습니다.";
        throw new Error(msg);
      }

      if (data.success) {
        // ✅ 성공: 팝업 띄우고, 닫을 때 /mypage 로 이동
        openModal("닉네임이 성공적으로 변경되었습니다!", () => navigate("/mypage"));
      } else {
        openModal(data.message || "닉네임 변경에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      openModal(err.message || "서버와 통신 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-name-page">
      <TopHeader />
      <div className="change-name-con">
        <div className="content">
          <div className="header">닉네임 변경</div>
          <form className="name-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="   새 닉네임을 입력해주세요."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? "변경 중..." : "확인"}
            </button>
          </form>
        </div>
      </div>

      {/* ✅ 닉네임 변경 관련 알림 모달 */}
      <Popup
        isOpen={isModalOpen}
        message={modalMessage}
        onClose={handleCloseModal}
        // 필요하다면 showCancel 같은 props도 추가 가능
      />
    </div>
  );
}
