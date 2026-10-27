import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type {
  ChatMessage,
  Community,
  CommunityCategory
} from '../types/index.ts';
import {
  addMessageReaction,
  createCommunity,
  loadCommunities,
  loadMessages,
  loadResources,
  loadStudentProfile,
  sendChatMessage,
  toggleJoinCommunity
} from '../utilities/storage.ts';

export const CommunitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<Community[]>(loadCommunities());
  const [activeCommunityId, setActiveCommunityId] = useState<string>(
    communities.find((c) => c.isJoined)?.id || communities[0]?.id || ''
  );
  const [activeChannelId, setActiveChannelId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages());
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [showAttachResource, setShowAttachResource] = useState(false);
  const [selectedResourceUrl, setSelectedResourceUrl] = useState('');
  const [selectedResourceTitle, setSelectedResourceTitle] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommName, setNewCommName] = useState('');
  const [newCommCategory, setNewCommCategory] = useState<CommunityCategory>('Web Development');
  const [newCommDesc, setNewCommDesc] = useState('');
  const [newCommIcon, setNewCommIcon] = useState('💡');
  const [newCommGoal, setNewCommGoal] = useState('');
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const student = loadStudentProfile();
  const allResources = loadResources();

  // Selected community
  const activeCommunity = communities.find((c) => c.id === activeCommunityId) || communities[0];

  // Derive active channel directly
  const activeChannel =
    activeCommunity?.channels.find((ch) => ch.id === activeChannelId) ||
    activeCommunity?.channels.find((ch) => ch.isDefault) ||
    activeCommunity?.channels[0];

  const currentChannelId = activeChannel?.id || '';

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentChannelId]);

  // Filter messages for current channel
  const channelMessages = messages.filter(
    (m) => m.communityId === activeCommunityId && m.channelId === currentChannelId
  );

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !selectedResourceUrl) return;

    const resourceLink = selectedResourceUrl
      ? {
          title: selectedResourceTitle || selectedResourceUrl,
          url: selectedResourceUrl
        }
      : undefined;

    const newMsg = sendChatMessage({
      communityId: activeCommunityId,
      channelId: currentChannelId,
      content: inputText.trim(),
      replyToId: replyingTo ? replyingTo.id : undefined,
      resourceLink
    });

    setMessages([...messages, newMsg]);
    setInputText('');
    setReplyingTo(null);
    setShowAttachResource(false);
    setSelectedResourceUrl('');
    setSelectedResourceTitle('');
  };

  const handleReaction = (messageId: string, emoji: string) => {
    addMessageReaction(messageId, emoji);
    setMessages(loadMessages());
  };

  const handleCreateCommunitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommName.trim()) return;

    const created = createCommunity({
      name: newCommName.trim(),
      category: newCommCategory,
      description: newCommDesc.trim() || 'Collaborative student study circle.',
      icon: newCommIcon || '📚',
      activeStudyGoal: newCommGoal.trim() || 'Active study group sprint'
    });

    setCommunities(loadCommunities());
    setActiveCommunityId(created.id);
    setShowCreateModal(false);
    setNewCommName('');
    setNewCommDesc('');
    setNewCommGoal('');
  };

  const handleToggleJoin = (id: string) => {
    const updated = toggleJoinCommunity(id);
    setCommunities(updated);
  };

  const joinedCommunities = communities.filter((c) => c.isJoined);

  return (
    <div className="discord-app-layout">
      {/* 1. Leftmost Server Rail */}
      <aside className="server-rail" aria-label="Joined study communities">
        <button
          className={`server-icon-btn ${activeCommunityId === joinedCommunities[0]?.id ? 'active' : ''}`}
          onClick={() => setActiveCommunityId(joinedCommunities[0]?.id || '')}
          title="SkillForge Home Server"
        >
          <span className="server-icon-symbol">⚡</span>
        </button>

        <div className="server-rail-divider" />

        {/* Joined Communities */}
        <div className="server-icons-scroll">
          {joinedCommunities.map((comm) => (
            <button
              key={comm.id}
              className={`server-icon-btn ${comm.id === activeCommunityId ? 'active' : ''}`}
              onClick={() => setActiveCommunityId(comm.id)}
              title={`${comm.name} (${comm.category})`}
            >
              <span className="server-icon-symbol">{comm.icon}</span>
              {comm.id === activeCommunityId && <span className="active-pill" />}
            </button>
          ))}
        </div>

        <div className="server-rail-divider" />

        {/* Add Community Button */}
        <button
          className="server-action-btn add-server-btn"
          onClick={() => setShowCreateModal(true)}
          title="Create a new Study Circle"
        >
          <span>+</span>
        </button>

        {/* Discover Communities Button */}
        <Link to="/discover" className="server-action-btn discover-btn" title="Discover Public Communities">
          <span>🧭</span>
        </Link>
      </aside>

      {/* 2. Channels Sidebar */}
      <aside className="channels-sidebar">
        {/* Community Header */}
        <header className="community-sidebar-header">
          <div className="community-title-row">
            <span className="comm-icon-lg">{activeCommunity?.icon}</span>
            <div>
              <h2 className="comm-name">{activeCommunity?.name}</h2>
              <span className="comm-category-pill">{activeCommunity?.category}</span>
            </div>
          </div>
          <div className="community-meta-row">
            <span className="member-count">👥 {activeCommunity?.memberCount} members</span>
            {!activeCommunity?.isJoined && (
              <button
                className="btn btn-sm btn-primary join-action-btn"
                onClick={() => handleToggleJoin(activeCommunity.id)}
              >
                Join Server
              </button>
            )}
          </div>
          {activeCommunity?.activeStudyGoal && (
            <div className="community-goal-box">
              <span className="goal-icon">🎯</span>
              <span className="goal-text">{activeCommunity.activeStudyGoal}</span>
            </div>
          )}
        </header>

        {/* Channel Navigation */}
        <div className="channels-list">
          <div className="channel-group-header">
            <span>TEXT & DISCUSSION CHANNELS</span>
          </div>
          {activeCommunity?.channels
            .filter((ch) => ch.type !== 'study-room')
            .map((ch) => (
              <button
                key={ch.id}
                className={`channel-item-btn ${ch.id === currentChannelId ? 'channel-active' : ''}`}
                onClick={() => setActiveChannelId(ch.id)}
              >
                <span className="channel-prefix">
                  {ch.type === 'doubts' ? '❓' : ch.type === 'resources' ? '📌' : ch.type === 'project-help' ? '🛠️' : '#'}
                </span>
                <span className="channel-name">{ch.name}</span>
              </button>
            ))}

          <div className="channel-group-header" style={{ marginTop: '1rem' }}>
            <span>FOCUS & STUDY ROOMS</span>
          </div>
          {activeCommunity?.channels
            .filter((ch) => ch.type === 'study-room')
            .map((ch) => (
              <button
                key={ch.id}
                className={`channel-item-btn channel-room ${ch.id === currentChannelId ? 'channel-active' : ''}`}
                onClick={() => setActiveChannelId(ch.id)}
              >
                <span className="channel-prefix">🎧</span>
                <span className="channel-name">{ch.name}</span>
                <span className="room-live-indicator">LIVE</span>
              </button>
            ))}
        </div>

        {/* User Status Bar */}
        <footer className="user-status-bar">
          <div className="user-status-avatar">{student.avatar || '🎓'}</div>
          <div className="user-status-details">
            <span className="user-status-name">{student.name}</span>
            <span className="user-status-role">Student • Online</span>
          </div>
          <button
            className="user-status-action"
            onClick={() => navigate('/profile')}
            title="Manage Profile & Settings"
          >
            ⚙️
          </button>
        </footer>
      </aside>

      {/* 3. Central Chat & Discussion Area */}
      <section className="chat-main-area">
        {/* Channel Header Bar */}
        <header className="chat-header">
          <div className="chat-header-title-box">
            <span className="chat-header-hash">
              {activeChannel?.type === 'study-room' ? '🎧' : '#'}
            </span>
            <span className="chat-header-name">{activeChannel?.name || 'select-channel'}</span>
            <span className="chat-header-divider">|</span>
            <span className="chat-header-desc">{activeChannel?.description}</span>
          </div>
          <div className="chat-header-actions">
            {activeChannel?.type === 'study-room' && (
              <Link to="/focus" className="btn btn-sm btn-primary">
                Open Focus Timer
              </Link>
            )}
            <button
              className={`toggle-details-btn ${rightPanelOpen ? 'active' : ''}`}
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              title="Toggle Group Info & Resources Panel"
            >
              📋
            </button>
          </div>
        </header>

        {/* Local Demo Disclaimer Banner */}
        <div className="demo-mode-notice">
          <span>
            ℹ️ <strong>Local Demo Mode:</strong> Messages and interactions persist in your browser localStorage. Real-time multi-device synchronization is not connected in this prototype.
          </span>
        </div>

        {/* Message Stream */}
        <div className="chat-messages-container">
          {/* Welcome Message at top of channel */}
          <div className="channel-welcome-banner">
            <div className="channel-welcome-icon">
              {activeChannel?.type === 'study-room' ? '🎧' : '#'}
            </div>
            <h2>Welcome to #{activeChannel?.name}!</h2>
            <p>
              This is the start of the #{activeChannel?.name} channel in <strong>{activeCommunity?.name}</strong>.
              Collaborate with peers, ask questions, and share study insights.
            </p>
          </div>

          {channelMessages.map((msg) => {
            const repliedMessage = msg.replyToId
              ? messages.find((m) => m.id === msg.replyToId)
              : null;

            return (
              <article key={msg.id} className="chat-message-row">
                {/* Reply quote indicator */}
                {repliedMessage && (
                  <div className="reply-quote-bar">
                    <span className="reply-arrow">↳</span>
                    <span className="reply-author">@{repliedMessage.authorName}:</span>
                    <span className="reply-snippet">
                      {repliedMessage.content.slice(0, 75)}...
                    </span>
                  </div>
                )}

                <div className="message-content-wrapper">
                  <div className="message-avatar">{msg.authorAvatar || '👤'}</div>
                  <div className="message-body">
                    <header className="message-meta">
                      <span className="message-author">{msg.authorName}</span>
                      {msg.authorRole && (
                        <span className={`role-badge role-${msg.authorRole.toLowerCase()}`}>
                          {msg.authorRole}
                        </span>
                      )}
                      <time className="message-timestamp">{msg.timestamp}</time>
                    </header>

                    <div className="message-text">{msg.content}</div>

                    {/* Resource link card if present */}
                    {msg.resourceLink && (
                      <div className="message-resource-card">
                        <span className="resource-card-icon">📌</span>
                        <div className="resource-card-info">
                          <span className="resource-card-label">Shared Resource</span>
                          <a
                            href={msg.resourceLink.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="resource-card-title"
                          >
                            {msg.resourceLink.title} ↗
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Reactions & Reply Row */}
                    <footer className="message-footer">
                      <div className="reactions-list">
                        {Object.entries(msg.reactions || {}).map(([emoji, count]) => (
                          <button
                            key={emoji}
                            className="reaction-pill"
                            onClick={() => handleReaction(msg.id, emoji)}
                          >
                            <span>{emoji}</span>
                            <span className="reaction-count">{count}</span>
                          </button>
                        ))}
                      </div>

                      <div className="message-actions-hover">
                        <button
                          className="reaction-quick-btn"
                          onClick={() => handleReaction(msg.id, '❤️')}
                          title="React with Love"
                        >
                          ❤️
                        </button>
                        <button
                          className="reaction-quick-btn"
                          onClick={() => handleReaction(msg.id, '💡')}
                          title="React with Idea"
                        >
                          💡
                        </button>
                        <button
                          className="reaction-quick-btn"
                          onClick={() => handleReaction(msg.id, '🔥')}
                          title="React with Fire"
                        >
                          🔥
                        </button>
                        <button
                          className="reply-btn"
                          onClick={() => setReplyingTo(msg)}
                          title="Reply to message"
                        >
                          💬 Reply
                        </button>
                      </div>
                    </footer>
                  </div>
                </div>
              </article>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Box */}
        <div className="chat-input-wrapper">
          {/* Replying banner */}
          {replyingTo && (
            <div className="replying-banner">
              <span>Replying to <strong>@{replyingTo.authorName}</strong></span>
              <button className="cancel-reply-btn" onClick={() => setReplyingTo(null)}>
                ✕
              </button>
            </div>
          )}

          {/* Attached resource preview */}
          {selectedResourceUrl && (
            <div className="attached-resource-preview">
              <span>Attached: <strong>{selectedResourceTitle || selectedResourceUrl}</strong></span>
              <button
                className="remove-attached-btn"
                onClick={() => {
                  setSelectedResourceUrl('');
                  setSelectedResourceTitle('');
                }}
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="chat-input-form">
            <button
              type="button"
              className="attach-btn"
              onClick={() => setShowAttachResource(!showAttachResource)}
              title="Attach a learning resource"
            >
              📎
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message #${activeChannel?.name || 'channel'}...`}
              className="chat-text-input"
            />

            <button
              type="submit"
              className="send-msg-btn"
              disabled={!inputText.trim() && !selectedResourceUrl}
            >
              Send ↵
            </button>
          </form>

          {/* Attach Resource Popover */}
          {showAttachResource && (
            <div className="attach-resource-popover">
              <div className="popover-header">
                <strong>Attach Resource from Library</strong>
                <button onClick={() => setShowAttachResource(false)}>✕</button>
              </div>
              <div className="popover-resource-list">
                {allResources.map((res) => (
                  <button
                    key={res.id}
                    type="button"
                    className="popover-resource-item"
                    onClick={() => {
                      setSelectedResourceUrl(res.url);
                      setSelectedResourceTitle(res.title);
                      setShowAttachResource(false);
                    }}
                  >
                    <span className="res-icon">📖</span>
                    <span className="res-title">{res.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. Right Side Drawer: Details, Pinned Resources & Study Activity */}
      {rightPanelOpen && (
        <aside className="group-details-sidebar">
          <header className="details-header">
            <h3>Community Info</h3>
          </header>

          <div className="details-body">
            {/* About Card */}
            <section className="details-section">
              <h4>About</h4>
              <p className="details-desc">{activeCommunity?.description}</p>
              <div className="details-badge-row">
                <span className="cat-badge">{activeCommunity?.category}</span>
                <span className="member-badge">👥 {activeCommunity?.memberCount} Members</span>
              </div>
            </section>

            {/* Active Study Sprint */}
            <section className="details-section">
              <h4>Active Focus Goal</h4>
              <div className="active-goal-card">
                <span className="goal-badge-icon">🎯</span>
                <p>{activeCommunity?.activeStudyGoal || 'Collaborative daily study'}</p>
              </div>
              <Link to="/focus" className="btn btn-secondary btn-block" style={{ marginTop: '0.5rem' }}>
                Start 25m Focus Session
              </Link>
            </section>

            {/* Pinned Resources */}
            <section className="details-section">
              <h4>Pinned Study Resources</h4>
              <div className="pinned-resources-list">
                {allResources.slice(0, 3).map((res) => (
                  <div key={res.id} className="pinned-res-item">
                    <span className="pinned-icon">📌</span>
                    <div className="pinned-text">
                      <a href={res.url} target="_blank" rel="noopener noreferrer">
                        {res.title}
                      </a>
                      <span className="pinned-category">{res.category}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/tools" className="view-all-tools-link">
                Explore Full Study Toolkit →
              </Link>
            </section>

            {/* Active Study Peers */}
            <section className="details-section">
              <h4>Online Co-Studiers (4)</h4>
              <ul className="online-peers-list">
                <li className="peer-item">
                  <span className="peer-avatar">👩‍💻</span>
                  <div className="peer-info">
                    <span className="peer-name">Ananya Sharma</span>
                    <span className="peer-status">Focusing on HTML Forms</span>
                  </div>
                </li>
                <li className="peer-item">
                  <span className="peer-avatar">👨‍💻</span>
                  <div className="peer-info">
                    <span className="peer-name">Rohan Patel</span>
                    <span className="peer-status">Practicing Flexbox layout</span>
                  </div>
                </li>
                <li className="peer-item">
                  <span className="peer-avatar">🧑‍🎓</span>
                  <div className="peer-info">
                    <span className="peer-name">Marcus Chen</span>
                    <span className="peer-status">Mentor • Office hours</span>
                  </div>
                </li>
                <li className="peer-item">
                  <span className="peer-avatar">🎓</span>
                  <div className="peer-info">
                    <span className="peer-name">{student.name} (You)</span>
                    <span className="peer-status">Active in #{activeChannel?.name}</span>
                  </div>
                </li>
              </ul>
            </section>
          </div>
        </aside>
      )}

      {/* Modal: Create Study Circle */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <header className="modal-header">
              <h3>Create a Study Circle</h3>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                ✕
              </button>
            </header>
            <form onSubmit={handleCreateCommunitySubmit} className="modal-form">
              <div className="form-group">
                <label>Community Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. React & TypeScript Explorers"
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
                  placeholder="What is this community studying together?"
                  value={newCommDesc}
                  onChange={(e) => setNewCommDesc(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Active Study Sprint / Goal</label>
                <input
                  type="text"
                  placeholder="e.g. Build 3 mini portfolio projects this month"
                  value={newCommGoal}
                  onChange={(e) => setNewCommGoal(e.target.value)}
                />
              </div>

              <footer className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Study Circle (+100 XP)
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
