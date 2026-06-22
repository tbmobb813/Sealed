# Sealed local setup script
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

Write-Host "Installing dependencies..."
pnpm install

if (-not (Test-Path "apps\api\.env")) {
  Copy-Item ".env.example" "apps\api\.env"
  Write-Host "Created apps\api\.env"
}

if (-not (Test-Path "apps\web\.env")) {
  Copy-Item ".env.example" "apps\web\.env"
  Write-Host "Created apps\web\.env"
}

Write-Host "Starting Docker services..."
docker compose up -d

Write-Host "Generating Prisma client..."
pnpm --filter @sealed/api exec prisma generate

Write-Host "Applying migrations..."
pnpm --filter @sealed/api exec prisma migrate deploy

Write-Host "Seeding database..."
pnpm db:seed

Write-Host "Done! Run 'pnpm dev' to start."
