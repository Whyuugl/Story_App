import Home from './pages/Home';
import Stories from './pages/Stories';
import AddStory from './pages/AddStory';
import SavedStories from './pages/saved-stories';
import NotFound from './pages/NotFound';

const routes = {
  '/': Home,
  '/stories': Stories,
  '/add-story': AddStory,
  '/saved-stories': SavedStories,
};

const getPage = (path) => routes[path] || NotFound;

export default getPage; 