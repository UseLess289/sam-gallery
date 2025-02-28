// Système de stockage local pour les analytics
const Storage = {
    // Clés de stockage
    KEYS: {
        EVENTS: 'sam_gallery_events',
        METRICS: 'sam_gallery_metrics',
        LAST_SEND: 'sam_gallery_last_send'
    },

    // Initialisation
    init() {
        if (!this.isStorageAvailable()) {
            console.warn('LocalStorage n\'est pas disponible');
            return false;
        }
        return true;
    },

    // Vérifier si le stockage local est disponible
    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    },

    // Sauvegarder des événements
    saveEvents(events) {
        try {
            const existingEvents = this.getEvents();
            const updatedEvents = [...existingEvents, ...events].slice(-1000); // Garder les 1000 derniers événements
            localStorage.setItem(this.KEYS.EVENTS, JSON.stringify(updatedEvents));
            return true;
        } catch (e) {
            console.error('Erreur lors de la sauvegarde des événements:', e);
            return false;
        }
    },

    // Récupérer les événements
    getEvents() {
        try {
            const events = localStorage.getItem(this.KEYS.EVENTS);
            return events ? JSON.parse(events) : [];
        } catch (e) {
            console.error('Erreur lors de la récupération des événements:', e);
            return [];
        }
    },

    // Sauvegarder des métriques
    saveMetrics(metrics) {
        try {
            localStorage.setItem(this.KEYS.METRICS, JSON.stringify(metrics));
            return true;
        } catch (e) {
            console.error('Erreur lors de la sauvegarde des métriques:', e);
            return false;
        }
    },

    // Récupérer les métriques
    getMetrics() {
        try {
            const metrics = localStorage.getItem(this.KEYS.METRICS);
            return metrics ? JSON.parse(metrics) : {};
        } catch (e) {
            console.error('Erreur lors de la récupération des métriques:', e);
            return {};
        }
    },

    // Mettre à jour la date du dernier envoi
    updateLastSend() {
        try {
            localStorage.setItem(this.KEYS.LAST_SEND, Date.now().toString());
            return true;
        } catch (e) {
            console.error('Erreur lors de la mise à jour de la date d\'envoi:', e);
            return false;
        }
    },

    // Récupérer la date du dernier envoi
    getLastSend() {
        try {
            const lastSend = localStorage.getItem(this.KEYS.LAST_SEND);
            return lastSend ? parseInt(lastSend) : 0;
        } catch (e) {
            console.error('Erreur lors de la récupération de la date d\'envoi:', e);
            return 0;
        }
    },

    // Nettoyer les données anciennes
    cleanup() {
        try {
            const now = Date.now();
            const events = this.getEvents().filter(event => 
                now - event.timestamp < 30 * 24 * 60 * 60 * 1000 // Garder 30 jours
            );
            this.saveEvents(events);
            return true;
        } catch (e) {
            console.error('Erreur lors du nettoyage des données:', e);
            return false;
        }
    }
};

export default Storage; 