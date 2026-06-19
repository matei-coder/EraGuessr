# 🗺️ ChronoMap - Portalul Istoric 360°

**ChronoMap** este un joc web interactiv, premium, de tip *Time-Travel GeoGuessr*, creat special pentru Hackathon-ul Google. Utilizatorii sunt trimiși într-o călătorie în timp în diverse locații geografice și epoci istorice reprezentate prin panorame uimitoare la 360 de grade, unde trebuie să identifice locul și anul exact al scenei.

---

## 🚀 Caracteristici Implementate în Prototipul de Start

### 1. Vizualizator Panoramic 360° Imersiv
- Integrat cu **Pannellum.js**, oferind rotație fină, fluidă și complet interactivă la 360° în WebGL.
- Epoci de start spectaculoase incluse (Praga medievală din secolul XVIII, interiorul Catedralei Duomo din Milano din secolul XIX, Observatorul modern ALMA din Chile, stațiunea spaniolă Cerler din 1964, pădurea maiestuoasă din Oregon din 1905).

### 2. Hartă Holografică Interactivă (GeoGuessing)
- Realizată cu **Leaflet.js**, utilizând o hartă cu temă întunecată (**CartoDB DarkMatter**) potrivită pentru design-ul high-tech.
- Pin-uri personalizate cu design neon pulsatoriu care indică unde utilizatorul a plasat "ancora geografică".
- Vizualizare comparativă în ecranul de scor, afișând distanța în kilometri și desenând un vector cu linie punctată între locația reală și cea ghicită.

### 3. Timeline Chrono-Slider (Chronology Guessing)
- Un slider temporal customizat, retro-futurist, cu strălucire neon.
- Permite glisarea facilă pe o axă a timpului cuprinsă între anul **-3000 î.Hr.** și anul **2026 d.Hr.**, formatând datele dinamic.

### 4. Sistem Avansat de Calcul al Scorului
- **Scor Geografic (0-5000 pct)**: Calculat în funcție de distanța în kilometri folosind formula matematică *Haversine* (scădere exponențială realistă, similară cu GeoGuessr).
- **Scor Temporal (0-5000 pct)**: Scade în funcție de decalajul de ani dintre anul ghicit și cel real.
- **Scor Total (0-10000 pct/rundă)** pe parcursul a 5 runde captivante.

### 5. Sunet Sintetizat Dinamic (Web Audio API)
- Fără dependență de fișiere externe de sunet de pe internet care s-ar putea încărca greu!
- Sunete SF de tip "Săritură prin portal" (portal sweep), click-uri tactile de interfață, melodie triumfătoare pentru scor mare (Success chord) și melodie coborâtoare retro pentru abateri mari.

### 6. Comentator AI cu Sinteză Vocală (Speech Synthesis)
- Sistem inteligent care citește cu voce tare comentarii amuzante și sarcastice despre scorul rundei în limba Română, folosind motorul de discurs al browser-ului.
- Oferă o reproducere a conceptului de comentator AI (ideal pentru integrarea ulterioară cu ElevenLabs).

---

## 🛠️ Cum se rulează Proiectul

Proiectul este proiectat ca o aplicație de tip **Single Page Application (SPA)** ultra-rapidă, fără pași complecși de compilare.

1. **Rulează direct**: Deschide fișierul `index.html` în orice browser modern (Chrome, Edge, Safari, Firefox).
2. **Servire locală (recomandat pentru performanță WebGL stabilă)**:
   Dacă folosești VS Code, poți folosi extensia *Live Server*, sau poți rula în terminal din folderul proiectului:
   ```bash
   # Dacă ai Python instalat
   python -m http.server 8000
   # Apoi accesează http://localhost:8000
   ```

---

## 📈 Plan de Extindere pentru Hackathon (Next Steps)

Pentru a maximiza punctajul tehnic în fața juriului, iată cum poți extinde acest prototip folosind resursele Google Firebase și Vertex AI:

1. **Vertex AI & Imagen 3 (Generarea de panorame noi)**:
   - Folosește modelul **Imagen 3** din Vertex AI în modul *equirectangular* sau *panorama* pentru a genera imagini la 360° complet noi direct din prompt-uri istorice furnizate de jucători.
2. **Google Gemini API (Generare de indicii și detalii)**:
   - Integrează Gemini pentru a crea descrieri atmosferice bogate sau indicii secrete despre epocă atunci când utilizatorul este blocat.
3. **Firebase Firestore (Real-Time Leaderboard)**:
   - Înlocuiește leaderboard-ul static din ecranul final cu o colecție Firestore live, permițând tuturor din sală să concureze pe un ecran mare în timp real.
4. **Firebase Hosting & Cloud Functions**:
   - Găzduiește aplicația pe Firebase Hosting.
   - Folosește Firebase Cloud Functions (Python) ca backend sigur pentru a ascunde API keys pentru Vertex AI/Gemini și a apela ElevenLabs.
