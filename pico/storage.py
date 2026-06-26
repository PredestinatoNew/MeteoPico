import json
import time

def load_json(file, default):
    try:
        with open("data/"+file) as f:
            return json.load(f)
    except:
        return default

def save_json(file, data):
    with open("data/"+file, "w") as f:
        json.dump(data, f)

# ---------- LOG ----------
def save_measurement(dht_data, light_value):
    now = time.localtime()
    record = {
        "date": f"{now[0]}-{now[1]:02d}-{now[2]:02d}",
        "time": f"{now[3]:02d}:{now[4]:02d}",
        "temperature": dht_data["temperature"] if dht_data else None,
        "humidity": dht_data["humidity"] if dht_data else None,
        "light": light_value["light"] if light_value else None
    }

    logs = load_json("log.json", [])
    logs.append(record)

    now_days = now[2] + now[1]*31 + now[0]*372
    logs = [
        r for r in logs
        if now_days - (int(r["date"].split("-")[2]) +
                        int(r["date"].split("-")[1])*31 +
                        int(r["date"].split("-")[0])*372) <= 7
    ]

    save_json("log.json", logs)

# ---------- SETTINGS ----------
def load_sensors():
    return load_json("sensors.json", {"dht11":None})

def save_sensors(s):
    save_json("sensors.json", s)

# ---------- SETTINGS ----------
def load_settings():
    return load_json("settings.json", {"morning":"08:00","evening":"20:00"})

def save_settings(s):
    save_json("settings.json", s)

# ---------- WIFI ----------
def load_wifi():
    return load_json("wifi.json", {"ssid":"","password":""})

def save_wifi(cfg):
    save_json("wifi.json", cfg)
