// ============================================================
// COREMIND — Importer UI Logic (importer-ui.js)
// Gestisce drag&drop, stepper, preview tabelle, confirm import
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    const importer = new ExcelImporter();

    // DOM refs
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const fileError = document.getElementById('file-error');
    const dropZoneLoading = document.getElementById('drop-zone-loading');
    const dropZoneInner = document.querySelector('.drop-zone-inner');

    // ---- Drag & Drop ----
    dropZone.addEventListener('dragover', e => {
        e.preventDefault();
        dropZone.classList.add('dragging');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragging'));
    dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('dragging');
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    });
    fileInput.addEventListener('change', e => {
        if (e.target.files[0]) handleFile(e.target.files[0]);
    });

    // ---- File Handling ----
    async function handleFile(file) {
        dropZoneInner.classList.add('d-none');
        dropZoneLoading.classList.remove('d-none');
        fileInfo.classList.add('d-none');
        fileError.classList.add('d-none');

        try {
            const sheets = await importer.readFile(file);
            dropZoneLoading.classList.add('d-none');
            document.getElementById('file-name-label').textContent = file.name;
            document.getElementById('file-size-label').textContent = formatBytes(file.size);

            // Mostra badge sheet rilevati
            const sheetList = document.getElementById('sheet-list');
            sheetList.innerHTML = '';
            const knownSheets = {
                'RISORSE': 'bg-primary-subtle text-primary-emphasis',
                'DB': 'bg-success-subtle text-success-emphasis',
                'MASTER 2025': 'bg-warning-subtle text-warning-emphasis',
                'MASTER 2026': 'bg-warning-subtle text-warning-emphasis',
                'Rules': 'bg-secondary-subtle text-secondary-emphasis',
                'PER CODIFICA': 'bg-info-subtle text-info-emphasis',
            };
            sheets.forEach(name => {
                const cls = knownSheets[name] || 'bg-light text-secondary';
                sheetList.insertAdjacentHTML('beforeend',
                    `<span class="badge ${cls} fs-6 px-3 py-2">
                        <i class="bi bi-table me-1"></i>${name}
                    </span>`
                );
            });

            fileInfo.classList.remove('d-none');
        } catch (err) {
            dropZoneLoading.classList.add('d-none');
            dropZoneInner.classList.remove('d-none');
            document.getElementById('error-msg-text').textContent = err;
            fileError.classList.remove('d-none');
        }
    }

    // ---- Step Navigation ----
    document.getElementById('btn-next-step2').addEventListener('click', () => {
        parseAndPreview();
        goToStep(2);
    });

    document.getElementById('btn-back-1').addEventListener('click', () => goToStep(1));

    document.getElementById('btn-next-step3').addEventListener('click', () => {
        buildSummary();
        goToStep(3);
    });

    document.getElementById('btn-back-2').addEventListener('click', () => goToStep(2));

    document.getElementById('btn-confirm-import-excel').addEventListener('click', () => {
        doImport();
    });

    // ---- Parse & Preview ----
    function parseAndPreview() {
        // RISORSE
        const risorseData = importer.parseSheet_RISORSE('RISORSE');
        renderPreviewTable('risorse-head', 'risorse-body', importer.getSheetPreview('RISORSE', 15));
        document.getElementById('risorse-count').textContent = risorseData.length + ' righe';

        // DB
        const dbData = importer.parseSheet_DB('DB', 5000);
        renderPreviewTable('db-head', 'db-body', importer.getSheetPreview('DB', 10));
        document.getElementById('db-count').textContent = dbData.length + ' righe importabili';

        // MASTER 2025
        importer.parseSheet_MASTER('MASTER 2025', 2025);
        renderPreviewTable('m25-head', 'm25-body', importer.getSheetPreview('MASTER 2025', 20));

        // MASTER 2026
        importer.parseSheet_MASTER('MASTER 2026', 2026);
        renderPreviewTable('m26-head', 'm26-body', importer.getSheetPreview('MASTER 2026', 20));
    }

    function renderPreviewTable(headId, bodyId, preview) {
        const head = document.getElementById(headId);
        const body = document.getElementById(bodyId);
        if (!head || !body) return;
        if (!preview || !preview.headers.length) {
            head.innerHTML = '<tr><th class="text-muted">Foglio non trovato nel file</th></tr>';
            body.innerHTML = '';
            return;
        }
        head.innerHTML = '<tr>' + preview.headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
        body.innerHTML = preview.rows.map(row =>
            '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>'
        ).join('');
    }

    // ---- Summary Step 3 ----
    function buildSummary() {
        const risorse = importer.parsedRisorse;
        const projects = importer.parsedProjects;

        document.getElementById('summary-risorse-count').textContent = risorse.length;
        document.getElementById('summary-db-count').textContent = projects.length;

        // Conta nuove vs esistenti
        const newRisorse = risorse.filter(r =>
            !DATA.resources.find(e => e.name.toLowerCase() === r.name.toLowerCase())
        );
        document.getElementById('summary-risorse-new').textContent = newRisorse.length;
        document.getElementById('summary-risorse-exist').textContent = risorse.length - newRisorse.length;

        const newProjects = projects.filter(p =>
            !DATA.projects.find(e => e.code === p.wbsElement || e.name === p.name)
        );
        document.getElementById('summary-db-new').textContent = newProjects.length;
        document.getElementById('summary-db-exist').textContent = projects.length - newProjects.length;

        // Warnings
        const warnings = [];
        if (risorse.length === 0) warnings.push("Nessuna risorsa trovata nel foglio RISORSE.");
        if (projects.length === 0) warnings.push("Nessun progetto trovato nel foglio DB.");
        if (risorse.some(r => !r.adrc25)) warnings.push("Alcune risorse hanno ADRC 2025 = 0. Verificare le tariffe.");

        const warnBox = document.getElementById('import-warnings');
        if (warnings.length > 0) {
            document.getElementById('warnings-list').innerHTML = warnings.map(w => `<li>${w}</li>`).join('');
            warnBox.classList.remove('d-none');
        } else {
            warnBox.classList.add('d-none');
        }
    }

    // ---- Confirm Import ----
    function doImport() {
        const opts = {
            risorse: document.getElementById('opt-import-risorse').checked,
            projects: document.getElementById('opt-import-projects').checked,
            year: 2025
        };
        const result = importer.commitToDATA(opts);

        document.getElementById('done-summary-text').textContent =
            `Aggiunte ${result.risorse} nuove risorse e ${result.projects} nuovi progetti al database.`;

        goToStep('done');
    }

    // ---- Stepper ----
    function goToStep(step) {
        ['step-1', 'step-2', 'step-3', 'step-done'].forEach(id => {
            document.getElementById(id)?.classList.add('d-none');
        });
        const target = step === 'done' ? 'step-done' : `step-${step}`;
        document.getElementById(target)?.classList.remove('d-none');

        // Update stepper dots
        document.querySelectorAll('.step').forEach((el, i) => {
            el.classList.remove('active', 'completed');
            const n = i + 1;
            if (typeof step === 'number') {
                if (n < step) el.classList.add('completed');
                if (n === step) el.classList.add('active');
            }
        });
    }

    // ---- Utils ----
    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }
});
