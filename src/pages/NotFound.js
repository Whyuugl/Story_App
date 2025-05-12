const NotFound = {
  async render() {
    return `
      <div class="not-found">
        <h2>404 - Page Not Found</h2>
        <p>Sorry, the page you are looking for does not exist.</p>
        <a href="#/" class="back-home">Back to Home</a>
      </div>
    `;
  },

  async afterRender() {
    // Nothing to do after render
  }
};

export default NotFound; 