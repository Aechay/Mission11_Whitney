import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import BookHead from '../components/BookHead';

function CartPage() {
  const navigate = useNavigate();
  const { cart, removeCartItem } = useCart();
  const grandTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  if (cart.length === 0) {
    return (
      <section className="app-shell py-5">
        <BookHead />
        <div className="container cart-page">
          <div className="cart-page-header">
            <div>
              <p className="cart-page-eyebrow mb-2">Shopping cart</p>
              <h1 className="cart-page-title mb-0">Your Cart</h1>
            </div>
            <button
              className="btn btn-outline-light cart-page-button"
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
          </div>

          <div className="book-table-panel cart-empty-panel">
            <h2 className="cart-empty-title mb-2">Your cart is empty</h2>
            <p className="cart-empty-copy mb-0">
              Add a book to your cart to see it here.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="app-shell py-5">
      <BookHead />
      <div className="container cart-page">
        <div className="cart-page-header">
          <div>
            <p className="cart-page-eyebrow mb-2">Shopping cart</p>
            <h1 className="cart-page-title mb-0">Your Cart</h1>
          </div>
          <button
            className="btn btn-outline-light cart-page-button"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </button>
        </div>

        <div className="book-table-panel p-3 p-lg-4">
          <div className="table-responsive">
            <table className="table align-middle mb-0 book-table">
              <thead>
                <tr>
                  <th scope="col">Title</th>
                  <th scope="col">Author</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Unit Price</th>
                  <th scope="col">Subtotal</th>
                  <th scope="col" className="text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.bookID}>
                    <td>{item.title}</td>
                    <td>{item.author}</td>
                    <td>{item.quantity}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                    <td className="text-center cart-action-cell">
                      <button
                        className="btn btn-danger btn-sm cart-remove-button"
                        onClick={() => removeCartItem(item.bookID)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="text-end fw-bold text-white">
                    Total
                  </td>
                  <td className="fw-bold text-white">
                    ${grandTotal.toFixed(2)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CartPage;
