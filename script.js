// ===== КАСТОМНЫЙ КУРСОР =====
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');
let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;

document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursor.style.left = mouseX + 'px'; cursor.style.top = mouseY + 'px';
});
function animateFollower() {
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;
    follower.style.left = followerX + 'px'; follower.style.top = followerY + 'px';
    requestAnimationFrame(animateFollower);
}
animateFollower();

const hoverTargets = document.querySelectorAll('a, button, .bento-item, .portfolio-card, .project-item, .tag, .doc-link, .modal-close, .btn-link, .carousel-btn, .carousel-dot');
hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('hover'); follower.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('hover'); follower.classList.remove('hover'); });
});

// ===== ПЕРЕКЛЮЧЕНИЕ ТЕМ =====
const body = document.body;
const navBtns = document.querySelectorAll('.nav-btn');
const pageDesign = document.getElementById('page-design');
const pageCode = document.getElementById('page-code');
body.classList.add('theme-design');

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        body.classList.remove('theme-design', 'theme-code');
        body.classList.add('theme-' + theme);
        if (theme === 'design') { pageDesign.classList.remove('hidden'); pageCode.classList.add('hidden'); } 
        else { pageCode.classList.remove('hidden'); pageDesign.classList.add('hidden'); }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        updateCanvasColor();
        setTimeout(initStickyMarquee, 100);
        if (theme === 'code') setTimeout(animateBars, 300);
    });
});

// ===== ТЁМНАЯ / СВЕТЛАЯ ТЕМА =====
const themeToggleBtn = document.getElementById('theme-toggle');
if (localStorage.getItem('darkMode') === 'true') body.classList.add('dark-mode');
themeToggleBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
});

// ===== АНИМАЦИЯ ШКАЛ =====
function animateBars() {
    document.querySelectorAll('.skill-bar-fill').forEach(fill => {
        fill.style.width = '0';
        setTimeout(() => { fill.style.width = fill.getAttribute('data-width') + '%'; }, 50);
    });
}

// ===== STICKY MARQUEE =====
let marqueeCleanup = null;
function initStickyMarquee() {
    if (marqueeCleanup) marqueeCleanup();
    const marquee = document.querySelector('.marquee');
    const firstSection = document.querySelector('.page:not(.hidden) .section');
    if (!marquee || !firstSection) return;
    const marqueeHeight = marquee.offsetHeight;
    let marqueeOffsetTop = marquee.offsetTop;
    function recalc() {
        marquee.classList.remove('is-sticky'); firstSection.style.paddingTop = ''; marqueeOffsetTop = marquee.offsetTop;
    }
    window.addEventListener('resize', recalc);
    let ticking = false;
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.pageYOffset;
                if (scrollY >= marqueeOffsetTop) {
                    if (!marquee.classList.contains('is-sticky')) {
                        marquee.classList.add('is-sticky'); firstSection.style.paddingTop = (marqueeHeight + 100) + 'px';
                    }
                } else {
                    if (marquee.classList.contains('is-sticky')) {
                        marquee.classList.remove('is-sticky'); firstSection.style.paddingTop = '';
                    }
                }
                ticking = false;
            });
            ticking = true;
        }
    }
    window.addEventListener('scroll', onScroll);
    marqueeCleanup = () => {
        window.removeEventListener('resize', recalc); window.removeEventListener('scroll', onScroll);
        marquee.classList.remove('is-sticky'); firstSection.style.paddingTop = '';
    };
}
initStickyMarquee();

// ===== КАРУСЕЛИ =====
function initCarousels() {
    document.querySelectorAll('.carousel').forEach(carousel => {
        const track = carousel.querySelector('.carousel-track');
        const slides = carousel.querySelectorAll('.carousel-slide');
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');
        const dotsContainer = carousel.querySelector('.carousel-dots');
        if (!track || slides.length === 0) return;
        
        let currentIndex = 0;
        const totalSlides = slides.length;
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        
        function updateCarousel() {
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
        }
        function goToSlide(index) {
            currentIndex = (index + totalSlides) % totalSlides;
            updateCarousel();
        }
        prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
        nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
        
        let touchStartX = 0;
        track.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        track.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) goToSlide(diff > 0 ? currentIndex + 1 : currentIndex - 1);
        }, { passive: true });
    });
}

// ===== МОДАЛЬНЫЕ ОКНА =====
const modals = document.querySelectorAll('.modal, .gallery-modal');
document.querySelectorAll('.doc-link').forEach(link => {
    link.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('doc-modal').classList.add('active'); });
});
document.querySelectorAll('.modal-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
        const targetModal = document.getElementById(trigger.getAttribute('data-target'));
        if (targetModal) {
            targetModal.classList.add('active');
            // Сброс карусели на 1 слайд
            const track = targetModal.querySelector('.carousel-track');
            if (track) track.style.transform = 'translateX(0)';
            targetModal.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === 0));
        }
    });
});
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.modal, .gallery-modal').classList.remove('active'));
});
modals.forEach(modal => {
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') modals.forEach(m => m.classList.remove('active')); });

initCarousels();

// ===== CANVAS =====
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');
let particles = [], canvasMouseX = 0, canvasMouseY = 0, canvasColor = '168, 214, 92';

function updateCanvasColor() { canvasColor = body.classList.contains('theme-design') ? '168, 214, 92' : '242, 112, 51'; }
function resizeCanvas() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; initParticles(); }
function initParticles() {
    particles = [];
    const count = Math.floor((canvas.width * canvas.height) / 22000);
    for (let i = 0; i < count; i++) {
        particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, radius: Math.random() * 1.5 + 0.5 });
    }
}
function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        const dx = canvasMouseX - p.x, dy = canvasMouseY - p.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140 && dist > 0) {
            const force = (140 - dist) / 140;
            p.vx -= (dx / dist) * force * 0.25; p.vy -= (dy / dist) * force * 0.25;
        }
        p.x += p.vx; p.y += p.vy; p.vx *= 0.98; p.vy *= 0.98;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + canvasColor + ', 0.55)'; ctx.fill();
    });
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y, dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 110) {
                ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = 'rgba(' + canvasColor + ', ' + (0.15 * (1 - dist / 110)) + ')'; ctx.lineWidth = 0.5; ctx.stroke();
            }
        }
    }
    requestAnimationFrame(drawParticles);
}
canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect(); canvasMouseX = e.clientX - rect.left; canvasMouseY = e.clientY - rect.top;
});
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); drawParticles();

// ===== LIGHTBOX (полный просмотр изображений) =====
const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox.querySelector('.lightbox-img');
const lightboxClose = lightbox.querySelector('.lightbox-close');
const lightboxBackdrop = lightbox.querySelector('.lightbox-backdrop');
const lightboxTriggers = document.querySelectorAll('.lightbox-trigger');

// Открытие lightbox при клике на картинку
lightboxTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
        const img = trigger.querySelector('img');
        if (img) {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightbox.classList.add('active');
            // Блокируем скролл страницы
            document.body.style.overflow = 'hidden';
        }
    });
});

// Закрытие lightbox
function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    // Очищаем src после анимации
    setTimeout(() => {
        lightboxImg.src = '';
    }, 300);
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxBackdrop.addEventListener('click', closeLightbox);

// Закрытие по Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
    }
});