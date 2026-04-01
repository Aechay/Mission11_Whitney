import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../api';
import BookHead from '../components/BookHead';
import type { Book } from '../types/book';

interface BooksApiResponse {
  booklist: Book[];
  count: number;
}

interface BookFormState {
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  classification: string;
  category: string;
  pageCount: string;
  price: string;
}

const emptyFormState: BookFormState = {
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  classification: '',
  category: '',
  pageCount: '',
  price: '',
};

const pageSizeOptions = [5, 10, 15, 20];

function toFormState(book?: Book): BookFormState {
  if (!book) {
    return emptyFormState;
  }

  return {
    title: book.title,
    author: book.author,
    publisher: book.publisher,
    isbn: book.isbn,
    classification: book.classification,
    category: book.category,
    pageCount: String(book.pageCount),
    price: String(book.price),
  };
}

function AdminBooksPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalBooks, setTotalBooks] = useState(0);
  const [formState, setFormState] = useState<BookFormState>(emptyFormState);
  const [editingBookId, setEditingBookId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingBookId, setDeletingBookId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalPages = Math.ceil(totalBooks / pageSize);
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );
  const firstVisibleBook = totalBooks === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastVisibleBook = Math.min(page * pageSize, totalBooks);
  const isEditing = editingBookId !== null;

  async function loadBooks(requestedPage: number, requestedPageSize: number) {
    setIsLoading(true);

    try {
      const response = await fetch(
        buildApiUrl(
          `/getBooks?pageNumber=${requestedPage}&pageSize=${requestedPageSize}&orderBy=1`
        )
      );

      if (!response.ok) {
        throw new Error('Unable to load books from the database.');
      }

      const data: BooksApiResponse = await response.json();
      const updatedTotalPages = Math.ceil(data.count / requestedPageSize);

      if (updatedTotalPages > 0 && requestedPage > updatedTotalPages) {
        setPage(updatedTotalPages);
        return;
      }

      setErrorMessage(null);
      setBooks(data.booklist);
      setTotalBooks(data.count);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load books from the database.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadBooks(page, pageSize);
  }, [page, pageSize]);

  useEffect(() => {
    if (!statusMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setStatusMessage(null);
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [statusMessage]);

  function resetForm() {
    setFormState(emptyFormState);
    setEditingBookId(null);
  }

  function handleFieldChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormState((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleEdit(book: Book) {
    setEditingBookId(book.bookID);
    setFormState(toFormState(book));
    setStatusMessage(null);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function buildBookPayload(): Book | null {
    const title = formState.title.trim();
    const author = formState.author.trim();
    const publisher = formState.publisher.trim();
    const isbn = formState.isbn.trim();
    const classification = formState.classification.trim();
    const category = formState.category.trim();
    const pageCount = Number.parseInt(formState.pageCount, 10);
    const price = Number.parseFloat(formState.price);

    if (
      !title ||
      !author ||
      !publisher ||
      !isbn ||
      !classification ||
      !category ||
      Number.isNaN(pageCount) ||
      pageCount <= 0 ||
      Number.isNaN(price) ||
      price < 0
    ) {
      return null;
    }

    return {
      bookID: editingBookId ?? 0,
      title,
      author,
      publisher,
      isbn,
      classification,
      category,
      pageCount,
      price,
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = buildBookPayload();

    if (!payload) {
      setErrorMessage(
        'Please complete every field and use a positive page count and non-negative price.'
      );
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch(buildApiUrl('/book'), {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Unable to save book changes.');
      }

      setStatusMessage(
        isEditing
          ? `"${payload.title}" was updated successfully.`
          : `"${payload.title}" was added successfully.`
      );

      resetForm();

      if (!isEditing && page !== 1) {
        setPage(1);
      } else {
        await loadBooks(page, pageSize);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to save book changes.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(book: Book) {
    const confirmed = window.confirm(
      `Delete "${book.title}" from the bookstore database?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingBookId(book.bookID);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch(buildApiUrl(`/book?bookId=${book.bookID}`), {
        method: 'DELETE',
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Unable to delete the selected book.');
      }

      setStatusMessage(`"${book.title}" was deleted successfully.`);
      await loadBooks(page, pageSize);

      if (editingBookId === book.bookID) {
        resetForm();
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to delete the selected book.'
      );
    } finally {
      setDeletingBookId(null);
    }
  }

  return (
    <section className="app-shell py-5">
      <BookHead />
      <div className="container admin-books-page">
        <div className="admin-books-toolbar mb-4">
          <div>
            <p className="book-detail-eyebrow mb-2">Admin Catalog</p>
            <h1 className="cart-page-title mb-2">Manage bookstore inventory</h1>
            <p className="book-list-subtitle mb-0">
              Add new books, update existing records, and remove titles directly
              from the database.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline-light cart-page-button"
            onClick={() => navigate('/')}
          >
            Back to Store
          </button>
        </div>

        {statusMessage ? (
          <div className="alert alert-success admin-status-alert" role="status">
            {statusMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="alert alert-danger admin-status-alert" role="alert">
            {errorMessage}
          </div>
        ) : null}

        <div className="admin-books-layout">
          <div className="book-detail-panel admin-form-panel">
            <div className="admin-form-heading mb-4">
              <h2 className="h4 text-white mb-2">
                {isEditing ? 'Edit Book' : 'Add a New Book'}
              </h2>
              <p className="book-detail-meta-label mb-0">
                {isEditing
                  ? 'Update the selected record, then save your changes.'
                  : 'Fill out the fields below to add a title to the catalog.'}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label
                    htmlFor="title"
                    className="form-label book-detail-label"
                  >
                    Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    className="form-control admin-form-control"
                    value={formState.title}
                    onChange={handleFieldChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label
                    htmlFor="author"
                    className="form-label book-detail-label"
                  >
                    Author
                  </label>
                  <input
                    id="author"
                    name="author"
                    type="text"
                    className="form-control admin-form-control"
                    value={formState.author}
                    onChange={handleFieldChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label
                    htmlFor="publisher"
                    className="form-label book-detail-label"
                  >
                    Publisher
                  </label>
                  <input
                    id="publisher"
                    name="publisher"
                    type="text"
                    className="form-control admin-form-control"
                    value={formState.publisher}
                    onChange={handleFieldChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label
                    htmlFor="isbn"
                    className="form-label book-detail-label"
                  >
                    ISBN
                  </label>
                  <input
                    id="isbn"
                    name="isbn"
                    type="text"
                    className="form-control admin-form-control"
                    value={formState.isbn}
                    onChange={handleFieldChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label
                    htmlFor="classification"
                    className="form-label book-detail-label"
                  >
                    Classification
                  </label>
                  <input
                    id="classification"
                    name="classification"
                    type="text"
                    className="form-control admin-form-control"
                    value={formState.classification}
                    onChange={handleFieldChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label
                    htmlFor="category"
                    className="form-label book-detail-label"
                  >
                    Category
                  </label>
                  <input
                    id="category"
                    name="category"
                    type="text"
                    className="form-control admin-form-control"
                    value={formState.category}
                    onChange={handleFieldChange}
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label
                    htmlFor="pageCount"
                    className="form-label book-detail-label"
                  >
                    Pages
                  </label>
                  <input
                    id="pageCount"
                    name="pageCount"
                    type="number"
                    min="1"
                    className="form-control admin-form-control"
                    value={formState.pageCount}
                    onChange={handleFieldChange}
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label
                    htmlFor="price"
                    className="form-label book-detail-label"
                  >
                    Price
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control admin-form-control"
                    value={formState.price}
                    onChange={handleFieldChange}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-actions mt-4">
                <button
                  type="submit"
                  className="btn btn-warning"
                  disabled={isSaving}
                >
                  {isSaving
                    ? 'Saving...'
                    : isEditing
                      ? 'Update Book'
                      : 'Add Book'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-light"
                  onClick={resetForm}
                  disabled={isSaving}
                >
                  {isEditing ? 'Cancel Edit' : 'Clear Form'}
                </button>
              </div>
            </form>
          </div>

          <div className="admin-table-section">
            <div className="book-table-panel p-3 p-lg-4">
              <div className="admin-table-toolbar mb-3">
                <div>
                  <h2 className="h4 text-white mb-1">Current Inventory</h2>
                  <p className="book-pagination-summary mb-0">
                    Showing {firstVisibleBook}-{lastVisibleBook} of {totalBooks}{' '}
                    books
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-light btn-sm"
                  onClick={() => void loadBooks(page, pageSize)}
                  disabled={isLoading}
                >
                  Refresh
                </button>
              </div>

              <div className="table-responsive">
                <table className="table align-middle mb-0 book-table">
                  <thead>
                    <tr>
                      <th scope="col">Title</th>
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
                    {isLoading ? (
                      <tr>
                        <td colSpan={9} className="text-center py-5">
                          Loading books...
                        </td>
                      </tr>
                    ) : books.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-5">
                          No books were found for the current page.
                        </td>
                      </tr>
                    ) : (
                      books.map((book) => (
                        <tr key={book.bookID}>
                          <td>
                            <div className="fw-semibold text-white">
                              {book.title}
                            </div>
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
                          <td className="text-center">
                            <div className="admin-table-actions">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-warning"
                                onClick={() => handleEdit(book)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => void handleDelete(book)}
                                disabled={deletingBookId === book.bookID}
                              >
                                {deletingBookId === book.bookID
                                  ? 'Deleting...'
                                  : 'Delete'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="book-pagination-panel mt-4 px-4 py-3">
              <nav aria-label="Admin book list pagination">
                <ul className="pagination flex-wrap align-items-center justify-content-center mb-0 gap-2">
                  <li className="page-item d-flex align-items-center gap-2 me-2">
                    <label
                      htmlFor="adminPageSize"
                      className="book-pagination-label mb-0"
                    >
                      Per page
                    </label>
                    <select
                      id="adminPageSize"
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
        </div>
      </div>
    </section>
  );
}

export default AdminBooksPage;
