import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { WritingService, SummaryLength, ProviderInfo } from './services/writing.service';

interface OperationType {
  id: string;
  label: string;
  icon: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="app-container">
      <!-- Header -->
      <header class="header">
        <div class="logo">
          <span class="logo-icon">✦</span>
          <span class="logo-text">WriteAI</span>
        </div>
        <p class="tagline">Transform your writing with AI-powered assistance</p>
        
        <!-- Provider Badge -->
        @if (providerInfo) {
          <div class="provider-badge" [class.free]="providerInfo.info.free" [@fadeSlide]>
            <span class="provider-icon">{{ providerInfo.info.free ? '🆓' : '💎' }}</span>
            <span class="provider-name">{{ providerInfo.info.name }}</span>
            @if (providerInfo.info.free) {
              <span class="free-tag">FREE</span>
            }
          </div>
        }
      </header>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Operation Selector -->
        <section class="operation-selector" [@fadeSlide]>
          <h2 class="section-title">Choose an action</h2>
          <div class="operations-grid">
            @for (op of operations; track op.id) {
              <button 
                class="operation-card"
                [class.selected]="selectedOperation === op.id"
                [style.--accent-color]="op.color"
                (click)="selectOperation(op.id)"
              >
                <span class="op-icon">{{ op.icon }}</span>
                <span class="op-label">{{ op.label }}</span>
                <span class="op-description">{{ op.description }}</span>
              </button>
            }
          </div>
        </section>

        <!-- Summary Length Option -->
        @if (selectedOperation === 'summarize') {
          <section class="summary-options" [@fadeSlide]>
            <h3 class="option-title">Summary length</h3>
            <div class="length-options">
              @for (len of summaryLengths; track len.id) {
                <button 
                  class="length-btn"
                  [class.selected]="summaryLength === len.id"
                  (click)="summaryLength = len.id"
                >
                  {{ len.label }}
                </button>
              }
            </div>
          </section>
        }

        <!-- Text Input & Output -->
        <section class="editor-section" [@fadeSlide]>
          <div class="editor-panels">
            <!-- Input Panel -->
            <div class="panel input-panel">
              <div class="panel-header">
                <h3>
                  <span class="panel-icon">📝</span>
                  Your Text
                </h3>
                <span class="char-count">{{ inputText.length }} characters</span>
              </div>
              <textarea 
                class="text-area"
                [(ngModel)]="inputText"
                placeholder="Paste or type your text here..."
                [disabled]="isLoading"
              ></textarea>
              <div class="panel-actions">
                <button class="btn-secondary" (click)="clearInput()" [disabled]="!inputText || isLoading">
                  Clear
                </button>
                <button class="btn-secondary" (click)="pasteFromClipboard()" [disabled]="isLoading">
                  Paste
                </button>
              </div>
            </div>

            <!-- Process Button -->
            <div class="process-section">
              <button 
                class="process-btn"
                [disabled]="!inputText || isLoading"
                (click)="processText()"
              >
                @if (isLoading) {
                  <span class="spinner"></span>
                  Processing...
                } @else {
                  <span class="btn-icon">✨</span>
                  Transform
                }
              </button>
            </div>

            <!-- Output Panel -->
            <div class="panel output-panel" [class.has-content]="outputText">
              <div class="panel-header">
                <h3>
                  <span class="panel-icon">🎯</span>
                  Result
                </h3>
                @if (outputText) {
                  <span class="char-count">{{ outputText.length }} characters</span>
                }
              </div>
              @if (outputText) {
                <div class="text-area result-text" [@fadeSlide]>
                  {{ outputText }}
                </div>
                <div class="panel-actions">
                  <button class="btn-secondary" (click)="copyToClipboard()">
                    {{ copied ? '✓ Copied!' : 'Copy' }}
                  </button>
                  <button class="btn-secondary" (click)="useAsInput()">
                    Use as Input
                  </button>
                </div>
              } @else {
                <div class="empty-state">
                  <span class="empty-icon">↑</span>
                  <p>Your transformed text will appear here</p>
                </div>
              }
            </div>
          </div>
        </section>

        <!-- Error Message -->
        @if (errorMessage) {
          <div class="error-toast" [@fadeSlide]>
            <span class="error-icon">⚠️</span>
            {{ errorMessage }}
            <button class="close-btn" (click)="errorMessage = ''">×</button>
          </div>
        }
      </main>

      <!-- Footer -->
      <footer class="footer">
        <p>Built with Angular & AI • <span class="heart">♥</span> POC Project</p>
        @if (providerInfo?.current === 'demo') {
          <p class="demo-notice">
            🔧 Running in Demo Mode - 
            <a href="https://console.groq.com" target="_blank">Get free Groq API key</a> for real AI
          </p>
        }
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    // Header
    .header {
      text-align: center;
      padding: 2rem 0 3rem;
      animation: fadeIn 0.6s ease-out;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .logo-icon {
      font-size: 2.5rem;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .logo-text {
      font-size: 2.5rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .tagline {
      color: var(--color-text-secondary);
      font-size: 1.1rem;
      font-weight: 400;
      margin-bottom: 1rem;
    }

    // Provider Badge
    .provider-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-bg-elevated);
      border-radius: var(--radius-xl);
      font-size: 0.8125rem;
      color: var(--color-text-secondary);

      &.free {
        border-color: var(--color-accent-secondary);
        background: rgba(166, 226, 46, 0.1);
      }

      .provider-icon {
        font-size: 1rem;
      }

      .provider-name {
        font-weight: 500;
      }

      .free-tag {
        background: var(--color-accent-secondary);
        color: var(--color-bg-primary);
        padding: 0.125rem 0.5rem;
        border-radius: var(--radius-sm);
        font-size: 0.6875rem;
        font-weight: 700;
        letter-spacing: 0.05em;
      }
    }

    // Section Title
    .section-title {
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--color-text-muted);
      margin-bottom: 1rem;
    }

    // Operations Grid
    .operation-selector {
      margin-bottom: 2rem;
    }

    .operations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .operation-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.5rem 1rem;
      background: var(--color-bg-secondary);
      border: 2px solid transparent;
      border-radius: var(--radius-lg);
      transition: all var(--transition-normal);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, var(--accent-color, var(--color-accent-primary)) 0%, transparent 100%);
        opacity: 0;
        transition: opacity var(--transition-normal);
      }

      &:hover {
        transform: translateY(-2px);
        border-color: var(--accent-color, var(--color-accent-primary));
        box-shadow: var(--shadow-md), 0 0 30px rgba(102, 217, 239, 0.1);
        
        &::before {
          opacity: 0.05;
        }
      }

      &.selected {
        border-color: var(--accent-color, var(--color-accent-primary));
        background: var(--color-bg-tertiary);
        
        &::before {
          opacity: 0.1;
        }

        .op-icon {
          transform: scale(1.1);
        }
      }
    }

    .op-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      transition: transform var(--transition-normal);
    }

    .op-label {
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 0.25rem;
    }

    .op-description {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      text-align: center;
    }

    // Summary Options
    .summary-options {
      margin-bottom: 2rem;
    }

    .option-title {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--color-text-muted);
      margin-bottom: 0.75rem;
    }

    .length-options {
      display: flex;
      gap: 0.5rem;
    }

    .length-btn {
      padding: 0.5rem 1.25rem;
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-bg-elevated);
      border-radius: var(--radius-md);
      color: var(--color-text-secondary);
      font-weight: 500;
      font-size: 0.875rem;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--color-bg-tertiary);
        color: var(--color-text-primary);
      }

      &.selected {
        background: var(--color-accent-primary);
        color: var(--color-bg-primary);
        border-color: var(--color-accent-primary);
      }
    }

    // Editor Section
    .editor-section {
      flex: 1;
    }

    .editor-panels {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 1.5rem;
      align-items: stretch;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
    }

    .panel {
      background: var(--color-bg-secondary);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      min-height: 350px;
      border: 1px solid var(--color-bg-tertiary);
      transition: all var(--transition-normal);

      &:hover {
        border-color: var(--color-bg-elevated);
      }
    }

    .output-panel.has-content {
      border-color: var(--color-accent-secondary);
      box-shadow: 0 0 30px rgba(166, 226, 46, 0.1);
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--color-bg-tertiary);

      h3 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--color-text-primary);
      }

      .panel-icon {
        font-size: 1rem;
      }
    }

    .char-count {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      font-family: var(--font-mono);
    }

    .text-area {
      flex: 1;
      width: 100%;
      background: var(--color-bg-primary);
      border: 1px solid var(--color-bg-tertiary);
      border-radius: var(--radius-md);
      padding: 1rem;
      color: var(--color-text-primary);
      font-size: 0.9375rem;
      line-height: 1.7;
      resize: none;
      transition: all var(--transition-fast);

      &:focus {
        outline: none;
        border-color: var(--color-accent-primary);
        box-shadow: 0 0 0 3px rgba(102, 217, 239, 0.1);
      }

      &::placeholder {
        color: var(--color-text-muted);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .result-text {
      white-space: pre-wrap;
      overflow-y: auto;
      border: none;
      background: transparent;
    }

    .panel-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--color-bg-tertiary);
    }

    .btn-secondary {
      padding: 0.5rem 1rem;
      background: var(--color-bg-tertiary);
      border: 1px solid var(--color-bg-elevated);
      border-radius: var(--radius-sm);
      color: var(--color-text-secondary);
      font-size: 0.8125rem;
      font-weight: 500;
      transition: all var(--transition-fast);

      &:hover:not(:disabled) {
        background: var(--color-bg-elevated);
        color: var(--color-text-primary);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    // Process Section
    .process-section {
      display: flex;
      align-items: center;
      justify-content: center;

      @media (max-width: 900px) {
        padding: 0.5rem 0;
      }
    }

    .process-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem 2rem;
      background: var(--gradient-primary);
      border-radius: var(--radius-lg);
      color: var(--color-bg-primary);
      font-size: 1rem;
      font-weight: 600;
      min-width: 160px;
      transition: all var(--transition-normal);
      box-shadow: var(--shadow-md), 0 0 30px rgba(102, 217, 239, 0.2);

      &:hover:not(:disabled) {
        transform: scale(1.05);
        box-shadow: var(--shadow-lg), 0 0 40px rgba(102, 217, 239, 0.3);
      }

      &:active:not(:disabled) {
        transform: scale(0.98);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .btn-icon {
        font-size: 1.125rem;
      }
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(30, 30, 46, 0.3);
      border-top-color: var(--color-bg-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    // Empty State
    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--color-text-muted);
      gap: 0.75rem;

      .empty-icon {
        font-size: 2rem;
        opacity: 0.5;
      }

      p {
        font-size: 0.875rem;
      }
    }

    // Error Toast
    .error-toast {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      background: var(--color-accent-tertiary);
      border-radius: var(--radius-md);
      color: white;
      font-weight: 500;
      box-shadow: var(--shadow-lg);
      z-index: 1000;

      .error-icon {
        font-size: 1.125rem;
      }

      .close-btn {
        margin-left: 0.5rem;
        font-size: 1.25rem;
        opacity: 0.7;
        transition: opacity var(--transition-fast);

        &:hover {
          opacity: 1;
        }
      }
    }

    // Footer
    .footer {
      text-align: center;
      padding: 2rem 0 1rem;
      color: var(--color-text-muted);
      font-size: 0.8125rem;

      .heart {
        color: var(--color-accent-tertiary);
      }

      .demo-notice {
        margin-top: 0.5rem;
        font-size: 0.75rem;
        
        a {
          color: var(--color-accent-primary);
          text-decoration: none;
          
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  `],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class AppComponent implements OnInit {
  inputText = '';
  outputText = '';
  selectedOperation = 'grammar';
  summaryLength: SummaryLength = 'medium';
  isLoading = false;
  errorMessage = '';
  copied = false;
  providerInfo: ProviderInfo | null = null;

  operations: OperationType[] = [
    {
      id: 'grammar',
      label: 'Fix Grammar',
      icon: '📝',
      description: 'Correct spelling & grammar',
      color: '#66d9ef'
    },
    {
      id: 'improve',
      label: 'Improve Writing',
      icon: '✨',
      description: 'Enhance clarity & tone',
      color: '#a6e22e'
    },
    {
      id: 'summarize',
      label: 'Summarize',
      icon: '📋',
      description: 'Create a concise summary',
      color: '#ae81ff'
    },
    {
      id: 'shorten',
      label: 'Make Shorter',
      icon: '✂️',
      description: 'Reduce length, keep meaning',
      color: '#fd971f'
    }
  ];

  summaryLengths = [
    { id: 'short' as SummaryLength, label: 'Short' },
    { id: 'medium' as SummaryLength, label: 'Medium' },
    { id: 'detailed' as SummaryLength, label: 'Detailed' }
  ];

  constructor(private writingService: WritingService) {}

  ngOnInit() {
    this.loadProviderInfo();
  }

  loadProviderInfo() {
    this.writingService.getProviderInfo().subscribe({
      next: (info) => {
        this.providerInfo = info;
      },
      error: () => {
        // Backend not available yet
        console.log('Backend not available');
      }
    });
  }

  selectOperation(id: string) {
    this.selectedOperation = id;
  }

  clearInput() {
    this.inputText = '';
    this.outputText = '';
  }

  async pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      this.inputText = text;
    } catch {
      this.errorMessage = 'Unable to access clipboard. Please paste manually.';
    }
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.outputText).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    });
  }

  useAsInput() {
    this.inputText = this.outputText;
    this.outputText = '';
  }

  processText() {
    if (!this.inputText.trim()) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    let request$;
    
    switch (this.selectedOperation) {
      case 'grammar':
        request$ = this.writingService.fixGrammar(this.inputText);
        break;
      case 'improve':
        request$ = this.writingService.improveWriting(this.inputText);
        break;
      case 'summarize':
        request$ = this.writingService.summarize(this.inputText, this.summaryLength);
        break;
      case 'shorten':
        request$ = this.writingService.shorten(this.inputText);
        break;
      default:
        request$ = this.writingService.fixGrammar(this.inputText);
    }
    
    request$.subscribe({
      next: (response) => {
        this.outputText = response.result;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Processing error:', error);
        this.errorMessage = 'Failed to process text. Please check if the backend is running.';
        this.isLoading = false;
      }
    });
  }
}
