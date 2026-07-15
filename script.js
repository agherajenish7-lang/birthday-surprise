/*
    ========================================================================
    Interactive Birthday Surprise - Cinematic Logic & Engine
    Contains: Canvas Particle Engine, Web Audio API Synthesizer, GSAP Timelines
    ========================================================================
*/

document.addEventListener("DOMContentLoaded", () => {
    // Screen Elements
    const screenPassword = document.getElementById("screen-password");
    const screenLanding = document.getElementById("screen-landing");
    const screenCountdown = document.getElementById("screen-countdown");
    const screenCelebration = document.getElementById("screen-celebration");
    const screenLetter = document.getElementById("screen-letter");
    const appContainer = document.getElementById("app-container");

    // Password Screen Elements
    const passwordInput = document.getElementById("password-input");
    const passwordMessage = document.getElementById("password-message");
    const btnUnlock = document.getElementById("btn-unlock");
    const glassCard = document.querySelector(".glass-card");

    // Fade in password card on load
    gsap.fromTo(glassCard, {
        opacity: 0,
        y: 30,
        scale: 0.95
    }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.2,
        ease: "power3.out"
    });

    // Interactive Buttons
    const btnStart = document.getElementById("btn-start");
    const btnBlow = document.getElementById("btn-blow");
    const btnCut = document.getElementById("btn-cut");
    const musicToggle = document.getElementById("music-toggle");
    const musicIconMuted = musicToggle.querySelector(".music-icon-muted");
    const musicIconPlaying = musicToggle.querySelector(".music-icon-playing");
    const musicLabel = musicToggle.querySelector(".music-label");
    
    // Countdown Elements
    const ringProgress = document.getElementById("ring-progress");
    const countdownNumber = document.getElementById("countdown-number");
    const countdownSubtext = document.getElementById("countdown-subtext");
    
    // Celebration Elements
    const birthdayTitle = document.getElementById("birthday-title");
    const svgCake = document.getElementById("svg-cake");
    const svgKnife = document.getElementById("svg-knife");
    const cakeLeftHalf = document.getElementById("cake-left-half");
    const cakeRightHalf = document.getElementById("cake-right-half");
    const blowCountdown = document.getElementById("blow-countdown");
    
    // Letter Elements
    const birthdayCard = document.getElementById("birthday-card");
    const typewriterText = document.getElementById("typewriter-text");
    const madeWithLove = document.getElementById("made-with-love");

    // Audio & State Flags
    let isMusicPlaying = false;
    let audioSynthesizer = null;
    let confettiInterval = null;

    /*
        ========================================================================
        1. Web Audio API Ambient Synthesizer
        Creates premium acoustic tones & chimes entirely in-browser
        ========================================================================
    */
    class AudioEngine {
        constructor() {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.mainGain = this.ctx.createGain();
            this.mainGain.gain.value = 0.0; // Start muted, fade in
            this.mainGain.connect(this.ctx.destination);
            
            this.melodyPlaying = false;
            this.melodyScheduleId = null;
            this.noteIndex = 0;
            
            // Frequencies for Happy Birthday (Cinematic Soft arpeggios & melody)
            // Format: [note, duration in seconds, octave]
            this.happyBirthdayMelody = [
                ['C4', 0.5], ['C4', 0.5], ['D4', 1.0], ['C4', 1.0], ['F4', 1.0], ['E4', 2.0],
                ['C4', 0.5], ['C4', 0.5], ['D4', 1.0], ['C4', 1.0], ['G4', 1.0], ['F4', 2.0],
                ['C4', 0.5], ['C4', 0.5], ['C5', 1.0], ['A4', 1.0], ['F4', 1.0], ['E4', 1.0], ['D4', 2.0],
                ['Bb4', 0.5], ['Bb4', 0.5], ['A4', 1.0], ['F4', 1.0], ['G4', 1.0], ['F4', 2.5]
            ];
            
            // Background ambient pad chords (warm luxury texture)
            // Chords: Fmaj7 -> Cmaj7 -> Bbmaj7 -> Fmaj7
            this.ambientChords = [
                ['F3', 'A3', 'C4', 'E4'],
                ['C3', 'G3', 'C4', 'E4'],
                ['Bb2', 'F3', 'Bb3', 'D4'],
                ['F3', 'A3', 'C4', 'E4']
            ];
            this.chordIndex = 0;
        }

        // Translate pitch string to frequency
        getFrequency(note) {
            const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            const octave = parseInt(note.slice(-1));
            const key = note.slice(0, -1);
            const keyNumber = notes.indexOf(key);
            
            // A4 is key number 9 in octave 4, frequency 440
            const relativeKey = keyNumber + (octave - 4) * 12 - 9;
            return 440 * Math.pow(2, relativeKey / 12);
        }

        // Initialize and play ambient soundtrack
        startAmbient() {
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            
            // Smoothly fade in volume
            this.mainGain.gain.setValueAtTime(0, this.ctx.currentTime);
            this.mainGain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 2.0);
            
            this.melodyPlaying = true;
            
            // Start ambient backdrop pads
            this.playNextPad();
            
            // Start main music box melody after short delay
            setTimeout(() => {
                this.playMelodyStep();
            }, 1000);
        }

        // Warm ambient background pads
        playNextPad() {
            if (!this.melodyPlaying) return;
            
            const chord = this.ambientChords[this.chordIndex];
            const now = this.ctx.currentTime;
            
            // Synthesize chord tones using soft sine/triangle oscillators
            chord.forEach(note => {
                const osc = this.ctx.createOscillator();
                const filter = this.ctx.createBiquadFilter();
                const gain = this.ctx.createGain();
                
                osc.type = 'triangle';
                osc.frequency.value = this.getFrequency(note);
                
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(250, now);
                filter.frequency.exponentialRampToValueAtTime(450, now + 4.0);
                
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.025, now + 2.0); // very soft
                gain.gain.linearRampToValueAtTime(0, now + 7.5);
                
                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.mainGain);
                
                osc.start(now);
                osc.stop(now + 8.0);
            });
            
            this.chordIndex = (this.chordIndex + 1) % this.ambientChords.length;
            
            // Schedule next pad chord
            this.padTimeout = setTimeout(() => this.playNextPad(), 7500);
        }

        // Synthesize single music box / piano note
        playNote(frequency, duration) {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();
            
            // Triangle + Sine waves combined make a lovely warm chime
            osc.type = 'sine';
            osc.frequency.setValueAtTime(frequency, now);
            
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(frequency * 2, now); // Add harmonic octave
            
            filter.type = 'lowpass';
            filter.frequency.value = 800; // Cut off highs for warm piano tone
            
            // Music box pluck envelope
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.35, now + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration * 1.5);
            
            osc.connect(filter);
            osc2.connect(filter);
            filter.connect(gain);
            gain.connect(this.mainGain);
            
            osc.start(now);
            osc2.start(now);
            
            osc.stop(now + duration * 2.0);
            osc2.stop(now + duration * 2.0);
        }

        // Melody scheduler step
        playMelodyStep() {
            if (!this.melodyPlaying) return;
            
            const currentNote = this.happyBirthdayMelody[this.noteIndex];
            const freq = this.getFrequency(currentNote[0]);
            const duration = currentNote[1];
            
            // Play note
            this.playNote(freq, duration);
            
            this.noteIndex = (this.noteIndex + 1) % this.happyBirthdayMelody.length;
            
            // Schedule next note based on duration
            const delay = duration * 850; // Map note duration to milliseconds
            this.melodyTimeout = setTimeout(() => this.playMelodyStep(), delay);
        }

        // Soft digital ticking sound for countdown
        playTick() {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1000, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
            
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination); // Bypass main gain to allow ticking when muted if needed (but we let it connect directly)
            
            osc.start(now);
            osc.stop(now + 0.1);
        }

        // Ticking countdown completion swell / magic wave sound
        playChimes() {
            const now = this.ctx.currentTime;
            const frequencies = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
            
            frequencies.forEach((freq, idx) => {
                setTimeout(() => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    
                    osc.type = 'triangle';
                    osc.frequency.value = freq;
                    
                    gain.gain.setValueAtTime(0, this.ctx.currentTime);
                    gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
                    
                    osc.connect(gain);
                    gain.connect(this.mainGain);
                    
                    osc.start();
                    osc.stop(this.ctx.currentTime + 1.0);
                }, idx * 100);
            });
        }

        // Whoosh effect (noise generation) for candle blowing & cutting
        playWhoosh() {
            const bufferSize = this.ctx.sampleRate * 0.5; // 0.5s duration
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            
            // White Noise Generation
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            
            const noiseNode = this.ctx.createBufferSource();
            noiseNode.buffer = buffer;
            
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.5);
            
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
            
            noiseNode.connect(filter);
            filter.connect(gain);
            gain.connect(this.mainGain);
            
            noiseNode.start();
            noiseNode.stop(this.ctx.currentTime + 0.5);
        }

        // Mute or Unmute audio path
        setMute(isMuted) {
            if (isMuted) {
                this.mainGain.gain.setValueAtTime(this.mainGain.gain.value, this.ctx.currentTime);
                this.mainGain.gain.linearRampToValueAtTime(0.0, this.ctx.currentTime + 0.5);
            } else {
                if (this.ctx.state === 'suspended') {
                    this.ctx.resume();
                }
                this.mainGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
                this.mainGain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 0.5);
            }
        }

        // Stop all melody scheduling
        stopMelody() {
            this.melodyPlaying = false;
            clearTimeout(this.melodyTimeout);
            clearTimeout(this.padTimeout);
        }
    }

    /*
        ========================================================================
        2. Ambient Canvas Particle Engine
        Renders slow floating petals, sparkles, golden dust, hearts, and bokeh
        ========================================================================
    */
    const canvas = document.getElementById("ambient-canvas");
    const ctx = canvas.getContext("2d");
    let particles = [];
    let canvasWidth = 0;
    let canvasHeight = 0;
    let isAmbientActive = true;

    // Resize handler
    function resizeCanvas() {
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Particle Base class definition
    class Particle {
        constructor(type) {
            this.type = type; // 'petal', 'goldDust', 'sparkle', 'heart', 'bokeh'
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * canvasWidth;
            // Spawning positioning: start above or below depending on type
            if (initial) {
                this.y = Math.random() * canvasHeight;
            } else {
                if (this.type === 'petal' || this.type === 'bokeh') {
                    this.y = -20; // Falling down
                } else {
                    this.y = canvasHeight + 20; // Rising up
                }
            }
            
            this.size = 0;
            this.speedX = 0;
            this.speedY = 0;
            this.opacity = 0;
            this.maxOpacity = 0;
            this.rotation = 0;
            this.rotationSpeed = 0;
            this.color = '';
            
            switch(this.type) {
                case 'petal':
                    this.size = Math.random() * 8 + 6;
                    this.speedX = Math.random() * 0.4 - 0.1; // slow drift right
                    this.speedY = Math.random() * 0.5 + 0.4;  // slow fall
                    this.maxOpacity = Math.random() * 0.4 + 0.2;
                    this.opacity = initial ? Math.random() * this.maxOpacity : 0;
                    this.rotation = Math.random() * Math.PI;
                    this.rotationSpeed = Math.random() * 0.01 - 0.005;
                    this.color = '#F4D6D6'; // soft pink
                    break;
                case 'goldDust':
                    this.size = Math.random() * 1.5 + 0.8;
                    this.speedX = Math.random() * 0.2 - 0.1;
                    this.speedY = -(Math.random() * 0.4 + 0.2); // rise up
                    this.maxOpacity = Math.random() * 0.5 + 0.3;
                    this.opacity = initial ? Math.random() * this.maxOpacity : 0;
                    this.color = '#D4AF37'; // gold
                    break;
                case 'sparkle':
                    this.size = Math.random() * 6 + 4;
                    this.speedX = Math.random() * 0.1 - 0.05;
                    this.speedY = -(Math.random() * 0.2 + 0.1);
                    this.maxOpacity = Math.random() * 0.7 + 0.2;
                    this.opacity = initial ? Math.random() * this.maxOpacity : 0;
                    this.sparklePhase = Math.random() * Math.PI * 2;
                    this.sparkleSpeed = Math.random() * 0.05 + 0.02;
                    this.color = '#F8F8F8'; // white/gold sparkle
                    break;
                case 'heart':
                    this.size = Math.random() * 10 + 8;
                    this.speedX = Math.random() * 0.3 - 0.15;
                    this.speedY = -(Math.random() * 0.3 + 0.2); // float up slowly
                    this.maxOpacity = Math.random() * 0.3 + 0.15;
                    this.opacity = initial ? Math.random() * this.maxOpacity : 0;
                    this.rotation = Math.random() * 0.2 - 0.1;
                    break;
                case 'bokeh':
                    this.size = Math.random() * 60 + 40;
                    this.speedX = Math.random() * 0.1 - 0.05;
                    this.speedY = Math.random() * 0.1 + 0.05; // extremely slow drift
                    this.maxOpacity = Math.random() * 0.03 + 0.01; // very faint
                    this.opacity = initial ? Math.random() * this.maxOpacity : 0;
                    this.color = '#E8DCC8'; // warm beige
                    break;
            }
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            // Smoothly fade in/out
            if (this.y > -50 && this.y < canvasHeight + 50 && this.x > -50 && this.x < canvasWidth + 50) {
                if (this.opacity < this.maxOpacity) {
                    this.opacity += 0.01;
                }
            } else {
                this.reset();
            }

            // Additional dynamic movements per type
            if (this.type === 'petal') {
                this.rotation += this.rotationSpeed;
                // Add tiny sway
                this.x += Math.sin(this.y * 0.01) * 0.15;
            } else if (this.type === 'sparkle') {
                this.sparklePhase += this.sparkleSpeed;
                this.opacity = this.maxOpacity * (0.3 + Math.abs(Math.sin(this.sparklePhase)) * 0.7);
            } else if (this.type === 'heart') {
                this.x += Math.sin(this.y * 0.02) * 0.2;
            }
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.translate(this.x, this.y);

            if (this.type === 'petal') {
                ctx.rotate(this.rotation);
                ctx.fillStyle = this.color;
                // Draw delicate petal teardrop shape
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(-this.size, this.size / 2, -this.size / 2, this.size * 1.5, 0, this.size * 1.8);
                ctx.bezierCurveTo(this.size / 2, this.size * 1.5, this.size, this.size / 2, 0, 0);
                ctx.closePath();
                ctx.fill();
            } 
            else if (this.type === 'goldDust') {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();
            } 
            else if (this.type === 'sparkle') {
                ctx.fillStyle = '#D4AF37';
                // Draw a 4-point star sparkle
                ctx.beginPath();
                ctx.moveTo(0, -this.size);
                ctx.quadraticCurveTo(0, 0, this.size, 0);
                ctx.quadraticCurveTo(0, 0, 0, this.size);
                ctx.quadraticCurveTo(0, 0, -this.size, 0);
                ctx.quadraticCurveTo(0, 0, 0, -this.size);
                ctx.closePath();
                ctx.fill();
                
                // Overlay white center
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(0, 0, this.size * 0.3, 0, Math.PI * 2);
                ctx.fill();
            } 
            else if (this.type === 'heart') {
                ctx.rotate(this.rotation);
                ctx.fillStyle = '#F4D6D6'; // Soft pink heart
                // Draw heart shape
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(-this.size/2, -this.size/2, -this.size, -this.size/4, 0, this.size * 0.8);
                ctx.bezierCurveTo(this.size, -this.size/4, this.size/2, -this.size/2, 0, 0);
                ctx.closePath();
                ctx.fill();
            } 
            else if (this.type === 'bokeh') {
                // Soft glow radial blur
                const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
                grad.addColorStop(0, 'rgba(232, 220, 200, 0.4)');
                grad.addColorStop(0.5, 'rgba(232, 220, 200, 0.1)');
                grad.addColorStop(1, 'rgba(232, 220, 200, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }
    }

    // Populate particles
    function initParticles() {
        particles = [];
        // Keep quantities low to prioritize smooth 60fps performance and avoid cluttering screen
        const configs = [
            { type: 'petal', count: 18 },
            { type: 'goldDust', count: 35 },
            { type: 'sparkle', count: 12 },
            { type: 'heart', count: 8 },
            { type: 'bokeh', count: 6 }
        ];

        configs.forEach(conf => {
            for (let i = 0; i < conf.count; i++) {
                particles.push(new Particle(conf.type));
            }
        });
    }
    initParticles();

    // Canvas animation loop
    function animateParticles() {
        if (!isAmbientActive) return;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    /*
        ========================================================================
        3. Custom Particle Emitters (Smoke / Crumbs)
        Fired during specific interactions for realism
        ========================================================================
    */
    class CustomEmitterParticle {
        constructor(x, y, color, type) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.type = type; // 'smoke' or 'crumb'
            this.size = this.type === 'smoke' ? Math.random() * 4 + 3 : Math.random() * 3 + 1;
            
            // Random direction vectors
            const angle = Math.random() * Math.PI * 2;
            const speed = this.type === 'smoke' ? Math.random() * 0.6 + 0.2 : Math.random() * 4 + 2;
            
            this.speedX = Math.cos(angle) * speed;
            this.speedY = this.type === 'smoke' ? -(Math.random() * 0.8 + 0.4) : Math.sin(angle) * speed; // smoke rises
            
            this.gravity = this.type === 'crumb' ? 0.25 : 0;
            this.opacity = 1;
            this.life = 1.0;
            this.decay = this.type === 'smoke' ? 0.015 : 0.02;
        }

        update() {
            this.speedY += this.gravity;
            this.x += this.speedX;
            this.y += this.speedY;
            this.life -= this.decay;
            this.opacity = Math.max(0, this.life);
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            
            if (this.type === 'smoke') {
                // Blur effect for smoke puff
                ctx.arc(this.x, this.y, this.size + (1 - this.life) * 8, 0, Math.PI * 2);
            } else {
                // Rectangular crumbs
                ctx.rect(this.x, this.y, this.size, this.size);
            }
            ctx.fill();
            ctx.restore();
        }
    }

    let customParticles = [];
    function spawnEmitter(x, y, color, type, count) {
        for (let i = 0; i < count; i++) {
            customParticles.push(new CustomEmitterParticle(x, y, color, type));
        }
    }

    // Separate updates for custom particles to keep render cycles highly modular
    function animateCustomParticles() {
        customParticles = customParticles.filter(p => {
            p.update();
            p.draw();
            return p.life > 0;
        });
        requestAnimationFrame(animateCustomParticles);
    }
    animateCustomParticles();

    /*
        ========================================================================
        4. Interactive Screen Transitions & Flow
        GSAP timeline orchestrations
        ========================================================================
    */

    // Audio setup trigger on first button click
    function unlockAudio() {
        if (!audioSynthesizer) {
            audioSynthesizer = new AudioEngine();
            audioSynthesizer.startAmbient();
            isMusicPlaying = true;
            musicIconPlaying.classList.remove("hidden");
            musicIconMuted.classList.add("hidden");
            musicLabel.textContent = "Music On";
        }
    }

    // Sound toggle control
    musicToggle.addEventListener("click", () => {
        if (!audioSynthesizer) {
            unlockAudio();
            return;
        }
        
        if (isMusicPlaying) {
            audioSynthesizer.setMute(true);
            isMusicPlaying = false;
            musicIconPlaying.classList.add("hidden");
            musicIconMuted.classList.remove("hidden");
            musicLabel.textContent = "Music Off";
        } else {
            audioSynthesizer.setMute(false);
            isMusicPlaying = true;
            musicIconPlaying.classList.remove("hidden");
            musicIconMuted.classList.add("hidden");
            musicLabel.textContent = "Music On";
        }
    });

    // Password Verification Logic
    function checkPassword() {
        const value = passwordInput.value.trim();
        if (value === "1707") {
            // Correct password
            btnUnlock.disabled = true;
            passwordInput.disabled = true;
            btnUnlock.innerHTML = "<span>Unlocking...</span>";
            
            // Play success sound
            unlockAudio();
            if (audioSynthesizer && isMusicPlaying) {
                audioSynthesizer.playChimes();
            }

            // Card slowly fades out
            gsap.to(glassCard, {
                opacity: 0,
                y: -30,
                scale: 0.95,
                duration: 1.0,
                ease: "power2.inOut",
                onComplete: () => {
                    screenPassword.classList.remove("active");
                }
            });

            // Make landing screen active so galaxy renders, but keep content wrapper hidden
            screenLanding.classList.add("active");
            gsap.set(screenLanding.querySelector(".content-wrapper"), { opacity: 0 });

            // Background slightly zooms
            gsap.fromTo(".galaxy-container", {
                opacity: 0,
                scale: 1.15
            }, {
                opacity: 1,
                scale: 1,
                duration: 1.5,
                ease: "power2.out",
                onComplete: () => {
                    // Smoothly fade in current landing screen text/elements
                    gsap.fromTo(screenLanding.querySelector(".content-wrapper"), {
                        opacity: 0,
                        y: 30
                    }, {
                        opacity: 1,
                        y: 0,
                        duration: 1.2,
                        ease: "power2.out"
                    });
                }
            });
            
        } else {
            // Wrong password: shake card, turn border red, show message
            glassCard.classList.add("shake");
            passwordInput.classList.add("invalid");
            passwordMessage.textContent = "Oops... Try remembering our special day ❤️";
            passwordMessage.classList.add("active");
            
            // Clear wrong input text
            passwordInput.value = "";
            
            // Clean up shake class after animation completes
            setTimeout(() => {
                glassCard.classList.remove("shake");
            }, 400);

            // Clear invalid red border & message after 2 seconds
            setTimeout(() => {
                passwordInput.classList.remove("invalid");
                passwordMessage.classList.remove("active");
            }, 2000);
        }
    }

    // Unlock button listener
    btnUnlock.addEventListener("click", checkPassword);

    // Enter key listener on password input
    passwordInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            checkPassword();
        }
    });

    // Landing Screen -> Countdown Screen Transition
    btnStart.addEventListener("click", () => {
        // Unlock sound
        unlockAudio();
        
        // GSAP fade landing
        gsap.to(screenLanding.querySelector(".content-wrapper"), {
            opacity: 0,
            y: -50,
            scale: 0.95,
            duration: 1.0,
            ease: "power2.inOut",
            onComplete: () => {
                screenLanding.classList.remove("active");
                screenCountdown.classList.add("active");
                
                // GSAP reveal countdown
                gsap.fromTo(screenCountdown.querySelector(".content-wrapper"), {
                    opacity: 0,
                    y: 50,
                    scale: 1.05
                }, {
                    opacity: 1,
                    y: 0,
                    scale: 1.0,
                    duration: 1.0,
                    ease: "power2.out",
                    onComplete: startCountdownSequence
                });
            }
        });
    });

    // Countdown Clock Logic
    function startCountdownSequence() {
        let count = 10;
        countdownNumber.textContent = count;
        
        // Progress ring length is ~534 (2 * pi * 85)
        // Reset ring to full
        ringProgress.style.strokeDashoffset = 0;
        
        const tickInterval = setInterval(() => {
            count--;
            
            // Animate progress ring
            const offset = 534 - (534 * (10 - count) / 10);
            ringProgress.style.strokeDashoffset = offset;
            
            if (count >= 0) {
                // Play soft tick chimes
                if (audioSynthesizer && isMusicPlaying) {
                    audioSynthesizer.playTick();
                }
                
                // Animate number scaling down beautifully
                gsap.fromTo(countdownNumber, {
                    scale: 1.6,
                    opacity: 0.2
                }, {
                    scale: 1,
                    opacity: 1,
                    duration: 0.4,
                    ease: "back.out(1.5)"
                });
                countdownNumber.textContent = count;
                
                // Subtle subtext adjustments to guide focus
                if (count === 7) countdownSubtext.textContent = "Release the tension...";
                if (count === 4) countdownSubtext.textContent = "Almost there...";
                if (count === 1) countdownSubtext.textContent = "Here it comes...";
            }
            
            if (count === 0) {
                clearInterval(tickInterval);
                
                // Flash ring to bright gold
                gsap.to(ringProgress, {
                    stroke: "#FFFFFF",
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1,
                    onComplete: () => {
                        // Dramatic screen shake at 0
                        gsap.to(appContainer, {
                            x: "random(-8, 8)",
                            y: "random(-8, 8)",
                            duration: 0.05,
                            repeat: 12,
                            yoyo: true,
                            onComplete: () => {
                                // Reset position
                                gsap.set(appContainer, { x: 0, y: 0 });
                                
                                // Pause for 0.5 seconds of silence/calm
                                setTimeout(transitionToCelebration, 500);
                            }
                        });
                    }
                });
            }
        }, 1000);
    }

    // Countdown Screen -> Celebration Stage Transition
    function transitionToCelebration() {
        if (audioSynthesizer && isMusicPlaying) {
            audioSynthesizer.playChimes();
        }
        
        gsap.to(screenCountdown.querySelector(".content-wrapper"), {
            opacity: 0,
            scale: 0.9,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => {
                screenCountdown.classList.remove("active");
                screenCelebration.classList.add("active");
                
                // Main entrance animations for the cake stage
                gsap.fromTo(screenCelebration.querySelector(".content-wrapper"), {
                    opacity: 0
                }, {
                    opacity: 1,
                    duration: 1.0
                });
                
                // 3-Layer Cake rises elegantly from the bottom (duration: 2 seconds)
                gsap.fromTo(svgCake, {
                    y: 350,
                    opacity: 0,
                    scale: 0.85
                }, {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 2.2,
                    ease: "power3.out",
                    onComplete: () => {
                        // Activate interactive blow button
                        gsap.fromTo(btnBlow, {
                            y: 20,
                            opacity: 0
                        }, {
                            y: 0,
                            opacity: 1,
                            duration: 0.8,
                            ease: "power2.out"
                        });
                    }
                });
                
                // Title "Happy Birthday" fades up
                gsap.fromTo(birthdayTitle, {
                    y: -30,
                    opacity: 0
                }, {
                    y: 0,
                    opacity: 1,
                    duration: 1.6,
                    delay: 0.5,
                    ease: "power2.out",
                    onStart: () => {
                        birthdayTitle.classList.remove("hidden");
                    }
                });
                
                // Continuous luxurious fireworks & confetti blasts
                triggerMainCelebration();
            }
        });
    }

    // Canvas Confetti wrapper for luxury celebrations
    function triggerMainCelebration() {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 25, spread: 360, ticks: 60, zIndex: 100 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        // Fire occasional confetti bursts for 5 seconds
        confettiInterval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(confettiInterval);
            }

            const particleCount = 40 * (timeLeft / duration);
            
            // Soft White & Gold luxury tones confetti
            confetti(Object.assign({}, defaults, { 
                particleCount, 
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors: ['#D4AF37', '#E8DCC8', '#F8F8F8']
            }));
            confetti(Object.assign({}, defaults, { 
                particleCount, 
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: ['#D4AF37', '#E8DCC8', '#F8F8F8']
            }));
        }, 300);
    }

    // Candle Blowing Logic
    btnBlow.addEventListener("click", () => {
        // Hide button smoothly
        gsap.to(btnBlow, {
            opacity: 0,
            y: 10,
            duration: 0.4,
            onComplete: () => {
                btnBlow.classList.add("hidden");
                
                // Reveal Blow Countdown overlay
                blowCountdown.classList.remove("hidden");
                gsap.fromTo(blowCountdown, { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3 });
                
                let blowCount = 3;
                blowCountdown.textContent = blowCount;
                
                if (audioSynthesizer && isMusicPlaying) audioSynthesizer.playTick();
                
                const blowInterval = setInterval(() => {
                    blowCount--;
                    if (blowCount > 0) {
                        blowCountdown.textContent = blowCount;
                        if (audioSynthesizer && isMusicPlaying) audioSynthesizer.playTick();
                        
                        gsap.fromTo(blowCountdown, { scale: 0.5, opacity: 0.3 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.5)" });
                    } else {
                        clearInterval(blowInterval);
                        
                        // Extinguish flames simultaneously
                        gsap.to(blowCountdown, {
                            scale: 1.5,
                            opacity: 0,
                            duration: 0.4,
                            onComplete: () => {
                                blowCountdown.classList.add("hidden");
                                extinguishCandles();
                            }
                        });
                    }
                }, 1000);
            }
        });
    });

    function extinguishCandles() {
        // Extinguish flames: fade scale to 0
        const flames = document.querySelectorAll(".flame, .flame-inner");
        
        if (audioSynthesizer && isMusicPlaying) {
            audioSynthesizer.playWhoosh();
        }

        gsap.to(flames, {
            scaleY: 0,
            scaleX: 0,
            opacity: 0,
            transformOrigin: "center bottom",
            duration: 0.6,
            stagger: 0.05,
            ease: "power2.inOut",
            onComplete: () => {
                // Generate smoke puff rising from each wick
                const wicks = [
                    { x: 153, y: 48 }, // Candle 1 relative wick coords in SVG space
                    { x: 200, y: 43 }, // Candle 2
                    { x: 247, y: 48 }  // Candle 3
                ];
                
                // Get SVG bounds on screen to calculate correct Canvas coordinate offsets
                const svgRect = svgCake.getBoundingClientRect();
                const scaleX = svgRect.width / 400;
                const scaleY = svgRect.height / 350;
                
                wicks.forEach(w => {
                    const canvasX = svgRect.left + (w.x * scaleX);
                    const canvasY = svgRect.top + (w.y * scaleY);
                    
                    // Spawn dark gold/grey warm smoke particles
                    spawnEmitter(canvasX, canvasY, 'rgba(212, 175, 55, 0.4)', 'smoke', 12);
                });

                // Secondary massive fireworks explosion on blow out
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: ['#D4AF37', '#E8DCC8', '#F8F8F8', '#F4D6D6']
                });

                // Reveal Cake Cutting Button
                btnCut.classList.remove("hidden");
                gsap.fromTo(btnCut, {
                    y: 20,
                    opacity: 0
                }, {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: "power2.out"
                });
            }
        });
    }

    // Cake Slicing Logic
    btnCut.addEventListener("click", () => {
        // Hide button
        gsap.to(btnCut, {
            opacity: 0,
            y: 10,
            duration: 0.4,
            onComplete: () => {
                btnCut.classList.add("hidden");
                
                // SVG Knife enters
                svgKnife.classList.remove("hidden");
                
                // Align knife above cake wicks
                const svgRect = svgCake.getBoundingClientRect();
                const topPointY = svgRect.top;
                const centerPointX = svgRect.left + (svgRect.width / 2);
                
                // Place knife initially at top right
                gsap.set(svgKnife, {
                    x: centerPointX - window.innerWidth / 2 + 100,
                    y: topPointY - window.innerHeight / 2 - 80,
                    rotation: -45,
                    opacity: 0
                });
                
                const tl = gsap.timeline();
                
                // Knife swoops in hovering above the center
                tl.to(svgKnife, {
                    x: centerPointX - window.innerWidth / 2 - 50, // offset blade tip to cake center
                    y: topPointY - window.innerHeight / 2 - 25,
                    rotation: 25,
                    opacity: 1,
                    duration: 0.8,
                    ease: "power2.out"
                });
                
                // Slices down swiftly
                tl.to(svgKnife, {
                    x: centerPointX - window.innerWidth / 2 - 50,
                    y: topPointY - window.innerHeight / 2 + 120,
                    rotation: 0,
                    duration: 0.5,
                    ease: "power2.in",
                    onStart: () => {
                        if (audioSynthesizer && isMusicPlaying) audioSynthesizer.playWhoosh();
                    },
                    onComplete: () => {
                        // Slicing event: split cake, launch crumbs & celebration
                        sliceCakeAction(centerPointX, topPointY + svgRect.height * 0.5);
                    }
                });
                
                // Knife exits smoothly
                tl.to(svgKnife, {
                    x: centerPointX - window.innerWidth / 2 - 180,
                    y: topPointY - window.innerHeight / 2 + 180,
                    rotation: -30,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.out",
                    onComplete: () => {
                        svgKnife.classList.add("hidden");
                        
                        // Transition to Letter after delay
                        setTimeout(transitionToLetter, 2800);
                    }
                });
            }
        });
    });

    function sliceCakeAction(centerX, centerY) {
        // Splitting left/right SVGs
        gsap.to(cakeLeftHalf, {
            x: -20,
            rotation: -2,
            duration: 1.5,
            ease: "power3.out"
        });
        
        gsap.to(cakeRightHalf, {
            x: 20,
            rotation: 2,
            duration: 1.5,
            ease: "power3.out"
        });
        
        // Spawn small beige and white cake crumbs
        spawnEmitter(centerX, centerY, '#E8DCC8', 'crumb', 25);
        spawnEmitter(centerX, centerY - 30, '#FFFFFF', 'crumb', 15);
        
        // Magical chime sounds
        if (audioSynthesizer && isMusicPlaying) audioSynthesizer.playChimes();

        // Massive celebration confetti and fireworks blast
        confetti({
            particleCount: 180,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#D4AF37', '#E8DCC8', '#F8F8F8', '#F4D6D6']
        });
        
        // Intermittent floating flower particles burst via canvas confetti
        let end = Date.now() + (1.5 * 1000);
        (function frame() {
            confetti({
                particleCount: 4,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#F4D6D6', '#E8DCC8']
            });
            confetti({
                particleCount: 4,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#F4D6D6', '#E8DCC8']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }

    // Celebration -> Letter Transition
    function transitionToLetter() {
        gsap.to(screenCelebration.querySelector(".content-wrapper"), {
            opacity: 0,
            scale: 0.95,
            duration: 1.0,
            ease: "power2.inOut",
            onComplete: () => {
                screenCelebration.classList.remove("active");
                screenLetter.classList.add("active");
                
                // Show envelope
                gsap.fromTo(birthdayCard, {
                    opacity: 0,
                    scale: 0.8,
                    rotationX: 45
                }, {
                    opacity: 1,
                    scale: 1,
                    rotationX: 0,
                    duration: 1.2,
                    ease: "back.out(1.2)"
                });
            }
        });
    }

    // Envelope/Card Interaction
    birthdayCard.addEventListener("click", () => {
        if (birthdayCard.classList.contains("open")) return; // Only trigger once
        
        birthdayCard.classList.add("open");
        
        // Start typewriter text after flip completes
        setTimeout(() => {
            startTypewriter();
        }, 1200);
    });

    // Elegant typewriter print logic
    function startTypewriter() {
        const fullMessage = "Here's to celebrating another year of your beautiful journey. You bring warmth, kindness, and light into every single day. May this year ahead be filled with endless laughter, gentle moments, and all the happiness your heart can hold.\n\n[Birthday Message Goes Here]";
        
        let index = 0;
        typewriterText.innerHTML = "";
        
        // Mute ambient sound loop, transition to clean soft melodic loop if desired, 
        // or just let music box keep playing softly
        
        function type() {
            if (index < fullMessage.length) {
                const char = fullMessage[index];
                if (char === "\n") {
                    typewriterText.innerHTML += "<br>";
                } else {
                    typewriterText.innerHTML += char;
                }
                index++;
                
                // Tiny digital keystroke audio tick occasionally for realism (very soft)
                if (index % 3 === 0 && audioSynthesizer && isMusicPlaying) {
                    audioSynthesizer.playTick();
                }
                
                // Calculate responsive delay
                const delay = char === "." || char === "?" || char === "!" ? 400 : 35;
                setTimeout(type, delay);
            } else {
                // Done writing - reveal made with love line
                madeWithLove.classList.remove("hidden");
                gsap.fromTo(madeWithLove, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" });
            }
        }
        
        type();
    }
});
