import { useState } from "react";

export default function BPCleanApp() {
  const [file, setFile] = useState(null);
  const [validatedData, setValidatedData] = useState([]);
  const [errorsFound, setErrorsFound] = useState(false);

  const handleFileUpload = (e) => {
    const uploaded = e.target.files[0];
    setFile(uploaded);
    setValidatedData([
      { cnpj: "12.345.678/0001-90", razao: "Empresa Alpha", status: "OK" },
      { cnpj: "11.222.333/0001-00", razao: "Empresa Beta", status: "Erro - IE inválida" },
      { cnpj: "09.876.543/0001-12", razao: "Empresa Gama", status: "Enriquecido" },
    ]);
    setErrorsFound(true);
  };

  const handleExport = () => {
    alert("Exportação de base limpa simulada.");
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>BPClean - Saneamento de Dados de PJ</h1>
      <input type="file" accept=".csv,.xlsx" onChange={handleFileUpload} />
      {validatedData.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Resultado da Validação</h2>
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>CNPJ</th>
                <th>Razão Social</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {validatedData.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.cnpj}</td>
                  <td>{item.razao}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button style={{ marginTop: '1rem' }} onClick={handleExport} disabled={!errorsFound}>
            Exportar Base Corrigida
          </button>
        </div>
      )}
    </div>
  );
}
