import { useEffect, useState } from 'react';
import BookFilter from '../components/BookFilter';
import BookHead from '../components/BookHead';
import BookList from '../components/BookList';
import { useCart } from '../context/CartContext';
import { useLocation, useNavigate } from 'react-router-dom';

function BookPage({
  page,
  setPage,
  pageSize,
  setPageSize,
  selectedGenres,
  setSelectedGenres,
}: {
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  selectedGenres: string[];
  setSelectedGenres: (genres: string[]) => void;
}) {
  const { cart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const grandTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  useEffect(() => {
    const toastState = location.state as
      | {
          cartToast?: {
            title: string;
            quantity: number;
          };
        }
      | undefined;

    if (!toastState?.cartToast) {
      return;
    }

    const { title, quantity } = toastState.cartToast;
    const quantityLabel = quantity === 1 ? 'copy' : 'copies';
    setToastMessage(`Added ${quantity} ${quantityLabel} of "${title}" to your cart.`);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToastMessage(null);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  function handleSelectedGenresChange(genres: string[]) {
    setSelectedGenres(genres);
    setPage(1);
  }

  return (
    <>
      <section className="app-shell py-5">
        <button
          type="button"
          className="floating-cart-summary"
          onClick={() => navigate('/cart')}
        >
          <span className="floating-cart-summary-icon" aria-hidden="true">
            🛒
          </span>
          <span className="floating-cart-summary-total">
            ${grandTotal.toFixed(2)}
          </span>
        </button>
        {toastMessage ? (
          <div className="toast-container position-fixed top-0 end-0 p-3 book-toast-container">
            <div
              className="toast show text-bg-success border-0"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="d-flex">
                <div className="toast-body">{toastMessage}</div>
                <button
                  type="button"
                  className="btn-close btn-close-white me-2 m-auto"
                  aria-label="Close"
                  onClick={() => setToastMessage(null)}
                />
              </div>
            </div>
          </div>
        ) : null}
        <BookHead />
        <div className="container mt-4">
          <div className="row">
            <div className="col-md-2">
              <BookFilter
                selectedGenres={selectedGenres}
                setSelectedGenres={handleSelectedGenresChange}
              />
            </div>
            <div className="col-md-10">
              <BookList
                selectedGenres={selectedGenres}
                page={page}
                setPage={setPage}
                pageSize={pageSize}
                setPageSize={setPageSize}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
export default BookPage;
