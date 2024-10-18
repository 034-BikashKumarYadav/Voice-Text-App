
$(document).ready(function() {
    const textInput = $('#text-input');
    const startRecognitionBtn = $('#start-recognition');
    const stopRecognitionBtn = $('#stop-recognition');
    const speakTextBtn = $('#speak-text');
    const status = $('#status');
    const languageSelect = $('#language-select');
    const voiceSelect = $('#voice-select');
    const pitchSlider = $('#pitch-slider');
    const rateSlider = $('#rate-slider');
    const pitchValue = $('#pitch-value');
    const rateValue = $('#rate-value');
    const toggleSettingsBtn = $('#toggle-settings');
    const settingsPanel = $('#settings-panel');
    const downloadSourceBtn = $('#download-source');

    let recognition;
    let synth;

    function initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onresult = function(event) {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        textInput.val(textInput.val() + event.results[i][0].transcript);
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                status.text(interimTranscript);
            };

            recognition.onerror = function(event) {
                status.text('Error occurred in recognition: ' + event.error);
            };
        } else {
            status.text('Web Speech API is not supported in this browser.');
        }
    }

    function initSpeechSynthesis() {
        if ('speechSynthesis' in window) {
            synth = window.speechSynthesis;
            populateVoiceList();
            synth.onvoiceschanged = populateVoiceList;
        } else {
            status.text('Text-to-Speech is not supported in this browser.');
        }
    }

    function populateVoiceList() {
        const voices = synth.getVoices();
        voiceSelect.empty();
        voices.forEach((voice, index) => {
            voiceSelect.append($('<option>', {
                value: index,
                text: `${voice.name} (${voice.lang})`
            }));
        });
    }

    startRecognitionBtn.on('click', function() {
        if (recognition) {
            recognition.lang = languageSelect.val();
            recognition.start();
            startRecognitionBtn.hide();
            stopRecognitionBtn.show();
            status.text('Listening...');
        } else {
            status.text('Speech recognition is not available.');
        }
    });

    stopRecognitionBtn.on('click', function() {
        if (recognition) {
            recognition.stop();
            stopRecognitionBtn.hide();
            startRecognitionBtn.show();
            status.text('Stopped listening.');
        }
    });

    speakTextBtn.on('click', function() {
        if (synth) {
            const text = textInput.val();
            if (text) {
                const utterance = new SpeechSynthesisUtterance(text);
                const voices = synth.getVoices();
                utterance.voice = voices[voiceSelect.val()];
                utterance.pitch = parseFloat(pitchSlider.val());
                utterance.rate = parseFloat(rateSlider.val());
                synth.speak(utterance);
                status.text('Speaking...');
                utterance.onend = function() {
                    status.text('Finished speaking.');
                };
            } else {
                status.text('Please enter some text to speak.');
            }
        } else {
            status.text('Text-to-Speech is not available.');
        }
    });

    languageSelect.on('change', function() {
        if (recognition) {
            recognition.lang = this.value;
        }
    });

    pitchSlider.on('input', function() {
        pitchValue.text(this.value);
    });

    rateSlider.on('input', function() {
        rateValue.text(this.value);
    });

    toggleSettingsBtn.on('click', function() {
        settingsPanel.toggle();
    });


    initSpeechRecognition();
    initSpeechSynthesis();
});
