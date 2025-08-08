"use client";

import { useEffect, useState } from "react";
import styles from "@/components/addClient.module.css";
import 'react-phone-input-2/lib/material.css';
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";

interface Accountant {
  _id: string;
  name: string;
}

export default function AddClient() {
  const [name, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [nuit, setNuit] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState("");
  const [accId, setAccId] = useState("");
  const [role, setRole] = useState("");
  const [accountants, setAccountants] = useState<Accountant[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedAccId = localStorage.getItem("acc_id");
    const editingClientRaw = localStorage.getItem("editingClient");

    if (storedRole) setRole(storedRole);
    if (storedAccId) setAccId(storedAccId);

    // Preencher campos se estiver editando
    if (editingClientRaw) {
      const client = JSON.parse(editingClientRaw);
      setUsername(client.name || "");
      setEmail(client.email || "");
      setNuit(client.nuit || "");
      setPhone(client.phone || "");
      setLanguage(client.language)
      setPassword("");
      if (client.accountant_id) setAccId(client.accountant_id);
      setIsEditMode(true);
      setEditingClientId(client._id || null);
    }

    if (storedRole === "admin") {
      fetch("/api/accountant")
        .then((res) => res.json())
        .then((data) => setAccountants(data))
        .catch((err) => console.error("Erro ao buscar contadores:", err));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      email,
      nuit,
      phone,
      password,
      language,
      ...(role === "admin" && { acc_id: accId }),
    };

    try {
      const res = await fetch(
        isEditMode
          ? `/api/clients/${editingClientId}`
          : "/api/clients",
        {
          method: isEditMode ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Error saving client.");
        return;
      }

      toast.success(
        isEditMode ? "Client updated successfully!" : "Client created successfully!"
      );

      setUsername("");
      setEmail("");
      setNuit("");
      setPassword("");
      setPhone("");
      if (role === "admin") setAccId("");
      localStorage.removeItem("editingClient");
      setIsEditMode(false);
      setEditingClientId(null);
    } catch (err) {
      console.error("❌ Erro:", err);
      toast.error("Error saving client. See console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>
        {isEditMode ? "Edit Client" : "Add Client"}
      </h2>

      <div className={styles.row}>
        <div className={styles.column}>
          <label>Username</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />

          <label>NUIT</label>
          <input
            type="text"
            value={nuit}
            onChange={(e) => setNuit(e.target.value)}
            placeholder="123456789"
            required
          />

          <label>Phone Number</label>
          <PhoneInput
            country={'mz'}
            value={phone}
            onChange={setPhone}
            inputClass={styles.inputItem}
            inputProps={{
              name: 'phone',
              required: true,
            }}
          />
        </div>

        <div className={styles.column}>
          <label>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
          />

          <label>Password</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Client Password"
            required={!isEditMode}
          />
          <label>Language</label>
          <select
            name="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="English">English</option>
            <option value="Portuguese">Portuguese</option>
          </select>

          {role === "admin" && (
            <div className={styles.column}>
              <label>Accountant</label>
              <select
                value={accId}
                onChange={(e) => setAccId(e.target.value)}
                required
              >
                <option value="">Select Accountant</option>
                {accountants.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <button className={styles.submitButton} type="submit" disabled={loading}>
        {loading ? (
          <span className={styles.loader}></span>
        ) : (
          <>
            <span>{isEditMode ? "UPDATE CLIENT" : "ADD NOW"}</span>
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