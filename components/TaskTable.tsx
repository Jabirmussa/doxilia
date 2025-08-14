/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import toast from "react-hot-toast";
import React, { useEffect, useState } from "react";
import { useLanguage } from "@/src/app/contexts/LanguageContext";
import { dictionaries } from "@/src/app/contexts/dictionaries";
import "./TaskTable.css";
import RejectModal from "@/components/RejectModal";
import FeatherIcon from "./FeatherIcon";

  type Task = {
    subTasks: SubTask[];
    _id: string;
    status: string;
    client?: string;
    who: string;
    what: string;
    due_date: string;
    payment_id: string;
    amount: number;
    period: string;
    guide?: string;
    upload?: string;
    client_id?: string;
    accountant_id?: string;
    description?: string;
  };

  interface SubTask {
    upload: string;
    payment_id: string;
    amount: number;
    guide?: string;
  }

  type TaskTableProps = {
    type: "client" | "accountant";
    onNavigate?: (screen: string) => void;
  };

  type Props = {
    onNavigate: (screen: string) => void;
  };


  const TaskTable: React.FC<TaskTableProps> = ({ type, onNavigate }) => {
    const { language } = useLanguage();
    const t = (key: string) => dictionaries[language]?.[key] || key;
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
    const [selectedTask, setSelectedTask] = useState<Task | SubTask | null>(null);
    const [paymentInput, setPaymentInput] = useState<{ [key: string]: string }>({});
    const [amountInput, setAmountInput] = useState<{ [key: string]: number }>({});
    const [search, setSearch] = useState('');

    useEffect(() => {
       if (!role || !userId) return;
      async function fetchTasks() {
        try {
          const res = await fetch("/api/tasks");
          if (!res.ok) throw new Error("Erro ao buscar tasks");

          const data = await res.json();
          console.log("Tasks fetched:", data.tasks);

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

    type TaskOrSubTask = Task | SubTask;

    const handleRejectClick = (task: TaskOrSubTask) => {
      setSelectedTask(task);
      setModalOpen(true);
    };

    const handleRejectSubmit = async (taskId: string, reason: string) => {
      if (!selectedTask) return;

      try {
        const res = await fetch(`/api/tasks/reject/${taskId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        });

        if (!res.ok) throw new Error("Erro ao rejeitar");

        toast.success("Task rejeitada com sucesso!");

        setTasks((prev) =>
          prev.map((t) =>
            t._id === taskId
              ? { ...t, status: "UPLOAD NEW FILE", description: reason }
              : t
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

    const updateSubTask = async (taskId: string, updatedSubTask: SubTask) => {
      setTasks(prevTasks =>
        prevTasks.map(task => {
          if (task._id !== taskId) return task;

          const newSubTasks = task.subTasks.map(sub =>
            sub.payment_id === updatedSubTask.payment_id ? { ...sub, ...updatedSubTask } : sub
          );

          return { ...task, subTasks: newSubTasks };
        })
      );

      const taskToUpdate = tasks.find(t => t._id === taskId);
      if (!taskToUpdate) return;

      const body = {
        id: taskId,
        subTasks: taskToUpdate.subTasks.map(sub =>
          sub.payment_id === updatedSubTask.payment_id ? { ...sub, ...updatedSubTask } : sub
        ),
      };

      try {
        const res = await fetch('/api/tasks', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error('Erro ao atualizar subTask');

        const data = await res.json();
        toast.success('SubTask atualizada com sucesso!');
      } catch (error) {
        toast.error('Erro ao atualizar subTask');
        console.error(error);
      }
    };

    const handlePaymentIdChange = (e: React.ChangeEvent<HTMLInputElement>, taskId: string) => {
      const { value } = e.target;
      updateSubTask(taskId, {
        payment_id: value,
        upload: "",
        amount: 0
      });
    };

    const handleAddPaymentId = async (taskId: string) => {
      const paymentId = paymentInput[taskId];
      if (!paymentId) return;

      try {
        const res = await fetch(`/api/tasks/${taskId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ payment_id: paymentId }),
        });

        if (!res.ok) throw new Error("Erro ao atualizar Payment ID");

        setTasks((prev) =>
          prev.map((task) =>
            task._id === taskId ? { ...task, payment_id: paymentId } : task
          )
        );

        toast.success("Payment ID atualizado com sucesso!");
      } catch (err: any) {
        toast.error(err.message || "Erro desconhecido");
      }
    };

    const handleAddAmount = async (taskId: string) => {
      const amount = amountInput[taskId];
      if (amount === undefined || amount === null) return;

      try {
        const res = await fetch(`/api/tasks/${taskId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: Number(amount) }), // 👈 envia como objeto e garante número
        });

        if (!res.ok) throw new Error("Erro ao atualizar Amount");

        setTasks((prev) =>
          prev.map((task) =>
            task._id === taskId ? { ...task, amount: Number(amount) } : task
          )
        );

        toast.success("Amount atualizado com sucesso!");
      } catch (err: any) {
        toast.error(err.message || "Erro desconhecido");
      }
    };


    return (
      <div className="task-list">
        <div className="client-list-header">
          {role ===  'accountant' && (
            <>
            <div className="search-client">
              <input
                type="text"
                placeholder={t("searchInTasks")}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
                <img src="/search.svg" alt="search" />
            </div>
            <button className="add-client-bottom" onClick={() => onNavigate?.('add-tasks')}>
              <img src="/plus.svg" alt="" />
              <span>{t("addTask")}</span>
            </button>
            </>
          )}
        </div>
        <div className="task-header">
          <span>{t('status')}</span>
          {role !== 'client' && (<span>{t('client')}</span>)}
          <span>{t('dueDate')}</span>
          {/* <span>{t('what')}</span> */}
          <span>{t('type')}</span>
          <span style={{ opacity: 0 }}>{t('action')}</span>
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
              <div key={idx} onClick={() => handleToggle(idx)} className="task-item">
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
                      { 
                        task.status.toLowerCase() === "upcoming"
                        ? "Draft"
                        : task.status.toLowerCase() === "open"
                        ? role === "accountant"
                          ? "Waiting Client"
                          : "Make Payment"
                        : task.status.toLowerCase() === "close"
                        ? "closed"
                        : task.status.toLowerCase() === "checking"
                        ? role === "accountant"
                          ? "Checking File"
                          : "Waiting Acc"
                        : task.status
                      }
                    </span>
                  </span>
                  {role !== 'client' && (
                    <span>{clientNames[task.client_id ?? ""] ?? t('loading')}</span>
                  )}
                  <span><TaskDate dateString={task.due_date} /></span>
                  {/* <span>{task.what}</span> */}
                  <span>{task.who}</span>
                  <span className="toggle-span">
                    <button
                      className={`toggle-btn ${expandedIndex === idx ? "active" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(idx);
                      }}
                    >
                      <span>{expandedIndex === idx ? t('close') : t('open')}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                        <path d="M7.93665 16.25L13.1866 11L7.93665 5.75" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </span>
                </div>

                {expandedIndex === idx && (
                  <div className="task-details">
                    {role === 'client' && (
                        <>
                          {/* Detalhes da Tarefa Principal */}
                          <div className="detail-grid">
                            <div className="detail-item">
                              <span className="payment-id">
                                <strong>{t('paymentId')}</strong>
                                {task.payment_id ? (
                                  <img
                                    className="copy"
                                    src="/copy.png"
                                    alt="copy-png"
                                    style={{ cursor: "pointer", marginLeft: "8px" }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(task.payment_id);
                                    }}
                                    title={t('copyPaymentId')}
                                  />
                                ) : (
                                  <span style={{ color: "gray", fontStyle: "italic", fontSize: '12px' }}>
                                    {t('waitingPaymentId')}
                                  </span>
                                )}
                              </span>
                              <span>{task.payment_id}</span>
                            </div>
                            <div className="detail-item">
                              <span>
                                <strong>{t('amount')}</strong>
                              </span>
                              {Number(task.amount) !== 0 ? <span>{task.amount}.00 mzn</span> : <span>{t('waitingAmount...')}</span>}
                            </div>
                            <div className="detail-item">
                              <span>
                                <strong>{t('period')}</strong>
                              </span>
                              <span>{formatPeriod(task.period)}</span>
                            </div>
                            <div className="detail-item">
                              <span>
                                <strong>{t('guide')}</strong>{" "}
                              </span>

                              {task?.guide ? (
                                <a
                                  href={task.guide}
                                  onClick={(e) => { e.stopPropagation(); }}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {t('viewPdf')}
                                </a>
                              ) : (
                                <span style={{ color: "gray", fontStyle: "italic", fontSize: '12px' }}>
                                  {t('waitingGuide')}
                                </span>
                              )}
                            </div>
                            <div className="detail-item">
                              <strong>{t('upload')}</strong>{" "}
                              {task?.guide ? (
                                <>
                                  <div className="upload-icon-item">
                                    <input
                                      type="file"
                                      name="uploadLink"
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) => handleUpload(e, task._id)}
                                    />
                                    {t('chooseFile')}
                                    <FeatherIcon name="upload" />
                                  </div>
                                  {/* <a
                                    href={task.upload}
                                    onClick={(e) => { e.stopPropagation(); }}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {t('popPdf')}
                                  </a> */}
                                </>
                              ) : (
                                <span style={{ color: "gray", fontStyle: "italic", fontSize: '12px' }}>
                                  {t('waitingGuide')}
                                </span>
                              )}
                            </div>
                          </div>
                          {task?.subTasks?.length > 0 && (
                              <div
                                className="detail-grid"
                              >
                                {task.subTasks.map((sub, index) => (
                                  <React.Fragment key={index}>
                                    <div className="detail-item">
                                      <span className="payment-id">
                                        <strong>{t('paymentId')}</strong>
                                        {sub.payment_id ? (
                                          <img
                                            className="copy"
                                            src="/copy.png"
                                            alt="copy-png"
                                            style={{ cursor: "pointer", marginLeft: "8px" }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              copyToClipboard(sub.payment_id);
                                            }}
                                            title={t('copyPaymentId')}
                                          />
                                        ) : (
                                          <span style={{ color: "gray", fontStyle: "italic", fontSize: '12px' }}>
                                            {t('waitingPaymentId')}
                                          </span>
                                        )}
                                      </span>
                                      <span>{sub.payment_id}</span>
                                    </div>
                                    <div className="detail-item">
                                      <span>
                                        <strong>{t('amount')}</strong>
                                      </span>
                                      <span>{sub.amount}.00 mzn</span>
                                    </div>
                                    <div className="detail-item">
                                      <span>
                                        <strong>{t('period')}</strong>
                                      </span>
                                      {/* Exemplo: input para editar o period */}
                                      <input
                                        type="text"
                                        defaultValue={formatPeriod(task.period)}
                                        onBlur={(e) => {
                                          const novoPeriod = e.target.value;
                                          const updatedSub = { ...sub, period: novoPeriod };
                                          updateSubTask(task._id, updatedSub);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </div>
                                    <div className="detail-item">
                                      <span>
                                        <strong>{t('guide')}</strong>
                                      </span>
                                      {sub?.guide ? (
                                        <a
                                          href={sub.guide}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                          }}
                                          target="_blank"
                                          rel="noreferrer"
                                        >
                                          {t('viewPdf')}
                                        </a>
                                      ) : (
                                        <span style={{ color: "gray", fontStyle: "italic", fontSize: "12px" }}>
                                          {t('waitingGuide')}
                                        </span>
                                      )}
                                    </div>
                                    <div className="detail-item">
                                      <span>
                                        <strong>{t('upload')}</strong>
                                      </span>
                                      {sub?.guide ? (
                                        <div className="upload-icon-item">
                                          <FeatherIcon name="upload" />
                                         <input
                                          type="file"
                                          name="guide"
                                          onClick={(e) => e.stopPropagation()}
                                          onChange={async (e) => {
                                            e.stopPropagation();
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            const formData = new FormData();
                                            formData.append("file", file);
                                            formData.append("taskId", task._id);

                                            try {
                                              const res = await fetch(`/api/tasks/subtask/${sub.payment_id}`, {
                                                method: "PUT",
                                                body: formData,
                                              });

                                              if (!res.ok) throw new Error("Erro no upload da subTask");

                                              const data = await res.json();

                                              updateSubTask(task._id, {
                                                payment_id: sub.payment_id,
                                                guide: "",
                                                upload: data.fileUrl,
                                                amount: sub.amount,
                                              });
                                            } catch (err) {
                                              toast.error("Erro ao fazer upload da subTask");
                                              console.error(err);
                                            }
                                          }} />
                                        </div>
                                      ) : (
                                        <span style={{ color: "gray", fontStyle: "italic", fontSize: "12px" }}>
                                          {t('waitingGuide')}
                                        </span>
                                      )}
                                    </div>
                                  </React.Fragment>
                                ))}
                              </div>
                            )}
                        </>
                      )}
                      {task.description && role === 'client' && (
                        <div className="rejection-reason">
                          <strong>{t('reasonForRejection')}</strong>
                          <p>{task.description}</p>
                        </div>
                      )}

                    {role !== 'client' && (
                        <>
                          {/* Grid principal do accountant */}
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
                                  <span>{t('approveFile')}</span>
                                </button>
                                <button
                                  className="reject-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRejectClick(task);
                                  }}
                                >
                                  <img src="/check.png" alt="" />
                                  <span>{t('rejectFile')}</span>
                                </button>
                              </>
                            )}

                              <div className="detail-item">
                                <strong>{t('paymentId')}</strong>{" "}
                                {task.payment_id ? (
                                  <span>{task.payment_id}</span>
                                ) : (
                                  <div className="upload-icon">
                                    <input
                                      type="text"
                                      name="paymentId"
                                      placeholder="type payment ID"
                                      value={paymentInput[task._id] || ""}
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) =>
                                        setPaymentInput((prev) => ({ ...prev, [task._id]: e.target.value }))
                                      }
                                    />
                                    <span
                                      style={{ cursor: "pointer", display: "inline-flex" }}
                                      onClick={() => handleAddPaymentId(task._id)}
                                    >
                                      <FeatherIcon name="plus" />
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="detail-item">
                                <strong>{t('amount')}</strong>{" "}
                                {task.amount ? (
                                  <span>{task.amount} mzn</span>
                                ) : (
                                  <div className="upload-icon">
                                    <input
                                      type="number"
                                      name="amount"
                                      placeholder="Type amount"
                                      value={amountInput[task._id] || ""}
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) =>
                                        setAmountInput((prev) => ({ ...prev, [task._id]: Number(e.target.value) }))
                                      }
                                    />
                                    <span
                                      style={{ cursor: "pointer", display: "inline-flex" }}
                                      onClick={() => handleAddAmount(task._id)}
                                    >
                                      <FeatherIcon name="plus" />
                                    </span>
                                  </div>
                                )}
                              </div>
                                {!task.guide &&(
                                  <div className="detail-item">
                                    <strong>{t('uploadGuide')}</strong>{" "}
                                    <div className="upload-icon-item">
                                      <FeatherIcon name="upload" />
                                      <input
                                        type="file"
                                        name="guide"
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => handleGuideUpload(e, task._id)}
                                      />
                                    </div>
                                  </div>
                                )}

                              {task?.guide && (
                                <div className="detail-item">
                                  <a href={task.guide} target="_blank" rel="noreferrer">
                                    {t('checkGuidePdf')}
                                  </a>
                                </div>
                              )}
                          </div>

                          {/* Grid extra para subTasks */}
                          {task?.subTasks?.length > 0 && (
                          <div
                            className="detail-grid-accountant"
                            style={{ marginTop: "15px", borderTop: "1px solid #ddd", paddingTop: "10px" }}
                          >
                            {task.subTasks.map((sub: SubTask, index: number) => (
                              <React.Fragment key={index}>
                                {sub.upload && (
                                  <>
                                    <div className="detail-item">
                                      <a href={sub.upload} target="_blank" rel="noreferrer">
                                        <img src="/file-text.png" alt="" />
                                        <span>{formatFilename(sub.upload)}</span>
                                      </a>
                                    </div>
                                    <button
                                      className="aprove-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleApprove(sub.payment_id);
                                      }}
                                    >
                                      <img src="/check.png" alt="" />
                                      <span>{t('approveFile')}</span>
                                    </button>
                                    <button
                                      className="reject-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRejectClick(sub);
                                      }}
                                    >
                                      <img src="/check.png" alt="" />
                                      <span>{t('rejectFile')}</span>
                                    </button>
                                  </>
                                )}
                                {!task.guide &&(
                                  <div className="detail-item">
                                    <strong>{t('uploadGuide')}</strong>{" "}
                                    <div className="upload-icon-item">
                                      <FeatherIcon name="upload" />
                                      <input
                                        type="file"
                                        name="guide"
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={async (e) => {
                                          e.stopPropagation();
                                          const file = e.target.files?.[0];
                                          if (!file) return;

                                          const formData = new FormData();
                                          formData.append("file", file);
                                          formData.append("taskId", task._id);

                                          try {
                                            const res = await fetch(`/api/tasks/subtask/${sub.payment_id}`, {
                                              method: "PUT",
                                              body: formData,
                                            });

                                            if (!res.ok) throw new Error("Erro no upload da subTask");

                                            const data = await res.json();

                                            updateSubTask(task._id, {
                                              payment_id: sub.payment_id,
                                              guide: data.fileUrl,
                                              upload: "",
                                              amount: sub.amount,
                                            });
                                          } catch (err) {
                                            toast.error("Erro ao fazer upload da subTask");
                                            console.error(err);
                                          }
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}

                                {sub?.guide && (
                                  <div className="detail-item">
                                    <a href={sub.guide} target="_blank" rel="noreferrer">
                                      {t('checkGuidePdf')}
                                    </a>
                                  </div>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {role === 'admin' && (
                <div className="task-trash"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(task._id);
                  }}
                >
                  {/* ícone lixeira */}
                  <FeatherIcon name="trash-2" />
                </div>
              )}
            </div>
          ))}

        {selectedTask && "who" in selectedTask && "period" in selectedTask && (
          <RejectModal
            isOpen={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setSelectedTask(null);
            }}
            onSubmit={(reason) => handleRejectSubmit(selectedTask._id, reason)}
            task={selectedTask as Task}
            clientName={
              clientNames[(selectedTask as Task).client_id ?? ""] ?? t('client')
            }
          />
        )}
      </div>
    );

  };

  export default TaskTable;