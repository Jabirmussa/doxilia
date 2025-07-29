"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
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
  const [accountType, setAccountType] = useState("");
  const [accountId, setAccountId] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [accountants, setAccountants] = useState<Accountant[]>([]);
  const [loading, setLoading] = useState(false);
  const [guideFile, setGuideFile] = useState<File | null>(null); // PDF obrigatório
  const [uploadFile, setUploadFile] = useState<File | null>(null); // PDF opcional

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
    setAccountType(accType || "");
    setAccountId(accId || "");

    if (accType === "admin") {
      fetch("/api/accountant")
        .then((res) => res.json())
        .then((data) => setAccountants(data))
        .catch((err) => console.error("Erro ao buscar accountants:", err));
    } else if (accType === "accountant" && accId) {
      setFormData((prev) => ({ ...prev, accountant_id: accId }));
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

      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      if (!guideFile) {
        toast.error("O PDF da guia (guide) é obrigatório!");
        setLoading(false);
        return;
      }

      data.append("guide", guideFile);

      if (uploadFile) {
        data.append("upload", uploadFile);
      }

      const res = await fetch("/api/tasks", {
        method: "POST",
        body: data,
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Erro ao criar tarefa.");

      toast.success("Tarefa criada com sucesso!");

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
          : "Erro ao criar tarefa.";
      toast.error(errorMessage ?? "Erro ao criar tarefa.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Add/Edit Task</h2>

      <div className={styles.row}>
        <div className={styles.column}>
          <label>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={styles.inputItem}
            required
          >
            <option value="UPCOMING">UPCOMING</option>
            <option value="CHECKING">CHECKING</option>
            <option value="OPEN">OPEN</option>
          </select>

          <label>Client</label>
          <select
            name="client_id"
            value={formData.client_id}
            onChange={handleChange}
            className={styles.inputItem}
            required
          >
            <option value="">Select Client</option>
            {clients.map((client) => (
              <option key={client._id} value={client._id}>
                {client.name}
              </option>
            ))}
          </select>

          <label>Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className={styles.inputItem}
            required
          />

          <label>Due Date</label>
          <input
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            className={styles.inputItem}
            required
          />

          <label>Payment ID</label>
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
          <label>Period</label>
          <input
            type="date"
            name="period"
            value={formData.period}
            onChange={handleChange}
            className={styles.inputItem}
            required
          />

          <label>Who</label>
          <input
            type="text"
            name="who"
            value={formData.who}
            onChange={handleChange}
            className={styles.inputItem}
            required
          />

          <label>What</label>
          <input
            type="text"
            name="what"
            value={formData.what}
            onChange={handleChange}
            className={styles.inputItem}
            required
          />

          <label>Guide (PDF obrigatório)</label>
          <input
            type="file"
            name="guide"
            accept="application/pdf"
            onChange={handleFileChange}
            className={styles.inputItem}
            required
          />

          {accountType === "admin" && (
            <>
              <label>Accountant</label>
              <select
                name="accountant_id"
                value={formData.accountant_id}
                onChange={handleChange}
                className={styles.inputItem}
                required
              >
                <option value="">Selecione o Contabilista</option>
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
