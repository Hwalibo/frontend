import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReviewCard from "../../components/review/ReviewCard";
import TopHeader from "../../components/layout/TopHeader";
import "./AllReviewsPage.css";
import AdBannerSvg from "../../assets/ReviewPage/adRectangle.svg";
import ReturnToSearch from "../../components/layout/ReturnToSearch";



const REVIEWS_PER_PAGE = 5;

export default function AllReviewsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  
  const { reviews, toilet } = location.state || {};
  const [currentPage, setCurrentPage] = useState(1);
  const [sortType, setSortType] = useState("LATEST");
  const [isPhotoSectionOpen, setIsPhotoSectionOpen] = useState(false);

  
  useEffect(() => {
    if (!reviews || !toilet) {
      alert("잘못된 접근입니다. 리뷰 정보를 불러올 수 없습니다.");
      navigate(-1); 
    }
  }, [reviews, toilet, navigate]);

  
  const filteredReviews = useMemo(() => {
    
    const sourceReviews = Array.isArray(reviews) ? reviews : [];
    
    switch (sortType) {
      case "RATING":
        return [...sourceReviews].sort((a, b) => b.star - a.star);
      case "HANDICAPPED":
        return sourceReviews.filter(r => r.isDis === true);
      case "LATEST":
      default:
        return [...sourceReviews].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
  }, [reviews, sortType]); 


  
  if (!reviews || !toilet) {
    return (
      <div className="all-reviews-page">
        <TopHeader />
        <p style={{ padding: "20px", textAlign: "center" }}>
          리뷰 정보를 불러오는 중...
        </p>
      </div>
    );
  }

  
  const indexOfLastReview = currentPage * REVIEWS_PER_PAGE;
  const indexOfFirstReview = indexOfLastReview - REVIEWS_PER_PAGE;
  const currentReviews = filteredReviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);

  
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  

  
  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); 
  };

  return (
    <div className="all-reviews-page">
      <TopHeader />
      <ReturnToSearch />
      <div className="all-reviews-container">
        <div className="all-reviews-header">
          <div className="all-reviews-header-info">
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
          <span className="review">리뷰 ({filteredReviews.length})</span>
        </div>

        <div className="ad-banner-wrapper">
          <img src={AdBannerSvg} alt="광고 배너" className="ad-banner-image" />
        </div>

        <div className="review-filters">
          <button 
            className="photo-toggle-button" 
            onClick={() => setIsPhotoSectionOpen(prev => !prev)}
          >
            {isPhotoSectionOpen ? '사진 숨기기' : '사진 보기'}
          </button>
          <select 
            value={sortType} 
            onChange={(e) => {
              setSortType(e.target.value);
              setCurrentPage(1); 
            }}
          >
            <option value="LATEST">최신순</option>
            <option value="RATING">별점순</option>
            <option value="HANDICAPPED">장애인 화장실</option>
          </select>
        </div>
        <div className="review-card-list">
          <ReviewCard reviews={currentReviews} toiletId={toilet?.id} showPhotos={isPhotoSectionOpen} />
        </div>
        <div className="pagination">
          <button
            onClick={() => handlePageClick(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            {"<<"}
          </button>

          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => handlePageClick(number)}
              
              className={currentPage === number ? "active" : ""}
            >
              {number}
            </button>
          ))}

          <button
            onClick={() =>
              handlePageClick(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
          >
            {">>"}
          </button>
        </div>
      </div>
    </div>
  );
}