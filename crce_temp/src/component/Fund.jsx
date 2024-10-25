// src/App.jsx
import React, { useState } from 'react';
import axios from 'axios';



function Fund() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [amount, setAmount] = useState('');
    const handleDonation = async (e) => {
        e.preventDefault();
    
         // Check if Razorpay has loaded
      if (typeof window.Razorpay === 'undefined') {
        alert('Razorpay SDK not loaded.');
        return;
      }
    
      try {
        const orderUrl = 'http://localhost:3000/donate';
        const { data } = await axios.post(orderUrl, { name, email, amount });
    
        const options = {
          key: 'rzp_test_TrzRx21MJ6LUPk',
          amount: data.amount,
          currency: data.currency,
          name: 'Crowdfunding',
          description: 'Donation',
          order_id: data.id,
          handler: function (response) {
            alert('Payment successful!');
            console.log(response);
          },
          prefill: {
            name,
            email,
          },
          theme: {
            color: '#61dafb',
          },
        };
    
        const rzp = new window.Razorpay(options);
        rzp.open();
    } catch (error) {
        console.error('Error in payment:', error);
      }
    };
  return (
    <div className="donation-container">
  <div className="donation-form">
    <form onSubmit={handleDonation}>
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email ID"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      


      <button type="submit" className="donate-btn">
        Donate Now
      </button>
    </form>

    
  </div>
 
</div>
  );
}



export default Fund;