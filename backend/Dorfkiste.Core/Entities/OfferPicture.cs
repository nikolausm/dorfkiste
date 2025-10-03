namespace Dorfkiste.Core.Entities;

public class OfferPicture
{
    public int Id { get; set; }
    public byte[] ImageData { get; set; } = null!;
    public string ContentType { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public int OfferId { get; set; }
    public Offer Offer { get; set; } = null!;
}