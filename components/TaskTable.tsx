/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import toast from "react-hot-toast";
import React, { useEffect, useState } from "react";
import "./TaskTable.css";

type Task = {
  _id: string;
  status: string;
  client?: string;
  who: string;
  what: string;
  due_date: string;
  payment_id: string;
  amount: string;
  period: string;
  guide?: string;
  upload?: string;
  client_id?: string;
  accountant_id?: string;
};

type TaskTableProps = {
  type: "client" | "accountant";
};
const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;
const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
const accId = typeof window !== "undefined" ? localStorage.getItem("acc_id") : null;

const TaskTable: React.FC<TaskTableProps> = ({ type }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch("/api/tasks");
        if (!res.ok) throw new Error("Erro ao buscar tasks");

        const data = await res.json();

        const filtered = data.tasks.filter((task: Task) => {
          if (role === "admin") return true;
          if (role === "accountant") return task.accountant_id === userId;
          if (role === "client") return task.client_id === userId || task.accountant_id === accId;
          return false;
        });

        setTasks(filtered);
      } catch (err) {
        console.error("Erro no fetch de tasks", err);
      }
    }

    fetchTasks();
  }, []);


  const handleToggle = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };
  function formatPeriod(dateString: string) {
  const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`Payment id Copied: ${text}`);
    }).catch(() => {
      alert("Failed to copy");
    });
  };

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    taskId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/tasks/upload/${taskId}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) throw new Error("Erro no upload");

      const data = await res.json();
      toast.success("Arquivo enviado com sucesso!");

      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t._id === taskId ? { ...t, upload: data.uploadLink } : t
        )
      );
    } catch (err) {
      toast.error("Erro ao fazer upload");
      console.error(err);
    }
  };

  return (
    <div className="task-list">
      <div className="task-header">
        <span>Status</span>
        <span>Due Date</span>
        <span>What</span>
        <span>Who</span>
        <span>Action</span>
      </div>

      {tasks.map((task, idx) => (
        <div key={idx} className="task-item">
          <div className="task-row">
            <span className="status-row">
              <span
                className={`status-dot ${
                  task.status.toLowerCase() === "past"
                    ? "past"
                    : task.status.toLowerCase() === "checking"
                    ? "checking"
                    : task.status.toLowerCase() === "open"
                    ? "open"
                    : "upcoming"
                }`}
              />
              <span
                className={`status-color ${
                  task.status.toLowerCase() === "past"
                    ? "past"
                    : task.status.toLowerCase() === "checking"
                    ? "checking"
                    : task.status.toLowerCase() === "open"
                    ? "open"
                    : "upcoming"
                }`}
              >
                {task.status.toUpperCase()}
              </span>
            </span>
            <span>
              {new Date(task.due_date).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).toUpperCase().replace(",", "")}
            </span>
            <span>{task.what}</span>
            <span>{task.who}</span>
            <span>
              <button onClick={() => handleToggle(idx)} className="toggle-btn">
                {expandedIndex === idx ? "Close ▲" : "Open ▶"}
              </button>
            </span>
          </div>

          {expandedIndex === idx && (
            <div className="task-details">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="payment-id">
                    <strong>Payment ID</strong>
                    <img
                      className="copy"
                      src="/copy.png"
                      alt="copy-png"
                      style={{ cursor: "pointer", marginLeft: "8px" }}
                      onClick={() => copyToClipboard(task.payment_id)}
                      title="Copy Payment ID"
                    />
                  </span>
                  <span>{task.payment_id}</span>
                </div>

                <div className="detail-item">
                  <span>
                    <strong>Amount</strong>
                  </span>
                  <span>{task.amount}.00 mzn</span>
                </div>
                <div className="detail-item">
                  <span>
                    <strong>Period</strong>
                  </span>
                  <span>{formatPeriod(task.period)}</span>
                </div>
                <div className="detail-item">
                  <span>
                    <strong>Guide</strong>{" "}
                  </span>
                  <a href={task.guide || "#"} target="_blank" rel="noreferrer">
                    View PDF
                  </a>
                </div>
                <div className="detail-item">
                  <strong>Upload</strong>{" "}
                  <input
                    type="file"
                    name="uploadLink"
                    onChange={(e) => handleUpload(e, task._id)}
                  />
                  {task?.upload && (
                    <a href={task.upload} target="_blank" rel="noreferrer">
                    Check (PDF)
                    </a>
                  )}

                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TaskTable;
