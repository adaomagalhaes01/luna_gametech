// Service Worker - Jornada da Coelha
const CACHE_NAME = 'jornada-coelha-v2';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './src/main.js',
    './src/scenes/BootScene.js',
    './src/scenes/MenuScene.js',
    './src/scenes/CharacterSelectScene.js',
    './src/scenes/GameScene.js',
    './src/scenes/UIScene.js',
    './src/systems/Player.js',
    './src/systems/EnemyAI.js',
    './src/systems/CombatSystem.js',
    './src/systems/CollisionSystem.js',
    './src/systems/HUD.js'
];

// Install
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

// Activate
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch - Network first, then cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
