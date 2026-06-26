const THEME_KEY = "user_theme";

// Carica la Timezone dal SERVER e il Tema dal browser
async function loadSettings(){
    /*
    const select = document.getElementById("timezone");
    
    try {
        loadTimezones(); // Popola la select con i fusi orari mondiali
        
        let r = await fetch("/api/settings");
        if(r.ok && select) {
            let s = await r.json();
            if(s.timezone) {
                select.value = s.timezone;
            }
        } else if (select) {
            select.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
    } catch(e) { 
        console.warn('Errore nel caricamento della timezone dal server:', e); 
        if(select) select.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
*/
    loadSavedTheme();
}

// Invia e salva la timezone sul Server (Pico) via POST
async function saveSettings(event){
    /*
    if(event) event.preventDefault(); 
    
    const select = document.getElementById("timezone");
    if (!select) return;

    let settingsPayload = { timezone: select.value };

    try {
        let response = await fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(settingsPayload)
        });*/

        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        localStorage.setItem(THEME_KEY, currentTheme);
/*
        if (response.ok) {
            alert("Impostazioni salvate con successo sul server!");
        } else {
            alert("Errore: Il server non ha potuto salvare la timezone.");
        }
    } catch(e) { 
        console.error("Errore di rete durante il salvataggio dei settings:", e);
        alert('Impossibile connettersi al server per salvare la timezone.'); 
    }*/
}

// --- GESTIONE TEMA (DARK MODE) ---
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    updateThemeButtonText(newTheme);
}

function loadSavedTheme() {
    const saved = localStorage.getItem(THEME_KEY) || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeButtonText(saved);
}

function updateThemeButtonText(theme) {
    const button = document.querySelector('button[onclick="toggleTheme()"]');
    if (button) {
        button.textContent = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }
}

// Popola la select con i fusi orari standard del sistema
function loadTimezones() {
    const select = document.getElementById("timezone");
    if (!select || select.children.length > 0) return; 
    
    const timezones = Intl.supportedValuesOf("timeZone");
    timezones.forEach(tz => {
        const option = document.createElement("option");
        option.value = tz;
        option.textContent = tz;
        select.appendChild(option);
    });
}

// Inizializzazione della parte Settings
document.addEventListener("DOMContentLoaded", () => {
    loadSettings(); 
    
    const settingsForm = document.getElementById('settingsForm');
    if(settingsForm) {
        settingsForm.addEventListener('submit', saveSettings);
    }
});