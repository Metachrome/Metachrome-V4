# Railway Deployment - Rollup Module Fix

## Problem
Railway deployment was failing with the error:
```
Error: Cannot find module @rollup/rollup-linux-x64-gnu
```

This is a common issue with Rollup's optional dependencies not being installed correctly during the build process.

## Root Cause
The issue occurs because:
1. Railway's build process was using `--only=production` flag which skips devDependencies
2. Vite (our build tool) and its dependencies (including Rollup) are in devDependencies
3. Rollup's platform-specific binaries are optional dependencies that need special handling

## Solution Applied

### 1. Updated `nixpacks.toml`
Changed the Railway build configuration to:
- Install ALL dependencies (including dev dependencies) during install phase
- Run `npm rebuild` to ensure optional dependencies are properly compiled
- Explicitly run the build step before starting the server

**Before:**
```toml
[phases.install]
cmds = ["npm install --only=production --legacy-peer-deps"]

[start]
cmd = "node working-server.js"

[variables]
NODE_ENV = "production"
```

**After:**
```toml
[phases.setup]
nixPkgs = ["nodejs-20_x", "npm-9_x"]

[phases.install]
cmds = [
  "npm ci --include=dev",
  "npm rebuild"
]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "node working-server.js"

[variables]
NODE_ENV = "production"
NPM_CONFIG_PRODUCTION = "false"
```

### 2. Updated `.npmrc`
Added `optional=true` to ensure optional dependencies (like Rollup's platform-specific binaries) are installed:

```
optional=true
```

## How It Works

1. **Setup Phase**: Ensures Node.js 20.x and npm 9.x are available
2. **Install Phase**: 
   - `npm ci --include=dev` - Clean install with dev dependencies
   - `npm rebuild` - Rebuilds native modules and optional dependencies
3. **Build Phase**: Runs `npm run build` which executes `vite build`
4. **Start Phase**: Runs the production server with `node working-server.js`

## Environment Variables
The `NPM_CONFIG_PRODUCTION=false` ensures that even though `NODE_ENV=production`, npm will still install devDependencies during the build phase.

## Deployment Steps

1. **Commit the changes:**
   ```bash
   git add nixpacks.toml .npmrc
   git commit -m "Fix Railway deployment - Rollup module issue"
   git push
   ```

2. **Railway will automatically:**
   - Detect the `nixpacks.toml` configuration
   - Install all dependencies including dev dependencies
   - Rebuild native modules
   - Run the Vite build process
   - Start the production server

3. **Verify deployment:**
   - Check Railway logs for successful build
   - Ensure the app starts without errors
   - Test the application functionality

## Alternative Solutions (if the above doesn't work)

### Option 1: Add Rollup as a direct dependency
If the issue persists, you can add Rollup as a direct production dependency:

```bash
npm install --save rollup
```

### Option 2: Use a custom build script
Create a `railway-build.sh` script:

```bash
#!/bin/bash
npm ci --include=dev
npm rebuild
npm run build
```

Then update `nixpacks.toml`:
```toml
[phases.build]
cmds = ["bash railway-build.sh"]
```

### Option 3: Specify Rollup version explicitly
In `package.json`, add Rollup to dependencies:

```json
"dependencies": {
  ...
  "rollup": "^4.9.0"
}
```

## Testing Locally

To test if the build works with the new configuration:

```bash
# Clean install
rm -rf node_modules package-lock.json
npm ci --include=dev

# Rebuild native modules
npm rebuild

# Run build
npm run build

# Start server
npm start
```

## Expected Build Output

You should see:
```
✓ Building client...
✓ Built in XXXms
✓ Static files copied to dist/public
✓ Server starting on port 3005
```

## Troubleshooting

If you still encounter issues:

1. **Check Node version**: Ensure Railway is using Node.js 20.x
2. **Clear Railway cache**: In Railway dashboard, go to Settings → Clear Build Cache
3. **Check logs**: Review Railway build logs for specific error messages
4. **Verify package.json**: Ensure all required dependencies are listed

## Files Modified

- ✅ `nixpacks.toml` - Updated build configuration
- ✅ `.npmrc` - Added optional dependencies flag
- ✅ `package.json` - No changes needed (already correct)

## Status

🟢 **READY FOR DEPLOYMENT**

The configuration is now optimized for Railway deployment and should successfully build the application without Rollup module errors.

