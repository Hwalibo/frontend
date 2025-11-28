import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TopHeader from "../../components/layout/TopHeader";
import "./PhotoReviewsPage.css";
import ReturnToSearch from "../../components/layout/ReturnToSearch";
import adrec from "../../assets/ReviewPage/adverrec.svg";
import apiFetch from "../../api.js";


const BACKEND_ON = true;
const PAGE_SIZE = 24;


const MOCK_PHOTO_LIST = {
  
  "success": true, "code": 200, "message": "포토 리뷰 목록 조회 성공",
  "data": {
    "content": [
      
      { "photoUrl": "https://placehold.co/300x300/E13A6E/white?text=Photo+1", "reviewId": 105, "toiletId": 1, "photoId": 1 },
      { "photoUrl": "https://placehold.co/300x300/0D6EFD/white?text=Photo+2", "reviewId": 109, "toiletId": 1, "photoId": 2 },
      { "photoUrl": "https://placehold.co/300x300/198754/white?text=Photo+3", "reviewId": 113, "toiletId": 1, "photoId": 3 },
      { "photoUrl": "https://placehold.co/300x300/fd7e14/white?text=Photo+4", "reviewId": 113, "toiletId": 1, "photoId": 4 },
      { "photoUrl": "https://placehold.co/300x300/6f42c1/white?text=Photo+5", "reviewId": 115, "toiletId": 1, "photoId": 5 },
      { "photoUrl": "https://placehold.co/300x300/dc3545/white?text=Photo+6", "reviewId": 105, "toiletId": 1, "photoId": 6 },
    ],
    "hasNext": true, 
    "nextCursor": "mock-cursor-abc-123" 
  }
};



export default function PhotoReviewsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  
  const { toiletId } = useParams();
  const { toilet } = location.state || {}; 

  
  const [photos, setPhotos] = useState([]); 
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState(null);

  
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNext, setHasNext] = useState(true);

  
  const fetchPhotos = async (isInitialLoad = false) => {
    
    if (isLoading || (!isInitialLoad && !hasNext)) return;

    setIsLoading(true);
    setError(null);

    
    if (!BACKEND_ON) {
      console.log(
        `[Mock] Fetching photos... initial: ${isInitialLoad}, cursor: ${nextCursor}`
      );
      
      setTimeout(() => {
        
        setPhotos((prev) =>
          isInitialLoad
            ? MOCK_PHOTO_LIST.data.content
            : [...prev, ...MOCK_PHOTO_LIST.data.content]
        );
        setNextCursor(MOCK_PHOTO_LIST.data.nextCursor);
        setHasNext(MOCK_PHOTO_LIST.data.hasNext);
        setIsLoading(false);
      }, 500);
      return;
    }

    
    
    

    
    
    let urlPath = `/toilet/${toiletId}/photos?size=${PAGE_SIZE}`;
    if (!isInitialLoad && nextCursor) {
      
      urlPath += `&nextCursor=${encodeURIComponent(nextCursor)}`;
    }

    try {
      
      const response = await apiFetch(urlPath, {
        method: "GET",
        
      });

      
      if (response.status === 403) {
        
        
        const errResult = await response.json(); 
        const serverMessage = errResult.message || "접근 권한이 없습니다.";

        
        alert(serverMessage); 
        
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
        setPhotos((prev) =>
          isInitialLoad
            ? result.data.content
            : [...prev, ...result.data.content]
        );
        setNextCursor(result.data.nextCursor);
        setHasNext(result.data.hasNext);
      } else {
        throw new Error(result.message || "데이터 형식이 올바르지 않습니다.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  
  useEffect(() => {
    if (!toilet) {
      alert("잘못된 접근입니다. 화장실 정보를 불러올 수 없습니다.");
      navigate(-1);
      return;
    }

    
    
    
    fetchPhotos(true);

    
  }, [toilet, toiletId, navigate]);


  
  if (!toilet) {
    return (
      <div className="photo-reviews-page">
        <TopHeader />
        <ReturnToSearch />
        <p style={{ padding: "20px", textAlign: "center" }}>
          정보를 불러오는 중...
        </p>
      </div>
    );
  }

  return (
    <div className="photo-reviews-page">
      <TopHeader />
      <ReturnToSearch />
      <div className="photo-reviews-container">
        <div className="photo-reviews-header">
          <div className="photo-reviews-header-info">
            <h3>{toilet.name}</h3>
            <p>
              {toilet.line}호선
              <span className="er-review-info-divider">·</span>
              {toilet.gender === "FEMALE" || toilet.gender === "F" ? (
                <span className="fe" style={{ color: "#E13A6E" }}>
                  여자
                </span>
              ) : (
                <span className="ma" style={{ color: "#0D6EFD" }}>
                  남자
                </span>
              )}
            </p>
          </div>
          <span className="photo-review-count">포토리뷰 ({photos.length})</span>
        </div>
        <div className="prdp-ad-container">
          <img src={adrec} alt="광고" className="prdp-ad-banner" />
        </div>

        <div className="photo-grid-list">
          {photos.map((photo, index) => (
            <button
              
              
              key={`${photo.photoId}-${index}`}
              className="photo-grid-item"
              onClick={() =>
                
                
                navigate(`/toilet/${photo.toiletId}/photo/${photo.photoId}`, {
                  state: {
                    
                    toilet: toilet, 
                  },
                })
              }
            >
              <img src={photo.photoUrl} alt="포토리뷰" />
            </button>
          ))}
        </div>

        <div className="pagination">
          {isLoading && <p>불러오는 중...</p>}

          {error && <p style={{ color: "red" }}>{error}</p>}

          {!isLoading && hasNext && (
            <button
              className="review-more-button" 
              onClick={() => fetchPhotos(false)} 
            >
              더보기
            </button>
          )}

          {!isLoading && !hasNext && photos.length > 0 && (
            <p
              style={{
                textAlign: "center",
                padding: "20px",
                color: "#888",
              }}
            >
              마지막 사진입니다.
            </p>
          )}

          {!isLoading && !hasNext && photos.length === 0 && (
            <p style={{ textAlign: "center", padding: "20px" }}>
              포토 리뷰가 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}