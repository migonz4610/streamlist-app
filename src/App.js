import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Film, Home, ShoppingCart, Info, Plus, Trash2 } from 'lucide-react';
import './App.css';

const NavBar = () => (
  <nav className="navbar">
    <div className="nav-container">
      <div className="nav-brand">
        <Film className="brand-icon" size={36} />
        <h1 className="brand-title">StreamList</h1>
      </div>
      <div className="nav-buttons">
        <Link to="/" className="nav-button-link">
          <button className="nav-button">
            <Home size={20} />
            <span>StreamList</span>
          </button>
        </Link>
        <Link to="/movies" className="nav-button-link">
          <button className="nav-button">
            <Film size={20} />
            <span>Movies</span>
          </button>
        </Link>
        <Link to="/cart" className="nav-button-link">
          <button className="nav-button">
            <ShoppingCart size={20} />
            <span>Cart</span>
          </button>
        </Link>
        <Link to="/about" className="nav-button-link">
          <button className="nav-button">
            <Info size={20} />
            <span>About</span>
          </button>
        </Link>
      </div>
    </div>
  </nav>
);

const StreamListPage = () => {
  const [streamList, setStreamList] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const handleAddItem = () => {
    if (inputValue.trim()) {
      const newItem = {
        id: Date.now(),
        text: inputValue,
        timestamp: new Date().toLocaleString()
      };
      setStreamList([...streamList, newItem]);
      console.log('Added to StreamList:', newItem);
      console.log('Current StreamList:', [...streamList, newItem]);
      setInputValue('');
    }
  };

  const handleDeleteItem = (id) => {
    const updatedList = streamList.filter(item => item.id !== id);
    setStreamList(updatedList);
    console.log('Item removed. Updated StreamList:', updatedList);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

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
          />
          <button onClick={handleAddItem} className="add-button">
            <Plus size={24} />
            <span>Add</span>
          </button>
        </div>

        {streamList.length === 0 ? (
          <div className="empty-state">
            <Film size={64} />
            <p>Your watch list is empty. Add some entertainment!</p>
          </div>
        ) : (
          <div className="list-container">
            {streamList.map((item) => (
              <div key={item.id} className="list-item">
                <div className="item-content">
                  <Film className="item-icon" size={28} />
                  <div className="item-text">
                    <p className="item-title">{item.text}</p>
                    <p className="item-timestamp">Added: {item.timestamp}</p>
                  </div>
                </div>
                <button onClick={() => handleDeleteItem(item.id)} className="delete-button">
                  <Trash2 size={18} />
                  <span>Remove</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="info-box">
        <h3 className="info-title">📽️ Feature Notice</h3>
        <p className="info-text">
          This is your personal StreamList! Items you add will appear above. Add and remove as many as you'd like.
        </p>
      </div>
    </div>
  );
};

const MoviesPage = () => (
  <div className="coming-soon-card">
    <Film className="coming-soon-icon" size={80} />
    <h2 className="coming-soon-title">COMING SOON</h2>
    <div className="coming-soon-divider"></div>
    <p className="coming-soon-text">
      Movie catalog will be available soon. 
    </p>
    <p className="coming-soon-subtext">
      Get ready to explore our collection!
    </p>
  </div>
);

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
  <div className="coming-soon-card">
    <Info className="coming-soon-icon" size={80} />
    <h2 className="coming-soon-title">COMING SOON</h2>
    <div className="coming-soon-divider"></div>
    <p className="coming-soon-text">
      About page will be available soon.
    </p>
    <p className="coming-soon-subtext">
      Learn more about EZTechMovie StreamList!
    </p>
  </div>
);

const App = () => {
  return (
    <Router>
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
    </Router>
  );
};

export default App;