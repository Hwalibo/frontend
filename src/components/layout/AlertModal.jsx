import React from "react";
import "./AlertModal.css";

export default function AlertModal({
  isOpen,
  message,
  onClose,          
  showCancel = false, 
  onCancel,         
}) {
  if (!isOpen) return null;

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <p className="modal-message">{message}</p>

        <div className="modal-buttons">
          {showCancel && (
            <button className="modal-button cancel" onClick={handleCancel}>
              취소
            </button>
          )}
          <button className="modal-button" onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
