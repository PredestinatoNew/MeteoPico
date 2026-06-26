import socket
import time
import machine
import json
import sensors
from storage import *
from http_utils import *

def start():
    port = 8080
    s = socket.socket()
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)  # permette riuso porta
    s.bind(("0.0.0.0", port))
    s.listen(5)
    print("Server avviato su porta ", port, "...")

    while True:

        client, _ = s.accept()

        try:
            req = client.recv(2048).decode()  # buffer più grande per POST

            # Sensor APIs
            if req.startswith("GET /api/sensors/dht11"):
                print("[API] Request Sensor DTH11 Data")
                if sensors._dht11 is not None:
                    send_json(client, sensors._dht11.read())
                else:
                    print("[API] Request Sensor DTH11 Data Failed! DHT11 is Null")
            elif req.startswith("GET /api/sensors/light"):
                print("[API] Request Sensor Light Data")
                if sensors._lightSensor is not None:
                    send_json(client, sensors._lightSensor.read())
                else:
                    print("[API] Request Sensor Light Data Failed! LightSensor is Null")


            # Embedded APIs
            #elif req.startswith("GET /api/settings"): # tutti completo
             #   print("[API] Request Settings Data")
             #   send_json(client, load_settings())

            elif req.startswith("GET /api/time"):
                print("[API] Request Time Data")
                # ottieni ora locale Italia (+1h CET)
                #t = time.localtime(time.time() + 3600)
                t = time.localtime(time.time())

                server_time = {
                    "year":   t[0],
                    "month":  t[1],
                    "day":    t[2],
                    "hour":   t[3],
                    "minute": t[4],
                    "second": t[5]
                }
                send_json(client, server_time)

            elif req.startswith("GET /api/log"):
                print("[API] Request Log Data")
                send_json(client, load_json("log.json", []))

            elif req.startswith("POST /wifi"):
                try:
                    header, body = req.split("\r\n\r\n", 1)
                except ValueError:
                    header = req
                    body = ""
                length = int(header.split("Content-Length: ")[1].split("\r\n")[0])
                while len(body) < length:
                    body += client.recv(1024).decode()
                save_wifi(json.loads(body))
                send_json(client, {"status":"saved"})
                time.sleep(2)
                machine.reset()

            elif req.startswith("GET /"):
                path_req = req.split(" ")[1].split("?")[0]  # rimuove query string
                if path_req == "/":
                    path_req = "/index.html"

                print(f'[WEB] Request "{path_req}"')

                path = "./public" + path_req
                if file_exists(path):
                    serve_file(client, path)
                else:
                    client.send(b"HTTP/1.0 404 NOT FOUND\r\n\r\nFile not found")

            else:
                client.send(b"HTTP/1.0 404 NOT FOUND\r\n\r\nRoute not found")

        except Exception as e:
            print("Errore nella richiesta:", e)
        finally:
            client.close()
