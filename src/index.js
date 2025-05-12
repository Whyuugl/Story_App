import './styles.css';
import { StoryPresenter } from './presenters/StoryPresenter.js';

// Initialize the app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new StoryPresenter();
    app.init();
}); 