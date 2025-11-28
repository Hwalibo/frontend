import React, { useState, useEffect } from "react";
import heart from "../../assets/heart.svg";
import star_yell from "../../assets/star/star-yell.svg";
import star_grey from "../../assets/star/star-grey.svg";
import apiFetch from "../../api.js";
import "./ReviewCard.css";

const BACKEND_ON = true; 

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
  WET_SINK: "세면대 주변이 젖었어요",
  SPACIOUS: "화장실이 넓어요",
  GOOD_SCENT: "향기가 좋아요",
  CLOGGED_TOILET: "변기 물이 잘 안내려가요",
  KIND_STAFF: "직원분이 친절해요",
  BROKEN_HANDDRYER: "손 건조기가 고장났어요",
  ENOUGH_TOILET_PAPER: "휴지가 충분해요",
  CLEAN_MIRROR: "거울이 깨끗해요",
};


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



export default function ReviewCard({ reviews, toiletId, showPhotos }) {
  
  const [internalReviews, setInternalReviews] = useState([]);

  useEffect(() => {
    const reviewsWithLikeState = (reviews || []).map((r) => ({
      ...r,
      isLiked: r.isLiked || false,
    }));
    setInternalReviews(reviewsWithLikeState);
  }, [reviews]); 

  
  const handleLikeClick = async (reviewId, isCurrentlyLiked) => {
    
    if (!BACKEND_ON) {
      console.log(
        `[Mock] ${
          isCurrentlyLiked ? "DELETE" : "POST"
        } /toilet/${toiletId}/reviews/${reviewId}/like`
      );
      
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
    
    const originalReviews = internalReviews; 
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
    const endpointPath = `/toilet/${toiletId}/reviews/${reviewId}/like`;

    try {
      const response = await apiFetch(endpointPath, {
        method: method,
      });

      if (!response.ok) {
        
        const errResult = await response.json();
        const error = new Error(
          errResult.message || "좋아요 처리에 실패했습니다."
        );
        error.status = response.status;
        throw error;
      }

      console.log(`Like ${method} success for review ${reviewId}`);
      
    } catch (err) {
      console.error("Like API Error:", err.message);

      if (method === "POST" && err.status === 409) {
        console.warn(
          "UI/서버 상태 불일치 (409). 이미 '좋아요' 상태입니다. '좋아요 취소(DELETE)'를 대신 실행합니다."
        );

        setInternalReviews((currentReviews) =>
          currentReviews.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  isLiked: false, 
                  good: r.good - 2, 
                }
              : r
          )
        );

        
        try { 
          const deleteResponse = await apiFetch(endpointPath, {
            method: "DELETE",
          });

          if (!deleteResponse.ok) {
            
            throw new Error("상태 보정(DELETE) 요청에 실패했습니다.");
          }
          console.log("상태 보정(DELETE) 성공.");
        } catch (deleteErr) {
          console.error("Corrective DELETE failed:", deleteErr.message);
          setInternalReviews(originalReviews); 
          alert("좋아요 상태를 변경하지 못했습니다.");
        }
      } else {
        
        
        setInternalReviews(originalReviews);
        
        alert(err.message);
      }
    }
  };

  
  if (
    !internalReviews ||
    !Array.isArray(internalReviews) ||
    internalReviews.length === 0
  ) {
    return null;
  }

  return (
    <div className="review-con">
      {internalReviews.map((review) => {
        const isUpdated = review.createdAt !== review.updatedAt;
        const displayDate = isUpdated
          ? `${formatDate(review.updatedAt)} (수정)`
          : formatDate(review.createdAt);

        
        const tagsToShow = review.tag || review.tags || [];

        const isLiked = review.isLiked;

        return (
          <div key={review.id} className="review-card">
            <div className="contents">
              <div className="top">
                {review.userPhoto ? (
                  <img
                    src={review.userPhoto}
                    alt="profile"
                    className="frofile-img"
                  />
                ) : (
                  
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
              {tagsToShow.length > 0 && (
                <div className="tags">
                  {tagsToShow.map((tag, index) => (
                    <div key={index} className="tag-item">
                      {tagMap[tag] || tag}
                    </div>
                  ))}
                </div>
              )}

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