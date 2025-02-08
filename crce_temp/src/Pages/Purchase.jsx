import React, { useState } from 'react';
import { Search, Star, Download, Share2 } from 'lucide-react';

const Purchase = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const templates = [
    {
      id: 1,
      title: "Gmail to Drive Sync",
      description: "Automatically save Gmail attachments to Google Drive",
      category: "Email",
      rating: 4.8,
      downloads: 2345,
      price: 0,  // Free template
      author: "WorkflowPro",
      tags: ["Gmail", "Google Drive", "Storage"]
    },
    {
      id: 2,
      title: "Notion Calendar Sync",
      description: "Keep your Notion pages synchronized with Google Calendar",
      category: "Productivity",
      rating: 4.6,
      downloads: 1890,
      price: 499, // ₹4.99
      author: "AutomationHub",
      tags: ["Notion", "Calendar", "Sync"]
    },
    {
      id: 3,
      title: "Social Media Scheduler",
      description: "Schedule and automate posts across multiple social platforms",
      category: "Social Media",
      rating: 4.9,
      downloads: 3200,
      price: 999, // ₹9.99
      author: "SocialFlow",
      tags: ["Twitter", "LinkedIn", "Scheduling"]
    }
  ];

  const handlePayment = async (template) => {
    if (template.price === 0) {
      alert("This template is free! You can use it without payment.");
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: "User Name",  // Replace with actual user data
          email: "user@example.com", // Replace with actual user data
          amount: template.price
        })
      });

      const order = await response.json();

      if (!order.id) {
        alert("Failed to create an order. Please try again.");
        return;
      }

      const options = {
        key: "rzp_test_TrzRx21MJ6LUPk",
        amount: order.amount,
        currency: order.currency,
        name: "Automation Marketplace",
        description: template.title,
        order_id: order.id,
        handler: function (response) {
          alert("Payment successful! Order ID: " + response.razorpay_payment_id);
          // Here you can unlock the template for the user
        },
        prefill: {
          name: "User Name",  // Replace with actual user data
          email: "user@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Automation Template Marketplace</h1>
          <p className="mt-2 text-gray-600">Discover and share powerful automation workflows</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search templates..."
              className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates
            .filter(template =>
              template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
              template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            .map(template => (
              <div key={template.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{template.title}</h3>
                    <span className="text-sm font-medium text-blue-600">
                      {template.price === 0 ? "Free" : `₹${template.price / 100}`}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4">{template.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-400" size={16} fill="currentColor" />
                      <span>{template.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download size={16} />
                      <span>{template.downloads}</span>
                    </div>
                    <span>By {template.author}</span>
                  </div>
                </div>

                <div className="border-t px-6 py-4 flex justify-between">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => handlePayment(template)}
                  >
                    Use Template
                  </button>
                  
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
};

export default Purchase;
