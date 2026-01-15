
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import type { AppSettings, AgeGroup } from '../types';
import { Settings as SettingsIcon, Save, Info, Plus, Trash2, X, Layers } from 'lucide-react';

const Settings: React.FC<{ onUpdate: (s: AppSettings) => void }> = ({ onUpdate }) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    db.settings.toArray().then(s => setSettings(s[0] || null));
    db.ageGroups.toArray().then(setAgeGroups);
  }, []);

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const updated: AppSettings = {
      ...settings!,
      villageName: formData.get('village') as string,
      gangName: formData.get('gang') as string
    };
    await db.settings.put(updated);
    setSettings(updated);
    onUpdate(updated);
    setTimeout(() => setIsSaving(false), 800);
  };

  const handleAddAgeGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const minAge = parseInt(formData.get('minAge') as string);
    const maxAge = parseInt(formData.get('maxAge') as string);

    if (!name || isNaN(minAge) || isNaN(maxAge)) {
      alert("Please fill all fields. Use 0 and 99 for general categories.");
      return;
    }

    const newGroup = { name, minAge, maxAge };
    const id = await db.ageGroups.add(newGroup);
    setAgeGroups([...ageGroups, { ...newGroup, id }]);
    setIsModalOpen(false);
  };

  const deleteAgeGroup = async (id: number | undefined) => {
    if (id === undefined) return;

    // Check for dependencies across all related tables
    const [pCount, gCount] = await Promise.all([
      db.participants.where('ageGroupId').equals(id).count(),
      db.games.where('ageGroupId').equals(id).count()
    ]);

    if (pCount > 0 || gCount > 0) {
      alert(
        `SYSTEM ALERT: DATA INTEGRITY PROTECTION\n\n` +
        `This category is currently linked to:\n` +
        `- ${pCount} Participants\n` +
        `- ${gCount} Games\n\n` +
        `Deletion is blocked. Please re-assign or remove these items before deleting the category.`
      );
      return;
    }

    const confirm = window.confirm("Are you sure you want to remove this category? This action cannot be undone.");
    if (confirm) {
      try {
        await db.ageGroups.delete(id);
        setAgeGroups(prev => prev.filter(a => a.id !== id));
      } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete category from database. Please refresh and try again.");
      }
    }
  };

  if (!settings) return null;

  return (
    <div className="p-6 lg:p-10 bg-gray-50 min-h-full">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900">Festival Settings</h1>
        <p className="text-gray-500 font-medium">Manage identity and event categories</p>
      </div>

      <div className="max-w-3xl space-y-10">
        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center space-x-2">
            <Info className="text-indigo-600" />
            <span>Festival Identity</span>
          </h2>
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Village Name</label>
                <input name="village" defaultValue={settings.villageName} className="w-full px-5 py-4 border-2 border-gray-100 rounded-2xl bg-gray-50 outline-none focus:border-indigo-500 font-bold" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Gang Name</label>
                <input name="gang" defaultValue={settings.gangName} className="w-full px-5 py-4 border-2 border-gray-100 rounded-2xl bg-gray-50 outline-none focus:border-indigo-500 font-bold" />
              </div>
            </div>
            <button 
              type="submit" 
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl flex items-center space-x-2 active:scale-95 disabled:opacity-50 transition-all"
              disabled={isSaving}
            >
              <Save size={20} />
              <span>{isSaving ? 'Saving...' : 'Save Identity'}</span>
            </button>
          </form>
        </section>

        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-gray-900 flex items-center space-x-2">
              <Layers className="text-indigo-600" />
              <span>Categories</span>
            </h2>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-indigo-600 font-bold flex items-center space-x-1 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all"
            >
              <Plus size={18} />
              <span>Add Category</span>
            </button>
          </div>
          <div className="space-y-3">
            {ageGroups.map(group => (
              <div key={group.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border-2 border-gray-100 group transition-all">
                <div>
                  <span className="font-bold text-gray-800 text-lg block">{group.name}</span>
                  <span className="text-xs font-bold text-gray-400">Ref Age: {group.minAge} - {group.maxAge} yrs</span>
                </div>
                <button 
                  onClick={() => deleteAgeGroup(group.id)}
                  className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            {ageGroups.length === 0 && (
              <div className="text-center py-10 text-gray-400 font-bold italic">No categories created yet.</div>
            )}
          </div>
        </section>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-[100]">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">New Category</h2>
                <button onClick={() => setIsModalOpen(false)}><X className="text-gray-400" /></button>
              </div>
              <form onSubmit={handleAddAgeGroup} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category Name</label>
                  <input name="name" required className="w-full px-5 py-4 border-2 border-gray-100 rounded-xl bg-gray-50 font-bold outline-none" placeholder="e.g. Kids / Boys" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Min Age</label>
                    <input name="minAge" type="number" required defaultValue="0" className="w-full px-5 py-4 border-2 border-gray-100 rounded-xl bg-gray-50 font-bold outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Max Age</label>
                    <input name="maxAge" type="number" required defaultValue="99" className="w-full px-5 py-4 border-2 border-gray-100 rounded-xl bg-gray-50 font-bold outline-none" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg">Save Category</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
