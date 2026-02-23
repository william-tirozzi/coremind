// ============================================================
// COREMIND — Main App Logic (index.html)
// Gestisce: Staffing Grid, DB Progetti, Risorse, Import TSV
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

// ---- Globals ----
let importerInstance = null;
let currentImportData = [];
// ============================================================
// WORKING DAYS — Italian calendar (Mon-Fri minus public holidays)
// 2025: Jan1(Wed),Jan6(Mon),Apr21(Mon LunAngelo),Apr25(Fri),
//       May1(Thu),Jun2(Mon),Aug15(Fri),Dec8(Mon),Dec25(Thu),Dec26(Fri)
// 2026: Jan1(Thu),Jan6(Tue),Apr6(Mon LunAngelo),May1(Fri),
//       Jun2(Tue),Dec8(Tue),Dec25(Fri)
// ============================================================
const WORKING_DAYS = {
    2025: [21, 20, 21, 20, 21, 20, 23, 20, 22, 23, 20, 20],
    2026: [20, 20, 22, 21, 20, 21, 23, 21, 22, 22, 21, 21]
};

function getWorkingDays(year, monthIndex) {
    const table = WORKING_DAYS[year];
    if (table) return table[monthIndex];
    // Fallback: simple weekday count
    const d = new Date(year, monthIndex, 1);
    let wd = 0;
    while (d.getMonth() === monthIndex) {
        const day = d.getDay();
        if (day !== 0 && day !== 6) wd++;
        d.setDate(d.getDate() + 1);
    }
    return wd;
}


function initDashboard() {
    updateStats();
    renderStaffingTable();
    renderDBTable();
    renderRisorseView();
    populateDBFilters();
    populateSkillsFilter();
    bindEventListeners();
    bindViewToggle();
    initDayView();
    initDailyGrid();
}

// ============================================================
// KPI STATS
// ============================================================
function updateStats() {
    const year = getYear();
    document.getElementById('stat-resources').textContent = DATA.resources.length;
    document.getElementById('stat-projects').textContent = DATA.projects.length;

    // Total planned hours for the full year (bookings + absences)
    const planHours = DATA.bookings
        .filter(b => b.type === 'plan' && b.year === year)
        .reduce((sum, b) => sum + b.days * 8, 0);
    const absHours = (DATA.absences || [])
        .filter(a => a.year === year)
        .reduce((sum, a) => sum + (a.days || 0) * 8, 0);
    const totalH = planHours + absHours;
    document.getElementById('stat-allocated').textContent = totalH.toLocaleString('it-IT') + ' h';
}

// ============================================================
// TAB 1 — STAFFING GRID  (mode: 'days' | 'hours_month' | 'hours_day')
// ============================================================
let staffingMode = 'hours_month'; // default

function fmtCell(days, mode, workingDays) {
    if (days === 0) return { val: '·', empty: true };
    switch (mode) {
        case 'days': return { val: days + 'g', empty: false };
        case 'hours_month': return { val: (days * 8) + 'h', empty: false };
        case 'hours_day': return { val: (days > 0 ? Math.round((days * 8) / workingDays * 10) / 10 : 0) + 'h/g', empty: false };
    }
}
function fmtTotal(days, mode, workingDaysSum) {
    if (days === 0) return '–';
    switch (mode) {
        case 'days': return days + 'g';
        case 'hours_month': return (days * 8) + 'h';
        case 'hours_day': return Math.round((days * 8) / workingDaysSum * 10) / 10 + 'h/g';
    }
}

function renderStaffingTable(mode) {
    staffingMode = mode || staffingMode;
    const tbody = document.getElementById('staffing-body');
    tbody.innerHTML = '';
    const year = getYear();
    const BENCH_GREY = 'rgba(180,180,180,0.55)';
    const BENCH_BG = 'rgba(255,255,255,.03)';

    const ABSENCE_META = {
        ferie: { label: 'Ferie', icon: 'bi-umbrella-fill', color: 'rgba(16,185,129,.10)', textColor: '#6ee7b7' },
        par: { label: 'PAR', icon: 'bi-clock-history', color: 'rgba(6,182,212,.10)', textColor: '#67e8f9' },
        learning: { label: 'Learning', icon: 'bi-book-fill', color: 'rgba(245,158,11,.10)', textColor: '#fcd34d' },
        absences: { label: 'Absences', icon: 'bi-bandaid-fill', color: 'rgba(244,63,94,.10)', textColor: '#fda4af' },
    };

    DATA.resources.forEach(res => {
        const groupId = `res-${res.id}`;
        const initials = res.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

        const resBookings = DATA.bookings.filter(b =>
            b.resourceId === res.id && b.year === year && b.type === 'plan'
        );
        const resAbsences = (DATA.absences || []).filter(a =>
            a.resourceId === res.id && a.year === year
        );

        // Per-month totals in DAYS (projects + absences)
        const wdArr = Array.from({ length: 12 }, (_, i) => getWorkingDays(year, i));
        const totalMonths = Array.from({ length: 12 }, (_, i) => {
            const m = i + 1;
            const projD = resBookings.filter(b => b.month === m).reduce((s, b) => s + b.days, 0);
            const absD = resAbsences.filter(a => a.month === m).reduce((s, a) => s + (a.days || 0), 0);
            return projD + absD;
        });
        const grandDays = totalMonths.reduce((s, v) => s + v, 0);
        const wdTotalYear = wdArr.reduce((s, v) => s + v, 0);

        // ---- Resource Header Row ----
        const headerTr = document.createElement('tr');
        headerTr.className = 'res-group-header';
        headerTr.dataset.group = groupId;

        let headerCells = `<td>
            <div style="display:flex;align-items:center;gap:10px;">
                <i class="bi bi-chevron-down res-toggle" style="font-size:0.7rem;transition:transform .2s;"></i>
                <div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);
                    display:flex;align-items:center;justify-content:center;color:white;font-size:0.65rem;font-weight:700;flex-shrink:0;">${initials}</div>
                <div>
                    <div style="font-size:0.85rem;font-weight:700;color:white;">${res.name}</div>
                    <span class="chip-skill">${res.skillsArea}</span>
                </div>
            </div>
        </td>`;

        totalMonths.forEach((d, i) => {
            const f = fmtCell(d, staffingMode, wdArr[i]);
            let cls = 'days-empty';
            if (!f.empty) {
                const h = d * 8;
                if (h > 160) cls = 'days-high';
                else if (h > 120) cls = 'days-medium';
                else cls = 'days-low';
            }
            headerCells += `<td style="text-align:center;font-size:0.82rem;"><span class="${cls}">${f.val}</span></td>`;
        });
        headerCells += `<td style="text-align:center;font-weight:800;font-size:0.84rem;color:white;">${fmtTotal(grandDays, staffingMode, wdTotalYear)}</td>`;
        headerTr.innerHTML = headerCells;

        headerTr.addEventListener('click', () => {
            const collapsed = headerTr.classList.toggle('collapsed');
            headerTr.querySelector('.res-toggle').style.transform = collapsed ? 'rotate(-90deg)' : '';
            tbody.querySelectorAll(`tr[data-group="${groupId}"]`).forEach(row => {
                if (row === headerTr) return;
                row.style.display = collapsed ? 'none' : '';
            });
        });
        tbody.appendChild(headerTr);

        // ---- Project Sub-Rows ----
        const projIds = [...new Set(resBookings.map(b => b.projectId))];
        projIds.forEach(projId => {
            const proj = DATA.getProject(projId);
            const projBookings = resBookings.filter(b => b.projectId === projId);
            const projMonths = Array.from({ length: 12 }, (_, i) =>
                projBookings.filter(b => b.month === i + 1).reduce((s, b) => s + b.days, 0)
            );
            const projTotalDays = projMonths.reduce((s, v) => s + v, 0);

            const projTr = document.createElement('tr');
            projTr.className = 'proj-sub-row';
            projTr.dataset.group = groupId;

            let cells = `<td style="padding-left:52px;">
                <div style="display:flex;align-items:center;gap:8px;">
                    <i class="bi bi-folder2-open" style="color:#6366f1;font-size:0.78rem;"></i>
                    <div>
                        <div style="font-size:0.8rem;font-weight:600;color:rgba(255,255,255,0.8);">${proj?.name || '—'}</div>
                        <code style="font-size:0.68rem;color:rgba(255,255,255,0.3);">${proj?.code || '?'}</code>
                    </div>
                </div>
            </td>`;

            projMonths.forEach((d, i) => {
                const f = fmtCell(d, staffingMode, wdArr[i]);
                cells += `<td style="text-align:center;font-size:0.81rem;color:${!f.empty ? '#a5b4fc' : 'rgba(255,255,255,0.15)'};">${f.val}</td>`;
            });
            cells += `<td style="text-align:center;font-size:0.81rem;font-weight:700;color:#a5b4fc;">${fmtTotal(projTotalDays, staffingMode, wdTotalYear)}</td>`;
            projTr.innerHTML = cells;
            tbody.appendChild(projTr);
        });

        // ---- Absence Sub-Rows ----
        Object.entries(ABSENCE_META).forEach(([type, meta]) => {
            const absRows = resAbsences.filter(a => a.type === type);
            if (absRows.length === 0) return;

            const monthDays = Array.from({ length: 12 }, (_, i) => {
                const a = absRows.find(r => r.month === i + 1);
                if (!a || !a.days) return 0;
                return type === 'ferie' ? Math.max(a.days, 1) : a.days;
            });
            const absTotal = monthDays.reduce((s, v) => s + v, 0);
            if (absTotal === 0) return;

            const absTr = document.createElement('tr');
            absTr.className = 'absence-sub-row';
            absTr.dataset.group = groupId;
            absTr.style.background = meta.color;

            let cells = `<td style="padding-left:52px;">
                <div style="display:flex;align-items:center;gap:7px;">
                    <i class="bi ${meta.icon}" style="color:${meta.textColor};font-size:0.78rem;"></i>
                    <span style="font-size:0.78rem;font-weight:600;color:${meta.textColor};">${meta.label}</span>
                </div>
            </td>`;

            monthDays.forEach((d, i) => {
                const f = fmtCell(d, staffingMode, wdArr[i]);
                cells += `<td style="text-align:center;font-size:0.8rem;color:${!f.empty ? meta.textColor : 'rgba(255,255,255,0.12)'};">${f.val}</td>`;
            });
            cells += `<td style="text-align:center;font-size:0.8rem;font-weight:700;color:${meta.textColor};">${fmtTotal(absTotal, staffingMode, wdTotalYear)}</td>`;
            absTr.innerHTML = cells;
            tbody.appendChild(absTr);
        });

        // ---- Bench Row — grey, working days not covered by projects or absences ----
        const benchDayArr = Array.from({ length: 12 }, (_, i) => {
            const m = i + 1;
            const wd = wdArr[i];
            const projDays = resBookings.filter(b => b.month === m).reduce((s, b) => s + b.days, 0);
            const absDays = resAbsences.filter(a => a.month === m).reduce((s, a) => s + (a.days || 0), 0);
            return Math.max(0, wd - projDays - absDays);
        });
        const benchTotalDays = benchDayArr.reduce((s, v) => s + v, 0);

        if (benchTotalDays > 0) {
            const benchTr = document.createElement('tr');
            benchTr.className = 'absence-sub-row bench-row';
            benchTr.dataset.group = groupId;
            benchTr.style.background = BENCH_BG;

            let cells = `<td style="padding-left:52px;">
                <div style="display:flex;align-items:center;gap:7px;">
                    <i class="bi bi-hourglass-split" style="color:${BENCH_GREY};font-size:0.78rem;"></i>
                    <span style="font-size:0.78rem;font-weight:600;color:${BENCH_GREY};">Bench</span>
                </div>
            </td>`;

            benchDayArr.forEach((d, i) => {
                const f = fmtCell(d, staffingMode, wdArr[i]);
                cells += `<td style="text-align:center;font-size:0.8rem;color:${!f.empty ? BENCH_GREY : 'rgba(255,255,255,0.1)'};">${f.val}</td>`;
            });
            cells += `<td style="text-align:center;font-size:0.8rem;font-weight:700;color:${BENCH_GREY};">${fmtTotal(benchTotalDays, staffingMode, wdTotalYear)}</td>`;
            benchTr.innerHTML = cells;
            tbody.appendChild(benchTr);
        }
    });
}

function bindViewToggle() {
    document.querySelectorAll('.view-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-mode-btn').forEach(b => {
                b.style.background = 'transparent';
                b.style.color = 'rgba(255,255,255,0.4)';
            });
            btn.style.background = 'rgba(99,102,241,0.25)';
            btn.style.color = '#a5b4fc';
            const mode = btn.dataset.mode;
            const hints = { days: '1 giorno = 8h', hours_month: 'ore totali per mese', hours_day: 'ore medie per giorno lavorativo' };
            document.getElementById('staffing-view-hint').textContent = hints[mode];
            renderStaffingTable(mode);
        });
    });
}


// ============================================================
// TAB 2 — DB PROGETTI
// ============================================================
function renderDBTable(filters = {}) {
    const tbody = document.getElementById('db-projects-body');
    tbody.innerHTML = '';

    let projects = [...DATA.projects];
    const search = (filters.search || '').toLowerCase();

    if (search) {
        projects = projects.filter(p =>
            p.name.toLowerCase().includes(search) ||
            p.client.toLowerCase().includes(search) ||
            p.code.toLowerCase().includes(search) ||
            p.projectManager.toLowerCase().includes(search)
        );
    }
    if (filters.market) projects = projects.filter(p => p.marketSegment === filters.market);
    if (filters.billability) projects = projects.filter(p => p.billability === filters.billability);
    if (filters.pm) projects = projects.filter(p => p.projectManager === filters.pm);
    if (filters.type) projects = projects.filter(p => p.type === filters.type);

    projects.forEach(p => {
        const billCls = `badge-bill-${p.billability}`;
        const startFmt = p.startDate ? new Date(p.startDate).toLocaleDateString('it-IT', { month: 'short', year: '2-digit' }) : '—';
        const endFmt = p.finishDate ? new Date(p.finishDate).toLocaleDateString('it-IT', { month: 'short', year: '2-digit' }) : '—';
        const budget = p.budget ? new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(p.budget) : '—';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><code style="font-size:0.78rem">${p.code}</code></td>
            <td class="fw-semibold" style="max-width:200px">${p.name}</td>
            <td style="font-size:0.85rem">${p.client}</td>
            <td style="font-size:0.85rem">
                <div class="d-flex align-items-center gap-1">
                    <i class="bi bi-person-fill text-primary" style="font-size:0.75rem"></i>${p.projectManager}
                </div>
            </td>
            <td style="font-size:0.82rem">${p.marketSegment}</td>
            <td><span class="${billCls}">${p.billability}</span></td>
            <td><span class="badge ${p.type === 'EXTERNAL' ? 'bg-dark-subtle text-dark-emphasis' : 'bg-secondary-subtle text-secondary-emphasis'}" style="font-size:0.72rem">${p.type}</span></td>
            <td class="text-end fw-semibold">${budget}</td>
            <td style="font-size:0.78rem;white-space:nowrap">${startFmt} → ${endFmt}</td>
        `;
        tbody.appendChild(tr);
    });

    const lbl = document.getElementById('db-count-label');
    if (lbl) lbl.textContent = `${projects.length} progett${projects.length === 1 ? 'o' : 'i'} mostrat${projects.length === 1 ? 'o' : 'i'} su ${DATA.projects.length} totali`;
}

function populateDBFilters() {
    const markets = [...new Set(DATA.projects.map(p => p.marketSegment).filter(Boolean))].sort();
    const bills = [...new Set(DATA.projects.map(p => p.billability).filter(Boolean))].sort();
    const pms = [...new Set(DATA.projects.map(p => p.projectManager).filter(Boolean))].sort();

    const mkSel = document.getElementById('filter-market');
    const blSel = document.getElementById('filter-billability');
    const pmSel = document.getElementById('filter-pm');

    markets.forEach(m => mkSel.insertAdjacentHTML('beforeend', `<option value="${m}">${m}</option>`));
    bills.forEach(b => blSel.insertAdjacentHTML('beforeend', `<option value="${b}">${b}</option>`));
    pms.forEach(p => pmSel.insertAdjacentHTML('beforeend', `<option value="${p}">${p}</option>`));
}

function getDBFilters() {
    return {
        search: document.getElementById('db-search').value,
        market: document.getElementById('filter-market').value,
        billability: document.getElementById('filter-billability').value,
        pm: document.getElementById('filter-pm').value,
        type: document.getElementById('filter-type').value,
    };
}

// ============================================================
// TAB 3 — RISORSE (Cards)
// ============================================================
function renderRisorseView(filters = {}) {
    const container = document.getElementById('risorse-cards-container');
    container.innerHTML = '';

    let risorse = [...DATA.resources];
    const search = (filters.search || '').toLowerCase();
    if (search) risorse = risorse.filter(r => r.name.toLowerCase().includes(search) || r.skillsArea.toLowerCase().includes(search));
    if (filters.skill) risorse = risorse.filter(r => r.skillsArea === filters.skill);
    if (filters.level) risorse = risorse.filter(r => r.rateLevel === filters.level);

    const maxADRC = Math.max(...DATA.resources.map(r => r.adrc26 || 0), 1);
    const fmtEur = v => v ? new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v) : '—';

    risorse.forEach(res => {
        const initials = res.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        const pct25 = Math.round(((res.adrc25 || 0) / maxADRC) * 100);
        const pct26 = Math.round(((res.adrc26 || 0) / maxADRC) * 100);
        const year = getYear();
        const totalDays = DATA.bookings.filter(b => b.resourceId === res.id && b.year === year && b.type === 'plan').reduce((s, b) => s + b.days, 0);

        const card = document.createElement('div');
        card.className = 'risorsa-card';
        card.innerHTML = `
            <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;">
                <div class="risorsa-avatar">${initials}</div>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:0.85rem;font-weight:700;color:rgba(255,255,255,0.85);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${res.name}</div>
                    <span class="chip-skill" style="margin-top:4px;">${res.skillsArea}</span>
                </div>
                <span class="badge-level">${res.rateLevel || '—'}</span>
            </div>

            <div class="adrc-row"><span>ADRC 2025</span><strong>${fmtEur(res.adrc25)}</strong></div>
            <div class="adrc-bar"><div class="adrc-bar-fill" style="width:${pct25}%;background:linear-gradient(90deg,#6366f1,#8b5cf6);"></div></div>

            <div class="adrc-row" style="margin-top:8px;"><span>ADRC 2026</span><strong>${fmtEur(res.adrc26)}</strong></div>
            <div class="adrc-bar"><div class="adrc-bar-fill" style="width:${pct26}%;background:linear-gradient(90deg,#0ea5e9,#6366f1);"></div></div>

            <div class="res-card-footer">
                <span><i class="bi bi-calendar3" style="margin-right:4px;"></i>Giorni ${year}</span>
                <strong>${totalDays > 0 ? totalDays + 'g' : '—'}</strong>
            </div>
        `;
        container.appendChild(card);
    });

    if (risorse.length === 0) {
        container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px;color:rgba(255,255,255,.3);">
            <i class="bi bi-person-x" style="font-size:2rem;display:block;margin-bottom:8px;"></i>
            Nessuna risorsa trovata.
        </div>`;
    }
}

function populateSkillsFilter() {
    const skills = [...new Set(DATA.resources.map(r => r.skillsArea).filter(Boolean))].sort();
    const sel = document.getElementById('filter-skill');
    skills.forEach(s => sel.insertAdjacentHTML('beforeend', `<option value="${s}">${s}</option>`));
}

// ============================================================
// EVENT LISTENERS
// ============================================================
function bindEventListeners() {
    document.getElementById('filter-year').addEventListener('change', () => {
        renderStaffingTable();
        renderRisorseView(getRisorseFilters());
        updateStats();
    });

    // DB filters
    ['db-search', 'filter-market', 'filter-billability', 'filter-pm', 'filter-type'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => renderDBTable(getDBFilters()));
        document.getElementById(id).addEventListener('change', () => renderDBTable(getDBFilters()));
    });
    document.getElementById('btn-clear-filters').addEventListener('click', () => {
        ['db-search', 'filter-market', 'filter-billability', 'filter-pm', 'filter-type'].forEach(id => {
            const el = document.getElementById(id);
            el.value = '';
        });
        renderDBTable();
    });

    // Risorse filters
    ['risorse-search', 'filter-skill', 'filter-level'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', () => renderRisorseView(getRisorseFilters()));
        document.getElementById(id)?.addEventListener('change', () => renderRisorseView(getRisorseFilters()));
    });

    // Export
    document.getElementById('btn-export')?.addEventListener('click', handleExport);
    document.getElementById('btn-export-samantha')?.addEventListener('click', handleSamanthaExport);

    // Import TSV (modal legacy)
    document.getElementById('btn-parse-data')?.addEventListener('click', handleParse);
    document.getElementById('btn-confirm-import')?.addEventListener('click', handleConfirmImport);
    document.getElementById('btn-back-step1')?.addEventListener('click', () => {
        document.getElementById('import-step-2').classList.add('d-none');
        document.getElementById('import-step-1').classList.remove('d-none');
    });
}

function getRisorseFilters() {
    return {
        search: document.getElementById('risorse-search')?.value || '',
        skill: document.getElementById('filter-skill')?.value || '',
        level: document.getElementById('filter-level')?.value || '',
    };
}

// ============================================================
// TSV IMPORT (Legacy modal)
// ============================================================
function handleParse() {
    const text = document.getElementById('paste-input').value;
    if (!text.trim()) { alert("Incolla prima i dati."); return; }

    importerInstance = new SmartImporter(DATA.resources, DATA.projects);
    const result = importerInstance.parseTSV(text);
    if (!result.success) { alert(result.message); return; }

    currentImportData = result.data;
    renderReviewTable(currentImportData);
    document.getElementById('import-step-1').classList.add('d-none');
    document.getElementById('import-step-2').classList.remove('d-none');
    document.getElementById('lbl-row-count').textContent = result.count;
}

function renderReviewTable(data) {
    const tbody = document.getElementById('review-body');
    tbody.innerHTML = '';
    data.forEach((row, index) => {
        const tr = document.createElement('tr');
        let matchHtml = '';
        if (row.matchStatus === 'exact') {
            matchHtml = `<span class="badge bg-success">Mappato: ${row.matchedResource.name}</span>`;
        } else if (row.matchStatus === 'fuzzy') {
            matchHtml = `<div class="input-group input-group-sm">
                <span class="input-group-text bg-warning text-dark">?</span>
                <select class="form-select border-warning" onchange="updateMatch(${index}, this.value)">
                    <option value="${row.matchedResource.id}" selected>${row.matchedResource.name} (Probabile)</option>
                    <option value="-1">-- Nuova Risorsa --</option>
                    ${DATA.resources.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}
                </select></div>`;
        } else {
            matchHtml = `<select class="form-select form-select-sm border-danger" onchange="updateMatch(${index}, this.value)">
                <option value="-1" selected>-- Non trovata (Crea Nuova) --</option>
                ${DATA.resources.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}
            </select>`;
        }
        tr.innerHTML = `<td>${row.rawName}</td><td>${matchHtml}</td><td>${row.project}</td><td>${row.totalDays.toFixed(1)}</td>`;
        tbody.appendChild(tr);
    });
}

window.updateMatch = (index, value) => {
    const row = currentImportData[index];
    if (value == -1) { row.matchStatus = 'none'; row.matchedResource = null; }
    else { row.matchedResource = DATA.resources.find(r => r.id == value); row.matchStatus = 'manual'; }
};

function handleConfirmImport() {
    const year = getYear();
    let importCount = 0;
    currentImportData.forEach(row => {
        const resourceId = row.matchedResource?.id;
        let projectId = row.matchedProject?.id || (DATA.projects.length > 0 ? DATA.projects[0].id : null);
        if (resourceId && projectId) {
            Object.entries(row.monthlyAllocations || {}).forEach(([month, days]) => {
                const resource = DATA.getResource(resourceId);
                const rate = getYear() === 2026 ? (resource?.adrc26 || 0) : (resource?.adrc25 || 0);
                DATA.upsertBooking({ resourceId, projectId, month: parseInt(month), year, days, cost: days * rate, type: 'plan' });
            });
            importCount++;
        }
    });
    alert(`Importate allocazioni per ${importCount} righe.`);
    bootstrap.Modal.getInstance(document.getElementById('importModal')).hide();
    renderStaffingTable();
    updateStats();
}

// ============================================================
// EXPORT
// ============================================================
function handleExport() {
    if (typeof ExportModule === 'undefined') return;
    new ExportModule(DATA).exportStaffingView(getYear());
}
function handleSamanthaExport() {
    if (typeof ExportModule === 'undefined') return;
    new ExportModule(DATA).exportSamanthaFormat(getYear());
}

// ---- Util ----
function getYear() {
    return parseInt(document.getElementById('filter-year')?.value) || 2025;
}

// ============================================================
// TAB 4 — VISTA GIORNALIERA (Day-view)
// ============================================================

// Italian public holidays: [month(1-12), day]
const IT_HOLIDAYS = {
    2025: [[1, 1], [1, 6], [4, 21], [4, 25], [5, 1], [6, 2], [8, 15], [11, 1], [12, 8], [12, 25], [12, 26]],
    2026: [[1, 1], [1, 6], [4, 6], [4, 25], [5, 1], [6, 2], [8, 15], [11, 1], [12, 8], [12, 25], [12, 26]],
};

// Returns null (working), or a string reason (non-working)
function getNonWorkingReason(date) {
    const dow = date.getDay(); // 0=Sun, 6=Sat
    if (dow === 0) return 'Domenica';
    if (dow === 6) return 'Sabato';
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const holidays = IT_HOLIDAYS[y] || [];
    const hit = holidays.find(([hm, hd]) => hm === m && hd === d);
    if (hit) return 'Festivo';
    return null; // working day
}

// Project color palette (deterministic by project id)
const DV_PALETTE = [
    '#6366f1', // indigo
    '#10b981', // emerald
    '#f59e0b', // amber
    '#06b6d4', // cyan
    '#f43f5e', // rose
    '#8b5cf6', // violet
    '#84cc16', // lime
    '#fb923c', // orange
    '#0ea5e9', // sky
    '#a78bfa', // purple-light
];

function projectColor(projectId) {
    const proj = DATA.getProject(projectId);
    const idx = proj ? (proj.id % DV_PALETTE.length) : 0;
    return DV_PALETTE[idx];
}

// Returns allocation for ONE resource on a given JS Date
// Each segment: { label, hours, color, isBench }
function getDayAllocation(resourceId, date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const monthIndex = date.getMonth();
    const wd = getWorkingDays(year, monthIndex);
    if (wd === 0) return [];

    const bookings = DATA.bookings.filter(b =>
        b.resourceId === resourceId &&
        b.year === year &&
        b.month === month &&
        b.type === 'plan'
    );

    const segments = [];
    let totalAllocH = 0;

    bookings.forEach(b => {
        if (!b.days || b.days === 0) return;
        const hours = Math.round((b.days / wd) * 8 * 10) / 10;
        if (hours === 0) return;
        const proj = DATA.getProject(b.projectId);
        segments.push({
            label: proj ? proj.name : '?',
            code: proj ? proj.code : '',
            hours,
            color: projectColor(b.projectId),
            isBench: false,
        });
        totalAllocH += hours;
    });

    // Also consider absences for this month (reduce available capacity)
    const absences = (DATA.absences || []).filter(a =>
        a.resourceId === resourceId && a.year === year && a.month === month
    );
    let absH = 0;
    absences.forEach(a => {
        if (!a.days) return;
        const h = Math.round((a.days / wd) * 8 * 10) / 10;
        absH += h;
    });

    const bench = Math.max(0, Math.round((8 - totalAllocH - absH) * 10) / 10);
    if (bench > 0) {
        segments.push({ label: 'Bench', hours: bench, color: 'rgba(180,180,180,0.4)', isBench: true });
    }

    if (absH > 0) {
        segments.push({ label: 'Assenza', hours: Math.min(absH, 8 - totalAllocH), color: 'rgba(244,63,94,0.35)', isBench: false, isAbsence: true });
    }

    return segments;
}

function renderDayView(dateStr) {
    const body = document.getElementById('dayview-body');
    const summaryBar = document.getElementById('dv-summary-bar');
    const weekdayLabel = document.getElementById('dv-weekday-label');
    const holidayBadge = document.getElementById('dv-holiday-badge');
    if (!body) return;

    // Parse date — avoid timezone offset issues by treating as local
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);

    const WEEKDAYS_IT = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    weekdayLabel.textContent = WEEKDAYS_IT[date.getDay()];

    const reason = getNonWorkingReason(date);
    if (reason && reason !== 'Domenica' && reason !== 'Sabato') {
        holidayBadge.textContent = reason;
        holidayBadge.style.display = '';
    } else {
        holidayBadge.style.display = 'none';
        holidayBadge.textContent = '';
    }

    if (reason) {
        body.innerHTML = `
            <div class="dv-no-work">
                <i class="bi bi-moon-stars-fill"></i>
                <span>${reason} — giorno non lavorativo</span>
            </div>`;
        summaryBar.innerHTML = '';
        return;
    }

    body.innerHTML = '';
    let totalResources = 0;
    let fullyAllocated = 0;
    let benchTotal = 0;

    DATA.resources.forEach(res => {
        const initials = res.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        const segments = getDayAllocation(res.id, date);

        const totalH = segments.reduce((s, seg) => s + seg.hours, 0);
        const allocH = segments.filter(s => !s.isBench && !s.isAbsence).reduce((s, seg) => s + seg.hours, 0);
        const benchH = segments.find(s => s.isBench)?.hours || 0;

        totalResources++;
        if (allocH >= 7.9) fullyAllocated++;
        benchTotal += benchH;

        // Build bar segments
        const barSegments = segments.map(seg => {
            const pct = Math.round((seg.hours / 8) * 1000) / 10;
            const label = pct > 10 ? `${seg.hours}h` : '';
            return `<div class="dv-segment"
                style="width:${pct}%;background:${seg.color};"
                title="${seg.label}: ${seg.hours}h"
            >${label}</div>`;
        }).join('');

        // Build legend
        const legend = segments.map(seg => {
            return `<span class="dv-legend-item">
                <span class="dv-legend-dot" style="background:${seg.color};"></span>
                ${seg.label} <strong style="color:rgba(255,255,255,0.65);margin-left:2px;">${seg.hours}h</strong>
            </span>`;
        }).join('');

        const row = document.createElement('div');
        row.className = 'dv-row';
        row.innerHTML = `
            <div class="dv-res-name">
                <div class="dv-avatar">${initials}</div>
                <div>
                    <div class="dv-name-text">${res.name}</div>
                    <div class="dv-skill-text">${res.skillsArea}</div>
                </div>
            </div>
            <div class="dv-right">
                <div class="dv-bar">${barSegments || '<div style="color:rgba(255,255,255,.2);font-size:.7rem;padding:0 8px;">nessuna allocazione</div>'}</div>
                <div class="dv-legend">${legend || '<span class="dv-legend-item">Bench 8h</span>'}</div>
            </div>`;
        body.appendChild(row);
    });

    // Summary
    const avgBench = totalResources > 0 ? Math.round(benchTotal / totalResources * 10) / 10 : 0;
    summaryBar.innerHTML = `
        <i class="bi bi-people-fill" style="color:#6366f1"></i>
        <strong style="color:rgba(255,255,255,.7)">${totalResources}</strong> risorse &bull;
        <i class="bi bi-check-circle-fill" style="color:#10b981;margin-left:4px;"></i>
        <strong style="color:#6ee7b7">${fullyAllocated}</strong> fully allocated &bull;
        <i class="bi bi-hourglass-split" style="color:rgba(180,180,180,.6);margin-left:4px;"></i>
        Bench medio <strong style="color:rgba(180,180,180,.8);">${avgBench}h</strong>
    `;
}

function initDayView() {
    const input = document.getElementById('dv-date');
    if (!input) return;

    // Default to today (or most recent working day)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    input.value = todayStr;
    renderDayView(todayStr);

    input.addEventListener('change', () => renderDayView(input.value));

    // Local date formatter — avoids UTC-shift off-by-one
    function localDateStr(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dd}`;
    }

    document.getElementById('dv-prev')?.addEventListener('click', () => {
        const [py, pm, pd] = input.value.split('-').map(Number);
        const d = new Date(py, pm - 1, pd - 1);
        input.value = localDateStr(d);
        renderDayView(input.value);
    });

    document.getElementById('dv-next')?.addEventListener('click', () => {
        const [py, pm, pd] = input.value.split('-').map(Number);
        const d = new Date(py, pm - 1, pd + 1);
        input.value = localDateStr(d);
        renderDayView(input.value);
    });

    // Re-render when the day-view tab is clicked
    document.querySelectorAll('.dark-tab').forEach(btn => {
        if (btn.dataset.tab === 'tab-dayview') {
            btn.addEventListener('click', () => renderDayView(input.value));
        }
    });
}

// ============================================================
// TAB 5 — PIANO GIORNALIERO (Daily Staffing Grid)
// ============================================================

const MONTHS_IT_FULL = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const DOW_MINI = ['D', 'L', 'M', 'M', 'G', 'V', 'S'];

// Today reference (Feb 22 2026 per system time)
const DG_TODAY = new Date(2026, 1, 22);
const DG_TODAY_STR = '2026-02-22';

let dgYear = 2026;
let dgMonth = 2; // 1-based

function dgDateStr(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Seed daily actuals: Jan 2026 full + Feb 1-22 past + Feb 23-28 ~60% planned
function seedDailyActuals() {
    if (DATA._dailySeeded) return;
    DATA._dailySeeded = true;

    [[2026, 1], [2026, 2]].forEach(([year, month]) => {
        const monthIndex = month - 1;
        const daysInMonth = new Date(year, month, 0).getDate();
        const wd = getWorkingDays(year, monthIndex);
        if (wd === 0) return;

        const monthBookings = DATA.bookings.filter(b =>
            b.year === year && b.month === month && b.type === 'plan' && b.days > 0
        );

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, monthIndex, day);
            const dow = date.getDay();
            if (dow === 0 || dow === 6) continue;

            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isPast = date <= DG_TODAY;

            monthBookings.forEach(b => {
                const key = `${b.resourceId}_${b.projectId}_${dateStr}`;
                if (DATA.dailyOverrides[key] !== undefined) return;
                const baseH = Math.round(b.days * 8 / wd * 10) / 10;
                if (baseH === 0) return;
                if (isPast) {
                    DATA.dailyOverrides[key] = baseH;
                } else {
                    // Deterministic 60% fill for future working days
                    const seed = ((b.resourceId * 31 + b.projectId * 17 + day * 7) % 100) / 100;
                    if (seed < 0.6) DATA.dailyOverrides[key] = baseH;
                }
            });
        }
    });
}

// Helper: class for a daily hours value (mirrors staffing grid thresholds)
function dgValueClass(h) {
    if (!h || h === 0) return 'days-empty';
    if (h > 6) return 'days-high';
    if (h > 4) return 'days-medium';
    return 'days-low';
}

// Update bench cell — matches staffing grid bench style (grey)
function dgUpdateBenchCell(td, resBookings, dateStr) {
    const allocated = resBookings.reduce((sum, b) =>
        sum + (DATA.dailyOverrides[`${b.resourceId}_${b.projectId}_${dateStr}`] ?? 0), 0);
    const bench = Math.round(Math.max(0, 8 - allocated) * 10) / 10;
    const GREY = 'rgba(180,180,180,0.55)';
    if (bench > 0 && bench < 8) {
        td.innerHTML = `<span style="color:${GREY};font-size:.72rem;font-weight:600;">${bench}h</span>`;
    } else if (bench >= 8) {
        td.innerHTML = `<span class="days-empty">·</span>`;
    } else {
        td.innerHTML = `<span class="days-empty">·</span>`;
    }
}

// Update resource total cell — uses dg-total-val
function dgUpdateResTotalCell(td, resBookings, dateStr) {
    const totalH = resBookings.reduce((sum, b) =>
        sum + (DATA.dailyOverrides[`${b.resourceId}_${b.projectId}_${dateStr}`] ?? 0), 0);
    const cls = dgValueClass(totalH);
    td.innerHTML = totalH > 0
        ? `<span class="dg-total-val ${cls}">${totalH}h</span>`
        : `<span class="days-empty">·</span>`;
}

// Inline cell editor — click → number input → blur or Enter saves
function dgActivateCellEditor(td, resourceId, projectId, dateStr, resBookings) {
    if (td.querySelector('.dg-cell-input')) return;

    const key = `${resourceId}_${projectId}_${dateStr}`;
    const currentVal = DATA.dailyOverrides[key] ?? '';

    td.innerHTML = '';
    const input = document.createElement('input');
    input.type = 'number';
    input.min = 0; input.max = 8; input.step = 0.5;
    input.value = currentVal;
    input.className = 'dg-cell-input';
    td.appendChild(input);
    input.focus();
    input.select();

    const commit = () => {
        const raw = parseFloat(input.value);
        if (!isNaN(raw) && raw >= 0 && raw <= 8) {
            DATA.dailyOverrides[key] = Math.round(raw * 10) / 10;
        } else if (input.value === '' || isNaN(raw)) {
            delete DATA.dailyOverrides[key];
        }
        const saved = DATA.dailyOverrides[key];
        const cls = dgValueClass(saved ?? 0);
        td.innerHTML = (saved !== undefined && saved > 0)
            ? `<span class="${cls}">${saved}h</span>`
            : `<span class="days-empty">·</span>`;

        // Refresh bench cell
        const benchTd = document.querySelector(
            `.dg-bench-row[data-res-id="${resourceId}"] td.dg-bench-cell[data-date="${dateStr}"]`
        );
        if (benchTd) dgUpdateBenchCell(benchTd, resBookings, dateStr);

        // Refresh resource total cell
        const resTotalTd = document.querySelector(
            `.dg-res-header[data-res-id="${resourceId}"] td.dg-res-total[data-date="${dateStr}"]`
        );
        if (resTotalTd) dgUpdateResTotalCell(resTotalTd, resBookings, dateStr);
    };

    input.addEventListener('blur', commit);
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
        if (e.key === 'Escape') {
            const orig = DATA.dailyOverrides[key];
            const cls2 = dgValueClass(orig ?? 0);
            td.innerHTML = (orig !== undefined && orig > 0)
                ? `<span class="${cls2}">${orig}h</span>`
                : `<span class="days-empty">·</span>`;
        }
    });
}

// Main render function — builds the full daily grid for year/month
function renderDailyGrid(year, month) {
    dgYear = year; dgMonth = month;

    const wrap = document.getElementById('daily-grid-wrap');
    if (!wrap) return;

    document.getElementById('dg-month-label').textContent =
        `${MONTHS_IT_FULL[month - 1]} ${year}`;

    const monthIndex = month - 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    const wd = getWorkingDays(year, monthIndex);

    // Build day metadata array
    const days = Array.from({ length: daysInMonth }, (_, i) => {
        const d = new Date(year, monthIndex, i + 1);
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
        const dow = d.getDay();
        return {
            day: i + 1, dateStr, dow,
            isWeekend: dow === 0 || dow === 6,
            isToday: dateStr === DG_TODAY_STR,
            isPast: d <= DG_TODAY,
        };
    });

    const table = document.createElement('table');
    table.className = 'dg-table';

    // --- THEAD ---
    const thead = document.createElement('thead');
    const headTr = document.createElement('tr');
    const thName = document.createElement('th');
    thName.className = 'dg-th dg-sticky-col';
    thName.textContent = 'Risorsa / Progetto';
    headTr.appendChild(thName);

    days.forEach(({ day, dow, isWeekend, isToday }) => {
        const th = document.createElement('th');
        th.className = 'dg-th dg-day-header' +
            (isWeekend ? ' dg-weekend' : '') + (isToday ? ' dg-today-col' : '');
        th.innerHTML = `<div class="dg-dn">${day}</div><div class="dg-dw">${DOW_MINI[dow]}</div>`;
        headTr.appendChild(th);
    });
    thead.appendChild(headTr);
    table.appendChild(thead);

    // --- TBODY ---
    const tbody = document.createElement('tbody');

    DATA.resources.forEach(res => {
        const resBookings = DATA.bookings.filter(b =>
            b.resourceId === res.id && b.year === year && b.month === month && b.type === 'plan'
        );
        if (resBookings.length === 0) return;

        const groupId = `dg-grp-${res.id}`;
        const initials = res.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

        // Resource header row — use staffing grid class
        const resHdrTr = document.createElement('tr');
        resHdrTr.className = 'res-group-header dg-res-header';
        resHdrTr.dataset.group = groupId;
        resHdrTr.dataset.resId = res.id;

        const tdResName = document.createElement('td');
        tdResName.className = 'dg-sticky-col dg-res-name-cell';
        tdResName.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;">
                <i class="bi bi-chevron-down dg-toggle" style="font-size:.65rem;transition:transform .2s;flex-shrink:0;"></i>
                <div style="width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);
                    display:flex;align-items:center;justify-content:center;color:white;font-size:.6rem;font-weight:700;flex-shrink:0;">${initials}</div>
                <div>
                    <div style="font-size:.8rem;font-weight:700;color:white;">${res.name}</div>
                    <span class="chip-skill" style="font-size:.62rem;">${res.skillsArea}</span>
                </div>
            </div>`;
        resHdrTr.appendChild(tdResName);

        days.forEach(({ dateStr, isWeekend, isToday }) => {
            const td = document.createElement('td');
            td.className = 'dg-cell dg-res-total' +
                (isWeekend ? ' dg-weekend' : '') + (isToday ? ' dg-today-col' : '');
            td.dataset.date = dateStr;
            if (isWeekend) { td.innerHTML = `<span class="dg-weekend-mark">—</span>`; }
            else { dgUpdateResTotalCell(td, resBookings, dateStr); }
            resHdrTr.appendChild(td);
        });

        tdResName.addEventListener('click', () => {
            const collapsed = resHdrTr.classList.toggle('dg-collapsed');
            resHdrTr.querySelector('.dg-toggle').style.transform = collapsed ? 'rotate(-90deg)' : '';
            tbody.querySelectorAll(`tr[data-group="${groupId}"]`).forEach(r => {
                if (r === resHdrTr) return;
                r.style.display = collapsed ? 'none' : '';
            });
        });
        tbody.appendChild(resHdrTr);

        // Project sub-rows
        resBookings.forEach(b => {
            const proj = DATA.getProject(b.projectId);
            const projTr = document.createElement('tr');
            projTr.className = 'proj-sub-row dg-proj-row';
            projTr.dataset.group = groupId;

            const tdProjName = document.createElement('td');
            tdProjName.className = 'dg-sticky-col dg-proj-name-cell';
            tdProjName.innerHTML = `
                <div style="padding-left:44px;display:flex;align-items:center;gap:6px;">
                    <i class="bi bi-folder2-open" style="color:#6366f1;font-size:.7rem;flex-shrink:0;"></i>
                    <div>
                        <div style="font-size:.74rem;font-weight:600;color:rgba(255,255,255,.75);
                            max-width:130px;overflow:hidden;text-overflow:ellipsis;">${proj?.name || '—'}</div>
                        <code style="font-size:.6rem;color:rgba(255,255,255,.28);">${proj?.code || ''}</code>
                    </div>
                </div>`;
            projTr.appendChild(tdProjName);

            days.forEach(({ dateStr, isWeekend, isToday, isPast }) => {
                const td = document.createElement('td');
                td.className = 'dg-cell' +
                    (isWeekend ? ' dg-weekend' : '') +
                    (isToday ? ' dg-today-col' : '') +
                    (isPast ? ' dg-past' : ' dg-future') +
                    (!isWeekend ? ' dg-editable' : '');
                td.dataset.date = dateStr;
                td.dataset.resId = b.resourceId;
                td.dataset.projId = b.projectId;

                if (isWeekend) {
                    td.innerHTML = `<span class="dg-weekend-mark">—</span>`;
                } else {
                    const key = `${b.resourceId}_${b.projectId}_${dateStr}`;
                    const h = DATA.dailyOverrides[key];
                    const cls = dgValueClass(h ?? 0);
                    td.innerHTML = (h !== undefined && h > 0)
                        ? `<span class="${cls}">${h}h</span>`
                        : `<span class="days-empty">·</span>`;
                    td.addEventListener('click', () =>
                        dgActivateCellEditor(td, b.resourceId, b.projectId, dateStr, resBookings)
                    );
                }
                projTr.appendChild(td);
            });
            tbody.appendChild(projTr);
        });

        // Bench row — use staffing grid absence-sub-row + bench-row classes
        const benchTr = document.createElement('tr');
        benchTr.className = 'absence-sub-row bench-row dg-bench-row';
        benchTr.dataset.group = groupId;
        benchTr.dataset.resId = res.id;

        const tdBenchName = document.createElement('td');
        tdBenchName.className = 'dg-sticky-col dg-bench-name-cell';
        tdBenchName.innerHTML = `
            <div style="padding-left:44px;display:flex;align-items:center;gap:6px;">
                <i class="bi bi-hourglass-split" style="color:rgba(180,180,180,.4);font-size:.7rem;"></i>
                <span style="font-size:.74rem;font-weight:600;color:rgba(180,180,180,.5);">Bench</span>
            </div>`;
        benchTr.appendChild(tdBenchName);

        days.forEach(({ dateStr, isWeekend, isToday }) => {
            const td = document.createElement('td');
            td.className = 'dg-cell dg-bench-cell' +
                (isWeekend ? ' dg-weekend' : '') + (isToday ? ' dg-today-col' : '');
            td.dataset.date = dateStr;
            if (isWeekend) { td.innerHTML = `<span class="dg-weekend-mark">—</span>`; }
            else { dgUpdateBenchCell(td, resBookings, dateStr); }
            benchTr.appendChild(td);
        });
        tbody.appendChild(benchTr);
    });

    table.appendChild(tbody);
    wrap.innerHTML = '';
    wrap.appendChild(table);

    // Auto-scroll to today's column
    const todayTh = table.querySelector('th.dg-today-col');
    if (todayTh) {
        setTimeout(() => todayTh.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }), 80);
    }
}

// Init — seeds data and wires nav + inline period toggle
function initDailyGrid() {
    seedDailyActuals();

    // Month navigator arrows
    document.getElementById('dg-prev')?.addEventListener('click', () => {
        dgMonth--;
        if (dgMonth < 1) { dgMonth = 12; dgYear--; }
        renderDailyGrid(dgYear, dgMonth);
    });

    document.getElementById('dg-next')?.addEventListener('click', () => {
        dgMonth++;
        if (dgMonth > 12) { dgMonth = 1; dgYear++; }
        renderDailyGrid(dgYear, dgMonth);
    });

    // Mensile / Giornaliero period toggle (inside Staffing Grid tab)
    const btnMonthly = document.getElementById('btn-period-monthly');
    const btnDaily = document.getElementById('btn-period-daily');
    const monthlyControls = document.getElementById('staffing-monthly-controls');
    const dailyWrap = document.getElementById('staffing-daily-wrap');
    const cardTitle = document.getElementById('staffing-card-title');

    const ACTIVE_STYLE = 'background:rgba(99,102,241,0.25);color:#a5b4fc;';
    const INACTIVE_STYLE = 'background:transparent;color:rgba(255,255,255,0.4);';

    function showMonthly() {
        monthlyControls.style.display = '';
        dailyWrap.style.display = 'none';
        btnMonthly.style.cssText += ACTIVE_STYLE;
        btnDaily.style.cssText += INACTIVE_STYLE;
        if (cardTitle) cardTitle.textContent = 'Allocazione Mensile per Risorsa — Piano (giorni)';
    }

    function showDaily() {
        monthlyControls.style.display = 'none';
        dailyWrap.style.display = '';
        btnMonthly.style.cssText += INACTIVE_STYLE;
        btnDaily.style.cssText += ACTIVE_STYLE;
        if (cardTitle) cardTitle.textContent = 'Piano Giornaliero — Allocazione per Risorsa';
        renderDailyGrid(dgYear, dgMonth);
    }

    btnMonthly?.addEventListener('click', showMonthly);
    btnDaily?.addEventListener('click', showDaily);
}
