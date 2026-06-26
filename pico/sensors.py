import dht
from machine import Pin

class DHT11SensorPico:
    def __init__(self, pin):
        self.temp_max_error = 2
        self.hum_max_error = 3
        self._dht = dht.DHT11(Pin(pin))

    def read(self):
        try:
            self._dht.measure()
            return {
                "temperature": self._dht.temperature(),
                "humidity": self._dht.humidity(),
                "temp_max_error": self.temp_max_error,
                "hum_max_error": self.hum_max_error
            }
        except Exception as e:
            return {
                "temperature": None,
                "humidity": None,
                "temp_max_error": None,
                "hum_max_error": None,
                "error": str(e)
            }
        
class LightSensorPico:
    def __init__(self, pin):
        self.light_max_error = 2
        self._light = Pin(pin, Pin.IN)

    def read(self):
        try:
            lightValue = self._light.value()
            if lightValue == 0:
                lightValue = 1
            elif lightValue == 1:
                lightValue = 0
            return {
                "light": lightValue,
                "light_max_error": self.light_max_error
            }
        except Exception as e:
            return {
                "light": None,
                "light_max_error": None,
                "error": str(e)
            }
        
_lightSensor = None
_dht11 = None

def Initialize():
    global _dht11, _lightSensor
    print("Initialize component")

    import storage

    pin_loaded = storage.load_sensors()

    dht_pin = pin_loaded.get("dht11")
    if dht_pin is not None:
        print("Initialize DHT11 on PIN " + str(dht_pin))
        _dht11 = DHT11SensorPico(dht_pin)

    light_pin = pin_loaded.get("light")
    if light_pin is not None:
        print("Initialize Light Sensor on PIN " + str(light_pin))
        _lightSensor = LightSensorPico(light_pin)