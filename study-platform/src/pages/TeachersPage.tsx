import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { GuidanceRequest, SkillId, TeacherProfile } from '../types/index.ts';
import { SKILLS, SKILL_MAP } from '../data/skills.ts';
import { analyzeSkillGaps } from '../engine/skillGapAnalyzer.ts';
import {
  loadGuidanceRequests,
  loadTeacherApplications,
  loadTeachers,
  loadUserProgress,
  reviewTeacherApplication,
  submitGuidanceRequest
} from '../utilities/storage.ts';

export const TeachersPage: React.FC = () => {
  const [teachers] = useState<TeacherProfile[]>(loadTeachers());
  const [requests, setRequests] = useState<GuidanceRequest[]>(loadGuidanceRequests());
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedTeacherForGuidance, setSelectedTeacherForGuidance] =
    useState<TeacherProfile | null>(null);

  // Guidance request modal form
  const [guidanceTopic, setGuidanceTopic] = useState('');
  const [guidanceSkillGapId, setGuidanceSkillGapId] = useState<SkillId>('html-structure');
  const [guidanceMessage, setGuidanceMessage] = useState('');
  const [guidanceTime, setGuidanceTime] = useState('Tomorrow Afternoon (3:00 PM - 4:00 PM)');
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

  // Admin Verification Tab State
  const [activeTab, setActiveTab] = useState<'directory' | 'admin'>('directory');
  const [teacherApplications, setTeacherApplications] = useState(loadTeacherApplications());

  const progress = loadUserProgress();
  const latestAttempt = progress.latestAttempt;
  const skillGaps = analyzeSkillGaps(SKILLS, latestAttempt || null);

  // Find student's active gaps
  const activeGapSkillIds = skillGaps
    .filter((g) => g.hasGap)
    .map((g) => g.skillId);

  // Match teachers using the student's detected skill gaps!
  // Teachers who teach the skills where the student has gaps get matched first.
  const scoredTeachers = teachers.map((teacher) => {
    let matchScore = 0;
    const matchedGapNames: string[] = [];

    teacher.matchingSkillIds.forEach((skillId) => {
      if (activeGapSkillIds.includes(skillId)) {
        matchScore += 2;
        matchedGapNames.push(SKILL_MAP[skillId]?.name || skillId);
      }
    });

    return {
      teacher,
      matchScore,
      matchedGapNames
    };
  });

  // Sort: highest gap-matching score first
  scoredTeachers.sort((a, b) => b.matchScore - a.matchScore);

  const filteredTeachers = scoredTeachers.filter(({ teacher }) => {
    if (selectedSubject === 'all') return true;
    return teacher.subjectExpertise.includes(selectedSubject as any);
  });

  const handleOpenGuidanceModal = (teacher: TeacherProfile, prefilledSkillId?: SkillId) => {
    setSelectedTeacherForGuidance(teacher);
    setGuidanceTopic(
      prefilledSkillId
        ? `Remediate ${SKILL_MAP[prefilledSkillId]?.name} Concept Gap`
        : `Mentorship in ${teacher.topics[0]}`
    );
    if (prefilledSkillId) setGuidanceSkillGapId(prefilledSkillId);
    setGuidanceMessage(
      `Hi ${teacher.name}, I recently took my SkillForge competency assessment and would love guidance on ${
        prefilledSkillId ? SKILL_MAP[prefilledSkillId]?.name : teacher.topics[0]
      }.`
    );
  };

  const handleGuidanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherForGuidance) return;

    submitGuidanceRequest({
      teacherId: selectedTeacherForGuidance.id,
      teacherName: selectedTeacherForGuidance.name,
      studentSkillGapId: guidanceSkillGapId,
      topic: guidanceTopic,
      message: guidanceMessage,
      preferredTime: guidanceTime
    });

    setRequests(loadGuidanceRequests());
    setRequestSuccess(
      `Guidance request sent to ${selectedTeacherForGuidance.name}! (Simulated demo workflow)`
    );
    setSelectedTeacherForGuidance(null);
    setTimeout(() => setRequestSuccess(null), 5000);
  };

  const handleReviewApp = (appId: string, status: 'approved' | 'rejected') => {
    reviewTeacherApplication(appId, status, 'Reviewed in administrator demo portal');
    setTeacherApplications(loadTeacherApplications());
  };

  return (
    <div className="page teachers-page">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Verified Teachers & Subject Mentors</h1>
          <p className="page-subtitle">
            Personalized mentor matching based directly on your diagnostic skill gaps, topic expertise, and target competencies.
          </p>
        </div>
        <div className="page-header-actions">
          <button
            className={`btn btn-sm ${activeTab === 'directory' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('directory')}
          >
            Mentors Directory
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('admin')}
          >
            Admin Verification Queue ({teacherApplications.filter((a) => a.status === 'pending').length})
          </button>
        </div>
      </header>

      {/* Honest Prototype Label */}
      <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
        <span>
          ℹ️ <strong>Demonstration Teacher Workflow:</strong> Sample teacher profiles display real subject expertise and demo verification credentials. Guidance requests simulate matching without real-time booking APIs.
        </span>
      </div>

      {requestSuccess && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <span>✓ {requestSuccess}</span>
        </div>
      )}

      {/* ========================================================
          DIRECTORY VIEW
          ======================================================== */}
      {activeTab === 'directory' && (
        <>
          {/* Skill Gap Recommender Callout */}
          {activeGapSkillIds.length > 0 ? (
            <div className="gap-matching-callout">
              <div className="callout-header">
                <span className="callout-icon">🎯</span>
                <div>
                  <h3>Smart Competency-to-Teacher Matching Active</h3>
                  <p>
                    Based on your diagnostic assessment, you have <strong>{activeGapSkillIds.length}</strong> detected skill gaps. Teachers who specialize in these exact competencies are ranked first:
                  </p>
                </div>
              </div>
              <div className="gap-badges-row">
                {activeGapSkillIds.map((sId) => (
                  <span key={sId} className="gap-pill">
                    ⚠️ {SKILL_MAP[sId]?.name}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="gap-matching-callout">
              <div className="callout-header">
                <span className="callout-icon">ℹ️</span>
                <div>
                  <h3>Take Diagnostic to Calibrate Teacher Matching</h3>
                  <p>
                    Complete the diagnostic assessment to automatically highlight mentors who specialize in your specific skill gaps.
                  </p>
                </div>
                <Link to="/assessment" className="btn btn-sm btn-primary">
                  Take Assessment
                </Link>
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="section-toolbar" style={{ marginTop: '1.5rem' }}>
            <div className="deck-selector">
              <label>Filter by Subject Expertise:</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="all">All Subjects</option>
                <option value="HTML">HTML & Semantics</option>
                <option value="CSS">CSS & Layouts</option>
                <option value="JavaScript">JavaScript & DOM</option>
              </select>
            </div>
            <span className="teacher-count-badge">
              {filteredTeachers.length} mentors available
            </span>
          </div>

          {/* Teacher Grid */}
          <section className="teachers-grid">
            {filteredTeachers.map(({ teacher, matchScore, matchedGapNames }) => (
              <article
                key={teacher.id}
                className={`teacher-card ${matchScore > 0 ? 'teacher-recommended' : ''}`}
              >
                {matchScore > 0 && (
                  <div className="recommended-ribbon">
                    ★ Recommended for your gaps: {matchedGapNames.join(', ')}
                  </div>
                )}

                <div className="teacher-top">
                  <div className="teacher-avatar">{teacher.avatar}</div>
                  <div className="teacher-identity">
                    <div className="name-row">
                      <h3>{teacher.name}</h3>
                      {teacher.isVerifiedDemo ? (
                        <span className="verified-badge" title="Demo verified credentials">
                          ✓ Verified Mentor
                        </span>
                      ) : (
                        <span className="pending-badge" title="Under verification review">
                          Pending Review
                        </span>
                      )}
                    </div>
                    <span className="teacher-title">{teacher.title}</span>
                    <div className="rating-row">
                      <span>★ {teacher.rating}</span>
                      <span className="review-count">({teacher.reviewsCount} reviews)</span>
                      <span>•</span>
                      <span>👥 {teacher.studentCount} students taught</span>
                    </div>
                  </div>
                </div>

                <p className="teacher-bio">{teacher.bio}</p>

                <div className="teacher-qualifications">
                  <strong>Qualifications:</strong> {teacher.qualifications}
                </div>

                <div className="teacher-topics-list">
                  <strong>Key Focus Topics:</strong>
                  <div className="topic-tags">
                    {teacher.topics.map((t) => (
                      <span key={t} className="topic-tag">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="teacher-footer">
                  <div className="availability-info">
                    <span className="avail-label">Availability:</span>
                    <span className="avail-val">{teacher.availability}</span>
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      handleOpenGuidanceModal(
                        teacher,
                        matchedGapNames.length > 0 ? activeGapSkillIds[0] : undefined
                      )
                    }
                  >
                    Request Guidance ✉️
                  </button>
                </div>
              </article>
            ))}
          </section>

          {/* Student's Guidance Requests History */}
          {requests.length > 0 && (
            <section className="guidance-history-section">
              <h2>Your Sent Guidance Requests ({requests.length})</h2>
              <div className="requests-table-wrapper">
                <table className="requests-table">
                  <thead>
                    <tr>
                      <th>Mentor</th>
                      <th>Topic</th>
                      <th>Preferred Slot</th>
                      <th>Status</th>
                      <th>Sent Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.id}>
                        <td>
                          <strong>{req.teacherName}</strong>
                        </td>
                        <td>{req.topic}</td>
                        <td>{req.preferredTime}</td>
                        <td>
                          <span className="badge badge-success">
                            {req.status === 'submitted' ? 'Submitted (Simulated)' : req.status}
                          </span>
                        </td>
                        <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}

      {/* ========================================================
          ADMIN VERIFICATION QUEUE VIEW
          ======================================================== */}
      {activeTab === 'admin' && (
        <section className="admin-verification-section">
          <div className="admin-header-card">
            <h2>Teacher Accreditation & Verification Portal</h2>
            <p>
              Review educator credentials, accreditation documents, and approve or reject mentor verification requests with audit trails.
            </p>
          </div>

          <div className="verification-apps-list">
            {teacherApplications.map((app) => (
              <article key={app.id} className="app-card">
                <div className="app-header">
                  <div>
                    <h3>{app.teacherName}</h3>
                    <span className="app-subject">Subject: {app.subject}</span>
                  </div>
                  <span
                    className={`status-pill status-${app.status}`}
                  >
                    {app.status.toUpperCase()}
                  </span>
                </div>

                <div className="app-body">
                  <div className="doc-preview">
                    <strong>Accreditation Credentials:</strong>
                    <p>{app.qualificationDoc}</p>
                    <span className="submit-date">Submitted on: {app.submittedAt}</span>
                  </div>

                  {app.reviewerNotes && (
                    <div className="reviewer-notes">
                      <strong>Reviewer Notes:</strong> {app.reviewerNotes}
                    </div>
                  )}

                  {app.status === 'pending' && (
                    <div className="app-actions">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleReviewApp(app.id, 'approved')}
                      >
                        ✓ Approve Accreditation
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleReviewApp(app.id, 'rejected')}
                      >
                        ✕ Reject Application
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Modal: Request Guidance */}
      {selectedTeacherForGuidance && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <header className="modal-header">
              <h3>Request Guidance from {selectedTeacherForGuidance.name}</h3>
              <button
                className="close-btn"
                onClick={() => setSelectedTeacherForGuidance(null)}
              >
                ✕
              </button>
            </header>
            <form onSubmit={handleGuidanceSubmit} className="modal-form">
              <div className="form-group">
                <label>Focus Topic or Remediated Skill</label>
                <input
                  type="text"
                  required
                  value={guidanceTopic}
                  onChange={(e) => setGuidanceTopic(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Associated Competency Skill</label>
                <select
                  value={guidanceSkillGapId}
                  onChange={(e) => setGuidanceSkillGapId(e.target.value as SkillId)}
                >
                  {SKILLS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Preferred Time Slot</label>
                <select
                  value={guidanceTime}
                  onChange={(e) => setGuidanceTime(e.target.value)}
                >
                  <option value="Tomorrow Afternoon (3:00 PM - 4:00 PM)">
                    Tomorrow Afternoon (3:00 PM - 4:00 PM)
                  </option>
                  <option value="Thursday Evening (6:00 PM - 7:00 PM)">
                    Thursday Evening (6:00 PM - 7:00 PM)
                  </option>
                  <option value="Saturday Morning (10:00 AM - 11:00 AM)">
                    Saturday Morning (10:00 AM - 11:00 AM)
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>Your Message & Specific Questions</label>
                <textarea
                  rows={4}
                  required
                  value={guidanceMessage}
                  onChange={(e) => setGuidanceMessage(e.target.value)}
                />
              </div>

              <footer className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setSelectedTeacherForGuidance(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Send Guidance Request (+50 XP)
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
