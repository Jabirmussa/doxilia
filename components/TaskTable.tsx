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
  const [clientNames, setClientNames] = useState<{ [key: string]: string }>({});

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
        fetchClientNames(filtered); // Chama a função aqui depois de setar as tasks
      } catch (err) {
        console.error("Erro no fetch de tasks", err);
      }
    }

    async function fetchClientNames(taskList: Task[]) {
      const namesMap: { [key: string]: string } = {};

      const uniqueClientIds = [...new Set(taskList.map(task => task.client_id).filter(Boolean))];

      await Promise.all(uniqueClientIds.map(async (id) => {
        try {
          const res = await fetch(`/api/clients/${id}`);
          if (!res.ok) throw new Error("Erro ao buscar cliente");
          const clientData = await res.json();
          namesMap[id!] = clientData.name;
        } catch (error) {
          console.error("Erro ao buscar cliente com ID:", id, error);
        }
      }));

      setClientNames(namesMap);
    }

    fetchTasks();
  }, []);




  const hasDetails = (task: Task): boolean => {
    if (role === "client") {
      return Boolean(task.payment_id || task.amount || task.period || task.guide || task.upload);
    }

    return Boolean(task.upload);
  };

  const handleToggle = (index: number) => {
    const task = tasks[index];
    if (!hasDetails(task)) return;
    
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

  const formatFilename = (url: string) => {
    if (!url) return "";

    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const withoutExtension = filename.replace('.pdf', '');
    const nameWithoutId = withoutExtension.replace(/^[0-9]+_/, '');
    const cleaned = nameWithoutId.replace(/-/g, '_'); 
    return cleaned;
  };

  return (
    <div className="task-list">
      <div className="task-header">
        <span>Status</span>
        {role === 'accountant' &&(<span>Client</span>)}
        <span>Due Date</span>
        <span>What</span>
        <span>Who</span>
        <span>Action</span>
      </div>

      {tasks.map((task, idx) => (
        <div key={idx} onClick={() => handleToggle(idx)}  className="task-item">
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
            {role !== 'client'&&(
              <span>{clientNames[task.client_id ?? ""] ?? "Carregando..."}</span>
            )}
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
              <button
                className={`toggle-btn ${expandedIndex === idx ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle(idx);
                }}
              >
                <span>{expandedIndex === idx ? "Close" : "Open"}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M7.93665 16.25L13.1866 11L7.93665 5.75" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

            </span>
          </div>

          {expandedIndex === idx && (
            <div className="task-details">
              <div className="detail-grid">
                {role === 'client' &&(
                  <>
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
                  </>
                )}
              </div>

                {role !== 'client' &&(
                  <div className="detail-grid-accountant">
                    {task?.upload && (
                      <>
                        <div className="detail-item">
                            <a href={task.upload} target="_blank" rel="noreferrer">
                              <img src="/file-text.png" alt="" />
                              <span>{formatFilename(task.upload)}</span>
                            </a>
                        </div>
                        <button className="aprove-btn">
                          <img src="/x.png" alt="" />
                          <span>Approve file</span>
                        </button>
                        <button className="reject-btn">
                          <img src="/check.png" alt="" />
                          <span>Reject file</span>
                        </button>
                      </>
                    )}
                  </div>
                )}

            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TaskTable;
