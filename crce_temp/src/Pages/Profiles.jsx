import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import { 
  Clock, Activity, Zap, Award, ChevronRight,
  Mail, Database, Calendar, MessageCircle,
  Webhook, HardDrive, Trello
} from 'lucide-react';

const BUBBLE_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-pink-500",
  "bg-amber-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-fuchsia-500"
];

const getRandomColor = (index) => {
  return BUBBLE_COLORS[index % BUBBLE_COLORS.length];
};

const TypewriterText = ({ text }) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    
    return () => clearInterval(timer);
  }, [text]);
  
  return <span className="animate-fade-in">{displayText}</span>;
};

const StatBubble = ({ icon: Icon, value, label, color, index }) => (
  <div 
    className={`relative p-6 rounded-full ${color} text-white flex flex-col items-center justify-center w-32 h-32 
    transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl
    animate-float-in`}
    style={{ 
      animationDelay: `${index * 150}ms`,
      animation: `float-in 0.6s ease-out ${index * 150}ms backwards,
                 pulse 3s ease-in-out ${index * 200}ms infinite`
    }}
  >
    <Icon className="w-8 h-8 mb-1 animate-spin-slow" />
    <div className="text-2xl font-bold animate-count-up" style={{ 
      animationDelay: `${(index * 150) + 500}ms` 
    }}>
      {value}
    </div>
    <div className="text-sm text-center">{label}</div>
  </div>
);

const SellModal = ({ workflow, onClose, onSell }) => {
  const [price, setPrice] = useState("");

  const handleSell = () => {
    onSell(workflow, price);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Sell Workflow</h2>
        <p className="mb-4">Enter the price for the workflow:</p>
        <input
          type="number"
          className="w-full p-2 border border-gray-300 rounded mb-4"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
        />
        <div className="flex justify-end gap-4">
          <button 
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={handleSell}
          >
            Sell
          </button>
        </div>
      </div>
    </div>
  );
};

const ShareModal = ({ workflow, onClose, onShare }) => {
  const handleShare = () => {
    onShare(workflow);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Share Workflow</h2>
        <p className="mb-4">Share this workflow with the following recipients:</p>
        <ul className="mb-4">
          <li>hrishikesh.dalal22@spit.ac.in</li>
          <li>venisha.kalola22@spit.ac.in</li>
          <li>maureen.miranda22@spit.ac.in</li>
          <li>ayushi.japsare23@spit.ac.in</li>
        </ul>
        <div className="flex justify-end gap-4">
          <button 
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            onClick={handleShare}
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

const WorkflowCard = ({ workflow, colorIndex, onSell, onShare }) => {
  const color = getRandomColor(colorIndex);
  const lightColor = color.replace('500', '100');
  const darkColor = color.replace('bg-', 'border-');

  const getNodeIcon = (nodeType) => {
    const iconMap = {
      'webhook': Webhook,
      'mail': Mail,
      'database': Database,
      'calendar': Calendar,
      'slack': MessageCircle,
      'drive': HardDrive,
      'trello': Trello
    };
    return iconMap[nodeType] || Activity;
  };

  const getPrimaryNodeType = (workflow) => {
    if (workflow.trigger) return 'webhook';
    if (workflow.mail?.length) return 'mail';
    if (workflow.calendar?.length) return 'calendar';
    if (workflow.slack?.length) return 'slack';
    return 'database';
  };

  const Icon = getNodeIcon(getPrimaryNodeType(workflow));

  return (
    <Link to={`/workflow/${workflow._id}`} className="block">
      <div
        className={`p-6 rounded-lg border-l-4 bg-white shadow-lg hover:shadow-xl 
        transition-all duration-300 ${lightColor} ${darkColor} 
        animate-slide-up hover:scale-102 hover:-translate-y-1`}
        style={{ 
          animationDelay: `${colorIndex * 100}ms`,
          opacity: 0,
          animation: `slide-up 0.5s ease-out ${colorIndex * 100}ms forwards`
        }}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <Icon className={`w-5 h-5 mr-2 ${darkColor.replace('border-', 'text-')} animate-bounce-subtle`} />
            <h2 className="text-lg font-semibold">Workflow {workflow._id.slice(-6)}</h2>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform duration-300" />
        </div>
        
        <div className="space-y-3">
          {workflow.trigger && (
            <div className="text-sm animate-fade-in" style={{ animationDelay: '200ms' }}>
              <span className="font-medium">Trigger:</span> Webhook
            </div>
          )}
          {workflow.calendar?.length > 0 && (
            <div className="text-sm animate-fade-in" style={{ animationDelay: '300ms' }}>
              <span className="font-medium">Calendar Events:</span> {workflow.calendar.length}
            </div>
          )}
          {workflow.mail?.length > 0 && (
            <div className="text-sm animate-fade-in" style={{ animationDelay: '400ms' }}>
              <span className="font-medium">Email Tasks:</span> {workflow.mail.length}
            </div>
          )}
          {workflow.slack?.length > 0 && (
            <div className="text-sm animate-fade-in" style={{ animationDelay: '500ms' }}>
              <span className="font-medium">Slack Messages:</span> {workflow.slack.length}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onSell(workflow);
            }}
          >
            Sell
          </button>
          <button 
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onShare(workflow);
            }}
          >
            Share
          </button>
        </div>
      </div>
    </Link>
  );
};

const Dashboard = () => {
  const [workflows, setWorkflows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const fetchWorkflows = async () => {
    try {
      const response = await axios.get('http://localhost:3000/get-workflows');
      setWorkflows(response.data);
    } catch (error) {
      console.error('Failed to fetch workflows', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleSell = (workflow) => {
    setSelectedWorkflow(workflow);
  };

  const handleShare = (workflow) => {
    setSelectedWorkflow(workflow);
    setIsShareModalOpen(true);
  };

  const handleSellConfirm = async (workflow, price) => {
    try {
      await axios.post('http://localhost:3000/sell-workflow', { workflowId: workflow._id, price });
      alert('Workflow sold successfully!');
    } catch (error) {
      console.error('Failed to sell workflow', error);
    }
  };

  const handleShareConfirm = async (workflow) => {
    const recipients = [
      'hrishikesh.dalal22@spit.ac.in',
      'venisha.kalola22@spit.ac.in',
      'maureen.miranda22@spit.ac.in',
      'ayushi.japsare23@spit.ac.in'
    ];

    try {
      for (const recipient of recipients) {
        await axios.post('http://localhost:3000/send-email', {
          from: 'dcmaureenmiranda@gmail.com',
          to: recipient,
          subject: 'Shared Workflow',
          message: `You have been shared a workflow. Click the link below to view the workflow: http://localhost:5173/workflow/${workflow._id}`,
        });
      }
      alert('Workflow shared successfully!');
    } catch (error) {
      console.error('Failed to share workflow', error);
    }
  };

  const totalNodes = workflows.reduce((acc, workflow) => {
    return acc + 
      (workflow.trigger ? 1 : 0) +
      (workflow.calendar?.length || 0) +
      (workflow.mail?.length || 0) +
      (workflow.slack?.length || 0);
  }, 0);

  const stats = [
    {
      icon: Activity,
      value: workflows.length,
      label: "Workflows",
      color: "bg-violet-500"
    },
    {
      icon: Zap,
      value: totalNodes,
      label: "Total Nodes",
      color: "bg-blue-500"
    },
    {
      icon: Mail,
      value: workflows.reduce((acc, w) => acc + (w.mail?.length || 0), 0),
      label: "Email Tasks",
      color: "bg-emerald-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <style>
        {`
          @keyframes float-in {
            0% { transform: translateY(20px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          
          @keyframes slide-up {
            0% { transform: translateY(20px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          @keyframes bounce-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
          }
          
          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .animate-float-in { animation: float-in 0.5s ease-out; }
          .animate-slide-up { animation: slide-up 0.5s ease-out; }
          .animate-bounce-subtle { animation: bounce-subtle 2s infinite; }
          .animate-spin-slow { animation: spin-slow 20s linear infinite; }
          .hover:scale-102:hover { transform: scale(1.02); }
        `}
      </style>
      <div className="max-w-7xl mx-auto animate-fade-in">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 animate-float-in">
            Welcome User
          </h1>
          <p className="text-gray-600 animate-float-in" style={{ animationDelay: '200ms' }}>
            Monitor and manage your automation workflows
          </p>
        </div>

        <div className="flex justify-center gap-8 mb-12">
          {stats.map((stat, index) => (
            <StatBubble key={index} {...stat} index={index} />
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 animate-float-in">
            Your Workflows
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow, index) => (
              <WorkflowCard 
                key={workflow._id} 
                workflow={workflow} 
                colorIndex={index}
                onSell={handleSell}
                onShare={handleShare}
              />
            ))}
          </div>
        </div>
      </div>
      {selectedWorkflow && (
        <SellModal 
          workflow={selectedWorkflow} 
          onClose={() => setSelectedWorkflow(null)} 
          onSell={handleSellConfirm} 
        />
      )}
      {isShareModalOpen && (
        <ShareModal 
          workflow={selectedWorkflow} 
          onClose={() => setIsShareModalOpen(false)} 
          onShare={handleShareConfirm} 
        />
      )}
    </div>
  );
};

export default Dashboard;