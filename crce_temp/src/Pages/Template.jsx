import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import { 
  Clock, Activity, Zap, Award, ChevronRight,
  Mail, Database, Calendar, MessageCircle,
  Webhook, HardDrive, Trello, Search,
  Star, Clock8
} from 'lucide-react';

const CategoryPill = ({ children, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 
    ${isActive 
      ? 'bg-violet-500 text-white shadow-lg shadow-violet-200' 
      : 'bg-white text-gray-600 hover:bg-gray-50'}`}
  >
    {children}
  </button>
);

const WorkflowCard = ({ workflow, colorIndex, imagePath }) => {
  const [isHovered, setIsHovered] = useState(false);

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
    <Link
      to={`/workflow/${workflow._id}`}
      className="group block rounded-xl bg-white shadow-lg hover:shadow-xl 
                transition-all duration-500 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-t from-violet-500/20 to-transparent 
                        transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
        <img 
          src={imagePath || "/src/image/image.png"} 
          alt="Template preview" 
          className={`w-full h-full object-cover transition-transform duration-700
                     ${isHovered ? 'scale-110' : 'scale-100'}`}
        />
        <div className="absolute top-4 right-4 flex space-x-2">
          <span className="px-3 py-1 rounded-full bg-white/90 text-violet-600 text-xs font-medium shadow-lg">
            New
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-violet-50">
              <Icon className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 group-hover:text-violet-600 transition-colors">
                Template {workflow._id.slice(-6)}
              </h2>
              <p className="text-sm text-gray-500">By Automation Team</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <Clock8 className="w-4 h-4" />
            <span className="text-sm">5 min setup</span>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          {workflow.trigger && (
            <div className="flex items-center text-sm text-gray-600">
              <Webhook className="w-4 h-4 mr-2 text-violet-400" />
              <span>Webhook Trigger</span>
            </div>
          )}
          {workflow.calendar?.length > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-violet-400" />
              <span>{workflow.calendar.length} Calendar Integration{workflow.calendar.length > 1 ? 's' : ''}</span>
            </div>
          )}
          {workflow.mail?.length > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2 text-violet-400" />
              <span>{workflow.mail.length} Email Action{workflow.mail.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
          <div className="flex space-x-2">
            <span className="px-2 py-1 rounded-md bg-violet-50 text-violet-600 text-xs font-medium">
              Popular
            </span>
            <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 text-xs font-medium">
              Verified
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-violet-400 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
};

const Dashboard = () => {
  const [workflows, setWorkflows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  
  const fetchWorkflows = async () => {
    try {
      const response = await axios.get('http://localhost:3000/get-workflows');
      const data = response.data;
      const templateWorkflows = data.filter(w => 
        w.trigger && w.trigger.toLowerCase().includes('template')
      );
      setWorkflows(templateWorkflows);
    } catch (error) {
      console.error('Failed to fetch workflows', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gradient-to-b from-violet-500/5 to-transparent pt-12 pb-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Workflow Templates
              </h1>
              <p className="mt-2 text-gray-600 text-lg">
                Start automating faster with our pre-built templates
              </p>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search templates..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-violet-300 
                         focus:ring focus:ring-violet-200 focus:ring-opacity-50 w-64"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="flex space-x-4 mb-12">
            {['All', 'Popular', 'New', 'Email', 'Calendar', 'Slack'].map(category => (
              <CategoryPill
                key={category}
                isActive={activeCategory === category}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </CategoryPill>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 -mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {workflows.map((workflow, index) => (
            <WorkflowCard 
              key={workflow._id} 
              workflow={workflow} 
              colorIndex={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;