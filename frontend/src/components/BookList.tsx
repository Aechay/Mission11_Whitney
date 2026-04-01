import { useEffect, useState } from 'react';
import type { Book } from '../types/book.ts';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../api';

interface BooksApiResponse {
  booklist: Book[];
  count: number;
}

const pageSizeOptions = [5, 10, 15, 20];

function BookList({
  selectedGenres,
  page,
  setPage,
  pageSize,
  setPageSize,
}: {
  selectedGenres: string[];
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
}) {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [orderBy, setOrderBy] = useState<1 | 2>(1);

  const totalPages = Math.ceil(totalBooks / pageSize);
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  useEffect(() => {
    const fetchBooks = async () => {
      const genreParams = selectedGenres
        .map((genre) => `genres=${encodeURIComponent(genre)}`)
        .join('&');

      try {
        const response = await fetch(
          buildApiUrl(
            `/getBooks?pageNumber=${page}&pageSize=${pageSize}&orderBy=${orderBy}${genreParams ? `&${genreParams}` : ''}`
          )
        );
        const data: BooksApiResponse = await response.json();
        setBooks(data.booklist);
        setTotalBooks(data.count);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, [page, pageSize, orderBy, selectedGenres]);

  function handleAddToCart(bookID: number) {
    // Find the book in the books array
    const book = books.find((b) => b.bookID === bookID);
    navigate(`/books/${encodeURIComponent(book?.bookID || '')}`);
  }

  return (
    <div className="container">
      <div className="book-table-panel p-3 p-lg-4">
        <div className="table-responsive">
          <table className="table align-middle mb-0 book-table">
            <thead>
              <tr>
                <th scope="col">
                  <button
                    type="button"
                    className="book-sort-button"
                    onClick={() => {
                      setOrderBy((current) => (current === 1 ? 2 : 1));
                      setPage(1);
                    }}
                  >
                    Title
                    <span className="book-sort-indicator" aria-hidden="true">
                      {orderBy === 1 ? '↑' : '↓'}
                    </span>
                  </button>
                </th>
                <th scope="col">Author</th>
                <th scope="col">Publisher</th>
                <th scope="col">ISBN</th>
                <th scope="col">Classification</th>
                <th scope="col">Category</th>
                <th scope="col" className="text-end">
                  Pages
                </th>
                <th scope="col" className="text-end">
                  Price
                </th>
                <th scope="col" className="text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.bookID}>
                  <td>
                    <div className="fw-semibold text-white">{book.title}</div>
                  </td>
                  <td>{book.author}</td>
                  <td>{book.publisher}</td>
                  <td>{book.isbn}</td>
                  <td>{book.classification}</td>
                  <td>
                    <span className="badge rounded-pill text-bg-warning text-dark px-3 py-2">
                      {book.category}
                    </span>
                  </td>
                  <td className="text-end">{book.pageCount}</td>
                  <td className="text-end fw-semibold text-white">
                    ${book.price.toFixed(2)}
                  </td>
                  <td>
                    <button
                      className="badge rounded-pill text-bg-primary px-3 py-2"
                      onClick={() => handleAddToCart(book.bookID)}
                    >
                      Add to Cart
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="book-pagination-panel mt-5 px-4 py-3">
        <nav aria-label="Book list pagination">
          <ul className="pagination flex-wrap align-items-center justify-content-center mb-0 gap-2">
            <li className="page-item d-flex align-items-center gap-2 me-2">
              <label htmlFor="pageSize" className="book-pagination-label mb-0">
                Per page
              </label>
              <select
                id="pageSize"
                className="form-select book-page-size-select"
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </li>

            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
              <button
                type="button"
                className="page-link book-page-link"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Back
              </button>
            </li>

            {pageNumbers.map((pageNumber) => (
              <li key={pageNumber} className="page-item">
                <button
                  type="button"
                  className={`page-link book-page-link ${pageNumber === page ? 'active' : ''}`}
                  onClick={() => setPage(pageNumber)}
                  aria-current={pageNumber === page ? 'page' : undefined}
                >
                  {pageNumber}
                </button>
              </li>
            ))}

            <li
              className={`page-item ${page === totalPages || totalPages === 0 ? 'disabled' : ''}`}
            >
              <button
                type="button"
                className="page-link book-page-link"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages || totalPages === 0}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default BookList;
