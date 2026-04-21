
/* ============================================================
   INISIALISASI GLOBAL
   ============================================================ */

// State global
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

    // Ukuran kanvas mengikuti jendela
    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // ---- Partikel (bintang & hati) ----
    const particles = [];
    const TOTAL = 90;

    // Karakter yang akan ditampilkan
    const CHARS = ['★', '✦', '✧', '♡', '♥', '❤', '✨', '·'];

    function randomBetween(a, b) {
        return a + Math.random() * (b - a);
    }

    // Buat partikel awal
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
            // Warna: pink atau ungu
            hue:  Math.random() > 0.5
                  ? `hsl(${randomBetween(330, 360)}, 80%, ${randomBetween(70, 90)}%)`
                  : `hsl(${randomBetween(270, 310)}, 70%, ${randomBetween(75, 92)}%)`,
        };
    }

    // Loop animasi
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, i) => {
            ctx.save();
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle   = p.hue;
            ctx.font        = `${p.size}px serif`;
            ctx.fillText(p.char, p.x, p.y);
            ctx.restore();

            // Gerakkan partikel ke atas
            p.y -= p.speed;
            p.x += p.drift;

            // Efek kedip halus
            p.opacity += (Math.random() - 0.5) * 0.03;
            p.opacity  = Math.min(0.9, Math.max(0.1, p.opacity));

            // Reset jika keluar layar
            if (p.y < -30) {
                particles[i] = createParticle(false);
            }
        });

        requestAnimationFrame(draw);
    }

    draw();
})();


/* ============================================================
   2. BUKA KEJUTAN — TRANSISI KE HALAMAN UTAMA
   ============================================================ */

/**
 * Dipanggil saat tombol "Buka Kejutan 🎁" diklik.
 * Menjalankan confetti, kemudian slide ke halaman utama.
 */
function bukaKejutan() {
    // Tembakkan confetti meriah
    launchConfetti(200);

    const welcomePage = document.getElementById('welcome-page');
    const mainPage    = document.getElementById('main-page');

    // Delay sedikit agar confetti terlihat
    setTimeout(() => {
        // Fade out welcome page
        welcomePage.classList.add('fade-out');

        setTimeout(() => {
            // Sembunyikan welcome, tampilkan main
            welcomePage.classList.add('hidden');
            mainPage.classList.remove('hidden');

            // Mulai efek-efek halaman utama
            initMainPage();

            // Scroll ke atas
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 900);
    }, 300);
}


/* ============================================================
   3. INISIALISASI HALAMAN UTAMA
   ============================================================ */

function initMainPage() {
    // Mulai slideshow foto
    initSlideshow();

    // Mulai falling hearts
    startFallingHearts();

    // Mulai countdown timer
    initTimer();

    // Aktifkan animasi scroll (AOS sederhana)
    initAOS();

    // Coba auto-play musik (browser mungkin memblokir)
    const audio = document.getElementById('bg-music');
    if (audio) {
        audio.play()
            .then(() => {
                musicPlaying = true;
                updateMusicUI();
            })
            .catch(() => {
                // Autoplay diblokir browser — OK, user bisa klik manual
                console.info('Autoplay diblokir. Klik tombol musik untuk play.');
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

    // Buat titik navigasi
    slides.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.onclick   = () => goToSlide(i);
        dotsWrap.appendChild(dot);
    });

    // Auto-slide setiap 3.5 detik
    slideInterval = setInterval(() => changeSlide(1), 3500);
}

/**
 * Pindah slide: +1 = next, -1 = prev
 */
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

    // Reset interval agar tidak loncat
    clearInterval(slideInterval);
    slideInterval = setInterval(() => changeSlide(1), 3500);
}


/* ============================================================
   5. MUSIK PLAYER
   ============================================================ */

/**
 * Toggle play/pause musik latar
 */
function toggleMusic() {
    const audio = document.getElementById('bg-music');
    if (!audio) return;

    if (musicPlaying) {
        audio.pause();
        musicPlaying = false;
    } else {
        audio.play().catch(e => console.warn('Musik gagal diputar:', e));
        musicPlaying = true;
    }

    updateMusicUI();
}

/**
 * Perbarui tampilan ikon musik
 */
function updateMusicUI() {
    const icon  = document.getElementById('music-icon');
    const label = document.getElementById('music-label');

    if (musicPlaying) {
        icon.textContent  = '♫';
        icon.classList.add('playing');
        label.textContent = 'Memutar Lagu 🎵';
    } else {
        icon.textContent  = '♪';
        icon.classList.remove('playing');
        label.textContent = 'Lagu Cinta Kita';
    }
}


/* ============================================================
   6. POPUP SURAT CINTA
   ============================================================ */

/**
 * Buka popup surat cinta
 */
function bukaSurat() {
    const popup = document.getElementById('popup-surat');
    if (!popup) return;

    popup.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Cegah scroll background
}

/**
 * Tutup popup surat cinta
 * @param {Event|undefined} event - event klik (opsional)
 */
function tutupSurat(event) {
    // Jika event ada, hanya tutup jika klik di overlay (bukan di dalam box)
    if (event && event.target !== document.getElementById('popup-surat')) return;

    const popup = document.getElementById('popup-surat');
    if (!popup) return;

    popup.classList.add('hidden');
    document.body.style.overflow = '';
}


/* ============================================================
   7. LIGHTBOX GALERI
   ============================================================ */

/**
 * Buka lightbox dengan gambar tertentu
 * @param {string} src     - URL gambar
 * @param {string} caption - Keterangan gambar
 */
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

/**
 * Tutup lightbox galeri
 */
function tutupLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    lightbox.classList.add('hidden');
    document.body.style.overflow = '';
}

// Tutup dengan tombol Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        tutupSurat();
        tutupLightbox();
    }
});


/* ============================================================
   8. COUNTDOWN TIMER — SEJAK TANGGAL JADIAN
   ============================================================ */

function initTimer() {
    const el = document.getElementById('tanggal-jadian');
    if (!el) return;

    const tanggalJadian = new Date(el.dataset.date);

    function update() {
        const now  = new Date();
        const diff = now - tanggalJadian; // milidetik

        if (diff < 0) {
            // Tanggal jadian di masa depan (tidak valid)
            document.getElementById('timer-hari').textContent   = '0';
            document.getElementById('timer-jam').textContent    = '0';
            document.getElementById('timer-menit').textContent  = '0';
            document.getElementById('timer-detik').textContent  = '0';
            return;
        }

        const totalDetik  = Math.floor(diff / 1000);
        const totalMenit  = Math.floor(totalDetik / 60);
        const totalJam    = Math.floor(totalMenit / 60);
        const totalHari   = Math.floor(totalJam / 24);

        const detik = totalDetik % 60;
        const menit = totalMenit % 60;
        const jam   = totalJam   % 24;
        const hari  = totalHari;

        // Update elemen dengan animasi angka
        animateCounter('timer-hari',   hari);
        animateCounter('timer-jam',    jam);
        animateCounter('timer-menit',  menit);
        animateCounter('timer-detik',  detik);
    }

    // Jalankan sekarang dan setiap detik
    update();
    setInterval(update, 1000);
}

/** Cache nilai sebelumnya untuk animasi */
const prevValues = {};

/**
 * Animasikan perubahan angka counter
 */
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
   9. FALLING HEARTS — HATI JATUH
   ============================================================ */

const HEART_CHARS = ['💖', '💕', '💗', '💓', '💝', '🌸', '✨', '💫', '🌷', '❤️'];

/**
 * Mulai animasi hati jatuh secara berkala
 */
function startFallingHearts() {
    // Spawn satu hati setiap 1.2 detik
    heartsInterval = setInterval(spawnHeart, 1200);

    // Spawn beberapa sekaligus di awal
    for (let i = 0; i < 6; i++) {
        setTimeout(spawnHeart, i * 250);
    }
}

/**
 * Buat satu elemen hati jatuh
 */
function spawnHeart() {
    const container = document.getElementById('hearts-container');
    if (!container) return;

    const heart = document.createElement('span');
    heart.className   = 'falling-heart';
    heart.textContent = HEART_CHARS[Math.floor(Math.random() * HEART_CHARS.length)];

    // Posisi horizontal acak
    heart.style.left      = Math.random() * 100 + 'vw';
    heart.style.fontSize  = (Math.random() * 1.2 + 0.8) + 'rem';
    heart.style.opacity   = (Math.random() * 0.5 + 0.3).toFixed(2);

    // Durasi jatuh acak (6–14 detik)
    const duration  = Math.random() * 8 + 6;
    heart.style.animationDuration = duration + 's';

    container.appendChild(heart);

    // Hapus setelah animasi selesai
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

/**
 * Tembakkan confetti
 * @param {number} count - Jumlah serpihan confetti
 */
function launchConfetti(count = 100) {
    const container = document.getElementById('confetti-container');
    if (!container) return;

    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';

            // Posisi dan gaya acak
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

            // Bersihkan setelah animasi
            setTimeout(() => piece.remove(), (duration + 0.5) * 1000);
        }, i * 15);
    }
}


/* ============================================================
  11. AOS — ANIMATE ON SCROLL (SEDERHANA)
   ============================================================ */

function initAOS() {
    const elements = document.querySelectorAll('[data-aos]');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
                // Hanya animasi sekali
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
  12. SMOOTH SCROLL UNTUK LINK ANCHOR
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
  13. EASTER EGG — Klik logo/judul untuk confetti kecil
   ============================================================ */

document.addEventListener('dblclick', function() {
    launchConfetti(50);
});


/* ============================================================
  14. STYLE TRANSISI COUNTER (injeksi inline untuk performa)
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

let music = document.getElementById("music");
let isPlaying = false;

function toggleMusic() {
    if (isPlaying) {
        music.pause();
    } else {
        music.play();
    }
    isPlaying = !isPlaying;
}