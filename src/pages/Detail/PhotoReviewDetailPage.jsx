import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

// 1. [신규] ReviewCard 컴포넌트 및 CSS 임포트
import ReviewCard from "../../components/review/ReviewCard";
import '../../components/review/ReviewCard.css';
import "./PhotoReviewDetailPage.css";
import arrow from "../../assets/ReviewPage/arrow-left.svg";

// 🚀 [수정 1] apiFetch를 import 합니다. (경로는 실제 위치에 맞게 조정하세요)
import apiFetch from "../../api.js";

// (Mock 데이터는 동일)
const MOCK_PHOTO_DETAIL = {
  // ... (MOCK_PHOTO_DETAIL 내용은 동일)
  "success": true, "code": 200, "message": "포토 리뷰 상세 조회 성공",
  "data": {
    "photoUrl": "https://placehold.co/600x400/E13A6E/white?text=Mock+Photo",
    "review": {
      "reviewId": 78, "userId": 15, "userName": "클린보이(Mock)", "star": 4.5,
      "desc": "여기 정말 깨끗해요! (Mock Data)",
      "tag": ["TOILET_CLEAN", "ENOUGH_HANDSOAP"],
      "createdAt": "2023-10-27T15:00:00Z",
      "updatedAt": "2023-10-27T15:00:00Z",
      "good": 3, "isDis": false
    }
  }
};

// --- 메인 컴포넌트 ---

export default function PhotoReviewDetailPage() {
  const navigate = useNavigate();
  const { toiletId, photoId } = useParams();
  
  // 🚀 [수정 2] apiFetch가 URL을 관리하므로 이 변수는 더 이상 필요하지 않습니다.
  // const API_URL = import.meta.env.VITE_APP_BACKEND_URL;
  const BACKEND_ON = true;
  
  const [photoData, setPhotoData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3. [수정] 데이터 API 호출 (useEffect)
  useEffect(() => {
    // 🚨 [버그 1 수정]
    // "로딩 중..." 멈춤 버그 해결을 위해 if (!toilet) 검사를 제거합니다.
    /*
    if (!toilet) {
      alert("잘못된 접근입니다. 화장실 정보가 없습니다.");
      navigate(-1);
      return;
    }
    */

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      // (1) Mock 모드
      if (!BACKEND_ON) {
        // (Mock 데이터도 'isLiked' 필드 추가)
        const mockReview = {
          ...MOCK_PHOTO_DETAIL.data,
          review: {
            ...MOCK_PHOTO_DETAIL.data.review,
            isLiked: false
          }
        };
        setTimeout(() => {
          setPhotoData(mockReview);
          setIsLoading(false);
        }, 500);
        return;
      }

      // (2) 실제 API 모드
      // 🚀 [수정 3] accessToken을 직접 가져오는 로직 (getItem, if문) 삭제
      // apiFetch가 토큰을 자동으로 처리합니다.

      try {
        // 🚀 [수정 4] fetch -> apiFetch, URL 경로만 전달, headers 객체 삭제
        const response = await apiFetch(`/toilet/${toiletId}/photos/${photoId}`, {
          method: "GET",
          // headers: 객체 불필요
        });

        // 🚀 [핵심 수정] 403(Forbidden) 에러 처리 (성별 제한)
        if (response.status === 403) {
          // 사용자에게 알림
          alert("다른 성별의 화장실 포토 리뷰는 볼 수 없습니다.");
          navigate(-1); // 뒤로가기
          return; // 함수 종료
        }

        // 401(Unauthorized) 처리
        if (response.status === 401) {
          alert("로그인이 필요한 서비스입니다.");
          navigate(-1);
          return;
        }

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "데이터를 불러오는 데 실패했습니다.");
        }

        if (result.success && result.data) {
          const reviewWithLike = {
            ...result.data,
            review: result.data.review ? {
              ...result.data.review,
              isLiked: result.data.review.isLiked || false
            } : null
          };
          setPhotoData(reviewWithLike);

        } else {
          throw new Error(result.message || "데이터 형식이 올바르지 않습니다.");
        }

      } catch (err) {
        console.error(err);
        
        // 🚀 [추가] apiFetch가 내부적으로 에러를 던졌을 때도 처리
        if (err.message.includes("403") || err.message.includes("권한") || err.message.includes("성별")) {
           alert("다른 성별의 화장실 포토 리뷰는 볼 수 없습니다.");
           navigate(-1);
        } else if (err.message.includes("401") || err.message.includes("로그인")) {
           alert("로그인이 필요합니다.");
           navigate(-1);
        } else {
           setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

  }, [toiletId, photoId, navigate, BACKEND_ON]);

  // 5. 로딩 및 에러 UI
  if (isLoading || !photoData) {
    return (
      <div className="photo-review-detail-page">
        
        {/* 🚨 [버그 2 수정] 로딩 중에도 헤더가 보이도록 추가 */}
        <div className="prdp-header">
          <button className="prdp-back-button" onClick={() => navigate(-1)}>
            <img src={arrow} alt="뒤로가기" />
          </button>
          
        </div>

        <p style={{ padding: "20px", textAlign: "center" }}>
          {isLoading ? "리뷰 정보를 불러오는 중..." : (error || "데이터 없음")}
        </p>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      </div>
    );
  }

  // 6. 렌더링을 위해 photoUrl과 review 객체 추출
  const { photoUrl, review } = photoData;

  // 7. [신규] API가 사진은 줬지만 리뷰가 없는 경우 (null) 방어
  if (!review) {
    return (
      <div className="photo-review-detail-page">
        
        {/* (이 코드는 헤더가 올바르게 들어가 있었습니다) */}
        <div className="prdp-header">
          <button className="prdp-back-button" onClick={() => navigate(-1)}>
            <img src={arrow} alt="뒤로가기" />
          </button>
      
        </div>

        <p style={{ padding: "20px", textAlign: "center" }}>
          사진에 연결된 리뷰 정보를 찾을 수 없습니다.
        </p>
      </div>
    );
  }

  // 8. [삭제] displayDate (ReviewCard가 처리)

  return (
    <div className="photo-review-detail-page">

      {/* 🚨 [버그 2 수정] 성공 시에도 헤더가 보이도록 추가 */}
      <div className="prdp-header">
        <button className="prdp-back-button" onClick={() => navigate(-1)}>
          <img src={arrow} alt="뒤로가기" />
        </button>
    
      </div>

      {/* 1. 사진 (기존과 동일) */}
      <div className="prdp-photo-list">
        <img
          src={photoUrl}
          alt={`포토리뷰 ${review.reviewId}`}
          className="prdp-photo-item"
        />
      </div>

      

      {/* 2. [수정] 리뷰 상세 내용을 ReviewCard 컴포넌트로 대체 */}
      <div className="prdp-content-container">
        <ReviewCard
          reviews={[review]}
          toiletId={toiletId}
          // showPhotos={false} // photoUrl이 ReviewCard prop에 없으므로 생략
        />
      </div>
    </div>
  );
}