import React, { useState, useEffect, useCallback } from "react";
// 1. useParams 임포트
import { useNavigate, useParams } from "react-router-dom";
import ReviewCard from "../../components/review/ReviewCard";
import TopHeader from '../../components/layout/TopHeader';
import './ToiletDetailPage.css';
import starFilled from '../../assets/star/star-yell.svg';
import starEmpty from '../../assets/star/star-grey.svg';
import door from '../../assets/ReviewPage/door.svg';
import location from '../../assets/ReviewPage/location.svg';
import toiletimg from '../../assets/ReviewPage/toilet-img.svg';
import rightsqure from '../../assets/ReviewPage/right-square-filled.svg';
import ReturnToSearch from '../../components/layout/ReturnToSearch';
import adbanner from '../../assets/ReviewPage/adbanner.svg';

// 🚀 [수정 1] apiFetch를 import 합니다. (경로는 실제 위치에 맞게 조정하세요)
import apiFetch from "../../api.js";

// 1. 화장실 상세 정보 (새 더미데이터)
const MOCK_TOILET_DETAIL = {
  "success": true,
  "code": 200,
  "message": "화장실 상세 조회 성공",
  "data": {
    "id": 1,
    "name": "신촌(지하)",
    "line": 2,
    "gender": "F", // F: 여자, M: 남자
    "star": 4.0,
    "numBigToilet": 10,
    "numSmallToilet": 5,
    "numGate": 6, // 6번 출구로 하드코딩
    "inOut": "Out", // Out: 개찰구 밖, In: 개찰구 안
    "latitude": 37.555,
    "longitude": 126.936,
    "numReview": 11 // Mock 리뷰 개수(11개)와 일치시킴
  }
};

// 🚨 [수정] MOCK_REVIEW_LIST 구조 수정
// data가 배열이 아닌, API 명세와 동일하게 { reviews: [...] } 객체를 갖도록 수정
const MOCK_REVIEW_LIST = {
  "success": true,
  "code": 200,
  "message": "리뷰 목록 조회 성공",
  "data": {
    "reviews": [ // 👈 이 reviews 배열이 data 객체 안에 있도록 수정
      {
        "id": 107,
        "userId": 22,
        "userName": "차현서",
        "userPhotoUrl": null,
        "description": "처음보다 많이 깨끗해졌어요.",
        "star": 4.0,
        "tag": ["TOILET_CLEAN"],
        "photoUrl": [],
        "good": 3,
        "createdAt": "2025-09-20T10:30:00",
        "updatedAt": "2025-09-29T18:45:00",
        "isDis": false
      },
      {
        "id": 106,
        "userId": 18,
        "userName": "한서정",
        "userPhotoUrl": null,
        "description": "냄새가 심했어요.",
        "star": 2.0,
        "tag": ["BAD_ODOR", "NO_TOILET_PAPER"],
        "photoUrl": [],
        "good": 0,
        "createdAt": "2025-09-28T21:00:00",
        "updatedAt": "2025-09-28T21:00:00",
        "isDis": false
      },
      {
        "id": 105,
        "userId": 31,
        "userName": "최윤서",
        "userPhotoUrl": null,
        "description": "환기도 잘되고, 핸드워시도 충분해서 좋았어요.",
        "star": 5.0,
        "tag": ["GOOD_VENTILATION", "ENOUGH_HANDSOAP"],
        "photoUrl": ["review_105_img1.jpg"],
        "good": 7,
        "createdAt": "2025-09-25T09:15:00",
        "updatedAt": "2025-09-25T09:15:00",
        "isDis": false
      },
      {
        "id": 108,
        "userId": 27,
        "userName": "이도현",
        "userPhotoUrl": null,
        "description": "휴지가 없어서 불편했어요.",
        "star": 2.5,
        "tag": ["NO_TOILET_PAPER"],
        "photoUrl": [],
        "good": 1,
        "createdAt": "2025-09-22T14:40:00",
        "updatedAt": "2025-09-22T14:40:00",
        "isDis": false
      },
      {
        "id": 109,
        "userId": 15,
        "userName": "김수연",
        "userPhotoUrl": null,
        "description": "조명이 밝고 거울이 깨끗해서 좋아요!",
        "star": 4.5,
        "tag": ["BRIGHT_LIGHTING", "CLEAN_MIRROR"],
        "photoUrl": ["review_109_img1.jpg"],
        "good": 6,
        "createdAt": "2025-09-24T11:20:00",
        "updatedAt": "2025-09-24T11:20:00",
        "isDis": false
      },
      {
        "id": 110,
        "userId": 20,
        "userName": "박지현",
        "userPhotoUrl": null,
        "description": "세면대 주변이 너무 젖어있었어요.",
        "star": 3.0,
        "tag": ["WET_SINK"],
        "photoUrl": [],
        "good": 2,
        "createdAt": "2025-09-26T17:10:00",
        "updatedAt": "2025-09-26T17:10:00",
        "isDis": false
      },
      {
        "id": 111,
        "userId": 19,
        "userName": "정유진",
        "userPhotoUrl": null,
        "description": "화장실이 넓고 향기도 괜찮았어요.",
        "star": 4.0,
        "tag": ["SPACIOUS", "GOOD_SCENT"],
        "photoUrl": [],
        "good": 5,
        "createdAt": "2025-09-23T08:55:00",
        "updatedAt": "2025-09-23T08:55:00",
        "isDis": false
      },
      {
        "id": 112,
        "userId": 29,
        "userName": "서지훈",
        "userPhotoUrl": null,
        "description": "변기 물이 잘 안내려가요.",
        "star": 1.5,
        "tag": ["CLOGGED_TOILET"],
        "photoUrl": [],
        "good": 0,
        "createdAt": "2025-09-27T13:45:00",
        "updatedAt": "2025-09-27T13:45:00",
        "isDis": false
      },
      {
        "id": 113,
        "userId": 33,
        "userName": "윤다연",
        "userPhotoUrl": null,
        "description": "직원분이 바로 청소해주셔서 감사했어요.",
        "star": 5.0,
        "tag": ["KIND_STAFF", "TOILET_CLEAN"],
        "photoUrl": ["review_113_img1.jpg", "review_113_img2.jpg"],
        "good": 8,
        "createdAt": "2025-09-29T16:00:00",
        "updatedAt": "2025-09-29T16:00:00",
        "isDis": false
      },
      {
        "id": 114,
        "userId": 26,
        "userName": "홍예린",
        "userPhotoUrl": null,
        "description": "손 건조기가 잘 작동하지 않았어요.",
        "star": 2.0,
        "tag": ["BROKEN_HANDDRYER"],
        "photoUrl": [],
        "good": 1,
        "createdAt": "2025-09-21T19:30:00",
        "updatedAt": "2025-09-21T19:30:00",
        "isDis": false
      },
      {
        "id": 115,
        "userId": 23,
        "userName": "신민수",
        "userPhotoUrl": null,
        "description": "휴지도 충분하고 전체적으로 깔끔했어요!",
        "star": 4.5,
        "tag": ["ENOUGH_TOILET_PAPER", "TOILET_CLEAN"],
        "photoUrl": ["review_115_img1.jpg"],
        "good": 9,
        "createdAt": "2025-09-30T09:10:00",
        "updatedAt": "2025-09-30T09:10:00",
        "isDis": false
      }
    ]
  }
};

// 3. [신규] AI 요약 Mock 데이터
const MOCK_AI_SUMMARY = {
  "success": true, "code": 200, "message": "리뷰 요약 성공",
  "data": {
    "summary": "(Mock 요약) 전반적으로 청결하고 환기가 잘 되어 쾌적하다는 평가가 많습니다. 출구와 가까워 접근성이 좋습니다."
  }
};


function ToiletDetailPage() {
  const nav = useNavigate();
  // 3. URL에서 toiletId 가져오기
  const { toiletId } = useParams();

  // 4. API 설정
  // 🚀 [수정 2] apiFetch가 URL을 관리하므로 이 변수는 더 이상 필요하지 않습니다.
  // const API_URL = import.meta.env.VITE_APP_BACKEND_URL;
  const BACKEND_ON = true; // 🚨 true로 바꾸면 실제 API 호출

  // 5. State 설정
  const [toilet, setToilet] = useState(null);
  const [reviews, setReviews] = useState([]); // 🚨 (초기값은 빈 배열)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAiSummaryOpen, setIsAiSummaryOpen] = useState(false);
  

  const [isPhotoSectionOpen, setIsPhotoSectionOpen] = useState(false);
  // 6. [신규] 정렬 타입 State (API 쿼리 파라미터용)
  const [sortType, setSortType] = useState("LATEST"); // 기본값: 최신순

  // 7. [신규] AI 요약 State
  const [summary, setSummary] = useState(""); // AI 요약 텍스트
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  // 8. [신규] AI 요약 API 호출 함수
  const fetchAiSummary = async () => {
    setIsSummaryLoading(true);
    setSummaryError(null);

    // (1) BACKEND_ON이 false일 때 (Mock 데이터)
    if (!BACKEND_ON) {
      setSummary(MOCK_AI_SUMMARY.data.summary);
      setIsSummaryLoading(false);
      return;
    }

    // (2) BACKEND_ON이 true일 때 (실제 API)
    // 🚀 [수정 3] accessToken을 직접 가져오는 로직 (getItem, if문) 삭제
    // apiFetch가 토큰을 자동으로 처리합니다.

    try {
      // 🚨 [수정] AI 요약 API도 toiletId 가드 필요
      if (!toiletId) {
        setSummaryError("화장실 ID가 없어 요약할 수 없습니다.");
        setIsSummaryLoading(false);
        return;
      }
      
      // 🚀 [수정 4] fetch -> apiFetch, URL 경로만 전달, headers 객체 삭제
      const response = await apiFetch(`/toilet/${toiletId}/reviews/summary`, {
        method: "GET",
        // headers: 객체 불필요
      });

      if (!response.ok) {
        // 401, 404, 500 등 에러 처리
        const errResult = await response.json();
        throw new Error(errResult.message || "요약 생성 중 오류 발생");
      }

      const result = await response.json();
      if (result.success && result.data?.summary) {
        setSummary(result.data.summary);
      } else {
        throw new Error(result.message || "요약 데이터를 불러오지 못했습니다.");
      }

    } catch (err) {
      console.error("AI Summary Error:", err.message);
      // 🚀 [수정] apiFetch가 던진 401(로그인) 에러 메시지도 여기서 처리됩니다.
      setSummaryError(err.message);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // 9. [신규] AI 요약 버튼 클릭 핸들러
  const handleAiSummaryToggle = () => {
    const newOpenState = !isAiSummaryOpen;
    setIsAiSummaryOpen(newOpenState);

    // 10. [신규] 요약 패널이 열리고, 아직 요약을 불러온 적이 없다면 API 호출
    if (newOpenState && !summary && !isSummaryLoading && !summaryError) {
      fetchAiSummary();
    }
  };


  // 11. [수정] useEffect -> useCallback으로 변경
  // (API 호출 로직을 함수로 분리)
  const fetchData = useCallback(async () => {
    
    // 🚨 [수정] toiletId가 유효하지 않으면 API 호출 시도조차 하지 않음
    if (!toiletId) {
      setError("잘못된 접근입니다. (화장실 ID 없음)");
      setIsLoading(false);
      return;
    }
    
    // 🚨 [수정] API 호출 시 항상 로딩 상태로 (리뷰 작성 후 돌아올 때)
    setIsLoading(true);
    setError(null);

    // (1) BACKEND_ON이 false일 때 (Mock 데이터)
    if (!BACKEND_ON) {
      setToilet(MOCK_TOILET_DETAIL.data);
      // 🚨 [수정] MOCK 데이터도 API 로그(7:40 PM)에 맞춰 'photo'를 'photoUrl'로 수정
      // (Mock 데이터 자체를 수정하는 것이 좋으나, 여기서는 'photo'를 'photoUrl'로 간주)
      setReviews(MOCK_REVIEW_LIST.data.reviews.map(r => ({...r, photoUrl: r.photo || r.photoUrl}))); 
      setIsLoading(false);
      return;
    }

    // (2) BACKEND_ON이 true일 때 (실제 API)
    // 🚀 [수정 5] accessToken을 직접 가져오는 로직 (getItem, if문) 삭제
    // apiFetch가 토큰을 자동으로 처리합니다.
    // 🚀 [수정] 토큰이 없을 때의 Fallback 로직은 catch 블록으로 이동/통합됩니다.

    try {
      // --- API 1: 화장실 상세 정보 (필수) ---
      // 🚀 [수정 6] fetch -> apiFetch, URL 경로만 전달, headers 객체 삭제
      const detailResponse = await apiFetch(`/toilet/${toiletId}`, {
        method: "GET",
        // headers: 객체 불필요
      });
      
      if (!detailResponse.ok) {
        throw new Error("화장실 정보를 불러오는 데 실패했습니다.");
      }
      const detailResult = await detailResponse.json();

      console.log("실제 화장실 상세 API 응답:", detailResult.data);
      
      if (detailResult.success && detailResult.data) {
        setToilet(detailResult.data);
      } else {
        throw new Error(detailResult.message || "화장실 정보를 찾을 수 없습니다.");
      }

      // --- API 2: 리뷰 목록 (선택적) ---
      try {
        // 🚀 [수정 7] fetch -> apiFetch, URL 경로만 전달, headers 객체 삭제
        const reviewsResponse = await apiFetch(
          `/toilet/${toiletId}/reviews?sort=${sortType}`, 
          {
            method: "GET",
            // headers: 객체 불필요
          }
        );

        if (reviewsResponse.ok) {
          const reviewsResult = await reviewsResponse.json();
          if (reviewsResult.success) {
            
            // 🚨 [수정] 7:40 PM 로그 기준 'photo'를 'photoUrl'로 변환
            // (이젠 필요 없을 수 있으나, 안전을 위해 유지)
            const processedReviews = (reviewsResult.data?.reviews || []).map(r => ({
              ...r,
              photoUrl: r.photo || r.photoUrl || [] // 'photo'를 'photoUrl'로 복사
            }));
            setReviews(processedReviews);
            
          } else {
            throw new Error(reviewsResult.message);
          }
        } else if (reviewsResponse.status === 404) {
          // 404 에러 (리뷰 없음)는 성공으로 간주하고 빈 배열 설정
          setReviews([]);
        } else {
          throw new Error("리뷰 서버 응답 오류");
        }

      } catch (reviewError) {
        console.warn("Review fetch failed, using fallback:", reviewError.message);
        setError("리뷰 목록을 불러오지 못했습니다. (더미 데이터로 대체)");
        setReviews(MOCK_REVIEW_LIST.data.reviews.map(r => ({...r, photoUrl: r.photo || r.photoUrl}))); 
      }

    } catch (err) {
      // (화장실 상세 정보 로딩 실패 등 치명적 오류)
      // 🚀 [수정] apiFetch가 401(로그인) 에러를 던지면 이 catch 블록이 실행됩니다.
      console.error("Fatal API Error:", err.message);
      setError(`${err.message} (더미 데이터로 대체합니다.)`);
      setToilet(MOCK_TOILET_DETAIL.data);
      setReviews(MOCK_REVIEW_LIST.data.reviews.map(r => ({...r, photoUrl: r.photo || r.photoUrl})));
    } finally {
      setIsLoading(false);
    }
  }, [toiletId, BACKEND_ON, sortType]); // 12. 🚀 [수정] API_URL 의존성 제거


  // 13. [신규] 컴포넌트 마운트 시 fetchData 호출
  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData 함수가 (useCallback에 의해) 변경될 때만 실행

  // 14. [신규] 'nav(-1)'로 돌아왔을 때 (focus) fetchData 다시 호출
  useEffect(() => {
    const handleFocus = () => {
      console.log("Window focused, refetching data...");
      fetchData();
    };

    window.addEventListener('focus', handleFocus);
    // 컴포넌트 unmount 시 리스너 제거
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchData]); // fetchData 함수가 변경될 때마다 리스너 재생성


  // 9. 로딩 및 에러 처리 (필수)
  if (isLoading) {
    return (
      <div className="toilet-detail-page">
        <TopHeader />
        <div style={{ padding: "20px" }}>로딩 중...</div>
      </div>
    );
  }

  // 🚨 [수정] 렌더링이 되기 전에 toilet이 null일 수 있으므로
  // toilet이 없을 때 확실하게 컴포넌트를 종료시킴
  if (!toilet) {
    return (
      <div className="toilet-detail-page">
        <TopHeader />
        <div style={{ padding: "20px", color: "red" }}>
          {error || "화장실 정보를 찾을 수 없습니다."}
        </div>
      </div>
    );
  }

  const renderStars = (starRating, totalStars = 5) => {
    const roundedStars = Math.round(starRating);
    const stars = [];
    for (let i = 1; i <= totalStars; i++) {
      stars.push(
        <img key={i} src={i <= roundedStars ? starFilled : starEmpty} alt="star" className="star-icon" />
      );
    }
    return <div className="star-rating-container">{stars}</div>;
  };

// 🚨 [수정] 'photo'가 아닌 'photoUrl' 키를 사용해야 합니다.
  const photoReviews = (reviews || []).filter(r => r && r.photoUrl && r.photoUrl.length > 0);


  return (
    <div className="toilet-detail-page">
      <TopHeader />
      <ReturnToSearch />

      {/* API 실패 시(Fallback 시) 에러 메시지 표시 */}
      {error && (
        <p style={{ color: 'red', textAlign: 'center', padding: '10px', background: '#ffeeee' }}>
          {error}
        </p>
      )}

      {/* ... (상단 화장실 정보 섹션 - toilet state 사용) ... */}
      <div className="detail-container">
        {/* (이름, 별점, 위치 정보 ...) */}
        <div className="toilet-header">
          <h1 className="toilet-name">{toilet.name}</h1>
          <span className="toilet-info">
            {toilet.line}호선
            <span className="er-review-info-divider">·</span>
            {toilet.gender === "FEMALE" || toilet.gender === "F" ? (
              <span className="fe" style={{ color: "#E13A6E" }}> 여자 </span>
            ) : (
              <span className="ma" style={{ color: "#0D6EFD" }}> 남자 </span>
            )}
          </span>
        </div>
        <div className="toilet-rating">
          <span className="star-icons">{renderStars(toilet.star)}</span>
          <span className="star-number">({toilet.star})</span>
        </div>
        <div className="toilet-location-info">
          <span><img src={door} alt="door" className="door" />{toilet.inOut === 'Out' ? '개찰구 밖' : '개찰구 안'}</span>
          <span><img src={location} alt="location" className="location" />{toilet.numGate}번 출구</span>
          <span><img src={toiletimg} alt="toiletimg" className="toiletimg" />양변기 {toilet.numBigToilet}개 / 소변기 {toilet.numSmallToilet}개</span>
        </div>

        {/* 12. [수정] AI 요약 섹션 */}
        <div className="ai-summary">
          <button
            className="ai-summary-toggle"
            onClick={handleAiSummaryToggle} // 9번 핸들러 연결
          >
            <span>AI 요약</span>
            <span>{isAiSummaryOpen ? '' : <img src={rightsqure} alt="rightsquare" className="rightsquare" />}</span>
          </button>
          
          {/* 요약 내용 (로딩/에러/성공) */}
          {isAiSummaryOpen && (
            <div className="ai-summary-content">
              {isSummaryLoading && <p>AI 요약 생성 중...</p>}
              
              {summaryError && (
                <p style={{ color: 'red' }}>
                  {/* (404: "해당 화장실에 리뷰가 없습니다." 등 API 에러 메시지) */}
                  {summaryError} 
                </p>
              )}

              {!isSummaryLoading && !summaryError && summary && (
                <p>{summary}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="divider"></div>

      {/* 2. 하단 리뷰 섹션 */}
      <div className="review-container">
        <div className="review-tabs">
          {/* 1. [수정] numReview가 null/undefined일 경우 reviews.length로 대체 */}
          <span className="tab-item-active">리뷰 ({toilet.numReview ?? (reviews || []).length})</span>
          <button className="tab-item" onClick={() => nav(`/toilet/${toilet.id}/write`, { state: { toilet: toilet } })}>리뷰 작성하기</button>
        </div>

        {/* 2. [수정] 포토리뷰 미리보기 (4개) */}
        <div className="photo-review-buttons">
          {/* 👇 [수정] onClick 핸들러와 텍스트 변경 */}
          <div 
            className="photo-button" 
            onClick={() => setIsPhotoSectionOpen(prev => !prev)}
            style={{ cursor: 'pointer' }} // 클릭 가능하게
          >
            <span>포토리뷰 보기 {isPhotoSectionOpen ? '▲' : '▼'}</span>
          </div>

          {/* 👇 [신규] isPhotoSectionOpen이 true일 때만 아래 내용을 렌더링 */}
          {isPhotoSectionOpen && (
            <>
              <div className="photo-list-example">
                {photoReviews.slice(0, 4).map((review, index) => (
                  <div 
                    key={review.id || index} 
                    className="photo-example-item"
                    style={{ backgroundImage: `url(${review.photoUrl[0]})` }}
                    onClick={() =>
                      nav(`/toilet/${toilet.id}/photos`, {
                        state: { reviews: photoReviews, toilet: toilet },
                      })
                    }
                  >
                  </div>
                ))}
              </div>
            <div className="photo-more-container">
              <button
                className="photo-button-more"
                onClick={() =>
                  nav(`/toilet/${toilet.id}/photos`, {
                    state: { reviews: photoReviews, toilet: toilet },
                  })
                }
              >
                포토리뷰 더보기
              </button>
            </div>
            </>
          )}
        </div>

        {/* 11. [수정] 필터 (API 연동) */}
        <div className="review-filters">
          {/* [수정] API 명세(sort=LATEST, RATING, HANDICAPPED)에 따라
            두 개로 나뉘어 있던 select를 하나로 통합합니다.
          */}
          <select 
            value={sortType} 
            onChange={(e) => setSortType(e.target.value)}
          >
            <option value="LATEST">최신순</option>
            <option value="RATING">별점순</option>
            <option value="HANDICAPPED">장애인 화장실</option>
          </select>
          {/* [수정] 두 번째 select 태그는 API와 호환되지 않으므로 제거합니다.
          */}
        </div>

        {/* 리뷰 카드 목록 (reviews state 사용) */}
        <div className="review-card-list">
          {/* 🚨 [수정] (reviews || []) 방어 코드 추가 */}
          {(reviews || []).length === 0 ? (
            <p style={{textAlign: 'center', padding: '20px'}}>
              {/* 404 응답(리뷰 없음)이 뜰 때 이 메시지가 보임 */}
              아직 작성된 리뷰가 없습니다.
            </p>
          ) : (
            
          <ReviewCard 
            reviews={(reviews || []).slice(0, 3)} 
            toiletId={toiletId} 
            showPhotos={isPhotoSectionOpen}
          />
          )}
        </div>

        {/* 🚨 [수정] (reviews || []) 방어 코드 추가 */}
        {(reviews || []).length > 3 && (
          <div className="review-more-container">
            <button
              className="review-more-button"
              onClick={() =>
                nav(`/toilet/${toilet.id}/reviews`, {
                  state: { reviews: reviews, toilet: toilet },
                })
              }
            >
              리뷰 더보기
            </button>
          </div>
        )}

      </div> {/* .review-container 끝 */}
      {/* 🚀 [신규] 하단 고정 광고 배너 */}
      <div className="fixed-ad-banner">
        <img src={adbanner} alt="광고 배너" />
      </div>
    </div>
  );
}

export default ToiletDetailPage;