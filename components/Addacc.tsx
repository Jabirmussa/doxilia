"use client";

import { useState } from "react";
import styles from "@/components/addClient.module.css";
import toast from 'react-hot-toast';

export default function AddAccountant() {
  const [name, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [nuit, setNuit] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); 


    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("api/accountant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          nuit,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.message?.includes("E11000 duplicate key")) {
          toast.error("Este e-mail já está associado a um contador.");
        } else {
          toast.error(data.message || "Erro ao criar cliente.");
        }
        return;
      }

      console.log("✅ Contador criado:", data);
      toast.success("Contador criado com sucesso!");

      setUsername("");
      setEmail("");
      setNuit("");
      setPassword("");
    } catch (err) {
      console.error("❌ Erro:", err);
      toast.error("Erro ao criar cliente. Veja o console.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Add Accountant</h2>

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
            required
          />
        </div>
      </div>

      <button className={styles.submitButton} type="submit" disabled={loading}>
        {loading ? (
          <span className={styles.loader}></span>
        ) : (
          <>
            <span>ADD NOW</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
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
