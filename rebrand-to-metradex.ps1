# Metradex Rebranding Script
# This script will replace all "Metachrome" references with "Metradex"

Write-Host "🚀 Starting Metradex Rebranding Process..." -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from the Metradex project root directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "📁 Current directory: $PWD" -ForegroundColor Cyan
Write-Host ""

# Confirm before proceeding
$confirm = Read-Host "⚠️  This will replace all 'Metachrome' with 'Metradex'. Continue? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "❌ Rebranding cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🔄 Starting find & replace..." -ForegroundColor Green

# Define file extensions to search
$extensions = @("*.js", "*.jsx", "*.ts", "*.tsx", "*.json", "*.html", "*.md", "*.css", "*.env.example")

# Define directories to exclude
$excludeDirs = @("node_modules", ".git", "dist", "build", ".next")

# Counter for replacements
$filesChanged = 0
$totalReplacements = 0

# Function to replace text in file
function Replace-InFile {
    param (
        [string]$FilePath,
        [string]$OldText,
        [string]$NewText
    )
    
    try {
        $content = Get-Content $FilePath -Raw -ErrorAction Stop
        $newContent = $content -replace $OldText, $NewText
        
        if ($content -ne $newContent) {
            Set-Content $FilePath -Value $newContent -NoNewline
            
            # Count replacements
            $matches = ([regex]::Matches($content, $OldText)).Count
            
            return $matches
        }
    }
    catch {
        Write-Host "  ⚠️  Error processing $FilePath : $_" -ForegroundColor Yellow
    }
    
    return 0
}

# Get all files to process
Write-Host "📂 Scanning files..." -ForegroundColor Cyan

$files = Get-ChildItem -Path . -Recurse -Include $extensions | 
    Where-Object { 
        $file = $_
        $exclude = $false
        foreach ($dir in $excludeDirs) {
            if ($file.FullName -like "*\$dir\*") {
                $exclude = $true
                break
            }
        }
        -not $exclude
    }

Write-Host "Found $($files.Count) files to process" -ForegroundColor Cyan
Write-Host ""

# Replacements to make (case-sensitive and case-insensitive)
$replacements = @(
    @{ Old = "Metachrome"; New = "Metradex" },
    @{ Old = "metachrome"; New = "metradex" },
    @{ Old = "METACHROME"; New = "METRADEX" },
    @{ Old = "MetaChrome"; New = "MetraDex" }
)

# Process each file
foreach ($file in $files) {
    $fileChanged = $false
    $fileReplacements = 0
    
    foreach ($replacement in $replacements) {
        $count = Replace-InFile -FilePath $file.FullName -OldText $replacement.Old -NewText $replacement.New
        
        if ($count -gt 0) {
            $fileChanged = $true
            $fileReplacements += $count
        }
    }
    
    if ($fileChanged) {
        $filesChanged++
        $totalReplacements += $fileReplacements
        Write-Host "  ✅ $($file.Name) - $fileReplacements replacements" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "✨ Rebranding Complete!" -ForegroundColor Green
Write-Host "   Files changed: $filesChanged" -ForegroundColor Cyan
Write-Host "   Total replacements: $totalReplacements" -ForegroundColor Cyan
Write-Host ""

# Additional manual steps reminder
Write-Host "📋 Manual Steps Required:" -ForegroundColor Yellow
Write-Host "   1. Replace logo files in client/public/" -ForegroundColor White
Write-Host "   2. Replace favicon.ico" -ForegroundColor White
Write-Host "   3. Update .env with new Supabase credentials" -ForegroundColor White
Write-Host "   4. Create new GitHub repository for Metradex" -ForegroundColor White
Write-Host "   5. Create new Railway project" -ForegroundColor White
Write-Host "   6. Create new Supabase project" -ForegroundColor White
Write-Host ""

Write-Host "📖 See METRADEX-SETUP-GUIDE.md for detailed instructions" -ForegroundColor Cyan
Write-Host ""

# Ask if user wants to initialize git
$initGit = Read-Host "Initialize new Git repository? (y/n)"
if ($initGit -eq 'y') {
    Write-Host ""
    Write-Host "🔧 Initializing Git repository..." -ForegroundColor Green
    
    # Remove existing .git if exists
    if (Test-Path ".git") {
        Remove-Item -Path ".git" -Recurse -Force
        Write-Host "   Removed old .git directory" -ForegroundColor Yellow
    }
    
    # Initialize new repo
    git init
    
    # Create .gitignore if not exists
    if (-not (Test-Path ".gitignore")) {
        @"
node_modules/
dist/
build/
.next/
.env
.env.local
*.log
.DS_Store
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8
        Write-Host "   Created .gitignore" -ForegroundColor Green
    }
    
    # Initial commit
    git add .
    git commit -m "Initial commit - Metradex (rebranded from Metachrome)"
    
    Write-Host "   ✅ Git repository initialized" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Create new GitHub repo: https://github.com/new" -ForegroundColor White
    Write-Host "   2. Run: git remote add origin https://github.com/YOUR_USERNAME/Metradex.git" -ForegroundColor White
    Write-Host "   3. Run: git push -u origin main" -ForegroundColor White
}

Write-Host ""
Write-Host "🎉 Done! Your Metradex project is ready!" -ForegroundColor Green
Write-Host ""

