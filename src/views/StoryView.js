import { MAP_CONFIG } from '../config/config.js';
import Database from '../utils/database';

export class StoryView {
    constructor() {
        this.app = document.getElementById('app');
        this.skipContainer = document.getElementById('skip-container');
        this.setupSkipLink();
        this.setupLogoListener();
        
        // Setup logo listener after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.setupLogoListener();
        }, 100);
    }

    setupTabListener() {
        // Add event listener for first tab press
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const skipLink = this.skipContainer.querySelector('.skip-link');
                if (skipLink) {
                    skipLink.style.display = 'block';
                    skipLink.style.opacity = '1';
                    skipLink.style.top = '16px';
                    skipLink.focus();
                }
                // Remove the listener after first tab
                document.removeEventListener('keydown', this.setupTabListener);
            }
        });
    }

    setupSkipLink() {
        // Create skip link if it doesn't exist
        let skipLink = document.querySelector('.skip-to-content');
        if (!skipLink) {
            skipLink = document.createElement('a');
            skipLink.href = '#main-content';
            skipLink.className = 'skip-to-content';
            skipLink.textContent = 'Skip to main content';
            skipLink.setAttribute('tabindex', '0');
            
            // Add click handler to prevent default behavior
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const mainContent = document.getElementById('main-content');
                if (mainContent) {
                    mainContent.focus();
                }
            });
            
            document.body.insertBefore(skipLink, document.body.firstChild);
        }
    }

    setupLogoListener() {
        const appLogo = document.querySelector('.app-logo');
        console.log('Setting up logo listener:', appLogo); // Debug log

        if (appLogo) {
            appLogo.addEventListener('focus', () => {
                // Setup tab listener when logo is focused
                this.setupTabListener();
            });
        }
    }

    renderLoginForm() {
        const content = `
            <main id="main-content" class="auth-container page-transition" tabindex="-1">
                <form id="login-form" class="auth-form">
                    <h2>Login</h2>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required aria-required="true">
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required aria-required="true">
                    </div>
                    <button type="submit" class="submit-button">Login</button>
                    <div class="auth-links">
                        <p>Don't have an account? <a href="#/register" class="auth-link">Register here</a></p>
                    </div>
                </form>
            </main>
        `;
        document.getElementById('app').innerHTML = content;
    }

    renderRegisterForm() {
        const content = `
            <main id="main-content" class="auth-container page-transition" tabindex="-1">
                <form id="register-form" class="auth-form">
                    <h2>Register</h2>
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" id="name" name="name" required aria-required="true">
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required 
                               pattern="[^\\s@]+@[^\\s@]+\\.[^\\s@]+"
                               title="Please enter a valid email address"
                               aria-required="true">
                        <small class="form-text">Enter a valid email address</small>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required 
                               minlength="8" pattern=".{8,}" 
                               title="Password must be at least 8 characters long"
                               aria-required="true">
                        <small class="form-text">Password must be at least 8 characters long</small>
                    </div>
                    <button type="submit" class="submit-button">Register</button>
                    <div class="auth-links">
                        <p>Already have an account? <a href="#/login" class="auth-link">Login here</a></p>
                    </div>
                </form>
            </main>
        `;
        document.getElementById('app').innerHTML = content;
    }

    async renderStories(stories) {
        // Get saved stories from IndexedDB
        const savedStories = await Database.getAllStories();
        const savedStoryIds = new Set(savedStories.map(story => story.id));

        const content = `
            <main id="main-content" class="stories-container page-transition" tabindex="-1">
                ${stories.map(story => this.createStoryCard(story, savedStoryIds.has(story.id))).join('')}
            </main>
        `;
        this.app.innerHTML = content;

        // Add event listeners for save buttons
        document.querySelectorAll('.save-story').forEach((button) => {
            button.addEventListener('click', async (event) => {
                const storyCard = event.target.closest('.story-card');
                const storyId = storyCard.dataset.id;
                const isSaved = button.classList.contains('saved');

                try {
                    if (isSaved) {
                        await Database.deleteStory(storyId);
                        button.classList.remove('saved');
                        button.querySelector('i').className = 'far fa-bookmark';
                    } else {
                        const story = stories.find(s => String(s.id) === String(storyId));
                        console.log('Story to save:', story);
                        if (!story || !story.id) {
                            alert('Story data is invalid or missing id!');
                            return;
                        }
                        await Database.addStory(story);
                        button.classList.add('saved');
                        button.querySelector('i').className = 'fas fa-bookmark';
                    }
                } catch (error) {
                    console.error('Error saving/deleting story:', error);
                    this.showError('Failed to save/delete story');
                }
            });
        });
    }

    createStoryCard(story, isSaved = false) {
        return `
            <article class="story-card" data-id="${story.id}" aria-labelledby="story-title-${story.id}">
                <img src="${story.photoUrl}" alt="${story.description}" class="story-image">
                <div class="story-content">
                    <h2 class="story-title" id="story-title-${story.id}">${story.name}</h2>
                    <p>${story.description}</p>
                    <div class="story-footer">
                        <span class="story-date">Posted on: ${new Date(story.createdAt).toLocaleDateString()}</span>
                        <button class="save-story ${isSaved ? 'saved' : ''}" aria-label="Save story">
                            <i class="${isSaved ? 'fas' : 'far'} fa-bookmark"></i>
                        </button>
                    </div>
                </div>
            </article>
        `;
    }

    renderAddStoryForm() {
        const content = `
            <main id="main-content" class="add-story-container page-transition" tabindex="-1">
                <h2>Add New Story</h2>
                <form id="add-story-form" class="story-form">
                    <div class="form-group">
                        <label for="photo">Photo</label>
                        <div class="photo-options">
                            <label class="photo-option">
                                <input type="file" 
                                       id="photo-gallery" 
                                       name="photo" 
                                       accept="image/*"
                                       required
                                       aria-required="true">
                                <span class="option-button">
                                    <i class="fas fa-images" aria-hidden="true"></i>
                                    Choose from Gallery
                                </span>
                            </label>
                            <label class="photo-option" id="open-camera">
                                <input type="button" style="display: none;">
                                <span class="option-button">
                                    <i class="fas fa-camera" aria-hidden="true"></i>
                                    Take Photo
                                </span>
                            </label>
                        </div>
                        <div id="camera-preview" style="display: none;" aria-live="polite">
                            <video id="video" autoplay playsinline style="width: 100%; border-radius: var(--border-radius);" aria-label="Camera preview"></video>
                            <div class="camera-controls">
                                <button type="button" id="capture-btn" class="capture-button">
                                    <i class="fas fa-camera" aria-hidden="true"></i>
                                    Capture Photo
                                </button>
                                <button type="button" id="close-camera" class="close-camera-button">
                                    <i class="fas fa-times" aria-hidden="true"></i>
                                </button>
                            </div>
                            <canvas id="canvas" style="display: none;" aria-hidden="true"></canvas>
                        </div>
                        <div id="photo-preview" style="display: none;" aria-live="polite">
                            <img id="preview-image" src="" alt="Captured photo" style="width: 100%; border-radius: var(--border-radius);">
                            <div class="photo-status">
                                <i class="fas fa-check-circle" aria-hidden="true"></i>
                                <span>Photo captured successfully!</span>
                            </div>
                        </div>
                        <small class="form-text">Select a photo to upload</small>
                    </div>
                    <div class="form-group description-container">
                        <label for="description">Description</label>
                        <textarea id="description" 
                                name="description" 
                                required 
                                aria-required="true"
                                placeholder="Tell your story..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Location</label>
                        <div id="map" style="height: 300px; border-radius: var(--border-radius);" aria-label="Map for selecting location"></div>
                        <input type="hidden" id="lat" name="lat" required aria-required="true">
                        <input type="hidden" id="lon" name="lon" required aria-required="true">
                        <small class="form-text">Click on the map to set location</small>
                    </div>
                    <button type="submit" class="submit-button">Add Story</button>
                </form>
            </main>
        `;
        document.getElementById('app').innerHTML = content;
        this.setupCamera();
    }

    setupCamera() {
        const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        const captureBtn = document.getElementById('capture-btn');
        const openCameraBtn = document.getElementById('open-camera');
        const closeCameraBtn = document.getElementById('close-camera');
        const cameraPreview = document.getElementById('camera-preview');
        const photoPreview = document.getElementById('photo-preview');
        const previewImage = document.getElementById('preview-image');
        const photoInput = document.getElementById('photo-gallery');
        let stream = null;

        // Function to start camera
        async function startCamera() {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        facingMode: 'environment',
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    } 
                });
                video.srcObject = stream;
                cameraPreview.style.display = 'block';
                photoPreview.style.display = 'none';
            } catch (err) {
                console.error('Error accessing camera:', err);
                alert('Could not access camera. Please check permissions and try again.');
            }
        }

        // Function to stop camera
        function stopCamera() {
            if (stream) {
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
                stream = null;
            }
            cameraPreview.style.display = 'none';
        }

        // Function to capture photo
        function capturePhoto() {
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Convert canvas to blob
            canvas.toBlob((blob) => {
                const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                photoInput.files = dataTransfer.files;
                
                // Show preview
                previewImage.src = URL.createObjectURL(blob);
                photoPreview.style.display = 'block';
                stopCamera();
            }, 'image/jpeg', 0.95);
        }

        // Event listeners
        openCameraBtn.addEventListener('click', startCamera);
        closeCameraBtn.addEventListener('click', stopCamera);
        captureBtn.addEventListener('click', capturePhoto);
    }

    renderHome(stories = []) {
        const content = `
            <div class="home-container page-transition">
                <main id="main-content" tabindex="-1">
                    <div class="home-header">
                        <h1>Welcome to Story App</h1>
                        <p class="subtitle">Share your stories, connect with others</p>
                    </div>
                    <div class="home-content">
                        <div class="feature-card">
                            <div class="card-icon">
                                <i class="fas fa-book-open" aria-hidden="true"></i>
                            </div>
                            <div class="card-content">
                                <h2>Read Stories</h2>
                                <p>Discover and read interesting stories from around the world. Join our community of storytellers and readers.</p>
                                <a href="#/stories" class="btn-primary">
                                    <span>Browse Stories</span>
                                    <i class="fas fa-arrow-right" aria-hidden="true"></i>
                                </a>
                            </div>
                        </div>
                        <div class="feature-card">
                            <div class="card-icon">
                                <i class="fas fa-plus-circle" aria-hidden="true"></i>
                            </div>
                            <div class="card-content">
                                <h2>Share Your Story</h2>
                                <p>Create and share your own stories with the community. Let your voice be heard and inspire others.</p>
                                <a href="#/add-story" class="btn-primary">
                                    <span>Add Story</span>
                                    <i class="fas fa-arrow-right" aria-hidden="true"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="map-container">
                        <h2>Story Locations</h2>
                        <div id="home-map" style="height: 400px; border-radius: var(--border-radius);" aria-label="Map showing story locations"></div>
                    </div>
                </main>
            </div>
        `;
        document.getElementById('app').innerHTML = content;
        this.setupHomeMap(stories);
    }

    setupHomeMap(stories) {
        // Pastikan container map sudah ada
        const mapContainer = document.getElementById('home-map');
        if (!mapContainer) {
            console.error('Map container not found');
            return;
        }

        // Hapus map yang sudah ada jika ada
        if (this.map) {
            this.map.remove();
        }

        // Inisialisasi map baru
        this.map = L.map('home-map').setView(MAP_CONFIG.DEFAULT_CENTER, MAP_CONFIG.DEFAULT_ZOOM);
        
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
        const layerControl = L.control.layers(baseLayers).addTo(this.map);
        layerControl.getContainer().id = 'map-layer-control';

        // Filter stories with valid coordinates
        const storiesWithLocation = stories.filter(story => {
            const hasLocation = story.lat && story.lon;
            if (!hasLocation) {
                console.log('Story without location:', story);
            }
            return hasLocation;
        });

        // Add markers for each story
        storiesWithLocation.forEach(story => {
            const marker = L.marker([story.lat, story.lon]).addTo(this.map);
            const userInitial = story.name.charAt(0).toUpperCase();
            marker.bindPopup(`
                <div class="story-popup">
                    <img src="${story.photoUrl}" alt="${story.description}" class="story-popup-image">
                    <div class="story-popup-content">
                        <div class="story-popup-header">
                            <div class="story-popup-avatar">
                                ${userInitial}
                            </div>
                            <div class="story-popup-info">
                                <h3 class="story-popup-name">${story.name}</h3>
                                <p class="story-popup-date">${new Date(story.createdAt).toLocaleDateString('id-ID', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</p>
                            </div>
                        </div>
                        <p class="story-popup-description">${story.description}</p>
                        <div class="story-popup-footer">
                            <div class="story-popup-location">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>Story Location</span>
                            </div>
                            <a href="#/stories" class="story-popup-view">
                                View Story
                            </a>
                        </div>
                    </div>
                </div>
            `);
        });

        // Fit bounds to show all markers
        if (storiesWithLocation.length > 0) {
            const bounds = L.latLngBounds(storiesWithLocation.map(story => [story.lat, story.lon]));
            this.map.fitBounds(bounds);
        } else {
            console.log('No stories with location found');
            // Set default view to Indonesia
            this.map.setView(MAP_CONFIG.DEFAULT_CENTER, MAP_CONFIG.DEFAULT_ZOOM);
        }

        // Trigger resize event to ensure map renders correctly
        setTimeout(() => {
            this.map.invalidateSize();
        }, 100);
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        // Try to find the form element
        const form = document.querySelector('.auth-form') || document.querySelector('.story-form');
        if (form) {
            form.prepend(errorDiv);
            setTimeout(() => errorDiv.remove(), 5000);
        } else {
            // If no form found, append to app container
            const app = document.getElementById('app');
            if (app) {
                app.prepend(errorDiv);
                setTimeout(() => errorDiv.remove(), 5000);
            }
        }
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        
        // Try to find the form element
        const form = document.querySelector('.auth-form') || document.querySelector('.story-form');
        if (form) {
            form.prepend(successDiv);
            setTimeout(() => successDiv.remove(), 5000);
        } else {
            // If no form found, append to app container
            const app = document.getElementById('app');
            if (app) {
                app.prepend(successDiv);
                setTimeout(() => successDiv.remove(), 5000);
            }
        }
    }
} 