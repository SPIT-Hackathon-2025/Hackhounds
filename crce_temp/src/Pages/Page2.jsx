import React, { useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 800 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 1200 },
  { name: 'May', value: 900 },
  { name: 'Jun', value: 1400 }
];

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-6 text-center">
      <h1 className="text-7xl font-bold mb-10">FlowSync</h1>
      <h1 className="text-5xl font-bold mb-4">Build, Automate, and Innovate</h1>
      <p className="text-lg max-w-2xl mx-auto">
        Automate workflows, connect apps, and streamline your business with powerful integrations.
      </p>
      <button className="mt-6 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-gray-100">
        Get Started
      </button>
    </section>
  );
};

const FeaturesSection = () => {
  return (
    <section className="py-20 px-6 bg-gray-100 text-center">
      <h2 className="text-3xl font-bold mb-6">Why Choose Our Platform?</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold">No-Code Automation</h3>
          <p className="mt-2 text-gray-600">Create workflows with an intuitive drag-and-drop interface.</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold">Powerful Integrations</h3>
          <p className="mt-2 text-gray-600">Connect your favorite apps seamlessly.</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold">Easy to Use</h3>
          <p className="mt-2 text-gray-600">Built for businesses of all sizes and easy flow automatic workflow generation.</p>
        </div>
      </div>
    </section>
  );
};

const DataAnalyticsSection = () => {
  return (
    <section className="py-20 px-6 bg-white text-center">
      <h2 className="text-3xl font-bold mb-6">Data Insights & Analytics</h2>
      <div className="max-w-4xl mx-auto">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 text-center">
      <p>&copy; 2025 FlowSync. All rights reserved.</p>
    </footer>
  );
};

const Page2 = () => {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <DataAnalyticsSection />
      <Footer />
    </div>
  );
};

export default Page2;