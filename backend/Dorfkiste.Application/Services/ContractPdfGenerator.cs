using Dorfkiste.Core.Entities;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Dorfkiste.Application.Services;

public class ContractPdfGenerator
{
    public byte[] GeneratePdf(RentalContract contract)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(11).FontFamily("Arial"));

                page.Header().Element(ComposeHeader);
                page.Content().Element(c => ComposeContent(c, contract));
                page.Footer().Element(ComposeFooter);
            });
        });

        return document.GeneratePdf();
    }

    private void ComposeHeader(IContainer container)
    {
        container.Column(column =>
        {
            column.Item().AlignCenter().Text("MIETVERTRAG").FontSize(20).Bold();
            column.Item().AlignCenter().Text("Dorfkiste Nachbarschaftsmarktplatz").FontSize(12);
            column.Item().PaddingTop(10).LineHorizontal(1);
        });
    }

    private void ComposeContent(IContainer container, RentalContract contract)
    {
        container.PaddingVertical(20).Column(column =>
        {
            column.Spacing(10);

            // Contract number and date
            column.Item().Row(row =>
            {
                row.RelativeItem().Text($"Vertragsnummer: {contract.Id}").Bold();
                row.RelativeItem().AlignRight().Text($"Datum: {contract.CreatedAt:dd.MM.yyyy}");
            });

            column.Item().PaddingTop(10).Text("VERTRAGSPARTEIEN").FontSize(14).Bold();

            // Lessor (Vermieter)
            column.Item().Background(Colors.Grey.Lighten4).Padding(10).Column(col =>
            {
                col.Item().Text("Vermieter (Lessor)").Bold();
                col.Item().Text($"{contract.Lessor.FirstName} {contract.Lessor.LastName}");
                col.Item().Text($"E-Mail: {contract.Lessor.Email}");
                if (!string.IsNullOrEmpty(contract.Lessor.ContactInfo.PhoneNumber))
                {
                    col.Item().Text($"Telefon: {contract.Lessor.ContactInfo.PhoneNumber}");
                }
                if (!string.IsNullOrEmpty(contract.Lessor.ContactInfo.Street))
                {
                    col.Item().Text($"Adresse: {contract.Lessor.ContactInfo.Street}, {contract.Lessor.ContactInfo.PostalCode} {contract.Lessor.ContactInfo.City}");
                }
            });

            // Lessee (Mieter)
            column.Item().Background(Colors.Grey.Lighten4).Padding(10).Column(col =>
            {
                col.Item().Text("Mieter (Lessee)").Bold();
                col.Item().Text($"{contract.Lessee.FirstName} {contract.Lessee.LastName}");
                col.Item().Text($"E-Mail: {contract.Lessee.Email}");
                if (!string.IsNullOrEmpty(contract.Lessee.ContactInfo.PhoneNumber))
                {
                    col.Item().Text($"Telefon: {contract.Lessee.ContactInfo.PhoneNumber}");
                }
                if (!string.IsNullOrEmpty(contract.Lessee.ContactInfo.Street))
                {
                    col.Item().Text($"Adresse: {contract.Lessee.ContactInfo.Street}, {contract.Lessee.ContactInfo.PostalCode} {contract.Lessee.ContactInfo.City}");
                }
            });

            column.Item().PaddingTop(10).Text("MIETGEGENSTAND").FontSize(14).Bold();
            column.Item().Background(Colors.Grey.Lighten4).Padding(10).Column(col =>
            {
                col.Item().Text($"Titel: {contract.OfferTitle}").Bold();
                col.Item().Text($"Typ: {(contract.OfferType == "Item" ? "Gegenstand" : "Dienstleistung")}");
                col.Item().Text($"Beschreibung: {contract.OfferDescription}");
            });

            column.Item().PaddingTop(10).Text("MIETDETAILS").FontSize(14).Bold();
            column.Item().Background(Colors.Grey.Lighten4).Padding(10).Column(col =>
            {
                col.Item().Text($"Mietbeginn: {contract.RentalStartDate:dd.MM.yyyy}");
                col.Item().Text($"Mietende: {contract.RentalEndDate:dd.MM.yyyy}");
                col.Item().Text($"Mietdauer: {contract.RentalDays} Tage");
                col.Item().PaddingTop(5).LineHorizontal(0.5f);
                col.Item().Text($"Preis pro Tag: {contract.PricePerDay:C}");
                col.Item().Text($"Gesamtpreis: {contract.TotalPrice:C}").Bold().FontSize(12);
                col.Item().Text($"Kaution: {contract.DepositAmount:C}").Bold();
            });

            column.Item().PaddingTop(10).Text("VERTRAGSBEDINGUNGEN").FontSize(14).Bold();
            column.Item().Text(contract.TermsAndConditions).FontSize(9).LineHeight(1.5f);

            if (!string.IsNullOrEmpty(contract.SpecialConditions))
            {
                column.Item().PaddingTop(10).Text("BESONDERE VEREINBARUNGEN").FontSize(12).Bold();
                column.Item().Text(contract.SpecialConditions).FontSize(10);
            }

            // Signatures
            column.Item().PaddingTop(20).Text("UNTERSCHRIFTEN").FontSize(14).Bold();
            column.Item().Row(row =>
            {
                // Lessor signature
                row.RelativeItem().Column(col =>
                {
                    col.Item().Text("Vermieter").Bold();
                    if (contract.SignedByLessorAt.HasValue)
                    {
                        col.Item().PaddingTop(5).Text($"Unterschrieben am: {contract.SignedByLessorAt.Value:dd.MM.yyyy HH:mm} Uhr");
                        col.Item().PaddingTop(5).Text("✓ Digital signiert").FontColor(Colors.Green.Medium);
                    }
                    else
                    {
                        col.Item().PaddingTop(5).Text("___________________________");
                        col.Item().Text("(Noch nicht unterschrieben)").FontSize(9).Italic();
                    }
                });

                // Lessee signature
                row.RelativeItem().Column(col =>
                {
                    col.Item().Text("Mieter").Bold();
                    if (contract.SignedByLesseeAt.HasValue)
                    {
                        col.Item().PaddingTop(5).Text($"Unterschrieben am: {contract.SignedByLesseeAt.Value:dd.MM.yyyy HH:mm} Uhr");
                        col.Item().PaddingTop(5).Text("✓ Digital signiert").FontColor(Colors.Green.Medium);
                    }
                    else
                    {
                        col.Item().PaddingTop(5).Text("___________________________");
                        col.Item().Text("(Noch nicht unterschrieben)").FontSize(9).Italic();
                    }
                });
            });

            // Contract status
            column.Item().PaddingTop(10).Background(GetStatusColor(contract.Status)).Padding(5).AlignCenter()
                .Text($"Vertragsstatus: {GetStatusText(contract.Status)}").Bold().FontColor(Colors.White);
        });
    }

    private void ComposeFooter(IContainer container)
    {
        container.Column(column =>
        {
            column.Item().LineHorizontal(1);
            column.Item().PaddingTop(5).AlignCenter().Text(text =>
            {
                text.Span("Erstellt über Dorfkiste - Ihr lokaler Nachbarschaftsmarktplatz").FontSize(9);
            });
            column.Item().AlignCenter().Text(text =>
            {
                text.Span("Seite ").FontSize(9);
                text.CurrentPageNumber().FontSize(9);
                text.Span(" von ").FontSize(9);
                text.TotalPages().FontSize(9);
            });
        });
    }

    private string GetStatusColor(ContractStatus status)
    {
        return status switch
        {
            ContractStatus.Draft => Colors.Grey.Medium,
            ContractStatus.SignedByLessor => Colors.Blue.Medium,
            ContractStatus.SignedByBoth => Colors.Green.Medium,
            ContractStatus.Active => Colors.Green.Darken2,
            ContractStatus.Completed => Colors.Teal.Medium,
            ContractStatus.Cancelled => Colors.Red.Medium,
            _ => Colors.Grey.Medium
        };
    }

    private string GetStatusText(ContractStatus status)
    {
        return status switch
        {
            ContractStatus.Draft => "Entwurf",
            ContractStatus.SignedByLessor => "Vom Vermieter unterschrieben",
            ContractStatus.SignedByBoth => "Von beiden Parteien unterschrieben",
            ContractStatus.Active => "Aktiv",
            ContractStatus.Completed => "Abgeschlossen",
            ContractStatus.Cancelled => "Storniert",
            _ => "Unbekannt"
        };
    }
}
