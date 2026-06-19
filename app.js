/* ==========================================================================
   CHRONOMAP - INTERACTIVE GAME ENGINE & SPEECH SYNTHESIS
   ========================================================================== */

// 1. Data Base - Epoci Istorice de Înaltă Calitate
const HISTORICAL_SITES = [
    {
        name: "Podul Carol, Praga (Cehia)",
        year: 1750,
        lat: 50.0865,
        lng: 14.4114,
        panoramaUrl: "https://pannellum.org/images/prague.jpg",
        hint: "Te afli pe un pod istoric de piatră flancat de statui baroce impunătoare. Turnurile medievale se profilează în depărtare. Domnia Mariei Tereza a Austriei aduce pace în Europa Centrală.",
        sensorTemp: "14°C - Cer Noros",
        audioEffect: "medieval_bridge",
        commentaries: [
            "Briliant! Practic ai aterizat direct pe capul unei statui de pe pod. Praga îți mulțumește!",
            "Destul de aproape! Ai nimerit secolul și regiunea. Praga barocă este absolut superbă în această perioadă.",
            "Ouch! Ai pus pin-ul în altă țară și era istorică. Te-ai rătăcit printre secole precum un alchimist amator!"
        ]
    },
    {
        name: "Catedrala Duomo, Milano (Italia)",
        year: 1856,
        lat: 45.4641,
        lng: 9.1919,
        panoramaUrl: "https://pannellum.org/images/milan.jpg",
        hint: "Interiorul maiestuos al uneia dintre cele mai mari catedrale gotice. Vitraliile imense lasă lumina să se filtreze pe podeaua de marmură. În Italia, mișcarea Risorgimento prinde avânt.",
        sensorTemp: "18°C - Interior Catedrală",
        audioEffect: "cathedral_hum",
        commentaries: [
            "Sfânta Precizie! Ai aterizat direct în altarul Domului din Milano. O călătorie perfectă!",
            "Nu e rău deloc. Ai simțit vibe-ul gotic italian. Ai fost la o aruncătură de băț de secolul XIX.",
            "Ai ghicit Milano cam cum a ghicit Columb America. Adică ai nimerit complet altundeva!"
        ]
    },
    {
        name: "Radiotelescoapele ALMA, Deșertul Atacama (Chile)",
        year: 2013,
        lat: -23.0193,
        lng: -67.7538,
        panoramaUrl: "https://pannellum.org/images/alma.jpg",
        hint: "Antene gigantice scanează cerul senin la peste 5000 de metri altitudine. Solul roșiatic și arid seamănă cu planeta Marte. Suntem în secolul XXI, explorând originile universului.",
        sensorTemp: "-2°C - Vânt Puternic de Altitudine",
        audioEffect: "sci_fi_wind",
        commentaries: [
            "Uluitor! Ai calculat coordonatele ca un adevărat astronom de la ALMA. Direct la țintă!",
            "Satelitul tău intern a funcționat bine. Ai nimerit deșertul Atacama și era digitală.",
            "Te-ai dus în spațiul cosmic greșit! Antenele ALMA nu au reușit să îți detecteze logica temporală."
        ]
    },
    {
        name: "Stațiunea Cerler, Pirinei (Spania)",
        year: 1964,
        lat: 42.5891,
        lng: 0.5414,
        panoramaUrl: "https://pannellum.org/images/cerler.jpg",
        hint: "O stațiune pitorească de schi ascunsă în munți. Cabanele rustice din piatră și lemn, plus vehiculele de epocă sugerează Europa de Vest de la mijlocul anilor 1960.",
        sensorTemp: "2°C - Zăpadă Stabilă",
        audioEffect: "snow_wind",
        commentaries: [
            "Senzațional! Ai coborât pe schiuri direct la cabana corectă, în plin boom turistic spaniol.",
            "Foarte cald! (Sau rece, având în vedere zăpada). Ai nimerit munții europeni și perioada postbelică.",
            "Se pare că ai alunecat pe gheață și ai aterizat în altă emisferă și alt secol!"
        ]
    },
    {
        name: "Pădurea de Conifere, Oregon (SUA)",
        year: 1905,
        lat: 44.5646,
        lng: -123.2620,
        panoramaUrl: "https://pannellum.org/images/jocelyn-forest.jpg",
        hint: "Copaci uriași, vegetație sălbatică și un aer dens de munte. Lumina soarelui abia străpunge coroana coniferelor specifice Americii de Nord la începutul secolului XX.",
        sensorTemp: "12°C - Umiditate Crescută",
        audioEffect: "forest_birds",
        commentaries: [
            "Incredibil! Ai găsit acul în carul cu fân sau, mai bine zis, pinul corect în pădurea gigantică din Oregon.",
            "Ai mirosit bine aerul de munte din America de Nord. O aproximare excelentă!",
            "Te-ai rătăcit complet în codru. Ai plasat pin-ul atât de departe încât și urșii din Oregon râd de tine."
        ]
    }
];

// 2. Clasa pentru Sunet Sintetizat prin Web Audio API (Fără fișiere externe!)
class SoundSynth {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playClick() {
        if (this.isMuted) return;
        this.init();
        
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.08);
        
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
    }

    playPortalJump() {
        if (this.isMuted) return;
        this.init();

        let duration = 1.8;
        let osc = this.ctx.createOscillator();
        let osc2 = this.ctx.createOscillator();
        let filter = this.ctx.createBiquadFilter();
        let gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(40, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + duration * 0.4);
        osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + duration);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(80, this.ctx.currentTime);
        osc2.frequency.linearRampToValueAtTime(300, this.ctx.currentTime + duration * 0.6);
        osc2.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + duration);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(100, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + duration * 0.5);
        filter.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + duration);

        gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + duration * 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc2.start();
        
        osc.stop(this.ctx.currentTime + duration);
        osc2.stop(this.ctx.currentTime + duration);
    }

    playSuccess() {
        if (this.isMuted) return;
        this.init();

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Chord vesel)
        
        notes.forEach((freq, index) => {
            let osc = this.ctx.createOscillator();
            let gain = this.ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + index * 0.08);
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.08, now + index * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6 + index * 0.05);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now + index * 0.08);
            osc.stop(now + 0.8 + index * 0.08);
        });
    }

    playFailure() {
        if (this.isMuted) return;
        this.init();

        const now = this.ctx.currentTime;
        const notes = [293.66, 277.18, 261.63]; // D4, C#4, C4 (Coborâre tristă)
        
        notes.forEach((freq, index) => {
            let osc = this.ctx.createOscillator();
            let gain = this.ctx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now + index * 0.15);
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.06, now + index * 0.15 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5 + index * 0.1);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now + index * 0.15);
            osc.stop(now + 0.6 + index * 0.15);
        });
    }
}

const AudioPlayer = new SoundSynth();

// 3. Starea Globală a Jocului
let gameState = {
    currentRound: 0,
    maxRounds: 5,
    score: 0,
    currentSite: null,
    guessedCoords: null,
    guessedYear: 1000,
    roundScore: 0,
    shuffledSites: []
};

// Obiecte UI și Map-uri globale
let guessMap = null;
let resultMap = null;
let guessMarker = null;
let pannellumViewer = null;
let resultRealMarker = null;
let resultGuessMarker = null;
let resultLine = null;

// 4. Funcții de ajutor utilitare (Haversine & Date Format)
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raza Pământului în km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
}

function formatYear(year) {
    if (year < 0) {
        return Math.abs(year) + " î.Hr.";
    } else {
        return year + " d.Hr.";
    }
}

// 5. Inițializarea Jocului și a hărții
document.addEventListener("DOMContentLoaded", () => {
    initUIEventListeners();
});

function initUIEventListeners() {
    // Pornire Joc din Portal
    document.getElementById("btn-start-game").addEventListener("click", () => {
        AudioPlayer.playPortalJump();
        setTimeout(() => {
            document.getElementById("intro-screen").classList.remove("active");
            document.getElementById("game-screen").classList.add("active");
            startNewGame();
        }, 800);
    });

    // Mute Button toggle
    const muteBtn = document.getElementById("btn-mute");
    muteBtn.addEventListener("click", () => {
        AudioPlayer.isMuted = !AudioPlayer.isMuted;
        if (AudioPlayer.isMuted) {
            muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
            muteBtn.classList.add("muted");
        } else {
            muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            muteBtn.classList.remove("muted");
            AudioPlayer.playClick();
        }
    });

    // Toggle Map Panel (Collapsible)
    const mapWrapper = document.getElementById("map-container");
    const toggleMapBtn = document.getElementById("btn-toggle-map");
    toggleMapBtn.addEventListener("click", () => {
        AudioPlayer.playClick();
        mapWrapper.classList.toggle("collapsed");
        if (mapWrapper.classList.contains("collapsed")) {
            toggleMapBtn.querySelector(".toggle-text").innerText = "DESCHIDE HARTA";
        } else {
            toggleMapBtn.querySelector(".toggle-text").innerText = "RESTRÂNGE";
            // Redesenează harta Leaflet pentru a se asigura că își ocupă spațiul corect
            setTimeout(() => {
                if (guessMap) guessMap.invalidateSize();
            }, 300);
        }
    });

    // Slider de Timp
    const slider = document.getElementById("chrono-slider");
    const sliderValDisplay = document.getElementById("chrono-guess-val");
    slider.addEventListener("input", (e) => {
        gameState.guessedYear = parseInt(e.target.value);
        sliderValDisplay.innerText = formatYear(gameState.guessedYear);
    });
    slider.addEventListener("change", () => {
        AudioPlayer.playClick();
    });

    // Buton Blochează Coordonatele (Submit Guess)
    document.getElementById("btn-submit-guess").addEventListener("click", () => {
        if (!gameState.guessedCoords) {
            alert("Așază mai întâi un pin pe hartă pentru a ghici locația geografică!");
            return;
        }
        processGuess();
    });

    // Buton Next Round
    document.getElementById("btn-next-round").addEventListener("click", () => {
        AudioPlayer.playClick();
        document.getElementById("results-overlay").classList.remove("active");
        loadNextRound();
    });

    // Buton Replay Voice Comment
    document.getElementById("btn-replay-voice").addEventListener("click", () => {
        playAIVoiceCommentary();
    });

    // Buton Restart Game
    document.getElementById("btn-restart").addEventListener("click", () => {
        AudioPlayer.playPortalJump();
        document.getElementById("game-over-screen").classList.remove("active");
        document.getElementById("game-screen").classList.add("active");
        startNewGame();
    });
}

function startNewGame() {
    gameState.score = 0;
    gameState.currentRound = 0;
    // Amestecă epocile pentru un joc unic de fiecare dată
    gameState.shuffledSites = [...HISTORICAL_SITES].sort(() => Math.random() - 0.5);
    
    // Inițializează Harta de Ghicit
    initGuessMap();

    // Încarcă prima rundă
    loadNextRound();
}

function initGuessMap() {
    if (guessMap) return; // Deja inițializată

    // Creăm harta Leaflet centrată pe Europa de unde utilizatorul poate pune un pin
    guessMap = L.map('guess-map', {
        zoomControl: true,
        attributionControl: false
    }).setView([20, 0], 2);

    // Folosim o temă Dark elegantă de la CartoDB
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18
    }).addTo(guessMap);

    // Event de click pe hartă pentru a plasa pin-ul temporal
    guessMap.on('click', (e) => {
        const { lat, lng } = e.latlng;
        gameState.guessedCoords = { lat, lng };
        AudioPlayer.playClick();

        if (guessMarker) {
            guessMarker.setLatLng(e.latlng);
        } else {
            // Un pin retro-futurist strălucitor
            const cyberIcon = L.divIcon({
                className: 'cyber-pin',
                html: '<div class="pin-ring"></div><div class="pin-core"></div>',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });
            guessMarker = L.marker(e.latlng, { icon: cyberIcon }).addTo(guessMap);
        }

        document.getElementById("btn-toggle-map").querySelector(".toggle-text").innerText = "COORDONATĂ SALVATĂ";
    });
}

function loadNextRound() {
    if (gameState.currentRound >= gameState.maxRounds) {
        endGame();
        return;
    }

    gameState.currentRound++;
    gameState.currentSite = gameState.shuffledSites[gameState.currentRound - 1];
    gameState.guessedCoords = null;
    gameState.guessedYear = 1000;

    // Resetăm slider-ul de timp la mijloc (Anul 1000 d.Hr.)
    const slider = document.getElementById("chrono-slider");
    slider.value = "1000";
    document.getElementById("chrono-guess-val").innerText = formatYear(1000);

    // Eliminăm pin-ul anterior dacă există
    if (guessMarker) {
        guessMap.removeLayer(guessMarker);
        guessMarker = null;
    }

    // Resetăm textul butonului hărții
    document.getElementById("btn-toggle-map").querySelector(".toggle-text").innerText = "DESCHIDE HARTA";
    document.getElementById("map-container").classList.add("collapsed");

    // Actualizăm HUD-ul de sus
    document.getElementById("hud-round").innerText = `${gameState.currentRound}/${gameState.maxRounds}`;
    document.getElementById("hud-score").innerText = gameState.score.toLocaleString();

    // Actualizăm indiciile din stânga
    document.getElementById("hint-text").innerText = gameState.currentSite.hint;
    document.getElementById("sensor-temp").innerText = gameState.currentSite.sensorTemp;

    // Încărcăm vizualizatorul 360° Pannellum
    load360Panorama();
}

function load360Panorama() {
    // Distrugem vizualizatorul vechi dacă există
    if (pannellumViewer) {
        try {
            pannellumViewer.destroy();
        } catch(e) {}
    }

    // Inițializăm un nou vizualizator cu animație de estompare
    pannellumViewer = pannellum.viewer('panorama-viewer', {
        type: 'equirectangular',
        panorama: gameState.currentSite.panoramaUrl,
        autoLoad: true,
        showZoomCtrl: false,
        showFullscreenCtrl: false,
        compass: false,
        mouseZoom: false
    });
}

// 6. Procesarea Răspunsului & Calcul Scor
function processGuess() {
    const site = gameState.currentSite;
    const distance = getDistance(gameState.guessedCoords.lat, gameState.guessedCoords.lng, site.lat, site.lng);
    const yearDiff = Math.abs(gameState.guessedYear - site.year);

    // Formula Geoguessr-style: Scorul scade exponențial în funcție de distanță și ani decalaj
    // Max Scor Locație: 5000 | Max Scor An: 5000 | Total Max: 10000 pe rundă
    
    // Locație: Scorul este de 5000 dacă e sub 25 km, și scade la jumătate la fiecare 2000 km
    let scoreLoc = Math.round(5000 * Math.exp(-distance / 2000));
    if (distance < 25) scoreLoc = 5000;
    if (scoreLoc < 50) scoreLoc = 0; // Minim acceptabil

    // Anul exact: Scorul este 5000 la 0 ani diferență, scade la jumătate la fiecare 150 de ani diferență
    let scoreTime = Math.round(5000 * Math.exp(-yearDiff / 150));
    if (yearDiff === 0) scoreTime = 5000;
    if (scoreTime < 50) scoreTime = 0;

    gameState.roundScore = scoreLoc + scoreTime;
    gameState.score += gameState.roundScore;

    // Redare Audio efecte
    if (gameState.roundScore > 6500) {
        AudioPlayer.playSuccess();
    } else {
        AudioPlayer.playFailure();
    }

    // Afișează Rezultatele în Modala Overlay
    showResultModal(distance, yearDiff, scoreLoc, scoreTime);
}

function showResultModal(distance, yearDiff, scoreLoc, scoreTime) {
    const site = gameState.currentSite;
    
    // Status Badge text în funcție de performanță
    const statusBadge = document.getElementById("portal-status");
    if (gameState.roundScore > 8500) {
        statusBadge.innerText = "ALINIERE TEMPORALĂ PERFECTĂ";
        statusBadge.className = "status-badge pulse-green";
    } else if (gameState.roundScore > 5000) {
        statusBadge.innerText = "ALINIERE STABILĂ";
        statusBadge.className = "status-badge pulse-blue";
    } else {
        statusBadge.innerText = "DEVIERE TEMPORALĂ CRITICĂ";
        statusBadge.className = "status-badge pulse-red";
    }

    // Completăm datele numerice
    document.getElementById("val-distance").innerText = `${distance.toLocaleString()} km`;
    document.getElementById("val-real-year").innerText = formatYear(site.year);
    document.getElementById("val-guessed-year").innerText = formatYear(gameState.guessedYear);
    
    let yearDiffText = yearDiff === 0 ? "Perfect" : `${yearDiff.toLocaleString()} Ani`;
    document.getElementById("val-year-diff").innerText = yearDiffText;
    if (yearDiff === 0) {
        document.getElementById("val-year-diff").className = "text-green font-bold";
    } else if (yearDiff < 100) {
        document.getElementById("val-year-diff").className = "text-cyber-blue font-bold";
    } else {
        document.getElementById("val-year-diff").className = "text-red font-bold";
    }

    document.getElementById("score-loc").innerText = scoreLoc.toLocaleString();
    document.getElementById("score-time").innerText = scoreTime.toLocaleString();
    document.getElementById("score-total").innerText = `${gameState.roundScore.toLocaleString()} / 10,000`;

    // Animăm barele de scor procentual
    document.getElementById("bar-loc").style.width = `${(scoreLoc / 5000) * 100}%`;
    document.getElementById("bar-time").style.width = `${(scoreTime / 5000) * 100}%`;

    // Alegem comentariul AI în funcție de scorul obținut
    let commentIndex = 2; // Rău de tot
    if (gameState.roundScore > 8000) commentIndex = 0; // Excelent
    else if (gameState.roundScore > 4500) commentIndex = 1; // Mediu

    const commentaryText = site.commentaries[commentIndex];
    document.getElementById("ai-commentary-text").innerText = `"${commentaryText}"`;

    // Deschidem Overlay-ul
    document.getElementById("results-overlay").classList.add("active");

    // Inițializăm Harta de Rezultate secundară din modală pentru a arăta distanța pe glob
    setTimeout(() => {
        initResultMap(site.lat, site.lng, gameState.guessedCoords.lat, gameState.guessedCoords.lng);
        // Redăm automat comentariul prin Speech Synthesis dacă utilizatorul dorește
        playAIVoiceCommentary();
    }, 100);
}

function initResultMap(realLat, realLng, guessedLat, guessedLng) {
    if (resultMap) {
        resultMap.remove();
        resultMap = null;
    }

    resultMap = L.map('result-map', {
        zoomControl: false,
        attributionControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(resultMap);

    // Custom Icon pentru Pin-ul Real (Aur / Portal)
    const realIcon = L.divIcon({
        className: 'cyber-pin-real',
        html: '<div class="pin-ring-real"></div><div class="pin-core-real"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });

    // Custom Icon pentru Pin-ul Ghicit (Cyan)
    const guessIcon = L.divIcon({
        className: 'cyber-pin-guess',
        html: '<div class="pin-ring-guess"></div><div class="pin-core-guess"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });

    resultRealMarker = L.marker([realLat, realLng], { icon: realIcon }).addTo(resultMap).bindPopup("Ancora Reală");
    resultGuessMarker = L.marker([guessedLat, guessedLng], { icon: guessIcon }).addTo(resultMap).bindPopup("Locația Ghicită");

    // Linie arcuită sau simplă punctată între ele
    resultLine = L.polyline([[realLat, realLng], [guessedLat, guessedLng]], {
        color: '#ffb700',
        weight: 2,
        dashArray: '5, 10',
        opacity: 0.8
    }).addTo(resultMap);

    // Centrarea hărții pe ambele pin-uri
    const group = new L.featureGroup([resultRealMarker, resultGuessMarker]);
    resultMap.fitBounds(group.getBounds().pad(0.3));
}

// 7. ElevenLabs Simulated Voice Commentary (utilizează Web Speech API cu o tentă robotizată)
function playAIVoiceCommentary() {
    if (AudioPlayer.isMuted) return;

    // Oprim orice redare vocală activă
    window.speechSynthesis.cancel();

    const textToSpeak = document.getElementById("ai-commentary-text").innerText;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Încercăm să găsim o voce în limba Română, preferabil feminină sau clară
    const voices = window.speechSynthesis.getVoices();
    const roVoice = voices.find(voice => voice.lang.includes("ro") || voice.lang.includes("RO"));
    
    if (roVoice) {
        utterance.voice = roVoice;
    }
    
    utterance.pitch = 0.95; // ușor mai grav/trailer vocal
    utterance.rate = 1.05;  // ritm alert, modern

    window.speechSynthesis.speak(utterance);
}

// 8. Ecranul de final de joc (GAME OVER / LEADERBOARD)
function endGame() {
    document.getElementById("game-screen").classList.remove("active");
    document.getElementById("game-over-screen").classList.add("active");

    const finalScore = gameState.score;
    document.getElementById("final-score-val").innerText = finalScore.toLocaleString();
    document.getElementById("leader-user-score").innerText = finalScore.toLocaleString();

    // Calculăm rangul temporal în funcție de scorul final (Maxim: 50.000)
    const rankDisplay = document.getElementById("final-rank");
    if (finalScore > 45000) {
        rankDisplay.innerText = "Rang: Maestru Suprem al Timpului (ChronoLord)";
        rankDisplay.style.color = "var(--green)";
    } else if (finalScore > 35000) {
        rankDisplay.innerText = "Rang: Navigator Temporal Clasa I";
        rankDisplay.style.color = "var(--cyber-blue)";
    } else if (finalScore > 20000) {
        rankDisplay.innerText = "Rang: Călător Temporal de Gradul 2";
        rankDisplay.style.color = "var(--gold)";
    } else {
        rankDisplay.innerText = "Rang: Cadet Începător rătăcit prin ere";
        rankDisplay.style.color = "var(--red)";
    }
}
