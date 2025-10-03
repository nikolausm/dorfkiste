using Dorfkiste.Core.Entities;
using Dorfkiste.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using OpenAI;
using OpenAI.Chat;
using System.Text.Json;

namespace Dorfkiste.Application.Services;

public class OfferService : IOfferService
{
    private readonly IOfferRepository _offerRepository;
    private readonly IOfferPictureRepository _pictureRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;
    private readonly OpenAIClient _openAIClient;

    public OfferService(IOfferRepository offerRepository, IOfferPictureRepository pictureRepository, ICategoryRepository categoryRepository, IUserRepository userRepository, IConfiguration configuration)
    {
        _offerRepository = offerRepository;
        _pictureRepository = pictureRepository;
        _categoryRepository = categoryRepository;
        _userRepository = userRepository;
        _configuration = configuration;
        _openAIClient = new OpenAIClient(_configuration["OpenAI:ApiKey"]);
    }

    public async Task<IEnumerable<Offer>> GetAllOffersAsync()
    {
        return await _offerRepository.GetActiveAsync();
    }

    public async Task<IEnumerable<Offer>> GetOffersByCategoryAsync(int categoryId)
    {
        return await _offerRepository.GetByCategoryAsync(categoryId);
    }

    public async Task<IEnumerable<Offer>> SearchOffersAsync(string searchTerm)
    {
        return await _offerRepository.SearchAsync(searchTerm);
    }

    public async Task<Offer?> GetOfferByIdAsync(int id)
    {
        return await _offerRepository.GetByIdAsync(id);
    }

    public async Task<Offer> CreateOfferAsync(Offer offer, int userId)
    {
        // GDPR: Check if user's email is verified
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new InvalidOperationException("Benutzer wurde nicht gefunden.");

        if (!user.EmailVerified)
            throw new InvalidOperationException("Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse, bevor Sie Angebote erstellen können.");

        offer.UserId = userId;
        offer.CreatedAt = DateTime.UtcNow;
        offer.UpdatedAt = DateTime.UtcNow;
        offer.IsActive = true;

        return await _offerRepository.CreateAsync(offer);
    }

    public async Task<Offer> UpdateOfferAsync(Offer offer, int userId)
    {
        var existingOffer = await _offerRepository.GetByIdAsync(offer.Id);
        
        if (existingOffer == null)
            throw new InvalidOperationException("Angebot wurde nicht gefunden.");

        if (existingOffer.UserId != userId)
            throw new UnauthorizedAccessException("Sie haben keine Berechtigung, dieses Angebot zu bearbeiten.");

        offer.UserId = userId;
        offer.UpdatedAt = DateTime.UtcNow;

        return await _offerRepository.UpdateAsync(offer);
    }

    public async Task DeleteOfferAsync(int id, int userId)
    {
        var offer = await _offerRepository.GetByIdAsync(id);
        
        if (offer == null)
            throw new InvalidOperationException("Angebot wurde nicht gefunden.");

        if (offer.UserId != userId)
            throw new UnauthorizedAccessException("Sie haben keine Berechtigung, dieses Angebot zu löschen.");

        await _offerRepository.DeleteAsync(id);
    }

    public async Task<string?> GenerateDescriptionFromImageAsync(byte[] imageData)
    {
        try
        {
            var base64Image = Convert.ToBase64String(imageData);

            var chatClient = _openAIClient.GetChatClient("gpt-4o");

            var messages = new List<ChatMessage>
            {
                new SystemChatMessage("Du bist ein Experte für das Erstellen von Produktbeschreibungen für einen lokalen Marktplatz namens 'Dorfkiste'. Erstelle eine ansprechende, detaillierte Beschreibung auf Deutsch basierend auf dem hochgeladenen Bild. Die Beschreibung soll potenzielle Interessenten überzeugen und wichtige Details über den Zustand und die Eigenschaften des Gegenstands enthalten. Falls das Bild nicht eindeutig analysiert werden kann, gib eine höfliche Nachricht zurück, dass eine manuelle Beschreibung erforderlich ist."),
                new UserChatMessage(
                    ChatMessageContentPart.CreateTextPart("Bitte erstelle eine detaillierte Produktbeschreibung für diesen Gegenstand. Beschreibe den Zustand, die Eigenschaften und warum jemand daran interessiert sein könnte. Halte die Beschreibung freundlich und einladend."),
                    ChatMessageContentPart.CreateImagePart(BinaryData.FromBytes(imageData), "image/jpeg")
                )
            };

            var result = await chatClient.CompleteChatAsync(messages);
            var description = result.Value.Content[0].Text;

            // Return the description even if it indicates the image couldn't be analyzed - let the user see what the AI says
            return description;
        }
        catch (Exception ex)
        {
            // Log the error (in a real application, you'd use proper logging)
            Console.WriteLine($"Error generating description from image: {ex.GetType().Name}: {ex.Message}");

            // Return a fallback message instead of null
            return "Das Bild konnte nicht automatisch analysiert werden. Bitte fügen Sie eine detaillierte Beschreibung manuell hinzu.";
        }
    }

    public async Task<AnalyzeImageResponse?> AnalyzeImageAndSuggestOfferDataAsync(byte[] imageData)
    {
        try
        {
            var categories = await _categoryRepository.GetActiveAsync();
            var categoryList = string.Join(", ", categories.Select(c => $"{c.Name} ({c.Description})"));

            var chatClient = _openAIClient.GetChatClient("gpt-4o");

            var systemPrompt = @"Du bist ein Experte für das Erstellen von Angeboten auf einem lokalen Marktplatz namens 'Dorfkiste'. 

Analysiere das hochgeladene Bild und erstelle Vorschläge für ein Angebot. Das angebot soll den Interessenten auf der Grundlage des Bildes und der Kategorie ausreichend detailliert sein und aus sicht des erstellers sinnvoll sein.

Verfügbare Kategorien:
" + categoryList + @"

WICHTIG: Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt. Keine Erklärungen, kein Markdown, keine zusätzlichen Texte - nur das JSON:

Falls das Bild nicht analysiert werden kann (zu unscharf, kein erkennbarer Gegenstand, etc.), antworte mit:
{
  ""title"": ""Unbekannter Gegenstand"",
  ""description"": ""Das Bild konnte nicht eindeutig analysiert werden. Bitte fügen Sie eine detaillierte Beschreibung hinzu."",
  ""isService"": false,
  ""suggestedCategoryName"": ""Sonstiges"",
  ""suggestedPricePerDay"": 10.00,
  ""suggestedPricePerHour"": null
}

Andernfalls, falls das Bild erfolgreich analysiert werden kann:
{
  ""title"": ""Prägnanter Titel des Gegenstands/Service"",
  ""description"": ""Detaillierte, ansprechende Beschreibung auf Deutsch"",
  ""isService"": false,
  ""suggestedCategoryName"": ""Name der passendsten Kategorie"",
  ""suggestedPricePerDay"": 15.00,
  ""suggestedPricePerHour"": null
}

Regeln:
- Titel: Kurz und prägnant, inkl. Marke/Model falls erkennbar
- Beschreibung: 2-4 Sätze, Zustand, Eigenschaften, warum interessant, für was kann es benutzt werden.
- isService: false für Gegenstände, true für Dienstleistungen
- Kategorie: Wähle die passendste aus der Liste
- Preise: Realistische Preise für die Region (€5-500/Tag für Gegenstände, €15-150/h für Services)
- Verwende nur einen Preis (pricePerDay oder pricePerHour)

ANTWORT NUR DAS JSON-OBJEKT!";

            var messages = new List<ChatMessage>
            {
                new SystemChatMessage(systemPrompt),
                new UserChatMessage(
                    ChatMessageContentPart.CreateTextPart("Analysiere dieses Bild und erstelle einen Angebotsvorschlag."),
                    ChatMessageContentPart.CreateImagePart(BinaryData.FromBytes(imageData), "image/jpeg")
                )
            };

            var result = await chatClient.CompleteChatAsync(messages);
            var rawResponse = result.Value.Content[0].Text;

            Console.WriteLine($"Raw AI response: {rawResponse}");

            // Extract JSON from the response (handle markdown, extra text, etc.)
            var jsonString = ExtractJsonFromResponse(rawResponse);
            Console.WriteLine($"Extracted JSON: {jsonString}");

            try
            {
                var jsonDoc = JsonDocument.Parse(jsonString);
                var root = jsonDoc.RootElement;

                var response = new AnalyzeImageResponse
                {
                    Title = root.GetProperty("title").GetString() ?? "",
                    Description = root.GetProperty("description").GetString() ?? "",
                    IsService = root.GetProperty("isService").GetBoolean(),
                    SuggestedCategoryName = root.GetProperty("suggestedCategoryName").GetString() ?? ""
                };

                if (root.TryGetProperty("suggestedPricePerDay", out var pricePerDay) && pricePerDay.ValueKind != JsonValueKind.Null)
                {
                    response.SuggestedPricePerDay = pricePerDay.GetDecimal();
                }

                if (root.TryGetProperty("suggestedPricePerHour", out var pricePerHour) && pricePerHour.ValueKind != JsonValueKind.Null)
                {
                    response.SuggestedPricePerHour = pricePerHour.GetDecimal();
                }

                var matchingCategory = categories.FirstOrDefault(c =>
                    c.Name.Equals(response.SuggestedCategoryName, StringComparison.OrdinalIgnoreCase));

                if (matchingCategory != null)
                {
                    response.SuggestedCategoryId = matchingCategory.Id;
                }
                else
                {
                    // Fallback to "Sonstiges" category if suggested category doesn't exist
                    var fallbackCategory = categories.FirstOrDefault(c => c.Name.Equals("Sonstiges", StringComparison.OrdinalIgnoreCase));
                    if (fallbackCategory != null)
                    {
                        response.SuggestedCategoryId = fallbackCategory.Id;
                        response.SuggestedCategoryName = fallbackCategory.Name;
                    }
                }

                return response;
            }
            catch (JsonException ex)
            {
                Console.WriteLine($"Failed to parse extracted JSON: {jsonString}");
                Console.WriteLine($"JSON parse error: {ex.Message}");

                // Return fallback response when JSON parsing fails
                var fallbackCategory = categories.FirstOrDefault(c => c.Name.Equals("Sonstiges", StringComparison.OrdinalIgnoreCase));
                return new AnalyzeImageResponse
                {
                    Title = "Unbekannter Gegenstand",
                    Description = "Das Bild konnte nicht automatisch analysiert werden. Bitte fügen Sie eine detaillierte Beschreibung und weitere Informationen manuell hinzu.",
                    IsService = false,
                    SuggestedCategoryName = fallbackCategory?.Name ?? "Sonstiges",
                    SuggestedCategoryId = fallbackCategory?.Id,
                    SuggestedPricePerDay = 10.00m,
                    SuggestedPricePerHour = null
                };
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error analyzing image: {ex.GetType().Name}: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.GetType().Name}: {ex.InnerException.Message}");
            }

            // Return fallback response when any error occurs
            var categories = await _categoryRepository.GetActiveAsync();
            var fallbackCategory = categories.FirstOrDefault(c => c.Name.Equals("Sonstiges", StringComparison.OrdinalIgnoreCase));
            return new AnalyzeImageResponse
            {
                Title = "Gegenstand",
                Description = "Es gab ein Problem bei der automatischen Bildanalyse. Bitte fügen Sie eine detaillierte Beschreibung manuell hinzu.",
                IsService = false,
                SuggestedCategoryName = fallbackCategory?.Name ?? "Sonstiges",
                SuggestedCategoryId = fallbackCategory?.Id,
                SuggestedPricePerDay = 10.00m,
                SuggestedPricePerHour = null
            };
        }
    }

    private static string ExtractJsonFromResponse(string response)
    {
        if (string.IsNullOrWhiteSpace(response))
            return "{}";

        response = response.Trim();

        // If the response starts with { and ends with }, it's likely pure JSON
        if (response.StartsWith("{") && response.EndsWith("}"))
        {
            return response;
        }

        // Look for JSON within markdown code blocks
        var jsonBlockMatch = System.Text.RegularExpressions.Regex.Match(
            response,
            @"```(?:json)?\s*(\{.*?\})\s*```",
            System.Text.RegularExpressions.RegexOptions.Singleline | System.Text.RegularExpressions.RegexOptions.IgnoreCase
        );

        if (jsonBlockMatch.Success)
        {
            return jsonBlockMatch.Groups[1].Value.Trim();
        }

        // Look for the first complete JSON object by finding matching braces
        var firstBrace = response.IndexOf('{');
        if (firstBrace >= 0)
        {
            int braceCount = 0;
            int endPos = firstBrace;

            for (int i = firstBrace; i < response.Length; i++)
            {
                if (response[i] == '{')
                    braceCount++;
                else if (response[i] == '}')
                    braceCount--;

                if (braceCount == 0)
                {
                    endPos = i;
                    break;
                }
            }

            if (braceCount == 0 && endPos > firstBrace)
            {
                return response.Substring(firstBrace, endPos - firstBrace + 1).Trim();
            }
        }

        // If no valid JSON is found, check if the response indicates the AI couldn't analyze the image
        var lowerResponse = response.ToLowerInvariant();
        if (lowerResponse.Contains("cannot") || lowerResponse.Contains("unable") || lowerResponse.Contains("not possible") ||
            lowerResponse.Contains("kann nicht") || lowerResponse.Contains("nicht möglich") || lowerResponse.Contains("unscharf") ||
            lowerResponse.Contains("unclear") || lowerResponse.Contains("blurry"))
        {
            // Return a fallback JSON for unanalyzable images
            return @"{
                ""title"": ""Unbekannter Gegenstand"",
                ""description"": ""Das Bild konnte nicht eindeutig analysiert werden. Bitte fügen Sie eine detaillierte Beschreibung hinzu."",
                ""isService"": false,
                ""suggestedCategoryName"": ""Sonstiges"",
                ""suggestedPricePerDay"": 10.00,
                ""suggestedPricePerHour"": null
            }";
        }

        // Return empty JSON as last resort - this will cause a JsonException and trigger fallback handling
        return "{}";
    }

    public async Task<OfferPicture> AddPictureAsync(OfferPicture picture)
    {
        return await _pictureRepository.CreateAsync(picture);
    }

    public async Task<OfferPicture?> GetPictureAsync(int pictureId)
    {
        return await _pictureRepository.GetByIdAsync(pictureId);
    }

    public async Task<IEnumerable<OfferPicture>> GetOfferPicturesAsync(int offerId)
    {
        return await _pictureRepository.GetByOfferIdAsync(offerId);
    }

    public async Task DeletePictureAsync(int pictureId)
    {
        await _pictureRepository.DeleteAsync(pictureId);
    }

    public async Task UpdatePictureOrderAsync(int pictureId, int newOrder)
    {
        var picture = await _pictureRepository.GetByIdAsync(pictureId);
        if (picture == null) return;

        var offerId = picture.OfferId;
        var allPictures = await _pictureRepository.GetByOfferIdAsync(offerId);
        var sortedPictures = allPictures.OrderBy(p => p.DisplayOrder).ToList();

        // Find current and target positions
        var currentIndex = sortedPictures.FindIndex(p => p.Id == pictureId);
        var targetIndex = newOrder - 1; // Convert to 0-based index

        if (currentIndex == -1 || targetIndex < 0 || targetIndex >= sortedPictures.Count || currentIndex == targetIndex)
            return;

        // Create temporary negative display orders to avoid constraint conflicts
        // Step 1: Set all pictures to negative temporary values
        for (int i = 0; i < sortedPictures.Count; i++)
        {
            sortedPictures[i].DisplayOrder = -(i + 1000); // Use negative values starting from -1000
            await _pictureRepository.UpdateAsync(sortedPictures[i]);
        }

        // Step 2: Reorder the list
        var pictureToMove = sortedPictures[currentIndex];
        sortedPictures.RemoveAt(currentIndex);
        sortedPictures.Insert(targetIndex, pictureToMove);

        // Step 3: Set final positive display orders
        for (int i = 0; i < sortedPictures.Count; i++)
        {
            sortedPictures[i].DisplayOrder = i + 1;
            await _pictureRepository.UpdateAsync(sortedPictures[i]);
        }
    }
}