// Конфигурация
const CONFIG = {
    weddingDate: '2025-08-22T16:00:00', 
    updateInterval: 1000,
    timerElement: 'timer',
    formElement: 'guestForm'
};

// Утилиты
const utils = {
    formatTime: (value) => String(value).padStart(2, '0'),
    
    calculateTimeLeft: (weddingDate) => {
        const now = new Date();
        const diff = Math.max(0, new Date(weddingDate) - now);
        
        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / 1000 / 60) % 60),
            seconds: Math.floor((diff / 1000) % 60)
        };
    },
    
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Таймер
class WeddingTimer {
    constructor(config) {
        this.config = config;
        this.timerElement = document.getElementById(config.timerElement);
        this.lastUpdate = 0;
        this.isVisible = false;
        
        this.init();
    }
    
    init() {
        if (!this.timerElement) return;
        
        // Проверяем видимость элемента
        const observer = new IntersectionObserver(
            (entries) => {
                this.isVisible = entries[0].isIntersecting;
                if (this.isVisible) {
                    this.update();
                }
            },
            { threshold: 0.1 }
        );
        
        observer.observe(this.timerElement);
        
        // Обновляем таймер
        this.update();
        setInterval(() => this.update(), this.config.updateInterval);
    }
    
    update() {
        if (!this.isVisible) return;
        
        const now = Date.now();
        if (now - this.lastUpdate < this.config.updateInterval) return;
        
        const timeLeft = utils.calculateTimeLeft(this.config.weddingDate);
        this.timerElement.textContent = 
            `${timeLeft.days} дн ${utils.formatTime(timeLeft.hours)} ч ${utils.formatTime(timeLeft.minutes)} м`;
        
        this.lastUpdate = now;
    }
}

class Music {
    constructor() {
        this.audio = new Audio('./files/music/Instrumental.mp3');
        this.audio.loop = true;
        this.audio.volume = 0.1;
        this.init();
    }

    init() {
        const playPromise = this.audio.play();

        if (playPromise !== undefined) {
            playPromise
              .then(() => {
                  // Успешное воспроизведение
                  console.log('Музыка играет');
                  const button = document.getElementById('playButton');
                  button.src = './files/images/music-on.png';
              })
              .catch(error => {
                  // Браузер заблокировал автовоспроизведение
                  console.log('Автовоспроизведение заблокировано:', error);
                  this.showPlayButton();
              });
        }
    }

    showPlayButton() {
        const button = document.getElementById('playButton');

        button.addEventListener('click', () => {
            if (this.audio.paused) {
                button.src = 'files/images/music-on.png';
                this.audio.play();

                return;
            }

            button.src = 'files/images/music-off.png';
            this.audio.pause();
        });
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new WeddingTimer(CONFIG);
    new Music();
});