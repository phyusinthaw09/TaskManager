FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["TaskManangerWebAPI.csproj", "./"]
RUN dotnet restore "TaskManangerWebAPI.csproj"
COPY . .
RUN dotnet publish "TaskManangerWebAPI.csproj" -c Release -o /app/out

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "TaskManangerWebAPI.dll"]
