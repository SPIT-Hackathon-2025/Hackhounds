import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Query = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      let isRecognizing = false;

      document.getElementById('startBtn').addEventListener('click', () => {
        if (!isRecognizing) {
          recognition.start();
          isRecognizing = true;
          setIsRecording(true);
        }
      });

      document.getElementById('stopBtn').addEventListener('click', () => {
        if (isRecognizing) {
          recognition.stop();
          isRecognizing = false;
          setIsRecording(false);
        }
      });

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Error occurred in speech recognition:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        isRecognizing = false;
        setIsRecording(false);
      };
    } else {
      console.log('Speech Recognition API not supported.');
    }
  }, []);

  const extractWorkflow = (query) => {
    const workflowData = { trigger: 'default_trigger', calendar: [], slack: [], mail: [] };

    if (/\b(receive a mail|new email)\b/i.test(query)) workflowData.trigger = 'email_receive';
    if (/\bevery friday\b/i.test(query)) {
      workflowData.trigger = 'every_friday';
      workflowData.calendar.push({
        eventName: 'Scheduled Event',
        bufferdate: new Date('2023-12-05'),
        buffertime: 9,
        description: 'Scheduled event every Friday with buffer time 9 AM and buffer day Tuesday',
        order: 1,
      });
    }
    const slackMatch = query.match(/\bsend a Slack notification to (.*?) channel\b/i);
    if (slackMatch) workflowData.slack.push({ channel: slackMatch[1], text: 'Notification text', order: 1 });

    const mailMatch = query.match(/\bsend a mail saying (.*?)\b/i);
    if (mailMatch) workflowData.mail.push({ subject: 'Auto-generated reply', message: mailMatch[1], order: 2 });

    workflowData.createdBy = 'admin_user';
    workflowData.createdAt = new Date();

    return workflowData;
  };

  const handleSaveWorkflow = async () => {
    if (!query.trim()) {
      setError('Please enter a query.');
      return;
    }
    setError(null);
    const workflowData = extractWorkflow(query);

    try {
      const response = await axios.post('http://localhost:3000/api/save-workflow', workflowData);
      setResponse(`Workflow saved successfully with ID: ${response.data.insertedId}`);
      navigate(`/workflow/${response.data.insertedId}`);
    } catch (err) {
      setError(`Failed to save workflow: ${err.message}`);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        <div style={styles.headerSection}>
          <h1 style={styles.title}>Workflow Automation Studio</h1>
          <p style={styles.subtitle}>Transform natural language into automated workflows</p>
        </div>
        
        <div style={styles.mainCard}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Create New Workflow</h2>
            <p style={styles.description}>
              Describe your workflow using text or voice commands. Our system will automatically generate and configure it for you.
            </p>
          </div>
          
          <div style={styles.inputSection}>
            <div style={styles.textareaWrapper}>
              <label style={styles.label}>Workflow Description</label>
              <textarea
                rows="5"
                placeholder="Example: When I receive a mail, send a Slack notification to the team channel..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={styles.textarea}
              />
            </div>
            
            <div style={styles.controlsSection}>
              <div style={styles.voiceControls}>
                <button 
                  id="startBtn" 
                  style={{
                    ...styles.button,
                    ...styles.buttonVoice,
                    ...(isRecording && styles.buttonRecording)
                  }}
                  disabled={isRecording}
                >
                  <div style={styles.buttonContent}>
                    <span style={styles.buttonIcon}>🎙</span>
                    Start Recording
                    {isRecording && <div style={styles.recordingIndicator} />}
                  </div>
                </button>
                
                <button 
                  id="stopBtn" 
                  style={{
                    ...styles.button,
                    ...styles.buttonStop,
                    opacity: isRecording ? 1 : 0.6,
                  }}
                  disabled={!isRecording}
                >
                  <div style={styles.buttonContent}>
                    <span style={styles.buttonIcon}>⏹</span>
                    Stop Recording
                  </div>
                </button>
              </div>

              <button 
                onClick={handleSaveWorkflow} 
                style={{
                  ...styles.button,
                  ...styles.buttonSave
                }}
              >
                <div style={styles.buttonContent}>
                  <span style={styles.buttonIcon}>💾</span>
                  Generate Workflow
                </div>
              </button>
            </div>
          </div>

          {response && <div style={styles.successAlert}>{response}</div>}
          {error && <div style={styles.errorAlert}>{error}</div>}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(145deg, #f6f8fb 0%, #eef1f5 100%)',
    padding: '40px 20px',
  },
  contentWrapper: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  headerSection: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#1a365d',
    marginBottom: '12px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '18px',
    color: '#4a5568',
    fontWeight: '500',
  },
  mainCard: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
  },
  cardHeader: {
    marginBottom: '32px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '24px',
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: '12px',
  },
  description: {
    fontSize: '16px',
    color: '#4a5568',
    lineHeight: '1.6',
  },
  inputSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  textareaWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: '4px',
  },
  textarea: {
    width: '100%',
    padding: '16px',
    fontSize: '16px',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    backgroundColor: '#fff',
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: '140px',
    transition: 'all 0.2s ease',
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: '1.6',
  },
  controlsSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  },
  voiceControls: {
    display: 'flex',
    gap: '12px',
  },
  button: {
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    padding: '12px 24px',
    minWidth: '160px',
    height: '48px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  buttonVoice: {
    backgroundColor: '#3182ce',
    color: '#fff',
    position: 'relative',
  },
  buttonStop: {
    backgroundColor: '#e53e3e',
    color: '#fff',
  },
  buttonSave: {
    backgroundColor: '#2f855a',
    color: '#fff',
    minWidth: '200px',
  },
  buttonRecording: {
    animation: 'pulse 2s infinite',
    backgroundColor: '#2c5282',
  },
  buttonIcon: {
    fontSize: '18px',
  },
  recordingIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#fc8181',
    marginLeft: '8px',
    animation: 'blink 1s infinite',
  },
  successAlert: {
    marginTop: '24px',
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: '#f0fff4',
    border: '1px solid #9ae6b4',
    color: '#2f855a',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'slideIn 0.3s ease-out',
  },
  errorAlert: {
    marginTop: '24px',
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: '#fff5f5',
    border: '1px solid #feb2b2',
    color: '#c53030',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'slideIn 0.3s ease-out',
  },
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.02)' },
    '100%': { transform: 'scale(1)' },
  },
  '@keyframes blink': {
    '0%': { opacity: 1 },
    '50%': { opacity: 0.4 },
    '100%': { opacity: 1 },
  },
  '@keyframes slideIn': {
    from: {
      transform: 'translateY(-10px)',
      opacity: 0,
    },
    to: {
      transform: 'translateY(0)',
      opacity: 1,
    },
  },
};

export default Query;