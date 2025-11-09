import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Film, Home, ShoppingCart, Info, Plus, Trash2, Edit2, Check, X, Save, Search, Star, Calendar, Clock, CheckCircle } from 'lucide-react';
import './App.css';

// TMDB API Configuration
const TMDB_API_KEY = 'a4582cb8c1be8c2a9efe9cfacae756ce'; // Replace with your actual TMDB API key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// 🆕 NEW: Create Context for sharing watchlist across components
const WatchlistContext = createContext();

// 🆕 NEW: Custom hook to use watchlist context
const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within WatchlistProvider');
  }
  return context;
};

// 🆕 NEW: Watchlist Provider Component
const WatchlistProvider = ({ children }) => {
  const [streamList, setStreamList] = useState([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedList = localStorage.getItem('streamList');
    if (savedList) {
      setStreamList(JSON.parse(savedList));
      console.log('✅ Loaded StreamList from localStorage:', JSON.parse(savedList));
    }
  }, []);

  // Save to localStorage whenever streamList changes
  useEffect(() => {
    if (streamList.length > 0) {
      localStorage.setItem('streamList', JSON.stringify(streamList));
      console.log('✅ Saved StreamList to localStorage:', streamList);
    } else if (streamList.length === 0) {
      localStorage.removeItem('streamList');
    }
  }, [streamList]);

  // 🆕 NEW: Add item to watchlist (can be called from any component)
  const addToWatchlist = (text) => {
    // Check if item already exists
    const exists = streamList.some(item => 
      item.text.toLowerCase() === text.toLowerCase()
    );
    
    if (exists) {
      console.log('⚠️ Item already in watchlist:', text);
      return { success: false, message: 'Already in watchlist!' };
    }

    const newItem = {
      id: Date.now(),
      text: text.trim(),
      timestamp: new Date().toLocaleString(),
      completed: false
    };
    
    setStreamList([...streamList, newItem]);
    console.log('✅ Added to StreamList:', newItem);
    return { success: true, message: 'Added to watchlist!' };
  };

  // 🆕 NEW: Check if item is in watchlist
  const isInWatchlist = (text) => {
    return streamList.some(item => 
      item.text.toLowerCase() === text.toLowerCase()
    );
  };

  const deleteFromWatchlist = (id) => {
    const updatedList = streamList.filter(item => item.id !== id);
    setStreamList(updatedList);
  };

  const toggleComplete = (id) => {
    const updatedList = streamList.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setStreamList(updatedList);
  };

  const updateItem = (id, newText) => {
    const updatedList = streamList.map(item =>
      item.id === id ? { ...item, text: newText.trim() } : item
    );
    setStreamList(updatedList);
  };

  const clearAll = () => {
    setStreamList([]);
    localStorage.removeItem('streamList');
  };

  const value = {
    streamList,
    setStreamList,
    addToWatchlist,
    isInWatchlist,
    deleteFromWatchlist,
    toggleComplete,
    updateItem,
    clearAll
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
};

const NavBar = () => {
  const location = useLocation();
  const { streamList } = useWatchlist();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Count of items in watchlist
  const watchlistCount = streamList.length;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <Film className="brand-icon" size={36} />
          <h1 className="brand-title">StreamList</h1>
        </div>
        <div className="nav-buttons">
          <Link to="/" className="nav-button-link">
            <button className={`nav-button ${isActive('/') ? 'active' : ''}`}>
              <Home size={20} />
              <span>StreamList</span>
              {watchlistCount > 0 && (
                <span className="badge">{watchlistCount}</span>
              )}
            </button>
          </Link>
          <Link to="/movies" className="nav-button-link">
            <button className={`nav-button ${isActive('/movies') ? 'active' : ''}`}>
              <Film size={20} />
              <span>Movies</span>
            </button>
          </Link>
          <Link to="/cart" className="nav-button-link">
            <button className={`nav-button ${isActive('/cart') ? 'active' : ''}`}>
              <ShoppingCart size={20} />
              <span>Cart</span>
            </button>
          </Link>
          <Link to="/about" className="nav-button-link">
            <button className={`nav-button ${isActive('/about') ? 'active' : ''}`}>
              <Info size={20} />
              <span>About</span>
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

const StreamListPage = () => {
  const { streamList, addToWatchlist, deleteFromWatchlist, toggleComplete, updateItem, clearAll } = useWatchlist();
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleAddItem = () => {
    if (inputValue.trim()) {
      addToWatchlist(inputValue.trim());
      setInputValue('');
    }
  };

  const handleDeleteItem = (id) => {
    deleteFromWatchlist(id);
  };

  const handleToggleComplete = (id) => {
    toggleComplete(id);
  };

  const handleStartEdit = (id, currentText) => {
    setEditingId(id);
    setEditValue(currentText);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSaveEdit = (id) => {
    if (editValue.trim()) {
      updateItem(id, editValue.trim());
      setEditingId(null);
      setEditValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  const handleEditKeyPress = (e, id) => {
    if (e.key === 'Enter') {
      handleSaveEdit(id);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all items?')) {
      clearAll();
    }
  };

  const filteredList = streamList.filter(item => {
    if (filterStatus === 'completed') return item.completed;
    if (filterStatus === 'active') return !item.completed;
    return true;
  });

  const completedCount = streamList.filter(item => item.completed).length;
  const activeCount = streamList.filter(item => !item.completed).length;

  return (
    <div className="page-content">
      <div className="main-card">
        <div className="card-header">
          <h2 className="card-title">NOW SHOWING</h2>
          <div className="title-divider">
            <div className="divider-line"></div>
            <p className="subtitle">Your Personal Watch List</p>
            <div className="divider-line"></div>
          </div>
        </div>
        
        <div className="input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a movie or show to your list..."
            className="input-field"
            autoFocus
          />
          <button 
            onClick={handleAddItem} 
            className="add-button"
            disabled={!inputValue.trim()}
          >
            <Plus size={24} />
            <span>Add</span>
          </button>
        </div>

        {streamList.length > 0 && (
          <div className="filter-container">
            <div className="filter-buttons">
              <button 
                className={`filter-button ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                All ({streamList.length})
              </button>
              <button 
                className={`filter-button ${filterStatus === 'active' ? 'active' : ''}`}
                onClick={() => setFilterStatus('active')}
              >
                Active ({activeCount})
              </button>
              <button 
                className={`filter-button ${filterStatus === 'completed' ? 'active' : ''}`}
                onClick={() => setFilterStatus('completed')}
              >
                Watched ({completedCount})
              </button>
            </div>
            {streamList.length > 0 && (
              <button className="clear-all-button" onClick={handleClearAll}>
                Clear All
              </button>
            )}
          </div>
        )}

        {streamList.length === 0 ? (
          <div className="empty-state">
            <Film size={64} />
            <p>Your watch list is empty. Add some entertainment!</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="empty-state">
            <Film size={64} />
            <p>No items in this category.</p>
          </div>
        ) : (
          <div className="list-container">
            {filteredList.map((item) => (
              <div key={item.id} className={`list-item ${item.completed ? 'completed' : ''}`}>
                {editingId === item.id ? (
                  <div className="edit-container">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyPress={(e) => handleEditKeyPress(e, item.id)}
                      className="edit-input"
                      autoFocus
                    />
                    <div className="edit-buttons">
                      <button 
                        onClick={() => handleSaveEdit(item.id)} 
                        className="save-button"
                        disabled={!editValue.trim()}
                      >
                        <Save size={18} />
                        <span>Save</span>
                      </button>
                      <button onClick={handleCancelEdit} className="cancel-button">
                        <X size={18} />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="item-content">
                      <button 
                        onClick={() => handleToggleComplete(item.id)}
                        className="complete-button"
                        title={item.completed ? "Mark as unwatched" : "Mark as watched"}
                      >
                        <div className={`checkbox ${item.completed ? 'checked' : ''}`}>
                          {item.completed && <Check size={16} />}
                        </div>
                      </button>
                      <Film className="item-icon" size={28} />
                      <div className="item-text">
                        <p className={`item-title ${item.completed ? 'completed-text' : ''}`}>
                          {item.text}
                        </p>
                        <p className="item-timestamp">
                          Added: {item.timestamp}
                          {item.completed && ' • ✓ Watched'}
                        </p>
                      </div>
                    </div>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleStartEdit(item.id, item.text)} 
                        className="edit-button"
                        title="Edit item"
                      >
                        <Edit2 size={18} />
                        <span>Edit</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item.id)} 
                        className="delete-button"
                        title="Delete item"
                      >
                        <Trash2 size={18} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="info-box">
        <h3 className="info-title">🎬 StreamList Features</h3>
        <p className="info-text">
          <strong>✓ Add</strong> movies and shows to your watch list<br />
          <strong>✓ Edit</strong> any item by clicking the Edit button<br />
          <strong>✓ Mark as watched</strong> by clicking the checkbox<br />
          <strong>✓ Filter</strong> items by All, Active, or Watched<br />
          <strong>✓ Delete</strong> items you no longer need<br />
          <strong>✓ Add from Movies</strong> page when browsing!<br />
          <strong>✓ Persistent storage</strong> - your list is saved automatically!
        </p>
      </div>
    </div>
  );
};

// 🆕 ENHANCED: Movies Page with Add to Watchlist functionality
const MoviesPage = () => {
  const { addToWatchlist, isInWatchlist } = useWatchlist();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [notification, setNotification] = useState(null);

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('movieSearchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
      console.log('✅ Loaded search history from localStorage');
    }
  }, []);

  // Save search history to localStorage
  useEffect(() => {
    if (searchHistory.length > 0) {
      localStorage.setItem('movieSearchHistory', JSON.stringify(searchHistory));
      console.log('✅ Saved search history to localStorage');
    }
  }, [searchHistory]);

  // 🆕 NEW: Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // 🆕 NEW: Handle add to watchlist
  const handleAddToWatchlist = (movieTitle) => {
    const result = addToWatchlist(movieTitle);
    if (result.success) {
      showNotification(`"${movieTitle}" added to your watchlist!`, 'success');
    } else {
      showNotification(`"${movieTitle}" is already in your watchlist!`, 'info');
    }
  };

  const searchMovies = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }
      
      const data = await response.json();
      setMovies(data.results || []);
      
      const newHistory = [
        { query, timestamp: new Date().toLocaleString(), count: data.results.length },
        ...searchHistory.filter(item => item.query !== query).slice(0, 9)
      ];
      setSearchHistory(newHistory);
      
      console.log('✅ Movies fetched from TMDB:', data.results);
    } catch (err) {
      setError(err.message);
      console.error('❌ Error fetching movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMovieDetails = async (movieId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch movie details');
      }
      
      const data = await response.json();
      setSelectedMovie(data);
      console.log('✅ Movie details fetched:', data);
    } catch (err) {
      setError(err.message);
      console.error('❌ Error fetching movie details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchMovies(searchQuery);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchMovies(searchQuery);
    }
  };

  const clearSearchHistory = () => {
    if (window.confirm('Clear all search history?')) {
      setSearchHistory([]);
      localStorage.removeItem('movieSearchHistory');
      console.log('✅ Search history cleared');
    }
  };

  // 🆕 NEW: Notification Component
  const Notification = ({ message, type }) => (
    <div className={`notification notification-${type}`}>
      <CheckCircle size={20} />
      <span>{message}</span>
    </div>
  );

  if (selectedMovie) {
    const inWatchlist = isInWatchlist(selectedMovie.title);
    
    return (
      <div className="page-content">
        {notification && <Notification message={notification.message} type={notification.type} />}
        
        <div className="main-card">
          <div className="detail-header-buttons">
            <button 
              onClick={() => setSelectedMovie(null)} 
              className="add-button"
            >
              <X size={20} />
              <span>Back to Results</span>
            </button>
            
            {/* 🆕 NEW: Add to Watchlist button */}
            <button 
              onClick={() => handleAddToWatchlist(selectedMovie.title)}
              className={`add-button ${inWatchlist ? 'in-watchlist' : ''}`}
              disabled={inWatchlist}
            >
              {inWatchlist ? (
                <>
                  <CheckCircle size={20} />
                  <span>In Watchlist</span>
                </>
              ) : (
                <>
                  <Plus size={20} />
                  <span>Add to Watchlist</span>
                </>
              )}
            </button>
          </div>
          
          <div className="movie-detail-container">
            <div className="movie-detail-header">
              {selectedMovie.poster_path && (
                <img 
                  src={`${TMDB_IMAGE_BASE_URL}${selectedMovie.poster_path}`}
                  alt={selectedMovie.title}
                  className="movie-detail-poster"
                />
              )}
              <div className="movie-detail-info">
                <h2 className="card-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>
                  {selectedMovie.title}
                </h2>
                {selectedMovie.tagline && (
                  <p className="movie-tagline">{selectedMovie.tagline}</p>
                )}
                <div className="movie-meta">
                  <div className="meta-item">
                    <Star size={20} className="meta-icon" />
                    <span>{selectedMovie.vote_average?.toFixed(1)} / 10</span>
                  </div>
                  <div className="meta-item">
                    <Calendar size={20} className="meta-icon" />
                    <span>{selectedMovie.release_date}</span>
                  </div>
                  <div className="meta-item">
                    <Clock size={20} className="meta-icon" />
                    <span>{selectedMovie.runtime} min</span>
                  </div>
                </div>
                <div className="movie-genres">
                  {selectedMovie.genres?.map(genre => (
                    <span key={genre.id} className="genre-tag">{genre.name}</span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="movie-detail-section">
              <h3 className="info-title">Overview</h3>
              <p className="info-text">{selectedMovie.overview}</p>
            </div>

            {selectedMovie.budget > 0 && (
              <div className="movie-detail-section">
                <h3 className="info-title">Budget & Revenue</h3>
                <p className="info-text">
                  <strong>Budget:</strong> ${selectedMovie.budget?.toLocaleString()}<br />
                  <strong>Revenue:</strong> ${selectedMovie.revenue?.toLocaleString()}
                </p>
              </div>
            )}

            {selectedMovie.production_companies?.length > 0 && (
              <div className="movie-detail-section">
                <h3 className="info-title">Production Companies</h3>
                <div className="production-companies">
                  {selectedMovie.production_companies.map(company => (
                    <span key={company.id} className="company-tag">{company.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      {notification && <Notification message={notification.message} type={notification.type} />}
      
      <div className="main-card">
        <div className="card-header">
          <h2 className="card-title">MOVIE EXPLORER</h2>
          <div className="title-divider">
            <div className="divider-line"></div>
            <p className="subtitle">Powered by TMDB</p>
            <div className="divider-line"></div>
          </div>
        </div>

        <div className="input-container">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search for movies..."
            className="input-field"
          />
          <button 
            onClick={handleSearch} 
            className="add-button"
            disabled={!searchQuery.trim() || loading}
          >
            <Search size={24} />
            <span>{loading ? 'Searching...' : 'Search'}</span>
          </button>
        </div>

        {searchHistory.length > 0 && (
          <div className="filter-container">
            <div className="search-history">
              <h4 className="info-title" style={{ marginBottom: '0.5rem' }}>Recent Searches:</h4>
              <div className="filter-buttons">
                {searchHistory.slice(0, 5).map((item, index) => (
                  <button
                    key={index}
                    className="filter-button"
                    onClick={() => {
                      setSearchQuery(item.query);
                      searchMovies(item.query);
                    }}
                  >
                    {item.query} ({item.count})
                  </button>
                ))}
              </div>
            </div>
            <button className="clear-all-button" onClick={clearSearchHistory}>
              Clear History
            </button>
          </div>
        )}

        {error && (
          <div className="empty-state" style={{ backgroundColor: '#991b1b' }}>
            <X size={64} />
            <p>Error: {error}</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Please check your API key and try again.
            </p>
          </div>
        )}

        {loading && (
          <div className="empty-state">
            <Film size={64} className="loading-icon" />
            <p>Searching for movies...</p>
          </div>
        )}

        {!loading && movies.length === 0 && !error && (
          <div className="empty-state">
            <Search size={64} />
            <p>Search for movies to explore our collection!</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
              Try searching for "Inception", "The Matrix", or any movie you love
            </p>
          </div>
        )}

        {!loading && movies.length > 0 && (
          <div className="movies-grid">
            {movies.map((movie) => {
              const inWatchlist = isInWatchlist(movie.title);
              
              return (
                <div key={movie.id} className="movie-card">
                  <div onClick={() => getMovieDetails(movie.id)}>
                    {movie.poster_path ? (
                      <img 
                        src={`${TMDB_IMAGE_BASE_URL}${movie.poster_path}`}
                        alt={movie.title}
                        className="movie-poster"
                      />
                    ) : (
                      <div className="movie-poster-placeholder">
                        <Film size={64} />
                      </div>
                    )}
                    <div className="movie-info">
                      <h3 className="movie-title">{movie.title}</h3>
                      <div className="movie-meta-small">
                        <span className="movie-year">
                          {movie.release_date?.split('-')[0] || 'N/A'}
                        </span>
                        <span className="movie-rating">
                          <Star size={14} />
                          {movie.vote_average?.toFixed(1)}
                        </span>
                      </div>
                      <p className="movie-overview">
                        {movie.overview?.substring(0, 120)}
                        {movie.overview?.length > 120 ? '...' : ''}
                      </p>
                    </div>
                  </div>
                  
                  {/* 🆕 NEW: Add to Watchlist button on each card */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToWatchlist(movie.title);
                    }}
                    className={`watchlist-card-button ${inWatchlist ? 'in-watchlist' : ''}`}
                    disabled={inWatchlist}
                  >
                    {inWatchlist ? (
                      <>
                        <CheckCircle size={16} />
                        <span>In Watchlist</span>
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        <span>Add to Watchlist</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="info-box">
        <h3 className="info-title">🎬 Movie Explorer Features</h3>
        <p className="info-text">
          <strong>✓ Search</strong> thousands of movies from TMDB<br />
          <strong>✓ View Details</strong> including ratings, release dates, and descriptions<br />
          <strong>✓ Add to Watchlist</strong> directly from search results!<br />
          <strong>✓ Search History</strong> automatically saved for quick access<br />
          <strong>✓ Click any movie</strong> to see full details<br />
          <strong>✓ Persistent storage</strong> - your searches are remembered!
        </p>
      </div>
    </div>
  );
};

const CartPage = () => (
  <div className="coming-soon-card">
    <ShoppingCart className="coming-soon-icon" size={80} />
    <h2 className="coming-soon-title">COMING SOON</h2>
    <div className="coming-soon-divider"></div>
    <p className="coming-soon-text">
      Shopping cart will be available soon.
    </p>
    <p className="coming-soon-subtext">
      Start building your entertainment collection!
    </p>
  </div>
);

const AboutPage = () => (
  <div className="page-content">
    <div className="main-card">
      <div className="card-header">
        <h2 className="card-title">ABOUT STREAMLIST</h2>
        <div className="title-divider">
          <div className="divider-line"></div>
          <p className="subtitle">Your Personal Cinema Experience</p>
          <div className="divider-line"></div>
        </div>
      </div>
      
      <div className="about-content">
        <div className="about-section">
          <h3 className="about-section-title">🎬 What is StreamList?</h3>
          <p className="about-text">
            StreamList is a revolutionary application from EZTechMovie that helps you organize and manage your 
            entertainment preferences. Keep track of movies and shows you want to watch, mark them as completed, 
            and never forget what's on your watch list!
          </p>
        </div>

        <div className="about-section">
          <h3 className="about-section-title">✨ Key Features</h3>
          <ul className="feature-list">
            <li><strong>Smart Watch List:</strong> Add, edit, and organize your favorite content</li>
            <li><strong>Track Progress:</strong> Mark items as watched to keep track of what you've seen</li>
            <li><strong>Movie Explorer:</strong> Search and discover movies using TMDB API</li>
            <li><strong>Quick Add:</strong> Add movies to your watchlist directly from search results!</li>
            <li><strong>Filter Options:</strong> View all items, only active, or completed ones</li>
            <li><strong>Persistent Storage:</strong> Your list and searches are automatically saved</li>
            <li><strong>User-Friendly Design:</strong> Intuitive interface with smooth transitions</li>
            <li><strong>Responsive Layout:</strong> Works beautifully on all devices</li>
          </ul>
        </div>

        <div className="about-section">
          <h3 className="about-section-title">🚀 Coming Soon</h3>
          <ul className="feature-list">
            <li>Shopping cart for subscription plans</li>
            <li>Social sharing features</li>
            <li>Integration with streaming platforms</li>
            <li>Personalized recommendations</li>
            <li>User authentication and profiles</li>
          </ul>
        </div>

        <div className="about-section">
          <h3 className="about-section-title">💡 About EZTechMovie</h3>
          <p className="about-text">
            EZTechMovie is a privately owned video streaming company founded in April 2019, headquartered in 
            San Diego, California. Our mission is to be the highest quality movie streaming entity nationally 
            and to create a plethora of user-friendly apps to handle customer's various needs.
          </p>
        </div>

        <div className="about-section">
          <h3 className="about-section-title">🔧 Technical Implementation</h3>
          <p className="about-text">
            This application demonstrates modern web development practices including:<br />
            <strong>• React Context API</strong> for global state management<br />
            <strong>• TMDB API</strong> integration for movie data<br />
            <strong>• LocalStorage</strong> for persistent data storage<br />
            <strong>• React Router</strong> for navigation<br />
            <strong>• Responsive Design</strong> with CSS animations
          </p>
        </div>
      </div>
    </div>
  </div>
);

const App = () => {
  return (
    <Router>
      <WatchlistProvider>
        <div className="app">
          <NavBar />
          
          <div className="marquee">
            <div className="marquee-content">
              <div className="marquee-light"></div>
              <div className="marquee-light" style={{animationDelay: '0.2s'}}></div>
              <div className="marquee-light" style={{animationDelay: '0.4s'}}></div>
              <p className="marquee-text">EZTECHMOVIE PRESENTS</p>
              <div className="marquee-light" style={{animationDelay: '0.4s'}}></div>
              <div className="marquee-light" style={{animationDelay: '0.2s'}}></div>
              <div className="marquee-light"></div>
            </div>
          </div>

          <div className="main-container">
            <Routes>
              <Route path="/" element={<StreamListPage />} />
              <Route path="/movies" element={<MoviesPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </div>

          <footer className="footer">
            <div className="footer-content">
              <p className="footer-text">
                🎬 EZTechMovie StreamList © 2024 - Your Personal Cinema Experience 🎬
              </p>
            </div>
          </footer>
        </div>
      </WatchlistProvider>
    </Router>
  );
};

export default App;