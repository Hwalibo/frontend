import React, { useState, useEffect } from "react";
// 1. [수정] useLocation, useNavigate, useParams 모두 사용
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TopHeader from "../../components/layout/TopHeader";
import "./PhotoReviewsPage.css";
import ReturnToSearch from "../../components/layout/ReturnToSearch";
import adrec from "../../assets/ReviewPage/adverrec.svg";

// 🚀 [수정 1] apiFetch를 import 합니다. (경로는 실제 위치에 맞게 조정하세요)
import apiFetch from "../../api.js";

// 2. [신규] API 설정
// 🚀 [수정 2] apiFetch가 URL을 관리하므로 이 변수는 더 이상 필요하지 않습니다.
// const API_URL = import.meta.env.VITE_APP_BACKEND_URL;
const BACKEND_ON = true; // 🚨 true로 바꾸면 실제 API 호출
const PAGE_SIZE = 24; // 한 번에 24개씩 불러오기 (API 명세 예시)

// 3. [신규] Mock 데이터 (새 API 스펙에 맞게)
const MOCK_PHOTO_LIST = {
  // ... (MOCK_PHOTO_LIST 내용은 동일)
  "success": true, "code": 200, "message": "포토 리뷰 목록 조회 성공",
  "data": {
    "content": [
      // (API 응답 예시처럼 photoUrl, reviewId, photoId를 포함)
      { "photoUrl": "https://placehold.co/300x300/E13A6E/white?text=Photo+1", "reviewId": 105, "toiletId": 1, "photoId": 1 },
      { "photoUrl": "https://placehold.co/300x300/0D6EFD/white?text=Photo+2", "reviewId": 109, "toiletId": 1, "photoId": 2 },
      { "photoUrl": "https://placehold.co/300x300/198754/white?text=Photo+3", "reviewId": 113, "toiletId": 1, "photoId": 3 },
      { "photoUrl": "https://placehold.co/300x300/fd7e14/white?text=Photo+4", "reviewId": 113, "toiletId": 1, "photoId": 4 },
      { "photoUrl": "https://placehold.co/300x300/6f42c1/white?text=Photo+5", "reviewId": 115, "toiletId": 1, "photoId": 5 },
      { "photoUrl": "https://placehold.co/300x300/dc3545/white?text=Photo+6", "reviewId": 105, "toiletId": 1, "photoId": 6 },
    ],
    "hasNext": true, // '더보기' 버튼 표시 여부
    "nextCursor": "mock-cursor-abc-123" // 다음 요청 시 보낼 커서
  }
};


// 4. [수정] 컴포넌트 이름 변경
export default function PhotoReviewsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // 5. [수정] toiletId는 URL 파라미터에서, toilet 정보는 state에서 가져옴
  const { toiletId } = useParams();
  const { toilet } = location.state || {}; // 헤더 표시에 필요

  // 6. [수정] State: API 응답을 저장할 state들
  const [photos, setPhotos] = useState([]); // API 응답의 'content' 배열
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState(null);

  // 7. [수정] 페이지네이션 State (무한 스크롤용)
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNext, setHasNext] = useState(true);

  // 8. [신규] API 호출 함수
  const fetchPhotos = async (isInitialLoad = false) => {
    // 이미 로딩 중이거나 다음 페이지가 없으면 실행 중지
    if (isLoading || (!isInitialLoad && !hasNext)) return;

    setIsLoading(true);
    setError(null);

    // (1) Mock 모드 (BACKEND_ON = false)
    if (!BACKEND_ON) {
      console.log(
        `[Mock] Fetching photos... initial: ${isInitialLoad}, cursor: ${nextCursor}`
      );
      // 0.5초 딜레이
      setTimeout(() => {
        // Mock 데이터의 content를 기존 photos 배열에 추가
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

    // (2) 실제 API 모드 (BACKEND_ON = true)
    // 🚀 [수정 3] accessToken을 직접 가져오는 로직 (getItem, if문) 삭제
    // apiFetch가 토큰을 자동으로 처리합니다.

    // 9. [수정] API 엔드포인트 구성 (커서 포함)
    // 🚀 [수정 4] URL에서 API_URL 부분을 제거하고 경로만 남깁니다.
    let urlPath = `/toilet/${toiletId}/photos?size=${PAGE_SIZE}`;
    if (!isInitialLoad && nextCursor) {
      // 첫 로드가 아닐 때만 커서 추가
      urlPath += `&nextCursor=${encodeURIComponent(nextCursor)}`;
    }

    try {
      // 🚀 [수정 5] fetch -> apiFetch, URL 경로만 전달, headers 객체 삭제
      const response = await apiFetch(urlPath, {
        method: "GET",
        // headers: 객체 불필요
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "데이터를 불러오는 데 실패했습니다.");
      }

      if (result.success && result.data) {
        // 10. [수정] 기존 배열에 새 데이터를 덧붙임
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
      // 🚀 [수정] apiFetch가 던진 401(로그인) 에러 메시지도 여기서 처리됩니다.
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 11. [수정] 첫 마운트 시 데이터 호출
  useEffect(() => {
    // 'toilet' 정보가 없으면 상세 페이지로 돌려보냄
    if (!toilet) {
      alert("잘못된 접근입니다. 화장실 정보를 불러올 수 없습니다.");
      navigate(-1);
      return;
    }

    // 첫 데이터 로드
    fetchPhotos(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toilet, toiletId, navigate]); // 의존성 배열 (fetchPhotos는 useCallback이 아니므로 넣지 않음)

  // 로딩 UI (데이터 없을 때)
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
        {/* 헤더 (toilet state 사용) */}
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
          {/* 12. [수정] 사진 카운트를 API에서 받은 'photos' state의 길이로 변경 */}
          <span className="photo-review-count">포토리뷰 ({photos.length})</span>
        </div>
        {/* 🚨 [신규] 광고 이미지 추가 */}
        <div className="prdp-ad-container">
          <img src={adrec} alt="광고" className="prdp-ad-image" />
        </div>

        {/* 13. [수정] 필터 제거 (API가 정렬을 지원하지 않음) */}
        {/* <div className="review-filters"> ... </div> */}

        <div className="photo-grid-list">
          {/* 🚨 [수정] .map()에 index 추가 */}
          {photos.map((photo, index) => (
            <button
              // 15. [수정] photoId가 reviewId보다 고유하므로 key로 사용
              // 🚨 [수정] key가 중복되지 않도록 index를 조합
              key={`${photo.photoId}-${index}`}
              className="photo-grid-item"
              onClick={() =>
                // 16. [수정] PhotoReviewDetailPage로 reviewId를 전달
                // 🚨 [수정] 새 라우트와 파라미터에 맞게 navigate 호출을 변경합니다.
                navigate(`/toilet/${photo.toiletId}/photo/${photo.photoId}`, {
                  state: {
                    // reviewId: photo.reviewId, // (이제 URL에 없으므로 state로 전달)
                    toilet: toilet, // 헤더 표시에 필요한 toilet 정보
                  },
                })
              }
            >
              {/* 17. [신규] 실제 이미지 렌더링 */}
              <img src={photo.photoUrl} alt="포토리뷰" />
            </button>
          ))}
        </div>
        {/* --- 그리드 끝 --- */}

        {/* 18. [수정] 페이지네이션 UI를 "더보기" 버튼으로 변경 */}
        <div className="pagination">
          {isLoading && <p>불러오는 중...</p>}

          {error && <p style={{ color: "red" }}>{error}</p>}

          {!isLoading && hasNext && (
            <button
              className="review-more-button" // '리뷰 더보기'와 동일한 스타일 사용
              onClick={() => fetchPhotos(false)} // '더보기' 클릭
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