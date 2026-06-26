from wifi import connect, close
from server import start
import sensors, network
import _thread, time
from scheduler import check_loop

print("Avvio server...")
connection = connect()
sensors.Initialize()
try:
    import ntptime
    try:
        ntptime.settime()  # imposta il tempo dal server NTP
        print("Orario Internazionale sincronizzato")
        t = time.localtime()
        print(f"Ora attuale: {t[3]:02d}:{t[4]:02d}:{t[5]:02d}")
    except Exception as e:
        print("Errore sincronizzazione NTP:", e)
    wlan = network.WLAN(network.STA_IF)
    if wlan.active():
        _thread.start_new_thread(check_loop, ())
    start()
except KeyboardInterrupt:
    close(connection)
