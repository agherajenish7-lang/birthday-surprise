/*
    ========================================================================
    Interactive Birthday Surprise - Cinematic Logic & Engine
    Contains: Ambient Starfield, Web Audio Synth, Sparkler Physics, 
              3D Page-Flip Envelope Diary, and Flower Bouquet Ending
    ========================================================================
*/

document.addEventListener("DOMContentLoaded", () => {
    // Screen Sections
    const screenPassword = document.getElementById("screen-password");
    const screenLanding = document.getElementById("screen-landing");
    const screenCountdown = document.getElementById("screen-countdown");
    const screenCelebration = document.getElementById("screen-celebration");
    const screenLetter = document.getElementById("screen-letter");
    const screenFinal = document.getElementById("screen-final");
    const appContainer = document.getElementById("app-container");

    // Interactive Buttons
    const btnUnlock = document.getElementById("btn-unlock");
    const btnStart = document.getElementById("btn-start");
    const btnBlow = document.getElementById("btn-blow");
    const btnCut = document.getElementById("btn-cut");
    const btnOpenLetter = document.getElementById("btn-open-letter");
    const btnLastSurprise = document.getElementById("btn-last-surprise");
    const btnReadAgain = document.getElementById("btn-read-again");
    
    // Music Controls
    const musicToggle = document.getElementById("music-toggle");
    const musicIconMuted = musicToggle.querySelector(".music-icon-muted");
    const musicIconPlaying = musicToggle.querySelector(".music-icon-playing");
    const musicLabel = musicToggle.querySelector(".music-label");
    
    // Inputs & Messages
    const passwordInput = document.getElementById("password-input");
    const passwordMessage = document.getElementById("password-message");
    const glassCard = document.querySelector(".glass-card");
    const landingLine1 = document.getElementById("landing-line-1");
    const landingLine2 = document.getElementById("landing-line-2");
    const landingLine3 = document.getElementById("landing-line-3");
    
    // Countdown Elements
    const ringProgress = document.getElementById("ring-progress");
    const countdownNumber = document.getElementById("countdown-number");
    const countdownSubtext = document.getElementById("countdown-subtext");
    
    // Celebration Elements
    const birthdayTitle = document.getElementById("birthday-title");
    const svgKnife = document.getElementById("svg-knife");
    const cakeSplitWrapper = document.getElementById("cake-split-wrapper");
    const blowCountdown = document.getElementById("blow-countdown");
    
    // Letter Elements
    const envelopeScreen = document.getElementById("envelope-screen");
    const diaryContainer = document.getElementById("diary-container");
    const diaryBook = document.getElementById("diary-book");
    const letterSignatures = document.getElementById("letter-signatures");
    
    // Bouquet & Final Screen
    const bouquetContainer = document.querySelector(".flower-bouquet-container");
    const bouquetTitle = document.getElementById("bouquet-title");
    const finalMessageContainer = document.getElementById("final-message-container");

    // Audio & State Flags
    let isMusicPlaying = false;
    let audioSynthesizer = null;
    let confettiInterval = null;
    let currentPageIdx = 0;
    let bouquetTriggered = false;

    // Fade in password card on load
    gsap.fromTo(glassCard, {
        opacity: 0,
        y: 40,
        scale: 0.95
    }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.2,
        ease: "power3.out"
    });

    /*
        ========================================================================
        1. Web Audio API Ambient Synthesizer
        Plays mellow chord backdrop and music box Happy Birthday melody at 20% vol
        ========================================================================
    */
    class AudioEngine {
        constructor() {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.mainGain = this.ctx.createGain();
            this.mainGain.gain.value = 0.0; // Starts muted, fades to 20%
            this.mainGain.connect(this.ctx.destination);
            
            this.melodyPlaying = false;
            this.melodyScheduleId = null;
            this.noteIndex = 0;
            
            // Soft Happy Birthday melody notes
            this.happyBirthdayMelody = [
                ['C4', 0.5], ['C4', 0.5], ['D4', 1.0], ['C4', 1.0], ['F4', 1.0], ['E4', 2.0],
                ['C4', 0.5], ['C4', 0.5], ['D4', 1.0], ['C4', 1.0], ['G4', 1.0], ['F4', 2.0],
                ['C4', 0.5], ['C4', 0.5], ['C5', 1.0], ['A4', 1.0], ['F4', 1.0], ['E4', 1.0], ['D4', 2.0],
                ['Bb4', 0.5], ['Bb4', 0.5], ['A4', 1.0], ['F4', 1.0], ['G4', 1.0], ['F4', 2.5]
            ];
            
            this.ambientChords = [
                ['F3', 'A3', 'C4', 'E4'],
                ['C3', 'G3', 'C4', 'E4'],
                ['Bb2', 'F3', 'Bb3', 'D4'],
                ['F3', 'A3', 'C4', 'E4']
            ];
            this.chordIndex = 0;
        }

        getFrequency(note) {
            const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            const octave = parseInt(note.slice(-1));
            const key = note.slice(0, -1);
            const keyNumber = notes.indexOf(key);
            const relativeKey = keyNumber + (octave - 4) * 12 - 9;
            return 440 * Math.pow(2, relativeKey / 12);
        }

        startAmbient() {
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            
            this.mainGain.gain.setValueAtTime(0, this.ctx.currentTime);
            this.mainGain.gain.linearRampToValueAtTime(0.20, this.ctx.currentTime + 2.5);
            
            this.melodyPlaying = true;
            this.playNextPad();
            
            setTimeout(() => {
                this.playMelodyStep();
            }, 1000);
        }

        playNextPad() {
            if (!this.melodyPlaying) return;
            const chord = this.ambientChords[this.chordIndex];
            const now = this.ctx.currentTime;
            
            chord.forEach(note => {
                const osc = this.ctx.createOscillator();
                const filter = this.ctx.createBiquadFilter();
                const gain = this.ctx.createGain();
                
                osc.type = 'triangle';
                osc.frequency.value = this.getFrequency(note);
                
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(220, now);
                filter.frequency.exponentialRampToValueAtTime(400, now + 4.0);
                
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.03, now + 2.0);
                gain.gain.linearRampToValueAtTime(0, now + 7.5);
                
                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.mainGain);
                
                osc.start(now);
                osc.stop(now + 8.0);
            });
            
            this.chordIndex = (this.chordIndex + 1) % this.ambientChords.length;
            this.padTimeout = setTimeout(() => this.playNextPad(), 7500);
        }

        playNote(frequency, duration) {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(frequency, now);
            
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(frequency * 2, now);
            
            filter.type = 'lowpass';
            filter.frequency.value = 750;
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
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

        playMelodyStep() {
            if (!this.melodyPlaying) return;
            const currentNote = this.happyBirthdayMelody[this.noteIndex];
            const freq = this.getFrequency(currentNote[0]);
            const duration = currentNote[1];
            
            this.playNote(freq, duration);
            this.noteIndex = (this.noteIndex + 1) % this.happyBirthdayMelody.length;
            
            const delay = duration * 850;
            this.melodyTimeout = setTimeout(() => this.playMelodyStep(), delay);
        }

        playTick() {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.05);
            
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now);
            osc.stop(now + 0.1);
        }

        playChimes() {
            const now = this.ctx.currentTime;
            const frequencies = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
            
            frequencies.forEach((freq, idx) => {
                setTimeout(() => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    
                    osc.type = 'triangle';
                    osc.frequency.value = freq;
                    
                    gain.gain.setValueAtTime(0, this.ctx.currentTime);
                    gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
                    
                    osc.connect(gain);
                    gain.connect(this.mainGain);
                    
                    osc.start();
                    osc.stop(this.ctx.currentTime + 1.0);
                }, idx * 100);
            });
        }

        playWhoosh() {
            const bufferSize = this.ctx.sampleRate * 0.5;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            
            const noiseNode = this.ctx.createBufferSource();
            noiseNode.buffer = buffer;
            
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.5);
            
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
            
            noiseNode.connect(filter);
            filter.connect(gain);
            gain.connect(this.mainGain);
            
            noiseNode.start();
            noiseNode.stop(this.ctx.currentTime + 0.5);
        }

        setMute(isMuted) {
            if (isMuted) {
                this.mainGain.gain.setValueAtTime(this.mainGain.gain.value, this.ctx.currentTime);
                this.mainGain.gain.linearRampToValueAtTime(0.0, this.ctx.currentTime + 0.5);
            } else {
                if (this.ctx.state === 'suspended') {
                    this.ctx.resume();
                }
                this.mainGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
                this.mainGain.gain.linearRampToValueAtTime(0.20, this.ctx.currentTime + 0.5);
            }
        }
    }

    /*
        ========================================================================
        2. Ambient Canvas Starfield Engine
        Renders stars, floating hearts, sparkles, and clouds behind pages
        ========================================================================
    */
    const canvas = document.getElementById("ambient-canvas");
    const ctx = canvas.getContext("2d");
    let particles = [];
    let canvasWidth = 0;
    let canvasHeight = 0;

    function resizeCanvas() {
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    class StarfieldParticle {
        constructor(type) {
            this.type = type;
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * canvasWidth;
            this.y = initial ? Math.random() * canvasHeight : (this.type === 'heart' ? canvasHeight + 20 : -20);
            
            this.size = 0;
            this.speedX = 0;
            this.speedY = 0;
            this.opacity = 0;
            this.maxOpacity = 0;
            this.rotation = 0;
            
            switch(this.type) {
                case 'star':
                    this.size = Math.random() * 0.8 + 0.4;
                    this.speedX = Math.random() * 0.02 + 0.01;
                    this.speedY = Math.random() * 0.01 + 0.005;
                    this.maxOpacity = Math.random() * 0.5 + 0.2;
                    this.opacity = initial ? Math.random() * this.maxOpacity : 0;
                    this.twinkleSpeed = Math.random() * 0.03 + 0.01;
                    this.twinklePhase = Math.random() * Math.PI * 2;
                    break;
                case 'heart':
                    this.size = Math.random() * 6 + 4;
                    this.speedX = Math.random() * 0.15 - 0.075;
                    this.speedY = -(Math.random() * 0.15 + 0.08);
                    this.maxOpacity = Math.random() * 0.25 + 0.1;
                    this.opacity = initial ? Math.random() * this.maxOpacity : 0;
                    this.rotation = Math.random() * 0.2 - 0.1;
                    break;
                case 'sparkle':
                    this.size = Math.random() * 5 + 3;
                    this.speedX = Math.random() * 0.04 - 0.02;
                    this.speedY = Math.random() * 0.04 + 0.02;
                    this.maxOpacity = Math.random() * 0.6 + 0.1;
                    this.opacity = initial ? Math.random() * this.maxOpacity : 0;
                    this.sparkleSpeed = Math.random() * 0.05 + 0.02;
                    this.sparklePhase = Math.random() * Math.PI * 2;
                    break;
                case 'cloud':
                    this.size = Math.random() * 80 + 60;
                    this.speedX = Math.random() * 0.02 - 0.01;
                    this.speedY = Math.random() * 0.02 - 0.01;
                    this.maxOpacity = Math.random() * 0.03 + 0.01;
                    this.opacity = initial ? Math.random() * this.maxOpacity : 0;
                    break;
            }
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.y > -100 && this.y < canvasHeight + 100 && this.x > -100 && this.x < canvasWidth + 100) {
                if (this.opacity < this.maxOpacity) {
                    this.opacity += 0.005;
                }
            } else {
                this.reset();
            }

            if (this.type === 'star') {
                this.twinklePhase += this.twinkleSpeed;
                this.opacity = this.maxOpacity * (0.3 + Math.abs(Math.sin(this.twinklePhase)) * 0.7);
            }
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.translate(this.x, this.y);

            if (this.type === 'star') {
                ctx.fillStyle = '#F8F8F8';
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();
            } 
            else if (this.type === 'heart') {
                ctx.rotate(this.rotation);
                ctx.fillStyle = 'rgba(244, 214, 214, 0.6)';
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(-this.size/2, -this.size/2, -this.size, -this.size/4, 0, this.size * 0.8);
                ctx.bezierCurveTo(this.size, -this.size/4, this.size/2, -this.size/2, 0, 0);
                ctx.closePath();
                ctx.fill();
            } 
            else if (this.type === 'sparkle') {
                ctx.fillStyle = '#D4AF37';
                ctx.beginPath();
                ctx.moveTo(0, -this.size);
                ctx.quadraticCurveTo(0, 0, this.size, 0);
                ctx.quadraticCurveTo(0, 0, 0, this.size);
                ctx.quadraticCurveTo(0, 0, -this.size, 0);
                ctx.quadraticCurveTo(0, 0, 0, -this.size);
                ctx.closePath();
                ctx.fill();
            }
            else if (this.type === 'cloud') {
                const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
                grad.addColorStop(0, 'rgba(232, 220, 200, 0.35)');
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

    function initStarfield() {
        particles = [];
        const configs = [
            { type: 'star', count: 50 },
            { type: 'heart', count: 6 },
            { type: 'sparkle', count: 8 },
            { type: 'cloud', count: 4 }
        ];

        configs.forEach(conf => {
            for (let i = 0; i < conf.count; i++) {
                particles.push(new StarfieldParticle(conf.type));
            }
        });
    }
    initStarfield();

    function animateStarfield() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateStarfield);
    }
    animateStarfield();

    /*
        ========================================================================
        3. Sparkler Physics Engine (Canvas Overlay on Cake)
        Coordinates adjusted to match wicks in the uploaded PNG precisely
        ========================================================================
    */
    const sparklerCanvas = document.getElementById("sparkler-canvas");
    const sCtx = sparklerCanvas.getContext("2d");
    let sparklerParticles = [];
    let sparklerRate = 3.2;
    let sparklersActive = false;

    function resizeSparklerCanvas() {
        const bounds = sparklerCanvas.parentElement.getBoundingClientRect();
        sparklerCanvas.width = bounds.width;
        sparklerCanvas.height = bounds.height;
    }
    window.addEventListener("resize", resizeSparklerCanvas);

    class SparkParticle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            
            const angle = Math.random() * Math.PI - Math.PI;
            const force = Math.random() * 2.8 + 1.2;
            
            this.speedX = Math.cos(angle) * force;
            this.speedY = Math.sin(angle) * force - 0.5;
            this.gravity = 0.08;
            this.opacity = 1.0;
            this.life = 1.0;
            this.decay = Math.random() * 0.02 + 0.015;
            this.color = Math.random() < 0.3 ? '#FFFFFF' : (Math.random() < 0.5 ? '#F3E5AB' : '#D4AF37');
        }

        update() {
            this.speedY += this.gravity;
            this.x += this.speedX;
            this.y += this.speedY;
            this.life -= this.decay;
            this.opacity = Math.max(0, this.life);
        }

        draw() {
            sCtx.save();
            sCtx.globalAlpha = this.opacity;
            sCtx.strokeStyle = this.color;
            sCtx.lineWidth = Math.random() * 1.5 + 0.5;
            
            sCtx.beginPath();
            sCtx.moveTo(this.x, this.y);
            sCtx.lineTo(this.x - this.speedX * 1.5, this.y - this.speedY * 1.5);
            sCtx.stroke();
            sCtx.restore();
        }
    }

    function getWickCoordinates() {
        const width = sparklerCanvas.width;
        const height = sparklerCanvas.height;
        return [
            { x: width * 0.38, y: height * 0.30 },
            { x: width * 0.50, y: height * 0.22 },
            { x: width * 0.62, y: height * 0.30 }
        ];
    }

    function animateSparklers() {
        if (!sparklersActive && sparklerParticles.length === 0) {
            sCtx.clearRect(0, 0, sparklerCanvas.width, sparklerCanvas.height);
            return;
        }
        
        sCtx.clearRect(0, 0, sparklerCanvas.width, sparklerCanvas.height);
        
        if (sparklersActive && sparklerRate > 0.01) {
            const wicks = getWickCoordinates();
            wicks.forEach(w => {
                for (let i = 0; i < Math.floor(sparklerRate); i++) {
                    sparklerParticles.push(new SparkParticle(w.x, w.y));
                }
                if (Math.random() < (sparklerRate % 1)) {
                    sparklerParticles.push(new SparkParticle(w.x, w.y));
                }
            });
        }
        
        sparklerParticles = sparklerParticles.filter(p => {
            p.update();
            p.draw();
            return p.life > 0;
        });
        
        requestAnimationFrame(animateSparklers);
    }

    /*
        ========================================================================
        4. Interactive Screen Flow & Triggers
        ========================================================================
    */

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

    // Password verification logic
    function checkPassword() {
        const val = passwordInput.value.trim();
        if (val === "1707") {
            btnUnlock.disabled = true;
            passwordInput.disabled = true;
            btnUnlock.innerHTML = "<span>Unlocking...</span>";
            
            gsap.to(glassCard, {
                opacity: 0,
                y: -30,
                scale: 0.95,
                duration: 1.0,
                ease: "power2.inOut",
                onComplete: () => {
                    screenPassword.classList.remove("active");
                    startLandingTransitions();
                }
            });

            screenLanding.classList.add("active");
        } else {
            glassCard.classList.add("shake");
            passwordInput.classList.add("invalid");
            passwordMessage.textContent = "Oops... Try remembering our special day ❤️";
            passwordMessage.classList.add("active");
            
            passwordInput.value = "";
            setTimeout(() => {
                glassCard.classList.remove("shake");
            }, 400);
            setTimeout(() => {
                passwordInput.classList.remove("invalid");
                passwordMessage.classList.remove("active");
            }, 2000);
        }
    }

    btnUnlock.addEventListener("click", checkPassword);
    passwordInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") checkPassword();
    });

    // Landing lines staggering
    function startLandingTransitions() {
        const delay = 1600;
        
        setTimeout(() => {
            landingLine1.classList.remove("hidden-line");
            landingLine1.classList.add("reveal-line");
        }, 100);
        
        setTimeout(() => {
            landingLine2.classList.remove("hidden-line");
            landingLine2.classList.add("reveal-line");
        }, 100 + delay);
        
        setTimeout(() => {
            landingLine3.classList.remove("hidden-line");
            landingLine3.classList.add("reveal-line");
            
            setTimeout(() => {
                btnStart.classList.remove("hidden");
                gsap.fromTo(btnStart, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.5)" });
            }, 1000);
        }, 100 + delay * 2);
    }

    btnStart.addEventListener("click", () => {
        unlockAudio();
        
        gsap.to(screenLanding.querySelector(".content-wrapper"), {
            opacity: 0,
            y: -50,
            scale: 0.95,
            duration: 1.0,
            ease: "power2.inOut",
            onComplete: () => {
                screenLanding.classList.remove("active");
                screenCountdown.classList.add("active");
                
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

    function startCountdownSequence() {
        let count = 10;
        countdownNumber.textContent = count;
        ringProgress.style.strokeDashoffset = 0;
        
        const tickInterval = setInterval(() => {
            count--;
            const offset = 534 - (534 * (10 - count) / 10);
            ringProgress.style.strokeDashoffset = offset;
            
            if (count >= 0) {
                if (audioSynthesizer && isMusicPlaying) {
                    audioSynthesizer.playTick();
                }
                
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
                
                if (count === 7) countdownSubtext.textContent = "Release the tension...";
                if (count === 4) countdownSubtext.textContent = "Almost there...";
                if (count === 1) countdownSubtext.textContent = "Prepare yourself...";
            }
            
            if (count === 0) {
                clearInterval(tickInterval);
                
                gsap.to(ringProgress, {
                    stroke: "#FFFFFF",
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1,
                    onComplete: () => {
                        gsap.to(appContainer, {
                            x: "random(-6, 6)",
                            y: "random(-6, 6)",
                            duration: 0.05,
                            repeat: 10,
                            yoyo: true,
                            onComplete: () => {
                                gsap.set(appContainer, { x: 0, y: 0 });
                                setTimeout(transitionToCelebration, 500);
                            }
                        });
                    }
                });
            }
        }, 1000);
    }

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
                resizeSparklerCanvas();
                
                gsap.fromTo(screenCelebration.querySelector(".content-wrapper"), {
                    opacity: 0
                }, {
                    opacity: 1,
                    duration: 1.0
                });
                
                // Slow Rise of cake PNG
                gsap.fromTo(cakeSplitWrapper, {
                    y: 320,
                    opacity: 0,
                    scale: 0.85
                }, {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 2.2,
                    ease: "power3.out",
                    onComplete: () => {
                        sparklersActive = true;
                        animateSparklers();
                        
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
                
                birthdayTitle.classList.remove("hidden");
                gsap.fromTo(birthdayTitle, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.6, ease: "power2.out", delay: 0.5 });
                
                triggerGoldCelebration();
            }
        });
    }

    function triggerGoldCelebration() {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 25, spread: 360, ticks: 60, zIndex: 100 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        confettiInterval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(confettiInterval);

            const count = 35 * (timeLeft / duration);
            const colors = ['#D4AF37', '#FFF', '#E8DCC8', '#F3E5AB'];
            confetti(Object.assign({}, defaults, { 
                particleCount: count, 
                origin: { x: randomInRange(0.15, 0.3), y: Math.random() - 0.2 },
                colors
            }));
            confetti(Object.assign({}, defaults, { 
                particleCount: count, 
                origin: { x: randomInRange(0.7, 0.85), y: Math.random() - 0.2 },
                colors
            }));
        }, 300);
    }

    btnBlow.addEventListener("click", () => {
        gsap.to(btnBlow, {
            opacity: 0,
            y: 10,
            duration: 0.4,
            onComplete: () => {
                btnBlow.classList.add("hidden");
                
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
                        gsap.to(blowCountdown, {
                            scale: 1.5,
                            opacity: 0,
                            duration: 0.4,
                            onComplete: () => {
                                blowCountdown.classList.add("hidden");
                                stopSparklersAction();
                            }
                        });
                    }
                }, 1000);
            }
        });
    });

    function stopSparklersAction() {
        if (audioSynthesizer && isMusicPlaying) {
            audioSynthesizer.playWhoosh();
        }

        gsap.to({ rate: sparklerRate }, {
            rate: 0,
            duration: 1.5,
            onUpdate: function() {
                sparklerRate = this.targets()[0].rate;
            },
            onComplete: () => {
                sparklersActive = false;
                sparklerParticles = [];
                sCtx.clearRect(0, 0, sparklerCanvas.width, sparklerCanvas.height);
                
                const wicks = getWickCoordinates();
                wicks.forEach(w => {
                    spawnEmitter(w.x, w.y, 'rgba(212, 175, 55, 0.3)', 'smoke', 8);
                });

                confetti({
                    particleCount: 120,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#D4AF37', '#FFF', '#E8DCC8', '#F3E5AB']
                });

                btnCut.classList.remove("hidden");
                gsap.fromTo(btnCut, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" });
            }
        });
    }

    btnCut.addEventListener("click", () => {
        gsap.to(btnCut, {
            opacity: 0,
            y: 10,
            duration: 0.4,
            onComplete: () => {
                btnCut.classList.add("hidden");
                svgKnife.classList.remove("hidden");
                
                const bounds = cakeSplitWrapper.getBoundingClientRect();
                const centerPointX = bounds.left + (bounds.width / 2);
                const topPointY = bounds.top;
                
                gsap.set(svgKnife, {
                    x: centerPointX - window.innerWidth / 2 + 100,
                    y: topPointY - window.innerHeight / 2 - 80,
                    rotation: -45,
                    opacity: 0
                });
                
                const tl = gsap.timeline();
                tl.to(svgKnife, {
                    x: centerPointX - window.innerWidth / 2 - 50,
                    y: topPointY - window.innerHeight / 2 - 25,
                    rotation: 25,
                    opacity: 1,
                    duration: 0.8,
                    ease: "power2.out"
                });
                
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
                        cakeSplitWrapper.classList.add("cake-split");
                        spawnEmitter(centerPointX, topPointY + bounds.height * 0.5, '#FAF5EE', 'crumb', 25);
                        
                        if (audioSynthesizer && isMusicPlaying) audioSynthesizer.playChimes();

                        confetti({
                            particleCount: 100,
                            spread: 60,
                            origin: { y: 0.55 },
                            colors: ['#D4AF37', '#FFF', '#E8DCC8', '#F4D6D6']
                        });
                    }
                });
                
                tl.to(svgKnife, {
                    x: centerPointX - window.innerWidth / 2 - 180,
                    y: topPointY - window.innerHeight / 2 + 180,
                    rotation: -30,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.out",
                    onComplete: () => {
                        svgKnife.classList.add("hidden");
                        setTimeout(transitionToLetter, 2500);
                    }
                });
            }
        });
    });

    function transitionToLetter() {
        gsap.to(screenCelebration.querySelector(".content-wrapper"), {
            opacity: 0,
            scale: 0.95,
            duration: 1.0,
            ease: "power2.inOut",
            onComplete: () => {
                screenCelebration.classList.remove("active");
                screenLetter.classList.add("active");
                
                // Show envelope screen and prep card layouts
                envelopeScreen.classList.remove("hidden");
                diaryContainer.classList.add("hidden");
                
                gsap.fromTo(envelopeScreen, {
                    opacity: 0,
                    scale: 0.8
                }, {
                    opacity: 1,
                    scale: 1,
                    duration: 1.2,
                    ease: "back.out(1.2)"
                });
            }
        });
    }

    /*
        ========================================================================
        5. Lined Paper Handwritten Text formatting
        ========================================================================
    */
    const BIRTHDAY_LETTER_PAGES = [
        `First of all...
A huge shoutout to uncle and aunty... because if they hadn't decided to bring you into this world, I would've missed out on having the brain-on-power-saving-mode best friend ever. 😂

Seriously though...
What are the odds?

One common friend...
One random meeting...
A few conversations...`,

        `And somehow... I ended up with a lifetime subscription to your nonsense.

I'd say that's one of the best deals I've ever got. 😌😂

After that, we slowly started talking more and more. One day, you shared the problems you were going through in your life. You were completely broken from the inside, and honestly, it hurt me to see you like that. But from that point on, your bad days slowly started coming to an end... and then you found your "Diamond." (Me) 😅`,

        `After that, our friendship became much stronger—something I never expected would happen.

And bro... that prank 😂 For a moment, I genuinely thought, "That's it... I've lost this friendship." 😅 But somehow, I managed to convince you, and everything became normal again. 🧿`,

        `Then came the funniest part—you proposed to me four different times, and I rejected you every single time. 🤣 At one point, I actually felt like I was setting some world record. Bro, how do you even get rejected by the same person four times without feeling embarrassed? 😭😂 (I know it was all just for fun.)

But lately, I've noticed someone who's become so disciplined and dedicated to her work... when it comes to regularly eating ice cream, waffles, cheese dahi puri, and your daily 10 o'clock tatty schedule. 😭😂 Bro, there are other things to do in life too!`,

        `────────────

Happy Birthday to the girl who makes ordinary days feel special!

Your hair falls like poetry that no one ever wrote,
Your smile is the kind of magic that keeps hearts afloat.
And that nose of yours? Slightly extra, I won't lie,
But even that adds character—no need to ask why!`,

        `Jokes aside, in just 8–9 months, you've become one of the realest people in my life. It's rare to find someone who fits so naturally into your world, but you did—and honestly, I'm grateful for that every single day.

As you step into this new year, I truly wish that your career reaches heights you've always dreamed of, that every bit of hard work you put in comes back to you tenfold, and that you continue becoming the confident, unstoppable woman you're already growing into.`,

        `One more thing—always choose yourself first. Not everyone who smiles at you has good intentions, so trust people wisely and keep your circle small but genuine. People will come and go. Never let anyone dim the light you carry.

Live this one life to the fullest. Travel to new places, eat your favorite food, make unforgettable memories, and laugh until your stomach hurts. You deserve every bit of happiness that comes your way.

Happy Birthday, Himani. Keep shining brighter with every passing year. 🎂💛`
    ];

    // Word formatter to inject subtle organic human writing imperfections
    function formatHandwrittenText(text) {
        const lines = text.split("\n");
        let html = "";
        
        lines.forEach((line, lineIdx) => {
            const words = line.split(" ");
            words.forEach((word, wordIdx) => {
                if (word === "") return;
                
                // Random organic imperfections per word
                const rotation = (Math.random() * 2.4 - 1.2).toFixed(1); // slant
                const opacity = (Math.random() * 0.12 + 0.88).toFixed(2); // ink pressure
                const vShift = (Math.random() * 1.4 - 0.7).toFixed(1); // baseline deviation
                const spacing = (Math.random() * 0.4).toFixed(1); // positive letter spacing to prevent compression
                
                html += `<span class="handwritten-word" style="transform: rotate(${rotation}deg) translateY(${vShift}px); opacity: ${opacity}; letter-spacing: ${spacing}px; margin-right: 8px;">${word}</span>`;
            });
            if (lineIdx < lines.length - 1) {
                html += "<br>";
            }
        });
        return html;
    }

    function preRenderAllLetterPages() {
        for (let i = 0; i < BIRTHDAY_LETTER_PAGES.length; i++) {
            const container = document.getElementById(`typewriter-text-${i + 1}`);
            if (container) {
                container.innerHTML = formatHandwrittenText(BIRTHDAY_LETTER_PAGES[i]);
            }
        }
    }

    // Pre-populate page handwritten text on load so they are immediately formatted
    preRenderAllLetterPages();

    /*
        ========================================================================
        Envelope open and 3D page flip navigation triggers
        ========================================================================
    */
    btnOpenLetter.addEventListener("click", () => {
        btnOpenLetter.disabled = true;
        
        const envelope = document.getElementById("envelope");
        const flap = document.getElementById("envelope-flap");
        const seal = document.getElementById("wax-seal");
        
        if (audioSynthesizer && isMusicPlaying) {
            audioSynthesizer.playTick();
        }

        // Cinematic zoom timeline
        const tl = gsap.timeline({
            onComplete: () => {
                envelopeScreen.classList.add("hidden");
                diaryContainer.classList.remove("hidden");
                gsap.set(diaryContainer, { opacity: 1 });
                
                // Show first page
                showPage(0, 'next');
            }
        });

        // Zoom Camera
        tl.to(envelopeScreen, {
            scale: 1.3,
            y: -50,
            duration: 1.2,
            ease: "power2.inOut"
        });

        // Wax seal splits
        tl.to(seal, {
            scale: 0.6,
            opacity: 0,
            duration: 0.5,
            ease: "power2.in"
        }, "-=0.6");

        // Flap opens
        tl.to(flap, {
            rotateX: 180,
            duration: 0.8,
            ease: "power2.inOut"
        }, "-=0.2");

        // Envelope slides down out of screen
        tl.to(envelope, {
            y: 180,
            opacity: 0,
            duration: 0.8,
            ease: "power2.in"
        }, "-=0.4");
    });

    function showPage(idx, direction = 'next') {
        const pages = document.querySelectorAll(".diary-page");
        const pageIndicator = document.getElementById("page-indicator");
        
        if (idx < 0 || idx >= pages.length) return;
        
        const prevActive = document.querySelector(".diary-page.active");
        const targetPage = pages[idx];
        
        if (prevActive) {
            prevActive.classList.remove("active");
            if (direction === 'next') {
                // Flip page turn curl animation (left flap)
                gsap.to(prevActive, {
                    rotateY: -110,
                    skewY: 10,
                    scaleX: 0.9,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power1.inOut"
                });
            } else {
                // Flip page back animation
                gsap.to(prevActive, {
                    rotateY: 20,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power1.inOut"
                });
            }
        }
        
        targetPage.classList.add("active");
        
        if (audioSynthesizer && isMusicPlaying) {
            audioSynthesizer.playWhoosh();
        }

        if (direction === 'next') {
            gsap.fromTo(targetPage, {
                rotateY: 20,
                opacity: 0
            }, {
                rotateY: 0,
                skewY: 0,
                scaleX: 1,
                opacity: 1,
                duration: 0.8,
                ease: "power1.out"
            });
        } else {
            gsap.fromTo(targetPage, {
                rotateY: -110,
                skewY: 10,
                scaleX: 0.9,
                opacity: 0
            }, {
                rotateY: 0,
                skewY: 0,
                scaleX: 1,
                opacity: 1,
                duration: 0.8,
                ease: "power1.out",
                transformOrigin: "left center"
            });
        }
        
        currentPageIdx = idx;
        pageIndicator.textContent = `${currentPageIdx + 1} / 7`;
        
        // Navigation button disabling bounds
        document.getElementById("btn-prev-page").disabled = (currentPageIdx === 0);
        document.getElementById("btn-next-page").disabled = false; // Keep enabled to allow final surprise transition
    }

    // Nav click handlers
    document.getElementById("btn-prev-page").addEventListener("click", () => {
        if (currentPageIdx > 0) showPage(currentPageIdx - 1, 'prev');
    });
    
    document.getElementById("btn-next-page").addEventListener("click", () => {
        if (currentPageIdx < BIRTHDAY_LETTER_PAGES.length - 1) {
            showPage(currentPageIdx + 1, 'next');
        } else {
            triggerLastSurprise();
        }
    });

    // Keyboard bindings
    document.addEventListener("keydown", (e) => {
        if (!screenLetter.classList.contains("active") || diaryContainer.classList.contains("hidden")) return;
        if (e.key === "ArrowLeft" && currentPageIdx > 0) {
            showPage(currentPageIdx - 1, 'prev');
        } else if (e.key === "ArrowRight") {
            if (currentPageIdx < BIRTHDAY_LETTER_PAGES.length - 1) {
                showPage(currentPageIdx + 1, 'next');
            } else {
                triggerLastSurprise();
            }
        }
    });

    // Mobile Swipe detection on Book Container
    let touchStartX = 0;
    let touchEndX = 0;
    
    diaryBook.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    diaryBook.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const threshold = 55;
        if (touchStartX - touchEndX > threshold) {
            // Swipe Left -> Next
            if (currentPageIdx < BIRTHDAY_LETTER_PAGES.length - 1) {
                showPage(currentPageIdx + 1, 'next');
            } else {
                triggerLastSurprise();
            }
        } else if (touchEndX - touchStartX > threshold && currentPageIdx > 0) {
            // Swipe Right -> Previous
            showPage(currentPageIdx - 1, 'prev');
        }
    }

    // Last Surprise closing sequence
    function triggerLastSurprise() {
        btnLastSurprise.disabled = true;
        document.getElementById("btn-next-page").disabled = true;
        
        const envelope = document.getElementById("envelope");
        const flap = document.getElementById("envelope-flap");
        const seal = document.getElementById("wax-seal");
        
        if (audioSynthesizer && isMusicPlaying) {
            audioSynthesizer.playWhoosh();
        }

        const tl = gsap.timeline({
            onComplete: () => {
                screenLetter.classList.remove("active");
                screenFinal.classList.add("active");
                startFinalScreenSequence();
            }
        });

        // Diary closes
        tl.to(diaryContainer, {
            opacity: 0,
            scale: 0.9,
            duration: 0.6,
            ease: "power2.in",
            onComplete: () => {
                diaryContainer.classList.add("hidden");
                envelopeScreen.classList.remove("hidden");
                gsap.set(envelopeScreen, { scale: 1.3, y: -50, opacity: 1 });
                gsap.set(envelope, { opacity: 1, y: 180 });
            }
        });

        // Zoom out camera
        tl.to(envelopeScreen, {
            scale: 1.0,
            y: 0,
            duration: 1.0,
            ease: "power2.inOut"
        });

        // Envelope rises back
        tl.to(envelope, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out"
        }, "-=0.8");

        // Flap closes
        tl.to(flap, {
            rotateX: 0,
            duration: 0.8,
            ease: "power2.inOut"
        }, "-=0.4");

        // Wax seal snaps back
        tl.to(seal, {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out"
        }, "-=0.2");

        // Pause 1 second before bouquet rises
        tl.to({}, { duration: 1.0 });
    }

    btnLastSurprise.addEventListener("click", triggerLastSurprise);

    /*
        ========================================================================
        6. Flower Bouquet Ending & Final Screen
        ========================================================================
    */
    function startFinalScreenSequence() {
        bouquetTriggered = false;
        
        // Hide elements initially
        bouquetContainer.classList.remove("reveal-bouquet");
        bouquetTitle.classList.add("hidden");
        finalMessageContainer.classList.add("hidden");
        document.getElementById("replay-btn-container").classList.add("hidden");
        
        // 1. Bouquet slowly reveals (rises from bottom)
        setTimeout(() => {
            bouquetContainer.classList.add("reveal-bouquet");
            triggerBouquetParticles();
        }, 100);

        // 2. Display "Just For You" title (changed to "For You" in HTML)
        setTimeout(() => {
            bouquetTitle.classList.remove("hidden");
            gsap.fromTo(bouquetTitle, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 1.5 });
        }, 1500);

        // 3. Display Final Birthday message
        setTimeout(() => {
            finalMessageContainer.classList.remove("hidden");
            gsap.fromTo(finalMessageContainer, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 2.0 });
        }, 3500);

        // 4. Wait 2 seconds, trigger sparkles and show Read Again button
        setTimeout(() => {
            triggerEndSparkles();

            // Reveal Read Again button
            setTimeout(() => {
                const replay = document.getElementById("replay-btn-container");
                replay.classList.remove("hidden");
                gsap.fromTo(replay, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1.2 });
            }, 1800);
        }, 5500); // 3500 (heading fade) + 2000 (2s wait)
    }

    function triggerBouquetParticles() {
        if (bouquetTriggered) return;
        
        setInterval(() => {
            const bounds = bouquetContainer.getBoundingClientRect();
            if (!bounds.width) return;
            
            const x = bounds.left + (bounds.width / 2) + (Math.random() * 80 - 40);
            const y = bounds.top + (bounds.height / 2) + (Math.random() * 40 - 20);
            
            // Add custom rising hearts/petals
            const heart = new StarfieldParticle('heart');
            heart.x = x;
            heart.y = y;
            heart.maxOpacity = Math.random() * 0.4 + 0.2;
            heart.speedY = -(Math.random() * 0.4 + 0.15);
            particles.push(heart);
            
            if (Math.random() < 0.3) {
                const sparkle = new StarfieldParticle('sparkle');
                sparkle.x = x + (Math.random() * 100 - 50);
                sparkle.y = y + (Math.random() * 60 - 30);
                particles.push(sparkle);
            }
        }, 800);
        
        bouquetTriggered = true;
    }

    function triggerEndSparkles() {
        const colors = ['#FFD89B', '#FFF', '#E8DCC8', '#F4D6D6'];
        setInterval(() => {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.8 },
                colors
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.8 },
                colors
            });
        }, 1500);
    }

    // Replay logic
    btnReadAgain.addEventListener("click", () => {
        screenFinal.classList.remove("active");
        screenLetter.classList.add("active");
        
        envelopeScreen.classList.remove("hidden");
        diaryContainer.classList.add("hidden");
        
        // Reset envelope states
        const envelope = document.getElementById("envelope");
        const flap = document.getElementById("envelope-flap");
        const seal = document.getElementById("wax-seal");
        
        envelope.classList.remove("open");
        seal.classList.remove("broken");
        
        gsap.set(envelopeScreen, { scale: 1.0, y: 0, opacity: 1 });
        gsap.set(envelope, { opacity: 1, y: 0 });
        gsap.set(flap, { rotateX: 0 });
        gsap.set(seal, { scale: 1, opacity: 1 });
        
        btnOpenLetter.disabled = false;
        btnLastSurprise.disabled = false;
        
        // Reset pages transformations
        const pages = document.querySelectorAll(".diary-page");
        pages.forEach(p => {
            p.classList.remove("active");
            gsap.set(p, { rotateY: 0, skewY: 0, scaleX: 1, opacity: 0 });
        });
    });

    /*
        ========================================================================
        7. Custom Emitter Particles (Smoke / Crumbs)
        ========================================================================
    */
    class CustomEmitterParticle {
        constructor(x, y, color, type) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.type = type;
            this.size = this.type === 'smoke' ? Math.random() * 4 + 3 : Math.random() * 3 + 1;
            
            const angle = Math.random() * Math.PI * 2;
            const speed = this.type === 'smoke' ? Math.random() * 0.6 + 0.2 : Math.random() * 4 + 2;
            
            this.speedX = Math.cos(angle) * speed;
            this.speedY = this.type === 'smoke' ? -(Math.random() * 0.8 + 0.4) : Math.sin(angle) * speed;
            this.gravity = this.type === 'crumb' ? 0.25 : 0;
            this.opacity = 1;
            this.life = 1.0;
            this.decay = Math.random() * 0.01 + 0.01;
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
                ctx.arc(this.x, this.y, this.size + (1 - this.life) * 8, 0, Math.PI * 2);
            } else {
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

    function animateCustomParticles() {
        customParticles = customParticles.filter(p => {
            p.update();
            p.draw();
            return p.life > 0;
        });
        requestAnimationFrame(animateCustomParticles);
    }
    animateCustomParticles();

    // Sound toggle mute handler
    musicToggle.addEventListener("click", () => {
        if (!audioSynthesizer) {
            unlockAudio();
            return;
        }
        
        isMusicPlaying = !isMusicPlaying;
        audioSynthesizer.setMute(!isMusicPlaying);
        
        if (isMusicPlaying) {
            musicIconPlaying.classList.remove("hidden");
            musicIconMuted.classList.add("hidden");
            musicLabel.textContent = "Music On";
        } else {
            musicIconPlaying.classList.add("hidden");
            musicIconMuted.classList.remove("hidden");
            musicLabel.textContent = "Music Off";
        }
    });
});
