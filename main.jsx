import React, { useState } from "react";
import Papa from "papaparse";

export default function BPCleanApp() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setResults([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (parsed) => {
        const cnpjs = parsed.data.map((row) => row.CNPJ);
        const enriched = [];

        for (let cnpj of cnpjs) {
          const cleanCNPJ = cnpj.replace(/\D/g, "");
          try {
            const res = await fetch(`/api/validateCNPJ?cnpj=${cleanCNPJ}`);
            const data = await res.json();
            enriched.push(data);
            setResults([...enriched]); // Atualiza em tempo real
            await new Promise((r) => setTimeout(r, 500)); // Evita bloqueio da API
          } catch (err) {
            enriched.push({ cnpj: cleanCNPJ, error: "Erro ao consultar" });
          }
        }

        setLoading(false);
      },
    });
  };

  const handleExport = () => {
    const csv = Papa.unparse(results);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "resultado_saneado.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>BPClean - Saneamento de Dados de PJ</h1>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      {loading && <p>🔄 Validando CNPJs, aguarde...</p>}
      {results.length > 0 && (
        <>
          <h2>Resultado</h2>
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>CNPJ</th>
                <th>Nome</th>
                <th>Fantasia</th>
                <th>Situação</th>
                <th>Município</th>
                <th>UF</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td>{r.cnpj}</td>
                  <td>{r.nome || r.error}</td>
                  <td>{r.fantasia}</td>
                  <td>{r.situacao}</td>
                  <td>{r.municipio}</td>
                  <td>{r.uf}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <br />
          <
