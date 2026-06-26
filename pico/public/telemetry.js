// --- STATO ATTUALE SENSORI E ORARIO ---
async function loadStatus(){
    try{
        // 1. Recupero Ora del Server
        let resp = await fetch('/api/time');
        if (resp.ok) {
            let serverTime = await resp.json();
            const dayVal = document.getElementById('dayVal');
            const dateVal = document.getElementById('dateVal');
            
            if(dayVal) dayVal.innerText = `${serverTime.hour.toString().padStart(2,'0')}:${serverTime.minute.toString().padStart(2,'0')}`;
            if(dateVal) dateVal.innerText = `${serverTime.day.toString().padStart(2,'0')}/${serverTime.month.toString().padStart(2,'0')}/${serverTime.year}`;
        }

        // 2. Recupero Dati DHT11
        let r = await fetch('/api/sensors/dht11');
        let data = r.ok ? await r.json() : null;

        if (data) {
            let temp = data["temperature"];
            let hum  = data["humidity"];
            let error_temp = data["temp_max_error"] ?? '--';
            let error_hum  = data["hum_max_error"] ?? '--';

            if(document.getElementById('tempVal')) document.getElementById('tempVal').innerText = temp !== undefined ? (temp + ' °C') : '-- °C';
            if(document.getElementById('humVal')) document.getElementById('humVal').innerText = hum !== undefined ? (hum + ' %') : '-- %';
            if(document.getElementById('tempError')) document.getElementById('tempError').innerText = '±' + error_temp + ' °C';
            if(document.getElementById('humError')) document.getElementById('humError').innerText  = '±' + error_hum  + ' %';
        }

        // 3. Recupero Dati Luce
        let r_light = await fetch('/api/sensors/light');
        let data_light = r_light.ok ? await r_light.json() : null;

        if (data_light) {
            let light = data_light["light"] !== undefined ? data_light["light"] : data_light;
            let error_light = data_light["light_max_error"] ?? '--';

            if (document.getElementById('lightVal')) document.getElementById('lightVal').innerText = light !== undefined ? (light + ' lx') : '-- lx';
            if (document.getElementById('lightError')) document.getElementById('lightError').innerText = '±' + error_light + ' lx';
            if (document.getElementById('lightIcon')) updateLightIcon(light);
        }

        // Box di Debug globale
        if (document.getElementById('lastDetail')) {
            document.getElementById('lastDetail').innerText = JSON.stringify({ dht11: data, light: data_light }, null, 2);
        }
    } catch(e) { console.error("Errore nel ciclo loadStatus:", e); }
}

// Cambia l'immagine Sole/Luna in base al sensore di luce
function updateLightIcon(digitalSensorValue) {
    const lightIcon = document.getElementById('lightIcon');
    if (!lightIcon) return;
    if (digitalSensorValue === 1) {
        lightIcon.src = 'https://github.com/predestinatonew/meteopico/server/icons/sun.svg';
        lightIcon.alt = 'Sole - È giorno';
    } else {
        lightIcon.src = 'https://github.com/predestinatonew/meteopico/server/icons/moon.svg';
        lightIcon.alt = 'Luna - È notte';
    }
}

// Avvio e gestione dei cicli per i Sensori
document.addEventListener("DOMContentLoaded", () => {
    loadStatus();   
    setInterval(loadStatus, 30000); // Aggiorna lo stato attuale ogni 30 secondi
});