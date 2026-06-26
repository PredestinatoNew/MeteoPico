import network
import time
import storage

def start_ap():
    print("Start Access Point Server")
    # Turn Of Wifi
    wlan = network.WLAN(network.STA_IF)
    wlan.active(False)

    ap = network.WLAN(network.AP_IF)
    ap.active(True)
    ap.config(ssid="PicoConfig", password="12345678")
    return ap

def connect():
    cfg = storage.load_wifi()

    # Gestione sicura se il file di configurazione è vuoto o corrotto
    if not cfg or "ssid" not in cfg or not cfg["ssid"]:
        print("Credenziali non trovate o vuote. Avvio AP...")
        return start_ap()

    # Inizializzazione pulita della modalità Station
    wlan = network.WLAN(network.STA_IF)
    wlan.active(False) # Reset preventivo

    time.sleep(0.2)

    wlan.active(True) 

    print(f"Tentativo di connessione a: {cfg['ssid']}...")
    wlan.connect(cfg["ssid"], cfg["password"])
    network.hostname("meteopico")

    # Loop di timeout aumentato leggermente (15 secondi totali)
    # Molti router moderni impiegano dai 5 ai 10 secondi per rilasciare l'IP tramite DHCP
    for i in range(30):
        if wlan.isconnected():
            ip = wlan.ifconfig()[0]
            print("\nConnesso con successo!")
            print("Connect to: ", cfg["ssid"])
            print("IP assegnato:", ip)
            print("Server in ascolto su http://" + ip + ":8080")
            return wlan
        print(".", end="")
        time.sleep(0.5)

    # Se dopo 15 secondi non si è connesso, spegniamo tutto e passiamo ad AP
    print("\nTimeout connessione Wi-Fi superato.")
    return start_ap()

def close():
    """Chiude la connessione Wi-Fi o AP se attiva"""
    wlan = network.WLAN(network.STA_IF)
    if wlan.active():
        wlan.active(False)
    ap = network.WLAN(network.AP_IF)
    if ap.active():
        ap.active(False)
    print("Wi-Fi e AP chiusi")