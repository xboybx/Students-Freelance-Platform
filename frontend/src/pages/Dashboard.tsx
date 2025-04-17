import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { getSkills, saveSkill, saveBooking, getUsers, updateSkill } from '../utils/localStorage';
import { Skill, Booking, SKILL_CATEGORIES, SkillCategory } from '../types';
import { Plus, Book, Edit, X, Search, Filter, Sparkles, Star, DollarSign, Clock, Trash2 } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [newSkill, setNewSkill] = useState({
    title: '',
    description: '',
    rate: 0,
    category: 'Other' as SkillCategory
  });
  const [bookingDate, setBookingDate] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'all'>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetailSkill, setSelectedDetailSkill] = useState<Skill | null>(null);
  const [selectedMySkill, setSelectedMySkill] = useState<Skill | null>(null);
  const [showMySkillModal, setShowMySkillModal] = useState(false);

  const skills = getSkills();
  const users = getUsers();
  const userSkills = skills.filter(skill => skill.userId === user?.id);
  const otherSkills = skills.filter(skill => skill.userId !== user?.id);

  const filteredSkills = otherSkills.filter(skill => {
    const matchesSearch = skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getAuthorName = (userId: string) => {
    const author = users.find(u => u.id === userId);
    return author?.name || 'Unknown Author';
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const skill: Skill = {
        id: crypto.randomUUID(),
        userId: user.id,
        ...newSkill
      };
      saveSkill(skill);
      setShowAddSkill(false);
      setNewSkill({ title: '', description: '', rate: 0, category: 'Other' });
    }
  };

  const handleEditSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSkill) {
      updateSkill(editingSkill.id, {
        title: editingSkill.title,
        description: editingSkill.description,
        rate: editingSkill.rate,
        category: editingSkill.category
      });
      setEditingSkill(null);
      // Close the modal if it's open
      setShowMySkillModal(false);
    }
  };

  const handleBookSession = (skill: Skill) => {
    setSelectedSkill(skill);
    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    if (user && selectedSkill && bookingDate) {
      const booking: Booking = {
        id: crypto.randomUUID(),
        skillId: selectedSkill.id,
        learnerId: user.id,
        teacherId: selectedSkill.userId,
        date: bookingDate,
        status: 'pending'
      };
      saveBooking(booking);
      
      addNotification(selectedSkill.userId, `New booking request for your session`, booking.id);
      
      setShowBookingModal(false);
      setSelectedSkill(null);
      setBookingDate('');
    }
  };

  const handleSkillClick = (skill: Skill) => {
    setSelectedDetailSkill(skill);
    setShowDetailModal(true);
  };

// Add this near your other handler functions
const handleMySkillClick = (skill: Skill) => {
  setSelectedMySkill(skill);
  setShowMySkillModal(true);
};

const handleDeleteSkill = (skillId: string) => {
  const skills = getSkills();
  const updatedSkills = skills.filter(skill => skill.id !== skillId);
  localStorage.setItem('skills', JSON.stringify(updatedSkills));
  setEditingSkill(null);
  setShowMySkillModal(false);
};

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800">My Skills</h2>
            <button
              onClick={() => setShowAddSkill(!showAddSkill)}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Share Your Skills
            </button>
          </div>

          {showAddSkill && (
            <form onSubmit={handleAddSkill} className="bg-gray-300 p-4 rounded-xl border border-silver/20 overflow-hidden shadow-xl mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="skill-title" className="block text-silver text-sm font-medium mb-2">Title</label>
                  <input
                    id="skill-title"
                    type="text"
                    required
                    value={newSkill.title}
                    onChange={(e) => setNewSkill({ ...newSkill, title: e.target.value })}
                    className="w-full bg-whit border border-silver/30 rounded-lg px-4 py-2 text-black focus:ring-2 focus:ring-silver focus:border-transparent"
                    placeholder="What skill will you teach?"
                    aria-label="Skill Title"
                  />
                </div>
                <div>
                  <label htmlFor="skill-category" className="block text-silver text-sm font-medium mb-2">Category</label>
                  <select
                    id="skill-category"
                    required
                    value={newSkill.category}
                    onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value as SkillCategory })}
                    className="w-full bg-whit border border-silver/30 rounded-lg px-4 py-2 text-black focus:ring-2 focus:ring-silver focus:border-transparent"
                    aria-label="Select skill category"
                  >
                    {SKILL_CATEGORIES.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="skill-description" className="block text-silver text-sm font-medium mb-2">Description</label>
                  <textarea
                    id="skill-description"
                    required
                    value={newSkill.description}
                    onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                    className="w-full bg-whit border border-silver/30 rounded-lg px-4 py-2 text-black focus:ring-2 focus:ring-silver focus:border-transparent h-32"
                    placeholder="Describe what students will learn..."
                    aria-label="Skill description"
                  />
                </div>
                <div>
                  <label htmlFor="skill-rate" className="block text-silver text-sm font-medium mb-2">Rate ($/hour)</label>
                  <input
                    id="skill-rate"
                    type="number"
                    required
                    value={newSkill.rate}
                    onChange={(e) => setNewSkill({ ...newSkill, rate: Number(e.target.value) })}
                    className="w-full bg-whit border border-silver/30 rounded-lg px-4 py-2 text-black focus:ring-2 focus:ring-silver focus:border-transparent"
                    min="0"
                    aria-label="Hourly rate"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-silver text-black font-bold rounded-lg hover:bg-gray-600 transition-colors duration-300"
                >
                  Publish Skill
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userSkills.map((skill) => (
              <div 
                key={skill.id} 
                onClick={() => handleMySkillClick(skill)}
                className="bg-white rounded-xl border border-silver/20 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer p-4"
              >
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 w-fit">
                      {skill.category}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSkill(skill);
                      }}
                      className="p-1 text-indigo-600 hover:text-indigo-800"
                      aria-label="Edit skill"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mt-2 line-clamp-1">{skill.title}</h3>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{skill.description}</p>
                  <div className="flex items-center mt-auto pt-2">
                    <span className="inline-flex items-center text-indigo-600">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {skill.rate}/hour
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
                                       {/* Discover Skills Component */}
          <div className="mt-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-6 md:mb-0">Discover Skills</h2>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-3 w-full md:w-64 rounded-lg bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="relative flex-1 md:flex-none">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as SkillCategory | 'all')}
                    className="pl-12 pr-4 py-3 w-full md:w-48 rounded-lg bg-white border border-slate-300 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    aria-label="Filter by category"
                  >
                  <option value="all">All Categories</option>
                  {SKILL_CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map((skill) => (
              <div 
                key={skill.id} 
                onClick={() => handleSkillClick(skill)}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 card-hover cursor-pointer p-4"
              >
                <div className="flex flex-col h-full">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 w-fit">
                    {skill.category}
                  </span>
                  <h3 className="text-lg font-semibold text-slate-800 mt-2 line-clamp-1">{skill.title}</h3>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{skill.description}</p>
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="text-sm font-semibold text-silver">${skill.rate}/hr</span>
                    <span className="text-xs text-silver">By {getAuthorName(skill.userId)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {showDetailModal && selectedDetailSkill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full border border-slate-200 shadow-xl m-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mb-2">
                    {selectedDetailSkill.category}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-800">{selectedDetailSkill.title}</h3>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-slate-600">{selectedDetailSkill.description}</p>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-silver" />
                  <span className="text-silver">60 min</span>
                </div>
                <span className="text-xl font-semibold text-silver">${selectedDetailSkill.rate}/hr</span>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-silver font-semibold capitalize">
                  By {getAuthorName(selectedDetailSkill.userId)}
                </p>
                <button
                  onClick={() => {
                    handleBookSession(selectedDetailSkill);
                    setShowDetailModal(false);
                  }}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300"
                >
                  <Book className="h-4 w-4 mr-2" />
                  Book Now
                </button>
              </div>
            </div>
          </div>
        )}

        {showBookingModal && selectedSkill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full border border-slate-200 shadow-xl">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Book Session</h3>
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-2">{selectedSkill.title}</h4>
                <p className="text-slate-600">{selectedSkill.description}</p>
              </div>
              <div className="mb-6">
                <label className="block text-slate-800 text-sm font-medium mb-2">
                  Select Date and Time
                </label>
                  <input
                    type="datetime-local"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-white border border-silver/30 rounded-lg px-4 py-2 text-black focus:ring-2 focus:ring-silver focus:border-transparent"
                    aria-label="Select booking date and time"
                  />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedSkill(null);
                  }}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBooking}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add this before the existing modals */}
        {showMySkillModal && selectedMySkill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full border border-slate-200 shadow-xl m-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mb-2">
                    {selectedMySkill.category}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-800">{selectedMySkill.title}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingSkill(selectedMySkill);
                      setShowMySkillModal(false);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-full text-indigo-600"
                    aria-label="Edit skill"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setShowMySkillModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-full"
                  >
                    <X className="h-5 w-5 text-slate-400" />
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-slate-600">{selectedMySkill.description}</p>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-silver" />
                  <span className="text-silver">60 min</span>
                </div>
                <div className="flex items-center text-indigo-600">
                  <DollarSign className="h-5 w-5 mr-1" />
                  <span className="text-xl font-semibold">${selectedMySkill.rate}/hr</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add this edit form modal */}
        {editingSkill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-200 rounded-xl p-8 max-w-2xl w-full border border-slate-200 shadow-xl m-4">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-slate-800">Edit Skill</h3>
                <button
                  onClick={() => setEditingSkill(null)}
                  className="p-2 hover:bg-slate-100 rounded-full"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleEditSkill}>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="edit-title" className="block text-slate-800 text-sm font-medium mb-2">Title</label>
                    <input
                      id="edit-title"
                      type="text"
                      value={editingSkill.title}
                      onChange={(e) => setEditingSkill({ ...editingSkill, title: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-category" className="block text-slate-800 text-sm font-medium mb-2">Category</label>
                    <select
                      id="edit-category"
                      value={editingSkill.category}
                      onChange={(e) => setEditingSkill({ ...editingSkill, category: e.target.value as SkillCategory })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      {SKILL_CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="edit-description" className="block text-slate-800 text-sm font-medium mb-2">Description</label>
                    <textarea
                      id="edit-description"
                      value={editingSkill.description}
                      onChange={(e) => setEditingSkill({ ...editingSkill, description: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-32"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-rate" className="block text-slate-800 text-sm font-medium mb-2">Rate ($/hour)</label>
                    <input
                      id="edit-rate"
                      type="number"
                      value={editingSkill.rate}
                      onChange={(e) => setEditingSkill({ ...editingSkill, rate: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-8 ">
                  <button
                    type="button"
                    onClick={() => handleDeleteSkill(editingSkill.id)}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Skill
                  </button>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setEditingSkill(null)}
                      className="px-4 py-2 text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};