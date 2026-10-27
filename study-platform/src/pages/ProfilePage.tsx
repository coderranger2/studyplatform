import React, { useState } from 'react';
import type { StudentProfile } from '../types/index.ts';
import {
  loadGamificationState,
  loadReportedItems,
  loadResources,
  loadStudentProfile,
  loadUserProgress,
  saveStudentProfile,
  toggleSaveResource,
  updateReportStatus
} from '../utilities/storage.ts';

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfile>(loadStudentProfile());
  const [gamification] = useState(loadGamificationState());
  const [progress] = useState(loadUserProgress());
  const [resources, setResources] = useState(loadResources());
  const [reports, setReports] = useState(loadReportedItems());
  const [activeTab, setActiveTab] = useState<'profile' | 'saved' | 'moderation'>('profile');

  // Form state
  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle);
  const [avatar, setAvatar] = useState(profile.avatar || '🎓');
  const [bio, setBio] = useState(profile.bio);
  const [primaryGoal, setPrimaryGoal] = useState(profile.primaryGoal);
  const [targetRole, setTargetRole] = useState(profile.targetExamOrRole);
  const [interests, setInterests] = useState<string[]>(profile.interests || []);
  const [newInterestInput, setNewInterestInput] = useState('');
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  const savedResources = resources.filter((r) => r.isSaved);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StudentProfile = {
      name: name.trim() || 'Student',
      handle: handle.trim() || '@learner',
      avatar: avatar.trim() || '🎓',
      bio: bio.trim(),
      primaryGoal: primaryGoal.trim(),
      interests,
      targetExamOrRole: targetRole.trim()
    };

    saveStudentProfile(updated);
    setProfile(updated);
    setSavedFeedback('Profile settings saved successfully!');
    setTimeout(() => setSavedFeedback(null), 4000);
  };

  const handleAddInterest = () => {
    if (newInterestInput.trim() && !interests.includes(newInterestInput.trim())) {
      setInterests([...interests, newInterestInput.trim()]);
      setNewInterestInput('');
    }
  };

  const handleRemoveInterest = (item: string) => {
    setInterests(interests.filter((i) => i !== item));
  };

  const handleToggleRemoveResource = (id: string) => {
    const updated = toggleSaveResource(id);
    setResources(updated);
  };

  const handleReportAction = (reportId: string, status: 'resolved' | 'dismissed') => {
    updateReportStatus(reportId, status);
    setReports(loadReportedItems());
  };

  return (
    <div className="page profile-page">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Student Profile & Settings</h1>
          <p className="page-subtitle">
            Manage your personal learning goals, target exam preparation, bookmarked resources, and view moderation tools.
          </p>
        </div>
      </header>

      {/* Navigation tabs */}
      <nav className="toolkit-tab-bar" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`toolkit-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <span>👤</span> Personal Profile
        </button>
        <button
          className={`toolkit-tab ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          <span>★</span> Saved Resources ({savedResources.length})
        </button>
        <button
          className={`toolkit-tab ${activeTab === 'moderation' ? 'active' : ''}`}
          onClick={() => setActiveTab('moderation')}
        >
          <span>🛡️</span> Admin Moderation ({reports.filter((r) => r.status === 'pending').length})
        </button>
      </nav>

      {savedFeedback && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <span>✓ {savedFeedback}</span>
        </div>
      )}

      {/* ========================================================
          TAB 1: PROFILE
          ======================================================== */}
      {activeTab === 'profile' && (
        <div className="profile-layout-grid">
          {/* Profile Card Preview */}
          <aside className="profile-preview-card">
            <div className="preview-avatar">{avatar}</div>
            <h2 className="preview-name">{name}</h2>
            <span className="preview-handle">{handle}</span>
            <p className="preview-bio">{bio}</p>

            <div className="preview-stats-row">
              <div className="stat-pill">
                <strong>⚡ {gamification.xp}</strong>
                <span>XP Points</span>
              </div>
              <div className="stat-pill">
                <strong>Lvl {gamification.level}</strong>
                <span>Tier Level</span>
              </div>
              <div className="stat-pill">
                <strong>🔥 {gamification.streakDays}d</strong>
                <span>Streak</span>
              </div>
              <div className="stat-pill">
                <strong>{progress.completedActivityIds.length}</strong>
                <span>Milestones</span>
              </div>
            </div>

            <div className="preview-goal-box">
              <span className="goal-icon">🎯</span>
              <div className="goal-info">
                <span className="goal-label">Primary Goal</span>
                <span className="goal-val">{primaryGoal}</span>
              </div>
            </div>

            <div className="preview-target-role">
              <strong>Target Role / Exam:</strong> {targetRole}
            </div>

            <div className="preview-interests">
              <strong>Study Interests:</strong>
              <div className="interest-chips">
                {interests.map((item) => (
                  <span key={item} className="chip">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </aside>

          {/* Edit Form */}
          <section className="profile-edit-card">
            <h3>Edit Learning Profile</h3>
            <form onSubmit={handleSaveProfile} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Display Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Handle</label>
                  <input
                    type="text"
                    required
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Avatar Emoji / Symbol</label>
                <div className="avatar-picker-row">
                  {['🎓', '👩‍💻', '👨‍💻', '⚡', '🚀', '🧠', '🦉', '💡'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      className={`avatar-choice-btn ${avatar === em ? 'active' : ''}`}
                      onClick={() => setAvatar(em)}
                    >
                      {em}
                    </button>
                  ))}
                  <input
                    type="text"
                    maxLength={2}
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    style={{ width: '60px', textAlign: 'center' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Bio / Background</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short summary of your background and study objectives..."
                />
              </div>

              <div className="form-group">
                <label>Primary Learning Target</label>
                <input
                  type="text"
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value)}
                  placeholder="e.g. Master fullstack frontend web architecture"
                />
              </div>

              <div className="form-group">
                <label>Target Internship, Career Role, or Exam</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Junior Frontend Engineer 2027"
                />
              </div>

              <div className="form-group">
                <label>Study Interests & Skill Focus</label>
                <div className="interest-input-row">
                  <input
                    type="text"
                    placeholder="Add an interest (e.g. CSS Grid, React, Algorithms)..."
                    value={newInterestInput}
                    onChange={(e) => setNewInterestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInterest();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleAddInterest}
                  >
                    + Add
                  </button>
                </div>

                <div className="editable-chips-list">
                  {interests.map((item) => (
                    <span key={item} className="editable-chip">
                      {item}
                      <button
                        type="button"
                        onClick={() => handleRemoveInterest(item)}
                        aria-label={`Remove ${item}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block">
                Save Profile Changes 💾
              </button>
            </form>
          </section>
        </div>
      )}

      {/* ========================================================
          TAB 2: SAVED RESOURCES
          ======================================================== */}
      {activeTab === 'saved' && (
        <section className="saved-resources-tab">
          <div className="section-header">
            <h2>Your Bookmarked Learning Materials ({savedResources.length})</h2>
            <p>Resources saved from the Study Toolkit and Community channels for fast access.</p>
          </div>

          {savedResources.length === 0 ? (
            <div className="empty-state-box">
              <p>You haven't bookmarked any resources yet. Explore the Study Toolkit to save items!</p>
            </div>
          ) : (
            <div className="resources-grid">
              {savedResources.map((res) => (
                <article key={res.id} className="resource-card">
                  <div className="res-card-top">
                    <span className="res-badge">{res.category}</span>
                    <button
                      className="bookmark-btn bookmarked"
                      onClick={() => handleToggleRemoveResource(res.id)}
                      title="Remove from saved collection"
                    >
                      ★ Remove
                    </button>
                  </div>
                  <h3 className="res-title">
                    <a href={res.url} target="_blank" rel="noopener noreferrer">
                      {res.title} ↗
                    </a>
                  </h3>
                  <p className="res-desc">{res.description}</p>
                  <div className="res-actions-row">
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline"
                    >
                      Open Link ↗
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ========================================================
          TAB 3: ADMIN MODERATION PROTOTYPE
          ======================================================== */}
      {activeTab === 'moderation' && (
        <section className="moderation-tab">
          <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
            <span>
              🛡️ <strong>Demonstration Moderation Queue:</strong> Review reported content items, flags, and complaints to ensure a safe, collaborative study environment.
            </span>
          </div>

          <div className="reports-list">
            {reports.map((rep) => (
              <article key={rep.id} className="report-card">
                <div className="report-header">
                  <span className={`status-pill status-${rep.status}`}>
                    {rep.status.toUpperCase()}
                  </span>
                  <span className="report-type">Type: {rep.type}</span>
                  <span className="report-date">Reported on {rep.reportedAt} by {rep.reportedBy}</span>
                </div>

                <div className="report-body">
                  <div className="report-reason">
                    <strong>Reported Reason:</strong> {rep.reason}
                  </div>
                  <div className="report-content-box">
                    <strong>Flagged Content:</strong>
                    <p>{rep.targetContent}</p>
                  </div>

                  {rep.status === 'pending' && (
                    <div className="report-actions">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleReportAction(rep.id, 'resolved')}
                      >
                        ✓ Take Down & Resolve
                      </button>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => handleReportAction(rep.id, 'dismissed')}
                      >
                        Dismiss Flag
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
