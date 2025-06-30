jQuery(document).ready(function($) {
    let currentAudioUrl = null;
    
    // Convert button click handler
    $('#knc-convert-btn').on('click', function() {
        const name = $('#knc-name').val().trim();
        const sourceLanguage = $('#knc-language').val();
        
        if (!name) {
            showError('Please enter a name');
            return;
        }
        
        convertName(name, sourceLanguage);
    });
    
    // Enter key handler for name input
    $('#knc-name').on('keypress', function(e) {
        if (e.which === 13) {
            $('#knc-convert-btn').click();
        }
    });
    
    // Play audio button handler
    $('#knc-play-audio').on('click', function() {
        const koreanName = $('.knc-korean-name').text();
        if (koreanName && !currentAudioUrl) {
            generateAudio(koreanName);
        } else if (currentAudioUrl) {
            playAudio();
        }
    });
    
    // Try another button handler
    $('#knc-try-another').on('click', function() {
        resetForm();
    });
    
    function convertName(name, sourceLanguage) {
        showLoading();
        hideError();
        hideResults();
        
        $.ajax({
            url: knc_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'convert_name',
                name: name,
                sourceLanguage: sourceLanguage,
                nonce: knc_ajax.nonce
            },
            success: function(response) {
                hideLoading();
                
                if (response.success) {
                    displayResults(response.data);
                } else {
                    showError(response.data || 'Conversion failed');
                }
            },
            error: function() {
                hideLoading();
                showError('Network error. Please try again.');
            }
        });
    }
    
    function generateAudio(text) {
        $('#knc-play-audio').prop('disabled', true).text('🔄 Generating Audio...');
        
        $.ajax({
            url: knc_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'generate_tts',
                text: text,
                nonce: knc_ajax.nonce
            },
            success: function(response) {
                $('#knc-play-audio').prop('disabled', false).text('🔊 Play Pronunciation');
                
                if (response.success && response.data.audioUrl) {
                    currentAudioUrl = response.data.audioUrl;
                    playAudio();
                } else {
                    // Fallback to Web Speech API
                    tryWebSpeechAPI(text);
                }
            },
            error: function() {
                $('#knc-play-audio').prop('disabled', false).text('🔊 Play Pronunciation');
                // Fallback to Web Speech API
                tryWebSpeechAPI(text);
            }
        });
    }
    
    function tryWebSpeechAPI(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ko-KR';
            utterance.rate = 0.8;
            utterance.pitch = 1.0;
            speechSynthesis.speak(utterance);
        } else {
            showError('Audio playback not supported in this browser');
        }
    }
    
    function playAudio() {
        if (currentAudioUrl) {
            const audio = $('#knc-audio-player')[0];
            audio.src = currentAudioUrl;
            audio.play().catch(function() {
                showError('Failed to play audio');
            });
        }
    }
    
    function displayResults(data) {
        $('.knc-korean-name').text(data.koreanName);
        $('.knc-romanization').text(data.romanization);
        
        // Clear previous breakdown
        $('#knc-breakdown-list').empty();
        
        // Add breakdown items
        if (data.breakdown && data.breakdown.length > 0) {
            data.breakdown.forEach(function(item) {
                const breakdownItem = $('<div class="knc-breakdown-item">');
                breakdownItem.append('<span class="knc-breakdown-hangul">' + item.hangul + '</span>');
                breakdownItem.append('<span class="knc-breakdown-roman">' + item.romanization + '</span>');
                breakdownItem.append('<span class="knc-breakdown-type">' + item.type + '</span>');
                $('#knc-breakdown-list').append(breakdownItem);
            });
        }
        
        // Reset audio
        currentAudioUrl = null;
        $('#knc-play-audio').text('🔊 Play Pronunciation');
        
        showResults();
    }
    
    function showLoading() {
        $('#knc-loading').show();
    }
    
    function hideLoading() {
        $('#knc-loading').hide();
    }
    
    function showResults() {
        $('#knc-results').show();
    }
    
    function hideResults() {
        $('#knc-results').hide();
    }
    
    function showError(message) {
        $('#knc-error p').text(message);
        $('#knc-error').show();
    }
    
    function hideError() {
        $('#knc-error').hide();
    }
    
    function resetForm() {
        $('#knc-name').val('');
        $('#knc-language').val('en');
        hideResults();
        hideError();
        hideLoading();
        currentAudioUrl = null;
    }
});