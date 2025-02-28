// Analytics et Monitoring System
const Analytics = {
    // Configuration
    config: {
        logLevel: 'info', // 'debug' | 'info' | 'warn' | 'error'
        sendInterval: 30000, // Envoyer les données toutes les 30 secondes
        maxStorageSize: 1000, // Nombre maximum d'événements stockés
    },

    // Stockage des événements
    events: [],
    performanceMetrics: {},

    // Initialisation
    init() {
        this.startPerformanceMonitoring();
        this.setupErrorTracking();
        this.setupInteractionTracking();
        this.startPeriodicDataSend();
        console.info('Analytics system initialized');
    },

    // Monitoring des performances
    startPerformanceMonitoring() {
        // Mesure du temps de chargement initial
        this.trackTiming('page_load', performance.now());

        // Observer la performance des images
        if ('PerformanceObserver' in window) {
            const imageObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    this.trackTiming('image_load', entry.duration, {
                        url: entry.name,
                        size: entry.transferSize
                    });
                });
            });

            imageObserver.observe({ entryTypes: ['resource'] });
        }

        // Mesures de performance web vitales
        if ('web-vital' in window) {
            webVitals.getCLS(metric => this.trackWebVital('CLS', metric));
            webVitals.getFID(metric => this.trackWebVital('FID', metric));
            webVitals.getLCP(metric => this.trackWebVital('LCP', metric));
        }
    },

    // Suivi des erreurs
    setupErrorTracking() {
        window.addEventListener('error', (event) => {
            this.trackError('js_error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.trackError('promise_rejection', {
                reason: event.reason
            });
        });
    },

    // Suivi des interactions
    setupInteractionTracking() {
        // Suivi des clics sur les images
        document.querySelector('.photo-gallery').addEventListener('click', (e) => {
            if (e.target.closest('.pic')) {
                this.trackEvent('image_click', {
                    imageId: e.target.closest('.pic').dataset.id
                });
            }
        });

        // Suivi des interactions avec la modale
        document.querySelector('.modal').addEventListener('click', (e) => {
            if (e.target.matches('.nav-btn')) {
                this.trackEvent('modal_navigation', {
                    direction: e.target.classList.contains('prev-btn') ? 'prev' : 'next'
                });
            }
        });

        // Suivi du scroll
        let lastScrollTime = Date.now();
        window.addEventListener('scroll', () => {
            const now = Date.now();
            if (now - lastScrollTime > 1000) { // Limiter à une fois par seconde
                this.trackEvent('page_scroll', {
                    depth: this.getScrollDepth()
                });
                lastScrollTime = now;
            }
        }, { passive: true });
    },

    // Méthodes de tracking
    trackEvent(eventName, data = {}) {
        const event = {
            timestamp: Date.now(),
            type: 'event',
            name: eventName,
            data: data
        };
        this.addToQueue(event);
    },

    trackError(errorType, errorData) {
        const event = {
            timestamp: Date.now(),
            type: 'error',
            errorType,
            ...errorData
        };
        this.addToQueue(event);
        if (this.config.logLevel === 'debug') {
            console.error('Error tracked:', errorType, errorData);
        }
    },

    trackTiming(metricName, duration, data = {}) {
        const event = {
            timestamp: Date.now(),
            type: 'timing',
            name: metricName,
            duration,
            ...data
        };
        this.addToQueue(event);
    },

    trackWebVital(name, metric) {
        this.trackTiming(`web_vital_${name.toLowerCase()}`, metric.value, {
            id: metric.id,
            delta: metric.delta
        });
    },

    // Utilitaires
    getScrollDepth() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset;
        return Math.round((scrollTop + windowHeight) / documentHeight * 100);
    },

    addToQueue(event) {
        this.events.push(event);
        if (this.events.length > this.config.maxStorageSize) {
            this.events.shift(); // Supprimer le plus ancien événement si la limite est atteinte
        }
    },

    // Envoi des données
    async sendData() {
        if (this.events.length === 0) return;

        const eventsToSend = [...this.events];
        this.events = []; // Vider la file d'attente

        try {
            // Endpoint fictif - à remplacer par votre endpoint réel
            const response = await fetch('/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    events: eventsToSend,
                    timestamp: Date.now(),
                    userAgent: navigator.userAgent,
                    screenResolution: `${window.screen.width}x${window.screen.height}`
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send analytics data');
            }
        } catch (error) {
            console.error('Analytics error:', error);
            // Remettre les événements dans la file si l'envoi échoue
            this.events.unshift(...eventsToSend);
        }
    },

    startPeriodicDataSend() {
        setInterval(() => this.sendData(), this.config.sendInterval);
    }
};

// Export pour utilisation dans d'autres fichiers
export default Analytics; 