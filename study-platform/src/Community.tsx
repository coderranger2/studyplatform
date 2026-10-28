
import "./Community.css";

const studyCircles = [
  {
    name: "Web Development",
    subject: "HTML, CSS & JavaScript",
    members: 128,
    emoji: "💻",
    color: "lilac",
  },
  {
    name: "Study & Focus",
    subject: "Quiet study sessions and goals",
    members: 86,
    emoji: "☁️",
    color: "peach",
  },
  {
    name: "Mathematics",
    subject: "Solve problems together",
    members: 94,
    emoji: "✏️",
    color: "sage",
  },
];

const discussions = [
  {
    initials: "AM",
    name: "Ananya",
    time: "12 min ago",
    message: "Finally understood DOM manipulation today! 🥹",
    tag: "Web Development",
  },
  {
    initials: "RS",
    name: "Rohan",
    time: "28 min ago",
    message: "Anyone up for a 25-minute focus session?",
    tag: "Study & Focus",
  },
  {
    initials: "SK",
    name: "Sana",
    time: "45 min ago",
    message: "Sharing my notes on responsive design here.",
    tag: "Resources",
  },
];

export default function Community() {
  return (
    <main className="community-page">
      <header className="community-header">
        <div>
          <p className="eyebrow">YOUR LITTLE CORNER OF THE INTERNET</p>
          <h1>Learn together, grow together <span>✳</span></h1>
          <p className="community-subtitle">
            Find your people, share what you learn, and make progress together.
          </p>
        </div>

        <div className="community-date">✿ Your study space</div>
      </header>

      <section className="community-hero">
        <div>
          <p className="eyebrow">A LITTLE PROGRESS EVERY DAY</p>
          <h2>You don't have to figure it all out alone.</h2>
          <p>
            Join a study circle, ask that question, or celebrate a tiny win.
            Every step counts.
          </p>
          <a className="community-hero-link" href="#study-circles">
            Find your study circle <span>↗</span>
          </a>
        </div>
        <div className="community-hero-art" aria-hidden="true">
          <span>☁️</span>
          <span>✿</span>
          <span>✧</span>
          <span>📚</span>
        </div>
      </section>

      <section id="study-circles" className="community-section">
        <div className="community-section-heading">
          <div>
            <p className="eyebrow">YOUR PEOPLE</p>
            <h2>Explore study circles</h2>
          </div>
          <span className="community-count">3 circles to explore</span>
        </div>

        <div className="study-circle-grid">
          {studyCircles.map((circle) => (
            <article
              className={`study-circle-card ${circle.color}`}
              key={circle.name}
            >
              <div className="circle-emoji">{circle.emoji}</div>
              <h3>{circle.name}</h3>
              <p>{circle.subject}</p>
              <div className="circle-card-footer">
                <span>♡ {circle.members} learners</span>
                <button
                  className="circle-join-button"
                  onClick={() =>
                    window.location.href = '/'
                  }
                >
                  Explore ↗
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="community-section">
        <div className="community-section-heading">
          <div>
            <p className="eyebrow">HAPPENING AROUND YOU</p>
            <h2>Community conversations</h2>
          </div>
          <span className="community-count">Recent activity</span>
        </div>

        <div className="discussion-list">
          {discussions.map((discussion) => (
            <article className="discussion-card" key={discussion.name}>
              <div className="discussion-avatar">{discussion.initials}</div>
              <div className="discussion-content">
                <div className="discussion-author">
                  <strong>{discussion.name}</strong>
                  <span>{discussion.time}</span>
                </div>
                <p>{discussion.message}</p>
                <span className="discussion-tag">{discussion.tag}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="community-learning-card">
        <div className="learning-icon">✧</div>
        <div>
          <p className="eyebrow">YOUR PERSONAL GROWTH</p>
          <h2>Your learning journey continues here.</h2>
          <p>
            Head back to your dashboard to explore your assessments,
            personalized roadmap, and progress.
          </p>
        </div>
      </section>
    </main>
  );
}
