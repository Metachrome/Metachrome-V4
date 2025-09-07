# Set production environment variables
$env:PORT = "4000"
$env:NODE_ENV = "production"
$env:DATABASE_URL = "postgresql://postgres:HopeAmdHope87%5E%28@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres?sslmode=require"
$env:JWT_SECRET = "de1cc0aaa1cb3baecd3341ea9fcddb7dedfceb3506110bc1acf45ea7b92e18f9"
$env:SESSION_SECRET = "2aa802cbdb87915ad40707dbe92354740992db6e1b1969e59037d9d51d1f75a9"
$env:ALLOWED_ORIGINS = "http://127.0.0.1:4000,http://localhost:4000"
$env:VITE_SUPABASE_URL = "https://pybsyzbxyliufkgywtpf.supabase.co"
$env:VITE_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YnN5emJ4eWxpdWZrZ3l3dHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMjYzNDYsImV4cCI6MjA3MTgwMjM0Nn0.NYcOwg-jVmnImiAuAQ2vbEluQ-uT32Fkdbon1pIYAME"

Write-Host "Building client (production)..."
npm run build

Write-Host "Starting server (production) on port $env:PORT ..."
# Start the TypeScript server directly with tsx
npx tsx server/index.ts
