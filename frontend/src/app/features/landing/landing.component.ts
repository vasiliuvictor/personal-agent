import { Component, inject, OnInit, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- ── Sticky nav ─────────────────────────────────────────── -->
    <header class="l-nav" [class.l-nav--solid]="scrollY > 60">
      <div class="l-nav__inner container">
        <span class="l-brand">AgentScout</span>
        <div class="l-nav__actions">
          <a routerLink="/login"    class="btn btn-secondary btn-sm">Sign in</a>
          <a routerLink="/register" class="btn btn-primary   btn-sm">Get started free</a>
        </div>
      </div>
    </header>

    <!-- ── Hero ───────────────────────────────────────────────── -->
    <section class="hero">
      <!-- Layer 1 — far background, slowest (0.12×) -->
      <div class="hero__layer hero__layer--far"
           [style.transform]="'translateY(' + scrollY * 0.12 + 'px)'">
        <div class="ring ring--1"></div>
        <div class="ring ring--2"></div>
        <div class="dot dot--a"></div>
        <div class="dot dot--b"></div>
        <div class="dot dot--c"></div>
        <div class="dot dot--d"></div>
      </div>

      <!-- Layer 2 — mid orbs (0.32×) -->
      <div class="hero__layer hero__layer--mid"
           [style.transform]="'translateY(' + scrollY * 0.32 + 'px)'">
        <div class="orb orb--amber"></div>
        <div class="orb orb--teal"></div>
        <div class="orb orb--mauve"></div>
      </div>

      <!-- Layer 3 — foreground particles, fastest (0.55×) -->
      <div class="hero__layer hero__layer--near"
           [style.transform]="'translateY(' + scrollY * 0.55 + 'px)'">
        <div class="particle p--1"></div>
        <div class="particle p--2"></div>
        <div class="particle p--3"></div>
        <div class="particle p--4"></div>
      </div>

      <div class="hero__grid"></div>

      <div class="container hero__body">
        <div class="hero__pill">
          <span class="pill-dot"></span>
          AI-powered &nbsp;·&nbsp; Brave Search &nbsp;·&nbsp; Zero hallucinations
        </div>
        <h1 class="hero__h1">
          Your AI research scout,<br>always on patrol
        </h1>
        <p class="hero__sub">
          Define your topics, set a schedule, and let AgentScout sweep the web.
          Every insight is distilled by AI from <em>real, live URLs</em> —
          no guesswork, no fabricated facts.
        </p>
        <div class="hero__ctas">
          <a routerLink="/register" class="btn btn-primary hero__cta-main">
            Get started free
          </a>
          <a routerLink="/login" class="hero__ghost-link">
            Already have an account <span>→</span>
          </a>
        </div>
        <div class="hero__powered">
          Powered by Brave Search &amp; Google Gemini
        </div>
      </div>

      <button class="hero__scroll-hint" (click)="scrollTo('how')">
        <div class="chevron-down"></div>
      </button>
    </section>

    <!-- ── How it works ───────────────────────────────────────── -->
    <section class="section-cream" id="how">
      <div class="container">
        <div class="reveal">
          <p class="eyebrow">How it works</p>
          <h2 class="section-h2">Three steps from topic to insight</h2>
        </div>

        <div class="steps">
          <div class="step card reveal" style="--delay:0s">
            <span class="step__num">01</span>
            <div class="step__icon step__icon--amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="11" y1="8"  x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
            </div>
            <h3>Create an agent</h3>
            <p>Pick keywords and a search frequency. Your scout is deployed in seconds — no code required.</p>
          </div>

          <div class="step-connector" aria-hidden="true">→</div>

          <div class="step card reveal" style="--delay:0.15s">
            <span class="step__num">02</span>
            <div class="step__icon step__icon--teal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h3>It runs automatically</h3>
            <p>On your schedule, AgentScout fires a live Brave Search and collects the freshest web results.</p>
          </div>

          <div class="step-connector" aria-hidden="true">→</div>

          <div class="step card reveal" style="--delay:0.3s">
            <span class="step__num">03</span>
            <div class="step__icon step__icon--mauve">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
            </div>
            <h3>You get verified insights</h3>
            <p>AI reads the actual content from each URL and writes a cited brief. Every claim links to its source.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Truth (parallax dark) ──────────────────────────────── -->
    <section class="section-dark parallax-bg">
      <div class="container">
        <div class="truth reveal reveal--left">
          <p class="eyebrow light">Grounded in reality</p>
          <h2 class="section-h2 light">No hallucinations, ever.</h2>
          <p class="truth__body">
            Most AI assistants guess when they're uncertain. AgentScout never does.
            Every insight is generated exclusively by processing the <strong>actual content
            retrieved from real search result URLs</strong>. The model sees only what the
            web returns — and every fact it writes is linked to its source.
          </p>
          <div class="truth__stats">
            <div class="tstat reveal reveal--scale" style="--delay:0.1s">
              <span class="tstat__val">100%</span>
              <span class="tstat__lbl">Source-verified claims</span>
            </div>
            <div class="tstat__sep"></div>
            <div class="tstat reveal reveal--scale" style="--delay:0.25s">
              <span class="tstat__val">0</span>
              <span class="tstat__lbl">Invented facts</span>
            </div>
            <div class="tstat__sep"></div>
            <div class="tstat reveal reveal--scale" style="--delay:0.4s">
              <span class="tstat__val">∞</span>
              <span class="tstat__lbl">Topics you can track</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Features ───────────────────────────────────────────── -->
    <section class="section-cream">
      <div class="container">
        <div class="reveal">
          <p class="eyebrow">What you get</p>
          <h2 class="section-h2">Everything you need, nothing you don't</h2>
        </div>
        <div class="features">
          <div class="feat card reveal" style="--delay:0s">
            <div class="feat__icon feat__icon--amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
            </div>
            <h4>Scheduled automation</h4>
            <p>Hourly, daily, or weekly. Set it once and your agents run indefinitely.</p>
          </div>
          <div class="feat card reveal" style="--delay:0.08s">
            <div class="feat__icon feat__icon--teal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="6" height="6" rx="1"/><rect x="9" y="3" width="6" height="6" rx="1"/>
                <rect x="16" y="3" width="6" height="6" rx="1"/><rect x="2" y="11" width="6" height="6" rx="1"/>
                <rect x="9" y="11" width="6" height="6" rx="1"/><rect x="16" y="11" width="6" height="6" rx="1"/>
              </svg>
            </div>
            <h4>Multiple agents</h4>
            <p>Track different topics simultaneously, each with its own keywords and cadence.</p>
          </div>
          <div class="feat card reveal" style="--delay:0.16s">
            <div class="feat__icon feat__icon--mauve">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </div>
            <h4>Cited sources</h4>
            <p>Every insight links back to the exact URLs the AI read. Verify any claim in one click.</p>
          </div>
          <div class="feat card reveal" style="--delay:0.24s">
            <div class="feat__icon feat__icon--amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <h4>Email digests</h4>
            <p>Opt in to receive new insights straight to your inbox the moment they're generated.</p>
          </div>
          <div class="feat card reveal" style="--delay:0.32s">
            <div class="feat__icon feat__icon--teal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="21 8 21 21 3 21 3 8"/>
                <rect x="1" y="3" width="22" height="5"/>
                <line x1="10" y1="12" x2="14" y2="12"/>
              </svg>
            </div>
            <h4>Inbox &amp; archive</h4>
            <p>New insights land first. Mark as read to archive — or flip to review everything.</p>
          </div>
          <div class="feat card reveal" style="--delay:0.4s">
            <div class="feat__icon feat__icon--mauve">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
            </div>
            <h4>Zero hallucinations</h4>
            <p>The AI processes only URLs provided as sources. It cannot invent facts it hasn't read.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── CTA ────────────────────────────────────────────────── -->
    <section class="section-cta">
      <div class="container">
        <div class="cta-box reveal reveal--scale">
          <div class="cta-orb"></div>
          <h2 class="cta__h2">Stay ahead of your topics — automatically</h2>
          <p class="cta__sub">Create your first agent in under a minute. No credit card required.</p>
          <a routerLink="/register" class="btn btn-primary cta__btn">
            Create your first agent →
          </a>
        </div>
      </div>
    </section>

    <!-- ── Footer ─────────────────────────────────────────────── -->
    <footer class="l-footer">
      <div class="container l-footer__inner">
        <span class="l-brand">AgentScout</span>
        <span class="l-footer__tagline">AI-powered research, grounded in truth.</span>
        <div class="l-footer__links">
          <a routerLink="/login">Sign in</a>
          <a routerLink="/register">Register</a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host { display: block; }

    /* ── Scroll-reveal base ──────────────────── */
    .reveal {
      opacity: 0;
      transform: translateY(44px);
      transition:
        opacity  0.7s ease         var(--delay, 0s),
        transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) var(--delay, 0s);
    }
    .reveal--left {
      transform: translateX(-52px);
    }
    .reveal--scale {
      transform: scale(0.88) translateY(20px);
    }
    .reveal.in-view {
      opacity: 1;
      transform: none;
    }

    /* ── Nav ──────────────────────────────────── */
    .l-nav {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 200;
      transition: background 0.35s, box-shadow 0.35s;
    }
    .l-nav--solid {
      background: rgba(10, 24, 35, 0.9);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      box-shadow: 0 2px 24px rgba(0, 0, 0, 0.4);
    }
    .l-nav__inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
    }
    .l-brand {
      font-weight: 800;
      font-size: 1.15rem;
      color: #E9C46A;
      letter-spacing: -0.01em;
    }
    .l-nav__actions { display: flex; gap: 0.6rem; }

    /* ── Hero ─────────────────────────────────── */
    .hero {
      position: relative;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: linear-gradient(140deg, #0b1d2a 0%, #112233 45%, #0e2a38 100%);
      padding: 7rem 0 5rem;
    }

    /* Parallax layers */
    .hero__layer {
      position: absolute;
      inset: -30% -10%;
      pointer-events: none;
      will-change: transform;
    }

    /* Layer 1 — rings & dots (far / slowest) */
    .ring {
      position: absolute;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.04);
    }
    .ring--1 { width: 700px; height: 700px; top: -15%; left: -10%; }
    .ring--2 { width: 460px; height: 460px; bottom: 0; right: -5%; }
    .dot {
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.07);
    }
    .dot--a { width: 6px;  height: 6px;  top: 22%;  left: 18%; }
    .dot--b { width: 10px; height: 10px; top: 68%;  left: 75%; }
    .dot--c { width: 5px;  height: 5px;  top: 42%;  left: 58%; }
    .dot--d { width: 8px;  height: 8px;  top: 80%;  left: 32%; }

    /* Layer 2 — ambient orbs (mid) */
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(90px);
    }
    .orb--amber {
      width: 560px; height: 560px;
      background: #E9C46A;
      bottom: -140px; right: -80px;
      opacity: 0.18;
    }
    .orb--teal {
      width: 480px; height: 480px;
      background: #2d5f72;
      top: -100px; left: -60px;
      opacity: 0.45;
    }
    .orb--mauve {
      width: 320px; height: 320px;
      background: #B5838D;
      top: 30%; right: 15%;
      opacity: 0.22;
    }

    /* Layer 3 — foreground particles (near / fastest) */
    .particle {
      position: absolute;
      border-radius: 50%;
      background: rgba(233,196,106,0.18);
      filter: blur(1px);
    }
    .p--1 { width: 14px; height: 14px; top: 28%; left: 12%; }
    .p--2 { width: 8px;  height: 8px;  top: 55%; left: 88%; }
    .p--3 { width: 18px; height: 18px; top: 72%; left: 22%; }
    .p--4 { width: 10px; height: 10px; top: 18%; right: 20%; }

    /* Grid overlay */
    .hero__grid {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background-image:
        linear-gradient(rgba(255,255,255,0.026) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.026) 1px, transparent 1px);
      background-size: 52px 52px;
    }

    /* Hero content — CSS entry animations */
    .hero__body {
      position: relative;
      z-index: 2;
      text-align: center;
      max-width: 760px;
      margin: 0 auto;
    }
    .hero__pill    { animation: fadeUp 0.6s ease 0.15s both; }
    .hero__h1      { animation: fadeUp 0.7s ease 0.3s  both; }
    .hero__sub     { animation: fadeUp 0.7s ease 0.45s both; }
    .hero__ctas    { animation: fadeUp 0.7s ease 0.6s  both; }
    .hero__powered { animation: fadeUp 0.6s ease 0.75s both; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .hero__pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #E9C46A;
      background: rgba(233,196,106,0.1);
      border: 1px solid rgba(233,196,106,0.25);
      border-radius: 999px;
      padding: 0.35rem 1rem;
      margin-bottom: 1.75rem;
    }
    .pill-dot {
      width: 6px; height: 6px;
      background: #E9C46A;
      border-radius: 50%;
      animation: pulse-dot 2s ease-in-out infinite;
    }
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.4; transform: scale(0.65); }
    }
    .hero__h1 {
      font-size: clamp(2.4rem, 5.5vw, 3.8rem);
      font-weight: 800;
      line-height: 1.12;
      letter-spacing: -0.03em;
      color: #fff;
      margin: 0 0 1.4rem;
    }
    .hero__sub {
      font-size: clamp(1rem, 2vw, 1.15rem);
      line-height: 1.7;
      color: rgba(255,255,255,0.62);
      max-width: 580px;
      margin: 0 auto 2.25rem;
      em { color: rgba(233,196,106,0.85); font-style: normal; }
    }
    .hero__ctas {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.25rem;
      flex-wrap: wrap;
      margin-bottom: 2rem;
    }
    .hero__cta-main {
      font-size: 1rem;
      padding: 0.75rem 1.9rem;
      box-shadow: 0 8px 28px rgba(233,196,106,0.35);
    }
    .hero__ghost-link {
      color: rgba(255,255,255,0.55);
      font-size: 0.92rem;
      font-weight: 500;
      text-decoration: none;
      transition: color 0.2s;
      span { display: inline-block; transition: transform 0.2s; }
      &:hover { color: rgba(255,255,255,0.9); text-decoration: none;
        span { transform: translateX(4px); } }
    }
    .hero__powered {
      font-size: 0.74rem;
      color: rgba(255,255,255,0.28);
      letter-spacing: 0.03em;
    }
    .hero__scroll-hint {
      position: absolute;
      bottom: 2rem; left: 50%;
      transform: translateX(-50%);
      background: none;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 50%;
      width: 40px; height: 40px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      animation: bob 2.5s ease-in-out infinite;
      z-index: 2;
      transition: border-color 0.2s, background 0.2s;
      &:hover { border-color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.06); }
    }
    .chevron-down {
      width: 10px; height: 10px;
      border-right: 2px solid rgba(255,255,255,0.5);
      border-bottom: 2px solid rgba(255,255,255,0.5);
      transform: rotate(45deg) translateY(-2px);
    }
    @keyframes bob {
      0%, 100% { transform: translateX(-50%) translateY(0); }
      50%       { transform: translateX(-50%) translateY(7px); }
    }

    /* ── Section shells ───────────────────────── */
    .section-cream { padding: 5.5rem 0; }
    .section-dark  { padding: 5.5rem 0; }
    .parallax-bg {
      background: linear-gradient(140deg, #081520 0%, #112233 50%, #152e3e 100%);
      background-attachment: fixed;
    }

    .eyebrow {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #B5838D;
      margin: 0 0 0.75rem;
      &.light { color: rgba(233,196,106,0.7); }
    }
    .section-h2 {
      font-size: clamp(1.7rem, 3.5vw, 2.4rem);
      font-weight: 800;
      letter-spacing: -0.025em;
      color: #264653;
      margin: 0 0 3rem;
      line-height: 1.2;
      &.light { color: #fff; }
    }

    /* ── Steps ────────────────────────────────── */
    .steps {
      display: flex;
      align-items: flex-start;
    }
    .step {
      flex: 1;
      padding: 2rem 1.75rem;
    }
    .step__num {
      display: block;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: #9db5c0;
      margin-bottom: 1rem;
    }
    .step__icon {
      width: 48px; height: 48px;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 1.1rem;
      svg { width: 22px; height: 22px; }
    }
    .step__icon--amber { background: rgba(233,196,106,0.15); color: #c49000; }
    .step__icon--teal  { background: rgba(38,70,83,0.1);     color: #264653; }
    .step__icon--mauve { background: rgba(181,131,141,0.14);  color: #9a5060; }
    .step h3 { font-size: 1.05rem; font-weight: 700; color: #264653; margin: 0 0 0.6rem; }
    .step p  { font-size: 0.88rem; line-height: 1.65; color: #6d8f9e; margin: 0; }
    .step-connector {
      flex-shrink: 0;
      font-size: 1.5rem;
      color: rgba(38,70,83,0.18);
      padding: 0 0.25rem;
      margin-top: 3.5rem;
      user-select: none;
    }

    /* ── Truth ────────────────────────────────── */
    .truth { max-width: 720px; }
    .truth__body {
      font-size: 1.05rem;
      line-height: 1.8;
      color: rgba(255,255,255,0.65);
      margin: 0 0 3rem;
      strong { color: rgba(233,196,106,0.9); font-weight: 600; }
    }
    .truth__stats {
      display: flex;
      align-items: center;
      gap: 2.5rem;
      flex-wrap: wrap;
    }
    .tstat { text-align: left; }
    .tstat__val {
      display: block;
      font-size: 2.2rem;
      font-weight: 800;
      color: #E9C46A;
      line-height: 1;
      margin-bottom: 0.3rem;
      letter-spacing: -0.03em;
    }
    .tstat__lbl { font-size: 0.78rem; color: rgba(255,255,255,0.4); font-weight: 500; }
    .tstat__sep {
      width: 1px; height: 48px;
      background: rgba(255,255,255,0.1);
      flex-shrink: 0;
    }

    /* ── Features ─────────────────────────────── */
    .features {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
    }
    .feat {
      padding: 1.75rem;
      transition: transform 0.2s, box-shadow 0.2s;
      &:hover {
        transform: translateY(-4px);
        box-shadow:
          0 16px 44px rgba(180,130,100,0.16),
          0 4px 12px rgba(180,130,100,0.08),
          inset 0 1px 0 rgba(255,255,255,0.98);
      }
    }
    .feat__icon {
      width: 44px; height: 44px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 1rem;
      svg { width: 20px; height: 20px; }
    }
    .feat__icon--amber { background: rgba(233,196,106,0.15); color: #c49000; }
    .feat__icon--teal  { background: rgba(38,70,83,0.1);     color: #264653; }
    .feat__icon--mauve { background: rgba(181,131,141,0.14);  color: #9a5060; }
    .feat h4 { font-size: 0.95rem; font-weight: 700; color: #264653; margin: 0 0 0.5rem; }
    .feat p  { font-size: 0.855rem; line-height: 1.65; color: #6d8f9e; margin: 0; }

    /* ── CTA ──────────────────────────────────── */
    .section-cta {
      padding: 5.5rem 0;
      background: linear-gradient(135deg, #0b1d2a 0%, #1D2D35 100%);
    }
    .cta-box {
      position: relative;
      text-align: center;
      max-width: 640px;
      margin: 0 auto;
      padding: 4rem 2.5rem;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 24px;
      overflow: hidden;
    }
    .cta-orb {
      position: absolute;
      width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(233,196,106,0.14) 0%, transparent 70%);
      border-radius: 50%;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
    }
    .cta__h2 {
      position: relative;
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 800;
      color: #fff;
      margin: 0 0 0.9rem;
      letter-spacing: -0.025em;
    }
    .cta__sub {
      position: relative;
      font-size: 0.95rem;
      color: rgba(255,255,255,0.48);
      margin: 0 0 2rem;
    }
    .cta__btn {
      position: relative;
      font-size: 1rem;
      padding: 0.8rem 2rem;
      box-shadow: 0 8px 28px rgba(233,196,106,0.35);
    }

    /* ── Footer ───────────────────────────────── */
    .l-footer { background: #070f16; padding: 2rem 0; }
    .l-footer__inner {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    .l-footer__tagline { font-size: 0.82rem; color: rgba(255,255,255,0.25); flex: 1; }
    .l-footer__links {
      display: flex; gap: 1.25rem;
      a {
        font-size: 0.82rem;
        color: rgba(255,255,255,0.35);
        text-decoration: none;
        &:hover { color: rgba(255,255,255,0.65); text-decoration: none; }
      }
    }

    /* ── Responsive ───────────────────────────── */
    @media (max-width: 860px) {
      .steps { flex-direction: column; max-width: 480px; }
      .step-connector { display: none; }
      .features { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 560px) {
      .features { grid-template-columns: 1fr; }
      .truth__stats { gap: 1.5rem; }
      .tstat__sep { display: none; }
    }
  `],
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  scrollY = 0;
  private observer!: IntersectionObserver;

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            // unobserve after first trigger so it doesn't re-hide on scroll up
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll('.reveal').forEach(el => this.observer.observe(el));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrollY = window.scrollY;
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}
