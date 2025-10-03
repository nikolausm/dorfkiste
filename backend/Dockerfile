# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["Dorfkiste.API/Dorfkiste.API.csproj", "Dorfkiste.API/"]
COPY ["Dorfkiste.Application/Dorfkiste.Application.csproj", "Dorfkiste.Application/"]
COPY ["Dorfkiste.Core/Dorfkiste.Core.csproj", "Dorfkiste.Core/"]
COPY ["Dorfkiste.Infrastructure/Dorfkiste.Infrastructure.csproj", "Dorfkiste.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "Dorfkiste.API/Dorfkiste.API.csproj"

# Copy everything else
COPY . .

# Build the application
WORKDIR "/src/Dorfkiste.API"
RUN dotnet build "Dorfkiste.API.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "Dorfkiste.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Copy published app
COPY --from=publish /app/publish .

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "Dorfkiste.API.dll"]
