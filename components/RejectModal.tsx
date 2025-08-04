'use client';

import React, { useState } from "react";
import styles from "@/components/RejectModal.module.css";

type Task = {
  upload?: string;
  who: string;
  period: string;
};

type RejectModalProps = {
  isOpen: boolean;
  task: Task;
  clientName: string;
  onClose: () => void;
  onSubmit: (reason: string) => void;
};

const RejectModal: React.FC<RejectModalProps> = ({ isOpen, task, clientName, onClose, onSubmit }) => {
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(reason);
    setReason("");
    onClose();
  };

  const formatFilename = (url?: string) => {
    if (!url) return "";

    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const withoutExtension = filename.replace('.pdf', '');
    const nameWithoutId = withoutExtension.replace(/^[0-9]+_/, '');
    const cleaned = nameWithoutId.replace(/-/g, '_');

    return cleaned.length > 7 ? cleaned.slice(0, 7) + "..." : cleaned;
  };



  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <p>
          Hello Mr. <span>{clientName}</span>, your uploaded PDF file{" "}
          <span>
          {formatFilename(task.upload)}{" "}
          <a href={task.upload} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#007BFF', textDecoration: 'underline' }}>
            ver
          </a>
        </span>

          {" "}
          is rejected because of:
        </p>
        <form onSubmit={handleSubmit}>
          <textarea
            required
            placeholder="Type reason here..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className={styles.textarea}
            onClick={(e) => e.stopPropagation()}
          />
          <p>
            Please upload a new PDF file for <strong>{task.who}</strong> before{" "}
            <strong>{new Date(task.period).toLocaleDateString("en-GB")}</strong>.
          </p>
          <div className={styles.modalActions}>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">
              <span>Send</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M7.93665 16.25L13.1866 11L7.93665 5.75" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectModal;
