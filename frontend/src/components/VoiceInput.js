// VoiceInput.js

import React, { useState } from 'react';

const VoiceInput = ({ onSpeechResult }) => {
  const [isListening, setIsListening] = useState(false);
  
  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';  // Set your desired language
      
      recognition.start();
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onSpeechResult(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      alert("Speech Recognition is not supported in this browser.");
    }
  };

  return (
    <div>
      <button onClick={handleVoiceInput}>
        {isListening ? 'Listening...' : 'Start Voice Input'}
      </button>
    </div>
  );
};

export default VoiceInput;
