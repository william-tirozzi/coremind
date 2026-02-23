// ============================================================
// COREMIND — Excel Importer (SheetJS + SmartMapper)
// Supporta import nativo .xlsx con mapping automatico dei fogli
// ============================================================

class ExcelImporter {
    constructor() {
        this.workbook = null;
        this.parsedRisorse = [];
        this.parsedProjects = [];
        this.parsedMaster = {};
    }

    // Carica file .xlsx tramite FileReader + SheetJS
    readFile(file) {
        return new Promise((resolve, reject) => {
            if (!file) return reject("Nessun file selezionato.");
            if (!file.name.match(/\.(xlsx|xls)$/i)) return reject("Formato non supportato. Usa .xlsx o .xls");

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    this.workbook = XLSX.read(data, { type: 'array', cellDates: true });
                    resolve(this.workbook.SheetNames);
                } catch (err) {
                    reject("Errore durante la lettura del file: " + err.message);
                }
            };
            reader.onerror = () => reject("Errore FileReader.");
            reader.readAsArrayBuffer(file);
        });
    }

    // Restituisce il JSON di un sheet per nome
    getSheetJSON(sheetName, opts = { defval: "", raw: false }) {
        const ws = this.workbook.Sheets[sheetName];
        if (!ws) return null;
        return XLSX.utils.sheet_to_json(ws, opts);
    }

    // Restituisce le prime N righe per preview
    getSheetPreview(sheetName, maxRows = 10) {
        const ws = this.workbook.Sheets[sheetName];
        if (!ws) return { headers: [], rows: [] };
        const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
        if (!aoa.length) return { headers: [], rows: [] };
        return {
            headers: aoa[0].map(h => String(h).trim()),
            rows: aoa.slice(1, maxRows + 1).map(r => r.map(c => String(c ?? "").trim()))
        };
    }

    // -------- Parsers per ogni foglio --------

    parseSheet_RISORSE(sheetName = "RISORSE") {
        const rows = this.getSheetJSON(sheetName, { defval: "", raw: true });
        if (!rows) return [];

        this.parsedRisorse = rows
            .filter(r => r["EMPLOYEE"] && String(r["EMPLOYEE"]).trim().length > 2)
            .map((r, i) => ({
                id: i + 1000,
                name: String(r["EMPLOYEE"] || "").trim(),
                rateLevel: String(r["RATE LEVEL"] || "").trim(),
                skillsArea: String(r["SKILLS AREA"] || "").trim(),
                adrc25: this._toNum(r["ADRC 25"] || r["ADRC 2025 - €"]),
                adrc26: this._toNum(r["ADRC 26"] || r["ADRC 2026 - €"]),
                _source: "import"
            }));

        return this.parsedRisorse;
    }

    parseSheet_DB(sheetName = "DB", maxRows = 5000) {
        const ws = this.workbook.Sheets[sheetName];
        if (!ws) return [];
        // Il DB ha 59k righe, limitiamo per performance browser
        const rows = XLSX.utils.sheet_to_json(ws, { defval: "", raw: false });

        this.parsedProjects = rows
            .slice(0, maxRows)
            .filter(r => r["Project Definition"] || r["WBS Element"])
            .map((r, i) => ({
                id: i + 2000,
                projectDefinition: String(r["Project Definition"] || "").trim(),
                wbsElement: String(r["WBS Element"] || "").trim(),
                name: String(r["WBS Element Name"] || "").trim(),
                type: String(r["Project Type Description"] || "").trim(),
                startDate: String(r["Start Date"] || "").trim(),
                finishDate: String(r["Finish Date"] || "").trim(),
                client: String(r["Sold-to-Party Name"] || "").trim(),
                billToParty: String(r["Bill-to-Party Name"] || "").trim(),
                projectManager: String(r["Project Manager Name"] || "").trim(),
                marketSegment: String(r["Market Segment"] || "").trim(),
                billability: String(r["Billability"] || "").trim(),
                _source: "import"
            }));

        return this.parsedProjects;
    }

    parseSheet_MASTER(sheetName, year) {
        const rows = this.getSheetJSON(sheetName, { header: 1, defval: "" });
        if (!rows) return {};

        // Il MASTER è in formato chiave-valore (colonna 0 = chiave, colonna 1 = valore)
        const masterObj = { year, _source: "import" };
        rows.forEach(row => {
            if (row[0] && row[1]) {
                const key = String(row[0]).trim();
                masterObj[key] = String(row[1]).trim();
            }
        });
        this.parsedMaster[year] = masterObj;
        return masterObj;
    }

    // -------- Fuzzy Matching Risorse --------

    fuzzyMatchResource(rawName, existingResources) {
        const name = rawName.toLowerCase().trim();
        // 1. Match esatto
        let match = existingResources.find(r => r.name.toLowerCase() === name);
        if (match) return { status: 'exact', resource: match };

        // 2. Match per parti del nome (cognome)
        const parts = name.split(/[\s,]+/).filter(p => p.length > 2);
        match = existingResources.find(r => {
            const rParts = r.name.toLowerCase().split(/[\s,]+/);
            return parts.some(p => rParts.includes(p));
        });
        if (match) return { status: 'fuzzy', resource: match };

        return { status: 'none', resource: null };
    }

    // -------- Confirm Import → DATA store --------

    commitToDATA(options = { risorse: true, projects: false, year: 2025 }) {
        let added = { risorse: 0, projects: 0 };

        if (options.risorse && this.parsedRisorse.length) {
            this.parsedRisorse.forEach(r => {
                // Non duplicare per nome
                const exists = DATA.resources.find(existing =>
                    existing.name.toLowerCase() === r.name.toLowerCase()
                );
                if (!exists) {
                    DATA.resources.push({ ...r, id: DATA.resources.length + 1 });
                    added.risorse++;
                }
            });
        }

        if (options.projects && this.parsedProjects.length) {
            this.parsedProjects.forEach(p => {
                const exists = DATA.projects.find(existing =>
                    existing.code === p.wbsElement || existing.name === p.name
                );
                if (!exists) {
                    DATA.projects.push({
                        ...p,
                        id: DATA.projects.length + 100,
                        code: p.wbsElement,
                        budget: 0
                    });
                    added.projects++;
                }
            });
        }

        return added;
    }

    // -------- Util --------
    _toNum(val) {
        if (typeof val === 'number') return val;
        const n = parseFloat(String(val).replace(/[€\s.]/g, '').replace(',', '.'));
        return isNaN(n) ? 0 : n;
    }
}

// -------- SmartImporter (legacy TSV, per compatibilità) --------
class SmartImporter {
    constructor(resources, projects) {
        this.resources = resources;
        this.projects = projects;
        this.parsedData = [];
    }

    parseTSV(text) {
        const rows = text.trim().split('\n').map(row => row.split('\t'));
        if (rows.length < 2) return { success: false, message: "Nessun dato trovato." };

        const headers = rows[0].map(h => h.trim().toLowerCase());
        const colResource = headers.findIndex(h => h.includes('resource') || h.includes('nome') || h.includes('name') || h.includes('employee'));
        const colProject = headers.findIndex(h => h.includes('project') || h.includes('commessa') || h.includes('wbs'));

        if (colResource === -1 || colProject === -1) {
            return { success: false, message: "Impossibile identificare colonne 'Resource' o 'Project'." };
        }

        // Identifica colonne mensili
        const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
            'gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
        const monthCols = [];
        headers.forEach((h, i) => {
            const monthIdx = MONTH_KEYS.findIndex(mk => h.startsWith(mk));
            if (monthIdx !== -1) monthCols.push({ col: i, month: (monthIdx % 12) + 1 });
        });

        this.parsedData = rows.slice(1).map((cols, index) => {
            const rawName = cols[colResource]?.trim() || "Unknown";
            const projectCode = cols[colProject]?.trim() || "";
            const match = this.findBestMatch(rawName);

            const monthlyAllocations = {};
            monthCols.forEach(({ col, month }) => {
                const val = parseFloat(cols[col]);
                if (!isNaN(val) && val > 0) monthlyAllocations[month] = val;
            });
            const totalDays = Object.values(monthlyAllocations).reduce((s, v) => s + v, 0);

            return { id: index, rawName, project: projectCode, totalDays, monthlyAllocations, matchStatus: match.status, matchedResource: match.resource };
        });

        return { success: true, count: this.parsedData.length, data: this.parsedData };
    }

    findBestMatch(rawName) {
        let match = this.resources.find(r => r.name.toLowerCase() === rawName.toLowerCase());
        if (match) return { status: 'exact', resource: match };

        match = this.resources.find(r => {
            const parts = r.name.toLowerCase().split(' ');
            return parts.some(p => rawName.toLowerCase().includes(p) && p.length > 3);
        });
        if (match) return { status: 'fuzzy', resource: match };

        return { status: 'none', resource: null };
    }
}

window.ExcelImporter = ExcelImporter;
window.SmartImporter = SmartImporter;
