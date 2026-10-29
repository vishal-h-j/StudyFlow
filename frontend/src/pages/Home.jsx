import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Cloud,
  GraduationCap,
  Layers3,
  ShieldCheck,
  Sparkles,
  FileText,
  CheckCircle2,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    tone: "purple",
    title: "Courses in one place",
    description: "Find your subjects quickly and keep your learning resources organized without jumping between folders.",
  },
  {
    icon: FileText,
    tone: "blue",
    title: "Study resources, ready to use",
    description: "Open course PDFs in your browser or download them for offline revision whenever you need them.",
  },
  {
    icon: ShieldCheck,
    tone: "green",
    title: "A workspace for every role",
    description: "Student access and faculty tools are kept separate with account-based access controls.",
  },
];

export default function Home() {
  return (
    <main className="home-page">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge"><span className="pulse-dot" /> YOUR LEARNING, ORGANIZED</span>
          <h1>Learn better.<br /><span>Go further.</span></h1>
          <p className="hero-copy">One focused space for your courses, study resources, and academic progress. Spend less time searching and more time learning.</p>
          <div className="hero-actions">
            <Link className="primary-button" to="/courses">Explore courses <ArrowRight size={18} /></Link>
            <Link className="secondary-button" to="/dashboard">Open dashboard</Link>
          </div>
          <div className="hero-trust">
            <span><ShieldCheck size={16} /> Role-based access</span>
            <span><Cloud size={16} /> Cloud-ready design</span>
            <span><BookOpen size={16} /> Organized resources</span>
          </div>
        </div>
        <div className="hero-art">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-card main-art-card" aria-hidden="true">
            <div className="art-card-top"><span className="art-mark"><GraduationCap size={24} /></span><span className="art-dots">•••</span></div>
            <span className="art-kicker">YOUR STUDY SPACE</span>
            <h2 className="art-title">Small steps.<br />Steady progress.</h2>
            <div className="art-line long-line" /><div className="art-line mid-line" />
            <div className="art-progress"><span /></div>
            <div className="art-bottom"><span>Keep learning every day</span><strong><CheckCircle2 size={14} /> Ready</strong></div>
          </div>
          <Link to="/courses" className="floating-note hero-floating-card"><span className="floating-emoji">📘</span><div><strong>Study materials</strong><small>Browse course PDFs</small></div><ArrowRight className="floating-arrow" size={16} /></Link>
          <Link to="/dashboard" className="floating-stat hero-floating-card"><span className="floating-stat-icon"><Layers3 size={19} /></span><div><strong>Learn at your pace</strong><small>Open your dashboard</small></div><ArrowRight className="floating-arrow" size={16} /></Link>
          <span className="hero-sparkle sparkle-one"><Sparkles size={19} /></span>
          <span className="hero-sparkle sparkle-two"><Zap size={17} /></span>
        </div>
      </section>

      <section className="home-highlights page-container" aria-label="StudyFlow highlights">
        <div className="highlight-item"><span className="highlight-icon"><BookOpen size={20} /></span><div><strong>One learning hub</strong><span>Courses and resources together</span></div></div>
        <div className="highlight-item"><span className="highlight-icon"><Cloud size={20} /></span><div><strong>Built for the cloud</strong><span>Designed for modern web access</span></div></div>
        <div className="highlight-item"><span className="highlight-icon"><ShieldCheck size={20} /></span><div><strong>Account-aware access</strong><span>Separate student and faculty roles</span></div></div>
      </section>

      <section className="feature-section page-container">
        <div className="section-intro"><span className="eyebrow">A BETTER WAY TO STUDY</span><h2>Your academic essentials,<br /><span className="gradient-text">all within reach.</span></h2><p>StudyFlow brings the everyday parts of learning into a simple, organized experience that is easy to use.</p></div>
        <div className="feature-grid">
          {features.map(({ icon: Icon, tone, title, description }, index) => (
            <article className="feature-card polished-feature-card" key={title}>
              <div className="feature-card-top"><span className={`feature-icon ${tone}`}><Icon size={22} /></span><span className="feature-number">0{index + 1}</span></div>
              <h3>{title}</h3><p>{description}</p>
              <Link className="feature-card-link" to={index === 2 ? "/login" : "/courses"}>Explore <ArrowRight size={15} /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="home-cta-wrap page-container">
        <div className="home-cta"><div><span className="cta-kicker">READY WHEN YOU ARE</span><h2>Make your next study session count.</h2><p>Pick a course, open your resources, and get started.</p></div><Link to="/courses" className="cta-button">Browse courses <ArrowRight size={17} /></Link><span className="cta-decoration" aria-hidden="true"><BookOpen size={100} /></span></div>
      </section>

      <footer className="footer"><div className="footer-inner"><span className="brand">Study<span>Flow</span></span><span>Learn with clarity. Grow with confidence.</span><Link to="/courses">Explore courses <ArrowRight size={14} /></Link></div></footer>
    </main>
  );
}
