import Database from '../utils/database';

const SavedStories = {
  async render() {
    return `
      <div class="saved-stories-container">
        <h1>Saved Stories</h1>
        <div id="saved-stories-list" class="stories-list"></div>
      </div>
    `;
  },

  async afterRender() {
    const savedStoriesList = document.getElementById('saved-stories-list');
    const stories = await Database.getAllStories();

    if (stories.length === 0) {
      savedStoriesList.innerHTML = '<p class="no-stories">No saved stories yet</p>';
      return;
    }

    savedStoriesList.innerHTML = stories.map((story) => `
      <div class="story-card" data-id="${story.id}">
        <div class="story-header">
          <h2>${story.name}</h2>
          <button class="delete-story" aria-label="Delete story">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <div class="story-content">
          <p>${story.description}</p>
        </div>
        <div class="story-footer">
          <span class="story-date">${new Date(story.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    `).join('');

    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-story').forEach((button) => {
      button.addEventListener('click', async (event) => {
        const storyCard = event.target.closest('.story-card');
        const storyId = storyCard.dataset.id;
        
        try {
          await Database.deleteStory(parseInt(storyId));
          storyCard.remove();
          
          // If no stories left, show message
          if (document.querySelectorAll('.story-card').length === 0) {
            savedStoriesList.innerHTML = '<p class="no-stories">No saved stories yet</p>';
          }
        } catch (error) {
          console.error('Error deleting story:', error);
          alert('Failed to delete story');
        }
      });
    });
  },
};

export default SavedStories; 