// Variáveis globais para armazenar os dados
let filteredComponents = [];

// Configuração das colunas baseada no modelo de layout
const COLUMN_MAPPING = {
    consumo: {
        estrutural: 0,    // Coluna A
        nivel: 2,         // Coluna C
        quantidade: 13    // Coluna N
    },
    estoque: {
        codigo: 0,        // Coluna A
        descricao: 1,     // Coluna B
        estoqueAtual: 8,  // Coluna I
        ofsItem: 10,      // Coluna K
        ofsConsomem: 11,  // Coluna L
        ofsAbertas: 12,   // Coluna M
        ofsAcima: 13,     // Coluna N
        estoqueDisponivel: 15 // Coluna P
    },
    ordens: {
        programadas: 7,   // Coluna H
        produzidas: 8     // Coluna I
    }
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    updateLastUpdateTime();
    loadComponentData();
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    // Busca em tempo real
    document.getElementById('componentSearch').addEventListener('input', filterComponents);
    
    // Filtros
    document.getElementById('stockFilter').addEventListener('change', filterComponents);
    document.getElementById('ofFilter').addEventListener('change', filterComponents);
}

// Atualizar timestamp
function updateLastUpdateTime() {
    const now = new Date();
    const formatted = now.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('lastUpdate').textContent = formatted;
}

// Carregar dados dos componentes
function loadComponentData() {
    // Os dados agora vêm do arquivo data.js que é carregado antes deste script
    // A variável componentData está disponível globalmente
    if (typeof componentData !== 'undefined' && Object.keys(componentData).length > 0) {
        console.log('Dados carregados do arquivo data.js:', Object.keys(componentData).length, 'componentes');
    } else {
        console.log('Carregando dados de exemplo...');
        // Se não conseguir carregar, usar dados de exemplo
        window.componentData = {
            "1": {
                codigo: "1",
                descricao: "PEÇAS DIVERSAS PARA MOSTRUÁRIO",
                estoqueAtual: 0,
                ofsDoItem: 0,
                ofsQueConsomem: 0,
                ofsPedidosAbertas: 0,
                ofsPedidosAcima: 0,
                estoqueDisponivelFuturo: 0,
                usadoEm: [],
                ordensFabricacao: []
            },
            "12": {
                codigo: "12",
                descricao: "PERFIL EXTENSOR",
                estoqueAtual: 0,
                ofsDoItem: 0,
                ofsQueConsomem: 0,
                ofsPedidosAbertas: 0,
                ofsPedidosAcima: 0,
                estoqueDisponivelFuturo: 0,
                usadoEm: [],
                ordensFabricacao: []
            },
            "PARAF001": {
                codigo: "PARAF001",
                descricao: "Parafuso M8x20",
                estoqueAtual: 150,
                ofsDoItem: 2,
                ofsQueConsomem: 3,
                ofsPedidosAbertas: 1,
                ofsPedidosAcima: 0,
                estoqueDisponivelFuturo: 145,
                usadoEm: ["Produto A", "Produto B"],
                ordensFabricacao: [
                    { programadas: 5, produzidas: 2 },
                    { programadas: 3, produzidas: 3 }
                ]
            }
        };
    }
    
    renderComponents();
    updateSummaryCards();
}

// Renderizar componentes
function renderComponents() {
    filteredComponents = Object.values(componentData);
    displayComponents(filteredComponents);
}

// Exibir componentes no grid
function displayComponents(components) {
    const grid = document.getElementById('componentsGrid');
    grid.innerHTML = '';
    
    if (components.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #718096;">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.5;"></i>
                <p style="font-size: 1.1rem;">Nenhum componente encontrado com os filtros aplicados.</p>
            </div>
        `;
        return;
    }
    
    components.forEach(component => {
        const card = createComponentCard(component);
        grid.appendChild(card);
    });
}

// Criar card de componente
function createComponentCard(component) {
    const card = document.createElement('div');
    card.className = 'component-card';
    card.onclick = () => openComponentModal(component);
    
    const stockStatus = getStockStatus(component);
    const hasOFs = component.ofsDoItem > 0 || component.ofsQueConsomem > 0;
    
    card.innerHTML = `
        <div class="component-header">
            <div>
                <div class="component-code">${component.codigo}</div>
                <div class="component-description">${component.descricao || 'Sem descrição'}</div>
            </div>
            <div class="component-status">
                <span class="status-badge ${stockStatus.class}">${stockStatus.text}</span>
                ${hasOFs ? '<i class="fas fa-cogs" style="color: #667eea; margin-top: 4px;" title="Com OFs ativas"></i>' : ''}
            </div>
        </div>
        
        <div class="component-metrics">
            <div class="metric">
                <span class="metric-value">${component.estoqueAtual || 0}</span>
                <span class="metric-label">Estoque Atual</span>
            </div>
            <div class="metric">
                <span class="metric-value">${component.estoqueDisponivelFuturo || 0}</span>
                <span class="metric-label">Estoque Futuro</span>
            </div>
            <div class="metric">
                <span class="metric-value">${component.ofsDoItem || 0}</span>
                <span class="metric-label">OFs do Item</span>
            </div>
            <div class="metric">
                <span class="metric-value">${component.ofsQueConsomem || 0}</span>
                <span class="metric-label">OFs Consomem</span>
            </div>
        </div>
        
        <div class="component-actions">
            <div class="action-info">
                ${component.usadoEm && component.usadoEm.length > 0 ? 
                    `<span><i class="fas fa-link"></i> Usado em ${component.usadoEm.length} item(ns)</span>` : 
                    '<span><i class="fas fa-info-circle"></i> Sem uso registrado</span>'
                }
            </div>
            <button class="view-details-btn" onclick="event.stopPropagation(); openComponentModal(componentData['${component.codigo}'])">
                Ver Detalhes
            </button>
        </div>
    `;
    
    return card;
}

// Determinar status do estoque
function getStockStatus(component) {
    const atual = component.estoqueAtual || 0;
    const futuro = component.estoqueDisponivelFuturo || 0;
    
    if (atual === 0) {
        return { class: 'status-zero', text: 'Zerado' };
    } else if (futuro <= 0 || atual <= 10) { // Considerando 10 como crítico
        return { class: 'status-critical', text: 'Crítico' };
    } else {
        return { class: 'status-available', text: 'Disponível' };
    }
}

// Filtrar componentes
function filterComponents() {
    const searchTerm = document.getElementById('componentSearch').value.toLowerCase();
    const stockFilter = document.getElementById('stockFilter').value;
    const ofFilter = document.getElementById('ofFilter').value;
    
    filteredComponents = Object.values(componentData).filter(component => {
        // Filtro de busca
        const matchesSearch = !searchTerm || 
            component.codigo.toLowerCase().includes(searchTerm) ||
            (component.descricao && component.descricao.toLowerCase().includes(searchTerm));
        
        // Filtro de estoque
        let matchesStock = true;
        if (stockFilter === 'available') {
            matchesStock = (component.estoqueDisponivelFuturo || 0) > 0;
        } else if (stockFilter === 'critical') {
            matchesStock = (component.estoqueAtual || 0) <= 10 && (component.estoqueAtual || 0) > 0;
        } else if (stockFilter === 'zero') {
            matchesStock = (component.estoqueAtual || 0) === 0;
        }
        
        // Filtro de OFs
        let matchesOF = true;
        if (ofFilter === 'with-ofs') {
            matchesOF = (component.ofsDoItem || 0) > 0;
        } else if (ofFilter === 'consuming') {
            matchesOF = (component.ofsQueConsomem || 0) > 0;
        }
        
        return matchesSearch && matchesStock && matchesOF;
    });
    
    displayComponents(filteredComponents);
    updateSummaryCards();
}

// Atualizar cards de resumo
function updateSummaryCards() {
    const components = filteredComponents.length > 0 ? filteredComponents : Object.values(componentData);
    
    document.getElementById('totalComponents').textContent = components.length;
    
    const withStock = components.filter(c => (c.estoqueDisponivelFuturo || 0) > 0).length;
    document.getElementById('componentsWithStock').textContent = withStock;
    
    const critical = components.filter(c => {
        const atual = c.estoqueAtual || 0;
        return atual <= 10 && atual > 0;
    }).length;
    document.getElementById('criticalStock').textContent = critical;
    
    const withOFs = components.filter(c => (c.ofsDoItem || 0) > 0).length;
    document.getElementById('componentsWithOFs').textContent = withOFs;
}

// Abrir modal de detalhes do componente
function openComponentModal(component) {
    const modal = document.getElementById('componentModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = `${component.codigo} - ${component.descricao || 'Sem descrição'}`;
    
    modalBody.innerHTML = `
        <div class="detail-section">
            <h3><i class="fas fa-info-circle"></i> Informações Gerais</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-item-label">Código</div>
                    <div class="detail-item-value">${component.codigo}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-item-label">Descrição</div>
                    <div class="detail-item-value">${component.descricao || 'Sem descrição'}</div>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3><i class="fas fa-warehouse"></i> Estoque</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-item-label">Estoque Atual</div>
                    <div class="detail-item-value">${component.estoqueAtual || 0}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-item-label">Estoque Disponível Futuro</div>
                    <div class="detail-item-value">${component.estoqueDisponivelFuturo || 0}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-item-label">Status</div>
                    <div class="detail-item-value">
                        <span class="status-badge ${getStockStatus(component).class}">
                            ${getStockStatus(component).text}
                        </span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3><i class="fas fa-cogs"></i> Ordens de Fabricação</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-item-label">OFs do Item</div>
                    <div class="detail-item-value">${component.ofsDoItem || 0}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-item-label">OFs que Consomem</div>
                    <div class="detail-item-value">${component.ofsQueConsomem || 0}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-item-label">OFs Pedidos Abertas</div>
                    <div class="detail-item-value">${component.ofsPedidosAbertas || 0}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-item-label">OFs Pedidos Acima</div>
                    <div class="detail-item-value">${component.ofsPedidosAcima || 0}</div>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3><i class="fas fa-link"></i> Onde é Usado</h3>
            ${component.usadoEm && component.usadoEm.length > 0 ? `
                <ul class="usage-list">
                    ${component.usadoEm.map(uso => `
                        <li class="usage-item">
                            <div class="usage-item-title">${typeof uso === 'string' ? uso : uso.itemPai || 'Item não identificado'}</div>
                            ${typeof uso === 'object' ? `
                                <div class="usage-item-details">
                                    Nível: ${uso.nivel || 'N/A'} | 
                                    Quantidade: ${uso.quantidadeNaEstrutura || 'N/A'}
                                </div>
                            ` : ''}
                        </li>
                    `).join('')}
                </ul>
            ` : `
                <p style="color: #718096; font-style: italic;">
                    <i class="fas fa-info-circle"></i> Este componente não possui registros de uso em outros itens.
                </p>
            `}
        </div>
        
        ${component.ordensFabricacao && component.ordensFabricacao.length > 0 ? `
            <div class="detail-section">
                <h3><i class="fas fa-tasks"></i> Detalhes das Ordens de Fabricação</h3>
                <div class="detail-grid">
                    ${component.ordensFabricacao.map((of, index) => `
                        <div class="detail-item">
                            <div class="detail-item-label">OF ${index + 1}</div>
                            <div class="detail-item-value">
                                Programadas: ${of.programadas || 0}<br>
                                Produzidas: ${of.produzidas || 0}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    `;
    
    modal.style.display = 'flex';
}

// Fechar modal
function closeModal() {
    document.getElementById('componentModal').style.display = 'none';
}

// Fechar modal clicando fora
document.getElementById('componentModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Manipulação de upload de arquivos
function handleFileUpload(input, type) {
    const file = input.files[0];
    const statusElement = document.getElementById(`${type}Status`);
    
    if (file) {
        statusElement.textContent = `Arquivo selecionado: ${file.name}`;
        statusElement.className = 'upload-status success';
        
        // Verificar se todos os arquivos foram selecionados
        checkAllFilesSelected();
    } else {
        statusElement.textContent = 'Nenhum arquivo selecionado';
        statusElement.className = 'upload-status';
    }
}

// Verificar se todos os arquivos foram selecionados
function checkAllFilesSelected() {
    const consumoFile = document.getElementById('consumoFile').files[0];
    const estoqueFile = document.getElementById('estoqueFile').files[0];
    const ordensFile = document.getElementById('ordensFile').files[0];
    
    const processBtn = document.getElementById('processBtn');
    processBtn.disabled = !(consumoFile && estoqueFile && ordensFile);
}

// Processar todos os arquivos
async function processAllFiles() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.style.display = 'flex';
    
    try {
        const consumoFile = document.getElementById('consumoFile').files[0];
        const estoqueFile = document.getElementById('estoqueFile').files[0];
        const ordensFile = document.getElementById('ordensFile').files[0];
        
        // Processar cada arquivo
        let consumoData = [];
        let estoqueData = [];
        let ordensData = [];
        
        if (consumoFile) {
            consumoData = await processExcelFile(consumoFile, 'consumo');
        }
        
        if (estoqueFile) {
            estoqueData = await processExcelFile(estoqueFile, 'estoque');
        }
        
        if (ordensFile) {
            ordensData = await processExcelFile(ordensFile, 'ordens');
        }
        
        // Processar e cruzar dados
        window.componentData = processAndCrossReferenceData(consumoData, estoqueData, ordensData);
        
        // Atualizar interface
        renderComponents();
        updateSummaryCards();
        updateLastUpdateTime();
        
        // Mostrar mensagem de sucesso
        alert('Dados atualizados com sucesso!');
        
    } catch (error) {
        console.error('Erro ao processar arquivos:', error);
        alert('Erro ao processar os arquivos. Verifique o formato e tente novamente.');
    } finally {
        loadingOverlay.style.display = 'none';
    }
}

// Processar arquivo Excel
function processExcelFile(file, type) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                const processedData = processDataByType(jsonData, type);
                resolve(processedData);
                
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = function() {
            reject(new Error('Erro ao ler o arquivo'));
        };
        
        reader.readAsArrayBuffer(file);
    });
}

// Processar dados por tipo
function processDataByType(rawData, type) {
    const mapping = COLUMN_MAPPING[type];
    const processedData = [];
    
    // Encontrar linha de cabeçalho
    let headerRow = 0;
    for (let i = 0; i < Math.min(10, rawData.length); i++) {
        const row = rawData[i];
        if (type === 'consumo' && row.some(cell => String(cell).toLowerCase().includes('estrutural'))) {
            headerRow = i + 1;
            break;
        } else if (type === 'estoque' && row.some(cell => String(cell).toLowerCase().includes('código'))) {
            headerRow = i + 1;
            break;
        } else if (type === 'ordens' && row.some(cell => String(cell).toLowerCase().includes('programado'))) {
            headerRow = i + 1;
            break;
        }
    }
    
    // Processar dados a partir da linha após o cabeçalho
    for (let i = headerRow; i < rawData.length; i++) {
        const row = rawData[i];
        
        if (type === 'consumo') {
            const item = {
                estrutural: row[mapping.estrutural] || '',
                nivel: row[mapping.nivel] || '',
                quantidade: parseFloat(row[mapping.quantidade]) || 0
            };
            
            if (item.estrutural || item.nivel || item.quantidade) {
                processedData.push(item);
            }
            
        } else if (type === 'estoque') {
            const item = {
                codigo: row[mapping.codigo] || '',
                descricao: row[mapping.descricao] || '',
                estoqueAtual: parseFloat(row[mapping.estoqueAtual]) || 0,
                ofsItem: parseFloat(row[mapping.ofsItem]) || 0,
                ofsConsomem: parseFloat(row[mapping.ofsConsomem]) || 0,
                ofsAbertas: parseFloat(row[mapping.ofsAbertas]) || 0,
                ofsAcima: parseFloat(row[mapping.ofsAcima]) || 0,
                estoqueDisponivel: parseFloat(row[mapping.estoqueDisponivel]) || 0
            };
            
            if (item.codigo && item.codigo !== 'nan') {
                processedData.push(item);
            }
            
        } else if (type === 'ordens') {
            const item = {
                programadas: parseFloat(row[mapping.programadas]) || 0,
                produzidas: parseFloat(row[mapping.produzidas]) || 0
            };
            
            if (item.programadas || item.produzidas) {
                processedData.push(item);
            }
        }
    }
    
    return processedData;
}

// Processar e cruzar dados
function processAndCrossReferenceData(consumoData, estoqueData, ordensData) {
    const components = {};
    
    // Processar dados de estoque como base
    estoqueData.forEach(item => {
        if (item.codigo && item.codigo !== 'nan') {
            components[item.codigo] = {
                codigo: item.codigo,
                descricao: item.descricao,
                estoqueAtual: item.estoqueAtual,
                ofsDoItem: item.ofsItem,
                ofsQueConsomem: item.ofsConsomem,
                ofsPedidosAbertas: item.ofsAbertas,
                ofsPedidosAcima: item.ofsAcima,
                estoqueDisponivelFuturo: item.estoqueDisponivel,
                usadoEm: [],
                ordensFabricacao: []
            };
        }
    });
    
    // Adicionar informações de consumo
    consumoData.forEach(item => {
        if (item.estrutural && components[item.estrutural]) {
            components[item.estrutural].usadoEm.push({
                itemPai: item.estrutural,
                nivel: item.nivel,
                quantidadeNaEstrutura: item.quantidade
            });
        }
    });
    
    // Adicionar informações de ordens (genérico)
    ordensData.forEach(item => {
        Object.keys(components).forEach(codigo => {
            if (components[codigo].ofsDoItem > 0) {
                components[codigo].ordensFabricacao.push({
                    programadas: item.programadas,
                    produzidas: item.produzidas
                });
            }
        });
    });
    
    return components;
}

// Função para atualizar dados (botão refresh)
function refreshData() {
    updateLastUpdateTime();
    renderComponents();
    updateSummaryCards();
    
    // Animação de feedback
    const btn = document.querySelector('.refresh-btn');
    btn.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        btn.style.transform = 'rotate(0deg)';
    }, 500);
}

