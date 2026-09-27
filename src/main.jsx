import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import profilePhoto from '../sources/IMG_20250702_124251_404.webp';
import './portfolio.css';

const sectionLinks = [
  ['home', 'Home'], ['about', 'About'], ['skills', 'Skills'],
  ['projects', 'Projects'], ['achievements', 'Achievements'],
  ['resume', 'Resume'], ['contact', 'Contact'],
];

const focusCards = [
  { title: 'Web Development', description: 'I’m interested in creating modern, responsive websites.' },
  { title: 'Problem Solving', description: 'I enjoy solving programming and logic problems.' },
  { title: 'Continuous Learning', description: 'I continually explore new technologies and development tools.' },
];

const skills = ['Java', 'JavaScript', 'HTML', 'CSS', 'React.js', 'Node.js', 'Express.js', 'MongoDB', 'Git'];
const uploadedPdfFiles = {
  ...import.meta.glob('../sources/*.pdf', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob('../sources/*.PDF', { eager: true, query: '?url', import: 'default' }),
};

const projects = [
  {
    title: 'Smart Residential Parking',
    number: '01',
    description: 'A web-based platform that helps users find and book nearby parking spaces based on location, price, and availability. Parking owners can list available spaces and manage bookings through the platform.',
    stack: ['React.js', 'Node.js', 'Express.js', 'MongoDB'],
    link: 'https://mind-spark-kappa.vercel.app/',
  },
  {
    title: 'AI-Based Context-Aware Safe Route Navigation',
    number: '02',
    description: 'A web application designed to help users select safer and more reliable routes to their destination. The system considers factors such as traffic, road conditions, and potential risk areas.',
    stack: ['HTML', 'CSS', 'JavaScript', 'React.js', 'Node.js'],
  },
];

const certificateFiles = Object.entries(uploadedPdfFiles)
  .filter(([path]) => !/resume/i.test(path))
  .sort(([firstPath], [secondPath]) => firstPath.localeCompare(secondPath));

const courseraCertificateTitles = {
  U2YNMDDKB3AX: 'Introduction to AI',
  QQT49HH3FTC9: 'Use AI Responsibly',
  '081Y0SANOHHK': 'Discover the Art of Prompting',
  '2QF8F1CBBMY0': 'Maximize Productivity With AI Tools',
};

const achievements = certificateFiles.map(([path, pdfUrl], index) => {
  const fileName = path.split('/').pop().replace(/\.pdf$/i, '');
  const provider = fileName.match(/^(Coursera|NPTEL|IEE)/i)?.[0] ?? 'Certificate';
  const courseraId = fileName.match(/[A-Z0-9]{12}$/i)?.[0];
  const providerTitle = provider.toUpperCase() === 'NPTEL'
    ? `NPTEL ${fileName.replace(/^NPTEL\s*/i, '').toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase())} Certificate`
    : provider.toUpperCase() === 'IEE'
      ? 'IEE Certificate'
      : `Coursera: ${courseraCertificateTitles[courseraId] ?? 'Certificate'}`;

  return {
    id: String(index + 1).padStart(2, '0'),
    type: provider,
    title: providerTitle,
    description: 'Open the uploaded PDF to view the full certificate details.',
    fileName: `${providerTitle}.pdf`,
    pdfUrl,
  };
});

function downloadResume() {
  const uploadedResume = Object.entries(uploadedPdfFiles).find(([path]) => /resume/i.test(path));
  if (!uploadedResume) return false;
  const downloadLink = document.createElement('a');
  downloadLink.href = uploadedResume[1];
  downloadLink.download = uploadedResume[0].split('/').pop();
  downloadLink.click();
  return true;
}

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [certificateUnavailable, setCertificateUnavailable] = useState(false);
  const [contactStatus, setContactStatus] = useState('');
  const [sending, setSending] = useState(false);
  const [resumeStatus, setResumeStatus] = useState('');

  useEffect(() => {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    }, { rootMargin: '-25% 0px -65% 0px' });
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    sectionLinks.forEach(([id]) => {
      const section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
    document.querySelectorAll('.reveal').forEach(item => revealObserver.observe(item));
    return () => {
      sectionObserver.disconnect();
      revealObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!selectedAchievement) return undefined;
    setCertificateUnavailable(false);

    function closeOnEscape(event) {
      if (event.key === 'Escape') setSelectedAchievement(null);
    }
    document.addEventListener('keydown', closeOnEscape);
    document.body.classList.add('modal-open');
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.classList.remove('modal-open');
    };
  }, [selectedAchievement]);

  async function submitContact(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setSending(true);
    setContactStatus('');
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await response.json();
      setContactStatus(data.message || data.error || 'Unable to send your message right now.');
      if (response.ok) form.reset();
    } catch {
      setContactStatus('The message service is unavailable. Please email me directly.');
    } finally {
      setSending(false);
    }
  }

  function handleResumeDownload() {
    const downloaded = downloadResume();
    setResumeStatus(downloaded ? 'Your Resume PDF is ready to download.' : 'The Resume PDF is currently unavailable.');
  }

  return <>
    <header className="navbar">
      <a className="logo" href="#home" onClick={() => setMenuOpen(false)}>Mouleeshwaran<span>.M</span></a>
      <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(open => !open)}>
        <span className="menu-icon" aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
        <span>{menuOpen ? 'Close' : 'Menu'}</span>
      </button>
      <nav id="primary-navigation" className={menuOpen ? 'nav-links is-open' : 'nav-links'} aria-label="Page sections">
        {sectionLinks.map(([id, label]) => <a key={id} href={`#${id}`} className={activeSection === id ? 'active' : ''} aria-current={activeSection === id ? 'location' : undefined} onClick={() => setMenuOpen(false)}>{label}</a>)}
        <button className="nav-download" type="button" onClick={handleResumeDownload}>Download Resume</button>
      </nav>
    </header>

    <main>
      <section className="hero content-width" id="home">
        <div className="hero-content reveal">
          <p className="welcome">WELCOME TO MY PORTFOLIO</p>
          <h1>Hello, I’m <span>Mouleeshwaran</span></h1>
          <h2>Information Technology Student and Aspiring Software Developer</h2>
          <p className="hero-description">I enjoy building practical web applications, solving programming problems, and learning new technologies to strengthen my development skills.</p>
          <div className="hero-buttons"><a className="primary-btn" href="#projects">View my projects <span aria-hidden="true">↓</span></a><a className="secondary-btn" href="#contact">Contact me</a></div>
          <button className="resume-inline" type="button" onClick={handleResumeDownload}>Download my Resume <span aria-hidden="true">↓</span></button>
        </div>
        <div className="hero-image reveal"><img src={profilePhoto} alt="Mouleeshwaran" /></div>
      </section>

      <section className="quick-info content-width" aria-label="Areas of interest">
        {focusCards.map((card, index) => <article className="info-card reveal" key={card.title}><span className="card-index">0{index + 1}</span><h3>{card.title}</h3><p>{card.description}</p></article>)}
      </section>

      <section className="page-section content-width" id="about">
        <div className="section-heading reveal"><p className="welcome">GET TO KNOW ME</p><h2>About Me</h2><p>A little about my education, skills and career goals.</p></div>
        <div className="about-section reveal">
          <div><p className="section-kicker">INTRODUCTION</p><h3>Learning by building.</h3><p>I’m a B.Tech Information Technology student interested in software development and modern web technologies.</p><p>I enjoy solving programming problems, learning new technologies, and creating practical applications that provide useful solutions.</p><p>I continue to develop my technical skills through coursework, personal projects, and hands-on learning.</p></div>
          <aside className="about-card"><span className="section-kicker">EDUCATION</span><h3>B.Tech in Information Technology</h3><p>Adhi College of Engineering</p><p>Anna University</p><p>Regulation 2021</p></aside>
        </div>
      </section>

      <section className="page-section content-width" id="skills">
        <div className="section-heading reveal"><p className="welcome">MY TOOLKIT</p><h2>Technical Skills</h2><p>Tools and technologies I’m learning and using to build practical applications.</p></div>
        <div className="skills-panel reveal">{skills.map((skill, index) => <span className="skill-chip" key={skill}><span>{String(index + 1).padStart(2, '0')}</span>{skill}</span>)}</div>
        <div className="career-section reveal"><div><p className="section-kicker">CAREER GOAL</p><h3>Growing into a thoughtful software developer.</h3></div><p>My short-term goal is to join a well-established organization, gain practical experience, and strengthen my technical skills. In the long term, I aim to become a skilled software developer who builds useful technology solutions.</p></div>
      </section>

      <section className="page-section content-width" id="projects">
        <div className="section-heading reveal"><p className="welcome">MY WORK</p><h2>Projects</h2><p>Selected applications I have worked on.</p></div>
        <div className="projects-grid">{projects.map(project => <article className="project-card reveal" key={project.number}>
          <div className="project-card-top"><span className="project-number">{project.number}</span><span className="project-mark" aria-hidden="true">↗</span></div>
          <h3>{project.title}</h3><p>{project.description}</p>
          <div className="tech-stack">{project.stack.map(technology => <span key={technology}>{technology}</span>)}</div>
          {project.link ? <a href={project.link} target="_blank" rel="noreferrer" className="project-btn">View Live Project <span aria-hidden="true">↗</span></a> : <a href="#contact" className="project-text-link">Discuss this project <span aria-hidden="true">↓</span></a>}
        </article>)}</div>
      </section>

      <section className="page-section content-width" id="achievements">
        <div className="section-heading reveal"><p className="welcome">CERTIFICATES &amp; ACHIEVEMENTS</p><h2>Achievements &amp; Certificates</h2><p>Select a certificate to view or download the original document.</p></div>
        <div className="achievements-grid">{achievements.map(item => <button className="achievement-card reveal" key={item.id} type="button" onClick={() => setSelectedAchievement(item)}>
          <span className="achievement-top"><span>{item.type}</span><span className="achievement-number">{item.id}</span></span><strong>{item.title}</strong><span className="achievement-action">View details <span aria-hidden="true">↗</span></span>
        </button>)}</div>
      </section>

      <section className="page-section content-width" id="resume">
        <div className="section-heading reveal"><p className="welcome">RESUME</p><h2>My background at a glance.</h2><p>A concise summary of my education, skills, and selected projects.</p></div>
        <div className="resume-panel reveal">
          <div className="resume-identity"><span className="resume-monogram">M</span><div><h3>Mouleeshwaran M</h3><p>Information Technology Student and Aspiring Software Developer</p></div></div>
          <div className="resume-facts"><div><span>EDUCATION</span><strong>B.Tech in Information Technology</strong><p>Adhi College of Engineering · Anna University</p></div><div><span>CORE SKILLS</span><strong>Java · React.js · Node.js</strong><p>JavaScript, Express.js, MongoDB, HTML, CSS, Git</p></div><div><span>SELECTED WORK</span><strong>Smart Residential Parking</strong><p>Web-based parking discovery and booking platform</p></div></div>
          <button className="primary-btn resume-download" type="button" onClick={handleResumeDownload}>Download Resume PDF <span aria-hidden="true">↓</span></button>
          {resumeStatus && <p className="form-status" role="status">{resumeStatus}</p>}
        </div>
      </section>

      <section className="page-section content-width contact-page" id="contact">
        <div className="section-heading reveal"><p className="welcome">GET IN TOUCH</p><h2>Contact Me</h2><p>Have an opportunity or project in mind? Feel free to reach out.</p></div>
        <div className="contact-section reveal">
          <div className="contact-info"><p className="section-kicker">LET’S CONNECT</p><h3>Open to opportunities.</h3><p>I’m interested in software development roles, internships, project work, and other learning opportunities.</p>
            <div className="contact-item"><strong>Email</strong><a href="mailto:mouleeshwaran2006@gmail.com">mouleeshwaran2006@gmail.com</a></div>
            <div className="contact-item"><strong>Location</strong><p>Chennai, India</p></div>
            <div className="social-links"><a href="https://github.com/Mouleeshwaran2006" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a><a href="https://www.linkedin.com/in/mouleeshwaran-m" target="_blank" rel="noreferrer">LinkedIn <span aria-hidden="true">↗</span></a></div>
          </div>
          <form className="contact-form" onSubmit={submitContact}>
            <label htmlFor="contact-name">Name</label><input id="contact-name" name="name" autoComplete="name" maxLength="100" placeholder="Your name" required />
            <label htmlFor="contact-email">Email address</label><input id="contact-email" type="email" name="email" autoComplete="email" maxLength="254" placeholder="Your email address" required />
            <label htmlFor="contact-message">Message</label><textarea id="contact-message" name="message" rows="5" maxLength="5000" placeholder="Write your message..." required />
            <button className="primary-btn" type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send message'} <span aria-hidden="true">↗</span></button>
            {contactStatus && <p className="form-status" role="status">{contactStatus}</p>}
          </form>
        </div>
      </section>
    </main>

    <footer className="site-footer"><p>© 2026 Mouleeshwaran. All rights reserved.</p><a href="#home">Back to top ↑</a></footer>

    {selectedAchievement && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setSelectedAchievement(null); }}>
      <section className="achievement-modal" role="dialog" aria-modal="true" aria-labelledby="achievement-title">
        <div className="modal-heading"><div><p className="section-kicker">{selectedAchievement.type} · {selectedAchievement.id}</p><h2 id="achievement-title">{selectedAchievement.title}</h2></div><button className="modal-close" type="button" aria-label="Close certificate details" autoFocus onClick={() => setSelectedAchievement(null)}>×</button></div>
        <p className="modal-description">{selectedAchievement.description}</p>
        {certificateUnavailable ? <div className="certificate-empty"><span className="certificate-icon" aria-hidden="true">PDF</span><strong>Certificate preview unavailable</strong><p>This certificate cannot be previewed right now.</p></div> : <iframe className="certificate-frame" title={`${selectedAchievement.title} certificate`} src={`${selectedAchievement.pdfUrl}#toolbar=0&navpanes=0`} onError={() => setCertificateUnavailable(true)} />}
      </section>
    </div>}
  </>;
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);