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
        const enriched = [];

        for (let row of parsed.data) {
          const inputCNPJ = row.CNPJ?.replace(/\D/g, "");
          const inputRS = row["Razão Social"]?.toUpperCase().trim() || "";
          const inputIE = row["Inscrição Estadual"] || "";

          let status = "";
          let receita = {};

          if (!inputCNPJ || inputCNPJ.length !== 14) {
            status = "❌ CNPJ inválido";
          } else {
            try {
              const res = await fetch(`/api/validateCNPJ?cnpj=${inputCNPJ}`);
              receita = await res.json();

              if (receita?.nome) {
                const receitaRS = receita.nome.toUpperCase().trim();
                status =
                  receitaRS === inputRS ? "✔️ OK" : "⚠️ Nome divergente";
              } else {
                status = "❌ Não encontrado";
              }
            } catch {
              status = "⚠️ Erro na consulta";
            }
            await new Promise((r) => setTimeout(r, 500)); // Respeita limite da ReceitaWS
          }

          enriched.push({
            CNPJ: row.CNPJ,
            "Razão Social (Planilha)": inputRS,
            "Razão Social (ReceitaWS)": receita.nome || "",
            "Nome Fantasia": receita.fantasia || "",
            Situação: receita.situacao || "",
            "Endereço": `${receita.logradouro || ""}, ${receita.numero || ""} ${receita.bairro || ""}`,
            Município: receita.municipio || "",
            UF: receita.uf || "",
            CEP: receita.cep || "",
            Telefone: receita.telefone || "",
            Email: receita.email || "",
            "Inscrição Estadual": `${inputIE} (não validada)`,
            Status: status,
          });
        }

        setResults(enriched);
        setLoading(false);
      },
    });
  };

  const handleExport = () => {
    if (results.length === 0) return alert("Nenhum dado para exportar.");
    const csv = Papa.unparse(results);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "base_corrigida.csv");
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
          <h2>Resultado da Validação</h2>
          <table border="1" cellPadding="6">
            <thead>
              <tr>
                <th>CNPJ</th>
                <th>Razão Social (Planilha)</th>
                <th>Razão Social (Receita)</th>
                <th>Situação</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td>{r.CNPJ}</td>
                  <td>{r["Razão Social (Planilha)"]}</td>
                  <td>{r["Razão Social (ReceitaWS)"]}</td>
                  <td>{r.Situação}</td>
                  <td>{r.Status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <br />
          <button onClick={handleExport}>⬇️ Exportar Base Corrigida (.csv)</button>
        </>
      )}
    </div>
  );
}
import React from "react";
import ReactDOM from "react-dom/client";
import BPCleanApp from "./src/BPCleanApp.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BPCleanApp />
  </React.StrictMode>
);
