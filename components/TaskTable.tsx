/* eslint-disable react-hooks/exhaustive-deps */
  /* eslint-disable @next/next/no-img-element */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  "use client";
  import toast from "react-hot-toast";
  import React, { useEffect, useState } from "react";
  import "./TaskTable.css";
  import RejectModal from "@/components/RejectModal";

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
    description?: string;
  };

  type TaskTableProps = {
    type: "client" | "accountant";
  };
  
  
  const TaskTable: React.FC<TaskTableProps> = ({ type }) => {
    const [role, setRole] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [accId, setAccId] = useState<string | null>(null);
  
    useEffect(() => {
      if (typeof window !== "undefined") {
        setRole(localStorage.getItem("role"));
        setUserId(localStorage.getItem("user_id"));
        setAccId(localStorage.getItem("acc_id"));
      }
    }, []);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [clientNames, setClientNames] = useState<{ [key: string]: string }>({});
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    useEffect(() => {
       if (!role || !userId) return;
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
          if (role === "accountant" || role === "admin") {
            for (const task of filtered) {
              if (task.status === "OPEN" && task.upload) {
                await fetch(`/api/tasks/status/${task._id}`, {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ status: "CHECKING" }),
                });

                task.status = "CHECKING";
              }
            }
          }
          setTasks(filtered);
          fetchClientNames(filtered); 
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
    }, [role, userId]);

    const hasDetails = (task: Task): boolean => {
      if (role === "client") {
        return Boolean(task.payment_id || task.amount || task.period || task.guide || task.upload);
      }

      return true;
    };

    function TaskDate({ dateString }: { dateString: string }) {
      const [formattedDate, setFormattedDate] = useState("");

      useEffect(() => {
        const d = new Date(dateString);
        const formatted = d.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).toUpperCase().replace(",", "");
        setFormattedDate(formatted);
      }, [dateString]);

      if (!formattedDate) return null; 

      return <span>{formattedDate}</span>;
    }

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
        toast.error("Failed to copy");
      });
    };

    const handleUpload = async (
      e: React.ChangeEvent<HTMLInputElement>,
      taskId: string
    ) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const task = tasks.find((t) => t._id === taskId);
      if (!task) return;

      // Se task foi rejeitada e tem upload anterior
      if (task.status === "OPEN" && task.upload && task.description) {
        try {
          await fetch(`/api/tasks/upload/${taskId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ fileUrl: task.upload }),
          });
          console.log("Upload antigo deletado com sucesso.");
        } catch (err) {
          console.error("Erro ao deletar o upload antigo", err);
        }
      }

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

        // Atualiza a task no front: novo upload e limpa a descrição
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t._id === taskId ? { ...t, upload: data.uploadLink, status: "OPEN", description: "" } : t
          )
        );

        // Atualiza no banco: status OPEN e limpa descrição
        await fetch(`/api/tasks/status/${taskId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "OPEN", description: "" }),
        });

      } catch (err) {
        toast.error("Erro ao fazer upload");
        console.error(err);
      }
    };


   const handleGuideUpload = async (
      e: React.ChangeEvent<HTMLInputElement>,
      taskId: string
    ) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch(`/api/tasks/guide/${taskId}`, {
          method: "PUT",
          body: formData,
        });

        if (!res.ok) throw new Error("Erro no upload da guia");

        const data = await res.json();
        toast.success("Guia enviada com sucesso!");

        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t._id === taskId ? { ...t, guide: data.guideLink } : t
          )
        );

        // Atualiza o status da task para "OPEN"
        await fetch(`/api/tasks/status/${taskId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "OPEN" }),
        });

        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t._id === taskId ? { ...t, status: "OPEN" } : t
          )
        );

      } catch (err) {
        toast.error("Erro ao enviar guia");
        console.error(err);
      }
    };


    const handleApprove = async (taskId: string) => {
      try {
        const res = await fetch(`/api/tasks/status/${taskId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "CLOSE" }),
        });

        if (!res.ok) throw new Error("Erro ao aprovar");

        toast.success("Task aprovada e encerrada!");

        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t._id === taskId ? { ...t, status: "CLOSE" } : t
          )
        );
      } catch (err) {
        toast.error("Erro ao aprovar task");
        console.error(err);
      }
    };

    const formatFilename = (url?: string) => {
      if (!url) return "";

      const parts = url.split('/');
      const filename = parts[parts.length - 1];
      const withoutExtension = filename.replace('.pdf', '');
      const nameWithoutId = withoutExtension.replace(/^[0-9]+_/, '');
      const cleaned = nameWithoutId.replace(/-/g, '_');

      return cleaned.length > 7 ? cleaned.slice(0, 18) + "..." : cleaned;
    };

    const handleRejectClick = (task: Task) => {
      setSelectedTask(task);
      setModalOpen(true);
    };

    const handleRejectSubmit = async (reason: string) => {
      if (!selectedTask) return;

      try {
        const res = await fetch(`/api/tasks/reject/${selectedTask._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason, status: "OPEN" }),
        });

        if (!res.ok) throw new Error("Erro ao rejeitar");

        toast.success("Task rejeitada com sucesso!");

        setTasks((prev) =>
          prev.map((t) =>
            t._id === selectedTask._id ? { ...t, status: "OPEN", description: reason } : t
          )
        );
      } catch (err) {
        toast.error("Erro ao rejeitar task");
        console.error(err);
      }
    };

    const handleDelete = async (taskId: string) => {
      const confirmDelete = window.confirm("Tem certeza que deseja deletar esta task?");
      if (!confirmDelete) return;

      try {
        const res = await fetch(`/api/tasks/${taskId}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error("Erro ao deletar task");

        toast.success("Task deletada com sucesso!");

        setTasks((prevTasks) => prevTasks.filter((t) => t._id !== taskId));
      } catch (err) {
        console.error("Erro ao deletar:", err);
        toast.error("Erro ao deletar task");
      }
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

        {[...tasks]
        .sort((a, b) => {
          const isAClosed = a.status.toLowerCase() === "close";
          const isBClosed = b.status.toLowerCase() === "close";

          if (isAClosed && isBClosed) {
            return b._id.localeCompare(a._id);
          }

          if (isAClosed) return 1;

          if (isBClosed) return -1;

          return b._id.localeCompare(a._id);
        }).map((task, idx) => (
          <div className="task-items" key={idx}>
          <div key={idx} onClick={() => handleToggle(idx)}  className="task-item">
            <div className="task-row">
              <span className="status-row">
                <span
                  className={`status-dot ${
                    task.status.toLowerCase() === "close"
                      ? "close"
                      : task.status.toLowerCase() === "checking"
                      ? "checking"
                      : task.status.toLowerCase() === "open"
                      ? "open"
                      : "upcoming"
                  }`}
                />
                <span
                  className={`status-color ${
                    task.status.toLowerCase() === "close"
                      ? "close"
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
                <span>{clientNames[task.client_id ?? ""] ?? "Loading..."}</span>
              )}
              <span><TaskDate dateString={task.due_date} /></span>
              <span>{task.what}</span>
              <span>{task.who}</span>
              <span className="toggle-span">
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
                  {role === 'client' &&(
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="payment-id">
                          <strong>Payment ID</strong>
                          <img
                            className="copy"
                            src="/copy.png"
                            alt="copy-png"
                            style={{ cursor: "pointer", marginLeft: "8px" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(task.payment_id)}
                            } 

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

                        {task?.guide ? (
                          <a href={task.guide} onClick={(e) => { e.stopPropagation() }} target="_blank" rel="noreferrer">
                            View PDF
                          </a>
                        ) : (
                          <span style={{ color: "gray", fontStyle: "italic", fontSize: '12px'}}>
                            Waiting guide...
                          </span>
                        )}
                      </div>
                      <div className="detail-item">
                        <strong>Upload</strong>{" "}
                        {task?.guide ? (
                          <>
                            <input
                              type="file"
                              name="uploadLink"
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleUpload(e, task._id)}
                            />
                            <a href={task.upload} onClick={(e) => { e.stopPropagation() }} target="_blank" rel="noreferrer">
                            POP (PDF)
                            </a>
                          </>
                        ) : (
                          <span style={{ color: "gray", fontStyle: "italic", fontSize: '12px'}}>
                            Waiting guide...
                          </span>
                        )}  
                      </div>
                    </div>
                  )}

                  {task.description && role === 'client' && (
                    <div className="rejection-reason">
                      <strong>Reason for rejection:</strong>
                      <p>{task.description}</p>
                    </div>
                  )}

                  {role !== 'client' && (
                    <div className="detail-grid-accountant">
                      {task?.upload && (
                        <>
                          <div className="detail-item">
                              <a href={task.upload} target="_blank" rel="noreferrer">
                                <img src="/file-text.png" alt="" />
                                <span>{formatFilename(task.upload)}</span>
                              </a>
                          </div>
                          <button
                           className="aprove-btn"
                           onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(task._id);
                            }}
                           > 
                            <img src="/check.png" alt="" />
                            <span>Approve file</span>
                          </button>
                            <button
                              className="reject-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectClick(task);
                              }}
                            >
                              <img src="/check.png" alt="" />
                              <span>Reject file</span>
                            </button>
                        </>
                      )}

                      <div className="detail-item">
                        <strong>Upload GUIDE</strong>{" "}
                        <input
                          type="file"
                          name="guide"
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleGuideUpload(e, task._id)}
                          />
                      </div>
                      {task?.guide && (
                        <div className="detail-item">
                              <a href={task.guide} target="_blank" rel="noreferrer">
                                Check (Guide PDF)
                              </a>
                        </div>
                      )}
                    </div>
                  )}

              </div>
            )}
          </div>
          {role !== 'client'&&(
            <div className="task-trash"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(task._id);
              }}
            >
            <svg width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.375 5.25H3.95833H16.625" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15.0416 5.24998V16.3333C15.0416 16.7532 14.8748 17.156 14.5778 17.4529C14.2809 17.7498 13.8782 17.9166 13.4583 17.9166H5.54159C5.12166 17.9166 4.71893 17.7498 4.422 17.4529C4.12507 17.156 3.95825 16.7532 3.95825 16.3333V5.24998M6.33325 5.24998V3.66665C6.33325 3.24672 6.50007 2.84399 6.797 2.54706C7.09393 2.25013 7.49666 2.08331 7.91659 2.08331H11.0833C11.5032 2.08331 11.9059 2.25013 12.2028 2.54706C12.4998 2.84399 12.6666 3.24672 12.6666 3.66665V5.24998"
                  stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                />
                <path d="M7.91675 9.20831V13.9583" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M11.0833 9.20831V13.9583" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
          </div>
        ))}
        {selectedTask && (
          <RejectModal
            isOpen={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setSelectedTask(null);
            }}
            onSubmit={(reason) => handleRejectSubmit(reason)}
            task={selectedTask}
            clientName={clientNames[selectedTask.client_id ?? ""] ?? "Client"}
          />
        )}

      </div>
    );
  };

  export default TaskTable;
