import { useEffect, useState } from 'react';
import { buildApiUrl } from '../api';

function BookFilter({
  selectedGenres,
  setSelectedGenres,
}: {
  selectedGenres: string[];
  setSelectedGenres: (genres: string[]) => void;
}) {
  const [genres, setGenres] = useState<string[]>([]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(buildApiUrl('/getGenres'));
        const data: string[] = await response.json();
        setGenres(data);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };
    fetchGenres();
  }, []);

  function handleGenreChange({ target }: { target: HTMLInputElement }) {
    const updatedGenres = selectedGenres.includes(target.value)
      ? selectedGenres.filter((genre) => genre !== target.value)
      : [...selectedGenres, target.value];
    setSelectedGenres(updatedGenres);
  }

  return (
    <div className="book-filter text-white">
      <h2>Filter by Genre</h2>
      <option value="">All Genres</option>
      {genres.map((genre) => (
        <div key={genre}>
          <input
            type="checkbox"
            id={genre}
            value={genre}
            checked={selectedGenres.includes(genre)}
            onChange={handleGenreChange}
          />
          <label htmlFor={genre} className="filterLabel">
            {genre}
          </label>
        </div>
      ))}
    </div>
  );
}

export default BookFilter;
