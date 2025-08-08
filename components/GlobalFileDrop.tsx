"use client";
import { useState, useEffect } from "react";
import AddDocument from "@/components/AddDocument";
import UploadFile from "@/components/UploadFile";

export default function GlobalFileDrop() {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(true); // Mostra a tela de UploadFile
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault(); // Necessário pra permitir drop
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      // Só fecha se realmente saiu da tela
      if (e.relatedTarget === null || (e.clientX <= 0 && e.clientY <= 0)) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (!e.dataTransfer || !e.dataTransfer.files.length) return;
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);

      let prog = 0;
      const interval = setInterval(() => {
        prog += 15;
        setProgress(prog);
        if (prog >= 100) {
          clearInterval(interval);
          setShowAddDocument(true);
        }
      }, 100);
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  if (showAddDocument && selectedFile) {
    return (
      <AddDocument
        onClose={() => {
          setShowAddDocument(false);
          setProgress(0);
          setSelectedFile(null);
        }}
        prefilledFile={selectedFile}
      />
    );
  }

  return (
    <>
      {isDragging && !showAddDocument && (
        <div className="global-drop-overlay">
          {progress > 0 ? (
            <div className="progress-bar">
              <div className="progress" style={{ width: `${progress}%` }} />
            </div>
          ) : (
            <UploadFile />
          )}
        </div>
      )}
    </>
  );
}
