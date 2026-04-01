import { useNavigate } from 'react-router-dom';

function BookHead() {
  const navigate = useNavigate();
  const allDisabled = { cursor: 'pointer', background: 'none', border: 'none' };
  return (
    <div className="text-center mb-5">
      <button onClick={() => navigate('/')} style={allDisabled}>
        <h1 className="display-5 fw-bold text-white mb-2">
          Sahara Booksellers
        </h1>
      </button>
    </div>
  );
}
export default BookHead;
