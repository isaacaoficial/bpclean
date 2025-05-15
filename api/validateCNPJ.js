export default async function handler(req, res) {
  const { cnpj } = req.query;

  if (!cnpj) {
    return res.status(400).json({ error: 'CNPJ não informado.' });
  }

  try {
    const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpj.replace(/\D/g, '')}`, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'bpclean-mvp'
      }
    });

    if (!response.ok) {
      return res.status(502).json({ error: 'Erro ao consultar a ReceitaWS.' });
    }

    const data = await response.json();

    // Retornar apenas os campos relevantes
    return res.status(200).json({
      cnpj: data.cnpj,
      nome: data.nome,
      fantasia: data.fantasia,
      situacao: data.situacao,
      logradouro: data.logradouro,
      numero: data.numero,
      complemento: data.complemento,
      bairro: data.bairro,
      municipio: data.municipio,
      uf: data.uf,
      cep: data.cep,
      telefone: data.telefone,
      email: data.email,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno do servidor.', detalhes: error.message });
  }
}
