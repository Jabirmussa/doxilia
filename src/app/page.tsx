/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from 'react';
import toast from 'react-hot-toast'; 
import styles from './login.module.css';

export default function Index() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        let errorMsg = 'Erro no login';
        try {
          const data = await res.json();
          errorMsg = typeof data.message === 'string' ? data.message : errorMsg;
        } catch (e) {
          const text = await res.text();
          errorMsg = text || errorMsg;
        }
        toast.error(errorMsg);
        return;
      }


     const data = await res.json();
      toast.success('Login realizado com sucesso!');

      localStorage.setItem('role', data.userType);

      if (data.acc_id) {
        localStorage.setItem('acc_id', data.acc_id);
      }

      if (data.userId) {
        localStorage.setItem('user_id', data.userId);
      }

      console.log(data.userId)

      if (data.userType === 'admin') window.location.href = '/admin';
      else if (data.userType === 'client') window.location.href = '/client';
      else if (data.userType === 'accountant') window.location.href = '/accountant';
      else window.location.href = '/';

    } catch (err) {
      toast.error('Erro de rede, tenta de novo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles['login-form']}>
      <div className={styles['logo-header']}>
        <img src="/logo.png" alt="logo" />
      </div>
      <form className={styles['form-login']} onSubmit={handleSubmit}>
        <h2>Login</h2>

        <label>E-mail</label>
        <input 
          type="email" 
          placeholder="iassine@doxilio.com" 
          name="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required 
        />
        <label>Password</label>
        <input 
          type="password" 
          placeholder="**********" 
          name="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required 
        />
        <button type="submit" disabled={loading}>
          {loading ? (
            <span className={styles.loader}></span>
          ) : (
            <>
              <span>Login</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M7.93665 16.25L13.1866 11L7.93665 5.75" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </>
          )}
        </button>
        <div className={styles['form-footer']}>
          <a href="#">Forget password</a>
          <a href="#">Register</a>
        </div>
      </form>
    </main>
  );
}
