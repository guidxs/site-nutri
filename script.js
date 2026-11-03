(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Ano do rodapé
    const ano = document.getElementById('ano');
    if (ano) ano.textContent = new Date().getFullYear();

    // Entrada suave ao rolar (desligada se a pessoa prefere menos movimento)
    if ('IntersectionObserver' in window && !reduceMotion) {
        const alvos = document.querySelectorAll(
            'h2, .benefits-cta h3, .cta-section h3, .about-content h3, ' +
            '.benefits-text > p, .step-item, .check-item, .faq-item'
        );
        const io = new IntersectionObserver((entries) => {
            let i = 0;
            entries.filter(e => e.isIntersecting).forEach(({ target: el }) => {
                el.style.transitionDelay = `${Math.min(i++ * 70, 280)}ms`;
                el.classList.add('animated');
                io.unobserve(el);
                // Ao terminar, devolve o elemento ao CSS normal (mantém o hover funcionando)
                el.addEventListener('transitionend', function fim(ev) {
                    if (ev.target !== el || ev.propertyName !== 'opacity') return;
                    el.classList.remove('animate-on-scroll', 'animated');
                    el.style.transitionDelay = '';
                    el.removeEventListener('transitionend', fim);
                });
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

        alvos.forEach(el => {
            el.classList.add('animate-on-scroll');
            io.observe(el);
        });
    }

    // Carrossel de depoimentos (rolagem nativa: swipe no celular, setas no desktop)
    const wrapper = document.querySelector('.testimonials-wrapper');
    if (!wrapper) return;

    const cards = [...wrapper.querySelectorAll('.testimonial-card')];
    const dotsBox = document.querySelector('.carousel-dots');
    const prev = document.querySelector('.carousel-btn.prev');
    const next = document.querySelector('.carousel-btn.next');
    const carousel = document.querySelector('.testimonials-carousel');
    const GAP = 20;

    const passo = () => cards[0].offsetWidth + GAP;
    const visiveis = () => Math.max(1, Math.round((wrapper.clientWidth + GAP) / passo()));
    const paginas = () => Math.max(1, cards.length - visiveis() + 1);
    const atual = () => Math.min(paginas() - 1, Math.round(wrapper.scrollLeft / passo()));
    const ir = (i) => wrapper.scrollTo({ left: i * passo(), behavior: reduceMotion ? 'auto' : 'smooth' });

    function marcarPonto() {
        const a = atual();
        [...dotsBox.children].forEach((d, i) => d.classList.toggle('active', i === a));
    }

    function montarPontos() {
        dotsBox.replaceChildren(...Array.from({ length: paginas() }, (_, i) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'carousel-dot';
            b.setAttribute('aria-label', `Ir para o depoimento ${i + 1}`);
            b.addEventListener('click', () => { parar(); ir(i); });
            return b;
        }));
        marcarPonto();
    }

    const avancar = () => ir(atual() >= paginas() - 1 ? 0 : atual() + 1);
    const voltar = () => ir(atual() <= 0 ? paginas() - 1 : atual() - 1);

    let timer = null;
    const tocar = () => { if (!reduceMotion && !timer) timer = setInterval(avancar, 5000); };
    const parar = () => { clearInterval(timer); timer = null; };

    next.addEventListener('click', () => { parar(); avancar(); });
    prev.addEventListener('click', () => { parar(); voltar(); });

    let raf;
    wrapper.addEventListener('scroll', () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(marcarPonto);
    }, { passive: true });

    carousel.addEventListener('mouseenter', parar);
    carousel.addEventListener('mouseleave', tocar);
    carousel.addEventListener('focusin', parar);
    wrapper.addEventListener('touchstart', parar, { passive: true });

    let rt;
    window.addEventListener('resize', () => {
        clearTimeout(rt);
        rt = setTimeout(montarPontos, 150);
    });

    montarPontos();
    tocar();
})();
