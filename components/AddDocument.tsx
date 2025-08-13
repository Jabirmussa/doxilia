/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";
import './AddDocument.css';
import FeatherIcon from './FeatherIcon';
import { useEffect, useState } from 'react';
import toast from "react-hot-toast";

type Client = {
  _id: string;
  name: string;
};

type AddDocumentProps = {
  onClose: () => void;
  prefilledFile?: File; 
};

export default function AddDocument({ onClose, prefilledFile }: AddDocumentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [clients, setClients] = useState<Client[]>([]);
  const [accountType, setAccountType] = useState<string>("");
  const [clientId, setClientId] = useState<string>("");
  const [accountId, setAccountId] = useState<string>("");

  useEffect(() => {
    if (prefilledFile) {
      setFile(prefilledFile);
      setDescription(prefilledFile.name.replace(/\.pdf$/i, ""));
    }
  }, [prefilledFile]);


  useEffect(() => {
    const storedRole = localStorage.getItem("role") || "";
    const storedUserId = localStorage.getItem("user_id") || "";
    const storedClientId = localStorage.getItem("selectedClientId") || "";

    setAccountType(storedRole);
    setAccountId(storedUserId);

    if (storedRole === "client") {
      setClientId(storedUserId);
      return;
    }

    let url = "/api/clients";
    if (storedRole === "accountant") {
      url = `/api/clients?accountantId=${storedUserId}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setClients(data);
        } else if (Array.isArray(data.clients)) {
          setClients(data.clients);
        }
      })
      .catch((err) => console.error("Erro ao buscar clientes:", err));

    setClientId(storedClientId);
  }, []);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Selecione um arquivo PDF.");
      return;
    }
    if (!clientId) {
      toast.error("Selecione um cliente.");
      return;
    }

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("description", description);
      formData.append("client_id", clientId);

      const res = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Arquivo enviado com sucesso!");
        setFile(null);
        setDescription("");
        if (accountType === "accountant" || accountType === "admin") {
          setClientId("");
        }
        onClose();
      } else {
        toast.error(data.message || "Erro ao enviar arquivo.");
      }
    } catch (err) {
      toast.error("Erro inesperado ao enviar arquivo.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='add-document'>
      <div className="logo" onClick={onClose}>
        <img src="/logo.png" alt="Doxilia Logo" />
      </div>
      <form onSubmit={handleSubmit}>
        <h2>Add files (pdf)</h2>

        {file && (
          <div className="pdf-name">
            <span>{file.name}</span>
            <div className="remove-file" onClick={() => setFile(null)}>
              <FeatherIcon name="x" className="icon-svg" />
            </div>
          </div>
        )}

        <label htmlFor="file-upload">Add files here</label>
        <div className="file-upload">
          <div>
            <span>Add from computer</span>
            <FeatherIcon name="plus" className="icon-svg" />
          </div>
          <input
            type="file"
            id="file-upload"
            accept="application/pdf"
            onChange={handleFileChange}
          />
        </div>

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          placeholder="Add a description for the file"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>

        {(accountType === "accountant" || accountType === "admin") ? (
          <>
            <label htmlFor="client-select">Select client</label>
            <select
              id="client-select"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
            >
              <option value="">-- Select Client --</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.name}
                </option>
              ))}
            </select>
          </>
        ) : (
          <input type="hidden" value={clientId} readOnly />
        )}

        <button type="submit" disabled={isLoading}>
          <span>{isLoading ? "Uploading..." : "Upload"}</span>
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
    </div>
  );
}
