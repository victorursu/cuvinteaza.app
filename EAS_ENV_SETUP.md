# EAS Environment Variables Setup

## Using EAS Environment Variables (Recommended)

EAS Environment Variables are the recommended way to handle environment variables for EAS builds.

### Set environment variables for your project:

```bash
# Set Supabase URL
eas env:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co"

# Set Supabase Anon Key
eas env:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key-here"

# Set other environment variables
eas env:create --scope project --name EXPO_PUBLIC_VOCABULARY_URL --value "https://your-domain.com/vocabulary.ro.json"
eas env:create --scope project --name EXPO_PUBLIC_TEST_URL --value "https://your-domain.com/test.ro.json"
eas env:create --scope project --name EXPO_PUBLIC_REGIONALISME_URL --value "https://your-domain.com/regionalisme.ro.json"
eas env:create --scope project --name EXPO_PUBLIC_URBANISME_URL --value "https://your-domain.com/urbanisme.ro.json"
```

### View your environment variables:
```bash
eas env:list
```

### Update an existing variable:
```bash
eas env:update --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "new-value"
```

### Delete a variable:
```bash
eas env:delete --scope project --name EXPO_PUBLIC_SUPABASE_URL
```

## How it works

- **Local development**: Uses your `.env` file (already working)
- **EAS builds**: Uses EAS Environment Variables (set via CLI commands above)
- The `EXPO_PUBLIC_*` prefix makes these variables available in your app code

After setting the environment variables, run `eas build --platform android --profile preview` and the variables will be automatically included in the build.

## Notes

- Environment variables set with `--scope project` are available to all builds for this project
- You can also set variables per build profile (development, preview, production) if needed
- The `.env` file is for local development only and is not used during EAS builds

