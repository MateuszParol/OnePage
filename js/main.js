document.addEventListener("DOMContentLoaded", () => {
    // 0. Bezpieczna rejestracja wtyczek
    const plugins = [ScrollTrigger];
    if (typeof ScrollSmoother !== 'undefined') {
        plugins.push(ScrollSmoother);
    }
    gsap.registerPlugin(...plugins);

    // 1. Inicjalizacja ScrollSmoother
    let smoother;
    if (typeof ScrollSmoother !== 'undefined') {
        smoother = ScrollSmoother.create({
            wrapper: '#smooth-wrapper',
            content: '#smooth-content',
            smooth: 1.5,
            effects: true,
            smoothTouch: 0.1
        });
    }

    // 1.5 Logo Click (Powrót na górę)
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', () => {
            if (smoother) {
                smoother.scrollTo(0, true);
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    // 2. Animacja Wejściowa (Hero)
    const tlHero = gsap.timeline({ defaults: { ease: "power4.out" } });
    
    gsap.set(".title-text", { yPercent: 120 });
    gsap.set([".hero-subtitle", ".hero .btn-wrapper"], { autoAlpha: 0, y: 30 });
    
    tlHero.to(".title-text", { yPercent: 0, duration: 1.2, stagger: 0.1, delay: 0.2 })
          .to(".hero-subtitle", { autoAlpha: 1, y: 0, duration: 1 }, "-=0.8")
          .to(".hero .btn-wrapper", { autoAlpha: 1, y: 0, duration: 1 }, "-=0.8");

    // Efekt oddychania dla tła
    gsap.to(".ambient-light", {
        scale: 1.1,
        opacity: 0.6,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });

    // 3. Hamburger Menu Animation
    const navTl = gsap.timeline({ paused: true, defaults: { ease: "power4.inOut" } });

    navTl.to(".nav-overlay", { autoAlpha: 1, duration: 0.1 })
         .to(".nav-background", { clipPath: "circle(150% at 100% 0)", duration: 0.8 }, 0)
         .from(".nav-link", { yPercent: 120, rotation: 5, stagger: 0.05, duration: 0.6 }, "-=0.4")
         .from(".nav-footer", { autoAlpha: 0, y: 20, duration: 0.4 }, "-=0.2")
         // Animacja hamburgera
         .to(".hamburger .line-1", { y: 7, rotation: 45, duration: 0.3, backgroundColor: "#fefae0" }, 0)
         .to(".hamburger .line-2", { autoAlpha: 0, duration: 0.3 }, 0)
         .to(".hamburger .line-3", { y: -7, rotation: -45, duration: 0.3, backgroundColor: "#fefae0" }, 0);

    let isMenuOpen = false;
    const hamburger = document.querySelector(".hamburger");

    hamburger.addEventListener("click", () => {
        if (!isMenuOpen) {
            navTl.play();
            if(smoother) smoother.paused(true);
        } else {
            navTl.reverse();
            if(smoother) smoother.paused(false);
        }
        isMenuOpen = !isMenuOpen;
    });

    // 4. Anchor Links & Historia ("Wstecz")
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const targetId = this.getAttribute("href");
            
            if (isMenuOpen) {
                navTl.reverse();
                if(smoother) smoother.paused(false);
                isMenuOpen = false;
                
                setTimeout(() => {
                    if (smoother) smoother.scrollTo(targetId, true);
                    else document.querySelector(targetId).scrollIntoView({behavior: 'smooth'});
                }, 600);
            } else {
                if (smoother) smoother.scrollTo(targetId, true);
                else document.querySelector(targetId).scrollIntoView({behavior: 'smooth'});
            }

            history.pushState(null, null, targetId);
        });
    });

    window.addEventListener("popstate", () => {
        const hash = window.location.hash;
        if (smoother) {
            if (hash) smoother.scrollTo(hash, true);
            else smoother.scrollTo(0, true);
        } else {
            if (hash) document.querySelector(hash).scrollIntoView({behavior: 'smooth'});
            else window.scrollTo({top: 0, behavior: 'smooth'});
        }
    });

    // 5. Animacje Sekcji na Scroll
    // O Nas
    gsap.from(".about-text > *", {
        y: 30, opacity: 0, duration: 1, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: ".about", start: "top 75%" }
    });

    // Paralaks
    gsap.to(".parallax-img", {
        yPercent: 10, ease: "none",
        scrollTrigger: { trigger: ".parallax-container", start: "top bottom", end: "bottom top", scrub: true }
    });

    // Bento Box Reveal
    gsap.from(".bento-item", {
        y: 60, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: ".portfolio", start: "top 80%" }
    });

    // Kontakt & Footer
    gsap.from(".contact-box", {
        y: 50, opacity: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: ".contact", start: "top 85%" }
    });

    // 6. Magnetic Elements
    const magneticElements = document.querySelectorAll('.magnetic');
    
    magneticElements.forEach((elem) => {
        elem.addEventListener('mousemove', function(e) {
            const boundingRect = this.getBoundingClientRect();
            const relX = e.clientX - boundingRect.left;
            const relY = e.clientY - boundingRect.top;
            
            const strength = this.getAttribute('data-strength') || 20;
            const moveX = ((relX / boundingRect.width) - 0.5) * strength;
            const moveY = ((relY / boundingRect.height) - 0.5) * strength;

            gsap.to(this, {
                x: moveX, y: moveY,
                duration: 0.4, ease: "power2.out"
            });
        });

        elem.addEventListener('mouseleave', function() {
            gsap.to(this, {
                x: 0, y: 0,
                duration: 0.8, ease: "elastic.out(1, 0.3)"
            });
        });
    });

    // 7. Theme Toggle (Efekt Wlewania / Liquid Wipe)
    const themeBtn = document.querySelector('.theme-toggle');
    const rootEl = document.documentElement;
    const themeWipe = document.querySelector('.theme-wipe');
    
    // Zdefiniowane Palety
    const lightTheme = {
        "--color-bg": "#fefae0",
        "--color-text": "#283618",
        "--color-accent-1": "#606c38",
        "--color-accent-2": "#dda15e",
        "--color-accent-3": "#221307", /* Poprzednio: #bc6c25 */
        "--color-ambient-2": "#bc6c25",
        "--color-body-text": "#606c38",
        "--color-bg-glass": "rgba(254, 250, 224, 0.7)"
    };

    const darkTheme = {
        "--color-bg": "#1b263b",      /* Dominujacy */
        "--color-text": "#e0e1dd",    /* Jasny dla czytelnosci tekstow */
        "--color-accent-1": "#778da9",
        "--color-accent-2": "#415a77",
        "--color-accent-3": "#778da9", /* Jasny kolor do stopki (zamiast granatowego) */
        "--color-ambient-2": "#778da9",
        "--color-body-text": "#e0e1dd", /* Najjaśniejszy kolor dla akapitów <p> dla super czytelności */
        "--color-bg-glass": "rgba(27, 38, 59, 0.7)"
    };

    let isDark = localStorage.getItem('theme') === 'dark';
    let isAnimatingTheme = false;
    
    // Inicjalizacja bez animacji
    if (isDark) {
        rootEl.classList.add('is-dark');
        gsap.set(rootEl, darkTheme);
    }

    // Animowany Przełącznik (Native View Transitions API)
    themeBtn.addEventListener('click', () => {
        isDark = !isDark;
        const targetTheme = isDark ? darkTheme : lightTheme;
        
        // Czysta zmiana barw w DOM
        const applyTheme = () => {
            if (isDark) {
                rootEl.classList.add('is-dark');
                localStorage.setItem('theme', 'dark');
            } else {
                rootEl.classList.remove('is-dark');
                localStorage.setItem('theme', 'light');
            }
            // Aplikacja zmiennych CSS od razu
            for (const [key, value] of Object.entries(targetTheme)) {
                rootEl.style.setProperty(key, value);
            }
        };

        // Jeśli przeglądarka nie wspiera View Transitions, zmieniamy natychmiast
        if (!document.startViewTransition) {
            applyTheme();
            return;
        }

        // Aktywacja natywnego, płynnego wlewania (screenshot DOM)
        rootEl.classList.add('is-animating-theme');
        
        // Zablokuj scrollowanie na czas animacji (natywnie + w ScrollSmoother)
        document.body.style.overflow = 'hidden';
        if (smoother) smoother.paused(true);

        const transition = document.startViewTransition(applyTheme);
        
        transition.finished.then(() => {
            rootEl.classList.remove('is-animating-theme');
            
            // Odblokuj scrollowanie
            document.body.style.overflow = '';
            if (smoother) smoother.paused(false);
        });
    });

    // 8. Opcje Dostępności (WCAG)
    const btnLargeText = document.getElementById('btn-large-text');
    const btnColorblind = document.getElementById('btn-colorblind');

    // Inicjalizacja zapisanych stanów
    if (localStorage.getItem('a11y-large-text') === 'true') {
        rootEl.classList.add('a11y-large-text');
        if (btnLargeText) btnLargeText.classList.add('active');
    }
    
    if (localStorage.getItem('a11y-colorblind') === 'true') {
        rootEl.classList.add('a11y-colorblind');
        if (btnColorblind) btnColorblind.classList.add('active');
    }

    if (btnLargeText) {
        btnLargeText.addEventListener('click', () => {
            const isActive = rootEl.classList.toggle('a11y-large-text');
            btnLargeText.classList.toggle('active', isActive);
            localStorage.setItem('a11y-large-text', isActive);
            
            // Wymuszamy aktualizację ScrollSmoother po zmianie rozmiarów tekstów
            if (smoother) {
                setTimeout(() => ScrollTrigger.refresh(), 100);
            }
        });
    }

    if (btnColorblind) {
        btnColorblind.addEventListener('click', () => {
            // Funkcja aplikująca motyw (współgra z View Transitions API)
            const toggleColorblind = () => {
                const isActive = rootEl.classList.toggle('a11y-colorblind');
                btnColorblind.classList.toggle('active', isActive);
                localStorage.setItem('a11y-colorblind', isActive);
            };

            if (!document.startViewTransition) {
                toggleColorblind();
                return;
            }

            // Płynne "rozlewanie" kolorów przy pomocy maski
            rootEl.classList.add('is-animating-theme');
            document.body.style.overflow = 'hidden';
            if (smoother) smoother.paused(true);

            const transition = document.startViewTransition(toggleColorblind);
            transition.finished.then(() => {
                rootEl.classList.remove('is-animating-theme');
                document.body.style.overflow = '';
                if (smoother) smoother.paused(false);
            });
        });
    }

    // 9. Modal Kontaktowy
    const contactBtn = document.getElementById('contact-btn');
    const contactModal = document.getElementById('contact-modal');
    const closeModalBtn = document.getElementById('close-modal');

    if (contactBtn && contactModal && closeModalBtn) {
        const toggleModal = (show) => {
            if (show) {
                contactModal.classList.add('active');
                if (smoother) smoother.paused(true); // Blokada scrolla w tle
            } else {
                contactModal.classList.remove('active');
                if (smoother) smoother.paused(false);
            }
        };

        contactBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleModal(true);
        });

        closeModalBtn.addEventListener('click', () => {
            toggleModal(false);
        });

        // Zamknij klikając w ciemne tło poza modalem
        contactModal.addEventListener('click', (e) => {
            if (e.target === contactModal) {
                toggleModal(false);
            }
        });

        // Zamknij używając klawisza ESC (WCAG)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && contactModal.classList.contains('active')) {
                toggleModal(false);
            }
        });
    }

});
