import time
import _thread
import sensors
import storage

# Il lucchetto per evitare che Core 0 e Core 1 scrivano/leggano i file JSON insieme
db_lock = _thread.allocate_lock()

def check_loop():
    _last_log_hour = time.localtime()[3]
    print("[Core 1] Thread di logging avviato con successo.")
    
    while True:
        now = time.localtime()
        current_hour = now[3]

        # Se è scattata la nuova ora
        if current_hour != _last_log_hour:
            
            # Leggiamo i dati dai moduli dei sensori
            dht_data = sensors._dht11.read() if sensors._dht11 is not None else None
            light_data = sensors._lightSensor.read() if sensors._lightSensor is not None else None
            
            # Proteggiamo la scrittura su file usando il lock
            db_lock.acquire()
            try:
                storage.save_measurement(dht_data, light_data)
                print(f"[Core 1] Log orario salvato alle {current_hour}:00")
            except Exception as e:
                print("[Core 1] Errore nel salvataggio del log:", e)
            finally:
                db_lock.release() # Rilascia sempre il lucchetto
                
            _last_log_hour = current_hour
            
        # Controlla l'ora ogni 30 secondi (non serve farlo più velocemente)
        time.sleep(30)