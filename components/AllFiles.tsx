/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState } from "react";
import { useLanguage } from "@/src/app/contexts/LanguageContext";
import { dictionaries } from "@/src/app/contexts/dictionaries";
import "./AllFiles.css";

type Task = {
  _id: string;
  client_id: string;
  accountant_id: string;
  upload?: string;
  guide?: string;
  who: string;
  period: string;
};

type FileItem = {
  _id: string;
  url: string;
  client_id: string;
  description?: string;
  createdAt?: string;
};

export default function AllFiles() {
  const { language } = useLanguage();
  const t = (key: string) => dictionaries[language]?.[key] || key;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [view, setView] = useState<"files" | "tasks">("tasks");

  const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;
  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
  const accId = typeof window !== "undefined" ? localStorage.getItem("acc_id") : null;

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (view === "files") {
      fetchFiles();
    }
  }, [view]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data.tasks);
    } catch (err) {
      console.error("Erro ao buscar tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/files");
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err) {
      console.error("Erro ao buscar files:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (taskId: string, fileType: "upload" | "guide") => {
    const confirmDelete = confirm("Are you sure you want to delete this file?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/remove-file`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, fileType }),
      });

      if (res.ok) {
        setTasks(prev =>
          prev.map(task =>
            task._id === taskId ? { ...task, [fileType]: undefined } : task
          )
        );
      } else {
        alert("Error removing file");
      }
    } catch (err) {
      console.error("Error removing file:", err);
    }
  };

  // Filtro só para tasks, files pode mostrar tudo que vem da API
  const filteredTasks = tasks.filter((task) => {
    if (!task.guide && !task.upload) return false;

    if (role === "admin") return true;

    if (role === "accountant") return task.accountant_id === userId;

    if (role === "client") {
      return task.client_id === userId || task.accountant_id === accId;
    }

    return false;
  });

  return (
    <div className="files-overview">
      <div className="files-header">
        <h1>{t("fileArchiveTitle")}</h1>
        <div className="btns-choose">
          <button
            className={`btn-choose ${view === "files" ? "active" : ""}`}
            onClick={() => setView("files")}
          >
            Files
          </button>
          <button
            className={`btn-choose ${view === "tasks" ? "active" : ""}`}
            onClick={() => setView("tasks")}
          >
            Tasks
          </button>
        </div>
      </div>

      {loading ? (
        <p>{t("loadingFiles")}</p>
      ) : view === "tasks" ? (
        filteredTasks.length === 0 ? (
          <p>{t("noProofAvailable")}</p>
        ) : (
          <ul className="files-items">
            {filteredTasks.map((task) => (
              <li key={task._id}>
                {["upload", "guide"].map((type) => {
                  const file = task[type as "upload" | "guide"];
                  if (!file) return null;

                  return (
                    <div className="file-item" key={type}>
                      <a href={file} target="_blank" rel="noreferrer">
                        {type === "guide"
                          ? `${t("guide")}_${task.who}_${task.period}`
                          : `${t("proof")}_${task.who}_${task.period}`}
                      </a>

                      <span>{file.split(".").pop()?.toUpperCase()}</span>
                      <div onClick={() => setPreviewUrl(file)} className="quick-preview-btn">
                        <img src="/eye.svg" alt="eye" />
                        <span>{t("quickPreview")}</span>
                      </div>
                      <button
                        className="remove-btn"
                        onClick={() => handleRemove(task._id, type as "upload" | "guide")}
                      >
                        <img src="/trash.svg" alt="remove" />
                        <span>{t("removeFile")}</span>
                      </button>
                    </div>
                  );
                })}
              </li>
            ))}
          </ul>
        )
      ) : view === "files" ? (
        files.length === 0 ? (
          <p>{t("noProofAvailable")}</p>
        ) : (
          <ul className="files-items">
            {files.map((file) => {
              const fileName = file.url.split("/").pop() || "file";

              return (
                <li key={file._id}>
                  <div className="file-item">
                    <a href={file.url} target="_blank" rel="noreferrer">
                      {file.description || fileName}
                    </a>
                    <span>{fileName.split(".").pop()?.toUpperCase()}</span>
                    <div onClick={() => setPreviewUrl(file.url)} className="quick-preview-btn">
                      <img src="/eye.svg" alt="eye" />
                      <span>{t("quickPreview")}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )
      ) : null}

      {/* Modal de preview */}
      {previewUrl && (
        <div className="modal-overlay" onClick={() => setPreviewUrl(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <iframe src={previewUrl} width="100%" height="600px" />
            <button className="close-btn" onClick={() => setPreviewUrl(null)}>
              {t("close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
