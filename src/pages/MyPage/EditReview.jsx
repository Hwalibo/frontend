// src/pages/MyPage/EditReview.jsx
import React, { useId, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopHeader from "../../components/layout/TopHeader";
import star_yell from "../../assets/star/star-yell.svg";
import star_grey from "../../assets/star/star-grey.svg";
import "./EditReview.css";
import ad from "../../assets/MyPage/ad_edit.svg";
import AlertModal from "../../components/layout/AlertModal";
import apiFetch from "../../api";

const API_URL = import.meta.env.VITE_APP_BACKEND_URL;
const BACKEND_ON = true;

const renderStars = (star, onChange, size = 40) => {
  return (
    <div className="star-container er-stars" role="radiogroup" aria-label="별점 선택">
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

export default function EditReview() {
  const location = useLocation();
  const nav = useNavigate();

  const initialReview = location.state?.review;

  // 공용 모달
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalCloseAction, setModalCloseAction] = useState(null);
  const openModal = (msg, action = null) => {
    console.log("[EditReview] openModal:", msg); // 🔍 디버그
    setModalMessage(msg);
    setModalCloseAction(() => action);
    setIsModalOpen(true);
  };
  const handleModalClose = () => {
    console.log("[EditReview] handleModalClose"); // 🔍 디버그
    setIsModalOpen(false);
    setModalMessage("");
    if (typeof modalCloseAction === "function") modalCloseAction();
    setModalCloseAction(null);
  };

  useEffect(() => {
    console.log("[EditReview] mount / initialReview:", initialReview); // 🔍 디버그
    if (!initialReview) {
      openModal("잘못된 접근입니다. 리뷰 정보가 없습니다.", () => nav("/mypage"));
    }
  }, [initialReview, nav]);

  const [star, setStar] = useState(
    typeof initialReview?.star === "number" ? initialReview.star : 0
  );
  const [description, setDescription] = useState(initialReview?.description ?? "");

  const [isDisability, setIsDisability] = useState(
    Boolean(initialReview?.isDis ?? initialReview?.dis ?? false)
  );

  const [selectedTags, setSelectedTags] = useState(
    new Set(
      Array.isArray(initialReview?.tag)
        ? initialReview.tag.filter((k) => tagMap[k])
        : []
    )
  );

  const [existingPhotos, setExistingPhotos] = useState(initialReview?.photo ?? []);
  // newPhotos: { file, preview, imageId? }
  const [newPhotos, setNewPhotos] = useState([]);

  const fileInputRef = useRef(null);
  // 업로드한 사진 개수를 기억하기 위한 ref (로그 출력용)
  const uploadCountRef = useRef(0);

  const MAX_PHOTOS = 2;

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const uid = useId();
  const MAX_DESC = 1000;

  // 🚀 이미지 검증(PENDING) 폴링 상태
  const [isPollingImages, setIsPollingImages] = useState(false);
  // 새로 업로드된 이미지들의 imageId 목록
  const [uploadedImageIds, setUploadedImageIds] = useState([]);

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
          openModal("최대 3개까지 선택 가능합니다.");
          return prev;
        }
      }
    });
  };

  const validate = () => {
    const next = {};
    if (!star || star <= 0) next.star = "별점을 선택하세요.";
    if (description.length > MAX_DESC) {
      next.desc = `설명은 ${MAX_DESC}자 이내로 입력하세요.`;
    }
    setErrors(next);
    console.log("[EditReview] validate errors:", next); // 🔍 디버그
    return Object.keys(next).length === 0;
  };

  const handlePhotoUploadClick = () => {
    console.log(
      "[EditReview] handlePhotoUploadClick existing/new:",
      existingPhotos.length,
      newPhotos.length
    ); // 🔍 디버그

    if (existingPhotos.length + newPhotos.length >= MAX_PHOTOS) {
      openModal(`사진은 최대 ${MAX_PHOTOS}장까지 업로드할 수 있습니다.`);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    console.log("[EditReview] handleFileChange files:", files); // 🔍 디버그
    if (files.length === 0) return;

    const currentTotal = existingPhotos.length + newPhotos.length;
    const remainingSlots = MAX_PHOTOS - currentTotal;

    if (files.length > remainingSlots) {
      openModal(`최대 ${MAX_PHOTOS}장까지 업로드 가능합니다.`);
    }

    const filesToAdd = files.slice(0, remainingSlots).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setNewPhotos((prev) => [...prev, ...filesToAdd]);

    if (event.target) {
      event.target.value = null;
    }
  };

  // ✅ 기존 이미지 삭제 시, 즉시 백엔드에 삭제 요청
  const handleDeleteExisting = async (idToDelete) => {
    console.log("[EditReview] handleDeleteExisting:", idToDelete); // 🔍 디버그

    if (!BACKEND_ON) {
      setExistingPhotos((prev) => prev.filter((photo) => photo.id !== idToDelete));
      openModal("이미지가 삭제된 것처럼 처리되었습니다. (mock 모드)");
      return;
    }

    if (!API_URL) {
      openModal("백엔드 URL이 설정되지 않았습니다.");
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      openModal("로그인 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    try {
      const deletePayload = { deletedImageIds: [idToDelete] };
      const deleteFormData = new FormData();
      deleteFormData.append(
        "request",
        new Blob([JSON.stringify(deletePayload)], { type: "application/json" })
      );

      const deleteRes = await apiFetch(`/user/review/${initialReview.id}/photos`, {
        method: "PATCH",
        body: deleteFormData,
      });

      const deleteText = await deleteRes.text();
      let deleteData = {};
      try {
        deleteData = JSON.parse(deleteText);
      } catch (_) {
        // 빈 응답일 수도 있으므로 조용히 무시
      }

      console.log("[EditReview] deleteRes status:", deleteRes.status); // 🔍
      console.log("[EditReview] deleteData:", deleteData); // 🔍

      if (!deleteRes.ok || deleteData?.success === false) {
        throw new Error(
          deleteData?.message || "이미지 삭제 중 오류가 발생했습니다."
        );
      }

      setExistingPhotos((prev) => prev.filter((photo) => photo.id !== idToDelete));
      openModal("이미지가 삭제되었습니다.");
    } catch (err) {
      console.error("이미지 삭제 실패:", err);
      openModal(err.message || "이미지 삭제 중 오류가 발생했습니다.");
    }
  };

  // ✅ 프론트엔드에서 새 이미지 삭제 (전송 목록에서 제외됨)
  const handleDeleteNew = (indexToRemove) => {
    console.log("[EditReview] handleDeleteNew index:", indexToRemove); // 🔍

    setNewPhotos((prev) => {
      const next = [...prev];
      const [removed] = next.splice(indexToRemove, 1);
      if (removed) URL.revokeObjectURL(removed.preview);
      return next;
    });
  };

  // 언마운트 시 전체 revoke (기존 로직 유지, 동작에는 영향 없음)
  useEffect(() => {
    return () => {
      console.log("[EditReview] cleanup revokeObjectURL", newPhotos.length); // 🔍
      newPhotos.forEach((p) => URL.revokeObjectURL(p.preview));
    };
  }, [newPhotos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[EditReview] handleSubmit start"); // 🔍

    if (!validate() || !initialReview) {
      console.log("[EditReview] handleSubmit blocked by validate/initialReview"); // 🔍
      return;
    }

    if (!BACKEND_ON) {
      try {
        setSubmitting(true);
        await new Promise((r) => setTimeout(r, 1000));
        openModal("리뷰가 수정되었습니다. (mock 모드)", () => nav(-1));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!API_URL) {
      openModal("백엔드 URL이 설정되지 않았습니다.");
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      openModal("로그인 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    setSubmitting(true);

    try {
      // 1) 리뷰 본문 수정
      const reviewPayload = {
        star: Number(star),
        description: description.trim(),
        tag: Array.from(selectedTags),
        isDis: Boolean(isDisability),
      };

      console.log("[EditReview] PATCH review payload:", reviewPayload); // 🔍

      const reviewRes = await apiFetch(`/user/review/${initialReview.id}`, {
        method: "PATCH",
        body: JSON.stringify(reviewPayload),
      });

      const reviewData = await reviewRes.json().catch(() => ({}));
      console.log("[EditReview] reviewRes status:", reviewRes.status); // 🔍
      console.log("[EditReview] reviewData:", reviewData); // 🔍

      if (!reviewRes.ok || reviewData?.success === false) {
        throw new Error(reviewData?.message || "리뷰 수정 중 오류가 발생했습니다.");
      }

      // 2) 새 사진 업로드 (있을 때만)
      let uploadedNewPhotos = false;

      // [필터링] 화면에 남아있는 파일만 전송
      const validPhotos = newPhotos.filter((p) => p.file);
      console.log(
        "[EditReview] validPhotos.length / newPhotos.length:",
        validPhotos.length,
        newPhotos.length
      ); // 🔍

      if (validPhotos.length > 0) {
        const formData = new FormData();
        validPhotos.forEach((p) => formData.append("photos", p.file, p.file.name));

        console.log("[EditReview] PATCH photos - formData entries:", [...formData.entries()]); // 🔍

        const photosRes = await apiFetch(`/user/review/${initialReview.id}/photos`, {
          method: "PATCH",
          body: formData,
        });

        const photosData = await photosRes.json().catch(() => ({}));
        console.log("[EditReview] photosRes status:", photosRes.status); // 🔍
        console.log("[EditReview] photosData:", photosData); // 🔍

        if (!photosRes.ok || photosData?.success === false) {
          throw new Error(
            photosData?.message || "리뷰 이미지 수정(업로드) 중 오류가 발생했습니다."
          );
        }

        // 📌 서버에서 내려주는 imageId 저장
        const createdPhotos = photosData?.data?.createdPhotos ?? [];
        console.log("[EditReview] createdPhotos:", createdPhotos); // 🔍

        const imageIdsFromServer = createdPhotos
          .map((c) => c.imageId)
          .filter((id) => id !== null && id !== undefined);
        console.log("[EditReview] imageIdsFromServer:", imageIdsFromServer); // 🔍

        // index 매핑을 이용해 newPhotos에 imageId 부여
        if (createdPhotos.length > 0) {
          setNewPhotos((prev) =>
            prev.map((photo, idx) => {
              const matched = createdPhotos.find((c) => c.index === idx);
              return matched ? { ...photo, imageId: matched.imageId } : photo;
            })
          );
        }

        if (imageIdsFromServer.length > 0) {
          uploadedNewPhotos = true;

          // 폴링 로그를 위해 업로드한 개수 저장 (imageId 기준)
          uploadCountRef.current = imageIdsFromServer.length;

          // 폴링에 사용할 imageId 배열 저장
          setUploadedImageIds(imageIdsFromServer);

          console.log(
            "[EditReview] Start polling with imageIds:",
            imageIdsFromServer
          ); // 🔍

          // ✅ 업로드 성공 → 이미지 적합성 검증 폴링 시작
          setIsPollingImages(true);
          openModal("이미지의 적합성을 검사 중입니다.");
        } else {
          // createdPhotos가 비어있다면, 이미지 검수 없이 바로 완료 처리
          console.log(
            "[EditReview] createdPhotos 비어있음 → 이미지 검수 없이 완료"
          ); // 🔍
          openModal("리뷰가 수정되었습니다. \n 리뷰 목적에 맞지 않은 이미지는 삭제처리 될 수 있습니다.", () => nav(-1));
        }
      }

      // 새 사진이 없으면 즉시 완료 처리
      if (!uploadedNewPhotos && validPhotos.length === 0) {
        console.log(
          "[EditReview] 새 사진 없음 → 리뷰 수정만 완료"
        ); // 🔍
        openModal("리뷰가 수정되었습니다.", () => nav(-1));
      }
    } catch (err) {
      console.error("[EditReview] handleSubmit error:", err);
      openModal(`수정 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 🚀 새 이미지에 대한 “검수(PENDING)” 폴링: /api/v1/reviews/image-status?imageIds=101,102
  useEffect(() => {
    console.log(
      "[EditReview] polling effect deps changed:",
      "isPollingImages=",
      isPollingImages,
      "uploadedImageIds=",
      uploadedImageIds
    ); // 🔍

    if (!isPollingImages || uploadedImageIds.length === 0) return;

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      openModal("이미지 검증을 위해 로그인이 필요합니다.", () => nav(-1));
      setIsPollingImages(false);
      return;
    }

    if (!API_URL) {
      openModal("백엔드 URL이 설정되지 않아 이미지 검수를 진행할 수 없습니다.", () => nav(-1));
      setIsPollingImages(false);
      return;
    }

    function makePollUrl(imageIds) {
      const base = (API_URL || "").replace(/\/+$/, "");
      const query = imageIds.map((id) => encodeURIComponent(id)).join(",");
      // /api/v1/reviews/image-status?imageIds=101,102
      return `${base}/api/v1/reviews/image-status?imageIds=${query}`;
    }

    let pollCount = 0;
    const MAX_POLLS = 30;
    const POLLING_INTERVAL = 3000;

    const url = makePollUrl(uploadedImageIds);

    console.groupCollapsed(
      `%c[Polling] Start EditReview (imageIds=${uploadedImageIds.join(",")})`,
      "color:#16a34a;font-weight:600"
    );

    const intervalId = setInterval(async () => {
      pollCount++;

      console.log(
        `%c[펜딩 요청] %c상태 확인 요청 (시도 ${pollCount}) - 대상: ${
          uploadCountRef.current
        }장 \nURL: ${url}`,
        "color: #f59e0b; font-weight: bold; font-size: 12px;",
        "color: #333;"
      );

      try {
        const res = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.status === 401 || res.status === 403) {
          throw new Error("로그인이 필요하거나 권한이 없습니다.");
        }
        if (!res.ok) {
          throw new Error(`이미지 상태 확인 실패: HTTP ${res.status}`);
        }

        const result = await res.json();

        console.log(
          `%c[API 응답] %c${res.status} ${res.statusText}`,
          "color: #9333ea; font-weight: bold;",
          "color: #333;"
        );
        console.log(`%c[응답 데이터]`, "color: #9333ea; font-weight: bold;", result);

        let statuses = [];
        if (Array.isArray(result?.data?.imageStatuses)) {
          statuses = result.data.imageStatuses;
        } else if (Array.isArray(result?.data)) {
          statuses = result.data;
        }

        console.log("[Polling] raw statuses:", statuses); // 🔍

        if (!Array.isArray(statuses) || statuses.length === 0) {
          console.log("[Polling] statuses empty → keep waiting…");
          if (pollCount > MAX_POLLS) {
            throw new Error("이미지 상태 정보를 받지 못했습니다. (타임아웃)");
          }
          return;
        }

        // 혹시라도 다른 imageId가 섞여 있을 경우에 대비해 내가 보낸 imageId만 필터
        statuses = statuses.filter((s) => uploadedImageIds.includes(s.imageId));

        const normalized = statuses.map((s) => {
          const norm = String(s.status || "").toUpperCase().trim();

          const isPending =
            norm === "PENDING" ||
            norm === "IN_REVIEW" ||
            norm.includes("PENDING");

          const isRejected =
            norm === "REJECTED" ||
            norm === "REJECT" ||
            norm.includes("REJECT"); // REJECTED_IMAGE 같은 것도 잡기

          const isApproved =
            norm === "APPROVED" ||
            norm === "ALLOW" ||
            norm.includes("APPROVED");

          return {
            ...s,
            _statusNorm: norm,
            _isPending: isPending,
            _isRejected: isRejected,
            _isApproved: isApproved,
          };
        });

        console.log("[Polling] normalized statuses:");
        console.table(normalized); // 🔍 더 보기 좋게

        const pending = normalized.filter((s) => s._isPending).length;
        const rejected = normalized.filter((s) => s._isRejected).length;
        const approved = normalized.filter((s) => s._isApproved).length;

        console.log(
          `%c[상태 요약] %c대기: ${pending} | 승인: ${approved} | 거절: ${rejected}`,
          "color: #2563eb; font-weight: bold;",
          "color: #333;"
        );

        if (pending > 0) {
          if (pollCount > MAX_POLLS) {
            throw new Error("이미지 검증 시간이 초과되었습니다. 관리자에게 문의하세요.");
          }
          // 계속 폴링
          return;
        }

        // 여기까지 왔다는 건 PENDING 0 → 모두 확정 상태
        clearInterval(intervalId);
        setIsPollingImages(false);
        console.log("[Polling] Branch = DONE. Stop interval.");
        console.groupEnd();

        if (rejected > 0) {
          console.log("[Polling] Branch = REJECTED 포함됨.");

          const rejectedIds = normalized
            .filter((s) => s._isRejected)
            .map((s) => s.imageId);

          console.log("[Polling] rejectedIds:", rejectedIds); // 🔍

          // 📌 REJECTED가 뜬 이미지들만 프론트에서 제거
          setNewPhotos((prev) =>
            prev.filter((p) => !rejectedIds.includes(p.imageId))
          );
          setUploadedImageIds((prev) =>
            prev.filter((id) => !rejectedIds.includes(id))
          );

          // 👉 리뷰 저장 + 부적합 이미지 삭제를 한 번에 안내
          openModal(
            "리뷰가 저장되었습니다.\n리뷰 작성에 알맞지 않은 이미지는 삭제 처리 되었습니다.",
            () => nav(-1)
          );
        } else {
          console.log("[Polling] Branch = ALL APPROVED");
          openModal("리뷰가 저장되었습니다.", () => nav(-1));
        }
      } catch (err) {
        console.error("[Polling] Error:", err);
        clearInterval(intervalId);
        setIsPollingImages(false);
        console.groupEnd();
        openModal(
          `리뷰는 수정되었으나, 이미지 검증 중 오류가 발생했습니다: ${err.message}`,
          () => nav(-1)
        );
      }
    }, POLLING_INTERVAL);

    return () => {
      console.log("[Polling] Cleanup. Clearing interval.");
      clearInterval(intervalId);
    };
  }, [isPollingImages, uploadedImageIds, nav]);

  if (!initialReview) {
    return (
      <div className="edit-review-page">
        <TopHeader />
        <p style={{ padding: "20px", textAlign: "center" }}>리뷰 정보를 불러오는 중...</p>
        <AlertModal
          isOpen={isModalOpen}
          message={modalMessage}
          onClose={handleModalClose}
        />
      </div>
    );
  }

  return (
    <div className="edit-review-page">
      <AlertModal isOpen={isModalOpen} message={modalMessage} onClose={handleModalClose} />

      <TopHeader />

      <form id="review-form" className="er-form" onSubmit={handleSubmit} noValidate>
        {/* 화장실 정보 */}
        <div className="er-field">
          <div className="er-review-info">
            <h3>{initialReview.name}</h3>
            <p>
              {initialReview.line}호선
              <span className="er-review-info-divider">·</span>
              {initialReview.gender === "FEMALE" ? (
                <span className="fe" style={{ color: "#E13A6E" }}>여자</span>
              ) : (
                <span className="ma" style={{ color: "#0D6EFD" }}>남자</span>
              )}
            </p>
          </div>
        </div>

        {/* 별점 */}
        <div className="er-field">
          <label className="er-label-star">
            {renderStars(star, setStar)}
            {errors.star && <p className="er-err">{errors.star}</p>}
          </label>
        </div>

        <img src={ad} width="100%" alt="" />

        {/* 장애인 화장실 태그 */}
        <div className="er-field">
          <label className="er-label">장애인 화장실에 대한 리뷰라면 클릭!</label>
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

        {/* 긍정 태그 */}
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleTag(key);
                    }
                  }}
                  title={key}
                >
                  {tagMap[key]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 부정 태그 */}
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleTag(key);
                    }
                  }}
                  title={key}
                >
                  {tagMap[key]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 리뷰 내용 + 사진 */}
        <div className="er-field">
          <label htmlFor={`${uid}-desc`} className="er-label" />
          <div className={`er-textarea-wrapper ${errors.desc ? "er-input-err" : ""}`}>
            <div className="er-photo-previews">
              {existingPhotos.map((photo) => (
                <div key={photo.id} className="er-preview-item">
                  <img src={photo.url} alt="기존 이미지" className="er-preview-img" />
                  <button
                    type="button"
                    className="er-preview-delete"
                    onClick={() => handleDeleteExisting(photo.id)}
                    aria-label="기존 이미지 삭제"
                  >
                    ×
                  </button>
                </div>
              ))}
              {newPhotos.map((photo, index) => (
                <div key={photo.preview} className="er-preview-item">
                  <img src={photo.preview} alt="새 이미지 미리보기" className="er-preview-img" />
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                    d="M4.68001 16.6666C4.29612 16.6666 3.97584 16.5383 3.71918 16.2816C3.46251 16.0249 3.3339 15.7044 3.33334 15.3199V4.67992C3.33334 4.29603 3.46195 3.97575 3.71918 3.71909C3.9764 3.46242 4.29668 3.33381 4.68001 3.33325H15.3208C15.7042 3.33325 16.0245 3.46186 16.2817 3.71909C16.5389 3.97631 16.6672 4.29659 16.6667 4.67992V15.3208C16.6667 15.7041 16.5383 16.0244 16.2817 16.2816C16.025 16.5388 15.7045 16.6671 15.32 16.6666H4.68001ZM4.68001 15.8333H15.3208C15.4486 15.8333 15.5661 15.7799 15.6733 15.6733C15.7806 15.5666 15.8339 15.4488 15.8333 15.3199V4.67992C15.8333 4.55159 15.78 4.43381 15.6733 4.32659C15.5667 4.21936 15.4489 4.16603 15.32 4.16659H4.68001C4.55168 4.16669 4.4339 4.21992 4.32668 4.32659C4.21945 4.43325 4.16612 4.55103 4.16668 4.67992V15.3208C4.16668 15.4485 4.22001 15.566 4.32668 15.6733C4.43334 15.7805 4.55084 15.8338 4.67918 15.8333M6.92334 13.7499H13.205C13.34 13.7499 13.4383 13.6896 13.5 13.5691C13.5617 13.4485 13.5533 13.3291 13.475 13.2108L11.7917 10.9508C11.7195 10.8608 11.6297 10.8158 11.5225 10.8158C11.4158 10.8158 11.3261 10.8608 11.2533 10.9508L9.34334 13.3658L8.15418 11.9283C8.0814 11.8488 7.99418 11.8091 7.89251 11.8091C7.7914 11.8091 7.70445 11.8541 7.63168 11.9441L6.67001 13.2108C6.58001 13.3291 6.56612 13.4485 6.62834 13.5691C6.69057 13.6896 6.7889 13.7499 6.92334 13.7499Z"
                    fill="#4860BE"
                  />
                </svg>
              </button>
              <span className="er-count">
                {description.length}/{MAX_DESC}
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
            ? "저장 중..."
            : isPollingImages
            ? "이미지 검증 중..."
            : "수정 완료"}
        </button>
      </div>
    </div>
  );
}
