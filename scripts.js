document.documentElement.classList.add('js');

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');

function closeMenu(returnFocus = false) {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu');
    navigation.classList.remove('is-open');
    if (returnFocus) menuToggle.focus();
}

menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Abrir menu' : 'Fechar menu');
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
            copyStatus.textContent = 'E-mail copiado!';
        } catch {
            copyStatus.textContent = 'Selecione o endereço de e-mail para copiá-lo.';
        }
    });
}

const contactForm = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');

contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    const data = new FormData(contactForm);
    const name = String(data.get('name')).trim();
    const email = String(data.get('email')).trim();
    const phone = String(data.get('phone')).trim();
    const message = String(data.get('message')).trim();
    if (!name || !message) {
        formStatus.textContent = 'Preencha seu nome e conte um pouco sobre sua ideia.';
        contactForm.querySelector(!name ? '#name' : '#message').focus();
        return;
    }

    const subject = encodeURIComponent(`Vamos conversar? — ${name}`);
    const body = encodeURIComponent(`Olá, Luis Henrique!\n\n${message}\n\nNome: ${name}\nE-mail: ${email}${phone ? `\nCelular: ${phone}` : ''}`);
    window.location.href = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
    formStatus.textContent = 'Mensagem preparada. Conclua o envio no seu aplicativo de e-mail. Se ele não abrir, use o endereço ao lado.';
});
