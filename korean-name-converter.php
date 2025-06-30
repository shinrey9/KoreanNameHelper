<?php
/**
 * Plugin Name: Korean Name Converter
 * Plugin URI: https://your-website.com/korean-name-converter
 * Description: Convert names from various languages to Korean Hangul with accurate pronunciation guides and audio playback.
 * Version: 1.0.0
 * Author: Your Name
 * License: GPL v2 or later
 * Text Domain: korean-name-converter
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('KNC_PLUGIN_URL', plugin_dir_url(__FILE__));
define('KNC_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('KNC_VERSION', '1.0.0');

class KoreanNameConverter {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('wp_ajax_convert_name', array($this, 'handle_convert_name'));
        add_action('wp_ajax_nopriv_convert_name', array($this, 'handle_convert_name'));
        add_action('wp_ajax_generate_tts', array($this, 'handle_generate_tts'));
        add_action('wp_ajax_nopriv_generate_tts', array($this, 'handle_generate_tts'));
        add_shortcode('korean_name_converter', array($this, 'render_shortcode'));
        
        // Admin menu
        add_action('admin_menu', array($this, 'admin_menu'));
        add_action('admin_init', array($this, 'admin_init'));
    }
    
    public function init() {
        // Plugin initialization
    }
    
    public function enqueue_scripts() {
        wp_enqueue_script('korean-name-converter-js', KNC_PLUGIN_URL . 'assets/korean-name-converter.js', array('jquery'), KNC_VERSION, true);
        wp_enqueue_style('korean-name-converter-css', KNC_PLUGIN_URL . 'assets/korean-name-converter.css', array(), KNC_VERSION);
        
        wp_localize_script('korean-name-converter-js', 'knc_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('knc_nonce')
        ));
    }
    
    public function render_shortcode($atts) {
        $atts = shortcode_atts(array(
            'width' => '100%',
            'theme' => 'light'
        ), $atts);
        
        ob_start();
        ?>
        <div id="korean-name-converter" class="knc-container" style="width: <?php echo esc_attr($atts['width']); ?>;">
            <div class="knc-header">
                <h2>Korean Name Converter</h2>
                <p>Enter your name and see how it's written and pronounced in Korean!</p>
            </div>
            
            <div class="knc-form">
                <div class="knc-row">
                    <div class="knc-field">
                        <label for="knc-language">Source Language:</label>
                        <select id="knc-language" name="sourceLanguage">
                            <option value="en">🇺🇸 English</option>
                            <option value="es">🇪🇸 Spanish</option>
                            <option value="fr">🇫🇷 French</option>
                            <option value="de">🇩🇪 German</option>
                            <option value="it">🇮🇹 Italian</option>
                            <option value="pt">🇵🇹 Portuguese</option>
                            <option value="ru">🇷🇺 Russian</option>
                            <option value="ja">🇯🇵 Japanese</option>
                            <option value="zh">🇨🇳 Chinese (Simplified)</option>
                            <option value="zh-cn">🇨🇳 Chinese (Mainland)</option>
                            <option value="zh-tw">🇹🇼 Chinese (Traditional)</option>
                            <option value="ar">🇸🇦 Arabic</option>
                            <option value="hi">🇮🇳 Hindi</option>
                            <option value="th">🇹🇭 Thai</option>
                            <option value="vi">🇻🇳 Vietnamese</option>
                        </select>
                    </div>
                    <div class="knc-field">
                        <label for="knc-name">Your Name:</label>
                        <input type="text" id="knc-name" name="name" placeholder="Enter your name here..." />
                    </div>
                </div>
                
                <button id="knc-convert-btn" class="knc-btn knc-btn-primary">Convert to Korean</button>
            </div>
            
            <div id="knc-loading" class="knc-loading" style="display: none;">
                <div class="knc-spinner"></div>
                <p>Converting your name...</p>
            </div>
            
            <div id="knc-results" class="knc-results" style="display: none;">
                <div class="knc-result-card">
                    <h3>Your Korean Name</h3>
                    <div class="knc-korean-name"></div>
                    <div class="knc-romanization"></div>
                    
                    <div class="knc-audio-controls">
                        <button id="knc-play-audio" class="knc-btn knc-btn-secondary">🔊 Play Pronunciation</button>
                        <audio id="knc-audio-player" style="display: none;"></audio>
                    </div>
                    
                    <div class="knc-breakdown">
                        <h4>Character Breakdown</h4>
                        <div id="knc-breakdown-list"></div>
                    </div>
                    
                    <button id="knc-try-another" class="knc-btn knc-btn-outline">Try Another Name</button>
                </div>
            </div>
            
            <div id="knc-error" class="knc-error" style="display: none;">
                <p></p>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    public function handle_convert_name() {
        check_ajax_referer('knc_nonce', 'nonce');
        
        $name = sanitize_text_field($_POST['name']);
        $source_language = sanitize_text_field($_POST['sourceLanguage']);
        
        if (empty($name) || empty($source_language)) {
            wp_send_json_error('Name and source language are required');
        }
        
        $api_key = get_option('knc_openai_api_key');
        if (empty($api_key)) {
            wp_send_json_error('OpenAI API key not configured. Please contact the site administrator.');
        }
        
        $result = $this->convert_to_korean($name, $source_language, $api_key);
        
        if ($result) {
            wp_send_json_success($result);
        } else {
            wp_send_json_error('Conversion failed. Please try again.');
        }
    }
    
    public function handle_generate_tts() {
        check_ajax_referer('knc_nonce', 'nonce');
        
        $text = sanitize_text_field($_POST['text']);
        
        if (empty($text)) {
            wp_send_json_error('Text is required');
        }
        
        $api_key = get_option('knc_openai_api_key');
        if (empty($api_key)) {
            wp_send_json_error('OpenAI API key not configured');
        }
        
        $result = $this->generate_korean_audio($text, $api_key);
        
        if ($result) {
            wp_send_json_success($result);
        } else {
            wp_send_json_error('Audio generation failed');
        }
    }
    
    private function convert_to_korean($name, $source_language, $api_key) {
        $language_names = array(
            'en' => 'English',
            'es' => 'Spanish',
            'fr' => 'French',
            'de' => 'German',
            'it' => 'Italian',
            'pt' => 'Portuguese',
            'ru' => 'Russian',
            'ja' => 'Japanese',
            'zh' => 'Chinese (Simplified)',
            'zh-cn' => 'Chinese (Mainland)',
            'zh-tw' => 'Chinese (Traditional)',
            'ko' => 'Korean',
            'ar' => 'Arabic',
            'hi' => 'Hindi',
            'th' => 'Thai',
            'vi' => 'Vietnamese'
        );
        
        $source_lang_name = isset($language_names[$source_language]) ? $language_names[$source_language] : $source_language;
        
        $prompt = "Convert the {$source_lang_name} name \"{$name}\" to Korean Hangul with accurate pronunciation.

Instructions:
1. Consider the phonetics and pronunciation of the original name in {$source_lang_name}
2. Use proper Korean syllable structure (consonant-vowel-consonant pattern)
3. Follow Korean transliteration conventions for foreign names
4. For family names, use common Korean surname equivalents when appropriate
5. Ensure the Korean version sounds natural when pronounced by Korean speakers";

        // Add special instructions for Chinese characters
        if (in_array($source_language, ['zh', 'zh-cn', 'zh-tw'])) {
            $prompt .= "

SPECIAL INSTRUCTION FOR CHINESE CHARACTERS: This is a Chinese character name. Use the original Chinese pronunciation to create the Korean transliteration. Base the Korean conversion on how the Chinese name actually sounds in Chinese (Mandarin/Cantonese), not the Korean reading of the characters. For example:
- 李明 should be based on \"Lǐ Míng\" pronunciation, not Korean readings
- 王小美 should be based on \"Wáng Xiǎo Měi\" pronunciation";
        }

        $prompt .= "

Provide your response in JSON format with these exact fields:
{
  \"korean_name\": \"Korean Hangul characters\",
  \"romanization\": \"Romanized pronunciation using Revised Romanization of Korean\",
  \"breakdown\": [
    {
      \"hangul\": \"Korean syllable\",
      \"romanization\": \"romanized pronunciation\", 
      \"type\": \"family or given or syllable\"
    }
  ]
}

Examples for context:
- \"John\" → \"존\" (jon)
- \"Smith\" → \"스미스\" (seu-mi-seu) 
- \"María\" → \"마리아\" (ma-ri-a)
- \"François\" → \"프랑수아\" (peu-rang-su-a)

Make sure each syllable in the breakdown corresponds to meaningful parts of the original name.

IMPORTANT: For the romanization field, separate each Korean syllable with spaces or hyphens for clear pronunciation. For example:
- 존스미스 should be romanized as \"jon-seu-mi-seu\" or \"jon seu mi seu\"
- 마리아 should be romanized as \"ma-ri-a\" or \"ma ri a\"";
        
        $response = wp_remote_post('https://api.openai.com/v1/chat/completions', array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type' => 'application/json'
            ),
            'body' => json_encode(array(
                'model' => 'gpt-4o',
                'messages' => array(
                    array(
                        'role' => 'system',
                        'content' => 'You are an expert in Korean transliteration and linguistics. Provide accurate Korean conversions for foreign names.'
                    ),
                    array(
                        'role' => 'user',
                        'content' => $prompt
                    )
                ),
                'response_format' => array('type' => 'json_object'),
                'temperature' => 0.3
            )),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            return false;
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (!isset($data['choices'][0]['message']['content'])) {
            return false;
        }
        
        $result = json_decode($data['choices'][0]['message']['content'], true);
        
        return array(
            'id' => time(),
            'originalName' => $name,
            'sourceLanguage' => $source_language,
            'koreanName' => $result['korean_name'],
            'romanization' => $result['romanization'],
            'breakdown' => $result['breakdown']
        );
    }
    
    private function generate_korean_audio($text, $api_key) {
        $response = wp_remote_post('https://api.openai.com/v1/audio/speech', array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type' => 'application/json'
            ),
            'body' => json_encode(array(
                'model' => 'tts-1',
                'input' => $text,
                'voice' => 'nova',
                'response_format' => 'mp3'
            )),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            return false;
        }
        
        $audio_data = wp_remote_retrieve_body($response);
        $base64_audio = base64_encode($audio_data);
        
        return array(
            'audioUrl' => 'data:audio/mp3;base64,' . $base64_audio
        );
    }
    
    public function admin_menu() {
        add_options_page(
            'Korean Name Converter Settings',
            'Korean Name Converter',
            'manage_options',
            'korean-name-converter',
            array($this, 'admin_page')
        );
    }
    
    public function admin_init() {
        register_setting('knc_settings', 'knc_openai_api_key');
        
        add_settings_section(
            'knc_api_section',
            'API Settings',
            array($this, 'api_section_callback'),
            'korean-name-converter'
        );
        
        add_settings_field(
            'knc_openai_api_key',
            'OpenAI API Key',
            array($this, 'api_key_field_callback'),
            'korean-name-converter',
            'knc_api_section'
        );
    }
    
    public function admin_page() {
        ?>
        <div class="wrap">
            <h1>Korean Name Converter Settings</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('knc_settings');
                do_settings_sections('korean-name-converter');
                submit_button();
                ?>
            </form>
            
            <div class="card">
                <h2>Usage</h2>
                <p>Use the shortcode <code>[korean_name_converter]</code> to display the converter on any post or page.</p>
                <p>Optional attributes:</p>
                <ul>
                    <li><code>width</code> - Set the width (default: 100%)</li>
                    <li><code>theme</code> - Set the theme (light or dark, default: light)</li>
                </ul>
                <p>Example: <code>[korean_name_converter width="800px" theme="light"]</code></p>
            </div>
        </div>
        <?php
    }
    
    public function api_section_callback() {
        echo '<p>Configure your API settings below:</p>';
    }
    
    public function api_key_field_callback() {
        $api_key = get_option('knc_openai_api_key');
        echo '<input type="password" name="knc_openai_api_key" value="' . esc_attr($api_key) . '" class="regular-text" />';
        echo '<p class="description">Enter your OpenAI API key. You can get one from <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI</a>.</p>';
    }
}

// Initialize the plugin
new KoreanNameConverter();