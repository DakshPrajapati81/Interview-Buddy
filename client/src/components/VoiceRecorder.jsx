import { useState, useEffect, useRef } from 'react';
import { FiMic, FiMicOff } from 'react-icons/fi';

const VoiceRecorder = ({ onTranscript, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if Web Speech API is available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          onTranscript?.(finalTranscript.trim(), false);
        } else if (interimTranscript) {
          onTranscript?.(interimTranscript, true);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setIsRecording(false);
        }
      };

      recognition.onend = () => {
        if (isRecording) {
          // Restart if still supposed to be recording
          try {
            recognition.start();
          } catch (e) {
            setIsRecording(false);
          }
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Update the onend handler when isRecording changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = () => {
        if (isRecording) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            setIsRecording(false);
          }
        }
      };
    }
  }, [isRecording]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error('Failed to start recording:', e);
      }
    }
  };

  const isSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  if (!isSupported) {
    return null;
  }

  return (
    <div className="voice-recorder">
      <button 
        className={`voice-btn ${isRecording ? 'recording' : ''}`}
        onClick={toggleRecording}
        disabled={disabled}
        title={isRecording ? 'Stop recording' : 'Start recording'}
        id="voice-recorder-btn"
      >
        {isRecording ? <FiMicOff /> : <FiMic />}
      </button>
      {isRecording && (
        <span className="voice-status recording">🔴 Recording...</span>
      )}
    </div>
  );
};

export default VoiceRecorder;
