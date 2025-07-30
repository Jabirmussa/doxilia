'use client';

import { useEffect, useState } from 'react';
import styles from "@/components/addClient.module.css";

type UserType = 'client' | 'accountant' | 'admin';

type UserData = {
  nuit: string;
  name: string;
  language: string;
  email: string;
  password: string;
};

export default function Account() {
  const [userData, setUserData] = useState<UserData>({
    nuit: '',
    name: '',
    language: 'English',
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<UserType>('client');

  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem('user_id');
      const rawRole = localStorage.getItem('role') as UserType;
      const role = rawRole === 'client' ? 'clients' : rawRole;

      if (!userId || !role) {
        console.warn('Usuário não autenticado.');
        return;
      }

      setUserType(rawRole);

      try {
        const res = await fetch(`/api/${role}/${userId}`);
        if (!res.ok) throw new Error('Erro ao buscar dados');

        const data = await res.json();
        setUserData(data);
      } catch (err) {
        console.error('Erro ao carregar dados do usuário:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    try {
      const res = await fetch(`/api/${userType}s/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!res.ok) throw new Error('Erro ao salvar dados');
      alert('Dados salvos com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar!');
    }
  };

  if (loading) return <p>Carregando dados...</p>;

  return (
    <form className={styles.form} onSubmit={(e) => {
      e.preventDefault();
      handleSave();
    }}>
      <h1 className={styles.title}>Account Settings</h1>
      <div className={styles.row}>
        <div className={styles.column}>
          <label>NUIT</label>
          <input
            type="text"
            value={userData.nuit}
            className={styles.inputItem}
            disabled
          />

          <label>Company</label>
          <input
            type="text"
            name="name"
            value={userData.name}
            onChange={handleChange}
            className={styles.inputItem}
            required
          />

          <label>Language</label>
          <select
            name="language"
            value={userData.language}
            onChange={handleChange}
            className={styles.inputItem}
          >
            <option value="English">English</option>
            <option value="Portuguese">Portuguese</option>
          </select>
        </div>

        <div className={styles.column}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            className={styles.inputItem}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={userData.password}
            disabled
            className={styles.inputItem}
            style={{ background: '#E45858', color: '#fff', cursor: 'not-allowed' }}
          />
        </div>
      </div>

      <button className={styles.submitButton} type="submit">
        <span>SAVE NOW</span>
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
      </button>
    </form>
  );
}