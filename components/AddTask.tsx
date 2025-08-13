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

interface FormDataState {
  status: string;
  client_id: string;
  accountant_id: string;
  amount: string;
  period: string;
  due_date: string;
  what: string;
  who: string;
  whoCustom?: string;
  payment_id: string;
  subTasks: {
    amount: string;
    payment_id: string;
    guide?: string;
    due_date?: string;
    period?: string;
    what?: string;
  }[];
}

export default function AddTask() {
  const { language } = useLanguage();
  const t = (key: string) => dictionaries[language]?.[key] || key;

  const [accountType, setAccountType] = useState("");
  const [accountId, setAccountId] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [accountants, setAccountants] = useState<Accountant[]>([]);
  const [loading, setLoading] = useState(false);
  const [guideFile, setGuideFile] = useState<File | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const dueDateInputRef = useRef<HTMLInputElement>(null);
  const periodInputRef = useRef<HTMLInputElement>(null);
  const [whoQuantity, setWhoQuantity] = useState(1);
  const [subTasks, setSubTasks] = useState<
    { amount: string; payment_id: string; guide?: File | null; upload?: File | null }[]
  >(
    Array.from({ length: whoQuantity }, () => ({ amount: "", payment_id: "", guide: null, upload: null }))
  );


  const [formData, setFormData] = useState<FormDataState>({
    status: "UPCOMING",
    client_id: "",
    accountant_id: "",
    amount: "",
    period: "",
    due_date: "",
    what: "",
    who: "",
    payment_id: "",
    subTasks: [],
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
      accountant_id: accType === "accountant" && accId ? accId : prev.accountant_id,
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

  function handleWhoQuantityChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = Math.max(1, Number(e.target.value));
    setWhoQuantity(value);
    setSubTasks(Array.from({ length: value }, () => ({ amount: "", payment_id: "", due_date: "", period: "", what: "" })));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();

      const finalStatus = guideFile ? "OPEN" : formData.status;

      const finalWho =
        formData.who === "custom"
          ? formData.whoCustom || ""
          : formData.who;

      data.append("status", finalStatus);

      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "status" && key !== "whoCustom") {
          if (key === "who") {
            data.append("who", finalWho);
          } else {
            data.append(key, value);
          }
        }
      });

      if (guideFile) {
        data.append("guide", guideFile);
      }

      if (formData.who === "IRPS") {
        const cleanedSubTasks = subTasks.filter(st => st.amount && st.payment_id);

        // Adiciona os dados + arquivos no FormData
        cleanedSubTasks.forEach((st, idx) => {
          data.append(`subTasks[${idx}][amount]`, st.amount);
          data.append(`subTasks[${idx}][payment_id]`, st.payment_id);
          if (st.guide) {
            data.append(`subTasks[${idx}][guide]`, st.guide);
          }
        });
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
        who: "INSS",
        payment_id: "",
        subTasks: [],
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

  const handleSubTaskChange = (index: number, field: string, value: string) => {
    setSubTasks(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };


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
          {formData.who === "custom" ? (
            <input
              type="text"
              name="who"
              value={formData.whoCustom || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, whoCustom: e.target.value }))}
              className={styles.inputItem}
              placeholder={t("typeHere")}
              required
            />
          ) : (
            <select
              name="who"
              value={formData.who}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "custom") {
                  setFormData(prev => ({ ...prev, who: "custom", whoCustom: "" }));
                } else {
                  setFormData(prev => ({ ...prev, who: value, whoCustom: undefined }));
                }
              }}
              className={styles.inputItem}
              required
            >
              <option value="">-- {t("select")} --</option>
              <option value="INSS">INSS</option>
              <option value="IVA">IVA</option>
              <option value="IRPC">IRPC</option>
              <option value="IRPS">IRPS</option>
              <option value="MULTA">MULTA</option>
              <option value="custom">{t("other")}</option>
            </select>
          )}

         {formData.who === 'IRPS' && (
            <>
              <label>{t("quantityOfIRPS") || "Quantidade de IRPS"}</label>
              <input
                type="number"
                min={1}
                value={whoQuantity}
                onChange={handleWhoQuantityChange}
                className={styles.inputItem}
              />

              {subTasks.map((st, index) => (
                <div key={index} style={{ border: '1px solid #ccc', padding: '10px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h4>IRPS #{index + 1}</h4>

                  <label>{t("amount")}</label>
                  <input
                    type="number"
                    value={st.amount}
                    onChange={(e) => handleSubTaskChange(index, "amount", e.target.value)}
                    className={styles.inputItem}
                    required
                  />

                  <label>{t("paymentId")}</label>
                  <input
                    type="text"
                    value={st.payment_id}
                    onChange={(e) => handleSubTaskChange(index, "payment_id", e.target.value)}
                    className={styles.inputItem}
                    required
                  />
                  <label>{t("guide")} (PDF)</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setSubTasks(prev => {
                        const copy = [...prev];
                        copy[index].guide = file;
                        return copy;
                      });
                    }}
                    className={styles.inputItem}
                  />

                </div>
              ))}
            </>
          )}


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
