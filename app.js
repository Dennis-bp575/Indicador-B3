// ==========================================
// CONFIGURAÇÕES E VARIÁVEIS GLOBAIS
// ==========================================

// Substitui a lista de 50 planilhas. Adicione os tickers das suas 50 ações aqui.

const meusAtivos = [
  "PRIO3", "VBBR3", "PETR4", "CMIN3", "BRKM5", "PETR3", "USIM5", "UGPA3", 
  "BBDC3", "RAIZ4", "BRAV3", "AURE3", "SANB11", "TAEE11", "B3SA3", "CSAN3", 
  "ITSA4", "ITUB4", "COGN3", "BBDC4", "CVCB3", "VIVT3", "MGLU3", "CSMG3", 
  "NATU3", "ABEV3", "BBAS3", "BBSE3", "CPLE3", "VALE3", "MOTV3", "GOAU4", 
  "SBSP3", "CSNA3", "LREN3", "ASAI3", "VAMO3", "DIRR3", "GGBR4", "EQTL3", 
  "RAPT4", "CYRE3", "AXIA3", "MRVE3", "RENT3", "CEAB3", "EGIE3", "BPAC11", 
  "RADL3", "BEEF3", "POMO4", "CMIG4", "MBRF3", "CPFE3", "ENEV3", "WEGE3", 
  "ALOS3", "IBOV" // Tratado no final da lista
];

const pesosAtivos = [
  2, 3, 3, 1, 1, 3, 1, 3, // PRIO3 (2), VBBR3 (1*), PETR4 (3), CMIN3 (1), BRKM5 (1), PETR3 (3), USIM5 (1), UGPA3 (1*)
  3, 1, 2, 1, 2, 2, 2, 2, // BBDC3 (1*), RAIZ4 (1*), BRAV3 (1*), AURE3 (1*), SANB11 (1*), TAEE11 (1*), B3SA3 (2), CSAN3 (2)
  2, 3, 1, 2, 1, 2, 1, 2, // ITSA4 (2), ITUB4 (3), COGN3 (1), BBDC4 (2), CVCB3 (1), VIVT3 (2), MGLU3 (1), CSMG3 (2)
  1, 2, 3, 3, 2, 3, 1, 2, // NATU3 (1), ABEV3 (2), BBAS3 (3), BBSE3 (3), CPLE3 (2), VALE3 (3), MOTV3 (1), GOAU4 (2)
  2, 1, 2, 2, 1, 2, 2, 2, // SBSP3 (2), CSNA3 (1), LREN3 (2), ASAI3 (2), VAMO3 (1), DIRR3 (2), GGBR4 (2), EQTL3 (2)
  1, 2, 1, 1, 3, 1, 3, 2, // RAPT4 (1), CYRE3 (2), AXIA3 (1), MRVE3 (1), RENT3 (3), CEAB3 (1), EGIE3 (3), BPAC11 (2)
  3, 1, 1, 2, 1, 2, 1, 3, // RADL3 (3), BEEF3 (1), POMO4 (1), CMIG4 (2), MBRF3 (1), CPFE3 (2), ENEV3 (1), WEGE3 (3)
  2, 0                    // ALOS3 (2), 5E%IBOV (0)
];



// VARIÁVEL FIXA COM AS 24 PALAVRAS DE INDICAÇÃO (PADRÕES SEQUENCIAIS)
const TOKENS_INDICADORES = [ 
            "AAAAAAAVVAAAAA", "AAAAVAVAVAAAAA", "AVAVAVAAVVVVVV", "AVAVAVAVAVVVAA",
            "AVAVAVAVVVVVVV", "VAVAVAVAVAAAVV", "VAVAVVVVVAVVVV", "VAVVVVVVAAVVVV",
            "VAVVVVVVAVVVVV", "VVVVAVAVVAVVVV", "VVVVVAVVAVVVVV", "VVVVVVAVVAVVVV",
            "VVVVVVAVVVVVVV", "VVVVVVVVAAVVVV", "VVVVVVVVVAVAAA"
];
const TOKENS_FONTE_SECUNDARIA = [
  "AIAAAAAVAVVAAV", "AVAAAAAVAVAIAA", "AVAAAAAVAVIAAA", "AVAAAAAVAVVIAV",
  "AVAAAVAAAVAAAA", "AVAIAVAAAVAAAA", "AVVAAAIVAVVAAV", "AVVAAAVVAVVAAV",
  "AVVAAAVVAVVIAV", "AVVAAAVVVVVAVV", "AVVAAAVVVVVIAV", "AVVAAVIAAVAAAA",
  "AVVAAVVAAVAAAA", "AVVAAVVAAVVAAA", "AVVAAVVAAVVAAV", "AVVIAVVAAVAAAA",
  "AVVIAVVAAVVAAV", "VVVAAAVVVVVIVV", "VVVAAVAAIVVAAA", "VVVIAVAAAVAAAA",
  "VVVIVVVAAVVAAA"
];

const token = "whN8hFPcawDXwGhjRLAoN7"; 

const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const botaoAtualizar = document.getElementById('btn-atualizar');
const blocoResultadoAtual = document.getElementById('resultado-atual');
const blocoListaHistorico = document.getElementById('lista-historico');
let ultimaAtualizacao = null;

desenharHistoricoNaTela();
// ==========================================
// 3. FUNÇÃO PRINCIPAL DO SCANNER
// ==========================================
async function executarScanner() {
            
            let totalMatchesHoje = 0;
            let totalMatchesPalavras = 0; 
            let totalReversoesCandle = 0;
            let direcaoIbovespaHoje = "estavel";
            let dataSinal = "";
            let dataHojeFormatada = new Date().toLocaleDateString('pt-BR');
            let totalMatchesFonteSecundaria = 0; 
            let direcaoAberturaHoje = "";  
            let dataDesseDiaGlobal;
            let calculaUltimoResult;
            let gravaUltimoResult;
            let placarFormatado = "";
        
            
            botaoAtualizar.disabled = true;
            botaoAtualizar.innerHTML = `
                        <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://w3.org">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.253 8H18"></path>
                        </svg>
                        <span>Analisando 50 ações...</span>
            `;

            try {
                                    
                                    const response = await fetch('./dados_ativos.json');
                                    const arquivo = await response.json();
                                    
                                    const dadosBrutos = { results: [] };
                                    
                                    for (const ticker of meusAtivos) {
                                    
                                        const ativo = arquivo.results.find(
                                            item => item.symbol === ticker
                                        );
                                    
                                        if (ativo) {
                                            dadosBrutos.results.push(ativo);
                                        } else {
                                            console.warn(`⚠️ Não foi possível carregar os dados de ${ticker}`);
                                        }
                                    }
                        

                        // 1. Verificamos se a Brapi realmente devolveu a lista de resultados
                        if (dadosBrutos.results && Array.isArray(dadosBrutos.results)) {

                                    // 1. Criar o Set com os feriados de 2026 (a partir de 02/02/2026)
                                    // Utilizamos um Set() porque a busca nele tem performance O(1), ideal para 25k linhas.
                                    const feriados2026 = new Set([
                                      "2025-11-20",
                                      "2025-24-12",
                                      "2025-25-12",
                                      "2025-31-12", 
                                      "2026-01-01",
                                      "2026-02-16", // Carnaval
                                      "2026-02-17", // Carnaval
                                      "2026-04-03", // Sexta-feira Santa
                                      "2026-04-21", // Tiradentes
                                      "2026-05-01", // Dia do Trabalho
                                      "2026-06-04", // Corpus Christi
                                                
                                    ]);
                                    
                                    // 2. Função auxiliar para converter o Timestamp Unix (em segundos) para 'AAAA-MM-DD'
                                    function converterTimestampParaData(timestamp) {
                                      // Multiplica por 1000 porque o JavaScript usa milissegundos
                                      const data = new Date(timestamp * 1000); 
                                      
                                      // Retorna no formato ISO (AAAA-MM-DD) baseado no fuso horário UTC da API
                                      return data.toISOString().split('T')[0];
                                    }
                                    
                                    // 3. Filtrar os dados brutos deletando os feriados
                                    dadosBrutos.results = dadosBrutos.results.map(ativo => {
                                      return {
                                        ...ativo,
                                        historicalDataPrice: ativo.historicalDataPrice.filter(item => {
                                          const dataFormatada = converterTimestampParaData(item.date);
                                          return !feriados2026.has(dataFormatada);
                                        })
                                      };
                                    });
                                    
                                   const historicoCalendario = dadosBrutos.results[0].historicalDataPrice;                    
                                   let aFormatada = "nada"
                                   const indiceParada = historicoCalendario.findIndex(candle => {
                                                // 1. Cria a data em UTC/Local de forma segura
                                                const dataObj = new Date(candle.date * 1000);
                                                
                                                // 2. Extrai os componentes de forma numérica e força o formato DD/MM/AAAA manualmente
                                                const dia = String(dataObj.getDate()).padStart(2, '0');
                                                const mes = String(dataObj.getMonth() + 1).padStart(2, '0'); // Janeiro é 0
                                                const ano = dataObj.getFullYear();
                                                
                                                const dataFormatadaSegura = `${dia}/${mes}/${ano}`;
                                                aFormatada = dataFormatadaSegura
                                                // 3. Compara as strings limpas
                                                return dataFormatadaSegura === ultimaAtualizacao;    
                                    });
                                   
                                    // O slice(0, indiceParada) pega do dia mais recente (índice 0) até o dia que você parou.
                                    // O .reverse() é opcional, mas excelente se você quiser processar do mais antigo para o mais novo.
                                    const diasParaProcessar = historicoCalendario.slice(0, indiceParada).reverse();

                                    

                                    let historicoSalvo = JSON.parse(localStorage.getItem('historico_B3')) || [];
                                    //historicoReatualizado = structuredClone(historicoSalvo);

                                    let historicoReatualizado = structuredClone(Array.isArray(historicoSalvo) ? historicoSalvo : [historicoSalvo]);
                                    
                                    diasParaProcessar.forEach((diaDoCalendario) => {
                                                
                                                const timestampDoDia = diaDoCalendario.date;                                              
                                                const dataDesseDia = new Date(timestampDoDia * 1000).toLocaleDateString('pt-BR');
                                                //console.log(dataDesseDia)
                                                dataDesseDiaGlobal = dataDesseDia;
                                                
                                                let registroExistente = historicoReatualizado.find(item => 
                                                            String(item.dataSinal).trim() === String(dataDesseDia).trim()
                                                            
                                                );
                                                
                                                
                                                if (registroExistente) {
                                                        
                                                    const dadosIbov = dadosBrutos.results.find(item => item.symbol === "IBOV");
                                                            
                                                    if (dadosIbov && dadosIbov.historicalDataPrice) {
                                                        const historicoIbov = dadosIbov.historicalDataPrice;
                                                        historicoIbov.sort((a, b) => a.date - b.date);
                                                        // Achamos a posição do dia anterior no histórico do Ibov
                                                        const idxIbov = historicoIbov.findIndex(c => c.date === timestampDoDia);
                                                        
                                                        const idxDiaSeguinte = idxIbov + 1;
                                                        
                                                        const dataAmanha = new Date(timestampDoDia * 1000).toLocaleDateString('pt-BR');
                                                        //console.log(idxDiaSeguinte, idxIbov, dataAmanha, historicoIbov.length)
                                                        if (idxDiaSeguinte < historicoIbov.length) {
                                                        //console.log("ok");
                                                                        const ibovAmanha = historicoIbov[idxDiaSeguinte]; // O dia 11 real!
                                                                        const ibovHoje = historicoIbov[idxIbov];         // O dia 10 real
                                                                        
                                                                        const dataAmanhaFormatada = new Date(ibovAmanha.date * 1000).toLocaleDateString('pt-BR');
                                                                        //console.log(dataAmanhaFormatada);
                                                                        //console.log(dataAmanhaFormatada)
                                                                        const agora = new Date();
                                                                        const horaAtual = agora.getHours();
                                                                        const amanhaEHoje = dataAmanhaFormatada === agora.toLocaleDateString('pt-BR');
                                                                        //console.log("amanhã é hj?")
                                                                        //console.log(amanhaEHoje);
                                                                        if (!amanhaEHoje) {
                                                                        

                                                                            registroExistente.resultadoBolsa = ibovAmanha.close > ibovHoje.close ? "subiu" : "desceu";
                                                                            registroExistente.aberturaBolsa = ibovAmanha.open > ibovHoje.close ? "alta" : "baixa";
            
                                                                            let possuiDiaSeguinteNoBanco = historicoSalvo.some(item => item.dataSinal === dataAmanhaFormatada);
                                                                            // console.log(possuiDiaSeguinteNoBanco)
                                                                            //console.log(possuiDiaSeguinteNoBanco);
                                                                            if (!possuiDiaSeguinteNoBanco) {
                                                                                historicoReatualizado.push({
                                                                                    placar: "AGUARDANDO...",
                                                                                    dataSinal: dataAmanhaFormatada,
                                                                                    aberturaBolsa: "...",
                                                                                    resultadoBolsa: "..."
                                                                                });
                                                                                //console.log(`📅 Criada base em 'AGUARDANDO...' para o dia posterior: ${dataAmanhaFormatada}`);
                                                                            }
                                                                   
                                                                            //localStorage.setItem('historico_B3', JSON.stringify(historicoReatualizado));
                                                                            //console.log(`✅ Palpite do dia ${dataDesseDia} validado com o resultado do dia ${dataAmanhaFormatada}!`);
                                                                        }
                                                        } else {
                                                                
                                                                calculaUltimoResult = true;
                                                                //console.log(gravUltimoResult);
                                                        }
                                                    }
                                                }   
                                                
                                    });
                                    
                                    
                                    diasParaProcessar.forEach((diaDoCalendario) => {
                                                //console.log(diasParaProcessar);
                                                //console.log(diaDoCalendario);
                                                const timestampDoDia = diaDoCalendario.date; // Dia 10
                                                
                                                const dataDesseDia = new Date(timestampDoDia * 1000).toLocaleDateString('pt-BR');
                                                // Zeramos os contadores para consolidar este dia específico
                                                totalMatchesHoje = 0;
                                                totalMatchesPalavras = 0; 
                                                totalReversoesCandle = 0;
                                                totalMatchesFonteSecundaria = 0;
                                    
                                                // ==========================================
                                                // Agora as 50 ações entram para trabalhar:
                                                // ==========================================
                                                dadosBrutos.results.forEach(ativo => {
                                                            // Se for o Ibov, pula (tratamos ele no fechamento do dia)
                                                            if (ativo.symbol === "IBOV") return; 
                                                            
                                                            const historicoCompleto = ativo.historicalDataPrice;
                                                            historicoCompleto.sort((a, b) => a.date - b.date);
                                                            if (!historicoCompleto || historicoCompleto.length === 0) return;
                                                            
                                                            // 1. Procuramos o índice desse dia específico no histórico DESTA ação
                                                            const idx51 = historicoCompleto.findIndex(c => c.date === timestampDoDia);
                                                            
                                                            // Se a ação não tiver pregão nesse dia (ex: IPO recente ou suspensa), pula ela
                                                            if (idx51 === -1 || idx51 < 2) return;
                                                            
                                                            // 2. Mapeamos os índices cronológicos corretos com segurança total!
                                                            const idx50 = idx51 - 1; // Ontem real da ação
                                                            const idx49 = idx51 - 2; // Anteontem real da ação
                                                            
                                                            const c51 = historicoCompleto[idx51];
                                                            const c50 = historicoCompleto[idx50];
                                                            const c49 = historicoCompleto[idx49];
                                                            
                                                            const periodoAlma1 = 9;  
                                                            const periodoAlma2 = 21; 
                                                            const precosFechamento = historicoCompleto.map(c => c.close);
                                                            
                                                            historicoCompleto.forEach((candle, index) => {
                                                                    candle.alma1 = calcularALMA(precosFechamento, index, periodoAlma1);
                                                                    candle.alma2 = calcularALMA(precosFechamento, index, periodoAlma2);
                                                                        
                                                            });


         
                                                            // 3. Atualizamos a dataSinal com base no candle decidido
                                                            dataSinal = new Date(c51.date * 1000).toLocaleDateString('pt-BR');
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
                                                            // console.log(palavraGerada, totalMatchesPalavras);
                                                            if (deuMatch) {
                                                                const nomeAtivo = ativo.symbol; 
                                                                const indice = meusAtivos.indexOf(nomeAtivo);
                                                                const pesoDoAtivo = pesosAtivos[indice];                                      
                                                                totalMatchesPalavras += pesoDoAtivo;
                                                            }
                                                                                                                                    
                                                            

                                                            const B51 = Number(c51["open"]) || 0; // Ajuste o nome da propriedade se for diferente
                                                            const C51 = Number(c51["high"]) || 0;
                                                            const D51 = Number(c51["low"]) || 0;
                                                            const E51 = Number(c51["close"]) || 0;
                                                            
                                                            const B50 = Number(c50["open"]) || 0;
                                                            const C50 = Number(c50["high"]) || 0;
                                                            const D50 = Number(c50["low"]) || 0;
                                                            const E50 = Number(c50["close"]) || 0;
                                                                        
                                                            let novaPalavraGerada = "";
                                                            
                                                            // Bloco B51 (7 letras)
                                                            novaPalavraGerada += B51 > B50 ? "A" : B51 < B50 ? "V" : "I";
                                                            novaPalavraGerada += B51 > C51 ? "A" : B51 < C51 ? "V" : "I";
                                                            novaPalavraGerada += B51 > C50 ? "A" : B51 < C50 ? "V" : "I";
                                                            novaPalavraGerada += B51 > D51 ? "A" : B51 < D51 ? "V" : "I";
                                                            novaPalavraGerada += B51 > D50 ? "A" : B51 < D50 ? "V" : "I";
                                                            novaPalavraGerada += B51 > E51 ? "A" : B51 < E51 ? "V" : "I";
                                                            novaPalavraGerada += B51 > E50 ? "A" : B51 < E50 ? "V" : "I";
            
                                                            // Bloco E51 (7 letras)
                                                            novaPalavraGerada += E51 > B51 ? "A" : E51 < B51 ? "V" : "I";
                                                            novaPalavraGerada += E51 > B50 ? "A" : E51 < B50 ? "V" : "I";
                                                            novaPalavraGerada += E51 > C51 ? "A" : E51 < C51 ? "V" : "I";
                                                            novaPalavraGerada += E51 > C50 ? "A" : E51 < C50 ? "V" : "I";
                                                            novaPalavraGerada += E51 > D51 ? "A" : E51 < D51 ? "V" : "I";
                                                            novaPalavraGerada += E51 > D50 ? "A" : E51 < D50 ? "V" : "I";
                                                            novaPalavraGerada += E51 > E50 ? "A" : E51 < E50 ? "V" : "I";
                                                            
                                                            // Verifica match com os novos tokens e conta na variável separada
                                                            if (TOKENS_FONTE_SECUNDARIA.includes(novaPalavraGerada)) {
                                                                    const nomeAtivo = ativo.symbol; 
                                                                    const indice = meusAtivos.indexOf(nomeAtivo);
                                                                    const pesoDoAtivo = pesosAtivos[indice];    
                                                                    totalMatchesFonteSecundaria += pesoDoAtivo;                                                               
                                                            }           
                                                            
                                                            // Lógica do Martelo Adaptada (Dando margem para o ruído do mercado)
                                                            const corpo51 = Math.abs(c51.close - c51.open);
                                                            const sombraInf51 = Math.min(c51.open, c51.close) - c51.low;
                                                            const sombraSup51 = c51.high - Math.max(c51.open, c51.close);
                                                            
                                                            // Ajuste: Sombra inferior pelo menos 2x o corpo, e permitimos uma sombra superior de até 25% do corpo (em vez de 10%)
                                                            const ehMartelo = (sombraInf51 >= 2 * corpo51) && (sombraSup51 <= corpo51 * 0.25) && (corpo51 > 0);
                                                            
                                                            // Lógica do Engolfo de Alta Adaptada (Ignorando micro-gaps de leilão)
                                                            const candle50Baixa = c50.close < c50.open;
                                                            const candle51Alta = c51.close > c51.open;
                                                            // Ajuste: O corpo do candle 51 precisa engolir pelo menos 90% do corpo do candle 50, tolerando pequenas variações de abertura
                                                            const ehEngolfo = candle50Baixa && candle51Alta && (c51.close >= c50.open * 0.99) && (c51.open <= c50.close * 1.01);
                                                            
                                                            // NEW 🌟: Padrão Extra 1 - Piercing Line (Perfuração - quase um engolfo, muito comum na B3)
                                                            const ehPiercing = candle50Baixa && candle51Alta && (c51.open < c50.close) && (c51.close > (c50.open + c50.close) / 2);
                                                            
                                                            // NEW 🌟: Padrão Extra 2 - Marubozu de Alta (Candle de força bruta comprador)
                                                            const ehMarubozu = candle51Alta && (corpo51 >= (c51.high - c51.low) * 0.85);
                                                            
                                                            // Validação Atualizada: Se acontecer QUALQUER uma das reversões clássicas de fundo
                                                            if (ehMartelo || ehEngolfo || ehPiercing || ehMarubozu) {
                                                                const nomeAtivo = ativo.symbol; 
                                                                const indice = meusAtivos.indexOf(nomeAtivo);
                                                                
                                                                if (indice !== -1) {
                                                                    const pesoDoAtivo = pesosAtivos[indice];
                                                                    totalReversoesCandle += pesoDoAtivo; 
                                                                }
                                                            }

                                                });

                                                // 1. Buscamos o histórico atualizado do localStorage para não atropelar dados
                                                //let historicoAtual = JSON.parse(localStorage.getItem('historico_B3')) || [];
                                                placarFormatado = `${totalMatchesPalavras}-${totalMatchesFonteSecundaria}-${totalReversoesCandle}`;

                                                const index = historicoReatualizado.findIndex(c => 
                                                    String(c.dataSinal).trim() === String(dataDesseDia).trim()
                                                );
                                                console.log(index, placarFormatado); 
                                                if (index !== -1) {
                                                    historicoReatualizado[index] = {
                                                        ...historicoReatualizado[index],
                                                        placar: placarFormatado,
                                                        dataSinal: dataDesseDia,       
                                                    };
                                                    //console.log(`✅ Item encontrado no índice ${index} e atualizado com sucesso!`);
                                                } else {
                                                  console.warn(`❌ Mesmo com o trim, a data "${dataDesseDia}" não foi encontrada no histórico.`);
                                                }
                                                                                                
                                                
                                                
                                                //console.log(`🔮 Novo sinal gerado para ${dataDesseDia} com o placar: ${placarFormatado}`);
                                               
                                    });
                                  //  console.log("Chegamos aqui?")
                                    
                                    
                                    console.log(`[LocalStorage] 💾 Gravando às: ${performance.now()}`);
                                    localStorage.setItem('historico_B3', JSON.stringify(historicoReatualizado));
                                    desenharHistoricoNaTela();
                        } // Fechamento do: if (dadosBrutos.results && Array.isArray...)
            
            } catch (error) {
                // 1. Pega a pilha de execução (stack) ou deixa vazio se não existir
                const stack = error.stack || "";
                
                // 2. Extrai a linha que originou o erro usando Regex
                const linhaErro = stack.split('\n')[1] || "Linha desconhecida";
            
                // Log detalhado para o desenvolvedor ver no console (F12)
                console.error("❌ Erro detectado:", error.message);
                console.error("📍 Local do erro:", linhaErro.trim());

            } finally {
                        // Esse bloco roda SEMPRE para não deixar o seu botão travado com o "Analisando..."
                        botaoAtualizar.disabled = false;
                        botaoAtualizar.innerHTML = `<span>Atualizar Scanner</span>`;
            }
  
            
            if (blocoResultadoAtual) {

                const t2 = totalMatchesPalavras;
                const t3 = totalMatchesFonteSecundaria;
                const somaTendencia = t2 + t3; 
                const resultado = `${totalReversoesCandle} e ${t2}+${t3}=${somaTendencia}`;
                console.log(placarFormatado);
                
                // 🧠 Lógica Dinâmica das Etiquetas de Previsão
                let etiquetaSinal = "[⚪NEUTRO]";
                let classeCorEtiqueta = "text-gray-400"; // Cor padrão neutra

                if (totalReversoesCandle > t2 && somaTendencia >= 25 && t3 > t2 && somaTendencia <= 60) {
                    etiquetaSinal = "[🟢Mantém⚠️]";
                    classeCorEtiqueta = "text-emerald-400"; // Destaca em verde
                } 
                if (totalReversoesCandle <= 2 && (somaTendencia >= 35 && somaTendencia <= 48)) {
                    // Texto curto e objetivo mantendo a bolinha amarela ao lado da compra
                    etiquetaSinal = "[🟢Mantém]";
                    classeCorEtiqueta = "text-emerald-400"; // Mantém o texto em destaque verde
                }
                        
                if (totalReversoesCandle <= 2 && somaTendencia > 49) {
                    etiquetaSinal = "[⚠️TOPO]";
                    classeCorEtiqueta = "text-orange-600"; // Destaca em rosa/vermelho
                }
                if (somaTendencia < 10) {
                    etiquetaSinal = "[🚨VENDER🚨]";
                    classeCorEtiqueta = "text-rose-400"; // Destaca em rosa/vermelho
                }

                const agora15 = new Date();
                const hora15Formatada = agora15.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                blocoResultadoAtual.innerHTML = `
                    <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center shadow-lg">
                        <div class="text-2xl font-extrabold ${classeCorEtiqueta} mb-2">${etiquetaSinal}</div>
                        <span class="font-bold text-white text-base">${resultado}</span>
                        <p class="font-bold text-white text-base">Atualizado às ${hora15Formatada}</p>
                    </div>

                `;
            }

} // Fechamento definitivo da: async function executarScanner()



desenharHistoricoNaTela();
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

function desenharHistoricoNaTela() {
            
    blocoListaHistorico.innerHTML = "";
    let historicoSalvo = JSON.parse(localStorage.getItem('historico_B3')) || [];
  
    // Inverte a ordem para exibir o mais recente no topo
// 1. NÃO inverta o array ainda! Mantenha a ordem cronológica (passado -> presente)
// Criamos apenas uma cópia rasa para não afetar o array original caso precise dele
const historicoCronologico = [...historicoSalvo];

// 2. Captura a data do registro mais recente de forma segura (que está no FIM da ordem cronológica)

// 🧠 Variável de controle de estado tradicional (Avança do passado para o presente)
let estadoAtual = "SEM POSIÇÃO"; 
let resultado = ""
// 3. Processamos os estados na ordem em que o mercado aconteceu de verdade
historicoCronologico.forEach(item => {
    // Processamento matemático dos tokens
    const placar = item.placar; 
    const numeros = placar.split('-').map(Number);
    const tokenExaustao = numeros[0]; 
    const t2 = numeros[1];
    const t3 = numeros[2];
    const somaTendencia = t2 + t3; 
    

    // Identifica o gatilho matemático puro da linha
    let gatilhoLinha = "NEUTRO";
    if (tokenExaustao > t2 && somaTendencia >= 25 && t3 > t2 && somaTendencia <= 60) {
        gatilhoLinha = "COMPRA_OPEN";
    } else if (tokenExaustao <= 2 && (somaTendencia >= 35 && somaTendencia <= 48)) {
        gatilhoLinha = "COMPRA";
    } else if (tokenExaustao <= 2 && somaTendencia > 49) {
        gatilhoLinha = "TOPANDO";
    } else if (somaTendencia < 10) {
        gatilhoLinha = "VENDER";
    }

    // 🧠 Máquina de Estados Tradicional (Lendo o passado em direção ao presente)
    if (gatilhoLinha === "COMPRA" || gatilhoLinha === "COMPRA_OPEN") {
        if (estadoAtual === "COMPRAR" || estadoAtual === "COMPRADO") {
            estadoAtual = "COMPRADO"; // Continua mantendo a posição comprada
        } else {
            estadoAtual = "COMPRAR"; // Primeiro dia que deu o sinal de compra
        }
    } else if (gatilhoLinha === "TOPANDO") {
        if (estadoAtual === "COMPRAR" || estadoAtual === "COMPRADO") {
            estadoAtual = "VENDER TOPADO"; // Dispara a venda se estava posicionado
        } else {
            estadoAtual = "SEM POSIÇÃO"; // Se já não tinha nada, ignora e não duplica a venda
        }
    } else if (gatilhoLinha === "VENDER") {
        if (estadoAtual === "COMPRAR" || estadoAtual === "COMPRADO") {
            estadoAtual = "VENDER"; // Dispara o stop/venda real se estava posicionado
        } else {
            estadoAtual = "SEM POSIÇÃO"; // Ignora para não aparecer duas vendas seguidas
        }
    } else if (gatilhoLinha === "NEUTRO") {
        if (estadoAtual === "COMPRAR" || estadoAtual === "COMPRADO") {
            estadoAtual = "COMPRADO"; // Se o mercado acalmou e você comprou antes, continua comprado
        } else {
            estadoAtual = "SEM POSIÇÃO"; // Se vendeu antes, continua zerado
        }
    }

    // 4. Anexamos as strings de estilo e texto direto no objeto para usarmos depois
    item.visualSinal = "[⚪SEM POSIÇÃO]";
    item.visualCorEtiqueta = "text-gray-500 italic";

    if (estadoAtual === "COMPRAR") {
        item.visualSinal = gatilhoLinha === "COMPRA_OPEN" ? "[🟢COMPRA⚠️Open]" : "[🟢COMPRA]";
        item.visualCorEtiqueta = "text-emerald-400 font-bold";
    } else if (estadoAtual === "COMPRADO") {
        item.visualSinal = "[🟢COMPRADO]";
        item.visualCorEtiqueta = "text-emerald-500 bg-emerald-500/5 px-1.5 py-0.5 rounded";
    } else if (estadoAtual === "VENDER TOPADO") {
        item.visualSinal = "[⚠️VENDER TOPADO]";
        item.visualCorEtiqueta = "text-orange-500 font-semibold";
    } else if (estadoAtual === "VENDER") {
        item.visualSinal = "[🚨VENDER🚨]";
        item.visualCorEtiqueta = "text-rose-400 font-bold";
    }
});

// 5. 🚀 AGORA SIM! Com todos os estados calculados perfeitamente, invertemos para a exibição na tela
const historicoInvertido = historicoCronologico.reverse();
 if (historicoInvertido.length > 0) {
        ultimaAtualizacao = historicoInvertido[0].dataSinal;
    } else {
        ultimaAtualizacao = "Sem registros";
    }
// 6. Seu loop de renderização na tela (Agora usando os dados calculados na ordem certa)
historicoInvertido.forEach(item => {

    const placar = item.placar; 
    const numeros = placar.split('-').map(Number);
    const tokenExaustao = numeros[0]; 
    const t2 = numeros[1];
    const t3 = numeros[2];
    const somaTendencia = t2 + t3; 
    resultado = `${tokenExaustao} e ${t2}+${t3}=${somaTendencia}`;


    let classeCor = "bg-gray-800 border-gray-700 text-gray-400";
    if (item.resultadoBolsa && item.resultadoBolsa.includes("subiu")) {
        classeCor = "bg-emerald-950 bg-opacity-40 border-emerald-800 text-emerald-400";
    } else if (item.resultadoBolsa && item.resultadoBolsa.includes("desceu")) {
        classeCor = "bg-rose-950 bg-opacity-40 border-rose-900 text-rose-400";
    }

    const classeCorAbertura = item.aberturaBolsa?.includes("alta") 
        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
        : item.aberturaBolsa?.includes("baixa") 
        ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" 
        : "bg-gray-800 text-gray-400";

    // Puxa os dados que nossa máquina calculou perfeitamente lá em cima
    const etiquetaSinal = item.visualSinal;
    const classeCorEtiqueta = item.visualCorEtiqueta;

    // Continue gerando o HTML do seu card/linha usando as variáveis 'etiquetaSinal' e 'classeCorEtiqueta'...



        tocarBeep();

        // A sua constante com o HTML atualizado contendo os Avisos Inteligentes
        const linhaHtml = `
            <div class="flex items-center justify-between bg-gray-850 border border-gray-800 rounded-xl p-4 shadow-sm">
                <div class="flex flex-col">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-black ${classeCorEtiqueta}">${etiquetaSinal}</span>
                        <span class="font-bold text-white text-base">${resultado}</span>
                    </div>
                    <span class="text-xs text-gray-500 mt-1">Data do Sinal: ${item.dataSinal}</span>
                </div>
                
                <!-- Grupo de Badges à direita -->
                <div class="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                    <!-- Novo Badge de Abertura -->
                    <div class="flex items-center font-bold px-3 py-1 rounded-full text-xs ${classeCorAbertura}">
                        Open: ${item.aberturaBolsa || "..."}
                    </div>
                    
                    <!-- Seu Badge Antigo de Fechamento -->
                    <div class="flex items-center font-bold px-3 py-1 rounded-full text-xs ${classeCor}">
                        Close: ${item.resultadoBolsa}
                    </div>
                </div>
            </div>
        `;


        blocoListaHistorico.insertAdjacentHTML('beforeend', linhaHtml);
    });
}


botaoAtualizar.addEventListener('click', () => {
    // 1. Destrava o áudio se estiver suspenso pelo navegador
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    // 2. Executa a lógica do seu scanner de ações
    executarScanner();
});

// Função que verifica o horário e simula o clique do botão
function agendarCliqueAutomatizado() {
    setInterval(() => {
        const agora = new Date();
        const diaDaSemana = agora.getDay(); // 0 = Domingo, 6 = Sábado
        const hora = agora.getHours();
        const minuto = agora.getMinutes();

        // Se for Sábado (6) ou Domingo (0), o robô não faz nada
        if (diaDaSemana === 0 || diaDaSemana === 6) {
            return; 
        }

        const minutosAtuais = (hora * 60) + minuto;
        const inicioBolsa = (10 * 60) + 15; // 10:15
        const fimBolsa = (17 * 60) + 0;     // 17:00

        if (minutosAtuais >= inicioBolsa && minutosAtuais <= fimBolsa) {
            console.log(`[Automação] Disparando atualização: ${hora}:${minuto.toString().padStart(2, '0')}`);
            botaoAtualizar.click();
        }
    }, 15 * 60 * 1000); // Executa a checagem a cada 15 minutos
}

agendarCliqueAutomatizado();

let audioCtx = null;

function tocarBeep() {
    try {
        // Inicializa o áudio apenas na primeira execução para economizar RAM
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Se o navegador suspendeu o áudio por falta de clique, tenta reativar
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
            return; // Ignora o primeiro bipe silencioso até o usuário interagir
        }

        // Gera o som compartilhando o mesmo contexto global
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = 600; 
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); 

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15); 
        
    } catch (erro) {
        // Evita que o erro trave a execução do restante do seu scanner
        console.log("Aviso de áudio contido:", erro.message);
    }
}


