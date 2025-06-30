# Korean Name Converter WordPress Plugin

Transform your WordPress site into a multilingual pronunciation tool! This plugin allows visitors to convert names from various languages to Korean Hangul with accurate pronunciation guides and AI-powered audio playback.

## Features

- **Multilingual Support**: Convert names from 15+ languages including English, Spanish, French, German, Chinese, Japanese, and more
- **AI-Powered Accuracy**: Uses OpenAI's GPT-4o for linguistically accurate Korean transliterations
- **Audio Pronunciation**: High-quality AI-generated Korean audio with Web Speech API fallback
- **Character Breakdown**: Detailed syllable-by-syllable pronunciation guides
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Easy Integration**: Simple shortcode implementation
- **Admin Panel**: Easy configuration through WordPress admin

## Installation

### Method 1: Manual Installation

1. Download all plugin files:
   - `korean-name-converter.php`
   - `assets/korean-name-converter.css`
   - `assets/korean-name-converter.js`

2. Create a folder named `korean-name-converter` in your WordPress plugins directory:
   ```
   /wp-content/plugins/korean-name-converter/
   ```

3. Upload all files maintaining the folder structure:
   ```
   korean-name-converter/
   ├── korean-name-converter.php
   └── assets/
       ├── korean-name-converter.css
       └── korean-name-converter.js
   ```

4. Go to WordPress Admin → Plugins → Installed Plugins
5. Find "Korean Name Converter" and click "Activate"

### Method 2: ZIP Upload

1. Create a ZIP file containing all plugin files
2. Go to WordPress Admin → Plugins → Add New → Upload Plugin
3. Upload the ZIP file and activate

## Configuration

### 1. Get OpenAI API Key

1. Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Sign up or log in to your OpenAI account
3. Create a new API key
4. Copy the key (starts with `sk-`)

### 2. Configure Plugin

1. Go to WordPress Admin → Settings → Korean Name Converter
2. Paste your OpenAI API key in the "OpenAI API Key" field
3. Click "Save Changes"

## Usage

### Basic Shortcode

Add the converter to any post or page using:

```
[korean_name_converter]
```

### Advanced Options

Customize the appearance with optional attributes:

```
[korean_name_converter width="600px" theme="light"]
```

**Available Attributes:**
- `width`: Set container width (default: "100%")
- `theme`: Set theme style (default: "light")

### Example Implementations

**In a Blog Post:**
```
Welcome to our Korean name converter! Enter your name below:

[korean_name_converter]

Try different languages to see how your name sounds in Korean!
```

**In a Dedicated Page:**
```
[korean_name_converter width="800px"]
```

**In a Widget Area:**
Use the shortcode widget or custom HTML widget with the shortcode.

## Supported Languages

- 🇺🇸 English
- 🇪🇸 Spanish  
- 🇫🇷 French
- 🇩🇪 German
- 🇮🇹 Italian
- 🇵🇹 Portuguese
- 🇷🇺 Russian
- 🇯🇵 Japanese
- 🇨🇳 Chinese (Simplified)
- 🇨🇳 Chinese (Mainland)
- 🇹🇼 Chinese (Traditional)
- 🇸🇦 Arabic
- 🇮🇳 Hindi
- 🇹🇭 Thai
- 🇻🇳 Vietnamese

## How It Works

1. **Name Input**: Users enter their name and select source language
2. **AI Processing**: OpenAI's GPT-4o analyzes pronunciation and converts to Korean
3. **Syllable Breakdown**: Displays Korean characters with romanized pronunciation
4. **Audio Generation**: Creates authentic Korean pronunciation using AI text-to-speech

## Customization

### Styling

The plugin includes comprehensive CSS that can be customized:

```css
/* Override plugin styles in your theme */
.knc-container {
    border-radius: 20px;
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.knc-korean-name {
    color: #your-brand-color;
}
```

### Language Support

To add more languages, modify the language array in `korean-name-converter.php`:

```php
$language_names = array(
    'your-lang-code' => 'Your Language Name',
    // ... existing languages
);
```

## Troubleshooting

### Common Issues

**"OpenAI API key not configured"**
- Ensure you've entered a valid API key in Settings → Korean Name Converter
- Check that your OpenAI account has available credits

**"Conversion failed"**
- Verify your OpenAI API key is active
- Check your internet connection
- Ensure the name contains valid characters

**Audio not playing**
- Check browser permissions for audio playback
- Ensure speakers/headphones are connected
- Try a different browser

### Performance Tips

- OpenAI API calls may take 1-3 seconds
- Consider caching results for frequently converted names
- Monitor API usage in your OpenAI dashboard

## API Usage & Costs

This plugin uses OpenAI's APIs:
- **GPT-4o**: For name transliteration (~$0.01-0.03 per conversion)
- **TTS-1**: For audio generation (~$0.015 per audio clip)

Typical monthly costs for a blog:
- Low traffic (100 conversions): ~$2-5
- Medium traffic (500 conversions): ~$8-15  
- High traffic (1000+ conversions): ~$15-30

## Support

For technical support or feature requests:
1. Check the troubleshooting section above
2. Verify your OpenAI API setup
3. Test with different browsers/devices
4. Contact your developer for custom modifications

## License

GPL v2 or later - same as WordPress

## Changelog

### 1.0.0
- Initial release
- Multilingual name conversion
- AI-powered pronunciation
- Audio generation
- Responsive design
- WordPress admin integration