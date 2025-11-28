import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";


import ReviewCard from "../../components/review/ReviewCard";
import '../../components/review/ReviewCard.css';
import "./PhotoReviewDetailPage.css";
import arrow from "../../assets/ReviewPage/arrow-left.svg";


import apiFetch from "../../api.js";


const MOCK_PHOTO_DETAIL = {
  
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



export default function PhotoReviewDetailPage() {
  const navigate = useNavigate();
  const { toiletId, photoId } = useParams();
  
  
  
  const BACKEND_ON = true;
  
  const [photoData, setPhotoData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  
  useEffect(() => {

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      
      if (!BACKEND_ON) {
        
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

      
      
      

      try {
        
        const response = await apiFetch(`/toilet/${toiletId}/photos/${photoId}`, {
          method: "GET",
          
        });

        
        if (response.status === 403) {
          
          alert("다른 성별의 화장실 포토 리뷰는 볼 수 없습니다.");
          navigate(-1); 
          return; 
        }

        
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

  
  if (isLoading || !photoData) {
    return (
      <div className="photo-review-detail-page">
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

  
  const { photoUrl, review } = photoData;

  
  if (!review) {
    return (
      <div className="photo-review-detail-page">
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

  

  return (
    <div className="photo-review-detail-page">
      <div className="prdp-header">
        <button className="prdp-back-button" onClick={() => navigate(-1)}>
          <img src={arrow} alt="뒤로가기" />
        </button>
    
      </div>
      <div className="prdp-photo-list">
        <img
          src={photoUrl}
          alt={`포토리뷰 ${review.reviewId}`}
          className="prdp-photo-item"
        />
      </div>

      <div className="prdp-content-container">
        <ReviewCard
          reviews={[review]}
          toiletId={toiletId}
          
        />
      </div>
    </div>
  );
}