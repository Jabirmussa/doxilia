/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState } from "react";
import "./AllFiles.css";

type Task = {
  _id: string;
  client_id: string;
  accountant_id: string;
  upload?: string;
  guide?: string;
};

export default function AllFiles() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;
  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
  const accId = typeof window !== "undefined" ? localStorage.getItem("acc_id") : null;

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
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

  const handleRemove = async (taskId: string, fileType: "upload" | "guide") => {
    const confirmDelete = confirm("Tens certeza que queres apagar esse ficheiro?");
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
        alert("Erro ao remover o ficheiro");
      }
    } catch (err) {
      console.error("Erro ao remover o ficheiro:", err);
    }
  };

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
      <h1>📄 Filearchive overzicht</h1>

      {loading ? (
        <p>Carregando arquivos...</p>
      ) : filteredTasks.length === 0 ? (
        <p>Nenhum comprovativo disponível.</p>
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
                      {file.split("_").slice(1).join("_")}
                    </a>
                    <span>PDF</span>
                    <div onClick={() => setPreviewUrl(file)} className="quick-preview-btn">
                      <img src="/eye.svg" alt="eye" />
                      <span>Quick preview</span>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemove(task._id, type as "upload" | "guide")}
                    >
                      <img src="/trash.svg" alt="remove" />
                      <span>Remove file</span>
                    </button>
                  </div>
                );
              })}
            </li>
          ))}
        </ul>
      )}

      {/* Modal de preview */}
      {previewUrl && (
        <div className="modal-overlay" onClick={() => setPreviewUrl(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <iframe src={previewUrl} width="100%" height="600px" />
            <button className="close-btn" onClick={() => setPreviewUrl(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
