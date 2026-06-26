import json, os

def send(client, content, ctype="text/html"):
    header = "HTTP/1.1 200 OK\r\nContent-Type: {}\r\n\r\n".format(ctype)
    client.send(header.encode())   # header come bytes
    client.send(content.encode())  # contenuto come bytes

def send_json(client, data):
    send(client, json.dumps(data), "application/json")

def file_exists(path):
    try:
        st = os.stat(path)
        return (st[0] & 0x4000) == 0
    except OSError:
        return False

def serve_file(client, path):
    ext = path.split(".")[-1]
    mime = "text/plain"
    if ext == "html": mime = "text/html"
    elif ext == "css": mime = "text/css"
    elif ext == "js": mime = "application/javascript"
    elif ext == "json": mime = "application/json"
    elif ext in ["png","jpg","jpeg","gif"]: mime = "image/" + ext

    try:
        mode = "rb" if ext in ["png","jpg","jpeg","gif"] else "r"
        with open(path, mode) as f:
            client.send(
                f"HTTP/1.0 200 OK\r\nContent-Type: {mime}\r\nConnection: close\r\n\r\n".encode()
            )
            if mode == "r":
                client.send(f.read().encode())
            else:
                # invio chunk da 1024 byte per immagini
                while True:
                    chunk = f.read(1024)
                    if not chunk:
                        break
                    client.send(chunk)
    except Exception as e:
        print("Errore serve_file:", e)
        client.send(b"HTTP/1.0 404 NOT FOUND\r\nConnection: close\r\n\r\nFile not found")
