// app_teste.js - Painel de Simulação de Ativos

(function() {
    // 1. Cria o container do painel de simulação dentro do HTML existente
    const containerAbasAtivos = document.getElementById('container-abas-ativos');
    
    if (!containerAbasAtivos) return;

    // Cria a estrutura visual do painel logo abaixo das abas
    const painelSimulacao = document.createElement('div');
    painelSimulacao.id = 'painel-simulacao-ativos';
    painelSimulacao.className = 'mt-6 bg-gray-850 bg-opacity-40 border border-gray-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-6 transition-all duration-300';
    
    // Injeta o HTML estrutural básico do painel (Preço, Posição e Botão)
    painelSimulacao.innerHTML = `
        <!-- Cabeçalho do Ativo Selecionado -->
        <div class="flex justify-between items-center border-b border-gray-800 pb-3">
            <h3 id="simulacao-ticket" class="text-xl font-bold text-gray-100 tracking-wide">---</h3>
            <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Simulador 16:45</span>
        </div>

        <!-- Grid de Informações: Preço e Estado -->
        <div class="grid grid-cols-2 gap-4 text-center">
            <!-- Bloco de Preço -->
            <div class="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Preço Atual</span>
                <div id="simulacao-preco" class="text-2xl font-black text-gray-200">R$ --,--</div>
            </div>

            <!-- Bloco de Estado/Posição -->
            <div id="simulacao-estado-card" class="rounded-xl p-4 border transition-all duration-300">
                <span class="text-xs font-semibold uppercase tracking-wider block mb-1">Posição Atual</span>
                <div id="simulacao-estado-texto" class="text-2xl font-black uppercase">---</div>
            </div>
        </div>

        <!-- Botão Unificado de Inversão de Posição -->
        <div class="flex justify-center pt-2">
            <button id="btn-inverter-posicao" class="w-full max-w-sm flex items-center justify-center bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-gray-100 font-bold py-3 px-6 rounded-xl shadow-lg transform active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 text-base gap-2">
                <svg xmlns="http://w3.org" class="h-5 w-5 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.253 8H18" />
                </svg>
                <span>Inverter Posição</span>
            </button>
        </div>
    `;

    // Insere o painel logo após o bloco de abas
    containerAbasAtivos.parentNode.insertBefore(painelSimulacao, containerAbasAtivos.nextSibling);

    // 2. Banco de dados local temporário (MOCK) para simular o comportamento visual antes do Supabase
    const dadosAtivos = {
        'CSAN3': { preco: '18,45', posicao: 'LONG' },
        'CEAB3': { preco: '12,10', posicao: 'SHORT' },
        'VAMO3': { preco: '8,92',  posicao: 'LONG' }
    };

    let ativoAtual = 'CSAN3'; // Começa na primeira aba padrão

    // Elementos internos do painel para manipulação
    const txtTicket = document.getElementById('simulacao-ticket');
    const txtPreco = document.getElementById('simulacao-preco');
    const cardEstado = document.getElementById('simulacao-estado-card');
    const txtEstado = document.getElementById('simulacao-estado-texto');
    const btnInverter = document.getElementById('btn-inverter-posicao');

    // 3. Função para atualizar o design com base no ativo e estado (Long/Short)
    function atualizarPainelVisual(ticket) {
        ativoAtual = ticket;
        const dados = dadosAtivos[ticket];

        txtTicket.innerText = ticket;
        txtPreco.innerText = `R$ ${dados.preco}`;

        if (dados.posicao === 'LONG') {
            // Estilização Verde para LONG (Comprado)
            cardEstado.className = "rounded-xl p-4 border bg-emerald-950 bg-opacity-40 border-emerald-800 text-emerald-400 transition-all duration-300";
            txtEstado.innerText = "LONG (Comprado)";
        } else {
            // Estilização Vermelha para SHORT (Vendido)
            cardEstado.className = "rounded-xl p-4 border bg-rose-950 bg-opacity-40 border-rose-900 text-rose-400 transition-all duration-300";
            txtEstado.innerText = "SHORT (Vendido)";
        }
    }

    // 4. Escuta os cliques nas abas do HTML principal para renderizar o ativo correto
    const botoesAbas = document.querySelectorAll('.aba-ativo');
    botoesAbas.forEach(botao => {
        botao.addEventListener('click', function() {
            const ticket = this.getAttribute('data-ativo');
            atualizarPainelVisual(ticket);
        });
    });

    // 5. Lógica do clique no Botão "Inverter" (Simulação Local)
    btnInverter.addEventListener('click', function() {
        // Inverte o estado no nosso objeto local temporário
        if (dadosAtivos[ativoAtual].posicao === 'LONG') {
            dadosAtivos[ativoAtual].posicao = 'SHORT';
        } else {
            dadosAtivos[ativoAtual].posicao = 'LONG';
        }
        
        // Atualiza a tela imediatamente com o novo design
        atualizarPainelVisual(ativoAtual);
        
        console.log(`Posição de ${ativoAtual} invertida para:`, dadosAtivos[ativoAtual].posicao);
    });

    // Inicializa o painel exibindo o primeiro ativo (CSAN3) ao carregar a tela
    atualizarPainelVisual('CSAN3');

})();

