import { API_ENDPOINTS } from '../config/config.js';

export class StoryModel {
    constructor() {
        this.stories = [];
        this.token = localStorage.getItem('token');
        this.onAuthStateChange = null;
    }

    logout() {
        this.token = null;
        localStorage.removeItem('token');
        if (this.onAuthStateChange) {
            this.onAuthStateChange();
        }
    }

    async login(email, password) {
        try {
            const response = await fetch(API_ENDPOINTS.LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!data.error) {
                this.token = data.loginResult.token;
                localStorage.setItem('token', this.token);
                if (this.onAuthStateChange) {
                    this.onAuthStateChange();
                }
                return true;
            }
            throw new Error(data.message);
        } catch (error) {
            console.error('Error logging in:', error);
            throw new Error('Login failed. Please check your credentials.');
        }
    }

    async register(name, email, password) {
        try {
            // Validasi email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Please enter a valid email address');
            }

            // Validasi password
            if (password.length < 8) {
                throw new Error('Password must be at least 8 characters long');
            }

            const response = await fetch(API_ENDPOINTS.REGISTER, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await response.json();
            if (!data.error) {
                return true;
            }
            throw new Error(data.message);
        } catch (error) {
            console.error('Error registering:', error);
            throw error;
        }
    }

    isAuthenticated() {
        return Boolean(this.token && this.token.length > 0);
    }

    async fetchStories() {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated');
        }

        try {
            const response = await fetch(API_ENDPOINTS.STORIES, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            const data = await response.json();
            if (!data.error) {
                this.stories = data.listStory;
                return this.stories;
            }
            throw new Error(data.message);
        } catch (error) {
            console.error('Error fetching stories:', error);
            throw error;
        }
    }

    async addStory(formData) {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated');
        }

        try {
            const response = await fetch(API_ENDPOINTS.STORIES, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                body: formData
            });
            const data = await response.json();
            if (!data.error) {
                return true;
            }
            throw new Error(data.message);
        } catch (error) {
            console.error('Error adding story:', error);
            throw error;
        }
    }
} 