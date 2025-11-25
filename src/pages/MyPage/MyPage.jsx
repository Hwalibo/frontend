import "./MyPage.css"
import crown from "../../assets/MyPage/crown.svg"
import rename from "../../assets/MyPage/rename.svg"
import star_yell from "../../assets/star/star-yell.svg"
import star_grey from "../../assets/star/star-grey.svg"
import paper from "../../assets/MyPage/paper.svg"
import ad from "../../assets/MyPage/ad_my.svg"
import { useNavigate } from "react-router-dom";
import TopHeader from '../../components/layout/TopHeader.jsx'
import { useEffect, useState } from "react"
import Popup from "../../components/layout/AlertModal.jsx"
import apiFetch from '../../api.js';
import ScrollToTop from "../../components/layout/ScrollToTop.jsx"

export default function MyPage() {
  const nav = useNavigate();
  const API_URL = import.meta.env.VITE_APP_BACKEND_URL;
  const BACKEND_ON = true;

  const [userInfo, setUserInfo] = useState(null);
  const [myReviews, setMyReviews] = useState(null);

  // 🔹 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalAction, setModalAction] = useState(null); // 확인 시 실행할 함수 (있으면 confirm 모드)

  const openModal = (message, action = null) => {
    setModalMessage(message);
    setModalAction(() => action); // null이면 그냥 알림 모달
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    if (modalAction) {
      modalAction();
    }
    setIsModalOpen(false);
    setModalAction(null);
    setModalMessage("");
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setModalAction(null);
    setModalMessage("");
  };

  // ✅ Mock Data
  const mockUserInfo = {
    name: "김도영",
    profile: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ20mlA7nl2LGw9OZ3osAMsbKTZ30IvyijtXw&s",
    rate: 15,
    numReview: 3
  };

  const mockMyReviews = [
    {
      id: 101,
      name: "홍대",
      gender: "FEMALE",
      line: 2,
      desc: "깔끔하고 휴지가 넉넉했어요.",
      star: 4,
      photo: [
        { id: 1, url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ20mlA7nl2LGw9OZ3osAMsbKTZ30IvyijtXw&s" },
        { id: 2, url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ20mlA7nl2LGw9OZ3osAMsbKTZ30IvyijtXw&s" }
      ],
      tag: ["TOILET_CLEAN", "BRIGHT_LIGHTING"],
      createdAt: "2025-09-30T10:00:00",
      updatedAt: "2025-09-30T11:00:00"
    },
    {
      id: 99,
      name: "신촌(지하)",
      gender: "MALE",
      line: 2,
      desc: "조금 좁지만 관리가 잘 되어 있습니다.",
      star: 5,
      photo: [],
      tag: ["GOOD_VENTILATION"],
      createdAt: "2025-09-28T09:00:00",
      updatedAt: "2025-09-28T09:00:00"
    }
  ];

  // 1. 내 프로필 조회
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!BACKEND_ON) {
          setUserInfo(mockUserInfo);
          return;
        }

        const response = await apiFetch(`/user/profile`, {
          method: "GET"
        });

        if (!response.ok) throw new Error("서버 응답 오류");

        const result = await response.json();
        setUserInfo(result.data);
        console.log("유저 정보", result.data);
      } catch (e) {
        console.error("프로필 조회 실패:", e);
        setUserInfo(mockUserInfo);
      }
    };

    fetchData();
  }, [API_URL, BACKEND_ON]);

  // 2. 내 리뷰 조회
  // 2. 내 리뷰 조회
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!BACKEND_ON) {
          setMyReviews(mockMyReviews);  // mock은 이미 배열
          return;
        }

        const accessToken = localStorage.getItem("accessToken");
        console.log("accessToken:", accessToken);

        if (!accessToken) {
          console.error("로그인 토큰이 없습니다.");
          return;
        }

        const response = await apiFetch(`/user/review/list`, {
          method: "GET"
        });

        const text = await response.text();
        console.log("리뷰 조회 응답 status:", response.status, "body:", text);

        if (!response.ok) {
          throw new Error(`서버 응답 오류 (${response.status})`);
        }

        const result = JSON.parse(text);

        // 🔥 여기서 reviews 배열만 꺼내서 넣기
        const reviews = Array.isArray(result.data?.reviews)
          ? result.data.reviews
          : [];

        setMyReviews(reviews);
      } catch (e) {
        console.error("리뷰 조회 실패:", e);
        setMyReviews(mockMyReviews);
      }
    };

    fetchData();
  }, [API_URL, BACKEND_ON]);

  const tagMap = {
    TOILET_CLEAN: "변기 상태가 청결해요",
    SINK_CLEAN: "세면대가 청결해요",
    GOOD_VENTILATION: "환기가 잘 돼요",
    ENOUGH_HANDSOAP: "손 세정제가 충분해요",
    BRIGHT_LIGHTING: "조명 밝아요",
    TRASH_OVERFLOW: "쓰레기가 넘쳐요",
    DIRTY_FLOOR: "바닥이 더러워요",
    DIRTY_MIRROR: "거울이 지저분해요",
    NO_TOILET_PAPER: "휴지가 없어요",
    BAD_ODOR: "악취가 심해요",
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  const renderStars = (star) => (
    <div className="star-container">
      {[...Array(5)].map((_, i) => (
        <img key={i} src={i < star ? star_yell : star_grey} alt="star" className="star-icon" width="17px" />
      ))}
    </div>
  );

  const performDeleteReview = async (reviewId) => {
    if (!BACKEND_ON) {
      setMyReviews((prev) => prev.filter((r) => r.id !== reviewId));
      openModal("mock 모드: 리뷰가 삭제된 것처럼만 처리되었습니다.");
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      openModal("로그인 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    const url = `/user/review/${reviewId}`;
    const options = {
      method: "DELETE",
    };

    // 🔍 요청 정보 로그
    console.log("[리뷰 삭제 요청]", {
      url,
      ...options,
    });

    try {
      const response = await apiFetch(url, options);

      // 🔍 응답 로그 (raw text까지)
      const text = await response.text();
      console.log("[리뷰 삭제 응답 raw]", response.status, text);

      if (!response.ok) {
        throw new Error(`리뷰 삭제 중 오류가 발생했습니다. (status: ${response.status})`);
      }

      let result = {};
      try {
        result = JSON.parse(text);
        console.log("[리뷰 삭제 응답 JSON]", result);
      } catch (err) {
        console.warn("리뷰 삭제 응답 JSON 파싱 실패:", err);
      }

      setMyReviews((prev) => prev.filter((r) => r.id !== reviewId));
      openModal("리뷰가 성공적으로 삭제되었습니다.");
    } catch (e) {
      console.error("리뷰 삭제 실패:", e);
      openModal(e.message || "리뷰 삭제 중 오류가 발생했습니다.");
    }
  };

  // 🔹 회원 탈퇴 실제 요청
  const performWithdraw = async () => {
    if (!BACKEND_ON) {
      openModal("mock 모드: 실제로 회원 탈퇴는 되지 않습니다.");
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      openModal("로그인 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    const url = `/auth/withdraw`;
    const options = {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`, // 헤더는 Authorization Bearer {AccessToken}
      },
    };

    console.log("[회원 탈퇴 요청]", {
      url,
      ...options,
    });

    try {
      const response = await apiFetch(url, options);
      const text = await response.text();
      console.log("[회원 탈퇴 응답 raw]", response.status, text);

      if (!response.ok) {
        throw new Error(`회원 탈퇴 중 오류가 발생했습니다. (status: ${response.status})`);
      }

      let result = {};
      try {
        result = JSON.parse(text);
        console.log("[회원 탈퇴 응답 JSON]", result);
      } catch (err) {
        console.warn("회원 탈퇴 응답 JSON 파싱 실패:", err);
      }

      // 토큰 제거 후 메인 페이지로 이동
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      openModal("회원 탈퇴가 완료되었습니다.", () => {
        nav("/");
      });
    } catch (e) {
      console.error("회원 탈퇴 실패:", e);
      openModal(e.message || "회원 탈퇴 중 오류가 발생했습니다.");
    }
  };

  // 🔹 삭제 버튼 클릭 시 → 확인/취소 모달
  const handleDeleteReview = (reviewId) => {
    openModal("정말 이 리뷰를 삭제하시겠습니까?", () => performDeleteReview(reviewId));
  };

  // 🔹 회원탈퇴 버튼 클릭 시 → 확인/취소 모달
  const handleWithdrawClick = () => {
    openModal(
      "정말 회원 탈퇴를 진행하시겠습니까? ",
      performWithdraw
    );
  };

  if (!userInfo || !myReviews) {
    return <div>로딩 중...</div>;
  }

  const { name, profile, rate, numReview } = userInfo;

  return (
    <div className="my-page">
      <ScrollToTop />
      <TopHeader />
      <div className="profileContainer">
        <div className="profile-top">
          <img className="my-profile" src={profile} alt="profile" />
          <div className="sub-con">
            <div className="my-rate">
              <img src={crown} alt="crown" />
              <p>상위 {rate}%</p>
            </div>
            <div className="my-name">
              <p>{name}</p>
              <img className='name-icon' src={rename} alt="rename" onClick={() => nav("/ChangeName")} />
            </div>
          </div>
        </div>
       
        <div className="profile-bottom">
          {name}님, 총 <span>{numReview}</span>개의 리뷰를 작성하셨네요!
          
        </div>
      
     
        
      </div>

      <div className="line"></div>

      <div className="my-review">
         <div className="profile-subcon">
        <div className="review-header">내가 쓴 리뷰</div>
          <div className="del" onClick={handleWithdrawClick}>회원탈퇴</div>
          </div>
        <img src={ad} alt="" width="100%" />

        <div className="reviews">
          {myReviews.map((review) => {
            const isUpdated = review.createdAt !== review.updatedAt;
            const displayDate = isUpdated
              ? `${formatDate(review.updatedAt)} (수정)`
              : formatDate(review.createdAt);

            return (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <h3><img src={paper} alt="" />{review.name}</h3>
                  <p>
                    {review.line}호선&nbsp;·{" "}
                    {review.gender === "FEMALE" ? (
                      <span className="fe">&nbsp;여자</span>
                    ) : (
                      <span className="ma">&nbsp;남자</span>
                    )}
                  </p>
                  <p className="review-date">{displayDate}</p>
                </div>

                <div className="stars">{renderStars(review.star)}</div>
                <div className="review-desc">{review.description}</div>

                {review.photo.length > 0 && (
                  <div className="review-photos">
                    {review.photo.map((photo) => (
                      <img key={photo.id} src={photo.url} alt={`review-photo-${photo.id}`} />
                    ))}
                  </div>
                )}

                <div className="review-tags">
                    {/* ✅ isDis 태그 추가 */}
                    {review.isDis && (
                      <span className="tag-dis">
                        장애인 화장실
                      </span>
                    )}



                  {review.tag.map((t, index) => (
                    <span key={index} className="tag">
                      {tagMap[t] || t}
                    </span>
                  ))}
                </div>

                <div className="options">
                  <div className="edit" onClick={() => nav("/editreview", { state: { review } })}>
                    수정하기
                  </div>
                  <div className="del" onClick={() => handleDeleteReview(review.id)}>
                    삭제하기
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🔹 모달: 삭제 확인 시엔 취소 버튼도 보이고, 일반 알림 땐 확인만 */}
      <Popup
        isOpen={isModalOpen}
        message={modalMessage}
        onClose={handleConfirm}
        showCancel={!!modalAction}
        onCancel={handleCancel}
      />
    </div>
  );
}
