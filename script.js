document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // DATALIST DE COLABORADORES
    // =========================================================
    function carregarDatalistColaboradores() {
        const datalist = document.getElementById('lista-colaboradores');
        if (!datalist || typeof LISTA_COLABORADORES === 'undefined') return;

        datalist.innerHTML = '';
        LISTA_COLABORADORES.slice().sort().forEach(nome => {
            const option = document.createElement('option');
            option.value = nome;
            datalist.appendChild(option);
        });
    }

    carregarDatalistColaboradores();

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
    // 2. SISTEMA DE ASSINATURA (CANVAS) - OTIMIZADO
    // =========================================================
    function configurarAssinatura(card) {
        const canvas = card.querySelector('.signature-pad');
        const btnClear = card.querySelector('.clear-signature');

        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let isDrawing = false;
        let ajustado = false;

        function ajustarCanvas() {
            const rect = canvas.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            const dpr = window.devicePixelRatio || 1;

            // Salva o desenho atual caso o canvas precise redimensionar
            const tempImage = canvas.toDataURL();

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;

            ctx.scale(dpr, dpr);
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#000000';

            if (tempImage !== 'data:,' && tempImage !== 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=') {
                const img = new Image();
                img.src = tempImage;
                img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
            }

            ajustado = true;
        }

        // Executa o primeiro ajuste após a montagem do DOM
        setTimeout(ajustarCanvas, 100);

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

            // Calcula o ponto exato relativo ao tamanho em tela CSS (o ctx.scale cuida da escala DPR)
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        }

        function startDrawing(event) {
            if (!ajustado) ajustarCanvas();

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

        // Eventos Mouse
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);

        // Eventos Touch (Mobile)
        canvas.addEventListener('touchstart', startDrawing, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });
        canvas.addEventListener('touchend', stopDrawing);

        // Botão de Limpar
        if (btnClear) {
            btnClear.addEventListener('click', function () {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            });
        }
    }

    // Inicializa o primeiro colaborador
    const primeiroColaborador = document.querySelector('.collaborator-card');
    if (primeiroColaborador) {
        configurarAssinatura(primeiroColaborador);
    }

    // =========================================================
    // 3. CONTROLE DE COLABORADORES
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
                    <input type="text" class="collaborator-name" list="lista-colaboradores" placeholder="Digite ou selecione o nome">
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
            configurarAssinatura(card);

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
    // 4. MODAIS DE SELEÇÃO (LOCAL E SOLICITANTE)
    // =========================================================
    function gerenciarModal(btnId, modalId, fecharId, targetTextId, optionClass, dataAttr) {
        const btn = document.getElementById(btnId);
        const modal = document.getElementById(modalId);
        const fechar = document.getElementById(fecharId);
        const targetText = document.getElementById(targetTextId);
        const opcoes = document.querySelectorAll(optionClass);

        if (btn && modal) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                modal.style.display = 'flex';
            });
        }

        if (fechar && modal) {
            fechar.addEventListener('click', (e) => {
                e.preventDefault();
                modal.style.display = 'none';
            });
        }

        opcoes.forEach((opcao) => {
            opcao.addEventListener('click', function () {
                const valor = this.dataset[dataAttr];
                if (targetText) targetText.textContent = valor;
                if (modal) modal.style.display = 'none';
            });
        });

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.style.display = 'none';
            });
        }
    }

    gerenciarModal('btn-local', 'local-modal', 'fechar-local', 'local-selecionado', '#local-modal .local-option', 'local');
    gerenciarModal('btn-Solicitante', 'solicitante-modal', 'fechar-solicitante', 'Solicitante-selecionado', '.solicitante-option', 'solicitante');

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

        const localSelecionado = document.getElementById('local-selecionado');
        const solicitanteSelecionado = document.getElementById('Solicitante-selecionado');
        if (localSelecionado) localSelecionado.textContent = 'Selecione o local';
        if (solicitanteSelecionado) solicitanteSelecionado.textContent = 'Selecione o Solicitante';

        atualizarNumeracao();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // =========================================================
    // 7. GERAÇÃO DE PDF COM JSPDF + AUTOTABLE
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

        const verdeGrupo = [0, 100, 50];
        let cursorY = 15;

        // Logotipo
        const temLogo = (typeof LOGO_CENTERBOX !== 'undefined' && LOGO_CENTERBOX !== '');
        if (temLogo) {
            doc.addImage(LOGO_CENTERBOX, 'JPEG', 10, 10, 35, 15, undefined, 'FAST');
        }

        const headerX = temLogo ? 50 : 10;
        const headerWidth = temLogo ? 150 : 190;

        // Cabeçalho
        doc.setFillColor(...verdeGrupo);
        doc.rect(headerX, cursorY, headerWidth, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.text('ANÁLISE PRELIMINAR DE RISCO - APR', headerX + (headerWidth / 2), cursorY + 8, { align: 'center' });

        cursorY += 22;

        // Informações Gerais
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
        doc.setFont('helvetica', 'bold'); doc.text('Solicitante:', 10, cursorY);
        doc.setFont('helvetica', 'normal'); doc.text(solicitante, 30, cursorY);
        doc.setFont('helvetica', 'bold'); doc.text('Atividade:', 80, cursorY);
        doc.setFont('helvetica', 'normal'); doc.text(atividade, 98, cursorY);
        doc.setFont('helvetica', 'bold'); doc.text('Local:', 150, cursorY);
        doc.setFont('helvetica', 'normal'); doc.text(localText, 162, cursorY);

        doc.setDrawColor(...verdeGrupo);
        doc.setLineWidth(0.5);
        doc.setLineDashPattern([2, 1], 0);
        doc.line(10, cursorY + 2.5, 200, cursorY + 2.5);

        cursorY += 7;

        // Linha 2
        doc.setFont('helvetica', 'bold'); doc.text('Nº OS:', 10, cursorY);
        doc.setFont('helvetica', 'normal'); doc.text(os, 25, cursorY);
        doc.setFont('helvetica', 'bold'); doc.text('Responsável:', 80, cursorY);
        doc.setFont('helvetica', 'normal'); doc.text(responsavel, 103, cursorY);
        doc.setFont('helvetica', 'bold'); doc.text('Data:', 150, cursorY);
        doc.setFont('helvetica', 'normal'); doc.text(dataFormatada, 162, cursorY);

        doc.line(10, cursorY + 2.5, 200, cursorY + 2.5);
        doc.setLineDashPattern([], 0);

        cursorY += 8;

        // Extração de seleções
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

        // Tabela de itens
        doc.autoTable({
            startY: cursorY,
            margin: { left: 10, right: 10 },
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

        // Seção de Colaboradores
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

        const fileName = `APR_Grupo_Centerbox_${new Date().toISOString().slice(0, 10)}.pdf`;
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