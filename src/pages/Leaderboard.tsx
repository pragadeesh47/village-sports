
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import type { Participant, AgeGroup, LeaderboardEntry } from '../types';
import { Trophy, Medal, Star, ChevronRight } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      const groups = await db.ageGroups.toArray();
      setAgeGroups(groups);
      if (groups.length > 0 && !selectedGroup) setSelectedGroup(groups[0].id!);
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    const calculateLeaderboard = async () => {
      if (!selectedGroup) return;

      const participants = await db.participants.where('ageGroupId').equals(selectedGroup).toArray();
      const allGameParticipants = await db.gameParticipants.toArray();
      
      const entries: LeaderboardEntry[] = participants.map(p => {
        const participantActions = allGameParticipants.filter(gp => gp.participantId === p.id);
        const wins = participantActions.filter(gp => gp.position === 1).length;
        
        // Calculate points: 1st: 10, 2nd: 5, 3rd: 3, others: 1
        const points = participantActions.reduce((sum, gp) => {
          if (gp.position === 1) return sum + 10;
          if (gp.position === 2) return sum + 5;
          if (gp.position === 3) return sum + 3;
          if (gp.position && gp.position > 3) return sum + 1;
          return sum;
        }, 0);

        return {
          participantId: p.id!,
          name: p.name,
          points,
          wins,
          badges: wins // Simple rule: 1 badge per win
        };
      });

      setLeaderboard(entries.sort((a, b) => b.points - a.points));
    };
    calculateLeaderboard();
  }, [selectedGroup]);

  return (
    <div className="p-6 lg:p-10 bg-gray-50 min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Official Leaderboard</h1>
        <p className="text-gray-500 font-medium">Top performers across the festival</p>
      </div>

      <div className="flex overflow-x-auto space-x-3 mb-8 pb-2 scrollbar-hide">
        {ageGroups.map(group => (
          <button 
            key={group.id}
            onClick={() => setSelectedGroup(group.id!)}
            className={`whitespace-nowrap px-6 py-4 rounded-2xl font-bold transition-all ${
              selectedGroup === group.id 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 translate-y-[-2px]' 
                : 'bg-white text-gray-500 border border-gray-100 hover:border-indigo-200'
            }`}
          >
            {group.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-black tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-8 py-6">Rank</th>
                <th className="px-8 py-6">Name</th>
                <th className="px-8 py-6">Points</th>
                <th className="px-8 py-6">Wins</th>
                <th className="px-8 py-6">Badges</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leaderboard.map((entry, index) => (
                <tr key={entry.participantId} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                      <span className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                        index === 0 ? 'bg-yellow-400 text-white' : 
                        index === 1 ? 'bg-gray-300 text-white' : 
                        index === 2 ? 'bg-orange-400 text-white' : 'text-gray-400'
                      }`}>
                        {index + 1}
                      </span>
                      {index < 3 && <Medal className={index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : 'text-orange-400'} size={20} />}
                    </div>
                  </td>
                  <td className="px-8 py-6 font-bold text-gray-900 text-lg">{entry.name}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2 text-indigo-600 font-black text-lg">
                      <Star size={18} fill="currentColor" />
                      <span>{entry.points}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-bold text-gray-700">{entry.wins}</td>
                  <td className="px-8 py-6 font-bold text-gray-700">{entry.badges}</td>
                </tr>
              ))}
              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-bold">
                    No records for this age group yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
