import React, { useState, useEffect } from "react";
import heart from "../../assets/heart.svg";
import star_yell from "../../assets/star/star-yell.svg";
import star_grey from "../../assets/star/star-grey.svg";
// (500 오류 방지를 위해 user-icon import는 주석 처리합니다. 실제 경로를 확인하세요)
// import defaultUserIcon from '../../assets/user-icon.svg';

// 🚀 [수정 1] apiFetch를 import 합니다. (경로는 실제 위치에 맞게 조정하세요)
import apiFetch from "../../api.js";

import "./ReviewCard.css";

// API 설정
// const API_URL = import.meta.env.VITE_APP_BACKEND_URL; // 🚀 [수정 2] apiFetch가 URL을 관리하므로 삭제
const BACKEND_ON = true; // 🚨 true로 바꾸면 실제 API 호출

// 영어 태그 → 한글 매핑
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
  // (기타 태그들)
  WET_SINK: "세면대 주변이 젖었어요",
  SPACIOUS: "화장실이 넓어요",
  GOOD_SCENT: "향기가 좋아요",
  CLOGGED_TOILET: "변기 물이 잘 안내려가요",
  KIND_STAFF: "직원분이 친절해요",
  BROKEN_HANDDRYER: "손 건조기가 고장났어요",
  ENOUGH_TOILET_PAPER: "휴지가 충분해요",
  CLEAN_MIRROR: "거울이 깨끗해요",
};

// 날짜 포맷 함수
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}.${month}.${day} ${hours}:${minutes}`;
};

// --- 메인 컴포넌트 ---

export default function ReviewCard({ reviews, toiletId, showPhotos }) {
  // '좋아요' 상태를 관리하기 위해 props를 local state로 복사
  const [internalReviews, setInternalReviews] = useState([]);

  useEffect(() => {
    // 🚨 [가정] 백엔드가 "isLiked" boolean을 보내준다고 가정
    // (7:40 PM 로그에는 이 값이 빠져있습니다. 백엔드 응답에 'isLiked: true/false'가 포함되어야 합니다)
    const reviewsWithLikeState = (reviews || []).map((r) => ({
      ...r,
      // 🚨 (중요) API 응답에 isLiked가 없다면, 임시로 false를 사용
      isLiked: r.isLiked || false,
    }));
    setInternalReviews(reviewsWithLikeState);
  }, [reviews]); // reviews prop이 바뀔 때마다 local state 갱신

  // 👇 [수정 3] handleLikeClick 함수 전체를 apiFetch 버전으로 교체
  const handleLikeClick = async (reviewId, isCurrentlyLiked) => {
    // (A) Mock 모드 (BACKEND_ON = false)
    if (!BACKEND_ON) {
      console.log(
        `[Mock] ${
          isCurrentlyLiked ? "DELETE" : "POST"
        } /toilet/${toiletId}/reviews/${reviewId}/like`
      );
      // Mock 모드에서도 UI가 즉시 반응하도록 state 업데이트
      setInternalReviews((currentReviews) =>
        currentReviews.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                isLiked: !isCurrentlyLiked,
                good: isCurrentlyLiked ? r.good - 1 : r.good + 1,
              }
            : r
        )
      );
      return;
    }

    // (B) 실제 API 모드 (BACKEND_ON = true)

    // 🚀 [수정] accessToken 관련 로직(getItem, if문) 모두 삭제
    // apiFetch가 토큰을 자동으로 관리합니다.
    // 만약 로그인이 필요하다는 알림을 띄우고 싶다면,
    // apiFetch가 401 에러를 던졌을 때 catch 블록에서 처리할 수 있습니다.
    // (현재는 'err.message'를 alert 하도록 되어있습니다.)

    // API 호출 전 즉시 UI 업데이트 (Optimistic Update)
    const originalReviews = internalReviews; // 롤백 대비
    setInternalReviews((currentReviews) =>
      currentReviews.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              isLiked: !isCurrentlyLiked,
              good: isCurrentlyLiked ? r.good - 1 : r.good + 1,
            }
          : r
      )
    );

    const method = isCurrentlyLiked ? "DELETE" : "POST";
    // 🚀 [수정] URL에서 API_URL 부분을 제거하고 경로만 남깁니다.
    const endpointPath = `/toilet/${toiletId}/reviews/${reviewId}/like`;

    try {
      // 🚀 [수정] fetch -> apiFetch로 변경
      // 🚀 [수정] headers 객체 제거
      const response = await apiFetch(endpointPath, {
        method: method,
        // headers: 객체 불필요
      });

      if (!response.ok) {
        // (409 Conflict 등 에러 발생 시)
        const errResult = await response.json();
        // 🚨 [수정] 에러 객체에 status 코드를 포함시킵니다.
        const error = new Error(
          errResult.message || "좋아요 처리에 실패했습니다."
        );
        error.status = response.status;
        throw error;
      }

      console.log(`Like ${method} success for review ${reviewId}`);
      // (성공 시 UI는 이미 업데이트되었으므로 추가 작업 불필요)
    } catch (err) {
      console.error("Like API Error:", err.message);

      // 🚨 [핵심 수정]
      // "좋아요" (POST)를 시도했는데 "이미 좋아요를 눌렀다" (409 Conflict) 에러가 발생한 경우
      if (method === "POST" && err.status === 409) {
        console.warn(
          "UI/서버 상태 불일치 (409). 이미 '좋아요' 상태입니다. '좋아요 취소(DELETE)'를 대신 실행합니다."
        );

        // 1. UI를 "좋아요 취소" 상태로 되돌립니다.
        // (optimistic update로 +1 했던 것을 -2 하여 (-1) 상태로 만듭니다)
        setInternalReviews((currentReviews) =>
          currentReviews.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  isLiked: false, // "좋아요 취소" 상태로 변경
                  good: r.good - 2, // (+1)을 되돌리고 (-1)을 적용
                }
              : r
          )
        );

        // 2. "좋아요 취소(DELETE)" API를 대신 호출합니다.
        try {
          // 🚀 [수정] fetch -> apiFetch로 변경
          // 🚀 [수정] headers 객체 제거
          const deleteResponse = await apiFetch(endpointPath, {
            method: "DELETE",
            // headers: 객체 불필요
          });

          if (!deleteResponse.ok) {
            // 만약 "좋아요 취소"도 실패하면, 모든 UI를 원래대로 롤백합니다.
            throw new Error("상태 보정(DELETE) 요청에 실패했습니다.");
          }
          console.log("상태 보정(DELETE) 성공.");
        } catch (deleteErr) {
          console.error("Corrective DELETE failed:", deleteErr.message);
          setInternalReviews(originalReviews); // 롤백
          alert("좋아요 상태를 변경하지 못했습니다.");
        }
      } else {
        // 409가 아닌 다른 에러(500 등)이거나, DELETE 자체가 실패한 경우
        // 🚨 API 호출 실패 시, UI를 원래대로 롤백
        setInternalReviews(originalReviews);
        // 🚀 apiFetch가 401(토큰 없음/만료) 에러를 반환하면 여기서 alert(err.message)가 실행됩니다.
        alert(err.message);
      }
    }
  };

  // [수정] internalReviews가 비어있을 때
  if (
    !internalReviews ||
    !Array.isArray(internalReviews) ||
    internalReviews.length === 0
  ) {
    return null;
  }

  return (
    <div className="review-con">
      {/* [수정] reviews -> internalReviews로 변경 */}
      {internalReviews.map((review) => {
        const isUpdated = review.createdAt !== review.updatedAt;
        const displayDate = isUpdated
          ? `${formatDate(review.updatedAt)} (수정)`
          : formatDate(review.createdAt);

        // 🚨 [수정] 7:40 PM 로그 기준 'tag' 키 사용
        const tagsToShow = review.tag || review.tags || [];

        const isLiked = review.isLiked;

        return (
          <div key={review.id} className="review-card">
            <div className="contents">
              <div className="top">
                {/* 🚨 [수정] 7:40 PM 로그 기준 'userPhoto' 키 사용 */}
                {review.userPhoto ? (
                  <img
                    src={review.userPhoto}
                    alt="profile"
                    className="frofile-img"
                  />
                ) : (
                  // defaultUserIcon이 주석 처리되었으므로 기본 div만 표시
                  <div className="frofile-img"></div>
                )}
                <div className="info">
                  <div className="info2">
                    <p className="name">{review.userName}</p>
                    <p className="date">{displayDate}</p>
                  </div>
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <img
                        key={i}
                        src={i < review.star ? star_yell : star_grey}
                        alt={i < review.star ? "yellow star" : "grey star"}
                        width="12px"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <p className="desc">{review.description}</p>

              {/* [수정] tagsToShow 변수 사용 */}
              {tagsToShow.length > 0 && (
                <div className="tags">
                  {tagsToShow.map((tag, index) => (
                    <div key={index} className="tag-item">
                      {tagMap[tag] || tag}
                    </div>
                  ))}
                </div>
              )}

              {/* 👇 2. 이 부분을 {showPhotos && ...} 로 감싸줍니다. */}
              {showPhotos && review.photoUrl && review.photoUrl.length > 0 && (
                <div className="rc-photo-list">
                  {review.photoUrl.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`review-photo-${index}`}
                      className="rc-photo-item"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* [수정] onClick 이벤트와 'active' 클래스 추가 */}
            <div
              className="like"
              onClick={() => handleLikeClick(review.id, isLiked)}
            >
              <div className={`sub-like ${isLiked ? "active" : ""}`}>
                <img src={heart} alt="like" />
                <p>{review.good}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}