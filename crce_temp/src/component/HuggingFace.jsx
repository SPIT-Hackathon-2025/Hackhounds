
import React, { useState } from 'react';
import axios from 'axios';

const HuggingFace = () => {
  const [inputText, setInputText] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const fetchPrediction = async () => {
    if (!inputText.trim()) {
      setResponse('Please provide a valid input.');
      return;
    }

    setLoading(true);
    setResponse('');
    try {
      const result = await axios.post(
        'https://api-inference.huggingface.co/models/distilgpt2', // Lighter model
        { inputs: inputText },
        {
          headers: {
            Authorization: import.meta.env.REACT_APP_HF_API_KEY, // Ensure your token is valid
          },
        }
      );
      setResponse(result.data[0]?.generated_text || 'No response from the model.');
    } catch (error) {
      console.error('Error response:', error.response?.data || error.message);
      setResponse('Error fetching prediction. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1 className="title">Hugging Face Model with Vite</h1>
      <textarea
        value={inputText}
        onChange={handleInputChange}
        placeholder="Enter some text..."
        rows="5"
        className="input-textarea"
      />
      <button onClick={fetchPrediction} disabled={loading} className="fetch-button">
        {loading ? 'Loading...' : 'Get Prediction'}
      </button>
      {response && <div className="response-box">{response}</div>}
    </div>
  );
};

export default HuggingFace;

