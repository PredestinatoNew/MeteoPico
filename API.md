# MeteoPico API v1.0.0

Le API di MeteoPico consentono l'interazione e la lettura dei dati dei sensori e del sistema del Raspberry Pi Pico tramite richieste HTTP locali sulla porta `8080`.

Tutte le risposte sui dati di sistema e sensori utilizzano il formato standard **JSON**.

---

## 1. Endpoint di Sistema ed Embedded

### GET /api/time

Restituisce la data e l'ora UTC configurata sul dispositivo Pico.

#### Output JSON (Esempio)

```json
{
  "year": 2026,
  "month": 6,
  "day": 26,
  "hour": 11,
  "minute": 54,
  "second": 30
}

```

---

### GET /api/log

Restituisce lo storico delle misurazioni registrate nell'ultima settimana (fino a un massimo di 7 giorni), caricate dal file `log.json`.

#### Output JSON (Esempio)

```json
[
  {
    "date": "2026-06-26",
    "time": "11:30",
    "temperature": 23,
    "humidity": 45,
    "light": 1
  },
  {
    "date": "2026-06-26",
    "time": "11:45",
    "temperature": null,
    "humidity": null,
    "light": 0
  }
]

```

*Nota: Se un sensore non risponde durante il campionamento programmato, il rispettivo valore viene salvato come `null`.*

---

## 2. Endpoint dei Sensori

### GET /api/sensors/dht11

Restituisce in tempo reale i dati relativi alla temperatura e all'umidità relativa letti dal sensore **DHT11**.

#### Output JSON (Lettura corretta)

```json
{
  "temperature": 23,            // Temperatura rilevata in gradi Celsius (°C)
  "humidity": 45,               // Umidità relativa in percentuale (%)
  "temp_max_error": 2,          // Margine massimo di errore della temperatura (± °C)
  "hum_max_error": 3            // Margine massimo di errore dell'umidità (± %)
}

```

#### Output JSON (Errore lettura / Componente assente)

Viene restituito se il sensore non è inizializzato correttamente (uguale a `Null`) o se fallisce la lettura hardware tramite la funzione `.measure()`.

```json
{
  "temperature": null,
  "humidity": null,
  "temp_max_error": null,
  "hum_max_error": null,
  "error": "Descrizione Errore"
}

```

---

### GET /api/sensors/light

Restituisce il valore logico del sensore di luminosità (Fotoresistenza / Sensore digitale crepuscolare). Il codice sorgente applica un'inversione logica per mappare lo stato in modo intuitivo.

#### Output JSON (Lettura corretta)

```json
{
  "light": 1,                   // Stato della luce: 0 = Buio, 1 = Luce rilevata
  "light_max_error": 2          // Margine massimo di errore interno del sensore
}

```

#### Output JSON (Errore lettura / Componente assente)

Viene restituito se il pin del sensore non è inizializzato (uguale a `Null`) o restituisce un'eccezione hardware.

```json
{
  "light": null,
  "light_max_error": null,
  "error": "Descrizione Errore"
}

```
