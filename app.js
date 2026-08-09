// ==========================================
// CONFIGURAÇÕES E VARIÁVEIS GLOBAIS
// ==========================================

// Substitui a lista de 50 planilhas. Adicione os tickers das suas 50 ações aqui.
const meusAtivos = ["B3SA3", "PETR4", "CSAN3", "ITSA4", "ITUB4",
            "COGN3", "BBDC4", "CVCB3", "VIVT3", "CMIN3",  
            "MGLU3", "CSMG3", "NATU3", "ABEV3", "BBAS3",
            "BBSE3", "CPLE3", "VALE3", "MOTV3", "GOAU4",
            "SBSP3", "CSNA3", "LREN3", "ASAI3", "VAMO3",
            "DIRR3", "GGBR4", "EQTL3", "RAPT4", "CYRE3",
            "AXIA3", "MRVE3", "RENT3", "USIM5", "CEAB3",
            "EGIE3", "BPAC11", "RADL3", "BRKM5", "PETR3", 
            "BEEF3", "POMO4", "CMIG4", "PRIO3", "MBRF3",
            "CPFE3", "ENEV3", "WEGE3", "ALOS3"]; 

// VARIÁVEL FIXA COM AS 24 PALAVRAS DE INDICAÇÃO (PADRÕES SEQUENCIAIS)
const TOKENS_INDICADORES = [
  "AAAAAAAVVAAAAA", "AAAAVAVAVAAAAA", "AAVAVAVAVAAAAA", "AVAVAAAAAVAAAA",
  "AVAVAVAAVVVVVV", "AVAVAVAVAVVVAA", "AVAVAVAVVAVVAA", "AVAVAVAVVVVVVV",
  "VAAVVAAVAVAAAA", "VAVAVAVAVAAAAA", "VAVAVAVAVAAAVV", "VAVAVAVAVAVVVV",
  "VAVAVAVVVVVVVV", "VAVAVVVVVAVVVV", "VAVVVAVVAVAAAA", "VAVVVVVVAAVVVV",
  "VAVVVVVVAVVVVV", "VVVVAVAVVAVVVV", "VVVVVAVVAVVVVV", "VVVVVVAVVAVVVV",
  "VVVVVVAVVVVVVV", "VVVVVVVVAAVVVV", "VVVVVVVVVAVAAA", "VVVVVVVVVVVVVV"
];


// Token de autenticação da Brapi (Substitua pelo seu token gratuito gerado no site deles)
const token = "whN8hFPcawDXwGhjRLAoN7"; 

// Objeto global que vai armazenar o resultado final processado de todas as ações
// Ele seguirá a lógica da sua antiga 'interface AtivoResultado'
let resultadosProcessados = [];
// Função auxiliar para gerar o delay de 100ms que você criou
const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// 2. CAPTURA DOS ELEMENTOS DA TELA (HTML)
// ==========================================
const botaoAtualizar = document.getElementById('btn-atualizar');
const blocoResultadoAtual = document.getElementById('resultado-atual');
const blocoListaHistorico = document.getElementById('lista-historico');

// ==========================================
// 3. FUNÇÃO PRINCIPAL DO SCANNER
// ==========================================
async function executarScanner() {
    let resultadosProcessados = [];
    let totalMatchesHoje = 0;

    // Efeito Visual: Transforma o botão em "Carregando..."
    botaoAtualizar.disabled = true;
    botaoAtualizar.innerHTML = `
        <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://w3.org">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.253 8H18"></path>
        </svg>
        <span>Analisando 50 ações...</span>
    `;

    // Loop que varre seus ativos (O seu código original)
    for (const ticker of meusAtivos) {
        try {
            await esperar(100);
            const url =
                `https://brapi.dev/api/quote/${ticker}` +
                `?range=3mo&interval=1d&token=${token}`;

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} - ${response.statusText}`);
            }

            const dadosBrutos = await response.json();
            
            if (dadosBrutos.results && dadosBrutos.results[0] && dadosBrutos.results[0].historicalDataPrice) {
                const ativo = dadosBrutos.results[0];
                const historicoCompleto = ativo.historicalDataPrice;

                // 1. Extrai apenas os preços de fechamento para alimentar a ALMA
                const precosFechamento = historicoCompleto.map(c => c.close);

                // 2. Calcula as duas ALMAs para cada linha do histórico
                // AJUSTE AQUI: Mude os números 9 e 21 para os períodos exatos que você usa no Excel
                const periodoAlma1 = 9;  
                const periodoAlma2 = 21; 

                historicoCompleto.forEach((candle, index) => {
                    candle.alma1 = calcularALMA(precosFechamento, index, periodoAlma1);
                    candle.alma2 = calcularALMA(precosFechamento, index, periodoAlma2);
                });

                // 3. Agora sim, captura os últimos 3 dias com as ALMAs calculadas inseridas neles!
                const ultimos3Dias = historicoCompleto.slice(-3);
                const c51 = ultimos3Dias[2]; // Linha 51
                const c50 = ultimos3Dias[1]; // Linha 50
                const c49 = ultimos3Dias[0]; // Linha 49

                // Mapeamento exato das 7 colunas (B até H) do seu Excel
                const chavesColunas = ['open', 'high', 'low', 'close', 'volume', 'alma1', 'alma2']; 

                let palavraGerada = "";

                // Monta a palavra de 14 letras cruzando dados e médias
                for (let i = 0; i < 7; i++) {
                    const propriedade = chavesColunas[i];

                    const v51 = Number(c51[propriedade]) || 0;
                    const v50 = Number(c50[propriedade]) || 0;
                    const v49 = Number(c49[propriedade]) || 0;

                    palavraGerada += v51 > v50 ? "A" : v51 < v50 ? "V" : "I";
                    palavraGerada += v50 > v49 ? "A" : v50 < v49 ? "V" : "I";
                }

                // Verifica match com os tokens matemáticos de 14 letras
                let deuMatch = TOKENS_INDICADORES.includes(palavraGerada);

                if (deuMatch) {
                    totalMatchesHoje++;
                }

                resultadosProcessados.push({
                    ticker: ticker,
                    nome: ativo.shortName,
                    preco: ativo.regularMarketPrice,
                    palavra: palavraGerada,
                    match: deuMatch
                });

                console.log(`✅ ${ticker} processado. Assinatura: ${palavraGerada} | Match: ${deuMatch}`);
            }

        } catch (error) {
            console.error(`❌ Erro em ${ticker}:`, error.message);
        }
    } // Fim do for

    // Atualiza a tela com o total de matches encontrados
    blocoResultadoAtual.innerHTML = `Resultado atual: <span class="text-emerald-400">${totalMatchesHoje}</span>`;

    // Restaura o botão ao estado original
    botaoAtualizar.disabled = false;
    botaoAtualizar.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://w3.org">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.253 8H18"></path>
        </svg>
        <span>Atualizar Dados da Bolsa</span>
    `;

    // Retorna os dados caso precise usar em outra função
    return resultadosProcessados;
}

// ==========================================================
// FUNÇÃO ALMA EM JAVASCRIPT PURO
// ==========================================================
function calcularALMA(precos, indexAtual, tamanhoDesejado) {
    if (indexAtual === 0) return precos[0];

    const windowSize = Math.min(tamanhoDesejado, indexAtual + 1);
    const offset = 0.85;
    const sigma = 6;

    const m = offset * (windowSize - 1);
    const s = windowSize / sigma;

    let somaPesos = 0;
    let somaPonderada = 0;

    for (let i = 0; i < windowSize; i++) {
        const precoIndex = indexAtual - (windowSize - 1) + i;
        const preco = precos[precoIndex];

        const peso = Math.exp(-Math.pow(i - m, 2) / (2 * Math.pow(s, 2)));

        somaPonderada += preco * peso;
        somaPesos += peso;
    }

    return somaPesos === 0 ? 0 : (somaPonderada / somaPesos);
}


// ==========================================
// 4. ATIVAÇÃO DO BOTÃO
// ==========================================
botaoAtualizar.addEventListener('click', executarScanner);

