import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Play, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Code, 
  Unlock, 
  TrendingUp, 
  MessageSquare,
  Loader2,
  AlertCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { cn } from '../utils';

interface WorkflowTask {
  id: string;
  day: string;
  task: string;
  description: string;
  status: 'completed' | 'pending' | 'current' | 'running';
  icon: React.ComponentType<any>;
  action: () => Promise<any>;
  results?: any[];
  lastRun?: string;
}

export function WorkflowPanel() {
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [runningTask, setRunningTask] = useState<string | null>(null);

  // Initialize tasks
  useEffect(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const todayIndex = dayOrder.indexOf(today);

    const initialTasks: WorkflowTask[] = [
      {
        id: 'funding',
        day: 'Mon',
        task: 'Parse funding rounds',
        description: 'Scan for new funding announcements',
        status: todayIndex === -1 ? 'pending' : todayIndex > 0 ? 'completed' : todayIndex === 0 ? 'current' : 'pending',
        icon: DollarSign,
        action: parseFundingRounds,
        results: []
      },
      {
        id: 'dev-commits',
        day: 'Tue',
        task: 'Dev commit analysis',
        description: 'Check GitHub activity metrics',
        status: todayIndex === -1 ? 'pending' : todayIndex > 1 ? 'completed' : todayIndex === 1 ? 'current' : 'pending',
        icon: Code,
        action: analyzeDevCommits,
        results: []
      },
      {
        id: 'token-unlocks',
        day: 'Wed',
        task: 'Token unlock scan',
        description: 'Review upcoming unlock schedules',
        status: todayIndex === -1 ? 'pending' : todayIndex > 2 ? 'completed' : todayIndex === 2 ? 'current' : 'pending',
        icon: Unlock,
        action: scanTokenUnlocks,
        results: []
      },
      {
        id: 'smart-money',
        day: 'Thu',
        task: 'Smart money flows',
        description: 'Analyze whale wallet movements',
        status: todayIndex === -1 ? 'pending' : todayIndex > 3 ? 'completed' : todayIndex === 3 ? 'current' : 'pending',
        icon: TrendingUp,
        action: analyzeSmartMoney,
        results: []
      },
      {
        id: 'sentiment',
        day: 'Fri',
        task: 'Sentiment update',
        description: 'Social media sentiment analysis',
        status: todayIndex === -1 ? 'pending' : todayIndex > 4 ? 'completed' : todayIndex === 4 ? 'current' : 'pending',
        icon: MessageSquare,
        action: updateSentiment,
        results: []
      }
    ];

    setTasks(initialTasks);
  }, []);

  // Mock action functions
  async function parseFundingRounds(): Promise<any[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return [
      { project: 'LayerZero', amount: '$120M', round: 'Series B', date: '2024-01-15', investors: ['a16z', 'Sequoia'] },
      { project: 'Celestia', amount: '$55M', round: 'Series A', date: '2024-01-14', investors: ['Bain Capital', 'Polychain'] },
      { project: 'Berachain', amount: '$42M', round: 'Series A', date: '2024-01-13', investors: ['Framework', 'Hack VC'] },
      { project: 'Monad', amount: '$19M', round: 'Seed', date: '2024-01-12', investors: ['Dragonfly', 'Placeholder'] }
    ];
  }

  async function analyzeDevCommits(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return [
      { project: 'Ethereum', commits: 1247, change: '+15%', devs: 89, activity: 'High' },
      { project: 'Solana', commits: 892, change: '+8%', devs: 67, activity: 'High' },
      { project: 'Polygon', commits: 634, change: '+22%', devs: 45, activity: 'Medium' },
      { project: 'Arbitrum', commits: 445, change: '+31%', devs: 34, activity: 'High' }
    ];
  }

  async function scanTokenUnlocks(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    return [
      { token: 'APT', unlock: '24.2M', value: '$284M', date: '2024-02-12', impact: 'High' },
      { token: 'OP', unlock: '31.3M', value: '$156M', date: '2024-02-15', impact: 'Medium' },
      { token: 'ARB', unlock: '92.6M', value: '$185M', date: '2024-03-16', impact: 'High' },
      { token: 'SUI', unlock: '64.2M', value: '$128M', date: '2024-03-01', impact: 'Medium' }
    ];
  }

  async function analyzeSmartMoney(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 2200));
    
    return [
      { wallet: '0x742d...35Bd', action: 'Accumulated', token: 'ETH', amount: '2,847', value: '$6.8M' },
      { wallet: '0x8315...92Ac', action: 'Sold', token: 'BTC', amount: '127', value: '$5.4M' },
      { wallet: '0x1f9f...84De', action: 'Accumulated', token: 'SOL', amount: '45,230', value: '$4.2M' },
      { wallet: '0x456a...73Ef', action: 'Accumulated', token: 'MATIC', amount: '892,340', value: '$2.1M' }
    ];
  }

  async function updateSentiment(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 1600));
    
    return [
      { token: 'BTC', sentiment: 0.72, mentions: 45230, trend: 'Bullish', change: '+12%' },
      { token: 'ETH', sentiment: 0.68, mentions: 38940, trend: 'Bullish', change: '+8%' },
      { token: 'SOL', sentiment: 0.81, mentions: 29340, trend: 'Very Bullish', change: '+24%' },
      { token: 'AVAX', sentiment: 0.45, mentions: 12450, trend: 'Neutral', change: '-3%' }
    ];
  }

  const runTask = async (taskId: string) => {
    setRunningTask(taskId);
    
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    // Update task status to running
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: 'running' } : t
    ));

    try {
      const results = await tasks[taskIndex].action();
      
      // Update task with results
      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { 
              ...t, 
              status: 'completed', 
              results, 
              lastRun: new Date().toLocaleTimeString()
            } 
          : t
      ));
    } catch (error) {
      console.error('Task failed:', error);
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: 'pending' } : t
      ));
    } finally {
      setRunningTask(null);
    }
  };

  const getStatusIcon = (task: WorkflowTask) => {
    if (task.status === 'running') {
      return <Loader2 className="w-5 h-5 animate-spin text-blue-400" />;
    }
    if (task.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
    if (task.status === 'current') {
      return <Clock className="w-5 h-5 text-yellow-400" />;
    }
    return <AlertCircle className="w-5 h-5 text-gray-400" />;
  };

  const getTaskCardClass = (task: WorkflowTask) => {
    const baseClass = "p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]";
    
    switch (task.status) {
      case 'completed':
        return `${baseClass} bg-green-500/10 border-green-400/30 hover:border-green-400/50`;
      case 'current':
        return `${baseClass} bg-yellow-500/10 border-yellow-400/30 hover:border-yellow-400/50 animate-pulse`;
      case 'running':
        return `${baseClass} bg-blue-500/10 border-blue-400/30 hover:border-blue-400/50`;
      default:
        return `${baseClass} bg-white/5 border-white/10 hover:border-white/20`;
    }
  };

  const renderResults = (task: WorkflowTask) => {
    if (!task.results || task.results.length === 0) return null;

    return (
      <div className="mt-4 p-4 bg-black/20 rounded-xl border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-white">Latest Results</h4>
          <span className="text-xs text-gray-400">
            {task.lastRun && `Last run: ${task.lastRun}`}
          </span>
        </div>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {task.results.slice(0, 3).map((result, index) => (
            <div key={index} className="text-xs text-gray-300 p-2 bg-white/5 rounded-lg">
              {task.id === 'funding' && (
                <div className="flex justify-between">
                  <span className="font-medium text-white">{result.project}</span>
                  <span className="text-green-400">{result.amount}</span>
                </div>
              )}
              {task.id === 'dev-commits' && (
                <div className="flex justify-between">
                  <span className="font-medium text-white">{result.project}</span>
                  <span className="text-blue-400">{result.commits} commits ({result.change})</span>
                </div>
              )}
              {task.id === 'token-unlocks' && (
                <div className="flex justify-between">
                  <span className="font-medium text-white">{result.token}</span>
                  <span className="text-red-400">{result.unlock} tokens ({result.value})</span>
                </div>
              )}
              {task.id === 'smart-money' && (
                <div className="flex justify-between">
                  <span className="font-medium text-white">{result.wallet}</span>
                  <span className={result.action === 'Accumulated' ? 'text-green-400' : 'text-red-400'}>
                    {result.action} {result.amount} {result.token}
                  </span>
                </div>
              )}
              {task.id === 'sentiment' && (
                <div className="flex justify-between">
                  <span className="font-medium text-white">{result.token}</span>
                  <span className="text-purple-400">{result.trend} ({(result.sentiment * 100).toFixed(0)}%)</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center space-x-3">
            <Calendar className="w-7 h-7 text-cyan-400" />
            <span>Interactive Workflow</span>
          </h3>
          <p className="text-gray-300 text-sm mt-2">Click to execute professional analysis tasks</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          <RefreshCw className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => {
          const IconComponent = task.icon;
          
          return (
            <div key={task.id} className={getTaskCardClass(task)}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white bg-white/10 px-2 py-1 rounded-md">
                        {task.day}
                      </span>
                      <h4 className="font-semibold text-white">{task.task}</h4>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {getStatusIcon(task)}
                  <button
                    onClick={() => runTask(task.id)}
                    disabled={task.status === 'running'}
                    className={cn(
                      "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center space-x-2",
                      task.status === 'running' 
                        ? "bg-blue-500/20 text-blue-300 cursor-not-allowed"
                        : "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 hover:text-cyan-200 hover:scale-105"
                    )}
                  >
                    {task.status === 'running' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Running...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Execute</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {renderResults(task)}
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-cyan-500/10 rounded-xl border border-cyan-400/30">
        <p className="text-sm text-cyan-300 font-semibold mb-2">
          Professional Analysis Framework • Today is {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
        </p>
        <p className="text-xs text-cyan-200">
          {new Date().getDay() === 0 || new Date().getDay() === 6 
            ? "Weekend - Execute any task manually for research" 
            : "Click 'Execute' to run real-time analysis • Results update automatically"}
        </p>
      </div>
    </div>
  );
}