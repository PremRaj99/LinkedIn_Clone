import api from './api';

class SearchService {
  // Universal search
  async search(query, filters = {}) {
    try {
      const params = new URLSearchParams({
        q: query,
        ...filters
      });

      const response = await api.get(`/search?${params}`);
      return response.data;
    } catch (error) {
      console.error('Search error:', error);
      // Return mock data for development
      return {
        people: [],
        jobs: [],
        companies: [],
        posts: [],
        groups: []
      };
    }
  }

  // Search people
  async searchPeople(query, filters = {}) {
    try {
      const params = new URLSearchParams({
        q: query,
        ...filters
      });

      const response = await api.get(`/search/people?${params}`);
      return response.data;
    } catch (error) {
      console.error('Search people error:', error);
      return [];
    }
  }

  // Search jobs
  async searchJobs(query, filters = {}) {
    try {
      const params = new URLSearchParams({
        q: query,
        ...filters
      });

      const response = await api.get(`/search/jobs?${params}`);
      return response.data;
    } catch (error) {
      console.error('Search jobs error:', error);
      return [];
    }
  }

  // Search companies
  async searchCompanies(query, filters = {}) {
    try {
      const params = new URLSearchParams({
        q: query,
        ...filters
      });

      const response = await api.get(`/search/companies?${params}`);
      return response.data;
    } catch (error) {
      console.error('Search companies error:', error);
      return [];
    }
  }

  // Search posts
  async searchPosts(query, filters = {}) {
    try {
      const params = new URLSearchParams({
        q: query,
        ...filters
      });

      const response = await api.get(`/search/posts?${params}`);
      return response.data;
    } catch (error) {
      console.error('Search posts error:', error);
      return [];
    }
  }

  // Search groups
  async searchGroups(query, filters = {}) {
    try {
      const params = new URLSearchParams({
        q: query,
        ...filters
      });

      const response = await api.get(`/search/groups?${params}`);
      return response.data;
    } catch (error) {
      console.error('Search groups error:', error);
      return [];
    }
  }

  // Get search suggestions
  async getSearchSuggestions(query) {
    try {
      const response = await api.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Search suggestions error:', error);
      return [];
    }
  }

  // Get trending searches
  async getTrendingSearches() {
    try {
      const response = await api.get('/search/trending');
      return response.data;
    } catch (error) {
      console.error('Trending searches error:', error);
      return [];
    }
  }

  // Save search query
  async saveSearch(query) {
    try {
      await api.post('/search/save', { query });
    } catch (error) {
      console.error('Save search error:', error);
    }
  }

  // Get search history
  async getSearchHistory() {
    try {
      const response = await api.get('/search/history');
      return response.data;
    } catch (error) {
      console.error('Search history error:', error);
      return [];
    }
  }

  // Clear search history
  async clearSearchHistory() {
    try {
      await api.delete('/search/history');
    } catch (error) {
      console.error('Clear search history error:', error);
    }
  }
}

const searchService = new SearchService();
export default searchService;
