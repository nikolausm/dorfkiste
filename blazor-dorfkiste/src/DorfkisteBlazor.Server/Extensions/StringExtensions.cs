using System.Globalization;

namespace DorfkisteBlazor.Server.Extensions;

public static class StringExtensions
{
    public static string ToTitleCase(this string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        var textInfo = CultureInfo.CurrentCulture.TextInfo;
        return textInfo.ToTitleCase(input.ToLower());
    }

    public static string Truncate(this string input, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(input) || input.Length <= maxLength)
            return input;

        return input.Substring(0, maxLength) + "...";
    }

    public static string ToSlug(this string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        return input
            .ToLowerInvariant()
            .Replace(' ', '-')
            .Replace('ä', 'a')
            .Replace('ö', 'o')
            .Replace('ü', 'u')
            .Replace("ß", "ss");
    }
}