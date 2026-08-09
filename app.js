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
            
            // Verifica se a API retornou os dados corretamente
            if (dadosBrutos.results && dadosBrutos.results[0] && dadosBrutos.results[0].historicalDataPrice) {
                const ativo = dadosBrutos.results[0];
                const historicoCompleto = ativo.historicalDataPrice;

                // Captura exatamente os últimos 3 dias (Linhas 51, 50, 49)
                const ultimos3Dias = historicoCompleto.slice(-3);

                // --- SUA LÓGICA VAI ENTRAR AQUI ---
                // Vamos simular que gerou uma palavra e deu match para testar a tela
                let deuMatch = false; 
                let palavraGerada = "AGUARDANDO_LOGICA";
                // ----------------------------------

                if (deuMatch) {
                    totalMatchesHoje++;
                }

                resultadosProcessados.push({
                    ticker: ticker,
                    nome: ativo.shortName,
                    preco: ativo.regularMarketPrice,
                    dados: ultimos3Dias,
                    palavra: palavraGerada,
                    match: deuMatch
                });

                console.log(`✅ ${ticker} processado.`);
            } else {
                console.warn(`⚠️ Sem dados históricos para: ${ticker}`);
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

// ==========================================
// 4. ATIVAÇÃO DO BOTÃO
// ==========================================
botaoAtualizar.addEventListener('click', executarScanner);

