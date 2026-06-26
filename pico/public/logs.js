// --- STORICO LOG ---
async function loadLog() {
    const logElement = document.getElementById('log');
    if (!logElement) return;

    try {
        let r = await fetch("/api/log");
        if (!r.ok) { logElement.innerText = 'Errore caricamento storico'; return; }
        let logs = await r.json();
        logElement.innerText = JSON.stringify(logs, null, 2);
        drawTemperatureChart(logs);
    } catch (e) { logElement.innerText = 'Errore di rete'; }
}

async function download(type) {
    try {
        // 1. Recuperiamo i dati grezzi dal server (Pico)
        let response = await fetch("/api/log");
        if (!response.ok) {
            alert("Impossibile recuperare i log per il download.");
            return;
        }
        let logs = await response.json(); // Array di oggetti log

        if (type === "json") {
            // --- DOWNLOAD VERO DEL JSON ---
            const jsonString = JSON.stringify(logs, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "storico_log.json";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // --- MODIFICA SOLO LA PARTE CSV DI logs.js ---
        else if (type === "csv") {
            if (!logs || logs.length === 0) {
                alert("Nessun dato disponibile da convertire in CSV.");
                return;
            }

            const headers = Object.keys(logs[0]);
            const csvRows = [];

            // USARE IL PUNTO E VIRGOLA PER EXCEL IN ITALIANO
            csvRows.push(headers.join(";"));

            for (const row of logs) {
                const values = headers.map(header => {
                    const escaped = ('' + (row[header] ?? '')).replace(/"/g, '\\"');
                    return `"${escaped}"`;
                });
                // USARE IL PUNTO E VIRGOLA PER EXCEL IN ITALIANO
                csvRows.push(values.join(";"));
            }

            const csvString = csvRows.join("\n");
            const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "storico_log.csv";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    } catch (error) {
        console.error("Errore durante la generazione del file:", error);
        alert("Si è verificato un errore durante il download.");
    }
}

// Avvio e gestione dei cicli per i Log
document.addEventListener("DOMContentLoaded", () => {
    loadLog();
    setInterval(loadLog, 60000); // Aggiorna ogni minuto
});