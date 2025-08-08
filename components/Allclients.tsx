/* eslint-disable @next/next/no-img-element */
"use client"
import { useEffect, useState } from 'react';
import { useLanguage } from "@/src/app/contexts/LanguageContext";
import { dictionaries } from "@/src/app/contexts/dictionaries";
import "./Allclients.css";

type Client = {
  _id: string;
  name: string;
};

type Task = {
  status: string;
  _id: string;
  client_id: string;
};

type Props = {
  onNavigate: (screen: string) => void;
};

export default function Allclients({ onNavigate }: Props) {
  const { language } = useLanguage();
  const t = (key: string) => dictionaries[language]?.[key] || key;
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [clientRes, taskRes] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/tasks')
        ]);

        if (!clientRes.ok || !taskRes.ok) {
          throw new Error('Erro ao buscar dados');
        }

        const [clientData, taskData] = await Promise.all([
          clientRes.json(),
          taskRes.json()
        ]);

        setClients(clientData);
        setTasks(
          Array.isArray(taskData) ? taskData :
          Array.isArray(taskData.tasks) ? taskData.tasks :
          []
        );

      } catch (err) {
        console.error('❌ Erro ao buscar dados:', err);
      }
    }
    
    fetchData();
  }, []);


  return (
    <div className="all-clients">
      <div className="client-list-header">
        <h1>{t("allClients")}</h1>
        <div className="search-client">
          <input
            type="text"
            placeholder={t("searchInClients")}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <img src="/search.svg" alt="search" />
        </div>
        <button className="add-client-bottom" onClick={() => onNavigate('add-client')}>
          <img src="/plus.svg" alt="" />
          <span>{t("addClient")}</span>
        </button>
      </div>

      <div className="clients-list">
        {clients
          .filter(client => client.name.toLowerCase().includes(search.toLowerCase()))
          .map(client => {
            const clientTasks = tasks.filter(
              task => task.client_id === client._id && task.status === "OPEN"
            );

            return (
              <div key={client._id} className="clients-list-item">
                <div className="client-name-task">
                  <p>{client.name}</p>
                  <p>
                    {clientTasks.length} {clientTasks.length === 1 ? "task" : "tasks"} open
                  </p>

                </div>
                <div className="add-task-open-btn">
                  <button
                    onClick={() => {
                      localStorage.setItem("selectedClientId", client._id);
                      onNavigate("add-tasks");
                    }}
                  >
                    <img src="/plus.svg" alt="" />
                    <span>{t("addTask")}</span>
                  </button>
                  <button
                    onClick={() => {
                      localStorage.setItem("editingClient", JSON.stringify(client));
                      onNavigate("add-client");
                    }}
                  >
                    <img src="/edit.svg" alt="" />
                    {/* <span>edit client</span> */}
                  </button>

                  {/* <button>
                    <span>open</span>
                    <img src="/chevron.svg" alt="" />
                  </button> */}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
