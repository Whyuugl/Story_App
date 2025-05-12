import Database from '../utils/database';

const Stories = {
  async render() {
    return `
      <div class="stories-container">
        <h1>Stories</h1>
        <div id="stories-list" class="stories-list"></div>
      </div>
    `;
  },

  async afterRender() {
    const storiesList = document.getElementById('stories-list');
    
    try {
      // Fetch stories from API
      const response = await fetch('https://api.example.com/stories'); // Replace with your actual API endpoint
      const stories = await response.json();
      
      // Get saved stories from IndexedDB
      const savedStories = await Database.getAllStories();
      const savedStoryIds = new Set(savedStories.map(story => story.id));

      storiesList.innerHTML = stories.map((story) => `
        <div class="story-card" data-id="${story.id}">
          <div class="story-header">
            <h2>${story.name}</h2>
            <button class="save-story ${savedStoryIds.has(story.id) ? 'saved' : ''}" aria-label="Save story">
              <i class="fas ${savedStoryIds.has(story.id) ? 'fa-bookmark' : 'fa-bookmark-o'}"></i>
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

      // Add event listeners for save buttons
      document.querySelectorAll('.save-story').forEach((button) => {
        button.addEventListener('click', async (event) => {
          const storyCard = event.target.closest('.story-card');
          const storyId = storyCard.dataset.id;
          const isSaved = button.classList.contains('saved');

          try {
            if (isSaved) {
              // Remove from IndexedDB
              await Database.deleteStory(parseInt(storyId));
              button.classList.remove('saved');
              button.querySelector('i').classList.replace('fa-bookmark', 'fa-bookmark-o');
            } else {
              // Add to IndexedDB
              const story = stories.find(s => s.id === parseInt(storyId));
              await Database.addStory(story);
              button.classList.add('saved');
              button.querySelector('i').classList.replace('fa-bookmark-o', 'fa-bookmark');
            }
          } catch (error) {
            console.error('Error saving/deleting story:', error);
            alert('Failed to save/delete story');
          }
        });
      });
    } catch (error) {
      console.error('Error fetching stories:', error);
      storiesList.innerHTML = '<p class="error">Failed to load stories</p>';
    }
  },
};

export default Stories; 