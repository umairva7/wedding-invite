document.addEventListener('DOMContentLoaded', () => {
    /* ==========================================================================
       1. LIVING ATMOSPHERIC CANVAS ENGINE (MULTI-LAYER WIND & PETALS)
       ========================================================================== */
    const sparkleCanvas = document.getElementById('sparkleCanvas');
    const sCtx = sparkleCanvas.getContext('2d');

    function resizeSparkleCanvas() {
        sparkleCanvas.width = window.innerWidth;
        sparkleCanvas.height = window.innerHeight;
    }
    resizeSparkleCanvas();
    window.addEventListener('resize', resizeSparkleCanvas);

    // Global Wind & Environmental State Engine
    const wind = {
        speedX: 0.38,
        speedY: 0.14,
        swayTime: 0,
        swayAmp: 0.75,
        get currentSway() {
            return Math.sin(this.swayTime * 0.0012) * this.swayAmp;
        }
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Layer 1: Gold Dust Particles
    class GoldDust {
        constructor() {
            this.reset(true);
        }
        reset(initial = false) {
            this.x = Math.random() * sparkleCanvas.width;
            this.y = initial ? Math.random() * sparkleCanvas.height : -10;
            this.depth = Math.random() * 0.5 + 0.3;
            this.size = (Math.random() * 1.5 + 0.6) * this.depth;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.pulseSpeed = Math.random() * 0.015 + 0.005;
            this.speedX = wind.speedX * this.depth;
            this.speedY = (Math.random() * 0.3 + 0.1) * this.depth;
        }
        update() {
            if (prefersReducedMotion) return;
            const sway = wind.currentSway * this.depth;
            this.x += this.speedX + sway;
            this.y += this.speedY;

            if (this.x > sparkleCanvas.width + 20) this.x = -10;
            if (this.y > sparkleCanvas.height + 20) this.reset();

            this.opacity += this.pulseSpeed;
            if (this.opacity > 0.8 || this.opacity < 0.15) {
                this.pulseSpeed = -this.pulseSpeed;
            }
        }
        draw(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(226, 199, 142, ${Math.abs(this.opacity)})`;
            ctx.shadowBlur = 4 * this.depth;
            ctx.shadowColor = '#C6A15B';
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    // Layers 2 & 3: Floating Rose & Botanical Petals
    class WindPetal {
        constructor(isBurst = false, originX, originY) {
            this.reset(isBurst, originX, originY);
        }
        reset(isBurst = false, originX, originY) {
            this.depth = Math.random() * 0.7 + 0.3;
            this.x = isBurst ? (originX || sparkleCanvas.width / 2) + (Math.random() - 0.5) * 140 : (Math.random() * (sparkleCanvas.width + 200) - 100);
            this.y = isBurst ? (originY || sparkleCanvas.height / 2) + (Math.random() - 0.5) * 80 : (Math.random() * -sparkleCanvas.height);

            this.size = (Math.random() * 11 + 7) * this.depth;
            this.angle = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.012 * this.depth;
            this.tilt = Math.random() * 0.8 + 0.2;
            this.opacity = (Math.random() * 0.3 + 0.2) * (this.depth > 0.6 ? 1 : 0.55);

            this.speedX = (wind.speedX + Math.random() * 0.2) * (this.depth * 0.8);
            this.speedY = (wind.speedY + Math.random() * 0.2 + 0.1) * (this.depth * 0.7);

            const colors = ['#8B1B32', '#A8233C', '#6E0E21', '#B83A52', '#C6A15B'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        update() {
            if (prefersReducedMotion) return;
            this.angle += this.rotSpeed;
            this.tilt = Math.sin(this.angle) * 0.6 + 0.4;

            const sway = wind.currentSway * (this.depth * 1.5);
            this.x += this.speedX + sway;
            this.y += this.speedY;

            if (this.y > sparkleCanvas.height + 40 || this.x > sparkleCanvas.width + 60) {
                this.reset(false);
            }
        }
        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.scale(1, Math.max(0.15, Math.abs(this.tilt)));

            ctx.beginPath();
            const s = this.size;
            ctx.moveTo(0, -s);
            ctx.bezierCurveTo(s * 0.75, -s * 0.6, s * 0.85, s * 0.5, 0, s);
            ctx.bezierCurveTo(-s * 0.85, s * 0.5, -s * 0.75, -s * 0.6, 0, -s);

            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.shadowBlur = 5 * this.depth;
            ctx.shadowColor = 'rgba(24, 7, 12, 0.4)';
            ctx.fill();

            if (this.depth > 0.65) {
                ctx.beginPath();
                ctx.arc(0, -s * 0.7, s * 0.15, 0, Math.PI * 2);
                ctx.fillStyle = '#E2C78E';
                ctx.globalAlpha = this.opacity * 0.7;
                ctx.fill();
            }

            ctx.restore();
        }
    }

    const goldDustParticles = [];
    for (let i = 0; i < 26; i++) {
        goldDustParticles.push(new GoldDust());
    }

    const windPetals = [];
    for (let i = 0; i < 24; i++) {
        windPetals.push(new WindPetal());
    }

    function triggerCanvasPetalBurst(count = 25, originX, originY) {
        if (prefersReducedMotion) return;
        for (let i = 0; i < count; i++) {
            windPetals.push(new WindPetal(true, originX, originY));
        }
        if (windPetals.length > 60) {
            windPetals.splice(0, windPetals.length - 60);
        }
    }

    function animateEnvironment(time) {
        wind.swayTime = time;
        sCtx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);

        const lightX = sparkleCanvas.width * 0.5 + Math.sin(time * 0.0006) * (sparkleCanvas.width * 0.15);
        const lightY = sparkleCanvas.height * 0.35 + Math.cos(time * 0.0008) * (sparkleCanvas.height * 0.1);
        
        const ambientGrad = sCtx.createRadialGradient(
            lightX, lightY, 40,
            lightX, lightY, sparkleCanvas.width * 0.75
        );
        ambientGrad.addColorStop(0, 'rgba(90, 18, 36, 0.18)');
        ambientGrad.addColorStop(0.5, 'rgba(40, 5, 12, 0.05)');
        ambientGrad.addColorStop(1, 'rgba(15, 2, 5, 0)');

        sCtx.fillStyle = ambientGrad;
        sCtx.fillRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);

        goldDustParticles.forEach(p => {
            p.update();
            p.draw(sCtx);
        });

        windPetals.forEach(p => {
            p.update();
            p.draw(sCtx);
        });

        requestAnimationFrame(animateEnvironment);
    }
    requestAnimationFrame(animateEnvironment);

    /* ==========================================================================
       2. INTERACTIVE STORY ENGINE (VERTICAL CINEMATIC JOURNEY)
       ========================================================================== */
    const pagesContainer = document.getElementById('pagesContainer');
    const pages = document.querySelectorAll('.page');
    const storySegments = document.querySelectorAll('.story-roman-numeral');
    const parallaxLayers = document.querySelectorAll('.parallax-layer');

    let currentStoryPage = 0;
    const totalStoryPages = pages.length || 7;

    // Cache page offsets to eliminate synchronous layout thrashing during scroll
    let pageOffsets = [];
    function cachePageOffsets() {
        if (!pages.length) return;
        pageOffsets = Array.from(pages).map(p => p.offsetTop);
    }
    cachePageOffsets();
    window.addEventListener('resize', cachePageOffsets, { passive: true });

    function updateParallax(scrolledY) {
        parallaxLayers.forEach(layer => {
            const speed = parseFloat(layer.getAttribute('data-speed')) || 0.1;
            const yPos = -(scrolledY * speed * 0.3);
            layer.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
    }

    function updateActiveStoryState(index) {
        currentStoryPage = index;

        pages.forEach((p, idx) => {
            if (idx === currentStoryPage) {
                p.classList.add('active-story');
                p.classList.remove('past-story');
                if (p.querySelector('#scratchCanvas')) {
                    setTimeout(initScratchCanvas, 150);
                }
            } else {
                p.classList.remove('active-story');
                if (idx < currentStoryPage) {
                    p.classList.add('past-story');
                } else {
                    p.classList.remove('past-story');
                }
            }
        });

        // Update Segmented Story Progress Bar (I - VI)
        storySegments.forEach((segment, idx) => {
            segment.classList.remove('active', 'completed');
            if (idx < currentStoryPage) {
                segment.classList.add('completed');
            } else if (idx === currentStoryPage) {
                segment.classList.add('active');
            }
        });
    }

    function goToStoryPage(index) {
        if (index < 0) index = 0;
        if (index >= totalStoryPages) index = totalStoryPages - 1;

        const targetPage = pages[index];
        if (targetPage && pagesContainer) {
            const targetY = pageOffsets[index] !== undefined ? pageOffsets[index] : targetPage.offsetTop;
            pagesContainer.scrollTo({
                top: targetY,
                behavior: 'smooth'
            });
        }
        updateActiveStoryState(index);
    }

    // Click Roman Numerals for direct chapter jumping
    storySegments.forEach((segment) => {
        segment.addEventListener('click', () => {
            const idx = parseInt(segment.getAttribute('data-index')) || 0;
            goToStoryPage(idx);
        });
    });

    // High-Performance RAF-Throttled Scroll Listener
    if (pagesContainer) {
        let isScrollTicking = false;
        pagesContainer.addEventListener('scroll', () => {
            if (!isScrollTicking) {
                window.requestAnimationFrame(() => {
                    const scrollTop = pagesContainer.scrollTop;

                    updateParallax(scrollTop);

                    // Compute active index using cached page offsets
                    let activeIndex = 0;
                    let minDistance = Infinity;

                    for (let idx = 0; idx < pageOffsets.length; idx++) {
                        const distance = Math.abs(pageOffsets[idx] - scrollTop);
                        if (distance < minDistance) {
                            minDistance = distance;
                            activeIndex = idx;
                        }
                    }

                    if (activeIndex !== currentStoryPage) {
                        updateActiveStoryState(activeIndex);
                    }
                    isScrollTicking = false;
                });
                isScrollTicking = true;
            }
        }, { passive: true });
    }

    // Keyboard Arrow Keys Navigation
    window.addEventListener('keydown', (e) => {
        const cardStage = document.getElementById('cardStage');
        if (cardStage && !cardStage.classList.contains('active')) return;
        if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
            if (currentStoryPage < totalStoryPages - 1) {
                goToStoryPage(currentStoryPage + 1);
            }
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            if (currentStoryPage > 0) {
                goToStoryPage(currentStoryPage - 1);
            }
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

    function spawnPetalShower(originX, originY) {
        triggerCanvasPetalBurst(12, originX || window.innerWidth / 2, originY || window.innerHeight / 3);
        triggerGoldLightParticles(originX || window.innerWidth / 2, originY || window.innerHeight / 2);
    }

    function showFloatingToast(message, x, y) {
        const toast = document.createElement('div');
        toast.className = 'floating-toast-msg';
        toast.innerText = message;
        toast.style.cssText = `
            position: fixed;
            left: ${x || window.innerWidth / 2}px;
            top: ${(y || window.innerHeight / 2) - 20}px;
            transform: translate(-50%, -50%);
            color: var(--color-gold-bright, #FDF0A6);
            font-family: var(--font-cinzel, 'Cinzel', serif);
            font-size: 0.85rem;
            font-weight: 700;
            letter-spacing: 1px;
            text-shadow: 0 2px 10px rgba(0,0,0,0.85);
            pointer-events: none;
            z-index: 10000;
            animation: floatUpFade 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 1200);
    }

    if (offerFlowerBtn) {
        offerFlowerBtn.addEventListener('click', (e) => {
            count++;
            localStorage.setItem('iqra_hamid_flower_count', count);
            if (flowerCountEl) flowerCountEl.innerText = count;

            triggerHapticFeedback([15, 25, 15]);
            spawnPetalShower(e.clientX, e.clientY);
            showFloatingToast("BarakAllah! +1 Rose Offered", e.clientX, e.clientY);
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

    function triggerVipCelebrationBurst() {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const goldShades = ['#FAD980', '#D4AF37', '#FFFDF8', '#E2C78E', '#C6A15B'];

        for (let i = 0; i < 24; i++) {
            const confetti = document.createElement('div');
            const size = Math.random() * 5 + 3;
            confetti.style.position = 'fixed';
            confetti.style.left = `${centerX}px`;
            confetti.style.top = `${centerY - 40}px`;
            confetti.style.width = `${size}px`;
            confetti.style.height = `${size * (Math.random() > 0.5 ? 1.4 : 1)}px`;
            confetti.style.backgroundColor = goldShades[Math.floor(Math.random() * goldShades.length)];
            confetti.style.borderRadius = Math.random() > 0.4 ? '50%' : '1px';
            confetti.style.boxShadow = '0 0 6px rgba(226, 199, 142, 0.7)';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '9999';

            document.body.appendChild(confetti);

            const angle = (Math.random() - 0.5) * Math.PI * 1.4 - Math.PI / 2;
            const velocity = Math.random() * 140 + 70;
            const destX = Math.cos(angle) * velocity;
            const destY = Math.sin(angle) * velocity + Math.random() * 40;

            confetti.animate([
                { transform: 'translate(0, 0) rotate(0deg) scale(0.4)', opacity: 0 },
                { transform: `translate(${destX * 0.4}px, ${destY * 0.4 - 20}px) rotate(180deg) scale(1.1)`, opacity: 0.95, offset: 0.3 },
                { transform: `translate(${destX}px, ${destY + 60}px) rotate(420deg) scale(0.5)`, opacity: 0 }
            ], {
                duration: Math.random() * 800 + 1400,
                easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
                fill: 'forwards'
            }).onfinish = () => confetti.remove();
        }

        triggerGoldLightParticles(centerX, centerY);
        if (typeof spawnPetalShower === 'function') {
            spawnPetalShower(centerX, centerY - 60);
        }
    }

    function showQuizResult() {
        if (!triviaResult) return;

        const quizScoreEl = document.getElementById('quizScore');
        const quizCrest = document.getElementById('quizCrest');
        const quizTitle = document.getElementById('quizTitle');
        const quizMsgLead = document.getElementById('quizMsgLead');
        const quizMsgSub = document.getElementById('quizMsgSub');

        if (quizScoreEl) quizScoreEl.innerText = score;

        triviaResult.classList.remove('vip-celebration', 'score-2', 'score-1', 'score-0');

        if (score === 3) {
            triviaResult.classList.add('vip-celebration');
            if (quizCrest) quizCrest.innerText = "✦ ⚜ ✦";
            if (quizTitle) quizTitle.innerText = "YOU ARE TRULY A VIP GUEST";
            if (quizMsgLead) quizMsgLead.innerText = "You know the couple well — and you are officially on our VIP roll.";
            if (quizMsgSub) quizMsgSub.innerText = "We look forward to celebrating this beautiful day with you!";

            triggerVipCelebrationBurst();
        } else if (score === 2) {
            triviaResult.classList.add('score-2');
            if (quizCrest) quizCrest.innerText = "✦ ⚜ ✦";
            if (quizTitle) quizTitle.innerText = "ALMOST A VIP GUEST";
            if (quizMsgLead) quizMsgLead.innerText = "You know the couple pretty well… though a few subtle details remain to be discovered.";
            if (quizMsgSub) quizMsgSub.innerHTML = "We look forward to seeing you at the wedding!";

            triggerGoldLightParticles(window.innerWidth / 2, window.innerHeight / 2);
        } else if (score === 1) {
            triviaResult.classList.add('score-1');
            if (quizCrest) quizCrest.innerText = "✦ ⚜ ✦";
            if (quizTitle) quizTitle.innerText = "A WARM INVITATION TO KNOW US BETTER";
            if (quizMsgLead) quizMsgLead.innerText = "Don't worry — there is still plenty of time to learn more about our celebration.";
            if (quizMsgSub) quizMsgSub.innerHTML = "We look forward to celebrating with you!";

            triggerGoldLightParticles(window.innerWidth / 2, window.innerHeight / 2);
        } else {
            triviaResult.classList.add('score-0');
            if (quizCrest) quizCrest.innerText = "✦ ⚜ ✦";
            if (quizTitle) quizTitle.innerText = "A DELIGHTFUL FIRST INTRODUCTION";
            if (quizMsgLead) quizMsgLead.innerText = "We definitely look forward to properly introducing you to the couple!";
            if (quizMsgSub) quizMsgSub.innerHTML = "Come celebrate, share in the feast, and make memories with us.";
        }

        triviaResult.classList.remove('hidden');
    }

    if (resetQuizBtn) {
        resetQuizBtn.addEventListener('click', () => {
            currentQ = 0;
            score = 0;
            if (triviaResult) {
                triviaResult.classList.add('hidden');
                triviaResult.classList.remove('vip-celebration', 'score-2', 'score-1', 'score-0');
            }
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

    // Hide navigation and music controls prior to envelope opening
    document.body.classList.add('is-unopened');

    /* Mobile Haptic Vibrations Helper */
    function triggerHapticFeedback(pattern = 15) {
        if ('vibrate' in navigator) {
            try { navigator.vibrate(pattern); } catch (err) {}
        }
    }

    function triggerRoyalUnveiling() {
        if (envelopeStage) envelopeStage.classList.add('unveiling');
        triggerCanvasPetalBurst(12, window.innerWidth / 2, window.innerHeight * 0.4);
        triggerGoldLightParticles(window.innerWidth / 2, window.innerHeight / 2);
    }

    function openEnvelope(e) {
        if (e && e.preventDefault) {
            // Prevent duplicate touch/click triggering
        }
        if (envelopeOpened) return;
        envelopeOpened = true;

        triggerHapticFeedback([25, 40, 25]);
        if (waxSeal) waxSeal.classList.add('seal-pressed');

        // Step 1 & 2: Compression followed by flap opening & subtle audio
        setTimeout(() => {
            playNasheed();
            if (envelope) envelope.classList.add('open');
            triggerRoyalUnveiling();
        }, 140);

        // Step 3, 4 & 5: Envelope fade out, story page reveal, navigation & hero title reveal
        setTimeout(() => {
            if (envelopeStage) envelopeStage.classList.add('fade-out');
            if (cardStage) cardStage.classList.add('active');
            document.body.classList.remove('is-unopened');
            goToStoryPage(0);
            initScratchCanvas();
        }, 1200);
    }

    const tapInstruction = document.querySelector('.tap-instruction');
    const envelopeContainer = document.querySelector('.envelope-container');

    [waxSeal, envelope, tapInstruction, envelopeContainer].forEach(el => {
        if (el) {
            el.addEventListener('click', openEnvelope);
            el.addEventListener('touchstart', openEnvelope, { passive: true });
        }
    });


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

        // 4. SCRATCH TO REVEAL THE DATE in Quiet Regal Typography
        ctx.fillStyle = '#3A0715';
        ctx.font = '600 11px Cinzel, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(255, 245, 215, 0.6)';
        ctx.shadowBlur = 4;
        ctx.fillText('✦ SCRATCH TO REVEAL THE DATE ✦', width / 2, height / 2);
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
            if (scratchWrapper) scratchWrapper.classList.add('scratched');
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

        // 8-10 delicate micro light particles with soft physical momentum
        for (let i = 0; i < 9; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.width = `${Math.random() * 2 + 1.2}px`;
            particle.style.height = `${Math.random() * 2 + 1.2}px`;
            particle.style.backgroundColor = goldShades[Math.floor(Math.random() * goldShades.length)];
            particle.style.borderRadius = '50%';
            particle.style.boxShadow = '0 0 5px rgba(226, 199, 142, 0.6)';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '9999';

            document.body.appendChild(particle);

            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 30 + 15;
            const destX = Math.cos(angle) * velocity;
            const destY = Math.sin(angle) * velocity - 12; // Muted upward momentum

            particle.animate([
                { transform: 'translate(0, 0) scale(0.6)', opacity: 0 },
                { transform: `translate(${destX * 0.5}px, ${destY * 0.5}px) scale(1.05)`, opacity: 0.8, offset: 0.35 },
                { transform: `translate(${destX}px, ${destY}px) scale(0.4)`, opacity: 0 }
            ], {
                duration: Math.random() * 600 + 1100,
                easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                fill: 'forwards'
            }).onfinish = () => particle.remove();
        }
    }


    function setCountdownValue(element, newValue) {
        if (!element) return;
        const currentValue = element.innerText;
        if (currentValue !== newValue) {
            element.innerText = newValue;
            if (typeof element.animate === 'function') {
                element.animate([
                    { opacity: 0.35, transform: 'translateY(-2px)' },
                    { opacity: 1, transform: 'translateY(0)' }
                ], {
                    duration: 350,
                    easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
                });
            }
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

        if (daysEl) setCountdownValue(daysEl, days < 10 ? `0${days}` : String(days));
        if (hoursEl) setCountdownValue(hoursEl, hours < 10 ? `0${hours}` : String(hours));
        if (minutesEl) setCountdownValue(minutesEl, minutes < 10 ? `0${minutes}` : String(minutes));
        if (secondsEl) setCountdownValue(secondsEl, seconds < 10 ? `0${seconds}` : String(seconds));
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);


    /* ==========================================================================
       12. WEDDING NASHEED AUDIO CONTROLLER
       ========================================================================== */
    const musicToggle = document.getElementById('musicToggle');
    const bgNasheed = document.getElementById('bgNasheed');

    function playNasheed() {
        if (!bgNasheed) return;
        bgNasheed.play().then(() => {
            if (musicToggle) musicToggle.classList.add('playing');
        }).catch(err => {
            console.log('Autoplay prevented until user gesture:', err);
        });
    }

    function pauseNasheed() {
        if (!bgNasheed) return;
        bgNasheed.pause();
        if (musicToggle) musicToggle.classList.remove('playing');
    }

    function toggleMusic() {
        if (!bgNasheed) return;
        if (bgNasheed.paused) {
            playNasheed();
        } else {
            pauseNasheed();
        }
    }

    if (musicToggle) {
        musicToggle.addEventListener('click', toggleMusic);
    }

    // Automatically pause music when opening external links (like Google Maps) or leaving the page/tab
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            pauseNasheed();
        }
    });

    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[target="_blank"], a[href^="http"]');
        if (link) {
            pauseNasheed();
        }
    });


    /* ==========================================================================
       13. GUESTBOOK & GOOGLE SHEETS INTEGRATION
       ========================================================================== */
    const GOOGLE_SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzzVPxMwPsRh_HHBbvlltgUvDmR8M5rbF7XKufFr3LsyrHWWsVVkciSMpg2mAy7RtUIqw/exec';

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

    async function sendWishToGoogleSheets(name, message, attendance = '', guestCount = '') {
        if (!GOOGLE_SHEETS_WEBHOOK_URL) return;
        try {
            const formData = new URLSearchParams();
            formData.append('name', name);
            formData.append('attendance', attendance);
            formData.append('guestCount', guestCount);
            formData.append('message', message);
            formData.append('timestamp', new Date().toLocaleString());

            await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData.toString()
            });
        } catch (err) {
            console.log('Google Sheets Sync Error:', err);
        }
    }

    // Royal Confirmation Modal Handlers
    const wishModal = document.getElementById('wishConfirmationModal');
    const closeWishModalBtn = document.getElementById('closeWishModalBtn');
    const confirmWishModalBtn = document.getElementById('confirmWishModalBtn');

    function openWishModal() {
        if (!wishModal) return;
        wishModal.classList.remove('hidden');
        wishModal.setAttribute('aria-hidden', 'false');
    }

    function closeWishModal() {
        if (!wishModal) return;
        wishModal.classList.add('hidden');
        wishModal.setAttribute('aria-hidden', 'true');
    }

    if (closeWishModalBtn) closeWishModalBtn.addEventListener('click', closeWishModal);
    if (confirmWishModalBtn) confirmWishModalBtn.addEventListener('click', closeWishModal);
    if (wishModal) {
        wishModal.addEventListener('click', (e) => {
            if (e.target === wishModal) closeWishModal();
        });
    }

    if (guestbookForm) {
        loadWishes();

        guestbookForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('guestName');
            const messageInput = document.getElementById('guestMessage');
            const attendanceInput = document.getElementById('rsvpAttendance');
            const guestCountInput = document.getElementById('guestCount');

            const name = nameInput.value.trim();
            const message = messageInput.value.trim();
            const attendance = attendanceInput ? attendanceInput.value : '';
            const guestCount = guestCountInput ? guestCountInput.value : '';

            if (!name || !message) return;

            const btnText = submitWishBtn.querySelector('.btn-text');
            const btnLoader = submitWishBtn.querySelector('.btn-loader');
            btnText.classList.add('hidden');
            btnLoader.classList.remove('hidden');
            submitWishBtn.disabled = true;

            triggerHapticFeedback([20, 40, 20]);

            const stored = localStorage.getItem('iqra_hamid_wedding_wishes');
            const wishes = stored ? JSON.parse(stored) : defaultWishes;
            wishes.unshift({ name, message, attendance, guestCount, time: "Just now" });
            localStorage.setItem('iqra_hamid_wedding_wishes', JSON.stringify(wishes));

            // Sync to Google Sheets
            sendWishToGoogleSheets(name, message, attendance, guestCount);

            setTimeout(() => {
                loadWishes();
                nameInput.value = '';
                messageInput.value = '';

                btnText.classList.remove('hidden');
                btnLoader.classList.add('hidden');
                submitWishBtn.disabled = false;

                const rect = submitWishBtn.getBoundingClientRect();
                triggerGoldLightParticles(rect.left + rect.width / 2, rect.top);

                // Show Heartwarming Royal Confirmation Modal
                openWishModal();
            }, 600);
        });
    }


    /* ==========================================================================
       14. CALENDAR & SHARE API
       ========================================================================== */
    const shareBtn = document.getElementById('shareBtn');

    function handleAddToCalendar() {
        triggerHapticFeedback([15, 30, 15]);

        const isAppleDevice = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
        const title = encodeURIComponent("Iqra & Hamid Royal Baraat Celebration");
        const details = encodeURIComponent("Join us for the Nikkah & Baraat of Iqra Imran & Hamid Ali at Marina Banquet Hall, Lahore.");
        const location = encodeURIComponent("Marina Banquet Hall, near Barkat Market, New Garden Town, Lahore");
        const startDate = "20261120T140000Z";
        const endDate = "20261120T180000Z";

        if (isAppleDevice) {
            const icsData = [
                "BEGIN:VCALENDAR",
                "VERSION:2.0",
                "PRODID:-//Iqra & Hamid Wedding//EN",
                "BEGIN:VEVENT",
                "SUMMARY:Iqra & Hamid Royal Baraat Celebration",
                "DESCRIPTION:Join us for the Nikkah & Baraat of Iqra Imran & Hamid Ali at Marina Banquet Hall, Lahore.",
                "LOCATION:Marina Banquet Hall, near Barkat Market, New Garden Town, Lahore",
                "DTSTART:20261120T140000Z",
                "DTEND:20261120T180000Z",
                "STATUS:CONFIRMED",
                "END:VEVENT",
                "END:VCALENDAR"
            ].join("\r\n");

            const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.setAttribute('download', 'Iqra_Hamid_Wedding.ics');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
            window.open(googleCalUrl, '_blank');
        }
    }

    document.querySelectorAll('.add-calendar-trigger').forEach(btn => {
        btn.addEventListener('click', handleAddToCalendar);
    });

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
                alert("Invitation link copied to clipboard.");
            }
        });
    }


    /* ==========================================================================
       15. FLOATING BREEZE PETAL GENERATION (CSS-ANIMATED DOM ELEMENTS)
       ========================================================================== */
    (function initBreezePetals() {
        if (prefersReducedMotion) return;

        const container = document.getElementById('petalBreezeContainer');
        if (!container) return;

        const isMobile = window.innerWidth <= 430;
        const petalCount = isMobile ? 10 : 18;
        const screenW = window.innerWidth;

        const petalColors = [
            'radial-gradient(ellipse at 40% 30%, #B82038 0%, #8B1528 55%, #5E0E1E 100%)',
            'radial-gradient(ellipse at 35% 25%, #A01D30 0%, #741222 50%, #4E0B18 100%)',
            'radial-gradient(ellipse at 45% 35%, #C4263E 0%, #941A2D 55%, #6A1020 100%)',
            'radial-gradient(ellipse at 38% 28%, #9C1B2E 0%, #6E1020 50%, #450A16 100%)',
            'radial-gradient(ellipse at 42% 32%, #D1324A 0%, #A22038 55%, #781625 100%)'
        ];

        const animations = ['petalBreeze', 'petalBreezeAlt', 'petalBreezeEdge'];

        for (let i = 0; i < petalCount; i++) {
            const petal = document.createElement('div');
            petal.className = 'breeze-petal';

            // Randomize size
            const size = Math.random() * 12 + 10; // 10-22px
            const height = size * (1.1 + Math.random() * 0.4);
            petal.style.width = size + 'px';
            petal.style.height = height + 'px';

            // Randomize color from crimson palette
            petal.style.background = petalColors[Math.floor(Math.random() * petalColors.length)];

            // Randomize shadow
            petal.style.boxShadow = `1px 2px ${3 + Math.random() * 4}px rgba(24, 7, 12, ${0.2 + Math.random() * 0.2})`;

            // Randomize horizontal start position
            const startX = (Math.random() - 0.5) * screenW * 0.6;
            petal.style.left = (Math.random() * 100) + '%';

            // CSS custom properties for animation variation
            petal.style.setProperty('--petal-start-x', startX + 'px');
            petal.style.setProperty('--petal-duration', (8 + Math.random() * 10) + 's');
            petal.style.setProperty('--petal-delay', -(Math.random() * 16) + 's'); // negative for immediate start at random point
            petal.style.setProperty('--petal-max-opacity', (0.5 + Math.random() * 0.35).toFixed(2));

            // Pick animation variant
            const animName = animations[Math.floor(Math.random() * animations.length)];
            const duration = 8 + Math.random() * 10;
            const delay = -(Math.random() * 16);
            petal.style.animation = `${animName} ${duration}s ${delay}s ease-in-out infinite`;

            container.appendChild(petal);
        }
    })();

});
