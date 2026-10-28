import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Community, CommunityCategory } from '../types/index.ts';
import { createCommunity, loadCommunities, toggleJoinCommunity } from '../utilities/storage.ts';
import { showToast } from '../components/common/Toast.tsx';

export const DiscoverPage: React.FC = () => {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<Community[]>(loadCommunities());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newCommName, setNewCommName] = useState('');
  const [newCommCategory, setNewCommCategory] = useState<CommunityCategory>('Web Development');
  const [newCommDesc, setNewCommDesc] = useState('');
  const [newCommIcon, setNewCommIcon] = useState('🌟');
  const [newCommGoal, setNewCommGoal] = useState('');

  const categories: Array<string> = [
    'All',
    'Web Development',
    'Programming',
    'College Subjects',
    'Competitive Exams',
    'General Study'
  ];

  const filteredCommunities = communities.filter((comm) => {
    const matchesCategory =
      selectedCategory === 'All' || comm.category === selectedCategory;
    const matchesSearch =
      comm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.activeStudyGoal?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToggleJoin = (id: string) => {
    const target = communities.find((c) => c.id === id);
    const updated = toggleJoinCommunity(id);
    setCommunities(updated);
    const isNowJoined = updated.find((c) => c.id === id)?.isJoined;
    if (isNowJoined) {
      showToast(`Joined ${target?.name || 'community'}! (+30 XP)`, 'success');
    } else {
      showToast(`Left ${target?.name || 'community'}.`, 'info');
    }
  };

  const handleCreateCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommName.trim()) return;

    const created = createCommunity({
      name: newCommName.trim(),
      category: newCommCategory,
      description: newCommDesc.trim(),
      icon: newCommIcon || '🚀',
      activeStudyGoal: newCommGoal.trim()
    });

    setCommunities(loadCommunities());
    setShowCreateModal(false);
    showToast(`🎉 Created and joined "${created.name}"! (+100 XP)`, 'success');
    navigate(`/?community=${created.id}`);
  };

  return (
    <div className="page discover-page">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Discover Study Communities</h1>
          <p className="page-subtitle">
            Find active study groups, join focused peer cohorts, and collaborate on subjects that matter to your learning journey.
          </p>
        </div>
        <div className="page-header-actions">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            + Create Study Group
          </button>
        </div>
      </header>

      {/* Search and Filters Bar */}
      <section className="discover-controls">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search communities by topic, subject, or study goal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="category-chips">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`chip ${selectedCategory === cat ? 'chip-active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Community Grid */}
      <section className="communities-grid">
        {filteredCommunities.map((comm) => (
          <article key={comm.id} className="discover-card">
            <div className="card-top">
              <span className="comm-icon">{comm.icon}</span>
              <div className="card-heading">
                <h3>{comm.name}</h3>
                <span className="cat-tag">{comm.category}</span>
              </div>
            </div>

            <p className="card-desc">{comm.description}</p>

            {comm.activeStudyGoal && (
              <div className="card-goal">
                <span className="goal-icon">🎯</span>
                <span className="goal-text">{comm.activeStudyGoal}</span>
              </div>
            )}

            <div className="card-footer">
              <div className="stats">
                <span>👥 {comm.memberCount} members</span>
                <span>•</span>
                <span>💬 {comm.channels.length} channels</span>
              </div>

              <div className="card-actions">
                <button
                  className={`btn btn-sm ${comm.isJoined ? 'btn-outline' : 'btn-primary'}`}
                  onClick={() => handleToggleJoin(comm.id)}
                >
                  {comm.isJoined ? 'Joined ✓' : 'Join Group'}
                </button>
                {comm.isJoined && (
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => navigate(`/?community=${comm.id}`)}
                  >
                    Open Chat 💬
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Modal: Create Study Group */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <header className="modal-header">
              <h3>Create a Study Circle</h3>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                ✕
              </button>
            </header>
            <form onSubmit={handleCreateCommunity} className="modal-form">
              <div className="form-group">
                <label>Community Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Competitive Programming Squad"
                  value={newCommName}
                  onChange={(e) => setNewCommName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={newCommCategory}
                  onChange={(e) => setNewCommCategory(e.target.value as CommunityCategory)}
                >
                  <option value="Web Development">Web Development</option>
                  <option value="Programming">Programming</option>
                  <option value="College Subjects">College Subjects</option>
                  <option value="Competitive Exams">Competitive Exams</option>
                  <option value="General Study">General Study</option>
                </select>
              </div>

              <div className="form-group">
                <label>Icon Emoji</label>
                <input
                  type="text"
                  maxLength={2}
                  value={newCommIcon}
                  onChange={(e) => setNewCommIcon(e.target.value)}
                  style={{ width: '80px' }}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="What is your group aiming to achieve?"
                  value={newCommDesc}
                  onChange={(e) => setNewCommDesc(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Active Study Sprint / Goal</label>
                <input
                  type="text"
                  placeholder="e.g. Complete 30 LeetCode Mediums before finals"
                  value={newCommGoal}
                  onChange={(e) => setNewCommGoal(e.target.value)}
                />
              </div>

              <footer className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create & Launch Circle (+100 XP)
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
