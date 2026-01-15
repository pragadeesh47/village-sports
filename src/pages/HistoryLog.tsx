
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import type { EditHistory, Game } from '../types';
import { Clock, History, User, Activity, ShieldCheck, ChevronRight } from 'lucide-react';

const HistoryLog: React.FC = () => {
  const [logs, setLogs] = useState<EditHistory[]>([]);
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const h = await db.history.reverse().toArray();
      const g = await db.games.toArray();
      setLogs(h);
      setGames(g);
    };
    fetch();
  }, []);

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const groupedLogs = logs.reduce((acc, log) => {
    const date = formatDate(log.timestamp);
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {} as Record<string, EditHistory[]>);

  return (
    <div className="p-6 lg:p-10 bg-gray-50 min-h-full">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 flex items-center space-x-3">
          <History className="text-indigo-600" />
          <span>Audit History</span>
        </h1>
        <p className="text-gray-500 font-medium">All administrative actions are tracked here</p>
      </div>

      <div className="max-w-4xl space-y-12">
        {Object.keys(groupedLogs).map(date => (
          <section key={date}>
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center">
              <span className="bg-gray-200 h-px flex-1 mr-4"></span>
              {date}
              <span className="bg-gray-200 h-px flex-1 ml-4"></span>
            </h2>
            <div className="space-y-4">
              {groupedLogs[date].map(log => {
                const gameName = games.find(g => g.id === log.gameId)?.name || 'General';
                return (
                  <div key={log.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden group">
                    <div className={`absolute top-0 bottom-0 left-0 w-2 ${
                      log.actionType === 'UNLOCK' ? 'bg-red-500' :
                      log.actionType === 'START' ? 'bg-green-500' :
                      log.actionType === 'END' ? 'bg-indigo-500' : 'bg-blue-400'
                    }`} />
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                          log.actionType === 'UNLOCK' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'
                        }`}>
                          {log.actionType}
                        </span>
                        <h3 className="font-black text-gray-900">{gameName}</h3>
                      </div>
                      <p className="text-gray-600 font-medium">{log.reason}</p>
                      <p className="text-xs text-gray-400 italic">{log.changes}</p>
                    </div>

                    <div className="flex items-center space-x-6 shrink-0 text-gray-500 font-semibold border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                      <div className="flex items-center space-x-2">
                        <User size={16} />
                        <span className="text-sm">{log.performedBy}</span>
                      </div>
                      <div className="flex items-center space-x-2 tabular-nums">
                        <Clock size={16} />
                        <span className="text-sm">{formatTime(log.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
        {logs.length === 0 && (
          <div className="py-20 text-center">
            <Activity className="mx-auto text-gray-200 mb-4" size={64} />
            <p className="text-gray-400 font-bold text-xl">No history records yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryLog;
