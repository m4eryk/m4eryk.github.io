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

// Форма
class GuestForm {
    constructor(config) {
        this.config = config;
        this.form = document.getElementById(config.formElement);
        
        this.init();
    }
    
    init() {
        if (!this.form) return;
        
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.setupValidation();
    }
    
    setupValidation() {
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', utils.debounce(() => {
                this.validateInput(input);
            }, 300));
        });
    }
    
    validateInput(input) {
        const value = input.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        switch (input.type) {
            case 'text':
                isValid = value.length >= 2;
                errorMessage = 'Минимум 2 символа';
                break;
            case 'number':
                isValid = value >= 1 && value <= 5;
                errorMessage = 'От 1 до 5 гостей';
                break;
            case 'textarea':
                isValid = value.length <= 500;
                errorMessage = 'Максимум 500 символов';
                break;
        }
        
        this.updateInputStatus(input, isValid, errorMessage);
        return isValid;
    }
    
    updateInputStatus(input, isValid, errorMessage) {
        const container = input.parentElement;
        const existingError = container.querySelector('.error-message');
        
        if (!isValid) {
            input.classList.add('invalid');
            if (!existingError) {
                const error = document.createElement('div');
                error.className = 'error-message';
                error.textContent = errorMessage;
                container.appendChild(error);
            }
        } else {
            input.classList.remove('invalid');
            if (existingError) {
                existingError.remove();
            }
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const inputs = this.form.querySelectorAll('input, textarea');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateInput(input)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            this.showMessage('Пожалуйста, исправьте ошибки в форме', 'error');
            return;
        }
        
        try {
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData.entries());
            
            // Здесь можно добавить отправку данных на сервер
            console.log('Анкета гостя:', data);
            
            this.showMessage('Спасибо за ответ!');
            this.form.reset();
            
        } catch (error) {
            console.error('Ошибка при отправке формы:', error);
            this.showMessage('Произошла ошибка. Пожалуйста, попробуйте позже.', 'error');
        }
    }
    
    showMessage(text, type = 'success') {
        const message = document.createElement('div');
        message.className = `form-message ${type}`;
        message.textContent = text;
        
        this.form.parentNode.insertBefore(message, this.form.nextSibling);
        
        setTimeout(() => message.remove(), 3000);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new WeddingTimer(CONFIG);
    new GuestForm(CONFIG);
}); 