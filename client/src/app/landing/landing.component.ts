
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, OnDestroy {

  isScrolled   : boolean = false;
  menuOpen     : boolean = false;
  submitted    : boolean = false;
  contactForm  : FormGroup;

  private observer!: IntersectionObserver;

  constructor(
    private router : Router,
    private fb     : FormBuilder
  ) {
    this.contactForm = this.fb.group({
      firstName : ['', Validators.required],
      lastName  : ['', Validators.required],
      email     : ['', [Validators.required, Validators.email]],
      subject   : ['', Validators.required],
      message   : ['', Validators.required]
    });
  }

  // ── Lifecycle ──────────────────────────────────
  ngOnInit(): void {
    this.initScrollReveal();
  }

  ngOnDestroy(): void {
    if (this.observer) this.observer.disconnect();
  }

  // ── Scroll & Nav ───────────────────────────────
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 40;
  }

  scrollTo(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  toggleMenu(): void { this.menuOpen = !this.menuOpen; }

  // ── Routing ────────────────────────────────────
  goToLogin()    : void { this.router.navigate(['/login']);    }
  goToRegister() : void { this.router.navigate(['/registration']); }

  // ── Contact Form ───────────────────────────────
  onSubmit(): void {
    if (this.contactForm.valid) {
      this.submitted = true;
      setTimeout(() => {
        this.submitted = false;
        this.contactForm.reset();
      }, 5000);
    } else {
      this.contactForm.markAllAsTouched();
    }
  }

  // ── Scroll Reveal via IntersectionObserver ─────
  private initScrollReveal(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // Stagger siblings inside the same parent
            const siblings = entry.target.parentElement
              ? Array.from(entry.target.parentElement.querySelectorAll('.reveal'))
              : [];
            const delay = siblings.indexOf(entry.target) * 80;

            setTimeout(() => {
              entry.target.classList.add('visible');
            }, delay);

            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    // Observe after next frame so Angular has rendered
    requestAnimationFrame(() => {
      document.querySelectorAll('.reveal').forEach(el => this.observer.observe(el));
    });
  }
}