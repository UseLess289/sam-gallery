import Storage from './storage.js';

class StatsDashboard {
    constructor() {
        this.storage = Storage;
        this.chart = null;
        this.setupEventListeners();
        this.refreshStats();
    }

    setupEventListeners() {
        document.getElementById('refreshStats').addEventListener('click', () => this.refreshStats());
        document.getElementById('exportData').addEventListener('click', () => this.exportData());
        document.getElementById('clearData').addEventListener('click', () => this.clearData());
    }

    async refreshStats() {
        const events = this.storage.getEvents();
        const metrics = this.storage.getMetrics();

        this.updatePerformanceStats(events, metrics);
        this.updateInteractionStats(events);
        this.updateErrorStats(events);
        this.updatePopularImages(events);
        this.updateActivityChart(events);
    }

    updatePerformanceStats(events, metrics) {
        // Temps de chargement moyen
        const loadTimes = events
            .filter(e => e.type === 'timing' && e.name === 'page_load')
            .map(e => e.duration);
        
        const avgLoadTime = loadTimes.length > 0
            ? Math.round(loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length)
            : 0;

        document.getElementById('pageLoadTime').querySelector('.value')
            .textContent = `${avgLoadTime}ms`;

        // Temps de chargement des images
        const imageLoadTimes = events
            .filter(e => e.type === 'timing' && e.name === 'image_load')
            .map(e => e.duration);
        
        const avgImageLoadTime = imageLoadTimes.length > 0
            ? Math.round(imageLoadTimes.reduce((a, b) => a + b, 0) / imageLoadTimes.length)
            : 0;

        document.getElementById('imageLoadTime').querySelector('.value')
            .textContent = `${avgImageLoadTime}ms`;

        // Web Vitals
        const webVitals = {
            lcp: events.find(e => e.name === 'web_vital_lcp')?.value || '--',
            fid: events.find(e => e.name === 'web_vital_fid')?.value || '--',
            cls: events.find(e => e.name === 'web_vital_cls')?.value || '--'
        };

        document.getElementById('lcp').textContent = `${webVitals.lcp}ms`;
        document.getElementById('fid').textContent = `${webVitals.fid}ms`;
        document.getElementById('cls').textContent = webVitals.cls;
    }

    updateInteractionStats(events) {
        // Visites totales (sessions uniques)
        const visits = new Set(events
            .filter(e => e.type === 'event' && e.name === 'page_load')
            .map(e => e.data?.sessionId)
        ).size;

        document.getElementById('totalVisits').querySelector('.value')
            .textContent = visits;

        // Images consultées
        const imageClicks = events
            .filter(e => e.type === 'event' && e.name === 'image_click')
            .length;

        document.getElementById('imageClicks').querySelector('.value')
            .textContent = imageClicks;

        // Temps moyen sur la page
        const sessions = this.groupEventsBySession(events);
        const avgTime = this.calculateAverageSessionDuration(sessions);

        document.getElementById('avgTimeOnPage').querySelector('.value')
            .textContent = this.formatDuration(avgTime);
    }

    updateErrorStats(events) {
        const errors = events.filter(e => e.type === 'error');
        
        document.getElementById('totalErrors').querySelector('.value')
            .textContent = errors.length;

        const recentErrorsList = document.getElementById('recentErrors');
        recentErrorsList.innerHTML = '';

        errors.slice(-5).reverse().forEach(error => {
            const li = document.createElement('li');
            li.textContent = `${new Date(error.timestamp).toLocaleString()}: ${error.message}`;
            recentErrorsList.appendChild(li);
        });
    }

    updatePopularImages(events) {
        const imageClicks = events
            .filter(e => e.type === 'event' && e.name === 'image_click')
            .reduce((acc, e) => {
                const id = e.data.imageId;
                acc[id] = (acc[id] || 0) + 1;
                return acc;
            }, {});

        const popularImagesDiv = document.getElementById('popularImages');
        popularImagesDiv.innerHTML = '';

        Object.entries(imageClicks)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .forEach(([imageId, clicks]) => {
                const div = document.createElement('div');
                div.className = 'image-stat-item';
                div.innerHTML = `
                    <img src="${imageId}" alt="Image populaire">
                    <span>${clicks} vues</span>
                `;
                popularImagesDiv.appendChild(div);
            });
    }

    updateActivityChart(events) {
        const ctx = document.getElementById('activityChart').getContext('2d');
        
        const last7Days = this.getLast7DaysData(events);

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days.map(d => d.date),
                datasets: [{
                    label: 'Activité',
                    data: last7Days.map(d => d.count),
                    borderColor: '#9f0000',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#333'
                        },
                        ticks: {
                            color: '#fff'
                        }
                    },
                    x: {
                        grid: {
                            color: '#333'
                        },
                        ticks: {
                            color: '#fff'
                        }
                    }
                }
            }
        });
    }

    getLast7DaysData(events) {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push({
                date: date.toLocaleDateString(),
                count: 0
            });
        }

        events.forEach(event => {
            const eventDate = new Date(event.timestamp).toLocaleDateString();
            const day = days.find(d => d.date === eventDate);
            if (day) {
                day.count++;
            }
        });

        return days;
    }

    groupEventsBySession(events) {
        return events.reduce((acc, event) => {
            const sessionId = event.data?.sessionId;
            if (!sessionId) return acc;
            
            if (!acc[sessionId]) {
                acc[sessionId] = [];
            }
            acc[sessionId].push(event);
            return acc;
        }, {});
    }

    calculateAverageSessionDuration(sessions) {
        const durations = Object.values(sessions).map(sessionEvents => {
            const timestamps = sessionEvents.map(e => e.timestamp);
            return Math.max(...timestamps) - Math.min(...timestamps);
        });

        return durations.length > 0
            ? durations.reduce((a, b) => a + b, 0) / durations.length
            : 0;
    }

    formatDuration(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}m ${seconds}s`;
    }

    exportData() {
        const data = {
            events: this.storage.getEvents(),
            metrics: this.storage.getMetrics()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `sam-gallery-stats-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async clearData() {
        if (confirm('Êtes-vous sûr de vouloir effacer toutes les données de statistiques ?')) {
            localStorage.clear();
            this.refreshStats();
        }
    }
}

// Initialisation du tableau de bord
new StatsDashboard(); 