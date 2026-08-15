document.addEventListener('DOMContentLoaded', () => {
    /* ==========================================================================
       1. SPARKLE BACKGROUND CANVAS
       ========================================================================== */
    const sparkleCanvas = document.getElementById('sparkleCanvas');
    const sCtx = sparkleCanvas.getContext('2d');
    let sparkles = [];

    function resizeSparkleCanvas() {
        sparkleCanvas.width = window.innerWidth;
        sparkleCanvas.height = window.innerHeight;
    }
    resizeSparkleCanvas();
    window.addEventListener('resize', resizeSparkleCanvas);

    class Sparkle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * sparkleCanvas.width;
            this.y = Math.random() * sparkleCanvas.height;
            this.size = Math.random() * 1.6 + 0.5;
            this.speedY = Math.random() * 0.25 + 0.08;
            this.opacity = Math.random();
            this.pulseSpeed = Math.random() * 0.015 + 0.004;
        }
        update() {
            this.y -= this.speedY;
            if (this.y < 0) this.y = sparkleCanvas.height;
            this.opacity += this.pulseSpeed;
            if (this.opacity > 1 || this.opacity < 0.2) {
                this.pulseSpeed = -this.pulseSpeed;
            }
        }
        draw() {
            sCtx.beginPath();
            sCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            sCtx.fillStyle = `rgba(212, 175, 55, ${Math.abs(this.opacity) * 0.4})`;
            sCtx.shadowBlur = 6;
            sCtx.shadowColor = '#D4AF37';
            sCtx.fill();
        }
    }

    // Reduced from 40 to 14 extremely subtle, gold ambient particles
    for (let i = 0; i < 14; i++) {
        sparkles.push(new Sparkle());
    }

    function animateSparkles() {
        sCtx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);
        sparkles.forEach(s => {
            s.update();
            s.draw();
        });
        requestAnimationFrame(animateSparkles);
    }
    animateSparkles();

    /* ==========================================================================
       2. INTERACTIVE STORY ENGINE (HORIZONTAL PAGE TURNING)
       ========================================================================== */
    const pagesContainer = document.getElementById('pagesContainer');
    const pages = document.querySelectorAll('.page');
    const storySegments = document.querySelectorAll('.story-roman-numeral');
    const storyPrevBtn = document.getElementById('storyPrevBtn');
    const storyNextBtn = document.getElementById('storyNextBtn');
    const parallaxLayers = document.querySelectorAll('.parallax-layer');

    let currentStoryPage = 0;
    const totalStoryPages = document.querySelectorAll('.page').length || 6;

    // Make Roman Numerals clickable for direct chapter jumping
    storySegments.forEach((segment, idx) => {
        segment.addEventListener('click', () => {
            goToStoryPage(idx);
        });
    });

    function updateParallax(scrolled) {
        parallaxLayers.forEach(layer => {
            const speed = parseFloat(layer.getAttribute('data-speed')) || 0.1;
            const xPos = -(scrolled * speed);
            layer.style.transform = `translate3d(${xPos}px, 0, 0)`;
        });
    }

    function goToStoryPage(index) {
        if (index < 0) index = 0;
        if (index >= totalStoryPages) index = totalStoryPages - 1;

        currentStoryPage = index;

        // Scroll horizontally to page
        const pageWidth = pagesContainer ? (pagesContainer.clientWidth || window.innerWidth) : window.innerWidth;
        if (pagesContainer) {
            pagesContainer.scrollTo({
                left: currentStoryPage * pageWidth,
                behavior: 'smooth'
            });
        }

        // Update active story classes for animation reset
        pages.forEach((p, idx) => {
            if (idx === currentStoryPage) {
                p.classList.add('active-story');
                if (p.querySelector('#scratchCanvas')) {
                    setTimeout(initScratchCanvas, 150);
                }
            } else {
                p.classList.remove('active-story');
            }
        });

        // Update Segmented Story Progress Bar
        storySegments.forEach((segment, idx) => {
            segment.classList.remove('active', 'completed');
            if (idx < currentStoryPage) {
                segment.classList.add('completed');
            } else if (idx === currentStoryPage) {
                segment.classList.add('active');
            }
        });

        // Update Subtle Prev/Next Controls Visibility
        if (storyPrevBtn) {
            storyPrevBtn.classList.toggle('hidden-nav', currentStoryPage === 0);
        }
        if (storyNextBtn) {
            storyNextBtn.classList.toggle('hidden-nav', currentStoryPage === totalStoryPages - 1);
        }
    }

    // Scroll listener to update active page state smoothly during swipe / drag
    if (pagesContainer) {
        let isScrollingTimer;
        pagesContainer.addEventListener('scroll', () => {
            const scrollLeft = pagesContainer.scrollLeft;
            const pageWidth = pagesContainer.clientWidth || window.innerWidth;
            const activeIndex = Math.round(scrollLeft / pageWidth);

            updateParallax(scrollLeft);

            clearTimeout(isScrollingTimer);
            isScrollingTimer = setTimeout(() => {
                if (activeIndex !== currentStoryPage) {
                    goToStoryPage(activeIndex);
                }
            }, 80);
        }, { passive: true });

        // Smart Tap Navigation: tap left 25% or right 75% outside interactive elements to turn page
        pagesContainer.addEventListener('click', (e) => {
            if (e.target.closest('button, a, input, textarea, canvas, .flip-card, .btn-opt, .gallery-nav, .dot, .subtle-nav-btn, .music-btn, .scratch-wrapper, .guest-register-scroll, .flower-blessing-card, .guestbook-section')) {
                return;
            }

            const clickX = e.clientX;
            const screenWidth = window.innerWidth;
            if (clickX < screenWidth * 0.25) {
                goToStoryPage(currentStoryPage - 1);
            } else {
                goToStoryPage(currentStoryPage + 1);
            }
        });
    }

    if (storyPrevBtn) {
        storyPrevBtn.addEventListener('click', () => goToStoryPage(currentStoryPage - 1));
    }

    if (storyNextBtn) {
        storyNextBtn.addEventListener('click', () => goToStoryPage(currentStoryPage + 1));
    }

    storySegments.forEach(segment => {
        segment.addEventListener('click', () => {
            const idx = parseInt(segment.getAttribute('data-index'));
            goToStoryPage(idx);
        });
    });

    // Keyboard Arrow Keys Navigation
    window.addEventListener('keydown', (e) => {
        const cardStage = document.getElementById('cardStage');
        if (cardStage && !cardStage.classList.contains('active')) return;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
            goToStoryPage(currentStoryPage + 1);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            goToStoryPage(currentStoryPage - 1);
        }
    });


    /* ==========================================================================
       4. MOMENTS GALLERY CAROUSEL
       ========================================================================== */
    const gallerySlides = document.querySelectorAll('.gallery-slide');
    const galleryDots = document.querySelectorAll('.gallery-dots .dot');
    const galleryPrevBtn = document.getElementById('galleryPrevBtn');
    const galleryNextBtn = document.getElementById('galleryNextBtn');
    const galleryPlayBtn = document.getElementById('galleryPlayBtn');

    let currentSlide = 0;
    let isAutoPlaying = true;
    let galleryInterval = null;

    function goToSlide(index) {
        gallerySlides[currentSlide].classList.remove('active');
        galleryDots[currentSlide].classList.remove('active');
        currentSlide = (index + gallerySlides.length) % gallerySlides.length;
        gallerySlides[currentSlide].classList.add('active');
        galleryDots[currentSlide].classList.add('active');
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    function startGalleryAuto() {
        if (galleryInterval) clearInterval(galleryInterval);
        galleryInterval = setInterval(nextSlide, 4000);
        if (galleryPlayBtn) galleryPlayBtn.innerText = '⏸️';
        isAutoPlaying = true;
    }

    function stopGalleryAuto() {
        if (galleryInterval) clearInterval(galleryInterval);
        if (galleryPlayBtn) galleryPlayBtn.innerText = '▶️';
        isAutoPlaying = false;
    }

    if (galleryNextBtn) galleryNextBtn.addEventListener('click', () => { nextSlide(); stopGalleryAuto(); });
    if (galleryPrevBtn) galleryPrevBtn.addEventListener('click', () => { prevSlide(); stopGalleryAuto(); });

    galleryDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const idx = parseInt(dot.getAttribute('data-index'));
            goToSlide(idx);
            stopGalleryAuto();
        });
    });

    if (galleryPlayBtn) {
        galleryPlayBtn.addEventListener('click', () => {
            if (isAutoPlaying) stopGalleryAuto();
            else startGalleryAuto();
        });
    }

    if (gallerySlides.length > 0) {
        startGalleryAuto();
    }


    /* ==========================================================================
       5. VIRTUAL FLOWER PETAL SHOWER
       ========================================================================== */
    const offerFlowerBtn = document.getElementById('offerFlowerBtn');
    const flowerCountEl = document.getElementById('flowerCount');
    let count = parseInt(localStorage.getItem('iqra_hamid_flower_count') || 128);

    if (flowerCountEl) flowerCountEl.innerText = count;

    function spawnPetalShower() {
        const petals = ['🌹', '🌸', '🌹'];
        for (let i = 0; i < 20; i++) {
            const petal = document.createElement('div');
            petal.innerText = petals[Math.floor(Math.random() * petals.length)];
            petal.style.position = 'fixed';
            petal.style.left = `${Math.random() * 90 + 5}vw`;
            petal.style.top = `-25px`;
            petal.style.fontSize = `${Math.random() * 0.9 + 0.9}rem`;
            petal.style.opacity = '0.8';
            petal.style.filter = 'blur(0.2px)';
            petal.style.pointerEvents = 'none';
            petal.style.zIndex = '9999';

            document.body.appendChild(petal);

            const duration = Math.random() * 2500 + 3000;
            const horizontalMove = (Math.random() - 0.5) * 140;

            petal.animate([
                { transform: 'translate(0, 0) rotate(0deg) scale(0.8)', opacity: 0.8 },
                { transform: `translate(${horizontalMove}px, 105vh) rotate(${Math.random() * 220 - 110}deg) scale(1)`, opacity: 0 }
            ], {
                duration: duration,
                easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                fill: 'forwards'
            }).onfinish = () => petal.remove();
        }
    }

    if (offerFlowerBtn) {
        offerFlowerBtn.addEventListener('click', (e) => {
            count++;
            localStorage.setItem('iqra_hamid_flower_count', count);
            if (flowerCountEl) flowerCountEl.innerText = count;

            spawnPetalShower();
            triggerGoldLightParticles(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);
        });
    }


    /* ==========================================================================
       6. COUPLE TRIVIA MINI GAME
       ========================================================================== */
    const triviaQuestions = document.querySelectorAll('.trivia-q');
    const triviaResult = document.getElementById('triviaResult');
    const quizScoreEl = document.getElementById('quizScore');
    const resetQuizBtn = document.getElementById('resetQuizBtn');

    let currentQ = 0;
    let score = 0;

    triviaQuestions.forEach(qEl => {
        const options = qEl.querySelectorAll('.btn-opt');
        const feedbackEl = qEl.querySelector('.memory-feedback');
        options.forEach(opt => {
            opt.addEventListener('click', () => {
                const isCorrect = opt.getAttribute('data-correct') === 'true';

                if (isCorrect) {
                    opt.classList.add('correct');
                    score++;
                    if (feedbackEl) feedbackEl.innerText = "✦ You remembered well.";
                    triggerGoldLightParticles(window.innerWidth / 2, window.innerHeight / 2);
                } else {
                    opt.classList.add('incorrect');
                    qEl.querySelector('[data-correct="true"]').classList.add('correct');
                    if (feedbackEl) feedbackEl.innerText = "A little more wedding homework is required.";
                }

                options.forEach(o => o.style.pointerEvents = 'none');

                setTimeout(() => {
                    qEl.classList.remove('active');
                    currentQ++;
                    if (currentQ < triviaQuestions.length) {
                        triviaQuestions[currentQ].classList.add('active');
                    } else {
                        showQuizResult();
                    }
                }, 1100);
            });
        });
    });

    function showQuizResult() {
        if (triviaResult) {
            triviaResult.classList.remove('hidden');
            if (quizScoreEl) quizScoreEl.innerText = score;
            const quizMsg = document.getElementById('quizMsg');
            if (quizMsg) {
                if (score === 3) quizMsg.innerText = "You know every detail of our celebration.";
                else if (score === 2) quizMsg.innerText = "You remembered most of the ceremony details.";
                else quizMsg.innerText = "A little more wedding homework is required.";
            }
            triggerGoldLightParticles(window.innerWidth / 2, window.innerHeight / 2);
        }
    }

    if (resetQuizBtn) {
        resetQuizBtn.addEventListener('click', () => {
            currentQ = 0;
            score = 0;
            if (triviaResult) triviaResult.classList.add('hidden');
            triviaQuestions.forEach(q => {
                q.classList.remove('active');
                const fb = q.querySelector('.memory-feedback');
                if (fb) fb.innerText = '';
                q.querySelectorAll('.btn-opt').forEach(o => {
                    o.classList.remove('correct', 'incorrect');
                    o.style.pointerEvents = 'auto';
                });
            });
            triviaQuestions[0].classList.add('active');
        });
    }




    /* ==========================================================================
       8. ENVELOPE OPENING ANIMATION
       ========================================================================== */
    const envelope = document.getElementById('envelope');
    const waxSeal = document.getElementById('waxSeal');
    const envelopeStage = document.getElementById('envelopeStage');
    const cardStage = document.getElementById('cardStage');
    let envelopeOpened = false;

    function triggerRoyalUnveiling() {
        if (envelopeStage) envelopeStage.classList.add('unveiling');

        // 1. Tiny Gold Dust Particles (Delicate radial shimmer)
        const goldTones = ['#E2C78E', '#C6A15B', '#FFFDF8', '#D4AF37'];
        const originX = window.innerWidth / 2;
        const originY = window.innerHeight / 2;

        for (let i = 0; i < 30; i++) {
            const dust = document.createElement('div');
            dust.style.position = 'fixed';
            dust.style.left = `${originX}px`;
            dust.style.top = `${originY}px`;
            dust.style.width = `${Math.random() * 2 + 1}px`;
            dust.style.height = `${Math.random() * 2 + 1}px`;
            dust.style.backgroundColor = goldTones[Math.floor(Math.random() * goldTones.length)];
            dust.style.borderRadius = '50%';
            dust.style.boxShadow = '0 0 6px rgba(226, 199, 142, 0.8)';
            dust.style.pointerEvents = 'none';
            dust.style.zIndex = '9999';

            document.body.appendChild(dust);

            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 110 + 25;
            const destX = Math.cos(angle) * dist;
            const destY = Math.sin(angle) * dist - 50;

            dust.animate([
                { transform: 'translate(0, 0) scale(0.5)', opacity: 0 },
                { transform: `translate(${destX * 0.4}px, ${destY * 0.4}px) scale(1.2)`, opacity: 0.85, offset: 0.3 },
                { transform: `translate(${destX}px, ${destY - 35}px) scale(0.6)`, opacity: 0 }
            ], {
                duration: Math.random() * 1400 + 1600,
                easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                fill: 'forwards'
            }).onfinish = () => dust.remove();
        }

        // 2. Subtle Falling Rose Petals
        const petals = ['🌸', '🌹', '✨'];
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                const petal = document.createElement('div');
                petal.innerText = petals[Math.floor(Math.random() * petals.length)];
                petal.style.position = 'fixed';
                petal.style.left = `${Math.random() * 60 + 20}vw`;
                petal.style.top = `${Math.random() * 15 + 10}vh`;
                petal.style.fontSize = `${Math.random() * 0.8 + 0.8}rem`;
                petal.style.opacity = '0.65';
                petal.style.pointerEvents = 'none';
                petal.style.zIndex = '9998';
                petal.style.filter = 'blur(0.3px)';

                document.body.appendChild(petal);

                const duration = Math.random() * 2000 + 3200;
                const horiz = (Math.random() - 0.5) * 80;

                petal.animate([
                    { transform: 'translate(0, 0) rotate(0deg)', opacity: 0.65 },
                    { transform: `translate(${horiz}px, 60vh) rotate(${Math.random() * 180}deg)`, opacity: 0 }
                ], {
                    duration: duration,
                    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
                    fill: 'forwards'
                }).onfinish = () => petal.remove();
            }, i * 140);
        }
    }

    function openEnvelope() {
        if (envelopeOpened) return;
        envelopeOpened = true;

        playGentleTune();
        envelope.classList.add('open');
        triggerRoyalUnveiling();

        setTimeout(() => {
            envelopeStage.classList.add('fade-out');
            cardStage.classList.add('active');
            goToStoryPage(0);
            initScratchCanvas();
        }, 1150);
    }

    if (waxSeal) waxSeal.addEventListener('click', openEnvelope);
    if (envelope) envelope.addEventListener('click', openEnvelope);


    /* ==========================================================================
       9. INTERACTIVE SCRATCH-OFF
       ========================================================================== */
    const scratchCanvas = document.getElementById('scratchCanvas');
    const scratchWrapper = document.getElementById('scratchWrapper');
    const scratchHintOverlay = document.getElementById('scratchHint');
    const scratchProgressBar = document.getElementById('progressBar');
    let ctx;
    let isScratching = false;
    let scratchedPercent = 0;
    let canvasCleared = false;

    function initScratchCanvas() {
        if (!scratchCanvas || canvasCleared) return;
        ctx = scratchCanvas.getContext('2d', { willReadFrequently: true });

        const rect = scratchWrapper ? scratchWrapper.getBoundingClientRect() : { width: 300, height: 160 };
        if (rect.width === 0 || rect.height === 0) return;

        const dpr = window.devicePixelRatio || 1;
        scratchCanvas.width = rect.width * dpr;
        scratchCanvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        drawFoilLayer(rect.width, rect.height);

        if (!scratchCanvas._listenersAttached) {
            scratchCanvas._listenersAttached = true;
            scratchCanvas.addEventListener('mousedown', startScratch);
            scratchCanvas.addEventListener('touchstart', startScratch, { passive: false });

            window.addEventListener('mousemove', scratch);
            window.addEventListener('touchmove', scratch, { passive: false });

            window.addEventListener('mouseup', stopScratch);
            window.addEventListener('touchend', stopScratch);
        }
    }

    function drawFoilLayer(width, height) {
        // 1. Rich Champagne-Gold Metallic Gradient
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0.0, '#D4B876');
        grad.addColorStop(0.25, '#F3E5C8');
        grad.addColorStop(0.5, '#C6A15B');
        grad.addColorStop(0.75, '#FAF0DB');
        grad.addColorStop(1.0, '#9E7C3B');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // 2. Fine Foil Grain Texture & Metallic Hairline Shimmer
        for (let i = 0; i < 400; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 253, 245, 0.45)' : 'rgba(58, 7, 21, 0.25)';
            ctx.fillRect(Math.random() * width, Math.random() * height, Math.random() * 2 + 1, Math.random() * 2 + 1);
        }

        // Diagonal metallic sheen lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 1.5;
        for (let i = -width; i < width * 2; i += 24) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + height, height);
            ctx.stroke();
        }

        // 3. Delicate Antique Gold Border
        ctx.strokeStyle = 'rgba(158, 124, 59, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(6, 6, width - 12, height - 12);

        // 4. REVEAL THE DATE in Quiet Regal Typography
        ctx.fillStyle = '#3A0715';
        ctx.font = '600 11px Cinzel, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(255, 245, 215, 0.6)';
        ctx.shadowBlur = 4;
        ctx.fillText('REVEAL THE DATE', width / 2, height / 2);
        ctx.shadowBlur = 0;
    }

    function getScratchPos(e) {
        const rect = scratchCanvas.getBoundingClientRect();
        let clientX = e.clientX;
        let clientY = e.clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    function startScratch(e) {
        if (canvasCleared) return;
        isScratching = true;
        if (scratchHintOverlay) scratchHintOverlay.classList.add('hidden');
        scratch(e);
    }

    function scratch(e) {
        if (!isScratching || canvasCleared) return;
        if (e.cancelable) e.preventDefault();

        const pos = getScratchPos(e);

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
        ctx.fill();

        checkScratchPercentage();
    }

    function stopScratch() {
        isScratching = false;
    }

    function checkScratchPercentage() {
        if (canvasCleared) return;

        const w = scratchCanvas.width;
        const h = scratchCanvas.height;
        const imgData = ctx.getImageData(0, 0, w, h);
        const pixels = imgData.data;
        let transparentCount = 0;

        const totalSampled = pixels.length / 32;
        for (let i = 3; i < pixels.length; i += 32) {
            if (pixels[i] === 0) {
                transparentCount++;
            }
        }

        scratchedPercent = Math.round((transparentCount / totalSampled) * 100);
        if (scratchProgressBar) scratchProgressBar.style.width = `${Math.min(scratchedPercent * 2, 100)}%`;

        if (scratchedPercent > 35) {
            canvasCleared = true;
            scratchCanvas.style.opacity = '0';
            setTimeout(() => {
                scratchCanvas.style.display = 'none';
            }, 500);

            const rect = scratchWrapper.getBoundingClientRect();
            triggerGoldLightParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
    }


    /* ==========================================================================
       10. RESTRAINED GOLD DUST / LIGHT PARTICLES EFFECT
       ========================================================================== */
    function triggerGoldLightParticles(originX, originY) {
        const x = originX || window.innerWidth / 2;
        const y = originY || window.innerHeight / 2;
        const goldShades = ['#E2C78E', '#C6A15B', '#FFFDF8', '#D4AF37'];

        // 12-14 delicate micro light particles with soft physical momentum
        for (let i = 0; i < 14; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.width = `${Math.random() * 2 + 1.5}px`;
            particle.style.height = `${Math.random() * 2 + 1.5}px`;
            particle.style.backgroundColor = goldShades[Math.floor(Math.random() * goldShades.length)];
            particle.style.borderRadius = '50%';
            particle.style.boxShadow = '0 0 6px rgba(226, 199, 142, 0.7)';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '9999';

            document.body.appendChild(particle);

            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 65 + 20;
            const destX = Math.cos(angle) * velocity;
            const destY = Math.sin(angle) * velocity - 25; // Physical upward momentum

            particle.animate([
                { transform: 'translate(0, 0) scale(0.6)', opacity: 0 },
                { transform: `translate(${destX * 0.5}px, ${destY * 0.5}px) scale(1.1)`, opacity: 0.85, offset: 0.3 },
                { transform: `translate(${destX}px, ${destY}px) scale(0.4)`, opacity: 0 }
            ], {
                duration: Math.random() * 800 + 1000,
                easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                fill: 'forwards'
            }).onfinish = () => particle.remove();
        }
    }


    /* ==========================================================================
       11. COUNTDOWN TIMER
       ========================================================================== */
    const weddingDate = new Date('2026-11-20T19:30:00+05:00').getTime();
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function updateCountdown() {
        const now = new Date().getTime();
        const difference = weddingDate - now;

        if (difference <= 0) {
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        if (daysEl) daysEl.innerText = days < 10 ? `0${days}` : days;
        if (hoursEl) hoursEl.innerText = hours < 10 ? `0${hours}` : hours;
        if (minutesEl) minutesEl.innerText = minutes < 10 ? `0${minutes}` : minutes;
        if (secondsEl) secondsEl.innerText = seconds < 10 ? `0${seconds}` : seconds;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);


    /* ==========================================================================
       12. AUDIO SYNTH MELODY LOOP
       ========================================================================== */
    const musicToggle = document.getElementById('musicToggle');
    let audioCtx = null;
    let isPlaying = false;
    let timerId = null;

    const melodyNotes = [
        293.66, 329.63, 369.99, 440.00, 493.88, 554.37, 659.25, 739.99,
        659.25, 554.37, 493.88, 440.00, 369.99, 329.63
    ];

    function playTone(freq, duration) {
        if (!audioCtx) return;
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

            gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {
            console.error(e);
        }
    }

    function playGentleTune() {
        if (!isPlaying) return;
        let noteIndex = 0;
        if (timerId) clearInterval(timerId);
        timerId = setInterval(() => {
            if (!isPlaying) {
                clearInterval(timerId);
                return;
            }
            playTone(melodyNotes[noteIndex], 1.2);
            noteIndex = (noteIndex + 1) % melodyNotes.length;
        }, 550);
    }

    function toggleMusic() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
        }

        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        isPlaying = !isPlaying;
        if (isPlaying) {
            musicToggle.classList.add('playing');
            playGentleTune();
        } else {
            musicToggle.classList.remove('playing');
            if (timerId) clearInterval(timerId);
        }
    }

    if (musicToggle) {
        musicToggle.addEventListener('click', toggleMusic);
    }


    /* ==========================================================================
       13. GUESTBOOK LOCAL STORAGE
       ========================================================================== */
    const guestbookForm = document.getElementById('guestbookForm');
    const wishesList = document.getElementById('wishesList');
    const submitWishBtn = document.getElementById('submitWishBtn');

    const defaultWishes = [
        { name: "Usman & Family", message: "Warmest prayers and congratulations to Iqra & Hamid!", time: "Recently" },
        { name: "Zainab Ahmad", message: "May your lives be filled with immense happiness, joy, and peace.", time: "Recently" }
    ];

    function loadWishes() {
        if (!wishesList) return;
        const stored = localStorage.getItem('iqra_hamid_wedding_wishes');
        const wishes = stored ? JSON.parse(stored) : defaultWishes;

        wishesList.innerHTML = '';
        wishes.forEach(wish => {
            const card = document.createElement('div');
            card.className = 'parchment-note';
            card.innerHTML = `
                <div class="parchment-note-header">
                    <span class="parchment-author">✦ ${escapeHtml(wish.name)}</span>
                    <span class="parchment-time">${wish.time || 'Just now'}</span>
                </div>
                <p class="parchment-text">"${escapeHtml(wish.message)}"</p>
            `;
            wishesList.appendChild(card);
        });
    }

    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        }[m]));
    }

    if (guestbookForm) {
        loadWishes();

        guestbookForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('guestName');
            const messageInput = document.getElementById('guestMessage');

            const name = nameInput.value.trim();
            const message = messageInput.value.trim();

            if (!name || !message) return;

            const btnText = submitWishBtn.querySelector('.btn-text');
            const btnLoader = submitWishBtn.querySelector('.btn-loader');
            btnText.classList.add('hidden');
            btnLoader.classList.remove('hidden');
            submitWishBtn.disabled = true;

            const stored = localStorage.getItem('iqra_hamid_wedding_wishes');
            const wishes = stored ? JSON.parse(stored) : defaultWishes;
            wishes.unshift({ name, message, time: "Just now" });
            localStorage.setItem('iqra_hamid_wedding_wishes', JSON.stringify(wishes));

            setTimeout(() => {
                loadWishes();
                nameInput.value = '';
                messageInput.value = '';

                btnText.classList.remove('hidden');
                btnLoader.classList.add('hidden');
                submitWishBtn.disabled = false;

                const rect = submitWishBtn.getBoundingClientRect();
                triggerGoldLightParticles(rect.left + rect.width / 2, rect.top);
            }, 600);
        });
    }


    /* ==========================================================================
       14. CALENDAR & SHARE API
       ========================================================================== */
    const addToCalendarBtn = document.getElementById('addToCalendarBtn');
    const shareBtn = document.getElementById('shareBtn');

    if (addToCalendarBtn) {
        addToCalendarBtn.addEventListener('click', () => {
            const title = encodeURIComponent("Iqra & Hamid's Wedding Ceremony (Baraat)");
            const details = encodeURIComponent("Join us for the Baraat of Iqra Imran & Hamid Ali at Marina Banquet Hall near Barkat Market Lahore.");
            const location = encodeURIComponent("Marina Banquet Hall, near Barkat Market, New Garden Town, Lahore");
            const startDate = "20261120T143000Z";
            const endDate = "20261120T180000Z";

            const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
            window.open(googleCalUrl, '_blank');
        });
    }

    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const shareData = {
                title: "Wedding Invitation | Iqra & Hamid",
                text: "You are cordially invited to celebrate the Baraat of Iqra Imran & Hamid Ali on 20th November 2026!",
                url: window.location.href
            };

            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                } catch (err) {
                    console.log('Share canceled', err);
                }
            } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Invitation link copied to clipboard! 📋");
            }
        });
    }
});
