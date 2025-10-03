using Dorfkiste.Core.Entities;

namespace Dorfkiste.Core.Interfaces;

public interface IOfferService
{
    Task<IEnumerable<Offer>> GetAllOffersAsync();
    Task<IEnumerable<Offer>> GetOffersByCategoryAsync(int categoryId);
    Task<IEnumerable<Offer>> SearchOffersAsync(string searchTerm);
    Task<Offer?> GetOfferByIdAsync(int id);
    Task<Offer> CreateOfferAsync(Offer offer, int userId);
    Task<Offer> UpdateOfferAsync(Offer offer, int userId);
    Task DeleteOfferAsync(int id, int userId);
    Task<string?> GenerateDescriptionFromImageAsync(byte[] imageData);
    Task<AnalyzeImageResponse?> AnalyzeImageAndSuggestOfferDataAsync(byte[] imageData);
    
    Task<OfferPicture> AddPictureAsync(OfferPicture picture);
    Task<OfferPicture?> GetPictureAsync(int pictureId);
    Task<IEnumerable<OfferPicture>> GetOfferPicturesAsync(int offerId);
    Task DeletePictureAsync(int pictureId);
    Task UpdatePictureOrderAsync(int pictureId, int newOrder);
}

public class AnalyzeImageResponse
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsService { get; set; }
    public string SuggestedCategoryName { get; set; } = string.Empty;
    public int? SuggestedCategoryId { get; set; }
    public decimal? SuggestedPricePerDay { get; set; }
    public decimal? SuggestedPricePerHour { get; set; }
}