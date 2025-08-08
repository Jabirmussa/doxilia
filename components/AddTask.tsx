/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/src/app/contexts/LanguageContext";
import { dictionaries } from "@/src/app/contexts/dictionaries";
import toast from "react-hot-toast";
import FeatherIcon from '@/components/FeatherIcon';
import styles from "@/components/addClient.module.css";

interface Client {
  _id: string;
  name: string;
}

interface Accountant {
  _id: string;
  name: string;
}

export default function AddTask() {
  const { language } = useLanguage();
  const t = (key: string) => dictionaries[language]?.[key] || key
  const [accountType, setAccountType] = useState("");
  const [accountId, setAccountId] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [accountants, setAccountants] = useState<Accountant[]>([]);
  const [loading, setLoading] = useState(false);
  const [guideFile, setGuideFile] = useState<File | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null); 
  const dueDateInputRef = useRef<HTMLInputElement>(null);
  const periodInputRef = useRef<HTMLInputElement>(null);



  const [formData, setFormData] = useState({
    status: "UPCOMING",
    client_id: "",
    accountant_id: "",
    amount: "",
    period: "",
    due_date: "",
    what: "",
    who: "",
    payment_id: "",
  });

  useEffect(() => {
    const accType = localStorage.getItem("role");
    const accId = localStorage.getItem("user_id");
    const selectedClientId = localStorage.getItem("selectedClientId");

    setAccountType(accType || "");
    setAccountId(accId || "");

    setFormData((prev) => ({
      ...prev,
      client_id: selectedClientId || "",
      accountant_id: accType === "accountant" && accId ? accId : prev.accountant_id
    }));

    if (accType === "admin") {
      fetch("/api/accountant")
        .then((res) => res.json())
        .then((data) => setAccountants(data))
        .catch((err) => console.error("Erro ao buscar accountants:", err));
    }

    fetch("/api/clients")
      .then((res) => res.json())
      .then((data) => setClients(data))
      .catch((err) => console.error("Erro ao buscar clientes:", err));
  }, []);


  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, files } = e.target;
    if (!files || !files[0]) return;

    if (name === "guide") {
      setGuideFile(files[0]);
    } else if (name === "upload") {
      setUploadFile(files[0]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();

      const finalStatus = guideFile ? "OPEN" : formData.status;

      data.append("status", finalStatus);

      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "status") data.append(key, value);
      });

      if (guideFile) {
        data.append("guide", guideFile);
      }

      if (uploadFile) {
        data.append("upload", uploadFile);
      }

      const res = await fetch("/api/tasks", {
        method: "POST",
        body: data,
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Error creating task.");

      toast.success("Task created successfully!");

      localStorage.removeItem("selectedClientId");
      setFormData({
        status: "UPCOMING",
        client_id: "",
        accountant_id: accountType === "accountant" ? accountId : "",
        amount: "",
        period: "",
        due_date: "",
        what: "",
        who: "",
        payment_id: "",
      });
      setGuideFile(null);
      setUploadFile(null);
    } catch (err) {
      const errorMessage =
        err && typeof err === "object" && "message" in err
          ? (err as { message?: string }).message
          : "Error creating task.";
      toast.error(errorMessage ?? "Error creating task.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>{t("addTask")}</h2>

      <div className={styles.row}>
        <div className={styles.column}>
          <label>{t("status")}</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={styles.inputItem}
            required
            style={{ cursor: 'not-allowed', pointerEvents: 'none'}}
          >
            <option value="UPCOMING">UPCOMING</option>
            <option value="CHECKING">CHECKING</option>
            <option value="OPEN">OPEN</option>
            <option value="OPEN">CLOSE</option>
          </select>

          <label>{t("client")}</label>
          <select
            name="client_id"
            value={formData.client_id}
            onChange={handleChange}
            className={styles.inputItem}
            required
          >
            <option value="">{t("selectClient")}</option>
            {clients.map((client) => (
              <option key={client._id} value={client._id}>
                {client.name}
              </option>
            ))}
          </select>

          <label>{t("amount")}</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className={styles.inputItem}
            required
          />

          <label>{t("dueDate")}</label>
          <div className={styles.dateWrapper}>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className={styles.inputItem}
              required
              ref={dueDateInputRef}
            />
            <span
              className={styles.calendarIcon}
              onClick={() => dueDateInputRef.current?.showPicker?.() || dueDateInputRef.current?.focus()}
              style={{ cursor: "pointer" }}
              tabIndex={0}
              role="button"
              aria-label="Open calendar"
              onKeyPress={e => {
                if (e.key === "Enter" || e.key === " ") {
                  dueDateInputRef.current?.showPicker?.() || dueDateInputRef.current?.focus();
                }
              }}
            >
              <FeatherIcon
                name="calendar"
                className={styles.calendarIcon}
              />
            </span>

          </div>


          <label>{t("paymentId")}</label>
          <input
            type="text"
            name="payment_id"
            value={formData.payment_id}
            onChange={handleChange}
            className={styles.inputItem}
            required
          />
        </div>

        <div className={styles.column}>
          <label>{t("period")}</label>
          <div className={styles.dateWrapper}>
            <input
              type="month"
              name="period"
              value={formData.period}
              onChange={handleChange}
              className={styles.inputItem}
              required
              ref={periodInputRef}
            />
            <span
              className={styles.calendarIcon}
              onClick={() => periodInputRef.current?.showPicker?.() || periodInputRef.current?.focus()}
              style={{ cursor: "pointer" }}
              tabIndex={0}
              role="button"
              aria-label="Open calendar"
              onKeyPress={e => {
                if (e.key === "Enter" || e.key === " ") {
                  periodInputRef.current?.showPicker?.() || periodInputRef.current?.focus();
                }
              }}
            >
              <FeatherIcon
                name="calendar"
                className={styles.calendarIcon}
              />
            </span>

          </div>
          <label>{t("who")}</label>
          <input
            type="text"
            name="who"
            value={formData.who}
            onChange={handleChange}
            className={styles.inputItem}
            required
          />

          <label>{t("what")}</label>
          <input
            type="text"
            name="what"
            value={formData.what}
            onChange={handleChange}
            className={styles.inputItem}
            required
          />

          <label>{t("guide")} (PDF)</label>
          <input
            type="file"
            name="guide"
            accept="application/pdf"
            onChange={handleFileChange}
            className={styles.inputItem}
          />

          {accountType === "admin" && (
            <>
              <label>{t("Accountant")}</label>
              <select
                name="accountant_id"
                value={formData.accountant_id}
                onChange={handleChange}
                className={styles.inputItem}
                required
              >
                <option value="">{t("selectAccountant")}</option>
                {accountants.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      <button
        className={styles.submitButton}
        type="submit"
        disabled={loading}
      >
        {loading ? (
          <span className={styles.loader}></span>
        ) : (
          <>
            <span>ADD TASK</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
            >
              <path
                d="M7.93665 16.25L13.1866 11L7.93665 5.75"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
