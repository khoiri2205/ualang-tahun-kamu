/* ============================================================
   KONFIGURASI — Nama diambil otomatis dari URL
   Contoh pakai: https://namakamu.github.io/repo/?nama=Sinta&dari=Raka
   Atau edit langsung default di bawah ini:
   ============================================================ */
const params        = new URLSearchParams(window.location.search);
const config = {
    nama:         params.get('CC')  || 'CC',   // ?nama=Sinta
    nama_pengirim: params.get('Larendra') || 'Larendra',      // ?dari=Raka
};

/* ============================================================
   ISI TEKS DINAMIS (pengganti PHP)
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
    const now = new Date();
    const months = ['Januari','Februari','Maret','April','Mei','Juni',
                    'Juli','Agustus','September','Oktober','November','Desember'];
    const dateStr = now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear();

    const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };

    set('welcome-name-display',   config.nama);
    set('hero-name-display',      config.nama);
    set('footer-title-display',   'Dari aku untukmu, ' + config.nama + ' 🌹');
    set('footer-from-display',    '— Dengan sepenuh hati, ' + config.nama_pengirim);
    set('footer-year-display',    now.getFullYear() + ' · Dibuat khusus untukmu ✨');
    set('surat-date',             dateStr);
    set('surat-opening',          config.nama + ' sayang,');

    const sign = document.getElementById('surat-sign');
    if (sign) sign.innerHTML = 'Dari aku yang selalu mendoakan yang terbaik buatmu,<br/><em>' + config.nama_pengirim + ' 💖</em>';
});

/* ============================================================
   INISIALISASI GLOBAL
   ============================================================ */
let currentSlide  = 0;
let slideInterval = null;
let musicPlaying  = false;
let heartsInterval = null;


/* ============================================================
   1. KANVAS WELCOME — ANIMASI BINTANG & LOVE
   ============================================================ */

(function initWelcomeCanvas() {
    const canvas = document.getElementById('welcome-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const TOTAL = 90;
    const CHARS = ['★', '✦', '✧', '♡', '♥', '❤', '✨', '·'];

    function randomBetween(a, b) {
        return a + Math.random() * (b - a);
    }

    for (let i = 0; i < TOTAL; i++) {
        particles.push(createParticle(true));
    }

    function createParticle(randomY = false) {
        return {
            x:    randomBetween(0, canvas.width),
            y:    randomY ? randomBetween(0, canvas.height) : canvas.height + 20,
            char: CHARS[Math.floor(Math.random() * CHARS.length)],
            size: randomBetween(10, 26),
            speed: randomBetween(0.4, 1.4),
            opacity: randomBetween(0.2, 0.9),
            drift: randomBetween(-0.4, 0.4),
            hue:  Math.random() > 0.5
                  ? `hsl(${randomBetween(330, 360)}, 80%, ${randomBetween(70, 90)}%)`
                  : `hsl(${randomBetween(270, 310)}, 70%, ${randomBetween(75, 92)}%)`,
        };
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, i) => {
            ctx.save();
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle   = p.hue;
            ctx.font        = `${p.size}px serif`;
            ctx.fillText(p.char, p.x, p.y);
            ctx.restore();

            p.y -= p.speed;
            p.x += p.drift;

            p.opacity += (Math.random() - 0.5) * 0.03;
            p.opacity  = Math.min(0.9, Math.max(0.1, p.opacity));

            if (p.y < -30) {
                particles[i] = createParticle(false);
            }
        });

        requestAnimationFrame(draw);
    }

    draw();
})();


/* ============================================================
   2. BUKA KEJUTAN
   ============================================================ */

function bukaKejutan() {
    launchConfetti(200);

    const welcomePage = document.getElementById('welcome-page');
    const mainPage    = document.getElementById('main-page');

    setTimeout(() => {
        welcomePage.classList.add('fade-out');

        setTimeout(() => {
            welcomePage.classList.add('hidden');
            mainPage.classList.remove('hidden');
            initMainPage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 900);
    }, 300);
}


/* ============================================================
   3. INISIALISASI HALAMAN UTAMA
   ============================================================ */

function initMainPage() {
    initSlideshow();
    startFallingHearts();
    initTimer();
    initAOS();

    const audio = document.getElementById('bg-music');
    if (audio) {
        audio.play()
            .then(() => {
                musicPlaying = true;
                updateMusicUI();
            })
            .catch(() => {
                console.info('Autoplay diblokir. Klik tombol musik untuk play.');
            });

        // Kalau file MP3 error (tidak ditemukan), fallback ke YouTube
        audio.addEventListener('error', function() {
            console.warn('File MP3 tidak ditemukan, beralih ke YouTube...');
            useYouTubeFallback();
        });
    }
}


/* ============================================================
   4. SLIDESHOW FOTO
   ============================================================ */

function initSlideshow() {
    const slides    = document.querySelectorAll('.slide');
    const dotsWrap  = document.getElementById('slide-dots');

    if (!slides.length || !dotsWrap) return;

    slides.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.onclick   = () => goToSlide(i);
        dotsWrap.appendChild(dot);
    });

    slideInterval = setInterval(() => changeSlide(1), 3500);
}

function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide');
    const dots   = document.querySelectorAll('.slide-dots .dot');
    if (!slides.length) return;

    slides[currentSlide].classList.remove('active');
    dots[currentSlide]?.classList.remove('active');

    currentSlide = (currentSlide + direction + slides.length) % slides.length;

    slides[currentSlide].classList.add('active');
    dots[currentSlide]?.classList.add('active');
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const dots   = document.querySelectorAll('.slide-dots .dot');

    slides[currentSlide].classList.remove('active');
    dots[currentSlide]?.classList.remove('active');

    currentSlide = index;

    slides[currentSlide].classList.add('active');
    dots[currentSlide]?.classList.add('active');

    clearInterval(slideInterval);
    slideInterval = setInterval(() => changeSlide(1), 3500);
}


/* ============================================================
   5. MUSIK PLAYER
   ============================================================ */

function toggleMusic() {
    const audio = document.getElementById('bg-music');
    const ytFrame = document.getElementById('yt-fallback');
    
    if (usingYT) {
        // Mode YouTube
        if (musicPlaying) {
            ytFrame.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
            musicPlaying = false;
        } else {
            ytFrame.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
            musicPlaying = true;
        }
        updateMusicUI();
        return;
    }

    if (!audio) return;

    if (musicPlaying) {
        audio.pause();
        musicPlaying = false;
    } else {
        audio.play().catch(e => {
            console.warn('Musik gagal diputar:', e);
            useYouTubeFallback();
        });
        musicPlaying = true;
    }

    updateMusicUI();
}

let usingYT = false;

function useYouTubeFallback() {
    usingYT = true;
    const ytFrame = document.getElementById('yt-fallback');
    if (ytFrame) {
        ytFrame.style.display = 'none';
        // Trigger autoplay via postMessage
        setTimeout(() => {
            ytFrame.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
            musicPlaying = true;
            updateMusicUI();
        }, 1000);
    }
}

function updateMusicUI() {
    const icon  = document.getElementById('music-icon');
    const label = document.getElementById('music-label');

    if (musicPlaying) {
        icon.textContent  = '♫';
        icon.classList.add('playing');
        if (label) label.textContent = 'Memutar Lagu 🎵';
    } else {
        icon.textContent  = '♪';
        icon.classList.remove('playing');
        if (label) label.textContent = 'Lagu Cinta Kita';
    }
}


/* ============================================================
   6. POPUP SURAT CINTA
   ============================================================ */

function bukaSurat() {
    const popup = document.getElementById('popup-surat');
    if (!popup) return;

    popup.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function tutupSurat(event) {
    if (event && event.target !== document.getElementById('popup-surat')) return;

    const popup = document.getElementById('popup-surat');
    if (!popup) return;

    popup.classList.add('hidden');
    document.body.style.overflow = '';
}


/* ============================================================
   7. LIGHTBOX GALERI
   ============================================================ */

function bukaLightbox(src, caption) {
    const lightbox = document.getElementById('lightbox');
    const img      = document.getElementById('lightbox-img');
    const cap      = document.getElementById('lightbox-caption');

    if (!lightbox || !img) return;

    img.src         = src;
    img.alt         = caption;
    cap.textContent = caption;

    lightbox.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function tutupLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    lightbox.classList.add('hidden');
    document.body.style.overflow = '';
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        tutupSurat();
        tutupLightbox();
    }
});


/* ============================================================
   8. COUNTDOWN TIMER
   ============================================================ */

function initTimer() {
    const el = document.getElementById('tanggal-jadian');
    if (!el) return;

    const tanggalJadian = new Date(el.dataset.date);

    function update() {
        const now  = new Date();
        const diff = now - tanggalJadian;

        if (diff < 0) {
            ['timer-hari','timer-jam','timer-menit','timer-detik'].forEach(id => {
                const e = document.getElementById(id);
                if (e) e.textContent = '0';
            });
            return;
        }

        const totalDetik  = Math.floor(diff / 1000);
        const totalMenit  = Math.floor(totalDetik / 60);
        const totalJam    = Math.floor(totalMenit / 60);
        const totalHari   = Math.floor(totalJam / 24);

        animateCounter('timer-hari',   totalHari);
        animateCounter('timer-jam',    totalJam % 24);
        animateCounter('timer-menit',  totalMenit % 60);
        animateCounter('timer-detik',  totalDetik % 60);
    }

    update();
    setInterval(update, 1000);
}

const prevValues = {};

function animateCounter(id, newValue) {
    const el = document.getElementById(id);
    if (!el) return;

    if (prevValues[id] !== newValue) {
        el.style.transform = 'scale(1.3)';
        el.style.color     = '#e91e63';
        el.textContent     = String(newValue).padStart(2, '0');

        setTimeout(() => {
            el.style.transform = 'scale(1)';
            el.style.color     = '';
        }, 200);

        prevValues[id] = newValue;
    }
}


/* ============================================================
   9. FALLING HEARTS
   ============================================================ */

const HEART_CHARS = ['💖', '💕', '💗', '💓', '💝', '🌸', '✨', '💫', '🌷', '❤️'];

function startFallingHearts() {
    heartsInterval = setInterval(spawnHeart, 1200);
    for (let i = 0; i < 6; i++) {
        setTimeout(spawnHeart, i * 250);
    }
}

function spawnHeart() {
    const container = document.getElementById('hearts-container');
    if (!container) return;

    const heart = document.createElement('span');
    heart.className   = 'falling-heart';
    heart.textContent = HEART_CHARS[Math.floor(Math.random() * HEART_CHARS.length)];

    heart.style.left      = Math.random() * 100 + 'vw';
    heart.style.fontSize  = (Math.random() * 1.2 + 0.8) + 'rem';
    heart.style.opacity   = (Math.random() * 0.5 + 0.3).toFixed(2);

    const duration  = Math.random() * 8 + 6;
    heart.style.animationDuration = duration + 's';

    container.appendChild(heart);
    setTimeout(() => heart.remove(), duration * 1000 + 500);
}


/* ============================================================
   10. CONFETTI
   ============================================================ */

const CONFETTI_COLORS = [
    '#f48fb1', '#f06292', '#e91e63',
    '#ce93d8', '#ab47bc', '#9c27b0',
    '#fff176', '#ffcc02', '#ff8a65',
    '#80deea', '#4dd0e1',
];

function launchConfetti(count = 100) {
    const container = document.getElementById('confetti-container');
    if (!container) return;

    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';

            piece.style.left            = Math.random() * 100 + 'vw';
            piece.style.background      = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
            piece.style.width           = (Math.random() * 10 + 6) + 'px';
            piece.style.height          = (Math.random() * 10 + 6) + 'px';
            piece.style.borderRadius    = Math.random() > 0.5 ? '50%' : '2px';
            piece.style.opacity         = (Math.random() * 0.5 + 0.5).toFixed(2);

            const duration = Math.random() * 2.5 + 2;
            piece.style.animationDuration = duration + 's';
            piece.style.animationDelay    = (Math.random() * 0.5) + 's';

            container.appendChild(piece);
            setTimeout(() => piece.remove(), (duration + 0.5) * 1000);
        }, i * 15);
    }
}


/* ============================================================
   11. AOS — ANIMATE ON SCROLL
   ============================================================ */

function initAOS() {
    const elements = document.querySelectorAll('[data-aos]');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
    });

    elements.forEach(el => observer.observe(el));
}


/* ============================================================
   12. SMOOTH SCROLL
   ============================================================ */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});


/* ============================================================
   13. EASTER EGG — Double click untuk confetti
   ============================================================ */

document.addEventListener('dblclick', function() {
    launchConfetti(50);
});


/* ============================================================
   14. STYLE TRANSISI COUNTER
   ============================================================ */

(function injectCounterStyle() {
    const style = document.createElement('style');
    style.textContent = `
        #timer-hari, #timer-jam, #timer-menit, #timer-detik {
            transition: transform 0.2s ease, color 0.2s ease;
        }
    `;
    document.head.appendChild(style);
})();
