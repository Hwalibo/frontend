import React, { useId, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TopHeader from "../../components/layout/TopHeader";
import star_yell from "../../assets/star/star-yell.svg";
import star_grey from "../../assets/star/star-grey.svg";
import "./WriteReviewPage.css";
import ad from "../../assets/ReviewPage/Frame.svg";
import AlertModal from "../../components/layout/AlertModal";
import apiFetch from "../../api";

const renderStars = (star, onChange, size = 40) => {
  return (
    <div
      className="star-container er-stars"
      role="radiogroup"
      aria-label="별점 선택"
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const active = star >= n;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={star === n}
            className={`er-star ${active ? "is-active" : ""}`}
            onClick={() => onChange?.(n)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                onChange?.(Math.min(5, (star || 0) + 1));
              }
              if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                onChange?.(Math.max(1, (star || 0) - 1));
              }
            }}
          >
            <img
              src={active ? star_yell : star_grey}
              alt={active ? `${n}점 선택됨` : `${n}점 선택`}
              className="star-icon"
              style={{ width: `${size}px`, height: `${size}px` }}
            />
          </button>
        );
      })}
    </div>
  );
};
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
const TAG_KEYS = Object.keys(tagMap);
const POSITIVE_TAG_KEYS = TAG_KEYS.slice(0, 5);
const NEGATIVE_TAG_KEYS = TAG_KEYS.slice(5);

export default function WriteReviewPage() {
  const location = useLocation();
  const nav = useNavigate();
  const { toiletId } = useParams();
  const API_URL = import.meta.env.VITE_APP_BACKEND_URL;
  const BACKEND_ON = true;
  const toilet = location.state?.toilet;

  useEffect(() => {
    if (!toilet) {
      alert("잘못된 접근입니다. 화장실 정보가 없습니다.");
      nav("/");
    }
  }, [toilet, nav]);

  const [star, setStar] = useState(0);
  const [desc, setDesc] = useState("");
  const [isDisability, setIsDisability] = useState(false);
  const [selectedTags, setSelectedTags] = useState(new Set());

  const [newPhotos, setNewPhotos] = useState([]);
  const fileInputRef = useRef(null);
  const MAX_PHOTOS = 2;

  const [submitting, setSubmitting] = useState(false);

  const [isPollingImages, setIsPollingImages] = useState(false);
  const [pollingImageIds, setPollingImageIds] = useState([]);

  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusModalMessage, setStatusModalMessage] = useState("");
  const [statusModalAction, setStatusModalAction] = useState(null);

  const uid = useId();
  const MAX_DESC = 1000;

  const toggleTag = (key) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        return next;
      } else {
        if (prev.size < 3) {
          next.add(key);
          return next;
        } else {
          setIsModalOpen(true);
          return prev;
        }
      }
    });
  };

  const handlePhotoUploadClick = () => {
    if (newPhotos.length >= MAX_PHOTOS) {
      alert(`사진은 최대 ${MAX_PHOTOS}장까지 업로드할 수 있습니다.`);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const currentTotal = newPhotos.length;
    const remainingSlots = MAX_PHOTOS - currentTotal;

    if (files.length > remainingSlots) {
      alert(`최대 ${MAX_PHOTOS}장까지만 업로드 가능합니다.`);
    }

    const filesToAdd = files.slice(0, remainingSlots).map((file) => ({
      file: file,
      preview: URL.createObjectURL(file),
    }));

    setNewPhotos((prev) => [...prev, ...filesToAdd]);

    if (event.target) {
      event.target.value = null;
    }
  };

  const handleDeleteNew = (indexToRemove) => {
    setNewPhotos((prev) => {
      const newArray = [...prev];
      const [removedPhoto] = newArray.splice(indexToRemove, 1);
      if (removedPhoto) {
        URL.revokeObjectURL(removedPhoto.preview);
      }
      return newArray;
    });
  };

  useEffect(() => {
    return () => {
      newPhotos.forEach((photo) => URL.revokeObjectURL(photo.preview));
    };
  }, [newPhotos]);

  const validate = () => {
    const next = {};
    
    if (!star || star < 1) next.star = "별점을 선택하세요.";
    
    if (desc.length > MAX_DESC)
      next.desc = `설명은 ${MAX_DESC}자 이내로 입력하세요.`;
      
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isFormValid = validate();

    if (!isFormValid || !toilet || !toiletId) {
      return;
    }

    setSubmitting(true);

    const reviewPayload = {
      star: Number(star),
      description: desc.trim(),
      tag: Array.from(selectedTags),
      isDis: Boolean(isDisability),
    };

    if (!BACKEND_ON) {
      console.log("[Mock Submit] Payload:", reviewPayload);
      console.log("[Mock Submit] Endpoint:", `${API_URL}/toilet/${toiletId}/reviews`);
      const mockReviewId = 152;
      console.log(`[Mock] Review Created with ID: ${mockReviewId}`);

      if (newPhotos.length > 0) {
        const formData = new FormData();
        newPhotos.forEach((photo) => formData.append("photos", photo.file));
        console.log("[Mock Submit] Photos Payload:", formData.getAll("photos"));
        console.log(
          "[Mock Submit] Photos Endpoint:",
          `${API_URL}/toilet/${mockReviewId}/photos`
        );
      }

      setTimeout(() => {
        setSubmitting(false);
        alert("리뷰가 (Mock) 등록되었습니다.");
        nav(-1);
      }, 1000);
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setStatusModalMessage("리뷰를 등록하려면 로그인이 필요합니다.");
      setStatusModalAction(null);
      setIsStatusModalOpen(true);
      setSubmitting(false);
      return;
    }

    let createdReviewId = null;

    try {
      const reviewResponse = await apiFetch(`/toilet/${toiletId}/reviews`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(reviewPayload),
      });

      const reviewResult = await reviewResponse.json();

      if (!reviewResponse.ok) {
        throw new Error(
          reviewResult.message || `리뷰 등록 실패: ${reviewResponse.status}`
        );
      }

      if (!reviewResult.data?.reviewId) {
        throw new Error("리뷰 ID를 받지 못했습니다.");
      }

      createdReviewId = reviewResult.data.reviewId;
      console.log(`[API] Review Created with ID: ${createdReviewId}`);

      if (newPhotos.length > 0) {
        const formData = new FormData();
        newPhotos.forEach((photo) => {
          formData.append("photos", photo.file);
        });

        const photoResponse = await apiFetch(
          `/toilet/${createdReviewId}/photos`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
          }
        );

        const photoResult = await photoResponse.json();

        if (!photoResponse.ok) {
          throw new Error(
            photoResult.message ||
              `리뷰는 등록되었으나, 사진 업로드에 실패했습니다.`
          );
        }

        console.log("[API] Photos Uploaded:", photoResult.data);

        const uploadedImages = photoResult.data; 
        
        if (Array.isArray(uploadedImages) && uploadedImages.length > 0) {
            const ids = uploadedImages.map(img => img.id || img.imageId); 
            
            console.log("[API] Extracted Image IDs:", ids);
            setPollingImageIds(ids); 
            setIsPollingImages(true); 
            
            setStatusModalMessage("이미지의 적합성을 검사 중입니다.");
            setStatusModalAction(null);
            setIsStatusModalOpen(true);
        } else {
             setStatusModalMessage("리뷰와 사진이 등록되었습니다.");
             setStatusModalAction(() => () => nav(-1));
             setIsStatusModalOpen(true);
        }
      } else {
        setStatusModalMessage("리뷰가 성공적으로 등록되었습니다.");
        setStatusModalAction(() => () => nav(-1));
        setIsStatusModalOpen(true);
      }
    } catch (err) {
      console.error(err);
      if (createdReviewId && err.message.includes("사진")) {
        setStatusModalMessage(err.message);
        setStatusModalAction(() => () => nav(-1));
        setIsStatusModalOpen(true);
      }
      else if (err.message.includes("다른 성별")) {
        setStatusModalMessage("다른 성별의 화장실 리뷰는 작성할 수 없습니다.");
        setStatusModalAction(null);
        setIsStatusModalOpen(true);
      }
      else {
        setStatusModalMessage(`등록 중 오류가 발생했습니다: ${err.message}`);
        setStatusModalAction(null);
        setIsStatusModalOpen(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isPollingImages || pollingImageIds.length === 0) {
      return;
    }

    console.log(`[Polling] Start polling for Image IDs: ${pollingImageIds.join(",")}`);

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setStatusModalMessage("이미지 검증을 위해 로그인이 필요합니다. 이전 페이지로 이동합니다.");
      setStatusModalAction(() => () => nav(-1));
      setIsStatusModalOpen(true);
      setIsPollingImages(false);
      return;
    }

    function makePollUrl(ids) {
      const queryString = ids.join(",");
      return `/reviews/image-status?imageIds=${queryString}`;
    }

    let pollCount = 0;
    const MAX_POLLS = 20;
    const POLLING_INTERVAL = 3000;

    const intervalId = setInterval(async () => {
      pollCount++;
      console.log(`[Polling] Attempt ${pollCount}...`);

      try {
        const pollUrl = makePollUrl(pollingImageIds);
        const response = await apiFetch(pollUrl, {
          method: "GET",
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.status === 401 || response.status === 403) {
            throw new Error("로그인이 필요하거나 권한이 없습니다.");
        }
        if (!response.ok) {
            throw new Error(`이미지 상태 확인 실패: HTTP ${response.status}`);
        }

        const result = await response.json();
        
        const statuses = result?.data?.imageStatuses;

        if (!Array.isArray(statuses)) {
          if (pollCount > MAX_POLLS) throw new Error("데이터 형식이 올바르지 않습니다.");
          return;
        }

        const isStillPending = statuses.some((img) => img.status === "PENDING");

        if (isStillPending) {
          console.log("[Polling] Still PENDING...");
          if (pollCount > MAX_POLLS) {
            throw new Error("이미지 검증 시간이 초과되었습니다.");
          }
          return;
        }

        clearInterval(intervalId);
        setIsPollingImages(false);

        const rejectedCount = statuses.filter((img) => img.status === "REJECTED").length;

        if (rejectedCount > 0) {
          setStatusModalMessage(`업로드한 사진 중 ${rejectedCount}장이\n등록 기준에 맞지 않습니다.`);
        } else {
          setStatusModalMessage("이미지 검수 완료! 등록되었습니다.");
        }
        setStatusModalAction(() => () => nav(-1));
        setIsStatusModalOpen(true);

      } catch (err) {
        console.error("[Polling] Error:", err);
        clearInterval(intervalId);
        setIsPollingImages(false);
        setStatusModalMessage(`이미지 검증 중 오류: ${err.message}`);
        setStatusModalAction(() => () => nav(-1));
        setIsStatusModalOpen(true);
      }
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [isPollingImages, pollingImageIds, nav]);
  if (!toilet) {
    return (
      <div className="write-review-page">
        <TopHeader />
        <p style={{ padding: "20px", textAlign: "center" }}>
          화장실 정보를 불러오는 중...
        </p>
      </div>
    );
  }

  return (
    <div className="write-review-page">
      <AlertModal
        isOpen={isModalOpen}
        message="최대 3개까지 선택 가능합니다."
        onClose={() => setIsModalOpen(false)}
      />

      <AlertModal
        isOpen={isStatusModalOpen}
        message={statusModalMessage}
        onClose={() => {
          setIsStatusModalOpen(false);
          if (typeof statusModalAction === "function") {
            statusModalAction();
          }
          setStatusModalAction(null);
          setStatusModalMessage("");
        }}
      />

      <TopHeader />

      <form id="review-form" className="er-form" onSubmit={handleSubmit} noValidate>
        <div className="er-field">
          <div className="er-review-info">
            <h3>{toilet.name}</h3>
            <p>
              {toilet.line}호선
              <span className="er-review-info-divider">·</span>
              {toilet.gender === "FEMALE" || toilet.gender === "F" ? (
                <span className="fe" style={{ color: "#E13A6E" }}>
                  {" "}
                  여자{" "}
                </span>
              ) : (
                <span className="ma" style={{ color: "#0D6EFD" }}>
                  {" "}
                  남자{" "}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="er-field">
          <label className="er-label-star">
            {renderStars(star, setStar, 40)}
            {errors.star && <p className="er-err">{errors.star}</p>}
          </label>
        </div>
        <img src={ad} width="100%" alt="" />
        <div className="er-field">
          <label className="er-label">
            장애인 화장실에 대한 리뷰라면 클릭!
          </label>
          <div className="er-tags" role="group" aria-label="장애인 편의시설 선택">
            <button
              type="button"
              className={`er-tag ${isDisability ? "is-selected" : ""}`}
              id="disabled"
              aria-pressed={isDisability}
              onClick={() => setIsDisability((prev) => !prev)}
            >
              장애인 화장실
            </button>
          </div>
        </div>
        <div className="er-field">
          <label className="er-label">만족스러워요</label>
          <div className="er-tags" role="group" aria-label="긍정 리뷰 태그 선택">
            {POSITIVE_TAG_KEYS.map((key) => {
              const selected = selectedTags.has(key);
              return (
                <button
                  key={key}
                  type="button"
                  className={`er-tag ${selected ? "is-selected" : ""}`}
                  aria-pressed={selected}
                  onClick={() => toggleTag(key)}
                >
                  {tagMap[key]}
                </button>
              );
            })}
          </div>
        </div>
        <div className="er-field">
          <label className="er-label">개선이 필요해요</label>
          <div className="er-tags" role="group" aria-label="부정 리뷰 태그 선택">
            {NEGATIVE_TAG_KEYS.map((key) => {
              const selected = selectedTags.has(key);
              return (
                <button
                  key={key}
                  type="button"
                  className={`er-tag ${selected ? "is-selected" : ""}`}
                  aria-pressed={selected}
                  onClick={() => toggleTag(key)}
                >
                  {tagMap[key]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="er-field">
          <label htmlFor={`${uid}-desc`} className="er-label" />

          <div
            className={`er-textarea-wrapper ${
              errors.desc ? "er-input-err" : ""
            }`}
          >
            <div className="er-photo-previews">
              {newPhotos.map((photo, index) => (
                <div key={index} className="er-preview-item">
                  <img
                    src={photo.preview}
                    alt="새 이미지 미리보기"
                    className="er-preview-img"
                  />
                  <button
                    type="button"
                    className="er-preview-delete"
                    onClick={() => handleDeleteNew(index)}
                    aria-label="새 이미지 삭제"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <textarea
              id={`${uid}-desc`}
              className="er-textarea"
              placeholder="리뷰를 작성해주세요"
              maxLength={MAX_DESC}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={6}
            />

            <div className="er-textarea-footer">
              <button
                type="button"
                className="er-photo-upload-btn"
                onClick={handlePhotoUploadClick}
                aria-label="사진 업로드"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M4.68001 16.6666C4.29612 16.6666 3.97584 16.5383 3.71918 16.2816C3.46251 16.0249 3.3339 15.7044 3.33334 15.3199V4.67992C3.33334 4.29603 3.46195 3.97575 3.71918 3.71909C3.9764 3.46242 4.29668 3.33381 4.68001 3.33325H15.3208C15.7042 3.33325 16.0245 3.46186 16.2817 3.71909C16.5389 3.97631 16.6672 4.29659 16.6667 4.67992V15.3208C16.6667 15.7041 16.5383 16.0244 16.2817 16.2816C16.025 16.5388 15.7045 16.6671 15.32 16.6666H4.68001ZM4.68001 15.8333H15.3208C15.4486 15.8333 15.5661 15.7799 15.6733 15.6733C15.7806 15.5666 15.8339 15.4488 15.8333 15.3199V4.67992C15.8333 4.55159 15.78 4.43381 15.6733 4.32659C15.5667 4.21936 15.4489 4.16603 15.32 4.16659H4.68001C4.55168 4.16659 4.4339 4.21992 4.32668 4.32659C4.21945 4.43325 4.16612 4.55103 4.16668 4.67992V15.3208C4.16668 15.4485 4.22001 15.566 4.32668 15.6733C4.43334 15.7805 4.55084 15.8338 4.67918 15.8333M6.92334 13.7499H13.205C13.34 13.7499 13.4383 13.6896 13.5 13.5691C13.5617 13.4485 13.5533 13.3291 13.475 13.2108L11.7917 10.9508C11.7195 10.8608 11.6297 10.8158 11.5225 10.8158C11.4158 10.8158 11.3261 10.8608 11.2533 10.9508L9.34334 13.3658L8.15418 11.9283C8.0814 11.8488 7.99418 11.8091 7.89251 11.8091C7.7914 11.8091 7.70445 11.8541 7.63168 11.9441L6.67001 13.2108C6.58001 13.3291 6.56612 13.4485 6.62834 13.5691C6.69057 13.6896 6.7889 13.7499 6.92334 13.7499Z"
                    fill="#4860BE"
                  />
                </svg>
              </button>

              <span className="er-count">
                {desc.length}/{MAX_DESC}
              </span>
            </div>
          </div>

          {errors.desc && <p className="er-err">{errors.desc}</p>}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          style={{ display: "none" }}
          aria-hidden="true"
        />
      </form>

      <div className="er-footer">
        <button
          type="button"
          className="er-btn er-ghost"
          onClick={() => nav(-1)}
          disabled={submitting || isPollingImages}
        >
          취소
        </button>
        <button
          type="submit"
          className="er-btn er-primary"
          form="review-form"
          disabled={submitting || isPollingImages}
        >
          {submitting
            ? "등록 중..."
            : isPollingImages
            ? "이미지 검증 중..."
            : "등록 완료"}
        </button>
      </div>
    </div>
  );
}
