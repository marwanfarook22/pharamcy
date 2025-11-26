FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["PharmacyInventoryAPI.csproj", "."]
RUN dotnet restore "PharmacyInventoryAPI.csproj"
COPY . .
RUN dotnet build "PharmacyInventoryAPI.csproj" -c Release -o /app/build

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/build .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "PharmacyInventoryAPI.dll"]