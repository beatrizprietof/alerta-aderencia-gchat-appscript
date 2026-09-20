function enviarLembretePreenchimentoQuiz() {
  // 1. Cole aqui a URL do Webhook do seu novo espaço do Google Chat
  const WEBHOOK_URL = "URLWEBHOOK";

  // 2. Acessa a aba específica
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const aba = ss.getSheetByName("Lembrete de preenchimento quiz");

  if (!aba) {
    Logger.log("Erro: Aba 'Lembrete de preenchimento quiz' não encontrada.");
    return;
  }

  const valores = aba.getDataRange().getValues();
  if (valores.length === 0) return;

  // --- PARTE A: Mapeamento dos Quizzes e Aderências (Resumo Inicial) ---
  const resumoQuizzes = [];

  for (let i = 1; i < valores.length; i++) {
    const quizNome = String(valores[i][0]).trim(); // Coluna A
    
    // Parar ao atingir o cabeçalho da lista detalhada de analistas
    if (quizNome.toLowerCase() === "time" || String(valores[i][2]).toLowerCase() === "analista") {
      break;
    }

    if (!quizNome) continue;

    // EXCLUIR "Quiz de FECHAMENTO"
    if (quizNome.toUpperCase() === "QUIZ DE FECHAMENTO") continue;

    const inboundPct = formatarPorcentagem(valores[i][3]); // Coluna D
    const cartPct = formatarPorcentagem(valores[i][4]);    // Coluna E

    resumoQuizzes.push({
      nome: quizNome,
      inboundPct: inboundPct,
      outPct: outtPct
    });
  }

  // --- PARTE B: Localizar a Tabela de Analistas e Mapear Pendentes ---
  let linhaCabecalhoMatriz = -1;
  for (let i = 0; i < valores.length; i++) {
    const colA = String(valores[i][0]).toLowerCase().trim();
    const colG = valores[i][6] ? String(valores[i][6]).toLowerCase().trim() : "";
    if (colA === "time" || colG === "time") {
      linhaCabecalhoMatriz = i;
      break;
    }
  }

  const pendencias = {
    "Inbound": {},
    "outbound": {}
  };

  resumoQuizzes.forEach(q => {
    pendencias["Inbound"][q.nome] = [];
    pendencias["outbound"][q.nome] = [];
  });

  if (linhaCabecalhoMatriz !== -1) {
    const cabecalho = valores[linhaCabecalhoMatriz];
    let colTime = -1;
    let colAnalista = -1;
    const mapaColunaQuiz = {};

    for (let c = 0; c < cabecalho.length; c++) {
      const val = String(cabecalho[c]).trim();
      if (val.toLowerCase() === "time") colTime = c;
      if (val.toLowerCase() === "analista") colAnalista = c;

      resumoQuizzes.forEach(q => {
        if (val.toLowerCase() === q.nome.toLowerCase()) {
          mapaColunaQuiz[c] = q.nome;
        }
      });
    }

    // Varre os analistas
    for (let i = linhaCabecalhoMatriz + 1; i < valores.length; i++) {
      const time = colTime !== -1 ? String(valores[i][colTime]).trim() : "";
      const analista = colAnalista !== -1 ? String(valores[i][colAnalista]).trim() : "";

      if (!time || !analista) continue;

      let timeChave = "";
      if (time.toLowerCase().includes("inbound")) timeChave = "Inbound";
      if (time.toLowerCase().includes("outbound") || time.toLowerCase().includes("outbound") || time.toLowerCase().includes("out")) {
        timeChave = "outbound";
      }

      if (timeChave) {
        Object.keys(mapaColunaQuiz).forEach(colIdx => {
          const quizNome = mapaColunaQuiz[colIdx];
          const status = String(valores[i][colIdx]).trim().toLowerCase();

          if (status === "pendente") {
            pendencias[timeChave][quizNome].push(analista);
          }
        });
      }
    }
  }

  // --- PARTE C: Formatação do Texto para o Google Chat ---
  let mensagem = "📢 *Lembrete de Preenchimento — Quizzes e Pílulas*\n\n";

  // Bloco Inbound
  mensagem += "🔹 *TIME INBOUND*\n";
  resumoQuizzes.forEach(q => {
    const pendentes = pendencias["Inbound"][q.nome] || [];
    mensagem += `• *${q.nome}* — Aderência: *${q.inboundPct}*\n`;
    if (pendentes.length > 0) {
      mensagem += `   ⏳ *Pendentes (${pendentes.length}):* ${pendentes.join(", ")}\n`;
    } else {
      mensagem += `   ✅ *Pendentes:* Nenhum\n`;
    }
  });

  mensagem += "\n────────────────────────\n\n";

  // Bloco Carteirização
  mensagem += "🔹 *TIME OUTBOUND*\n";
  resumoQuizzes.forEach(q => {
    const pendentes = pendencias["outboun"][q.nome] || [];
    mensagem += `• *${q.nome}* — Aderência: *${q.outPct}*\n`;
    if (pendentes.length > 0) {
      mensagem += `   ⏳ *Pendentes (${pendentes.length}):* ${pendentes.join(", ")}\n`;
    } else {
      mensagem += `   ✅ *Pendentes:* Nenhum\n`;
    }
  });

  // --- PARTE D: Disparo via Webhook ---
  const payload = JSON.stringify({ "text": mensagem });
  const options = {
    "method": "POST",
    "contentType": "application/json",
    "payload": payload
  };

  try {
    UrlFetchApp.fetch(WEBHOOK_URL, options);
    Logger.log("Mensagem enviada com sucesso!");
  } catch (erro) {
    Logger.log("Erro ao enviar para o Google Chat: " + erro);
  }
}

// Auxiliar para formatação de porcentagens
function formatarPorcentagem(valor) {
  if (valor === "" || valor === null || valor === undefined) return "0,00%";
  if (typeof valor === "number") {
    return (valor * 100).toFixed(2).replace(".", ",") + "%";
  }
  return String(valor).trim();
}
