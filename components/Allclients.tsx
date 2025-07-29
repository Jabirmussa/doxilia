/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useState } from 'react';
import "./Allclients.css";

type Client = {
  _id: string;
  name: string;
};

type Task = {
  _id: string;
  client_id: string;
};

export default function Allclients() {
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
        <h1>All clients</h1>
        <div className="search-client">
          <input 
            type="text" 
            placeholder="Search in clients" 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <img src="/search.svg" alt="search" />
        </div>
        <button className="add-client-bottom">
          <img src="/plus.svg" alt="" />
          <span>add client</span>
        </button>
      </div>

      <div className="clients-list">
        {clients
          .filter(client => client.name.toLowerCase().includes(search.toLowerCase()))
          .map(client => {
            const clientTasks = tasks.filter(task => task.client_id === client._id);
            return (
              <div key={client._id} className="clients-list-item">
                <div className="client-name-task">
                  <p>{client.name}</p>
                  <p>{clientTasks.length} tasks open</p>
                </div>
                <div className="add-task-open-btn">
                  <button>
                      <img src="/plus.svg" alt="" />
                      <span>add task</span>
                  </button>
                  <button>
                    <span>open</span>
                    <img src="/chevron.svg" alt="" />
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
