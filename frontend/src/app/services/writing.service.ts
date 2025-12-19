import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface WritingResponse {
  original: string;
  result: string;
  length?: string;
  provider?: string;
}

export interface ProviderInfo {
  current: string;
  info: {
    name: string;
    free: boolean;
    description: string;
  };
  available: string[];
}

export type SummaryLength = 'short' | 'medium' | 'detailed';

@Injectable({
  providedIn: 'root'
})
export class WritingService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProviderInfo(): Observable<ProviderInfo> {
    return this.http.get<ProviderInfo>(`${this.apiUrl}/provider`);
  }

  fixGrammar(text: string): Observable<WritingResponse> {
    return this.http.post<WritingResponse>(`${this.apiUrl}/grammar`, { text });
  }

  improveWriting(text: string): Observable<WritingResponse> {
    return this.http.post<WritingResponse>(`${this.apiUrl}/improve`, { text });
  }

  summarize(text: string, length: SummaryLength = 'medium'): Observable<WritingResponse> {
    return this.http.post<WritingResponse>(`${this.apiUrl}/summarize`, { text, length });
  }

  shorten(text: string): Observable<WritingResponse> {
    return this.http.post<WritingResponse>(`${this.apiUrl}/shorten`, { text });
  }
}
