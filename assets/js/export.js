// Export Logic
// Validated for "Samsung/Samantha" compatibility (generic flat CSV)

class ExportModule {
    constructor(data) {
        this.data = data;
    }

    downloadCSV(filename, csvContent) {
        const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Export Staffing Plan (Grid View)
    exportStaffingView(year) {
        const headers = ["Resource ID", "Resource Name", "Role", "Seniority", "Year", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Total Days"];

        let csv = headers.join(",") + "\n";

        this.data.resources.forEach(res => {
            let row = [
                res.id,
                `"${res.name}"`, // Quote names to handle commas
                res.role,
                res.seniority || "",
                year
            ];

            let total = 0;
            for (let m = 1; m <= 12; m++) {
                const allocation = this.data.bookings
                    .filter(b => b.resourceId === res.id && b.month === m && b.year === year && b.type === 'plan')
                    .reduce((sum, item) => sum + item.days, 0);
                row.push(allocation.toFixed(2)); // Ensure number format
                total += allocation;
            }
            row.push(total.toFixed(2));

            csv += row.join(",") + "\n";
        });

        this.downloadCSV(`Staffing_Plan_${year}.csv`, csv);
    }

    // Export "Samsung/Samantha" Format
    // Hypothesis: Flat file, one row per monthly allocation per project
    // Columns: Year, Month, Project Code, Project Name, Resource Name, Days, Cost, Type (Plan/Actual)
    exportSamanthaFormat(year) {
        const headers = ["Year", "Month", "Project Code", "Project Name", "Resource Name", "Seniority", "Start Date", "End Date", "Days", "Cost", "Type"];
        let csv = headers.join(",") + "\n";

        // Filter bookings for the year
        const relevantBookings = this.data.bookings.filter(b => b.year === year);

        relevantBookings.forEach(b => {
            const res = this.data.resources.find(r => r.id === b.resourceId) || { name: "Unknown", seniority: "" };
            const proj = this.data.projects.find(p => p.id === b.projectId) || { code: "UNK", name: "Unknown" };

            // Construct fictional start/end dates for the month
            const lastDay = new Date(year, b.month, 0).getDate();
            const startDate = `${year}-${String(b.month).padStart(2, '0')}-01`;
            const endDate = `${year}-${String(b.month).padStart(2, '0')}-${lastDay}`;

            const row = [
                b.year,
                b.month,
                proj.code,
                `"${proj.name}"`,
                `"${res.name}"`,
                res.seniority || "",
                startDate,
                endDate,
                b.days.toFixed(2),
                b.cost.toFixed(2),
                b.type.toUpperCase()
            ];

            csv += row.join(",") + "\n";
        });

        this.downloadCSV(`Samantha_Export_${year}.csv`, csv);
    }
}

// Export global
window.ExportModule = ExportModule;
