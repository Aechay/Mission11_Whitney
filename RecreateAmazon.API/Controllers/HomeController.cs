using Microsoft.AspNetCore.Mvc;
using RecreateAmazon.API.Data;

namespace RecreateAmazon.API.Controllers;

[ApiController]
[Route("/api/")]
public class HomeController : ControllerBase
{
    private BookContext _context;
    public HomeController(BookContext _temp)
    {
        _context = _temp;
    }
    
    [HttpGet("getBooks")]
    public IActionResult GetBooks(int pageSize, int pageNumber, int orderBy, [FromQuery]List<string>? genres = null)
    {
        var query =  _context.Books.AsQueryable();

        if (genres != null && genres.Any())
        {
            query = query.Where(x => genres.Contains(x.Category));
        }
        
        var bookList = query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
        if (orderBy == 1) {
            bookList = query.OrderBy(x => x.Title).Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
        } else if (orderBy == 2) {
            bookList = query.OrderByDescending(x => x.Title).Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
        }
        var bookCount = query.Count();
        var toReturn = new { booklist = bookList, count = bookCount };
        return Ok(toReturn);
    }

    [HttpGet("getGenres")]
    public IActionResult GetGenres()
    {
        var genres = _context.Books.Select(x => x.Category).Distinct().ToList();
        return Ok(genres);
    }

    [HttpGet("getBook")]
    public IActionResult getBook(int bookId)
    {
        var book = _context.Books.Where(x => x.BookID == bookId).First();
        return Ok(book);
    }
}