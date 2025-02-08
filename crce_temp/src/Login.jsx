import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
 
function decodeJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
      .join('')
  );
  return JSON.parse(jsonPayload);
}

function LoginPage() {
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const decoded = decodeJwt(credentialResponse.credential);
      console.log('Decoded Token:', decoded); // Optional for debugging

      const response = await axios.post('http://localhost:3000/auth/google', {
        token: credentialResponse.credential,
      });

      if (response.status === 200) {
        setMessage('Google Login successful');
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (error) {
      console.error(error);
      setMessage('Google Login failed. Please try again.');
    }
  };

  return (
    <GoogleOAuthProvider clientId="673418593404-2pgmppl2o65k13mnq8e5lgkcr9boegmv.apps.googleusercontent.com">
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center text-indigo-900">Login</h2>
          <p className="text-center">Login with Google:</p>
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setMessage('Google Login failed. Please try again.')}
            useOneTap
          />
          {message && <p className="text-center text-red-600 mt-4">{message}</p>}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default LoginPage;
