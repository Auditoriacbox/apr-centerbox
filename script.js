document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // 1. CAMPOS "OUTROS"
    // =========================================================

    function toggleOtherInput(checkboxId, containerId) {
        const checkbox = document.getElementById(checkboxId);
        const container = document.getElementById(containerId);

        if (!checkbox || !container) return;

        checkbox.addEventListener('change', function () {
            if (this.checked) {
                container.classList.add('active');
            } else {
                container.classList.remove('active');
            }
        });
    }

    toggleOtherInput('servico-outro-check', 'servico-outro-box');
    toggleOtherInput('riscos-outro-check', 'riscos-outro-box');
    toggleOtherInput('recomendacoes-outro-check', 'recomendacoes-outro-box');


    // =========================================================
    // 2. SISTEMA DE ASSINATURA (CANVAS)
    // =========================================================

    function configurarAssinatura(card) {
        const canvas = card.querySelector('.signature-pad');
        const btnClear = card.querySelector('.clear-signature');

        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let isDrawing = false;

        function ajustarCanvas() {
            const rect = canvas.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            const dpr = window.devicePixelRatio || 1;
            
            // Salva o desenho atual antes de redimensionar
            const tempImage = canvas.toDataURL();

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;

            ctx.scale(dpr, dpr);
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#000000';

            // Restaura o desenho
            const img = new Image();
            img.src = tempImage;
            img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
        }

        ajustarCanvas();

        function getPosition(event) {
            const rect = canvas.getBoundingClientRect();
            let clientX, clientY;

            if (event.touches && event.touches.length > 0) {
                clientX = event.touches[0].clientX;
                clientY = event.touches[0].clientY;
            } else {
                clientX = event.clientX;
                clientY = event.clientY;
            }

            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        }

        function startDrawing(event) {
            isDrawing = true;
            const pos = getPosition(event);
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            event.preventDefault();
        }

        function draw(event) {
            if (!isDrawing) return;
            const pos = getPosition(event);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            event.preventDefault();
        }

        function stopDrawing() {
            if (isDrawing) {
                isDrawing = false;
                ctx.closePath();
            }
        }

        // Eventos de Mouse
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);

        // Eventos Touch (Mobile)
        canvas.addEventListener('touchstart', startDrawing, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });
        canvas.addEventListener('touchend', stopDrawing);

        // Botão de Limpar Assinatura
        if (btnClear) {
            btnClear.addEventListener('click', function () {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            });
        }
    }

    // Inicializa assinatura do primeiro card fixo
    const primeiroColaborador = document.querySelector('.collaborator-card');
    if (primeiroColaborador) {
        configurarAssinatura(primeiroColaborador);
    }


    // =========================================================
    // 3. CONTROLE E GERENCIAMENTO DE COLABORADORES
    // =========================================================

    const collaboratorsContainer = document.getElementById('collaborators-container');
    const btnAddCollaborator = document.getElementById('btn-add-collaborator');
    let collaboratorCount = 1;

    function atualizarNumeracao() {
        if (!collaboratorsContainer) return;

        const cards = collaboratorsContainer.querySelectorAll('.collaborator-card');

        cards.forEach((card, index) => {
            const numero = index + 1;
            card.dataset.collaborator = numero;

            const titulo = card.querySelector('.collaborator-header strong');
            if (titulo) {
                titulo.textContent = `Colaborador ${String(numero).padStart(2, '0')}`;
            }

            const removeButton = card.querySelector('.remove-collaborator');
            if (removeButton) {
                removeButton.style.display = (numero === 1) ? 'none' : '';
            }
        });

        collaboratorCount = cards.length;
    }

    if (btnAddCollaborator && collaboratorsContainer) {
        btnAddCollaborator.addEventListener('click', function () {
            collaboratorCount++;

            const card = document.createElement('div');
            card.className = 'collaborator-card';
            card.dataset.collaborator = collaboratorCount;

            card.innerHTML = `
                <div class="collaborator-header">
                    <strong>Colaborador ${String(collaboratorCount).padStart(2, '0')}</strong>
                </div>

                <div class="form-group">
                    <label>Nome completo:</label>
                    <input type="text" class="collaborator-name" placeholder="Digite o nome completo">
                </div>

                <div class="signature-container">
                    <label>Assinatura:</label>
                    <p style="font-size: 13px; color: #666; margin-bottom: 8px;">
                        Assine abaixo usando o dedo (mobile) ou o mouse (desktop):
                    </p>
                    <canvas class="signature-pad" width="500" height="150"></canvas>
                    <div class="canvas-buttons">
                        <button class="btn btn-clear clear-signature" type="button">Limpar Assinatura</button>
                    </div>
                </div>

                <button type="button" class="btn remove-collaborator">Remover colaborador</button>
            `;

            collaboratorsContainer.appendChild(card);

            // Configura a assinatura para o novo card adicionado
            configurarAssinatura(card);

            // Evento para remover colaborador
            const removeButton = card.querySelector('.remove-collaborator');
            if (removeButton) {
                removeButton.addEventListener('click', function () {
                    card.remove();
                    atualizarNumeracao();
                });
            }

            atualizarNumeracao();
        });
    }


    // =========================================================
    // 4. MODAL DE SELEÇÃO DE LOCAL E SOLICITANTE
    // =========================================================

    // --- MODAL DE LOCAL ---
    const btnLocal = document.getElementById('btn-local');
    const modalLocal = document.getElementById('local-modal');
    const fecharLocal = document.getElementById('fechar-local');
    const localSelecionado = document.getElementById('local-selecionado');
    const opcoesLocal = document.querySelectorAll('#local-modal .local-option');

    if (btnLocal && modalLocal) {
        btnLocal.addEventListener('click', (e) => {
            e.preventDefault();
            modalLocal.style.display = 'flex';
        });
    }

    if (fecharLocal && modalLocal) {
        fecharLocal.addEventListener('click', (e) => {
            e.preventDefault();
            modalLocal.style.display = 'none';
        });
    }

    opcoesLocal.forEach((opcao) => {
        opcao.addEventListener('click', function () {
            const local = this.dataset.local;
            if (localSelecionado) localSelecionado.textContent = local;
            if (modalLocal) modalLocal.style.display = 'none';
        });
    });

    if (modalLocal) {
        modalLocal.addEventListener('click', (e) => {
            if (e.target === modalLocal) {
                modalLocal.style.display = 'none';
            }
        });
    }

    // --- MODAL DE SOLICITANTE ---
    const btnSolicitante = document.getElementById('btn-Solicitante');
    const modalSolicitante = document.getElementById('solicitante-modal');
    const fecharSolicitante = document.getElementById('fechar-solicitante');
    const solicitanteSelecionado = document.getElementById('Solicitante-selecionado');
    const opcoesSolicitante = document.querySelectorAll('.solicitante-option');

    if (btnSolicitante && modalSolicitante) {
        btnSolicitante.addEventListener('click', (e) => {
            e.preventDefault();
            modalSolicitante.style.display = 'flex';
        });
    }

    if (fecharSolicitante && modalSolicitante) {
        fecharSolicitante.addEventListener('click', (e) => {
            e.preventDefault();
            modalSolicitante.style.display = 'none';
        });
    }

    opcoesSolicitante.forEach((opcao) => {
        opcao.addEventListener('click', function () {
            const solicitante = this.dataset.solicitante;
            if (solicitanteSelecionado) solicitanteSelecionado.textContent = solicitante;
            if (modalSolicitante) modalSolicitante.style.display = 'none';
        });
    });

    if (modalSolicitante) {
        modalSolicitante.addEventListener('click', (e) => {
            if (e.target === modalSolicitante) {
                modalSolicitante.style.display = 'none';
            }
        });
    }


    // =========================================================
    // 5. VALIDAÇÕES DO FORMULÁRIO E ASSINATURA
    // =========================================================

    function canvasTemAssinatura(canvas) {
        if (!canvas) return false;
        const ctx = canvas.getContext('2d');
        if (!ctx) return false;

        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] !== 0) return true;
        }

        return false;
    }

    function validarColaboradores() {
        const cards = document.querySelectorAll('.collaborator-card');

        if (cards.length === 0) {
            alert('É necessário cadastrar pelo menos um colaborador.');
            return false;
        }

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            const numero = String(i + 1).padStart(2, '0');
            const nome = card.querySelector('.collaborator-name');
            const canvas = card.querySelector('.signature-pad');

            if (!nome || nome.value.trim() === '') {
                alert(`Informe o nome do Colaborador ${numero}.`);
                if (nome) nome.focus();
                return false;
            }

            if (!canvas || !canvasTemAssinatura(canvas)) {
                alert(`O Colaborador ${numero} precisa assinar a APR.`);
                return false;
            }
        }

        return true;
    }


    // =========================================================
    // 6. RESETAR FORMULÁRIO
    // =========================================================

    function resetForm() {
        const form = document.getElementById('apr-form-element');
        if (form) form.reset();

        document.querySelectorAll('.other-input-container').forEach(container => {
            container.classList.remove('active');
        });

        if (collaboratorsContainer) {
            const cards = collaboratorsContainer.querySelectorAll('.collaborator-card');
            cards.forEach((card, index) => {
                if (index > 0) card.remove();
            });
        }

        collaboratorCount = 1;

        const primeiro = document.querySelector('.collaborator-card');
        if (primeiro) {
            const canvas = primeiro.querySelector('.signature-pad');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            const nome = primeiro.querySelector('.collaborator-name');
            if (nome) nome.value = '';
        }

        if (localSelecionado) localSelecionado.textContent = 'Selecione o local';
        if (solicitanteSelecionado) solicitanteSelecionado.textContent = 'Selecione o Solicitante';

        atualizarNumeracao();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }


  // =========================================================
    // 7. GERAÇÃO DE PDF NATIVO COM JSPDF + AUTOTABLE
    // =========================================================

    function generatePDF() {
        if (!validarColaboradores()) return;

        if (!window.jspdf || !window.jspdf.jsPDF) {
            alert('Erro: A biblioteca jsPDF não foi carregada. Verifique os scripts no HTML.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const verdeGrupo = [0, 100, 50]; // Cor verde institucional (RGB)
        let cursorY = 15;

        // --- VERIFICAÇÃO E INSERÇÃO DO LOGOTIPO ---
        const temLogo = (typeof LOGO_CENTERBOX !== 'undefined' && LOGO_CENTERBOX !== '');
        
        if (temLogo) {
            doc.addImage(LOGO_CENTERBOX, 'PNG', 10, 10, 35, 15);
        }

        // Alinhamento do cabeçalho cobrindo exatamente a largura da página (até X = 200)
        const headerX = temLogo ? 50 : 10;
        const headerWidth = temLogo ? 150 : 190;

        // --- CABEÇALHO ---
        doc.setFillColor(...verdeGrupo);
        doc.rect(headerX, cursorY, headerWidth, 12, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        
        const titleX = headerX + (headerWidth / 2);
        doc.text('ANÁLISE PRELIMINAR DE RISCO - APR', titleX, cursorY + 8, { align: 'center' });

        cursorY += 22;

        // --- INFORMAÇÕES GERAIS ---
        const solicitante = document.getElementById('Solicitante-selecionado')?.textContent.trim() || 'Não informado';
        const atividade = document.getElementById('atividade')?.value.trim() || 'N/A';
        const localText = document.getElementById('local-selecionado')?.textContent.trim() || 'Não informado';
        const os = document.getElementById('os')?.value.trim() || 'N/A';
        const responsavel = document.getElementById('responsavel')?.value.trim() || 'N/A';
        const dataInput = document.getElementById('data')?.value;
        const dataFormatada = dataInput ? new Date(dataInput + 'T00:00:00').toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);

        // Linha 1
        doc.setFont('helvetica', 'bold'); doc.text(`Solicitante:`, 10, cursorY);
        doc.setFont('helvetica', 'normal'); doc.text(solicitante, 30, cursorY);

        doc.setFont('helvetica', 'bold'); doc.text(`Atividade:`, 80, cursorY);
        doc.setFont('helvetica', 'normal'); doc.text(atividade, 98, cursorY);

        doc.setFont('helvetica', 'bold'); doc.text(`Local:`, 150, cursorY);
        doc.setFont('helvetica', 'normal'); doc.text(localText, 162, cursorY);

        // --- PRIMEIRA LINHA TRACEJADA ---
        doc.setDrawColor(...verdeGrupo);
        doc.setLineWidth(0.5);
        doc.setLineDashPattern([2, 1], 0); // Padrão tracejado
        doc.line(10, cursorY + 2.5, 200, cursorY + 2.5);

        cursorY += 7;

        // Linha 2
        doc.setFont('helvetica', 'bold'); doc.text(`Nº OS:`, 10, cursorY);
        doc.setFont('helvetica', 'normal'); doc.text(os, 25, cursorY);

        doc.setFont('helvetica', 'bold'); doc.text(`Responsável:`, 80, cursorY);
        doc.setFont('helvetica', 'normal'); doc.text(responsavel, 103, cursorY);

        doc.setFont('helvetica', 'bold'); doc.text(`Data:`, 150, cursorY);
        doc.setFont('helvetica', 'normal'); doc.text(dataFormatada, 162, cursorY);

        // --- SEGUNDA LINHA TRACEJADA ---
        doc.line(10, cursorY + 2.5, 200, cursorY + 2.5);

        // RESETA O ESTILO DA LINHA PARA SÓLIDO
        doc.setLineDashPattern([], 0);

        cursorY += 8;

        // --- EXTRAÇÃO DE CHECKBOXES E OUTROS ---
        function getCheckedValues(containerSelector, otherCheckId, otherInputId) {
            const checked = [];
            const items = document.querySelectorAll(`${containerSelector} input[type="checkbox"]:checked`);
            
            items.forEach(item => {
                if (item.id === otherCheckId) {
                    const otherVal = document.getElementById(otherInputId)?.value.trim();
                    if (otherVal) checked.push(`Outros: ${otherVal}`);
                } else {
                    const label = item.closest('label')?.textContent.trim();
                    if (label) checked.push(label);
                }
            });

            return checked.length > 0 ? checked.join(', ') : 'Nenhum item selecionado';
        }

        const servicos = getCheckedValues('#servicos-container', 'servico-outro-check', 'servico-outro-input');
        const riscos = getCheckedValues('#riscos-container', 'riscos-outro-check', 'riscos-outro-input');
        const recomendacoes = getCheckedValues('#recomendacoes-container', 'recomendacoes-outro-check', 'recomendacoes-outro-input');

        // --- TABELA NATIVA ---
        doc.autoTable({
            startY: cursorY,
            margin: { left: 10, right: 10 }, // Garante que a tabela tenha exatamente 190mm de largura (de 10 a 200)
            head: [['Categoria', 'Detalhamento dos Itens Selecionados']],
            body: [
                ['Serviços / Atividades', servicos],
                ['Riscos Identificados', riscos],
                ['Medidas / Recomendações', recomendacoes]
            ],
            headStyles: { fillColor: verdeGrupo, textColor: [255, 255, 255], fontStyle: 'bold' },
            styles: { fontSize: 8.5, cellPadding: 2.5, overflow: 'linebreak' },
            columnStyles: { 0: { cellWidth: 45, fontStyle: 'bold' } },
            theme: 'grid'
        });

        cursorY = doc.lastAutoTable.finalY + 8;

        // --- SEÇÃO DE COLABORADORES E ASSINATURAS ---
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...verdeGrupo);
        doc.text('3. REGISTRO DE COLABORADORES E ASSINATURAS', 10, cursorY);
        
        cursorY += 4;

        const cards = document.querySelectorAll('.collaborator-card');

        cards.forEach((card, index) => {
            const nomeInput = card.querySelector('.collaborator-name');
            const nome = nomeInput ? nomeInput.value.trim() : `Colaborador ${index + 1}`;
            const canvas = card.querySelector('.signature-pad');

            if (cursorY + 30 > 280) {
                doc.addPage();
                cursorY = 15;
            }

            doc.setDrawColor(200, 200, 200);
            doc.setFillColor(248, 249, 250);
            doc.roundedRect(10, cursorY, 190, 26, 2, 2, 'FD');

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            doc.text(`Colaborador ${String(index + 1).padStart(2, '0')}:`, 14, cursorY + 13, { baseline: 'middle' });
            
            doc.setFont('helvetica', 'normal');
            doc.text(nome, 45, cursorY + 13, { baseline: 'middle' });

            if (canvas) {
                const imgData = canvas.toDataURL('image/png');
                doc.addImage(imgData, 'PNG', 125, cursorY + 1, 60, 24);
            }

            cursorY += 30;
        });

        const fileName = `APR_Grupo_Centerbox_${new Date().toISOString().slice(0,10)}.pdf`;
        doc.save(fileName);

        resetForm();
    }

    // =========================================================
    // 8. EVENTOS DE ENVIO E INICIALIZAÇÃO
    // =========================================================

    const btnSubmit = document.getElementById('btn-submit');
    if (btnSubmit) {
        btnSubmit.addEventListener('click', (e) => {
            e.preventDefault();
            generatePDF();
        });
    }

    atualizarNumeracao();
    console.log('Sistema APR carregado corretamente com jsPDF nativo.');
});