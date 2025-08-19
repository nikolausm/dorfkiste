using DorfkisteBlazor.Domain.Common;

namespace DorfkisteBlazor.Domain.Entities;

/// <summary>
/// Category entity for organizing items
/// </summary>
public class Category : BaseEntity, IAuditableEntity
{
    public required string Name { get; set; }
    public required string Slug { get; set; }
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public string? IconUrl { get; set; }

    // Navigation properties
    public virtual ICollection<Item> Items { get; set; } = new List<Item>();
}