# Aurora Borealis Predictor 🌌

Eine moderne Web-App zur Vorhersage der Wahrscheinlichkeit von Nordlichtern (Aurora Borealis) für verschiedene Orte weltweit.

## Features

- 🌍 **Ortsauswahl**: Wählen Sie aus einer umfangreichen Datenbank von Orten
- 📊 **Mehrfache Vorhersagezeiträume**: 3, 5, 21 und 31 Tage
- 🌡️ **Wetterdaten**: Integration von aktuellen Wetterbedingungen
- 🧲 **Geomagnetische Daten**: Echtzeitdaten von NOAA Space Weather
- 📱 **Responsive Design**: Funktioniert auf Desktop und Mobile
- 🎨 **Moderne UI**: Schöne, intuitive Benutzeroberfläche

## Verwendete APIs (alle kostenlos)

- **NOAA Space Weather API**: Geomagnetische und Sonnenaktivitätsdaten
- **OpenWeatherMap API**: Wetterdaten und Wolkenbedeckung
- **GeoNames API**: Ortsdatenbank und Koordinaten
- **SWPC Aurora Forecast**: Aurora-Vorhersagedaten

## Installation

1. Repository klonen:
```bash
git clone <repository-url>
cd aurora-predictor
```

2. Alle Abhängigkeiten installieren:
```bash
npm run install-all
```

3. Umgebungsvariablen einrichten:
```bash
# In server/.env
OPENWEATHER_API_KEY=your_openweather_api_key
GEONAMES_USERNAME=your_geonames_username
```

4. Entwicklungsserver starten:
```bash
npm run dev
```

Die App läuft dann auf:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## API Keys erhalten

### OpenWeatherMap (kostenlos)
1. Besuchen Sie https://openweathermap.org/api
2. Registrieren Sie sich für einen kostenlosen Account
3. Erhalten Sie Ihren API Key

### GeoNames (kostenlos)
1. Besuchen Sie http://www.geonames.org/login
2. Erstellen Sie einen kostenlosen Account
3. Aktivieren Sie Web Services in Ihrem Account

## Technologie-Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **APIs**: Verschiedene kostenlose Weather & Space APIs
- **Styling**: Tailwind CSS mit modernen Komponenten

## Projektstruktur

```
aurora-predictor/
├── client/          # React Frontend
├── server/          # Express Backend
├── package.json     # Root package.json
└── README.md        # Diese Datei
```

## Lizenz

MIT License