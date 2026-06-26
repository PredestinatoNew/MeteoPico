function drawTemperatureChart(logs) {
    const canvas = document.getElementById('tempChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Fix risoluzione Retina/High-DPI
    const rect = canvas.getBoundingClientRect();
    const widthCSS = rect.width || 400;   
    const heightCSS = rect.height || 200; 
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = widthCSS * dpr;
    canvas.height = heightCSS * dpr;
    canvas.style.width = widthCSS + 'px';
    canvas.style.height = heightCSS + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, widthCSS, heightCSS);

    if (!logs || logs.length < 2) {
        ctx.font = "14px Arial";
        ctx.fillStyle = "#888888";
        ctx.textAlign = "center";
        ctx.fillText("Dati insufficienti per generare il grafico", widthCSS / 2, heightCSS / 2);
        return;
    }

    const maxPunts = 15;
    const dataToDraw = logs.slice(-maxPunts);

    // Configurazione scale assi
    const temps = dataToDraw.map(d => parseFloat(d.temperature ?? 0));
    const maxTemp = Math.max(...temps) + 2;
    const minTemp = Math.min(...temps) - 2;
    const tempRange = maxTemp - minTemp;

    const maxHum = 100;
    const minHum = 0;
    const humRange = 100;

    // Configurazione layout e margini
    const paddingLeft = 40;
    const paddingRight = 40;
    const paddingTop = 35;
    const paddingBottom = 35;
    
    const chartWidth = widthCSS - paddingLeft - paddingRight;
    const chartHeight = heightCSS - paddingTop - paddingBottom;

    // Sfondi Giorno / Notte
    const colWidth = chartWidth / (dataToDraw.length - 1);
    dataToDraw.forEach((log, index) => {
        if (index === dataToDraw.length - 1) return;
        const xStart = paddingLeft + (colWidth * index);
        ctx.fillStyle = parseInt(log.light) === 1 ? "#ffffff" : "#e9ecef";
        ctx.fillRect(xStart, paddingTop, colWidth, chartHeight);
    });

    // Griglia e testi assi Y
    ctx.lineWidth = 1;
    ctx.textBaseline = "middle";
    for (let i = 0; i <= 4; i++) {
        const y = paddingTop + (chartHeight / 4) * i;
        
        ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";
        ctx.beginPath();
        ctx.moveTo(paddingLeft, y);
        ctx.lineTo(widthCSS - paddingRight, y); 
        ctx.stroke();
        
        // Asse Temperatura (Sinistro)
        ctx.fillStyle = "#ff4757";
        ctx.font = "10px Arial";
        ctx.textAlign = "right";
        const valTemp = maxTemp - (tempRange / 4) * i;
        ctx.fillText(Math.round(valTemp) + "°C", paddingLeft - 8, y);

        // Asse Umidità (Destro)
        ctx.fillStyle = "#2e86de";
        ctx.font = "10px Arial";
        ctx.textAlign = "left";
        const valHum = maxHum - (humRange / 4) * i;
        ctx.fillText(Math.round(valHum) + "%", widthCSS - paddingRight + 8, y); 
    }

    // Calcolo coordinate punti
    const punti = dataToDraw.map((log, index) => {
        const x = paddingLeft + (chartWidth / (dataToDraw.length - 1)) * index;
        const yTemp = heightCSS - paddingBottom - ((parseFloat(log.temperature ?? 0) - minTemp) / tempRange) * chartHeight; 
        const yHum = heightCSS - paddingBottom - ((parseFloat(log.humidity ?? 0) - minHum) / humRange) * chartHeight;      
        return { x, yTemp, yHum, time: log.time };
    });

    // Linea Temperatura
    ctx.beginPath();
    ctx.strokeStyle = "#ff4757";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    punti.forEach((punto, index) => {
        if (index === 0) ctx.moveTo(punto.x, punto.yTemp);
        else ctx.lineTo(punto.x, punto.yTemp);
    });
    ctx.stroke();

    // Linea Umidità
    ctx.beginPath();
    ctx.strokeStyle = "#2e86de";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    punti.forEach((punto, index) => {
        if (index === 0) ctx.moveTo(punto.x, punto.yHum);
        else ctx.lineTo(punto.x, punto.yHum);
    });
    ctx.stroke();

    // Disegno nodi e orari asse X
    punti.forEach((punto, index) => {
        // Nodi Temperatura
        ctx.beginPath();
        ctx.fillStyle = "#ff4757";
        ctx.arc(punto.x, punto.yTemp, 3.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = "#ffffff";
        ctx.arc(punto.x, punto.yTemp, 1, 0, 2 * Math.PI);
        ctx.fill();

        // Nodi Umidità
        ctx.beginPath();
        ctx.fillStyle = "#2e86de";
        ctx.arc(punto.x, punto.yHum, 3.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = "#ffffff";
        ctx.arc(punto.x, punto.yHum, 1, 0, 2 * Math.PI);
        ctx.fill();

        // Orari asse X
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        if (dataToDraw.length < 8 || index % 2 === 0) {
            ctx.fillStyle = "#6c757d";
            ctx.font = "9px Arial";
            ctx.fillText(punto.time, punto.x, heightCSS - paddingBottom + 10); 
        }
    });
}