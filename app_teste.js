    // === ENCAIXAR ESTA NOVA FUNÇÃO AQUI ===
const SUPABASE_URL = 'https://zqdjkazwinzmmtwgpycn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_s3vcDX41fY9DA48qO8k80g_cZTOckMg';
// const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

(function() {
    // 1. Cria o container do painel de simulação dentro do HTML existente
    
    
    const containerAbasAtivos = document.getElementById('container-abas-ativos');
    
    if (!containerAbasAtivos) return;

    // Remove o painel antigo caso ele já exista na tela (evita duplicar ao alternar scripts)
    const painelAntigo = document.getElementById('painel-simulacao-ativos');
    if (painelAntigo) painelAntigo.remove();

    // Cria a estrutura visual do painel logo abaixo das abas
    const painelSimulacao = document.createElement('div');
    painelSimulacao.id = 'painel-simulacao-ativos';
    painelSimulacao.className = 'mt-6 bg-gray-850 bg-opacity-40 border border-gray-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-5 transition-all duration-300';
    
    // Injeta o HTML estrutural atualizado com o campo de data e o card de última negociação abaixo do botão
    painelSimulacao.innerHTML = `
        <!-- Cabeçalho do Ativo Selecionado -->
        <div class="flex justify-between items-center border-b border-gray-800 pb-3">
            <div class="flex items-baseline gap-2">
                <h3 id="simulacao-ticket" class="text-xl font-bold text-gray-100 tracking-wide">---</h3>
                <span id="simulacao-data-inicio" class="text-xs text-gray-500 font-medium">Início: --/--</span>
            </div>
            <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Simulador 16:45</span>
        </div>

        <!-- Grid de Informações: Preço de Entrada da Simulação e Estado -->
        <div class="grid grid-cols-2 gap-4 text-center">
            <!-- Bloco de Preço de Entrada (Dia 10/07) -->
            <div class="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex flex-col justify-center">
                <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Preço Entrada</span>
                <div id="simulacao-preco" class="text-2xl font-black text-gray-200">R$ --,--</div>
            </div>

            <!-- Bloco de Estado/Posição -->
            <div id="simulacao-estado-card" class="rounded-xl p-4 border transition-all duration-300 flex flex-col justify-center">
                <span class="text-xs font-semibold uppercase tracking-wider block mb-1">Posição Atual</span>
                <div id="simulacao-estado-texto" class="text-xl font-black uppercase">---</div>
            </div>
        </div>

        <!-- Botão Unificado de Inversão de Posição -->
        <div class="flex justify-center pt-1">
            <button id="btn-inverter-posicao" class="w-full max-w-sm flex items-center justify-center bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-gray-100 font-bold py-3 px-6 rounded-xl shadow-lg transform active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 text-base gap-2">
                <svg xmlns="http://w3.org" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.253 8H18" />
                </svg>
                <span>Inverter Posição</span>
            </button>
        </div>

        <!-- NOVO CARD: ÚLTIMA NEGOCIAÇÃO DA BOLSA (Abaixo do botão inverter) -->
        <div class="bg-gray-900/30 border border-gray-800 rounded-xl p-3 flex justify-between items-center text-sm px-4">
            <div class="flex items-center gap-2">
                <span class="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="text-gray-400 font-medium">Última Negociação (B3)</span>
                <span id="simulacao-rentabilidade" class="text-xs font-bold ml-1 transition-all duration-300"></span>
            </div>
            <div id="simulacao-preco-mercado" class="font-bold text-gray-100 text-base">R$ --,--</div>
        </div>
    `;

    // Insere o painel logo após o bloco de abas
    containerAbasAtivos.parentNode.insertBefore(painelSimulacao, containerAbasAtivos.nextSibling);

    // 2. Banco de dados local contendo o preço fixo de Entrada (10/07) e o preço Atual de mercado da Bolsa (B3)
    const dadosAtivos = {
        'CEAB3': { precoEntrada: '9,34', precoMercado: '8,89', posicao: 'SHORT', inicio: '10/07' },
        'VAMO3': { precoEntrada: '3,46', precoMercado: '3,35', posicao: 'SHORT', inicio: '10/07' },
        'CSAN3': { precoEntrada: '3,85', precoMercado: '3,67', posicao: 'SHORT', inicio: '10/07' }
    };

    let ativoAtual = 'CEAB3'; // Iniciando na primeira aba por padrão

    // Elementos internos do painel para manipulação
    const txtTicket = document.getElementById('simulacao-ticket');
    const txtDataInicio = document.getElementById('simulacao-data-inicio');
    const txtPrecoEntrada = document.getElementById('simulacao-preco');
    const txtPrecoMercado = document.getElementById('simulacao-preco-mercado');
    const txtRentabilidade = document.getElementById('simulacao-rentabilidade'); 
    const cardEstado = document.getElementById('simulacao-estado-card');
    const txtEstado = document.getElementById('simulacao-estado-texto');
    const btnInverter = document.getElementById('btn-inverter-posicao');

    // 3. Função para renderizar as informações e aplicar as cores correspondentes
    async function atualizarPainelVisual(ticket) {
        ativoAtual = ticket;
        // Busca os dados atualizados na nuvem antes de renderizar na tela
        await buscarDadosSupabase(ticket);

        const dados = dadosAtivos[ticket];
        if (!dados) return;

        txtTicket.innerText = ticket;
        txtDataInicio.innerText = `Início: ${dados.inicio}`;
        txtPrecoEntrada.innerText = `R$ ${dados.precoEntrada}`;
        txtPrecoMercado.innerText = `R$ ${dados.precoMercado}`;

        if (dados.posicao === 'LONG') {
            cardEstado.className = "rounded-xl p-4 border bg-emerald-950 bg-opacity-40 border-emerald-800 text-emerald-400 transition-all duration-300 flex flex-col justify-center";
            txtEstado.innerText = "LONG";
        } else {
            cardEstado.className = "rounded-xl p-4 border bg-rose-950 bg-opacity-40 border-rose-900 text-rose-400 transition-all duration-300 flex flex-col justify-center";
            txtEstado.innerText = "SHORT";
        }
        buscarPrecoB3(ticket); 
    }

    // 4. Escuta os cliques nas abas do HTML principal
    const botoesAbas = document.querySelectorAll('.aba-ativo');
    botoesAbas.forEach(botao => {
        botao.addEventListener('click', function() {
            const ticket = this.getAttribute('data-ativo');
            atualizarPainelVisual(ticket);
        });
    });

    // 5. Lógica do clique no Botão "Inverter" (Simulação local)
    btnInverter.addEventListener('click', function() {
        if (dadosAtivos[ativoAtual].posicao === 'LONG') {
            dadosAtivos[ativoAtual].posicao = 'SHORT';
        } else {
            dadosAtivos[ativoAtual].posicao = 'LONG';
        }
        
        // Renderiza as mudanças na tela
        atualizarPainelVisual(ativoAtual);
        console.log(`[Simulação] Posição de ${ativoAtual} mudou para:`, dadosAtivos[ativoAtual].posicao);
    });

    // Inicializa exibindo CEAB3 por padrão
    atualizarPainelVisual('CEAB3');

    async function buscarDadosSupabase(ticket) {
        try {
            // Monta a URL REST filtrando pelo ticket exato (eq.TICKET)
            const url = `${SUPABASE_URL}/rest/v1/simulacao_ativos?ticket=eq.${ticket}&select=posicao,preco_atual,data_inicio`;
        
            const resposta = await fetch(url, {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_KEY, // Use a sua variável de chave aqui
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Accept': 'application/vnd.pgrst.object+json' // Força o Supabase a devolver um objeto único em vez de uma lista []
                }
            });

            if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);

            const data = await resposta.json();

            if (data) {
                // Formata a data de '2026-07-10' para o padrão visual '10/07'
                const [ano, mes, dia] = data.data_inicio.split('-');
                const dataFormatada = `${dia}/${mes}`;

                // Atualiza o nosso objeto temporário local com os dados reais vindos da API REST
                dadosAtivos[ticket].posicao = data.posicao;
                dadosAtivos[ticket].precoEntrada = data.preco_atual.toString().replace('.', ',');
                dadosAtivos[ticket].inicio = dataFormatada;

                console.log(`[Supabase REST] Dados carregados para ${ticket}:`, data);
                return true;
            }
        } catch (erro) {
            console.error(`Erro ao buscar dados de ${ticket} no Supabase via REST:`, erro);
        }
        return false;
    }

    
    async function buscarPrecoB3(ticket) {
        try {
            // Mostra um estado de carregando enquanto busca
            txtPrecoMercado.innerText = "Atualizando...";
            
            // Faz a requisição para a API gratuita do Brapi
            const token = "whN8hFPcawDXwGhjRLAoN7";
            const url = `https://brapi.dev/api/quote/${ticket}?token=${token}`;
            const resposta = await fetch(url);
            // const resposta = await fetch(`https://brapi.dev{ticket}?token=whN8hFPcawDXwGhjRLAoN7`);
            
            const dadosApi = Milford = await resposta.json();
            
            if (dadosApi && dadosApi.results && dadosApi.results[0]) {
                const precoFechamento = dadosApi.results[0].regularMarketPrice;
                
                // Formata o número recebido para o padrão brasileiro (Ex: 8,89)
                const precoFormatado = precoFechamento.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
                
                // Atualiza o nosso objeto temporário local com o dado real obtido
                dadosAtivos[ticket].precoMercado = precoFormatado;
              
                const pEntrada = parseFloat(dadosAtivos[ticket].precoEntrada.replace(',', '.'));
                const pMercado = precoFechamento; // Usa o valor numérico direto da API
                const posicaoAtual = dadosAtivos[ticket].posicao;
                
                let rentabilidade = 0;
                
                // Calcula baseado na direção (Se for SHORT, inverte o ganho/perda)
                if (posicaoAtual === 'LONG') {
                    rentabilidade = ((pMercado - pEntrada) / pEntrada) * 100; // Ajustado para simulação percentual
                } else {
                    rentabilidade = ((pEntrada - pMercado) / pEntrada) * 100;
                }

                // Ajusta a cor e o texto do badge de porcentagem
                if (rentabilidade > 0) {
                    txtRentabilidade.innerText = `(+${rentabilidade.toFixed(2)}%)`;
                    txtRentabilidade.className = "text-xs font-bold ml-1 text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded";
                } else if (rentabilidade < 0) {
                    txtRentabilidade.innerText = `(${rentabilidade.toFixed(2)}%)`;
                    txtRentabilidade.className = "text-xs font-bold ml-1 text-rose-400 bg-rose-950/50 px-1.5 py-0.5 rounded";
                } else {
                    txtRentabilidade.innerText = `(0.00%)`;
                    txtRentabilidade.className = "text-xs font-bold ml-1 text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded";
                }

                // Exibe o preço atualizado na tela
                txtPrecoMercado.innerText = `R$ ${precoFormatado}`;
            } else {
                txtPrecoMercado.innerText = "Erro ao ler dados";
            }
        } catch (erro) {
            console.error("Erro ao buscar cotação na B3:", erro);
            txtPrecoMercado.innerText = "Erro de conexão";
        }
    }
})();

