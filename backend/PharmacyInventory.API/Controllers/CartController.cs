using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using PharmacyInventory.API.Data;
using PharmacyInventory.API.DTOs;
using PharmacyInventory.API.Models;

namespace PharmacyInventory.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly AppDbContext _context;

    public CartController(AppDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }

    [HttpGet]
    public async Task<ActionResult<CartDto>> GetCart()
    {
        var userId = GetUserId();

        var cart = await _context.Carts
            .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Medicine)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
        {
            // Create new cart if doesn't exist
            cart = new Cart { UserId = userId };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
        }

        var result = new CartDto
        {
            Id = cart.Id,
            UserId = cart.UserId,
            CreatedAt = cart.CreatedAt,
            Items = cart.CartItems.Select(ci => new CartItemDto
            {
                Id = ci.Id,
                MedicineId = ci.MedicineId,
                MedicineName = ci.Medicine.Name,
                UnitPrice = ci.Medicine.UnitPrice,
                Quantity = ci.Quantity,
                SubTotal = ci.Medicine.UnitPrice * ci.Quantity,
                ImageUrl = ci.Medicine.ImageUrl
            }).ToList(),
            TotalAmount = cart.CartItems.Sum(ci => ci.Medicine.UnitPrice * ci.Quantity)
        };

        return Ok(result);
    }

    [HttpPost("items")]
    public async Task<ActionResult<CartItemDto>> AddToCart([FromBody] AddToCartDto addDto)
    {
        var userId = GetUserId();

        var medicine = await _context.Medicines.FindAsync(addDto.MedicineId);
        if (medicine == null)
        {
            return NotFound(new { message = "Medicine not found" });
        }

        // Check stock availability
        var totalStock = await _context.MedicineBatches
            .Where(b => b.MedicineId == addDto.MedicineId && b.Quantity > 0)
            .SumAsync(b => b.Quantity);

        if (totalStock < addDto.Quantity)
        {
            return BadRequest(new { message = "Insufficient stock" });
        }

        var cart = await _context.Carts
            .Include(c => c.CartItems)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
        {
            cart = new Cart { UserId = userId };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
        }

        var existingItem = cart.CartItems.FirstOrDefault(ci => ci.MedicineId == addDto.MedicineId);

        if (existingItem != null)
        {
            existingItem.Quantity += addDto.Quantity;
        }
        else
        {
            cart.CartItems.Add(new CartItem
            {
                MedicineId = addDto.MedicineId,
                Quantity = addDto.Quantity
            });
        }

        await _context.SaveChangesAsync();

        var cartItem = cart.CartItems.FirstOrDefault(ci => ci.MedicineId == addDto.MedicineId);
        var result = new CartItemDto
        {
            Id = cartItem!.Id,
            MedicineId = cartItem.MedicineId,
            MedicineName = medicine.Name,
            UnitPrice = medicine.UnitPrice,
            Quantity = cartItem.Quantity,
            SubTotal = medicine.UnitPrice * cartItem.Quantity,
            ImageUrl = medicine.ImageUrl
        };

        return Ok(result);
    }

    [HttpPut("items/{itemId}")]
    public async Task<ActionResult<CartItemDto>> UpdateCartItem(int itemId, [FromBody] UpdateCartItemDto updateDto)
    {
        var userId = GetUserId();

        var cartItem = await _context.CartItems
            .Include(ci => ci.Cart)
            .Include(ci => ci.Medicine)
            .FirstOrDefaultAsync(ci => ci.Id == itemId && ci.Cart.UserId == userId);

        if (cartItem == null)
        {
            return NotFound();
        }

        // Check stock
        var totalStock = await _context.MedicineBatches
            .Where(b => b.MedicineId == cartItem.MedicineId && b.Quantity > 0)
            .SumAsync(b => b.Quantity);

        if (totalStock < updateDto.Quantity)
        {
            return BadRequest(new { message = "Insufficient stock" });
        }

        cartItem.Quantity = updateDto.Quantity;
        await _context.SaveChangesAsync();

        var result = new CartItemDto
        {
            Id = cartItem.Id,
            MedicineId = cartItem.MedicineId,
            MedicineName = cartItem.Medicine.Name,
            UnitPrice = cartItem.Medicine.UnitPrice,
            Quantity = cartItem.Quantity,
            SubTotal = cartItem.Medicine.UnitPrice * cartItem.Quantity,
            ImageUrl = cartItem.Medicine.ImageUrl
        };

        return Ok(result);
    }

    [HttpDelete("items/{itemId}")]
    public async Task<IActionResult> RemoveFromCart(int itemId)
    {
        var userId = GetUserId();

        var cartItem = await _context.CartItems
            .Include(ci => ci.Cart)
            .FirstOrDefaultAsync(ci => ci.Id == itemId && ci.Cart.UserId == userId);

        if (cartItem == null)
        {
            return NotFound();
        }

        _context.CartItems.Remove(cartItem);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("clear")]
    public async Task<IActionResult> ClearCart()
    {
        var userId = GetUserId();

        var cart = await _context.Carts
            .Include(c => c.CartItems)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart != null)
        {
            _context.CartItems.RemoveRange(cart.CartItems);
            await _context.SaveChangesAsync();
        }

        return NoContent();
    }
}

