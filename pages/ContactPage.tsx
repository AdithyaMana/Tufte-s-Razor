import React, { useState } from 'react';
import { Mail } from 'lucide-react';

/** Where messages go. The form has no server behind it: it opens the reader's email app. */
export const CONTACT_EMAIL = 'team@scienceux.org';

const TOPICS = ['Feedback on the guide', 'Report a mistake', 'Using it in teaching', 'Something else'];

const field =
  'mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2.5 text-[0.9375rem] text-content placeholder:text-content-2/60 focus:outline-none focus:border-content';

const Label: React.FC<{ htmlFor: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-[0.875rem] font-medium text-content">
    {children}
  </label>
);

/** A contact form that hands the message to the reader's own email app, so nothing is stored or sent by the site. */
const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState('');

  const send = (event: React.FormEvent) => {
    event.preventDefault();
    const subject = `Tufte's Razor: ${topic}`;
    const body = name ? `${message}\n\n${name}` : message;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section aria-labelledby="contact-title" className="max-w-6xl mx-auto px-4 md:px-8 pt-10 md:pt-16">
      <p className="kicker">Contact</p>
      <h1 id="contact-title" className="mt-4 font-serif text-[2.6rem] sm:text-6xl leading-[1.02] tracking-tight text-content">
        Get in touch
      </h1>
      <p className="article mt-5 max-w-2xl text-content-2 text-pretty">
        Spotted a mistake, using the guide in a class, or have an idea for it? We’d like to hear from you.
      </p>

      <div className="mt-10 md:mt-14 grid gap-12 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:gap-20 font-sans">
        <form onSubmit={send} className="space-y-5">
          <div>
            <Label htmlFor="contact-name">Your name</Label>
            <input id="contact-name" className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>
          <div>
            <Label htmlFor="contact-topic">What’s it about?</Label>
            <select id="contact-topic" className={field} value={topic} onChange={(e) => setTopic(e.target.value)}>
              {TOPICS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="contact-message">Message</Label>
            <textarea id="contact-message" className={`${field} min-h-40 resize-y`} value={message} onChange={(e) => setMessage(e.target.value)} required />
          </div>
          <div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 min-h-11 px-5 rounded-md bg-content text-paper text-[0.9375rem] font-medium hover:opacity-90"
            >
              <Mail size={16} aria-hidden="true" /> Write the email
            </button>
            <p className="mt-2 text-xs text-content-2">Opens your email app with this message ready to send. Nothing is stored on this site.</p>
          </div>
        </form>

        <div className="space-y-8 text-[0.9375rem] leading-relaxed">
          <div>
            <h2 className="text-[0.875rem] font-semibold text-content">Email</h2>
            <a href={`mailto:${CONTACT_EMAIL}`} className="mt-1 inline-block text-content-2 hover:text-content underline underline-offset-4 decoration-line-2">
              {CONTACT_EMAIL}
            </a>
          </div>
          <div>
            <h2 className="text-[0.875rem] font-semibold text-content">Talk about it</h2>
            <p className="mt-1 text-content-2">
              Questions about charts and posters are welcome on{' '}
              <a href="https://www.reddit.com/r/ScienceUX/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 decoration-line-2 hover:text-content">
                r/ScienceUX
              </a>
              .
            </p>
          </div>
          <div>
            <h2 className="text-[0.875rem] font-semibold text-content">More from ScienceUX</h2>
            <p className="mt-1 text-content-2">
              Articles and research on making science easier to read, at{' '}
              <a href="https://scienceux.org/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 decoration-line-2 hover:text-content">
                scienceux.org
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactPage;
