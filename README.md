# Pool Dashboard — Home Assistant

Interaktives Pool-Dashboard mit SVG-Visualisierung, animierten Effekten und Schnellsteuerung.

## Vorschau

Die Datei `www/pool.svg` zeigt den Pool in einer statischen Vorschau (mit Licht EIN und Pumpe EIN).
Einfach im Browser öffnen: `config/www/pool.svg` → `http://<HA-IP>:8123/local/pool.svg`

## Voraussetzungen

Installiere diese Karten über **HACS → Frontend**:

| Karte | HACS-Name |
|-------|-----------|
| `button-card` | lovelace-button-card |
| `mushroom-cards` | lovelace-mushroom |
| `apexcharts-card` | lovelace-apexcharts-card |

## Installation

### 1. SVG-Datei kopieren

```
www/pool.svg  →  config/www/pool.svg
```

### 2. Dashboard anlegen

**Einstellungen → Dashboards → Dashboard hinzufügen**

- Typ: **Lovelace (YAML-Modus)**
- Datei: `dashboards/pool.yaml` einfügen

Oder in einer bestehenden Lovelace-Konfiguration als neue View einbinden.

### 3. Entity-IDs anpassen

Suche in `dashboards/pool.yaml` nach `# ANPASSEN` und ersetze die Dummy-IDs:

| Dummy-Entity | Deine Entity |
|---|---|
| `switch.pool_pump` | Filterpumpe |
| `switch.pool_heater` | Heizung / Wärmepumpe |
| `light.pool_light` | LED-Beleuchtung |
| `switch.pool_countercurrent` | Gegenstromanlage |
| `sensor.pool_water_temperature` | Wassertemperatur |
| `sensor.pool_heater_setpoint` | Zieltemperatur (optional) |

Falls du keine Gegenstromanlage oder keinen Setpoint-Sensor hast, einfach die entsprechenden Zeilen entfernen.

## Funktionen

| Element | Verhalten |
|---|---|
| **Pool-SVG** | Interaktive Vogelperspektive mit Echtzeit-States |
| **Wellen** | Animiert wenn Pumpe EIN |
| **Unterwasserlicht** | Leuchtet/pulsiert in Gelb wenn Licht EIN |
| **Wasserfarbe** | Wechselt zu kräftigem Blau wenn Licht EIN |
| **Heizung** | Oranges Glühen + Flackern wenn aktiv |
| **Gegenstrom** | Pfeil-Animation wenn aktiv |
| **Chips** | Schnellübersicht + direktes Umschalten |
| **Graph** | Wassertemperatur-Verlauf 24h (ApexCharts) |
| **Buttons** | 2×2 Schnellsteuerung Pumpe/Heizung/Licht/Gegenstrom |
