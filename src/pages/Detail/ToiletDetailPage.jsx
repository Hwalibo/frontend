import React, { useState, useEffect, useCallback } from "react";
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
import apiFetch from "../../api.js";


const MOCK_TOILET_DETAIL = {
  "success": true,
  "code": 200,
  "message": "화장실 상세 조회 성공",
  "data": {
    "id": 1,
    "name": "신촌(지하)",
    "line": 2,
    "gender": "F", 
    "star": 4.0,
    "numBigToilet": 10,
    "numSmallToilet": 5,
    "numGate": 6,
    "inOut": "Out", 
    "latitude": 37.555,
    "longitude": 126.936,
    "numReview": 11
  }
};


const MOCK_REVIEW_LIST = {
  "success": true,
  "code": 200,
  "message": "리뷰 목록 조회 성공",
  "data": {
    "reviews": [ 
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


const MOCK_AI_SUMMARY = {
  "success": true, "code": 200, "message": "리뷰 요약 성공",
  "data": {
    "summary": "(Mock 요약) 전반적으로 청결하고 환기가 잘 되어 쾌적하다는 평가가 많습니다. 출구와 가까워 접근성이 좋습니다."
  }
};


function ToiletDetailPage() {
  const nav = useNavigate();
  const { toiletId } = useParams();

  const BACKEND_ON = true; 


  const [toilet, setToilet] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAiSummaryOpen, setIsAiSummaryOpen] = useState(false);
  

  const [isPhotoSectionOpen, setIsPhotoSectionOpen] = useState(false);
  const [sortType, setSortType] = useState("LATEST");

  const [summary, setSummary] = useState("");
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  const fetchAiSummary = async () => {
    setIsSummaryLoading(true);
    setSummaryError(null);

    if (!BACKEND_ON) {
      setSummary(MOCK_AI_SUMMARY.data.summary);
      setIsSummaryLoading(false);
      return;
    }

    try {
      if (!toiletId) {
        setSummaryError("화장실 ID가 없어 요약할 수 없습니다.");
        setIsSummaryLoading(false);
        return;
      }
      
      const response = await apiFetch(`/toilet/${toiletId}/reviews/summary`, {
        method: "GET",
      });

      if (!response.ok) {
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
      setSummaryError(err.message);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const handleAiSummaryToggle = () => {
    const newOpenState = !isAiSummaryOpen;
    setIsAiSummaryOpen(newOpenState);

    if (newOpenState && !summary && !isSummaryLoading && !summaryError) {
      fetchAiSummary();
    }
  };



  const fetchData = useCallback(async () => {
    
    if (!toiletId) {
      setError("잘못된 접근입니다. (화장실 ID 없음)");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    if (!BACKEND_ON) {
      setToilet(MOCK_TOILET_DETAIL.data);
      setReviews(MOCK_REVIEW_LIST.data.reviews.map(r => ({...r, photoUrl: r.photo || r.photoUrl}))); 
      setIsLoading(false);
      return;
    }

    try {
      const detailResponse = await apiFetch(`/toilet/${toiletId}`, {
        method: "GET",
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

      try {
        const reviewsResponse = await apiFetch(
          `/toilet/${toiletId}/reviews?sort=${sortType}`, 
          {
            method: "GET",
          }
        );

        if (reviewsResponse.ok) {
          const reviewsResult = await reviewsResponse.json();
          if (reviewsResult.success) {
            const processedReviews = (reviewsResult.data?.reviews || []).map(r => ({
              ...r,
              photoUrl: r.photo || r.photoUrl || []
            }));
            setReviews(processedReviews);
            
          } else {
            throw new Error(reviewsResult.message);
          }
        } else if (reviewsResponse.status === 404) {
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
      console.error("Fatal API Error:", err.message);
      setError(`${err.message} (더미 데이터로 대체합니다.)`);
      setToilet(MOCK_TOILET_DETAIL.data);
      setReviews(MOCK_REVIEW_LIST.data.reviews.map(r => ({...r, photoUrl: r.photo || r.photoUrl})));
    } finally {
      setIsLoading(false);
    }
  }, [toiletId, BACKEND_ON, sortType]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleFocus = () => {
      console.log("Window focused, refetching data...");
      fetchData();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchData]);


  if (isLoading) {
    return (
      <div className="toilet-detail-page">
        <TopHeader />
        <div style={{ padding: "20px" }}>로딩 중...</div>
      </div>
    );
  }

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

  const photoReviews = (reviews || []).filter(r => r && r.photoUrl && r.photoUrl.length > 0);


  return (
    <div className="toilet-detail-page">
      <TopHeader />
      <ReturnToSearch />
      {error && (
        <p style={{ color: 'red', textAlign: 'center', padding: '10px', background: '#ffeeee' }}>
          {error}
        </p>
      )}

      <div className="detail-container">
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

        <div className="ai-summary">
          <button
            className="ai-summary-toggle"
            onClick={handleAiSummaryToggle}
          >
            <span>AI 요약</span>
            <span>{isAiSummaryOpen ? '' : <img src={rightsqure} alt="rightsquare" className="rightsquare" />}</span>
          </button>
          
          {isAiSummaryOpen && (
            <div className="ai-summary-content">
              {isSummaryLoading && <p>AI 요약 생성 중...</p>}
              
              {summaryError && (
                <p style={{ color: 'red' }}>
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

      <div className="review-container">
        <div className="review-tabs">
          <span className="tab-item-active">리뷰 ({toilet.numReview ?? (reviews || []).length})</span>
          <button className="tab-item" onClick={() => nav(`/toilet/${toilet.id}/write`, { state: { toilet: toilet } })}>리뷰 작성하기</button>
        </div>

        <div className="photo-review-buttons">
          <div 
            className="photo-button" 
            onClick={() => setIsPhotoSectionOpen(prev => !prev)}
            style={{ cursor: 'pointer' }}
          >
            <span>포토리뷰 보기 {isPhotoSectionOpen ? '▲' : '▼'}</span>
          </div>

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

        <div className="review-filters">
          <select 
            value={sortType} 
            onChange={(e) => setSortType(e.target.value)}
          >
            <option value="LATEST">최신순</option>
            <option value="RATING">별점순</option>
            <option value="HANDICAPPED">장애인 화장실</option>
          </select>
        </div>

        <div className="review-card-list">
          {(reviews || []).length === 0 ? (
            <p style={{textAlign: 'center', padding: '20px'}}>
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

      </div> 
      <div className="fixed-ad-banner">
        <img src={adbanner} alt="광고 배너" />
      </div>
    </div>
  );
}

export default ToiletDetailPage;