import { useEffect, useState } from 'react';
import type { Book } from '../types/book';
import { useNavigate, useParams } from 'react-router';
import { useCart } from '../context/CartContext';
import BookHead from '../components/BookHead';

function BookInfoPage() {
  const [book, setBook] = useState<Book | null>(null);
  const { addCartItem } = useCart();
  const { bookId } = useParams();
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(
          `https://localhost:5000/api/getBook?bookId=${bookId}`
        );
        const data: Book = await response.json();
        setBook(data);
      } catch (error) {
        console.error('Error fetching book:', error);
      }
    };
    fetchBook();
  }, [bookId]);

  if (!book) {
    return (
      <section className="app-shell py-5">
        <BookHead />
        <div className="container">
          <div className="book-detail-panel book-detail-loading">Loading...</div>
        </div>
      </section>
    );
  }

  const { title, author, price } = book;

  function handleAddToCart() {
    if (!book) return;
    // Implement add to cart functionality here
    addCartItem({
      bookID: book.bookID,
      title: book.title,
      author: book.author,
      price: book.price,
      quantity: quantity,
    });
    navigate('/', {
      state: {
        cartToast: {
          title: book.title,
          quantity,
        },
      },
    });
  }

  return (
    <section className="app-shell py-5">
      <BookHead />
      <div className="container book-detail-page">
        <div className="book-detail-panel">
          <p className="book-detail-eyebrow mb-2">Book details</p>
          <h1 className="book-detail-title mb-4">{title}</h1>

          <div className="book-detail-meta">
            <div className="book-detail-meta-item">
              <p className="book-detail-meta-label mb-1">Author</p>
              <p className="book-detail-meta-value mb-0">{author}</p>
            </div>
            <div className="book-detail-meta-item">
              <p className="book-detail-meta-label mb-1">Price</p>
              <p className="book-detail-meta-value mb-0">
                ${price.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="book-detail-controls">
            <label htmlFor="book-quantity" className="form-label book-detail-label">
              Quantity
            </label>
            <input
              id="book-quantity"
              type="number"
              min="1"
              value={quantity}
              className="form-control book-quantity-input"
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>

          <div className="book-detail-actions">
            <button
              className="btn btn-outline-light book-action-button"
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
            <button
              className="btn btn-primary book-action-button"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BookInfoPage;
