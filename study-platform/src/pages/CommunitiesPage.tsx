import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type {
  ChannelType,
  ChatMessage,
  Community,
  CommunityCategory,
  StudyResource
} from '../types/index.ts';
import {
  awardXP,
  createChannel,
  createCommunity,
  loadCommunities,
  loadMessages,
  loadResources,
  loadStudentProfile,
  loadUserReactions,
  sendBuddyRequest,
  sendChatMessage,
  toggleJoinCommunity,
  toggleMessageReaction,
  toggleSaveResource,
  updateCommunityGoal
} from '../utilities/storage.ts';
import { showToast } from '../components/common/Toast.tsx';

export const CommunitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedCommId = searchParams.get('community');
  const requestedChannelId = searchParams.get('channel');

  const [communities, setCommunities] = useState<Community[]>(() => {
    const list = loadCommunities();
    if (requestedCommId) {
      const match = list.find((c) => c.id === requestedCommId);
      if (match && !match.isJoined) {
        return toggleJoinCommunity(requestedCommId);
      }
    }
    return list;
  });

  const [activeCommunityId, setActiveCommunityId] = useState<string>(() => {
    return requestedCommId || communities.find((c) => c.isJoined)?.id || communities[0]?.id || '';
  });

  const [activeChannelId, setActiveChannelId] = useState<string>(() => {
    if (requestedChannelId) return requestedChannelId;
    const comm = communities.find((c) => c.id === (requestedCommId || communities.find((k) => k.isJoined)?.id || communities[0]?.id));
    return comm?.channels.find((ch) => ch.isDefault)?.id || comm?.channels[0]?.id || '';
  });

  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages());
  const [userReactions, setUserReactions] = useState<Record<string, string[]>>(loadUserReactions());
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [showAttachResource, setShowAttachResource] = useState(false);
  const [selectedResourceUrl, setSelectedResourceUrl] = useState('');
  const [selectedResourceTitle, setSelectedResourceTitle] = useState('');

  // Modal: Create Server or Channel
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalTab, setCreateModalTab] = useState<'server' | 'channel'>('server');
  const [newCommName, setNewCommName] = useState('');
  const [newCommCategory, setNewCommCategory] = useState<CommunityCategory>('Web Development');
  const [newCommDesc, setNewCommDesc] = useState('');
  const [newCommIcon, setNewCommIcon] = useState('💡');
  const [newCommGoal, setNewCommGoal] = useState('');

  // Channel Creation State
  const [newChanName, setNewChanName] = useState('');
  const [newChanType, setNewChanType] = useState<ChannelType>('text');
  const [newChanDesc, setNewChanDesc] = useState('');

  // Right Panel Drawer & Widgets State
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [allResources, setAllResources] = useState<StudyResource[]>(loadResources());
  const [showPinResourceModal, setShowPinResourceModal] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editedGoalText, setEditedGoalText] = useState('');
  const [selectedPeerProfile, setSelectedPeerProfile] = useState<{
    name: string;
    avatar: string;
    role: string;
    status: string;
    complementarySkill: string;
  } | null>(null);

  // Embedded Focus Pomodoro Session Widget State
  const [focusWidgetActive, setFocusWidgetActive] = useState(false);
  const [focusMode, setFocusMode] = useState<'work' | 'break'>('work');
  const [focusTimeLeft, setFocusTimeLeft] = useState(25 * 60);
  const [focusRunning, setFocusRunning] = useState(false);

  // Active Emoji Picker State
  const [activePickerMsgId, setActivePickerMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const student = loadStudentProfile();

  // Selected community
  const activeCommunity = communities.find((c) => c.id === activeCommunityId) || communities[0];

  // Derive active channel directly
  const activeChannel =
    activeCommunity?.channels.find((ch) => ch.id === activeChannelId) ||
    activeCommunity?.channels.find((ch) => ch.isDefault) ||
    activeCommunity?.channels[0];

  const currentChannelId = activeChannel?.id || '';

  // Synchronize on global reset event
  useEffect(() => {
    const handleReset = () => {
      const freshComms = loadCommunities();
      const freshMsgs = loadMessages();
      setCommunities(freshComms);
      setMessages(freshMsgs);
      setUserReactions(loadUserReactions());
      setAllResources(loadResources());
      if (freshComms.length > 0) {
        setActiveCommunityId(freshComms[0].id);
        setActiveChannelId(freshComms[0].channels[0]?.id || '');
      }
    };
    window.addEventListener('skillforge-reset', handleReset);
    return () => window.removeEventListener('skillforge-reset', handleReset);
  }, []);

  // Keyboard accessibility: Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCreateModal(false);
        setShowPinResourceModal(false);
        setSelectedPeerProfile(null);
        setActivePickerMsgId(null);
        setShowAttachResource(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Pomodoro countdown timer in community view
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (focusRunning && focusTimeLeft > 0) {
      interval = setInterval(() => {
        setFocusTimeLeft((prev) => {
          if (prev <= 1) {
            setFocusRunning(false);
            if (focusMode === 'work') {
              awardXP(`comm_focus_${Date.now()}`, 35, 'Completed 25m Focus Sprint');
              showToast('🎉 Focus session completed! +35 XP awarded. Take a 5-minute breather!', 'success');
              setFocusMode('break');
              return 5 * 60;
            } else {
              showToast('☕ Break completed! Ready for another focused study sprint?', 'info');
              setFocusMode('work');
              return 25 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [focusRunning, focusTimeLeft, focusMode]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentChannelId]);

  // Sync route query parameters if navigated with new community/channel
  useEffect(() => {
    if (requestedCommId && requestedCommId !== activeCommunityId) {
      setActiveCommunityId(requestedCommId);
      const target = communities.find((c) => c.id === requestedCommId);
      if (target) {
        const def = target.channels.find((ch) => ch.isDefault) || target.channels[0];
        if (def && !requestedChannelId) {
          setActiveChannelId(def.id);
        }
      }
    }
    if (requestedChannelId) {
      setActiveChannelId(requestedChannelId);
    }
  }, [requestedCommId, requestedChannelId, communities, activeCommunityId]);

  // Filter messages for current channel
  const channelMessages = messages.filter(
    (m) => m.communityId === activeCommunityId && m.channelId === currentChannelId
  );

  // Switch community handler
  const handleSelectCommunity = (commId: string) => {
    setActiveCommunityId(commId);
    const target = communities.find((c) => c.id === commId);
    if (target) {
      const defCh = target.channels.find((ch) => ch.isDefault) || target.channels[0];
      if (defCh) {
        setActiveChannelId(defCh.id);
        setSearchParams({ community: commId, channel: defCh.id });
      } else {
        setSearchParams({ community: commId });
      }
    }
  };

  // Switch channel handler
  const handleSelectChannel = (channelId: string) => {
    setActiveChannelId(channelId);
    setSearchParams({ community: activeCommunityId, channel: channelId });
  };

  // Send chat message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanContent = inputText.trim().slice(0, 2000);
    if (!cleanContent && !selectedResourceUrl) return;

    const resourceLink = selectedResourceUrl
      ? {
          title: (selectedResourceTitle || selectedResourceUrl).slice(0, 150),
          url: selectedResourceUrl.trim()
        }
      : undefined;

    const newMsg = sendChatMessage({
      communityId: activeCommunityId,
      channelId: currentChannelId,
      content: cleanContent,
      authorName: student.name,
      authorAvatar: student.avatar || '🎓',
      replyToId: replyingTo ? replyingTo.id : undefined,
      resourceLink
    });

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setReplyingTo(null);
    setShowAttachResource(false);
    setSelectedResourceUrl('');
    setSelectedResourceTitle('');
    chatInputRef.current?.focus();
  };

  // Toggle reaction (increment or decrement live)
  const handleToggleReaction = (messageId: string, emoji: string) => {
    toggleMessageReaction(messageId, emoji);
    setMessages(loadMessages());
    setUserReactions(loadUserReactions());
    setActivePickerMsgId(null);
  };

  // Scroll to quoted message
  const scrollToMessage = (msgId?: string) => {
    if (!msgId) return;
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('message-flash-highlight');
      setTimeout(() => el.classList.remove('message-flash-highlight'), 1800);
    }
  };

  // Handle reply action
  const handleInitiateReply = (msg: ChatMessage) => {
    setReplyingTo(msg);
    chatInputRef.current?.focus();
  };

  // Create community submit
  const handleCreateCommunitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newCommName.trim().slice(0, 60);
    if (!cleanName) {
      showToast('Please provide a community name.', 'warning');
      return;
    }

    const created = createCommunity({
      name: cleanName,
      category: newCommCategory,
      description: newCommDesc.trim().slice(0, 240) || 'Collaborative student study circle.',
      icon: (newCommIcon || '📚').slice(0, 4),
      activeStudyGoal: newCommGoal.trim().slice(0, 120) || 'Active study group sprint'
    });

    const updated = loadCommunities();
    setCommunities(updated);
    setActiveCommunityId(created.id);
    setActiveChannelId(created.channels[0]?.id || '');
    setShowCreateModal(false);
    setNewCommName('');
    setNewCommDesc('');
    setNewCommGoal('');
    showToast(`✓ Study Circle "${created.name}" created successfully! (+100 XP)`, 'success');
  };

  // Create channel submit
  const handleCreateChannelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommunity) return;

    const sanitizedName = newChanName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 32);

    if (!sanitizedName) {
      showToast('Please provide a valid channel name using letters, numbers, and dashes.', 'warning');
      return;
    }

    try {
      const created = createChannel(activeCommunity.id, {
        name: sanitizedName,
        type: newChanType,
        description: newChanDesc.trim().slice(0, 200) || `Discussion and study channel for #${sanitizedName}`
      });

      const updatedComms = loadCommunities();
      setCommunities(updatedComms);
      setActiveChannelId(created.id);
      setShowCreateModal(false);
      setNewChanName('');
      setNewChanDesc('');
      showToast(`✓ Channel #${created.name} added to ${activeCommunity.name}! (+20 XP)`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create channel';
      showToast(`Error: ${msg}`, 'error');
    }
  };

  // Join/Leave community
  const handleToggleJoin = (id: string) => {
    const updated = toggleJoinCommunity(id);
    setCommunities(updated);
    const comm = updated.find((c) => c.id === id);
    if (comm) {
      showToast(comm.isJoined ? `Joined "${comm.name}"! (+30 XP)` : `Left "${comm.name}".`, 'info');
    }
  };

  // Update community active study goal
  const handleSaveGoalUpdate = () => {
    if (!editedGoalText.trim() || !activeCommunity) return;
    const updated = updateCommunityGoal(activeCommunity.id, editedGoalText.trim());
    setCommunities(updated);
    setIsEditingGoal(false);
    showToast('✓ Active study goal updated for the community!', 'success');
  };

  // Log personal goal completion
  const handleCompleteCommunityGoal = () => {
    if (!activeCommunity) return;
    awardXP(`goal_complete_${activeCommunity.id}_${Date.now()}`, 50, `Completed sprint goal: ${activeCommunity.activeStudyGoal}`);
    showToast(`🎯 Great achievement! Completed community goal: "${activeCommunity.activeStudyGoal}" (+50 XP)`, 'success');
  };

  // Toggle saving resource
  const handleToggleSaveResource = (resId: string) => {
    const updated = toggleSaveResource(resId);
    setAllResources(updated);
    const res = updated.find((r) => r.id === resId);
    showToast(res?.isSaved ? `★ Saved "${res.title}" to library!` : `Removed from personal library.`, 'info');
  };

  // Pin resource to channel
  const handlePinResourceSubmit = (res: StudyResource) => {
    sendChatMessage({
      communityId: activeCommunityId,
      channelId: currentChannelId,
      content: `📌 Pinned new study resource: **${res.title}** (${res.category})`,
      resourceLink: {
        title: res.title,
        url: res.url,
        skillId: res.skillId
      }
    });
    setMessages(loadMessages());
    setShowPinResourceModal(false);
    showToast(`📌 Resource "${res.title}" pinned to #${activeChannel?.name}!`, 'success');
  };

  // Mention peer in chat
  const handleMentionPeer = (name: string) => {
    setInputText((prev) => (prev ? `${prev} @${name} ` : `@${name} `));
    setSelectedPeerProfile(null);
    chatInputRef.current?.focus();
  };

  // Send buddy invite from peer card
  const handleSendBuddyInviteFromCard = (peerName: string) => {
    sendBuddyRequest({
      peerId: `peer-${Date.now()}`,
      peerName,
      peerAvatar: selectedPeerProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      topic: `${activeCommunity?.name || 'SkillForge'} Co-studying`,
      studyMode: 'Pair Coding & Discussion',
      note: `Hey ${peerName}, let's collaborate in #${activeChannel?.name || 'general-chat'}!`
    });
    setSelectedPeerProfile(null);
    showToast(`✓ Invitation sent to ${peerName}! Check Study Buddies tab. (+25 XP)`, 'success');
  };

  // Format pomodoro time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const joinedCommunities = communities.filter((c) => c.isJoined);
  const quickEmojis = ['❤️', '💡', '🔥', '👍', '👏', '🎯', '🚀', '☕'];

  return (
    <div className="discord-app-layout">
      {/* 1. Leftmost Server Rail */}
      <aside className="server-rail" aria-label="Joined study communities">
        {/* Home / Primary Server Button */}
        {joinedCommunities.length > 0 && (
          <button
            className={`server-icon-btn ${activeCommunityId === joinedCommunities[0].id ? 'active' : ''}`}
            onClick={() => handleSelectCommunity(joinedCommunities[0].id)}
            title={`${joinedCommunities[0].name} (Home Server)`}
          >
            <span className="server-icon-symbol">⚡</span>
            {activeCommunityId === joinedCommunities[0].id && <span className="active-pill" />}
          </button>
        )}

        <div className="server-rail-divider" />

        {/* Joined Communities (showing remaining after home) */}
        <div className="server-icons-scroll">
          {joinedCommunities.slice(1).map((comm) => (
            <button
              key={comm.id}
              className={`server-icon-btn ${comm.id === activeCommunityId ? 'active' : ''}`}
              onClick={() => handleSelectCommunity(comm.id)}
              title={`${comm.name} (${comm.category})`}
            >
              <span className="server-icon-symbol">{comm.icon}</span>
              {comm.id === activeCommunityId && <span className="active-pill" />}
            </button>
          ))}
        </div>

        <div className="server-rail-divider" />

        {/* Add Server / Channel Button */}
        <button
          className="server-action-btn add-server-btn"
          onClick={() => {
            setCreateModalTab('server');
            setShowCreateModal(true);
          }}
          title="Create a new Study Circle or Channel"
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
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 className="comm-name">{activeCommunity?.name}</h2>
              <span className="comm-category-pill">{activeCommunity?.category}</span>
            </div>
          </div>
          <div className="community-meta-row">
            <span className="member-count">👥 {activeCommunity?.memberCount} members</span>
            {!activeCommunity?.isJoined ? (
              <button
                className="btn btn-sm btn-primary join-action-btn"
                onClick={() => handleToggleJoin(activeCommunity.id)}
              >
                Join Server
              </button>
            ) : (
              <span className="joined-indicator-tag">✓ Joined</span>
            )}
          </div>
          {activeCommunity?.activeStudyGoal && (
            <div className="community-goal-box" title="Active study sprint goal">
              <span className="goal-icon">🎯</span>
              <span className="goal-text">{activeCommunity.activeStudyGoal}</span>
            </div>
          )}
        </header>

        {/* Channel Navigation */}
        <div className="channels-list">
          <div className="channel-group-header">
            <span>TEXT & DISCUSSION CHANNELS</span>
            <button
              className="add-channel-header-btn"
              onClick={() => {
                setCreateModalTab('channel');
                setNewChanType('text');
                setShowCreateModal(true);
              }}
              title="Add a text channel to this community"
            >
              +
            </button>
          </div>

          {activeCommunity?.channels
            .filter((ch) => ch.type !== 'study-room')
            .map((ch) => (
              <button
                key={ch.id}
                className={`channel-item-btn ${ch.id === currentChannelId ? 'channel-active' : ''}`}
                onClick={() => handleSelectChannel(ch.id)}
              >
                <span className="channel-prefix">
                  {ch.type === 'doubts' ? '❓' : ch.type === 'resources' ? '📌' : ch.type === 'project-help' ? '🛠️' : '#'}
                </span>
                <span className="channel-name">{ch.name}</span>
              </button>
            ))}

          <div className="channel-group-header" style={{ marginTop: '1rem' }}>
            <span>FOCUS & STUDY ROOMS</span>
            <button
              className="add-channel-header-btn"
              onClick={() => {
                setCreateModalTab('channel');
                setNewChanType('study-room');
                setShowCreateModal(true);
              }}
              title="Add a focus study room"
            >
              +
            </button>
          </div>

          {activeCommunity?.channels
            .filter((ch) => ch.type === 'study-room')
            .map((ch) => (
              <button
                key={ch.id}
                className={`channel-item-btn channel-room ${ch.id === currentChannelId ? 'channel-active' : ''}`}
                onClick={() => handleSelectChannel(ch.id)}
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
            <span className="chat-header-name">{activeChannel?.name || 'general-chat'}</span>
            <span className="chat-header-divider">|</span>
            <span className="chat-header-desc">{activeChannel?.description || 'Community discussion space'}</span>
          </div>

          <div className="chat-header-actions">
            {activeChannel?.type === 'study-room' ? (
              <button
                className={`btn btn-sm ${focusRunning ? 'btn-success' : 'btn-primary'}`}
                onClick={() => {
                  setFocusWidgetActive(true);
                  setFocusRunning(!focusRunning);
                }}
              >
                {focusRunning ? `⏱️ Pause (${formatTime(focusTimeLeft)})` : '🎧 Start Room Focus'}
              </button>
            ) : (
              <button
                className={`btn btn-sm ${focusWidgetActive ? 'btn-secondary' : 'btn-outline'}`}
                onClick={() => setFocusWidgetActive(!focusWidgetActive)}
                title="Toggle Pomodoro focus timer widget"
              >
                ⏱️ {focusRunning ? formatTime(focusTimeLeft) : 'Pomodoro Timer'}
              </button>
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

        {/* Inline Pomodoro Focus Widget Bar (when toggled active) */}
        {focusWidgetActive && (
          <div className="inline-focus-bar">
            <div className="inline-focus-left">
              <span className="focus-badge-tag">
                {focusMode === 'work' ? '🎯 25m Focus Sprint' : '☕ 5m Rest Break'}
              </span>
              <span className="focus-digital-timer">{formatTime(focusTimeLeft)}</span>
              <span className="focus-goal-snippet">
                Goal: {activeCommunity?.activeStudyGoal || 'Deep study session'}
              </span>
            </div>

            <div className="inline-focus-controls">
              <button
                className={`btn btn-sm ${focusRunning ? 'btn-warning' : 'btn-primary'}`}
                onClick={() => setFocusRunning(!focusRunning)}
              >
                {focusRunning ? '⏸ Pause' : '▶ Start'}
              </button>

              <button
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  setFocusRunning(false);
                  setFocusTimeLeft(focusMode === 'work' ? 25 * 60 : 5 * 60);
                }}
                title="Reset timer"
              >
                ↺ Reset
              </button>

              <button
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  setFocusRunning(false);
                  if (focusMode === 'work') {
                    setFocusMode('break');
                    setFocusTimeLeft(5 * 60);
                  } else {
                    setFocusMode('work');
                    setFocusTimeLeft(25 * 60);
                  }
                }}
              >
                Switch to {focusMode === 'work' ? 'Break' : 'Focus'}
              </button>

              <Link to="/focus" className="btn btn-sm btn-outline" style={{ fontSize: '0.75rem' }}>
                Full Focus Room ↗
              </Link>

              <button
                className="inline-focus-close"
                onClick={() => setFocusWidgetActive(false)}
                title="Hide timer bar"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Local Demo Disclaimer Banner */}
        <div className="demo-mode-notice">
          <span>
            ℹ️ <strong>Live Local Session:</strong> Real-time messaging, reaction counters, and Pomodoro focus states persist locally in browser storage.
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
              Collaborate with fellow students, ask questions, and share study insights.
            </p>
          </div>

          {channelMessages.map((msg) => {
            const repliedMessage = msg.replyToId
              ? messages.find((m) => m.id === msg.replyToId)
              : null;

            const myReactedEmojis = userReactions[msg.id] || [];

            return (
              <article key={msg.id} id={`msg-${msg.id}`} className="chat-message-row">
                {/* Reply quote indicator */}
                {repliedMessage && (
                  <div
                    className="reply-quote-bar"
                    onClick={() => scrollToMessage(msg.replyToId)}
                    title="Click to jump to replied message"
                    role="button"
                    tabIndex={0}
                  >
                    <span className="reply-arrow">↳</span>
                    <span className="reply-author">@{repliedMessage.authorName}:</span>
                    <span className="reply-snippet">
                      {repliedMessage.content.slice(0, 85)}
                      {repliedMessage.content.length > 85 ? '...' : ''}
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
                          <span className="resource-card-label">Shared Learning Resource</span>
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
                        {Object.entries(msg.reactions || {}).map(([emoji, count]) => {
                          const isUserReacted = myReactedEmojis.includes(emoji);
                          return (
                            <button
                              key={emoji}
                              className={`reaction-pill ${isUserReacted ? 'reaction-user-reacted' : ''}`}
                              onClick={() => handleToggleReaction(msg.id, emoji)}
                              title={isUserReacted ? `You reacted with ${emoji}. Click to remove.` : `Click to react with ${emoji}`}
                            >
                              <span>{emoji}</span>
                              <span className="reaction-count">{count}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="message-actions-hover">
                        {/* Quick reaction emoji triggers */}
                        <button
                          className={`reaction-quick-btn ${myReactedEmojis.includes('❤️') ? 'active-reaction' : ''}`}
                          onClick={() => handleToggleReaction(msg.id, '❤️')}
                          title="Heart"
                        >
                          ❤️
                        </button>
                        <button
                          className={`reaction-quick-btn ${myReactedEmojis.includes('💡') ? 'active-reaction' : ''}`}
                          onClick={() => handleToggleReaction(msg.id, '💡')}
                          title="Idea"
                        >
                          💡
                        </button>
                        <button
                          className={`reaction-quick-btn ${myReactedEmojis.includes('🔥') ? 'active-reaction' : ''}`}
                          onClick={() => handleToggleReaction(msg.id, '🔥')}
                          title="Fire"
                        >
                          🔥
                        </button>
                        <button
                          className={`reaction-quick-btn ${myReactedEmojis.includes('👍') ? 'active-reaction' : ''}`}
                          onClick={() => handleToggleReaction(msg.id, '👍')}
                          title="Thumbs Up"
                        >
                          👍
                        </button>

                        {/* More emojis popover trigger */}
                        <button
                          className="reaction-quick-btn"
                          onClick={() =>
                            setActivePickerMsgId(activePickerMsgId === msg.id ? null : msg.id)
                          }
                          title="Add Reaction"
                        >
                          +😊
                        </button>

                        <button
                          className="reply-btn"
                          onClick={() => handleInitiateReply(msg)}
                          title="Reply to message"
                        >
                          💬 Reply
                        </button>
                      </div>

                      {/* Small Reaction Picker Dropdown */}
                      {activePickerMsgId === msg.id && (
                        <div className="quick-emoji-picker-menu">
                          {quickEmojis.map((em) => (
                            <button
                              key={em}
                              className="emoji-picker-btn"
                              onClick={() => handleToggleReaction(msg.id, em)}
                            >
                              {em}
                            </button>
                          ))}
                        </div>
                      )}
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
              <span>
                Replying to <strong>@{replyingTo.authorName}</strong>: "
                {replyingTo.content.slice(0, 60)}
                {replyingTo.content.length > 60 ? '...' : ''}"
              </span>
              <button
                className="cancel-reply-btn"
                onClick={() => setReplyingTo(null)}
                title="Cancel reply"
              >
                ✕ Cancel
              </button>
            </div>
          )}

          {/* Attached resource preview */}
          {selectedResourceUrl && (
            <div className="attached-resource-preview">
              <span>
                📎 Attached: <strong>{selectedResourceTitle || selectedResourceUrl}</strong>
              </span>
              <button
                className="remove-attached-btn"
                onClick={() => {
                  setSelectedResourceUrl('');
                  setSelectedResourceTitle('');
                }}
                title="Remove attached resource"
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
              ref={chatInputRef}
              type="text"
              maxLength={2000}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message #${activeChannel?.name || 'channel'} (press Enter to send)...`}
              className="chat-text-input"
              aria-label={`Message #${activeChannel?.name || 'channel'}`}
            />

            <button
              type="submit"
              className="send-msg-btn"
              disabled={!inputText.trim() && !selectedResourceUrl}
              title="Send message"
            >
              Send ↵
            </button>
          </form>

          {/* Attach Resource Popover */}
          {showAttachResource && (
            <div className="attach-resource-popover">
              <div className="popover-header">
                <strong>Attach Resource from Library</strong>
                <button
                  onClick={() => setShowAttachResource(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  ✕
                </button>
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

            {/* Active Study Sprint & Goal */}
            <section className="details-section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <h4>Active Focus Goal</h4>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => {
                    setIsEditingGoal(!isEditingGoal);
                    setEditedGoalText(activeCommunity?.activeStudyGoal || '');
                  }}
                  style={{ fontSize: '0.72rem', padding: '0.1rem 0.35rem' }}
                >
                  {isEditingGoal ? 'Cancel' : '✏️ Edit'}
                </button>
              </div>

              {isEditingGoal ? (
                <div className="inline-goal-editor" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <input
                    type="text"
                    value={editedGoalText}
                    onChange={(e) => setEditedGoalText(e.target.value)}
                    placeholder="Enter updated community sprint goal..."
                    style={{
                      padding: '0.4rem',
                      background: '#0f172a',
                      border: '1px solid #3b82f6',
                      borderRadius: '4px',
                      color: '#f8fafc',
                      fontSize: '0.8rem'
                    }}
                  />
                  <button className="btn btn-sm btn-primary" onClick={handleSaveGoalUpdate}>
                    Save Goal
                  </button>
                </div>
              ) : (
                <div className="active-goal-card">
                  <span className="goal-badge-icon">🎯</span>
                  <p>{activeCommunity?.activeStudyGoal || 'Collaborative daily study'}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                <button
                  className={`btn ${focusWidgetActive ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{ flex: 1 }}
                  onClick={() => {
                    setFocusWidgetActive(true);
                    setFocusRunning(true);
                  }}
                >
                  ⏱️ Start 25m Focus Session
                </button>

                <button
                  className="btn btn-outline btn-sm"
                  onClick={handleCompleteCommunityGoal}
                  title="Mark this sprint goal completed for your progress"
                  style={{ flexShrink: 0 }}
                >
                  ✓ Done
                </button>
              </div>
            </section>

            {/* Pinned Resources */}
            <section className="details-section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <h4>Pinned Study Resources</h4>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => setShowPinResourceModal(true)}
                  style={{ fontSize: '0.72rem', padding: '0.1rem 0.35rem' }}
                  title="Pin an additional resource to this channel"
                >
                  + Pin
                </button>
              </div>

              <div className="pinned-resources-list">
                {allResources.slice(0, 4).map((res) => (
                  <div key={res.id} className="pinned-res-item">
                    <span className="pinned-icon">📌</span>
                    <div className="pinned-text">
                      <a href={res.url} target="_blank" rel="noopener noreferrer">
                        {res.title} ↗
                      </a>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="pinned-category">{res.category}</span>
                        <button
                          className="pin-save-quick-btn"
                          onClick={() => handleToggleSaveResource(res.id)}
                          title={res.isSaved ? 'Saved in personal library' : 'Save to personal library'}
                        >
                          {res.isSaved ? '★' : '☆'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/tools" className="view-all-tools-link">
                Explore Full Study Toolkit →
              </Link>
            </section>

            {/* Active Study Peers (Clickable to connect or mention) */}
            <section className="details-section">
              <h4>Online Co-Studiers (4)</h4>
              <ul className="online-peers-list">
                {[
                  {
                    name: 'Ananya Sharma',
                    avatar: '👩‍💻',
                    role: 'Student',
                    status: 'Focusing on HTML Forms',
                    complementarySkill: 'HTML Semantic Elements'
                  },
                  {
                    name: 'Rohan Patel',
                    avatar: '👨‍💻',
                    role: 'Student',
                    status: 'Practicing Flexbox layout',
                    complementarySkill: 'CSS Layouts & Flexbox'
                  },
                  {
                    name: 'Marcus Chen',
                    avatar: '🧑‍🎓',
                    role: 'Mentor',
                    status: 'Office hours • Code review',
                    complementarySkill: 'DOM Manipulation'
                  },
                  {
                    name: student.name,
                    avatar: student.avatar || '🎓',
                    role: 'You',
                    status: `Active in #${activeChannel?.name || 'chat'}`,
                    complementarySkill: 'Fullstack Explorer'
                  }
                ].map((peer, pIdx) => (
                  <li
                    key={pIdx}
                    className="peer-item interactive-peer"
                    onClick={() => {
                      if (peer.role !== 'You') {
                        setSelectedPeerProfile(peer);
                      }
                    }}
                    title={peer.role === 'You' ? 'Your active status' : `Click to connect with ${peer.name}`}
                  >
                    <span className="peer-avatar">{peer.avatar}</span>
                    <div className="peer-info">
                      <span className="peer-name">
                        {peer.name} {peer.role !== 'Student' && peer.role !== 'You' && `(${peer.role})`}
                      </span>
                      <span className="peer-status">{peer.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </aside>
      )}

      {/* Modal: Peer Quick Interaction Card */}
      {selectedPeerProfile && (
        <div className="modal-overlay" onClick={() => setSelectedPeerProfile(null)}>
          <div className="modal-dialog modal-sm" role="dialog" aria-modal="true" aria-labelledby="peer-card-title" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h3 id="peer-card-title">Peer Profile Card</h3>
              <button className="close-btn" aria-label="Close dialog" onClick={() => setSelectedPeerProfile(null)}>
                ✕
              </button>
            </header>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <span style={{ fontSize: '3rem', display: 'inline-block', marginBottom: '0.5rem' }}>
                {selectedPeerProfile.avatar}
              </span>
              <h3 style={{ margin: 0 }}>{selectedPeerProfile.name}</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.25rem 0 1rem' }}>
                {selectedPeerProfile.role} • {selectedPeerProfile.status}
              </p>
              <div style={{ backgroundColor: '#0f172a', padding: '0.75rem', borderRadius: '6px', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Key Strength</span>
                <strong style={{ color: '#38bdf8' }}>{selectedPeerProfile.complementarySkill}</strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => handleSendBuddyInviteFromCard(selectedPeerProfile.name)}
                >
                  👋 Send Study Buddy Invitation (+25 XP)
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleMentionPeer(selectedPeerProfile.name)}
                >
                  💬 Mention @{selectedPeerProfile.name} in Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Server or Channel */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="create-modal-heading" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <div className="modal-tab-switcher">
                <button
                  type="button"
                  className={`modal-switch-tab ${createModalTab === 'server' ? 'active' : ''}`}
                  onClick={() => setCreateModalTab('server')}
                >
                  🏢 Create New Server
                </button>
                <button
                  type="button"
                  className={`modal-switch-tab ${createModalTab === 'channel' ? 'active' : ''}`}
                  onClick={() => setCreateModalTab('channel')}
                >
                  # Add Channel to {activeCommunity?.name || 'Server'}
                </button>
              </div>
              <button className="close-btn" aria-label="Close dialog" onClick={() => setShowCreateModal(false)}>
                ✕
              </button>
            </header>

            {createModalTab === 'server' ? (
              <form onSubmit={handleCreateCommunitySubmit} className="modal-form">
                <div className="form-group">
                  <label id="create-modal-heading">Community Name</label>
                  <input
                    type="text"
                    required
                    maxLength={60}
                    placeholder="e.g. React 19 & Fullstack Engineers"
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
                    maxLength={4}
                    value={newCommIcon}
                    onChange={(e) => setNewCommIcon(e.target.value)}
                    style={{ width: '80px' }}
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows={3}
                    maxLength={240}
                    placeholder="What will students study together in this community?"
                    value={newCommDesc}
                    onChange={(e) => setNewCommDesc(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Active Study Sprint / Goal</label>
                  <input
                    type="text"
                    maxLength={120}
                    placeholder="e.g. Build 3 mini portfolio apps this month"
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
            ) : (
              <form onSubmit={handleCreateChannelSubmit} className="modal-form">
                <div className="form-group">
                  <label id="create-modal-heading">Channel Name</label>
                  <input
                    type="text"
                    required
                    maxLength={32}
                    placeholder="e.g. react-hooks-lab"
                    value={newChanName}
                    onChange={(e) => setNewChanName(e.target.value)}
                  />
                  <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    Letters, numbers, and dashes only.
                  </small>
                </div>

                <div className="form-group">
                  <label>Channel Type</label>
                  <select
                    value={newChanType}
                    onChange={(e) => setNewChanType(e.target.value as ChannelType)}
                  >
                    <option value="text"># Text Discussion Channel</option>
                    <option value="doubts">❓ Q&A / Doubts Channel</option>
                    <option value="resources">📌 Curated Resources Channel</option>
                    <option value="project-help">🛠️ Project & Portfolio Help</option>
                    <option value="study-room">🎧 Silent Study & Focus Room</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Channel Topic / Description</label>
                  <input
                    type="text"
                    maxLength={200}
                    placeholder="Brief description of what belongs in this channel..."
                    value={newChanDesc}
                    onChange={(e) => setNewChanDesc(e.target.value)}
                  />
                </div>

                <footer className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Channel (+20 XP)
                  </button>
                </footer>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Pin Resource */}
      {showPinResourceModal && (
        <div className="modal-overlay" onClick={() => setShowPinResourceModal(false)}>
          <div className="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="pin-modal-heading" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h3 id="pin-modal-heading">Pin a Resource to #{activeChannel?.name}</h3>
              <button className="close-btn" aria-label="Close dialog" onClick={() => setShowPinResourceModal(false)}>
                ✕
              </button>
            </header>
            <div className="popover-resource-list" style={{ maxHeight: '350px', overflowY: 'auto', padding: '0.5rem' }}>
              {allResources.map((res) => (
                <div
                  key={res.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem',
                    background: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '6px',
                    marginBottom: '0.4rem'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
                    <strong style={{ fontSize: '0.85rem', display: 'block', color: '#f8fafc' }}>
                      {res.title}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {res.category} • by {res.sharedBy}
                    </span>
                  </div>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handlePinResourceSubmit(res)}
                  >
                    📌 Pin Here
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
