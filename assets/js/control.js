// ============================================================
// COREMIND — Control View Logic (control.js)
// Risorse raggruppate per Progetto — Piano vs Consuntivo
// ============================================================

let budgetChart = null;

const MONTHS_LABEL = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

const fmtEur = v => new Intl.NumberFormat('it-IT', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0
}).format(v);

document.addEventListener('DOMContentLoaded', () => {
    initChart();
    // Pre-select current month
    const m = new Date().getMonth() + 1;
    document.getElementById('month-select').value = m;
    document.getElementById('btn-load-report').addEventListener('click', generateReport);
});

function getCtrlYear() {
    return parseInt(document.getElementById('ctrl-year-select')?.value) || 2025;
}

// ---- Chart (bar: planned vs actual per project) ----
function initChart() {
    const ctx = document.getElementById('budgetChart').getContext('2d');
    Chart.defaults.color = 'rgba(255,255,255,0.4)';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
    Chart.defaults.font.family = 'Inter';

    budgetChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [], datasets: [
                {
                    label: 'Piano (€)', data: [], backgroundColor: 'rgba(99,102,241,0.65)',
                    borderColor: 'rgba(99,102,241,1)', borderWidth: 1, borderRadius: 5
                },
                {
                    label: 'Consuntivo (€)', data: [], backgroundColor: 'rgba(245,158,11,0.65)',
                    borderColor: 'rgba(245,158,11,1)', borderWidth: 1, borderRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top', labels: { boxWidth: 10, padding: 14, font: { size: 10 } } },
                tooltip: {
                    callbacks: {
                        label: c => `${c.dataset.label}: ${fmtEur(c.raw)}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: v => '€' + (v / 1000).toFixed(0) + 'k', font: { size: 10 } },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                },
                x: { ticks: { font: { size: 9 }, maxRotation: 30 }, grid: { display: false } }
            }
        }
    });
}

// ---- Generate Report ----
function generateReport() {
    const month = parseInt(document.getElementById('month-select').value);
    const year = getCtrlYear();

    // All bookings for selected month+year
    const planned = DATA.bookings.filter(b => b.month === month && b.year === year && b.type === 'plan');
    const actual = DATA.bookings.filter(b => b.month === month && b.year === year && b.type === 'actual');

    // Portfolio KPIs
    const totalPortfolioBudget = DATA.projects.reduce((s, p) => s + (p.budget || 0), 0);
    const totalPlanned = planned.reduce((s, b) => s + b.cost, 0);
    const totalActual = actual.reduce((s, b) => s + b.cost, 0);
    const variance = totalPlanned - totalActual;

    document.getElementById('val-budget').textContent = fmtEur(totalPortfolioBudget);
    document.getElementById('val-planned').textContent = fmtEur(totalPlanned);
    document.getElementById('val-actual').textContent = fmtEur(totalActual);

    const varEl = document.getElementById('val-variance');
    varEl.textContent = (variance >= 0 ? '+' : '') + fmtEur(variance);
    varEl.style.color = variance >= 0 ? '#6ee7b7' : '#fda4af';

    // Update month label on chart
    document.getElementById('chart-month-label').textContent =
        `— ${MONTHS_LABEL[month - 1]} ${year}`;

    // Update chart
    updateChart(planned, actual, month, year);

    // Render grouped table
    renderGroupedTable(month, year, planned, actual);
}

function updateChart(planned, actual, month, year) {
    // Only projects that have bookings this month
    const activeProjects = DATA.projects.filter(p =>
        planned.some(b => b.projectId === p.id) || actual.some(b => b.projectId === p.id)
    );

    const labels = activeProjects.map(p => {
        const n = p.name || p.code || '—';
        return n.length > 22 ? n.substring(0, 20) + '…' : n;
    });

    const pData = activeProjects.map(p =>
        planned.filter(b => b.projectId === p.id).reduce((s, b) => s + b.cost, 0)
    );
    const aData = activeProjects.map(p =>
        actual.filter(b => b.projectId === p.id).reduce((s, b) => s + b.cost, 0)
    );

    budgetChart.data.labels = labels;
    budgetChart.data.datasets[0].data = pData;
    budgetChart.data.datasets[1].data = aData;
    budgetChart.update();
}

// ---- Grouped Table: Project header + resource rows ----
function renderGroupedTable(month, year, planned, actual) {
    const tbody = document.getElementById('control-body');
    tbody.innerHTML = '';

    // Count projects and resources rendered
    let projCount = 0;
    let resCount = 0;

    DATA.projects.forEach(project => {
        const projPlanned = planned.filter(b => b.projectId === project.id);
        const projActual = actual.filter(b => b.projectId === project.id);

        if (projPlanned.length === 0 && projActual.length === 0) return; // skip projects with no data
        projCount++;

        const projTotalPlan = projPlanned.reduce((s, b) => s + b.cost, 0);
        const projTotalActual = projActual.reduce((s, b) => s + b.cost, 0);
        const projVariance = projTotalPlan - projTotalActual;
        const varClass = projVariance >= 0 ? 'badge-ok' : 'badge-bad';

        // ---- Project group header row ----
        const groupId = `proj-${project.id}`;
        const headerTr = document.createElement('tr');
        headerTr.className = 'proj-group-row';
        headerTr.dataset.group = groupId;
        headerTr.innerHTML = `
            <td colspan="2">
                <i class="bi bi-chevron-down proj-toggle" style="margin-right:8px;font-size:0.75rem;"></i>
                <i class="bi bi-folder2-open" style="margin-right:6px;opacity:0.7;"></i>
                ${project.name || '—'}
                <span class="badge" style="background:rgba(99,102,241,.15);color:#a5b4fc;margin-left:8px;font-weight:600;">${project.code || ''}</span>
            </td>
            <td class="text-end" style="color:rgba(255,255,255,0.5);">${projPlanned.reduce((s, b) => s + b.days, 0).toFixed(1)}</td>
            <td class="text-end" style="color:rgba(255,255,255,0.5);">${projActual.reduce((s, b) => s + b.days, 0).toFixed(1)}</td>
            <td class="text-end"></td>
            <td class="text-end" style="color:rgba(255,255,255,0.7);">${fmtEur(projTotalPlan)}</td>
            <td class="text-end" style="color:rgba(255,255,255,0.7);">${fmtEur(projTotalActual)}</td>
            <td><span class="badge ${varClass}">${projVariance >= 0 ? '+' : ''}${fmtEur(projVariance)}</span></td>
        `;

        // Toggle collapse on click
        headerTr.addEventListener('click', () => {
            const isCollapsed = headerTr.classList.toggle('collapsed');
            tbody.querySelectorAll(`tr.res-row[data-group="${groupId}"]`).forEach(row => {
                row.classList.toggle('hidden', isCollapsed);
            });
        });

        tbody.appendChild(headerTr);

        // ---- Resource rows ----
        const resIds = new Set([
            ...projPlanned.map(b => b.resourceId),
            ...projActual.map(b => b.resourceId)
        ]);

        resIds.forEach(resId => {
            const res = DATA.getResource(resId);
            const plan = projPlanned.find(b => b.resourceId === resId) || { days: 0, cost: 0 };
            const act = projActual.find(b => b.resourceId === resId) || { days: 0, cost: 0 };
            const delta = plan.days - act.days;
            const deltaClass = delta < 0 ? 'badge-bad' : delta > 0 ? 'badge-ok' : 'badge-muted';
            const deltaLabel = delta < 0 ? 'Sforamento' : delta > 0 ? 'Risparmio' : 'In Linea';
            resCount++;

            const tr = document.createElement('tr');
            tr.className = 'res-row';
            tr.dataset.group = groupId;
            tr.innerHTML = `
                <td class="fw-semibold" style="padding-left:40px;">${res?.name || '—'}</td>
                <td><span class="chip-skill">${res?.skillsArea || '—'}</span></td>
                <td class="text-end" style="color:#a5b4fc;">${plan.days.toFixed(1)}</td>
                <td class="text-end" style="color:#fcd34d;">${act.days.toFixed(1)}</td>
                <td class="text-end fw-bold" style="color:${delta < 0 ? '#fda4af' : delta > 0 ? '#6ee7b7' : 'var(--muted)'}">
                    ${delta > 0 ? '+' : ''}${delta.toFixed(1)}
                </td>
                <td class="text-end small">${fmtEur(plan.cost)}</td>
                <td class="text-end small">${fmtEur(act.cost)}</td>
                <td><span class="badge ${deltaClass}">${deltaLabel}</span></td>
            `;
            tbody.appendChild(tr);
        });
    });

    // Summary counter above table
    const summary = document.getElementById('table-summary');
    if (projCount === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:36px;color:var(--muted);">
            <i class="bi bi-inbox" style="font-size:1.5rem;opacity:0.4;display:block;margin-bottom:8px;"></i>
            Nessun dato disponibile per il periodo selezionato.
        </td></tr>`;
        if (summary) summary.textContent = '';
    } else {
        if (summary) summary.textContent = `${projCount} progetti · ${resCount} allocazioni`;
    }
}
