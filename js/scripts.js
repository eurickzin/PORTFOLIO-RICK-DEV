document.documentElement.classList.add('js');

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
const languageSwitcher = document.querySelector('#language-switcher');
const i18n = window.PORTFOLIO_I18N;
let activeLanguage = 'pt';
try {
    const savedLanguage = localStorage.getItem('portfolio-language');
    if (['pt', 'en', 'es'].includes(savedLanguage)) activeLanguage = savedLanguage;
} catch {}
const originalTextNodes = [];
const originalAttributes = new Map();
const textWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

while (textWalker.nextNode()) {
    const node = textWalker.currentNode;
    if (node.nodeValue.trim()) originalTextNodes.push({ node, original: node.nodeValue });
}

function languageData(language = activeLanguage) {
    if (language === 'pt') {
        return {
            lang: 'pt-BR', code: 'PT', name: 'português', text: {}, attrs: {},
            title: 'Luis Henrique — Desenvolvimento web',
            description: 'Portfólio de Luis Henrique, Web Developer. Trabalho com React, Next.js, TypeScript, Tailwind e Supabase para criar experiências digitais. Conheça meus projetos.',
            ui: {
                menuOpen: 'Abrir menu', menuClose: 'Fechar menu', themeLight: 'Ativar modo claro', themeDark: 'Ativar modo escuro',
                themeButtonLight: 'Claro', themeButtonDark: 'Escuro', glowLabel: 'Luz roxa do cursor', glowOn: 'Desativar luz roxa',
                glowOff: 'Ativar luz roxa', glowDarkOnly: 'A luz roxa está disponível no modo escuro',
                languageLabel: 'Alterar idioma. Idioma atual: português', copySuccess: 'E-mail copiado!',
                copyError: 'Selecione o endereço de e-mail para copiá-lo.',
                formMissing: 'Preencha seu nome e conte um pouco sobre sua ideia.', formSending: 'Enviando sua mensagem…',
                formSuccess: 'Mensagem enviada! Obrigado pelo contato.',
                formError: 'Não foi possível enviar. Tente novamente ou use o e-mail ao lado.',
                emailSubject: 'Nova mensagem pelo portfólio'
            },
            whatsappMessage: 'Olá, Luis! Vi seu portfólio e gostaria de conversar sobre um projeto.'
        };
    }
    return i18n[language];
}

function applyLanguage(language) {
    activeLanguage = language;
    const locale = languageData();
    document.documentElement.lang = locale.lang;
    document.title = locale.title;
    document.querySelector('meta[name="description"]').content = locale.description;

    for (const { node, original } of originalTextNodes) {
        const key = original.trim().replace(/\s+/g, ' ');
        const translated = locale.text[key];
        node.nodeValue = translated === undefined ? original : original.replace(original.trim(), translated);
    }

    for (const [key, translated] of Object.entries(locale.attrs)) {
        const [selector, attribute] = key.split('|');
        const element = document.querySelector(selector);
        if (!element) continue;
        if (!originalAttributes.has(key)) originalAttributes.set(key, element.getAttribute(attribute));
        element.setAttribute(attribute, translated);
    }
    if (language === 'pt') {
        for (const [key, original] of originalAttributes) {
            const [selector, attribute] = key.split('|');
            document.querySelector(selector)?.setAttribute(attribute, original);
        }
    }

    languageSwitcher.dataset.activeLanguage = language;
    const languageNames = {
        pt: ['Português', 'Inglês', 'Espanhol'],
        en: ['Portuguese', 'English', 'Spanish'],
        es: ['Portugués', 'Inglés', 'Español']
    }[language];
    languageSwitcher.setAttribute('aria-label', language === 'en' ? 'Language selector' : language === 'es' ? 'Selector de idioma' : 'Seletor de idioma');
    languageSwitcher.querySelectorAll('[data-language]').forEach((button, index) => {
        button.setAttribute('aria-label', languageNames[index]);
        button.setAttribute('aria-pressed', String(button.dataset.language === language));
    });
    document.querySelector('#contact-form [name="_subject"]').value = locale.ui.emailSubject;
    document.querySelectorAll('a[href*="wa.me"]').forEach((link) => {
        link.href = `https://wa.me/5584999466235?text=${encodeURIComponent(locale.whatsappMessage)}`;
    });
    for (const status of [document.querySelector('#form-status'), document.querySelector('#copy-status')]) {
        if (status.dataset.messageKey) status.textContent = locale.ui[status.dataset.messageKey];
    }
    syncLanguageControls();
    try { localStorage.setItem('portfolio-language', language); } catch {}
}

function syncLanguageControls() {
    const locale = languageData();
    const isLight = document.documentElement.dataset.theme === 'light';
    const themeToggle = document.querySelector('#theme-toggle');
    const themeLabel = isLight ? locale.ui.themeDark : locale.ui.themeLight;
    themeToggle.setAttribute('aria-label', themeLabel);
    themeToggle.title = themeLabel;
    menuToggle.setAttribute('aria-label', menuToggle.getAttribute('aria-expanded') === 'true' ? locale.ui.menuClose : locale.ui.menuOpen);
    const glowToggle = document.querySelector('#glow-toggle');
    glowToggle.setAttribute('aria-label', locale.ui.glowLabel);
    glowToggle.title = glowToggle.disabled ? locale.ui.glowDarkOnly
        : (glowToggle.getAttribute('aria-pressed') === 'true' ? locale.ui.glowOn : locale.ui.glowOff);
}

languageSwitcher.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-language]');
    if (button) applyLanguage(button.dataset.language);
});

applyLanguage(activeLanguage);

function closeMenu(returnFocus = false) {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', languageData().ui.menuOpen);
    navigation.classList.remove('is-open');
    if (returnFocus) menuToggle.focus();
}

menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? languageData().ui.menuOpen : languageData().ui.menuClose);
    navigation.classList.toggle('is-open', !isOpen);
});

navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        closeMenu(true);
    }
});

document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-header')) closeMenu();
});

const desktopQuery = window.matchMedia('(min-width: 821px)');
desktopQuery.addEventListener('change', () => closeMenu());

const themeToggle = document.querySelector('#theme-toggle');
const themeIcon = themeToggle.querySelector('use');
const themeColor = document.querySelector('meta[name="theme-color"]');
const glowToggle = document.querySelector('#glow-toggle');
let glowEnabled = document.documentElement.dataset.glow !== 'off';
let glowActive = false;

function updateGlowControl() {
    const isDark = document.documentElement.dataset.theme !== 'light';
    glowActive = isDark && glowEnabled;
    document.documentElement.dataset.glow = glowActive ? 'on' : 'off';
    glowToggle.disabled = !isDark;
    glowToggle.setAttribute('aria-pressed', String(glowActive));
    syncLanguageControls();
}

function setTheme(theme) {
    const isLight = theme === 'light';
    document.documentElement.dataset.theme = isLight ? 'light' : 'dark';
    themeIcon.setAttribute('href', isLight ? '#icon-moon' : '#icon-sun');
    themeColor.setAttribute('content', isLight ? '#f7f6fb' : '#000000');
    try { localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark'); } catch {}
    updateGlowControl();
}

setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
themeToggle.addEventListener('click', () => {
    setTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light');
});

const techCards = [...document.querySelectorAll('.floating-tech')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const cursorGlow = document.querySelector('.cursor-glow');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

function setGlowEnabled(enabled) {
    glowEnabled = enabled;
    updateGlowControl();
    try { localStorage.setItem('portfolio-glow', enabled ? 'on' : 'off'); } catch {}
}

glowToggle.addEventListener('click', () => setGlowEnabled(!glowEnabled));

if (cursorGlow && finePointer.matches && !reduceMotion.matches) {
    let x = -500;
    let y = -500;
    let targetX = x;
    let targetY = y;
    let glowFrame = 0;

    function followCursor(time) {
        glowFrame = 0;
        x += (targetX - x) * 0.2;
        y += (targetY - y) * 0.2;
        cursorGlow.style.left = `${x.toFixed(1)}px`;
        cursorGlow.style.top = `${y.toFixed(1)}px`;
        if (Math.abs(targetX - x) > 0.5 || Math.abs(targetY - y) > 0.5) {
            glowFrame = requestAnimationFrame(followCursor);
        }
    }

    function moveGlowTo(clientX, clientY) {
        targetX = clientX;
        targetY = clientY;
        if (!glowFrame) glowFrame = requestAnimationFrame(followCursor);
    }

    window.addEventListener('pointermove', (event) => {
        if (!glowActive || event.pointerType !== 'mouse') return;
        if (x === -500 && y === -500) {
            x = event.clientX;
            y = event.clientY;
        }
        moveGlowTo(event.clientX, event.clientY);
    }, { passive: true });

    window.addEventListener('pointerout', (event) => {
        if (!event.relatedTarget) moveGlowTo(-500, -500);
    }, { passive: true });
}

if (techCards.length && !reduceMotion.matches) {
    const particles = techCards.map((element) => ({ element, x: 0, y: 0, vx: 0, vy: 0, touching: false }));
    let pointer = null;
    let animationFrame = 0;
    let previousTime = 0;

    function animateTechCards(time) {
        animationFrame = 0;
        const step = previousTime ? Math.min((time - previousTime) / 16.67, 2) : 1;
        previousTime = time;

        if (pointer) {
            for (const particle of particles) {
                const rect = particle.element.getBoundingClientRect();
                const isTouching = pointer.x >= rect.left - 5 && pointer.x <= rect.right + 5
                    && pointer.y >= rect.top - 5 && pointer.y <= rect.bottom + 5;

                if (isTouching && !particle.touching) {
                    let dx = (rect.left + rect.width / 2) - pointer.x;
                    let dy = (rect.top + rect.height / 2) - pointer.y;
                    let distance = Math.hypot(dx, dy);
                    if (distance < 1) {
                        dx = -pointer.vx;
                        dy = -pointer.vy;
                        distance = Math.hypot(dx, dy) || 1;
                    }
                    const force = 7 + Math.min(Math.hypot(pointer.vx, pointer.vy) * 0.4, 8);
                    particle.vx += (dx / distance) * force;
                    particle.vy += (dy / distance) * force;
                }
                particle.touching = isTouching;
            }
        } else {
            particles.forEach((particle) => { particle.touching = false; });
        }

        const rects = particles.map(({ element }) => element.getBoundingClientRect());
        for (let first = 0; first < particles.length; first += 1) {
            for (let second = first + 1; second < particles.length; second += 1) {
                const a = particles[first];
                const b = particles[second];
                const rectA = rects[first];
                const rectB = rects[second];
                const dx = (rectB.left + rectB.width / 2) - (rectA.left + rectA.width / 2);
                const dy = (rectB.top + rectB.height / 2) - (rectA.top + rectA.height / 2);
                const overlapX = (rectA.width + rectB.width) / 2 - Math.abs(dx);
                const overlapY = (rectA.height + rectB.height) / 2 - Math.abs(dy);

                if (overlapX <= 0 || overlapY <= 0) continue;
                const useX = overlapX < overlapY;
                const direction = (useX ? dx : dy) >= 0 ? 1 : -1;
                const relativeVelocity = useX ? (b.vx - a.vx) * direction : (b.vy - a.vy) * direction;
                const separation = (useX ? overlapX : overlapY) / 2 + 0.5;

                if (useX) {
                    a.x -= direction * separation;
                    b.x += direction * separation;
                    if (relativeVelocity < 0) {
                        const impulse = -(1 + 0.4) * relativeVelocity / 2;
                        a.vx -= impulse * direction;
                        b.vx += impulse * direction;
                    }
                } else {
                    a.y -= direction * separation;
                    b.y += direction * separation;
                    if (relativeVelocity < 0) {
                        const impulse = -(1 + 0.4) * relativeVelocity / 2;
                        a.vy -= impulse * direction;
                        b.vy += impulse * direction;
                    }
                }
            }
        }

        let stillMoving = false;
        for (const particle of particles) {
            particle.vx += -particle.x * 0.01 * step;
            particle.vy += -particle.y * 0.01 * step;
            particle.vx *= 0.84 ** step;
            particle.vy *= 0.84 ** step;
            particle.x = Math.max(-130, Math.min(130, particle.x + particle.vx * step));
            particle.y = Math.max(-100, Math.min(100, particle.y + particle.vy * step));
            particle.element.style.setProperty('--push-x', `${particle.x.toFixed(2)}px`);
            particle.element.style.setProperty('--push-y', `${particle.y.toFixed(2)}px`);
            if (Math.abs(particle.x) > 0.2 || Math.abs(particle.y) > 0.2
                || Math.abs(particle.vx) > 0.1 || Math.abs(particle.vy) > 0.1) stillMoving = true;
        }

        if (stillMoving) animationFrame = requestAnimationFrame(animateTechCards);
        else previousTime = 0;
    }

    window.addEventListener('pointermove', (event) => {
        if (event.pointerType !== 'mouse') return;
        const oldX = pointer?.x ?? event.clientX;
        const oldY = pointer?.y ?? event.clientY;
        pointer = { x: event.clientX, y: event.clientY, vx: event.clientX - oldX, vy: event.clientY - oldY };
        if (!animationFrame) animationFrame = requestAnimationFrame(animateTechCards);
    }, { passive: true });

    window.addEventListener('pointerout', (event) => {
        if (event.relatedTarget) return;
        pointer = null;
        if (!animationFrame) animationFrame = requestAnimationFrame(animateTechCards);
    }, { passive: true });

    reduceMotion.addEventListener('change', (event) => {
        if (!event.matches) return;
        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        particles.forEach((particle) => {
            particle.x = 0;
            particle.y = 0;
            particle.vx = 0;
            particle.vy = 0;
            particle.element.style.setProperty('--push-x', '0px');
            particle.element.style.setProperty('--push-y', '0px');
        });
    });
}

// Mantém a seção atual identificada também para leitores de tela.
if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            navigation.querySelectorAll('a').forEach((link) => {
                if (link.hash === `#${entry.target.id}`) {
                    link.setAttribute('aria-current', 'location');
                } else {
                    link.removeAttribute('aria-current');
                }
            });
        }
    }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
    document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));
}

const emailAddress = 'luisrickpg9@gmail.com';
const copyButton = document.querySelector('#copy-email');
const copyStatus = document.querySelector('#copy-status');

if (navigator.clipboard?.writeText) {
    copyButton.hidden = false;
    copyButton.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(emailAddress);
            copyStatus.dataset.messageKey = 'copySuccess';
            copyStatus.textContent = languageData().ui.copySuccess;
        } catch {
            copyStatus.dataset.messageKey = 'copyError';
            copyStatus.textContent = languageData().ui.copyError;
        }
    });
}

const contactForm = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');

contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    const data = new FormData(contactForm);
    const name = String(data.get('name')).trim();
    const email = String(data.get('email')).trim();
    const message = String(data.get('message')).trim();
    if (!name || !message) {
        formStatus.dataset.messageKey = 'formMissing';
        formStatus.textContent = languageData().ui.formMissing;
        contactForm.querySelector(!name ? '#name' : '#message').focus();
        return;
    }

    data.set('_subject', `${languageData().ui.emailSubject} — ${name}`);
    data.set('_replyto', email);
    const submitButton = contactForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    formStatus.dataset.messageKey = 'formSending';
    formStatus.textContent = languageData().ui.formSending;

    try {
        const response = await fetch(contactForm.action, {
            method: 'POST',
            body: data,
            headers: { Accept: 'application/json' }
        });
        const result = await response.json();
        if (!response.ok || result.success === false) {
            throw new Error(result.message || 'Não foi possível enviar sua mensagem.');
        }
        formStatus.dataset.messageKey = 'formSuccess';
        formStatus.textContent = languageData().ui.formSuccess;
        contactForm.reset();
    } catch {
        formStatus.dataset.messageKey = 'formError';
        formStatus.textContent = languageData().ui.formError;
    } finally {
        submitButton.disabled = false;
    }
});
