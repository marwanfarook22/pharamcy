# PowerShell script to create MySQL database
# Make sure XAMPP MySQL is running before executing this script

$mysqlPath = "C:\xampp\mysql\bin\mysql.exe"
$sqlCommands = @"
DROP DATABASE IF EXISTS smart_inventory_db;
CREATE DATABASE smart_inventory_db;
"@

# Check if MySQL exists
if (Test-Path $mysqlPath) {
    Write-Host "Creating database using MySQL from XAMPP..."
    $sqlCommands | & $mysqlPath -u root
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database created successfully!" -ForegroundColor Green
    } else {
        Write-Host "Error creating database. Make sure MySQL is running." -ForegroundColor Red
    }
} else {
    Write-Host "MySQL not found at: $mysqlPath" -ForegroundColor Yellow
    Write-Host "Please update the mysqlPath variable with your MySQL installation path." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternative: Use phpMyAdmin (http://localhost/phpmyadmin) and run:" -ForegroundColor Cyan
    Write-Host "  DROP DATABASE IF EXISTS smart_inventory_db;" -ForegroundColor Cyan
    Write-Host "  CREATE DATABASE smart_inventory_db;" -ForegroundColor Cyan
}

