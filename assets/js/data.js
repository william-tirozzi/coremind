// ============================================================
// PSFC — Centralized Data Store
// Struttura basata su: MASTER 2025/2026, DB, RISORSE, PER CODIFICA
// ============================================================

const DATA = {

    // --------------------------------------------------------
    // RISORSE — Employee, Rate Level, Skills Area, ADRC 25/26
    // --------------------------------------------------------
    resources: [
        { id: 1, name: "Marco Ferretti", rateLevel: "L4", skillsArea: "Project Management", adrc25: 620, adrc26: 645 },
        { id: 2, name: "Laura Conti", rateLevel: "L3", skillsArea: "Business Analysis", adrc25: 480, adrc26: 495 },
        { id: 3, name: "Davide Esposito", rateLevel: "L3", skillsArea: "Software Engineering", adrc25: 460, adrc26: 475 },
        { id: 4, name: "Chiara Lombardi", rateLevel: "L2", skillsArea: "Software Engineering", adrc25: 380, adrc26: 395 },
        { id: 5, name: "Giorgio Mancini", rateLevel: "L4", skillsArea: "Architecture", adrc25: 700, adrc26: 730 },
        { id: 6, name: "Alessia Gallo", rateLevel: "L2", skillsArea: "Business Analysis", adrc25: 360, adrc26: 375 },
        { id: 7, name: "Luca Ricci", rateLevel: "L3", skillsArea: "Data & Analytics", adrc25: 510, adrc26: 530 },
        { id: 8, name: "Francesca Bruno", rateLevel: "L2", skillsArea: "Data & Analytics", adrc25: 390, adrc26: 405 },
        { id: 9, name: "Matteo Santoro", rateLevel: "L1", skillsArea: "Software Engineering", adrc25: 290, adrc26: 300 },
        { id: 10, name: "Valentina De Rosa", rateLevel: "L3", skillsArea: "Project Management", adrc25: 490, adrc26: 510 },
        { id: 11, name: "Simone Ferrero", rateLevel: "L2", skillsArea: "Architecture", adrc25: 420, adrc26: 435 },
        { id: 12, name: "Irene Colombo", rateLevel: "L1", skillsArea: "Business Analysis", adrc25: 270, adrc26: 280 },
        { id: 13, name: "Antonio Ruggiero", rateLevel: "L4", skillsArea: "Cybersecurity", adrc25: 680, adrc26: 710 },
        { id: 14, name: "Sara Martinelli", rateLevel: "L2", skillsArea: "Cybersecurity", adrc25: 400, adrc26: 415 },
        { id: 15, name: "Emanuele Vitale", rateLevel: "L3", skillsArea: "Data & Analytics", adrc25: 540, adrc26: 560 },
    ],

    // --------------------------------------------------------
    // BILLABILITY CODICE — da foglio PER CODIFICA
    // --------------------------------------------------------
    billabilityCodes: [
        { type: "BILLABLE", label: "Billable", color: "success" },
        { type: "NON-BILLABLE", label: "Non Billable", color: "secondary" },
        { type: "CAPEX", label: "CAPEX", color: "info" },
        { type: "OVERHEAD", label: "Overhead", color: "warning" },
        { type: "INVESTMENT", label: "Investment", color: "primary" },
    ],

    // --------------------------------------------------------
    // MARKET SEGMENTS
    // --------------------------------------------------------
    marketSegments: [
        "Financial Services", "Public Sector", "Industrial", "Telco & Media", "Energy & Utilities", "Retail"
    ],

    // --------------------------------------------------------
    // DB PROGETTI — WBS Element, Project Manager, Billability, Type, Dates
    // --------------------------------------------------------
    projects: [
        {
            id: 101, code: "WBS-FIN-001",
            name: "Core Banking Transformation",
            client: "Banca Meridionale S.p.A.",
            soldToParty: "Banca Meridionale S.p.A.",
            billToParty: "Banca Meridionale S.p.A.",
            projectManager: "Marco Ferretti",
            marketSegment: "Financial Services",
            billability: "BILLABLE",
            type: "EXTERNAL",
            startDate: "2025-01-15",
            finishDate: "2026-06-30",
            budget: 380000,
            projectDefinition: "P-FIN-2025-001"
        },
        {
            id: 102, code: "WBS-PUB-002",
            name: "Piattaforma Digitalizzazione PA",
            client: "Ministero della Transizione Digitale",
            soldToParty: "Ministero della Transizione Digitale",
            billToParty: "Ministero della Transizione Digitale",
            projectManager: "Valentina De Rosa",
            marketSegment: "Public Sector",
            billability: "BILLABLE",
            type: "EXTERNAL",
            startDate: "2025-03-01",
            finishDate: "2025-12-31",
            budget: 210000,
            projectDefinition: "P-PUB-2025-002"
        },
        {
            id: 103, code: "WBS-IND-003",
            name: "MES Integration Factory 4.0",
            client: "Fabbrica Italiana Automotive S.r.l.",
            soldToParty: "Fabbrica Italiana Automotive S.r.l.",
            billToParty: "FIA Group",
            projectManager: "Giorgio Mancini",
            marketSegment: "Industrial",
            billability: "CAPEX",
            type: "EXTERNAL",
            startDate: "2025-02-01",
            finishDate: "2026-03-31",
            budget: 520000,
            projectDefinition: "P-IND-2025-003"
        },
        {
            id: 104, code: "WBS-TEL-004",
            name: "OSS/BSS Modernization",
            client: "TelcoItalia Group",
            soldToParty: "TelcoItalia S.p.A.",
            billToParty: "TelcoItalia S.p.A.",
            projectManager: "Luca Ricci",
            marketSegment: "Telco & Media",
            billability: "BILLABLE",
            type: "EXTERNAL",
            startDate: "2025-04-01",
            finishDate: "2026-01-31",
            budget: 290000,
            projectDefinition: "P-TEL-2025-004"
        },
        {
            id: 105, code: "WBS-INT-005",
            name: "Internal Innovation Lab",
            client: "Internal",
            soldToParty: "Internal",
            billToParty: "Internal",
            projectManager: "Simone Ferrero",
            marketSegment: "Industrial",
            billability: "INVESTMENT",
            type: "INTERNAL",
            startDate: "2025-01-01",
            finishDate: "2025-12-31",
            budget: 95000,
            projectDefinition: "P-INT-2025-005"
        },
        {
            id: 106, code: "WBS-ENE-006",
            name: "Smart Grid Analytics Platform",
            client: "EnerCo S.p.A.",
            soldToParty: "EnerCo S.p.A.",
            billToParty: "EnerCo S.p.A.",
            projectManager: "Emanuele Vitale",
            marketSegment: "Energy & Utilities",
            billability: "BILLABLE",
            type: "EXTERNAL",
            startDate: "2025-05-01",
            finishDate: "2026-06-30",
            budget: 175000,
            projectDefinition: "P-ENE-2025-006"
        },
        {
            id: 107, code: "WBS-FIN-007",
            name: "Cybersecurity Compliance DORA",
            client: "Assicurazioni Nord S.p.A.",
            soldToParty: "Assicurazioni Nord S.p.A.",
            billToParty: "Assicurazioni Nord S.p.A.",
            projectManager: "Antonio Ruggiero",
            marketSegment: "Financial Services",
            billability: "BILLABLE",
            type: "EXTERNAL",
            startDate: "2025-02-15",
            finishDate: "2025-11-30",
            budget: 145000,
            projectDefinition: "P-FIN-2025-007"
        },
        {
            id: 108, code: "WBS-RET-008",
            name: "E-Commerce Platform Revamp",
            client: "Moda Italia S.r.l.",
            soldToParty: "Moda Italia S.r.l.",
            billToParty: "Moda Italia S.r.l.",
            projectManager: "Laura Conti",
            marketSegment: "Retail",
            billability: "BILLABLE",
            type: "EXTERNAL",
            startDate: "2025-06-01",
            finishDate: "2026-02-28",
            budget: 130000,
            projectDefinition: "P-RET-2025-008"
        }
    ],

    // --------------------------------------------------------
    // MASTER DATA — Metadati di progetto per anno (da MASTER 2025/2026)
    // --------------------------------------------------------
    masterData: {
        2025: {
            projectId: "PSFC-MASTER-2025",
            client: "Portfolio Clienti 2025",
            totalBudget: 1945000,
            invoicedYTD: 820000,
            targetMargin: 22.5,
            updatedAt: "2025-02-03",
            notes: "Anno di consolidamento. Focus Financial Services e PA."
        },
        2026: {
            projectId: "PSFC-MASTER-2026",
            client: "Portfolio Clienti 2026",
            totalBudget: 2310000,
            invoicedYTD: 0,
            targetMargin: 24.0,
            updatedAt: "2026-01-20",
            notes: "Piano in costruzione. Espansione Energy e Industrial."
        }
    },

    // --------------------------------------------------------
    // BOOKINGS — Allocazioni mensili (Plan & Actual)
    // --------------------------------------------------------
    bookings: [],

    // DAILY OVERRIDES — ore giornaliere per risorsa/progetto (in-memory)
    // key: 'resourceId_projectId_YYYY-MM-DD', value: hours (0-8)
    dailyOverrides: {},

    // ---- Helpers ----

    getBooking(resourceId, projectId, month, year, type) {
        return this.bookings.find(b =>
            b.resourceId === resourceId &&
            b.projectId === projectId &&
            b.month === month &&
            b.year === year &&
            b.type === type
        );
    },

    upsertBooking(booking) {
        const index = this.bookings.findIndex(b =>
            b.resourceId === booking.resourceId &&
            b.projectId === booking.projectId &&
            b.month === booking.month &&
            b.year === booking.year &&
            b.type === booking.type
        );
        if (index > -1) {
            this.bookings[index] = { ...this.bookings[index], ...booking };
        } else {
            this.bookings.push({ ...booking, id: Date.now() + Math.random() });
        }
    },

    getProject(id) { return this.projects.find(p => p.id === id); },
    getResource(id) { return this.resources.find(r => r.id === id); },

    // ---- Absence helpers ----
    getAbsences(resourceId, year) {
        return this.absences.filter(a => a.resourceId === resourceId && a.year === year);
    },

    upsertAbsence(absence) {
        const idx = this.absences.findIndex(a =>
            a.resourceId === absence.resourceId &&
            a.year === absence.year &&
            a.month === absence.month &&
            a.type === absence.type
        );
        if (idx > -1) this.absences[idx] = { ...this.absences[idx], ...absence };
        else this.absences.push({ ...absence, id: Date.now() + Math.random() });
    }
};

// --------------------------------------------------------
// ABSENCES — Ferie, PAR, Learning, Absences (malattia)
// Types: 'ferie' | 'par' | 'learning' | 'absences'
// --------------------------------------------------------
DATA.absences = [
    // ---- Marco Ferretti (id:1) ----
    { resourceId: 1, year: 2025, month: 1, type: 'ferie', days: 0 },
    { resourceId: 1, year: 2025, month: 2, type: 'ferie', days: 0 },
    { resourceId: 1, year: 2025, month: 3, type: 'ferie', days: 0 },
    { resourceId: 1, year: 2025, month: 4, type: 'ferie', days: 0 },
    { resourceId: 1, year: 2025, month: 5, type: 'ferie', days: 0 },
    { resourceId: 1, year: 2025, month: 6, type: 'ferie', days: 2 },
    { resourceId: 1, year: 2025, month: 7, type: 'ferie', days: 5 },
    { resourceId: 1, year: 2025, month: 8, type: 'ferie', days: 10 },
    { resourceId: 1, year: 2025, month: 9, type: 'ferie', days: 2 },
    { resourceId: 1, year: 2025, month: 10, type: 'ferie', days: 0 },
    { resourceId: 1, year: 2025, month: 11, type: 'ferie', days: 0 },
    { resourceId: 1, year: 2025, month: 12, type: 'ferie', days: 3 },
    { resourceId: 1, year: 2025, month: 1, type: 'par', days: 1 },
    { resourceId: 1, year: 2025, month: 2, type: 'par', days: 0 },
    { resourceId: 1, year: 2025, month: 3, type: 'par', days: 1 },
    { resourceId: 1, year: 2025, month: 4, type: 'par', days: 0 },
    { resourceId: 1, year: 2025, month: 5, type: 'par', days: 1 },
    { resourceId: 1, year: 2025, month: 6, type: 'par', days: 0 },
    { resourceId: 1, year: 2025, month: 7, type: 'par', days: 1 },
    { resourceId: 1, year: 2025, month: 8, type: 'par', days: 0 },
    { resourceId: 1, year: 2025, month: 9, type: 'par', days: 1 },
    { resourceId: 1, year: 2025, month: 10, type: 'par', days: 0 },
    { resourceId: 1, year: 2025, month: 11, type: 'par', days: 1 },
    { resourceId: 1, year: 2025, month: 12, type: 'par', days: 0 },
    { resourceId: 1, year: 2025, month: 2, type: 'learning', days: 2 },
    { resourceId: 1, year: 2025, month: 5, type: 'learning', days: 1 },
    { resourceId: 1, year: 2025, month: 9, type: 'learning', days: 2 },
    { resourceId: 1, year: 2025, month: 11, type: 'learning', days: 1 },
    { resourceId: 1, year: 2025, month: 3, type: 'absences', days: 1 },
    { resourceId: 1, year: 2025, month: 10, type: 'absences', days: 2 },
    // ---- Laura Conti (id:2) ----
    { resourceId: 2, year: 2025, month: 7, type: 'ferie', days: 8 },
    { resourceId: 2, year: 2025, month: 8, type: 'ferie', days: 5 },
    { resourceId: 2, year: 2025, month: 12, type: 'ferie', days: 2 },
    { resourceId: 2, year: 2025, month: 2, type: 'par', days: 1 },
    { resourceId: 2, year: 2025, month: 6, type: 'par', days: 1 },
    { resourceId: 2, year: 2025, month: 10, type: 'par', days: 1 },
    { resourceId: 2, year: 2025, month: 3, type: 'learning', days: 2 },
    { resourceId: 2, year: 2025, month: 9, type: 'learning', days: 2 },
    { resourceId: 2, year: 2025, month: 5, type: 'absences', days: 1 },
    // ---- Davide Esposito (id:3) ----
    { resourceId: 3, year: 2025, month: 7, type: 'ferie', days: 10 },
    { resourceId: 3, year: 2025, month: 8, type: 'ferie', days: 5 },
    { resourceId: 3, year: 2025, month: 4, type: 'par', days: 1 },
    { resourceId: 3, year: 2025, month: 8, type: 'par', days: 1 },
    { resourceId: 3, year: 2025, month: 1, type: 'learning', days: 2 },
    { resourceId: 3, year: 2025, month: 6, type: 'learning', days: 1 },
    { resourceId: 3, year: 2025, month: 2, type: 'absences', days: 2 },
    // ---- Chiara Lombardi (id:4) ----
    { resourceId: 4, year: 2025, month: 8, type: 'ferie', days: 8 },
    { resourceId: 4, year: 2025, month: 7, type: 'par', days: 1 },
    { resourceId: 4, year: 2025, month: 11, type: 'par', days: 1 },
    { resourceId: 4, year: 2025, month: 4, type: 'learning', days: 2 },
    { resourceId: 4, year: 2025, month: 9, type: 'absences', days: 1 },
    // ---- Giorgio Mancini (id:5) ----
    { resourceId: 5, year: 2025, month: 7, type: 'ferie', days: 10 },
    { resourceId: 5, year: 2025, month: 8, type: 'ferie', days: 5 },
    { resourceId: 5, year: 2025, month: 3, type: 'par', days: 1 },
    { resourceId: 5, year: 2025, month: 9, type: 'par', days: 1 },
    { resourceId: 5, year: 2025, month: 2, type: 'learning', days: 3 },
    { resourceId: 5, year: 2025, month: 10, type: 'learning', days: 2 },
    { resourceId: 5, year: 2025, month: 6, type: 'absences', days: 1 },
    // ---- Alessia Gallo (id:6) ----
    { resourceId: 6, year: 2025, month: 8, type: 'ferie', days: 10 },
    { resourceId: 6, year: 2025, month: 5, type: 'par', days: 1 },
    { resourceId: 6, year: 2025, month: 3, type: 'learning', days: 2 },
    { resourceId: 6, year: 2025, month: 11, type: 'absences', days: 3 },
    // ---- Luca Ricci (id:7) ----
    { resourceId: 7, year: 2025, month: 7, type: 'ferie', days: 6 },
    { resourceId: 7, year: 2025, month: 8, type: 'ferie', days: 8 },
    { resourceId: 7, year: 2025, month: 4, type: 'par', days: 1 },
    { resourceId: 7, year: 2025, month: 10, type: 'par', days: 1 },
    { resourceId: 7, year: 2025, month: 5, type: 'learning', days: 2 },
    { resourceId: 7, year: 2025, month: 9, type: 'absences', days: 1 },
    // ---- Francesca Bruno (id:8) ----
    { resourceId: 8, year: 2025, month: 8, type: 'ferie', days: 12 },
    { resourceId: 8, year: 2025, month: 6, type: 'par', days: 1 },
    { resourceId: 8, year: 2025, month: 11, type: 'par', days: 1 },
    { resourceId: 8, year: 2025, month: 3, type: 'learning', days: 2 },
    { resourceId: 8, year: 2025, month: 7, type: 'absences', days: 2 },
    // ---- Matteo Santoro (id:9) ----
    { resourceId: 9, year: 2025, month: 8, type: 'ferie', days: 10 },
    { resourceId: 9, year: 2025, month: 7, type: 'par', days: 1 },
    { resourceId: 9, year: 2025, month: 2, type: 'learning', days: 2 },
    { resourceId: 9, year: 2025, month: 10, type: 'absences', days: 1 },
    // ---- Valentina De Rosa (id:10) ----
    { resourceId: 10, year: 2025, month: 7, type: 'ferie', days: 8 },
    { resourceId: 10, year: 2025, month: 8, type: 'ferie', days: 5 },
    { resourceId: 10, year: 2025, month: 5, type: 'par', days: 1 },
    { resourceId: 10, year: 2025, month: 9, type: 'par', days: 1 },
    { resourceId: 10, year: 2025, month: 4, type: 'learning', days: 2 },
    { resourceId: 10, year: 2025, month: 3, type: 'absences', days: 1 },
    // ---- Simone Ferrero (id:11) ----
    { resourceId: 11, year: 2025, month: 8, type: 'ferie', days: 10 },
    { resourceId: 11, year: 2025, month: 6, type: 'par', days: 1 },
    { resourceId: 11, year: 2025, month: 1, type: 'learning', days: 2 },
    { resourceId: 11, year: 2025, month: 9, type: 'absences', days: 2 },
    // ---- Irene Colombo (id:12) ----
    { resourceId: 12, year: 2025, month: 8, type: 'ferie', days: 8 },
    { resourceId: 12, year: 2025, month: 7, type: 'par', days: 1 },
    { resourceId: 12, year: 2025, month: 5, type: 'learning', days: 1 },
    { resourceId: 12, year: 2025, month: 11, type: 'absences', days: 1 },
    // ---- Antonio Ruggiero (id:13) ----
    { resourceId: 13, year: 2025, month: 7, type: 'ferie', days: 10 },
    { resourceId: 13, year: 2025, month: 8, type: 'ferie', days: 5 },
    { resourceId: 13, year: 2025, month: 3, type: 'par', days: 1 },
    { resourceId: 13, year: 2025, month: 9, type: 'par', days: 1 },
    { resourceId: 13, year: 2025, month: 2, type: 'learning', days: 3 },
    { resourceId: 13, year: 2025, month: 6, type: 'absences', days: 1 },
    // ---- Sara Martinelli (id:14) ----
    { resourceId: 14, year: 2025, month: 8, type: 'ferie', days: 10 },
    { resourceId: 14, year: 2025, month: 4, type: 'par', days: 1 },
    { resourceId: 14, year: 2025, month: 10, type: 'par', days: 1 },
    { resourceId: 14, year: 2025, month: 3, type: 'learning', days: 2 },
    { resourceId: 14, year: 2025, month: 5, type: 'absences', days: 2 },
    // ---- Emanuele Vitale (id:15) ----
    { resourceId: 15, year: 2025, month: 7, type: 'ferie', days: 6 },
    { resourceId: 15, year: 2025, month: 8, type: 'ferie', days: 8 },
    { resourceId: 15, year: 2025, month: 5, type: 'par', days: 1 },
    { resourceId: 15, year: 2025, month: 11, type: 'par', days: 1 },
    { resourceId: 15, year: 2025, month: 4, type: 'learning', days: 2 },
    { resourceId: 15, year: 2025, month: 9, type: 'absences', days: 1 },
];

// ============================================================
// SEED — Allocazioni deterministiche 2025 e 2026
// ============================================================
function seedData() {
    // Mappa risorse → progetti con peso specifico (realismo)
    const assignments = [
        // [resourceId, projectId, avgPlanDays, variance]
        [1, 101, 14, 2],
        [2, 101, 10, 3],
        [3, 101, 12, 2],
        [4, 101, 8, 2],
        [5, 103, 15, 1],
        [3, 103, 10, 2],
        [11, 103, 12, 2],
        [10, 102, 13, 2],
        [6, 102, 11, 3],
        [12, 102, 8, 2],
        [7, 104, 14, 2],
        [8, 104, 12, 3],
        [7, 106, 6, 2],
        [15, 106, 13, 2],
        [8, 106, 9, 3],
        [5, 105, 4, 1],
        [11, 105, 8, 2],
        [9, 105, 10, 2],
        [13, 107, 14, 1],
        [14, 107, 12, 2],
        [3, 107, 6, 2],
        [2, 108, 11, 2],
        [4, 108, 13, 2],
        [9, 108, 10, 3],
    ];

    // Pseudo-random deterministico (seed fisso)
    function seededRand(seed) {
        let s = seed;
        return function () {
            s = (s * 1664525 + 1013904223) & 0xffffffff;
            return Math.abs(s) / 0x7fffffff;
        };
    }

    const rand = seededRand(42);

    [2025, 2026].forEach(year => {
        assignments.forEach(([resId, projId, avg, variance]) => {
            const resource = DATA.resources.find(r => r.id === resId);
            if (!resource) return;
            const rate = year === 2025 ? resource.adrc25 : resource.adrc26;
            const project = DATA.projects.find(p => p.id === projId);

            // Determine active month range for this project in this year
            const projStart = project?.startDate ? new Date(project.startDate) : new Date(`${year}-01-01`);
            const projEnd = project?.finishDate ? new Date(project.finishDate) : new Date(`${year}-12-31`);
            const firstMonth = projStart.getFullYear() === year ? projStart.getMonth() + 1 : 1;
            const lastMonth = projEnd.getFullYear() === year ? projEnd.getMonth() + 1 : 12;

            for (let month = 1; month <= 12; month++) {
                // Skip months outside the project's active date range (creates natural bench months)
                if (month < firstMonth || month > lastMonth) {
                    rand(); // consume random to keep deterministic sequence
                    continue;
                }

                const planDays = Math.max(0, Math.round(avg + (rand() * variance * 2 - variance)));

                if (planDays > 0) {
                    DATA.upsertBooking({
                        resourceId: resId,
                        projectId: projId,
                        month, year,
                        days: planDays,
                        cost: planDays * rate,
                        type: 'plan'
                    });

                    const shouldHaveActual = year === 2025 || (year === 2026 && month <= 2);
                    if (shouldHaveActual) {
                        const delta = Math.round((rand() - 0.45) * variance);
                        const actualDays = Math.max(0, planDays + delta);
                        DATA.upsertBooking({
                            resourceId: resId,
                            projectId: projId,
                            month, year,
                            days: actualDays,
                            cost: actualDays * rate,
                            type: 'actual'
                        });
                    }
                }
            }
        });
    });

    console.log(`[PSFC] Database seeded: ${DATA.resources.length} risorse, ${DATA.projects.length} progetti, ${DATA.bookings.length} booking.`);
}

seedData();
