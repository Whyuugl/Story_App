const API_BASE_URL = 'https://story-api.dicoding.dev/v1';

export const API_ENDPOINTS = {
    REGISTER: `${API_BASE_URL}/register`,
    LOGIN: `${API_BASE_URL}/login`,
    STORIES: `${API_BASE_URL}/stories`,
    STORIES_GUEST: `${API_BASE_URL}/stories/guest`,
    NOTIFICATIONS: `${API_BASE_URL}/notifications/subscribe`
};

export const MAP_CONFIG = {
    DEFAULT_ZOOM: 5,
    DEFAULT_CENTER: [-2.5489, 118.0149], // Center of Indonesia
    TILE_LAYERS: [
        {
            name: 'OpenStreetMap',
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '© OpenStreetMap contributors'
        },
        {
            name: 'Satellite',
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            attribution: '© Esri'
        },
        {
            name: 'Topographic',
            url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
            attribution: '© OpenTopoMap'
        }
    ]
};

export const ROUTES = {
    HOME: '#/',
    STORIES: '#/stories',
    SAVED_STORIES: '#/saved-stories',
    ADD_STORY: '#/add-story',
    LOGIN: '#/login',
    REGISTER: '#/register'
}; 