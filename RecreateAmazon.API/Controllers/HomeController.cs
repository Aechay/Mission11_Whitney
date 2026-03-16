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
    public IActionResult GetBooks(int pageSize, int pageNumber, int orderBy)
    {
        var bookList = _context.Books.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
        if (orderBy == 1) {
            bookList = _context.Books.OrderBy(x => x.Title).Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
        } else if (orderBy == 2) {
            bookList = _context.Books.OrderByDescending(x => x.Title).Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
        }
        var bookCount = _context.Books.Count();
        var toReturn = new { booklist = bookList, count = bookCount };
        return Ok(toReturn);
    }
}