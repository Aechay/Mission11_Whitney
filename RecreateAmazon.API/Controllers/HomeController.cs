using Microsoft.AspNetCore.Mvc;
using RecreateAmazon.API.Data;

namespace RecreateAmazon.API.Controllers;

[ApiController]
[Route("/api/")]
public class HomeController : ControllerBase
{
    private BookContext _context;
    public HomeController(BookContext temp)
    {
        _context = temp;
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
    public IActionResult GetBook(int bookId)
    {
        var book = _context.Books.First(x => x.BookID == bookId);
        return Ok(book);
    }

    [HttpPost("book")]
    public IActionResult PostBook([FromBody] Book book)
    {
        _context.Books.Add(book);
        _context.SaveChanges();
        return Ok(book);
    }

    [HttpPut("book")]
    public IActionResult PutBook([FromBody] Book book)
    {
        try
        {
            var bookToUpdate = _context.Books.First(x => x.BookID == book.BookID);
            bookToUpdate.Title = book.Title;
            bookToUpdate.Author = book.Author;
            bookToUpdate.Category = book.Category;
            bookToUpdate.Publisher = book.Publisher;
            bookToUpdate.ISBN = book.ISBN;
            bookToUpdate.Classification = book.Classification;
            bookToUpdate.PageCount = book.PageCount;
            bookToUpdate.Price = book.Price;
            _context.SaveChanges();
            return Ok(book);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpDelete("book")]
    public IActionResult DeleteBook(int bookId)
    {
        try
        {
            _context.Books.Remove(_context.Books.First(x => x.BookID == bookId));
            _context.SaveChanges();
            return Accepted();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}