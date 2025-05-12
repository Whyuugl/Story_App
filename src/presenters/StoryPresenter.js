import { MAP_CONFIG, ROUTES } from '../config/config.js';
import { StoryModel } from '../models/StoryModel.js';
import { StoryView } from '../views/StoryView.js';
import Database from '../utils/database';

export class StoryPresenter {
    constructor() {
        this.model = new StoryModel();
        this.view = new StoryView();
        this.map = null;
        this.marker = null;
        this.setupAuthButton();
    }

    setupAuthButton() {
        const authButton = document.getElementById('auth-button');
        if (!authButton) return;

        const updateAuthButton = () => {
            const isAuthenticated = this.model.isAuthenticated();
            const icon = authButton.querySelector('i');
            const text = authButton.querySelector('span');

            if (isAuthenticated) {
                icon.className = 'fas fa-sign-out-alt';
                text.textContent = 'Sign Out';
                authButton.onclick = () => this.logout();
            } else {
                icon.className = 'fas fa-sign-in-alt';
                text.textContent = 'Sign In';
                authButton.onclick = () => {
                    window.location.hash = ROUTES.LOGIN;
                    this.showLoginForm();
                };
            }
        };

        // Update button on auth state changes
        this.model.onAuthStateChange = updateAuthButton;
        updateAuthButton();
    }

    logout() {
        this.model.logout();
        window.location.hash = ROUTES.LOGIN;
    }

    async init() {
        // Check authentication status first
        if (!this.model.isAuthenticated()) {
            window.location.hash = ROUTES.LOGIN;
        }
        this.setupRouter();
        this.handleRoute();
    }

    setupRouter() {
        window.addEventListener('hashchange', () => {
            console.log('Hash changed:', window.location.hash);
            this.handleRoute();
        });
    }

    handleRoute() {
        const hash = window.location.hash;
        console.log('Current hash:', hash);
        console.log('Is authenticated:', this.model.isAuthenticated());
        
        // If no hash or hash is home, redirect to login if not authenticated
        if (!hash || hash === '#' || hash === ROUTES.HOME) {
            console.log('No hash or home route, checking auth...');
            if (this.model.isAuthenticated()) {
                console.log('Authenticated, showing home');
                this.showHome();
            } else {
                console.log('Not authenticated, redirecting to login');
                window.location.hash = ROUTES.LOGIN;
                this.showLoginForm();
            }
            return;
        }

        // For all other routes, check authentication first
        if (!this.model.isAuthenticated() && hash !== ROUTES.LOGIN && hash !== ROUTES.REGISTER) {
            console.log('Not authenticated, redirecting to login');
            window.location.hash = ROUTES.LOGIN;
            this.showLoginForm();
            return;
        }

        // Handle authenticated routes
        switch (hash) {
            case ROUTES.HOME:
                console.log('Home route');
                this.showHome();
                break;
            case ROUTES.LOGIN:
                console.log('Login route');
                this.showLoginForm();
                break;
            case ROUTES.REGISTER:
                console.log('Register route');
                this.showRegisterForm();
                break;
            case ROUTES.STORIES:
                this.loadStories();
                break;
            case ROUTES.SAVED_STORIES:
                this.loadSavedStories();
                break;
            case ROUTES.ADD_STORY:
                this.showAddStoryForm();
                break;
            default:
                console.log('Unknown route, redirecting to home');
                window.location.hash = ROUTES.HOME;
        }
    }

    showLoginForm() {
        this.view.renderLoginForm();
        this.setupLoginForm();
        this.setupAuthLinks();
    }

    showRegisterForm() {
        this.view.renderRegisterForm();
        this.setupRegisterForm();
        this.setupAuthLinks();
    }

    setupLoginForm() {
        const form = document.getElementById('login-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = form.email.value;
            const password = form.password.value;

            try {
                const success = await this.model.login(email, password);
                if (success) {
                    window.location.hash = ROUTES.HOME;
                } else {
                    this.view.showError('Login failed. Please check your credentials.');
                }
            } catch (error) {
                console.error('Login error:', error);
                this.view.showError(error.message || 'An error occurred during login. Please try again.');
            }
        });
    }

    setupRegisterForm() {
        const form = document.getElementById('register-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = form.name.value;
            const email = form.email.value;
            const password = form.password.value;

            try {
                const success = await this.model.register(name, email, password);
                if (success) {
                    this.view.showSuccess('Registration successful! Please login with your credentials.');
                    window.location.hash = ROUTES.LOGIN;
                } else {
                    this.view.showError('Registration failed. Please try again.');
                }
            } catch (error) {
                console.error('Registration error:', error);
                this.view.showError(error.message || 'An error occurred during registration. Please try again.');
            }
        });
    }

    async loadStories() {
        try {
            const stories = await this.model.fetchStories();
            if (!stories || stories.length === 0) {
                this.view.showError('No stories found. Be the first to share your story!');
            } else {
                this.view.renderStories(stories);
            }
        } catch (error) {
            console.error('Error loading stories:', error);
            this.view.showError('Failed to load stories. Please try again later.');
        }
    }

    async loadSavedStories() {
        try {
            const stories = await Database.getAllStories();
            if (!stories || stories.length === 0) {
                this.view.showError('No saved stories yet. Start saving your favorite stories!');
            } else {
                this.view.renderStories(stories);
            }
        } catch (error) {
            console.error('Error loading saved stories:', error);
            this.view.showError('Failed to load saved stories. Please try again later.');
        }
    }

    showAddStoryForm() {
        this.view.renderAddStoryForm();
        setTimeout(() => this.setupMap(), 0);
        this.setupAddStoryForm();
    }

    setupMap() {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
            console.error('Map container not found');
            return;
        }

        if (!this.map) {
            this.map = L.map('map').setView(MAP_CONFIG.DEFAULT_CENTER, MAP_CONFIG.DEFAULT_ZOOM);
            
            // Create base layers
            const baseLayers = {};
            MAP_CONFIG.TILE_LAYERS.forEach(layer => {
                baseLayers[layer.name] = L.tileLayer(layer.url, {
                    attribution: layer.attribution
                });
            });

            // Add default layer
            baseLayers[MAP_CONFIG.TILE_LAYERS[0].name].addTo(this.map);

            // Add layer control
            L.control.layers(baseLayers).addTo(this.map);

            this.map.on('click', (e) => {
                if (this.marker) {
                    this.map.removeLayer(this.marker);
                }
                this.marker = L.marker(e.latlng).addTo(this.map);
                document.getElementById('lat').value = e.latlng.lat;
                document.getElementById('lon').value = e.latlng.lng;
            });
        }
    }

    setupAddStoryForm() {
        const form = document.getElementById('add-story-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Create new FormData with only required fields
            const formData = new FormData();
            const photo = form.querySelector('input[name="photo"]').files[0];
            const description = form.querySelector('textarea[name="description"]').value;
            const lat = form.querySelector('input[name="lat"]').value;
            const lon = form.querySelector('input[name="lon"]').value;
            
            // Add only required fields
            formData.append('photo', photo);
            formData.append('description', description);
            formData.append('lat', lat);
            formData.append('lon', lon);
            
            try {
                const success = await this.model.addStory(formData);
                if (success) {
                    this.view.showSuccess('Story added successfully!');
                    window.location.hash = ROUTES.STORIES;
                } else {
                    this.view.showError('Failed to add story. Please try again.');
                }
            } catch (error) {
                console.error('Error adding story:', error);
                this.view.showError(error.message || 'An error occurred while adding your story. Please try again.');
            }
        });
    }

    async showHome() {
        try {
            const stories = await this.model.fetchStories();
            this.view.renderHome(stories);
        } catch (error) {
            console.error('Error loading stories for home page:', error);
            this.view.renderHome([]); // Render home page with empty stories array
        }
    }

    setupAuthLinks() {
        const authLinks = document.querySelectorAll('.auth-link');
        console.log('Setting up auth links:', authLinks.length);
        authLinks.forEach(link => {
            const href = link.getAttribute('href');
            console.log('Found auth link with href:', href);
            link.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Auth link clicked, navigating to:', href);
                window.location.hash = href;
            });
        });
    }
} 