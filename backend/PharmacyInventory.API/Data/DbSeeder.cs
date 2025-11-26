using Microsoft.EntityFrameworkCore;
using PharmacyInventory.API.Models;
using BCrypt.Net;
using Microsoft.Extensions.Logging;

namespace PharmacyInventory.API.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context, ILogger? logger = null)
    {
        try
        {
            // Check if database can be connected
            if (!await context.Database.CanConnectAsync())
            {
                logger?.LogWarning("Cannot connect to database. Skipping seed.");
                return;
            }

            logger?.LogInformation("Starting database seeding...");

            // Seed Users
            if (!await context.Users.AnyAsync())
            {
                logger?.LogInformation("Seeding Users...");
                var users = new List<User>
            {
                new User
                {
                    FullName = "Admin User",
                    Email = "admin@pharmacy.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                    Phone = "+1234567890",
                    Role = "Admin",
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    FullName = "John Pharmacist",
                    Email = "pharmacist@pharmacy.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Pharmacist123!"),
                    Phone = "+1234567891",
                    Role = "Pharmacist",
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    FullName = "Sarah Customer",
                    Email = "customer@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Customer123!"),
                    Phone = "+1234567892",
                    Role = "Customer",
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    FullName = "Mike Johnson",
                    Email = "mike@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Customer123!"),
                    Phone = "+1234567893",
                    Role = "Customer",
                    CreatedAt = DateTime.UtcNow
                }
            };

                await context.Users.AddRangeAsync(users);
                await context.SaveChangesAsync();
                logger?.LogInformation($"Successfully seeded {users.Count} users.");
            }
            else
            {
                logger?.LogInformation("Users table already has data. Skipping user seed.");
            }

            // Seed Categories
            if (!await context.Categories.AnyAsync())
            {
                logger?.LogInformation("Seeding Categories...");
                var categories = new List<Category>
            {
                new Category
                {
                    Name = "Pain Relief",
                    Description = "Medications for pain management and relief"
                },
                new Category
                {
                    Name = "Antibiotics",
                    Description = "Antibacterial medications for treating infections"
                },
                new Category
                {
                    Name = "Vitamins & Supplements",
                    Description = "Nutritional supplements and vitamins"
                },
                new Category
                {
                    Name = "Cold & Flu",
                    Description = "Medications for cold and flu symptoms"
                },
                new Category
                {
                    Name = "Digestive Health",
                    Description = "Medications for digestive system health"
                },
                new Category
                {
                    Name = "Cardiovascular",
                    Description = "Medications for heart and blood pressure"
                },
                new Category
                {
                    Name = "Diabetes",
                    Description = "Medications for diabetes management"
                },
                new Category
                {
                    Name = "Skin Care",
                    Description = "Topical medications and skin treatments"
                }
            };

                await context.Categories.AddRangeAsync(categories);
                await context.SaveChangesAsync();
                logger?.LogInformation($"Successfully seeded {categories.Count} categories.");
            }
            else
            {
                logger?.LogInformation("Categories table already has data. Skipping category seed.");
            }

            // Seed Suppliers
            if (!await context.Suppliers.AnyAsync())
            {
                logger?.LogInformation("Seeding Suppliers...");
                var suppliers = new List<Supplier>
            {
                new Supplier
                {
                    Name = "PharmaCorp International",
                    Email = "contact@pharmacorp.com",
                    Phone = "+1-800-555-0101",
                    Address = "123 Pharma Street, Medical City, MC 12345"
                },
                new Supplier
                {
                    Name = "MedSupply Co.",
                    Email = "sales@medsupply.com",
                    Phone = "+1-800-555-0102",
                    Address = "456 Health Avenue, Wellness District, WD 67890"
                },
                new Supplier
                {
                    Name = "Global Pharmaceuticals",
                    Email = "info@globalpharma.com",
                    Phone = "+1-800-555-0103",
                    Address = "789 Medicine Boulevard, Pharma Park, PP 54321"
                },
                new Supplier
                {
                    Name = "BioMed Solutions",
                    Email = "orders@biomed.com",
                    Phone = "+1-800-555-0104",
                    Address = "321 Science Drive, Research Center, RC 98765"
                },
                new Supplier
                {
                    Name = "HealthFirst Distributors",
                    Email = "support@healthfirst.com",
                    Phone = "+1-800-555-0105",
                    Address = "654 Care Lane, Medical Plaza, MP 11223"
                }
            };

                await context.Suppliers.AddRangeAsync(suppliers);
                await context.SaveChangesAsync();
                logger?.LogInformation($"Successfully seeded {suppliers.Count} suppliers.");
            }
            else
            {
                logger?.LogInformation("Suppliers table already has data. Skipping supplier seed.");
            }

            // Seed Medicines
            if (!await context.Medicines.AnyAsync())
            {
                logger?.LogInformation("Seeding Medicines...");
                var categories = await context.Categories.ToListAsync();
                var painReliefCategory = categories.FirstOrDefault(c => c.Name == "Pain Relief");
                var antibioticsCategory = categories.FirstOrDefault(c => c.Name == "Antibiotics");
                var vitaminsCategory = categories.FirstOrDefault(c => c.Name == "Vitamins & Supplements");
                var coldFluCategory = categories.FirstOrDefault(c => c.Name == "Cold & Flu");
                var digestiveCategory = categories.FirstOrDefault(c => c.Name == "Digestive Health");
                var cardiovascularCategory = categories.FirstOrDefault(c => c.Name == "Cardiovascular");
                var diabetesCategory = categories.FirstOrDefault(c => c.Name == "Diabetes");
                var skinCareCategory = categories.FirstOrDefault(c => c.Name == "Skin Care");

                var medicines = new List<Medicine>
                {
                    // Pain Relief
                    new Medicine
                {
                    Name = "Paracetamol 500mg",
                    Description = "Fast-acting pain reliever and fever reducer",
                    CategoryId = painReliefCategory?.Id,
                    UnitPrice = 5.99m,
                    ImageUrl = "https://via.placeholder.com/    300x300?text=Paracetamol"
                },
                new Medicine
                {
                    Name = "Ibuprofen 400mg",
                    Description = "Anti-inflammatory pain reliever",
                    CategoryId = painReliefCategory?.Id,
                    UnitPrice = 8.49m,
                    ImageUrl = "https://via.placeholder.com/300x300?text=Ibuprofen"
                },
                new Medicine
                {
                    Name = "Aspirin 100mg",
                    Description = "Blood thinner and pain reliever",
                    CategoryId = painReliefCategory?.Id,
                    UnitPrice = 4.99m,
                    ImageUrl = "https://via.placeholder.com/300x300?text=Aspirin"
                },
                new Medicine
                {
                    Name = "Naproxen 250mg",
                    Description = "Long-lasting pain and inflammation relief",
                    CategoryId = painReliefCategory?.Id,
                    UnitPrice = 9.99m,
                    ImageUrl = "https://via.placeholder.com/300x300?text=Naproxen"
                },

                // Antibiotics
                new Medicine
                {
                    Name = "Amoxicillin 500mg",
                    Description = "Broad-spectrum antibiotic for bacterial infections",
                    CategoryId = antibioticsCategory?.Id,
                    UnitPrice = 12.99m,
                    ImageUrl = "https://via.placeholder.com/300x300?text=Amoxicillin"
                },
                new Medicine
                {
                    Name = "Azithromycin 250mg",
                    Description = "Macrolide antibiotic for respiratory infections",
                    CategoryId = antibioticsCategory?.Id,
                    UnitPrice = 15.99m,
                    ImageUrl = "https://via.placeholder.com/300x300?text=Azithromycin"
                },
                new Medicine
                {
                    Name = "Ciprofloxacin 500mg",
                    Description = "Fluoroquinolone antibiotic for various infections",
                    CategoryId = antibioticsCategory?.Id,
                    UnitPrice = 18.99m,
                    ImageUrl = "https://via.placeholder.com/300x300?text=Ciprofloxacin"
                },

                // Vitamins & Supplements
                new Medicine
                {
                    Name = "Vitamin D3 1000 IU",
                    Description = "Essential vitamin for bone health and immune system",
                    CategoryId = vitaminsCategory?.Id,
                    UnitPrice = 7.99m,
                    ImageUrl = "https://via.placeholder.com/300x300?text=Vitamin+D3"
                },
                new Medicine
                {
                    Name = "Vitamin C 1000mg",
                    Description = "Antioxidant vitamin for immune support",
                    CategoryId = vitaminsCategory?.Id,
                    UnitPrice = 6.49m,
                    ImageUrl = "https://via.placeholder.com/300x300?text=Vitamin+C"
                },
                new Medicine
                {
                    Name = "Multivitamin Complex",
                    Description = "Complete daily multivitamin supplement",
                    CategoryId = vitaminsCategory?.Id,
                    UnitPrice = 11.99m,
                    ImageUrl = "https://via.placeholder.com/300x300?text=Multivitamin"
                },
                new Medicine
                {
                    Name = "Calcium + Vitamin D",
                    Description = "Bone health supplement with calcium and vitamin D",
                    CategoryId = vitaminsCategory?.Id,
                    UnitPrice = 9.49m,
                    ImageUrl = "https://via.placeholder.com/300x300?text=Calcium"
                },

                // Cold & Flu
                new Medicine
                {
                    Name = "Cold & Flu Relief",
                    Description = "Multi-symptom relief for cold and flu",
                    CategoryId = coldFluCategory?.Id,
                    UnitPrice = 8.99m,
                    ImageUrl = "https://via.placeholder.com/300x300?text=Cold+Flu"
                },
                new Medicine
                {
                    Name = "Cough Syrup",
                    Description = "Effective cough suppressant and expectorant",
                    CategoryId = coldFluCategory?.Id,
                    UnitPrice = 6.99m,
                    ImageUrl = "https://via.placeholder.com/300x300?text=Cough+Syrup"
                },
                new Medicine
                {
                    Name = "Nasal Decongestant",
                    Description = "Relief from nasal congestion and stuffiness",
                    CategoryId = coldFluCategory?.Id,
                    UnitPrice = 5.49m,
                    ImageUrl = "https://via.placeholder.com/300x300?text=Nasal+Spray"
                },

                // Digestive Health
                new Medicine
                {
                    Name = "Antacid Tablets",
                    Description = "Fast relief from heartburn and acid indigestion",
                    CategoryId = digestiveCategory?.Id,
                    UnitPrice = 4.99m,
                    ImageUrl = "https://via.placeholder.com/300x300?text=Antacid"
                },
                new Medicine
                {
                    Name = "Probiotics 10 Billion CFU",
                    Description = "Digestive health support with beneficial bacteria",
                    CategoryId = digestiveCategory?.Id,
                    UnitPrice = 14.99m,
                    ImageUrl = "https://via.placeholder.com/300x300?text=Probiotics"
                },
                new Medicine
                {
                    Name = "Laxative Tablets",
                    Description = "Gentle relief from occasional constipation",
                    CategoryId = digestiveCategory?.Id,
                    UnitPrice = 5.99m,
                    ImageUrl = "https://via.placeholder.com/300x300?text=Laxative"
                },

                // Cardiovascular
                new Medicine
                {
                    Name = "Aspirin 81mg (Low Dose)",
                    Description = "Daily low-dose aspirin for heart health",
                    CategoryId = cardiovascularCategory?.Id,
                    UnitPrice = 6.99m,
                    ImageUrl = "https://via.placeholder.com/300x300?text=Low+Dose+Aspirin"
                },
                new Medicine
                {
                    Name = "Omega-3 Fish Oil",
                    Description = "Heart health supplement with EPA and DHA",
                    CategoryId = cardiovascularCategory?.Id,
                    UnitPrice = 12.99m,
                    ImageUrl = "https://via.placeholder.com/300x300?text=Omega+3"
                },

                // Diabetes
                new Medicine
                {
                    Name = "Blood Glucose Test Strips",
                    Description = "Accurate blood sugar monitoring strips",
                    CategoryId = diabetesCategory?.Id,
                    UnitPrice = 24.99m,
                    ImageUrl = "https://via.placeholder.com/300x300?text=Test+Strips"
                },
                new Medicine
                {
                    Name = "Metformin 500mg",
                    Description = "Oral medication for type 2 diabetes management",
                    CategoryId = diabetesCategory?.Id,
                    UnitPrice = 9.99m,
                    ImageUrl = "https://via.placeholder.com/300x300?text=Metformin"
                },

                // Skin Care
                new Medicine
                {
                    Name = "Hydrocortisone Cream 1%",
                    Description = "Topical treatment for skin irritation and rashes",
                    CategoryId = skinCareCategory?.Id,
                    UnitPrice = 7.49m,
                    ImageUrl = "https://via.placeholder.com/300x300?text=Hydrocortisone"
                },
                new Medicine
                {
                    Name = "Antibacterial Ointment",
                    Description = "Prevents infection in minor cuts and wounds",
                    CategoryId = skinCareCategory?.Id,
                    UnitPrice = 5.99m,
                    ImageUrl = "https://via.placeholder.com/300x300?text=Antibacterial"
                },
                new Medicine
                {
                    Name = "Moisturizing Lotion",
                    Description = "Hydrating lotion for dry and sensitive skin",
                    CategoryId = skinCareCategory?.Id,
                    UnitPrice = 8.99m,
                    ImageUrl = "https://via.placeholder.com/300x300?text=Moisturizer"
                }
            };

                await context.Medicines.AddRangeAsync(medicines);
                await context.SaveChangesAsync();
                logger?.LogInformation($"Successfully seeded {medicines.Count} medicines.");
            }
            else
            {
                logger?.LogInformation("Medicines table already has data. Skipping medicine seed.");
            }

            logger?.LogInformation("Database seeding completed successfully.");
        }
        catch (Exception ex)
        {
            logger?.LogError(ex, "Error occurred while seeding database: {Message}", ex.Message);
            throw; // Re-throw to ensure the error is visible
        }
    }
}

