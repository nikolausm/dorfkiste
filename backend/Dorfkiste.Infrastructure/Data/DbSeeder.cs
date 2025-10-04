using Dorfkiste.Core.Entities;
using Microsoft.EntityFrameworkCore;
using System.IO;

namespace Dorfkiste.Infrastructure.Data;

public static class DbSeeder
{
    private static byte[]? ReadImageFile(string imagePath)
    {
        try
        {
            if (File.Exists(imagePath))
            {
                return File.ReadAllBytes(imagePath);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error reading image file {imagePath}: {ex.Message}");
        }
        return null;
    }

    public static async Task SeedAsync(DorfkisteDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        // Seed Categories
        if (!context.Categories.Any())
        {
            var categories = new List<Category>
            {
                new()
                {
                    Name = "Werkzeuge & Geräte",
                    Description = "Bohrmaschinen, Sägen, Schraubendreher und andere Werkzeuge",
                    IconName = "tools",
                    IsActive = true,
                    SortOrder = 1
                },
                new()
                {
                    Name = "Gartengeräte",
                    Description = "Rasenmäher, Heckenscheren, Gartenschläuche und mehr",
                    IconName = "garden",
                    IsActive = true,
                    SortOrder = 2
                },
                new()
                {
                    Name = "Haushaltsgeräte",
                    Description = "Küchengeräte, Reinigungsgeräte und Haushaltshilfen",
                    IconName = "home",
                    IsActive = true,
                    SortOrder = 3
                },
                new()
                {
                    Name = "Sport & Freizeit",
                    Description = "Sportgeräte, Fahrräder, Campingausrüstung",
                    IconName = "sport",
                    IsActive = true,
                    SortOrder = 4
                },
                new()
                {
                    Name = "Transport & Umzug",
                    Description = "Anhänger, Transportboxen, Umzugshilfen",
                    IconName = "transport",
                    IsActive = true,
                    SortOrder = 5
                },
                new()
                {
                    Name = "Elektronik",
                    Description = "Beamer, Sound-Anlagen, technische Geräte",
                    IconName = "electronics",
                    IsActive = true,
                    SortOrder = 6
                },
                new()
                {
                    Name = "Garten- & Landschaftsarbeit",
                    Description = "Rasenpflege, Heckenschnitt, Gartengestaltung",
                    IconName = "landscaping",
                    IsActive = true,
                    SortOrder = 7
                },
                new()
                {
                    Name = "Reinigung & Haushalt",
                    Description = "Hausreinigung, Fensterputzen, Bügelservice",
                    IconName = "cleaning",
                    IsActive = true,
                    SortOrder = 8
                },
                new()
                {
                    Name = "Sonstiges",
                    Description = "Alles andere, was sich nicht in die anderen Kategorien einordnen lässt",
                    IconName = "other",
                    IsActive = true,
                    SortOrder = 9
                }
            };

            context.Categories.AddRange(categories);
            await context.SaveChangesAsync();
        }

        // Seed Test Users
        if (!context.Users.Any())
        {
            var testUsers = new List<User>
            {
                new()
                {
                    Email = "admin@dorfkiste.de",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!", BCrypt.Net.BCrypt.GenerateSalt(12)),
                    FirstName = "Admin",
                    LastName = "Dorfkiste",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true,
                    IsAdmin = true,
                    ContactInfo = new ContactInfo
                    {
                        PhoneNumber = "0800 123456",
                        MobileNumber = "0170 1234567",
                        Street = "Hauptstraße 1",
                        City = "München",
                        PostalCode = "80331",
                        Country = "Deutschland"
                    }
                },
                new()
                {
                    Email = "max.mustermann@test.de",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!", BCrypt.Net.BCrypt.GenerateSalt(12)),
                    FirstName = "Max",
                    LastName = "Mustermann",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true,
                    ContactInfo = new ContactInfo
                    {
                        PhoneNumber = "0123 456789",
                        MobileNumber = "0171 1234567",
                        Street = "Musterstraße 1",
                        City = "München",
                        PostalCode = "80331",
                        Country = "Deutschland"
                    }
                },
                new()
                {
                    Email = "anna.schmidt@test.de", 
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!", BCrypt.Net.BCrypt.GenerateSalt(12)),
                    FirstName = "Anna",
                    LastName = "Schmidt",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true,
                    ContactInfo = new ContactInfo
                    {
                        MobileNumber = "0175 7654321",
                        Street = "Gartenweg 15",
                        City = "Berlin",
                        PostalCode = "10115",
                        Country = "Deutschland"
                    }
                },
                new()
                {
                    Email = "peter.wagner@test.de",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!", BCrypt.Net.BCrypt.GenerateSalt(12)),
                    FirstName = "Peter",
                    LastName = "Wagner",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true,
                    ContactInfo = new ContactInfo
                    {
                        PhoneNumber = "040 9876543",
                        Street = "Hafenstraße 42",
                        City = "Hamburg",
                        PostalCode = "20459",
                        Country = "Deutschland"
                    }
                }
            };

            context.Users.AddRange(testUsers);
            await context.SaveChangesAsync();

            // Seed Test Offers
            var categories = await context.Categories.ToListAsync();
            var users = await context.Users.ToListAsync();

            var testOffers = new List<Offer>
            {
                new()
                {
                    Title = "Bohrmaschine Makita HP2050H",
                    Description = "Professionelle Schlagbohrmaschine mit 2-Gang-Getriebe. Ideal für Beton, Mauerwerk und Holz. Sehr guter Zustand, kaum benutzt.",
                    PricePerDay = 15.00m,
                    IsService = false,
                    UserId = users[0].Id,
                    CategoryId = categories.First(c => c.Name == "Werkzeuge & Geräte").Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-5),
                    UpdatedAt = DateTime.UtcNow.AddDays(-5),
                    IsActive = true
                },
                new()
                {
                    Title = "Rasenmäher Benzin - Honda HRG 536",
                    Description = "Selbstfahrender Rasenmäher mit Honda Motor. Schnittbreite 53cm, Fangkorb 65L. Regelmäßig gewartet, läuft einwandfrei.",
                    PricePerDay = 25.00m,
                    IsService = false,
                    UserId = users[1].Id,
                    CategoryId = categories.First(c => c.Name == "Gartengeräte").Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-3),
                    UpdatedAt = DateTime.UtcNow.AddDays(-3),
                    IsActive = true
                },
                new()
                {
                    Title = "Küchenmaschine KitchenAid",
                    Description = "Vielseitige Küchenmaschine mit vielen Aufsätzen. Perfect für Backen und Kochen. Inkl. Rührschüssel und verschiedener Knethaken.",
                    PricePerDay = 12.00m,
                    IsService = false,
                    UserId = users[0].Id,
                    CategoryId = categories.First(c => c.Name == "Haushaltsgeräte").Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-7),
                    UpdatedAt = DateTime.UtcNow.AddDays(-7),
                    IsActive = true
                },
                new()
                {
                    Title = "Gartenservice - Rasenpflege",
                    Description = "Professionelle Gartenpflege: Rasenmähen, Heckenschnitt, Unkraut jäten, Beetpflege. Eigene Geräte vorhanden. Termine nach Absprache.",
                    PricePerHour = 25.00m,
                    IsService = true,
                    UserId = users[1].Id,
                    CategoryId = categories.First(c => c.Name == "Garten- & Landschaftsarbeit").Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-2),
                    UpdatedAt = DateTime.UtcNow.AddDays(-2),
                    IsActive = true
                },
                new()
                {
                    Title = "Beamer Epson EH-TW7000",
                    Description = "4K Pro-UHD Heimkino-Beamer mit 3000 Lumen. Perfekt für Filmabende oder Präsentationen. Inkl. Leinwand und HDMI-Kabel.",
                    PricePerDay = 45.00m,
                    IsService = false,
                    UserId = users[2].Id,
                    CategoryId = categories.First(c => c.Name == "Elektronik").Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-4),
                    UpdatedAt = DateTime.UtcNow.AddDays(-4),
                    IsActive = true
                }
            };

            context.Offers.AddRange(testOffers);
            await context.SaveChangesAsync();
        }

        // Seed Test Pictures
        if (!context.OfferPictures.Any())
        {
            var offers = await context.Offers.ToListAsync();

            // Generate placeholder image (1x1 transparent PNG)
            var placeholderImageData = Convert.FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");

            // Define multiple images per offer with display order
            var imageSeeds = new List<(string offerTitle, List<string> fileNames)>
            {
                ("Bohrmaschine Makita HP2050H", new List<string> { "Bohrmaschine_Makita.jpg", "Bohrmaschine_Zubehoer.jpg", "Bohrmaschine_Action.jpg" }),
                ("Rasenmäher Benzin - Honda HRG 536", new List<string> { "Rasenmäher_Honda.jpg", "Rasenmäher_Action.jpg" }),
                ("Küchenmaschine KitchenAid", new List<string> { "KitchenAid_Maschine.jpg" }),
                ("Gartenservice - Rasenpflege", new List<string> { "Garten_Service.jpg" }),
                ("Beamer Epson EH-TW7000", new List<string> { "Epson_Beamer.jpg", "Heimkino_Setup.jpg" })
            };

            var pictures = new List<OfferPicture>();

            foreach (var (offerTitle, fileNames) in imageSeeds)
            {
                var offer = offers.FirstOrDefault(o => o.Title == offerTitle);
                if (offer != null)
                {
                    for (int i = 0; i < fileNames.Count; i++)
                    {
                        pictures.Add(new OfferPicture
                        {
                            OfferId = offer.Id,
                            ImageData = placeholderImageData,
                            ContentType = "image/png",
                            FileName = fileNames[i],
                            FileSize = placeholderImageData.Length,
                            DisplayOrder = i + 1,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                }
            }

            if (pictures.Any())
            {
                context.OfferPictures.AddRange(pictures);
                await context.SaveChangesAsync();
                Console.WriteLine($"Seeded {pictures.Count} placeholder images for {imageSeeds.Count} offers.");
            }
        }
    }
}