/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useState } from 'react';
import { useLanguage } from "@/src/app/contexts/LanguageContext";
import { dictionaries } from "@/src/app/contexts/dictionaries";
import "./Allclients.css";

type Accountant = {
  _id: string;
  name: string;
};

export default function AllAccountants() {
  const { language } = useLanguage();
  const t = (key: string) => dictionaries[language]?.[key] || key;
  const [accountants, setAccountants] = useState<Accountant[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchAccountants() {
      try {
        const res = await fetch('/api/accountant');
        if (!res.ok) throw new Error('Erro ao buscar contabilistas');
        const data = await res.json();
        setAccountants(data);
      } catch (err) {
        if (err instanceof Error) {
          console.error('❌ Erro ao buscar contabilistas:', err.message);
        } else {
          console.error('❌ Erro ao buscar contabilistas:', err);
        }
      }
    }

    fetchAccountants();
  }, []);

  return (
    <div className="all-clients">
      <div className="client-list-header">
        <h1>{t('Allaccountants')}</h1>
        <div className="search-client">
          <input
            type="text"
            placeholder={t('Searchinaccountants')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <img src="/search.svg" alt="search" />
        </div>
        <button className="add-client-bottom">
          <img src="/plus.svg" alt="" />
          <span>{t('addAccountantTitle')}</span>
        </button>
      </div>

      <div className="clients-list">
        {accountants
          .filter(acc => acc.name.toLowerCase().includes(search.toLowerCase()))
          .map(acc => (
            <div key={acc._id} className="clients-list-item">
              <div className="client-name-task">
                <p>{acc.name}</p>
              </div>
              <div className="add-task-open-btn">
                <button>
                  <img src="/plus.svg" alt="" />
                  <span>{t('addTask')}</span>
                </button>
                <button>
                  <span>{t('open')}</span>
                  <img src="/chevron.svg" alt="" />
                </button>
              </div>
            </div>
        ))}
      </div>
    </div>
  );
}