# Aurora Borealis Predictor - Setup Guide

## Übersicht

Diese App zeigt die Wahrscheinlichkeit von Nordlichtern (Aurora Borealis) für verschiedene Orte weltweit an, basierend auf:
- **Geomagnetischen Daten** (NOAA Space Weather - kostenlos)
- **Wetterdaten** (OpenWeatherMap - kostenlos mit Registrierung)
- **Ortsdatenbank** (GeoNames - kostenlos mit Registrierung)

## Schnellstart

### 1. Repository klonen und Abhängigkeiten installieren

```bash
git clone <repository-url>
cd aurora-predictor
npm run install-all  # Installiert alle Abhängigkeiten für Root, Server und Client
```

### 2. API Keys einrichten

#### OpenWeatherMap API Key (ERFORDERLICH für Wetterdaten)
1. Gehen Sie zu https://openweathermap.org/api
2. Registrieren Sie sich kostenlos
3. Erhalten Sie Ihren API Key
4. Bearbeiten Sie `server/.env` und ersetzen Sie:
   ```
   OPENWEATHER_API_KEY=your_actual_api_key_here
   ```

#### GeoNames Username (ERFORDERLICH für Ortssuche)
1. Gehen Sie zu http://www.geonames.org/login
2. Erstellen Sie einen kostenlosen Account
3. **WICHTIG**: Aktivieren Sie "Web Services" in Ihrem Account-Manager
4. Bearbeiten Sie `server/.env` und ersetzen Sie:
   ```
   GEONAMES_USERNAME=your_actual_username_here
   ```

### 3. App starten

```bash
npm run dev
```

Dies startet:
- Backend-Server auf http://localhost:5000
- Frontend-App auf http://localhost:3000

## Verwendete APIs (alle kostenlos)

### NOAA Space Weather Prediction Center
- **URL**: https://www.swpc.noaa.gov/
- **Kosten**: Völlig kostenlos, keine Registrierung erforderlich
- **Verwendung**: Geomagnetische Daten (Kp-Index, Sonnenwind)
- **Limits**: Keine bekannten Limits

### OpenWeatherMap
- **URL**: https://openweathermap.org/api
- **Kosten**: Kostenloser Plan mit 1000 Aufrufen/Tag
- **Verwendung**: Aktuelle Wetterdaten und Wolkenbedeckung
- **Limits**: 60 Aufrufe/Minute, 1000 Aufrufe/Tag (kostenlos)

### GeoNames
- **URL**: http://www.geonames.org/
- **Kosten**: Kostenloser Plan mit 1000 Aufrufen/Tag
- **Verwendung**: Ortssuche und Koordinaten
- **Limits**: 1000 Aufrufe/Tag (kostenlos)
- **WICHTIG**: Web Services müssen im Account aktiviert werden!

## Fehlerbehebung

### "GeoNames API not configured" Fehler
- Stellen Sie sicher, dass Sie einen GeoNames Account erstellt haben
- **Aktivieren Sie Web Services** in Ihrem GeoNames Account
- Setzen Sie `GEONAMES_USERNAME` in `server/.env`

### "OpenWeather API key not configured" Fehler
- Registrieren Sie sich bei OpenWeatherMap
- Erhalten Sie Ihren kostenlosen API Key
- Setzen Sie `OPENWEATHER_API_KEY` in `server/.env`

### Server startet nicht
- Prüfen Sie, ob Port 5000 frei ist: `lsof -i :5000`
- Prüfen Sie die .env-Datei im server/ Ordner
- Starten Sie den Server einzeln: `cd server && npm run dev`

### Frontend lädt nicht
- Prüfen Sie, ob Port 3000 frei ist
- Starten Sie das Frontend einzeln: `cd client && npm start`

## Entwicklung

### Nur Backend starten
```bash
cd server
npm run dev
```

### Nur Frontend starten
```bash
cd client
npm start
```

### API-Endpunkte testen
```bash
# Health Check
curl http://localhost:5000/api/health

# Orte suchen (benötigt GeoNames)
curl "http://localhost:5000/api/locations/search?q=reykjavik"

# Weltraumwetter
curl http://localhost:5000/api/space-weather
```

## Produktionsdeployment

### Backend (z.B. auf Railway, Heroku, etc.)
- Setzen Sie die Umgebungsvariablen:
  - `OPENWEATHER_API_KEY`
  - `GEONAMES_USERNAME`
  - `PORT` (wird meist automatisch gesetzt)

### Frontend (z.B. auf Vercel, Netlify, etc.)
- Bauen Sie das Frontend: `cd client && npm run build`
- Setzen Sie `REACT_APP_API_URL` auf Ihre Backend-URL

## Kosten und Limits

**Komplett kostenlos** für normale Nutzung:
- NOAA: Unbegrenzt kostenlos
- OpenWeatherMap: 1000 Aufrufe/Tag kostenlos
- GeoNames: 1000 Aufrufe/Tag kostenlos

Bei mehr als 1000 Nutzern pro Tag könnten kostenpflichtige Pläne erforderlich werden.