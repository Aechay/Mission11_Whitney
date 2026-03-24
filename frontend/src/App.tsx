import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BookPage from './pages/BookPage';
import CartPage from './pages/CartPage';
import { CartProvider } from './context/CartContext';
import BookInfoPage from './pages/BookInfoPage';
import { useState } from 'react';

function App() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  return (
    <>
      <CartProvider>
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <BookPage
                  page={page}
                  setPage={setPage}
                  pageSize={pageSize}
                  setPageSize={setPageSize}
                  selectedGenres={selectedGenres}
                  setSelectedGenres={setSelectedGenres}
                />
              }
            />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/books/:bookId" element={<BookInfoPage />} />
          </Routes>
        </Router>
      </CartProvider>
    </>
  );
}

export default App;
