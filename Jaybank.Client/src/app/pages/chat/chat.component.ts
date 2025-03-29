import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { EndChatDialogComponent } from '../../reuseable-components/end-chat-dialog/end-chat-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';

interface ChatMessage {
  chat_from_user?: string;  // User message
  response_from_ai?: string; // AI response
  time_sent?: string; // Only for user messages
  time_responded?: string; // Only for AI messages
}

@Component({
  selector: 'app-chat',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  animations: [
    trigger('messageAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit{

  @ViewChild('chatContainer') chatContainer!: ElementRef;

  greeting: string = "";

  currentTimestamp!: Date;

  userName: string | null = null;

  token: string | null = null;

  messages: ChatMessage[] = [];

  newMessage = "";

  typingIndicator = false;

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && localStorage) {
      this.userName = localStorage.getItem("userId");
    } else {
      console.warn('localStorage is not available.');
    }
    this.greeting = this.getGreeting();
    this.currentTimestamp = new Date();

    this.fetchAllChatHistory();
    this.scrollToBottom();
  }

  getGreeting(): string {
    const hours = new Date().getHours();
    if (hours < 12) {
      return "Good morning";
    } else if (hours < 18) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  }

  fetchAllChatHistory(): void {
    this.token = this.authService.getToken();

    this.chatService.getUserChatHistory(this.token).subscribe(userChats => {
      this.chatService.getAIChatHistory(this.token).subscribe(aiChats => {
        
        // Merge user and AI messages
        this.messages = [...userChats, ...aiChats];

        // Sort messages based on time (earliest first)
        this.messages.sort((a, b) => {
          const timeA = new Date(a.time_sent ?? a.time_responded ?? "").getTime();
          const timeB = new Date(b.time_sent ?? b.time_responded ?? "").getTime();
          return timeA - timeB;
        });

        // Force UI to update
        this.cdRef.detectChanges();  // 👈 Add this line
      });
      console.log("Sorted chat history:", this.messages);
    });
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    // Get token
    this.token = this.authService.getToken();

    // Add user message to UI
    const userMessage: ChatMessage = {
      chat_from_user: this.newMessage,
    };

    this.messages.push(userMessage);
    this.scrollToBottom();
    this.newMessage = "";

    // Send message to backend
    this.chatService.sendUserMessage(userMessage.chat_from_user ?? "", this.token)
    .subscribe({
      next: (res: any) => {
        console.log(res);
        const aiMessage: ChatMessage = {
          response_from_ai: res.response || "No response received",
        };

        this.messages.push(aiMessage); // Add AI response to chat
        this.typingIndicator = false;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error("Error sending message:", error);
      }
    });

  }

  scrollToBottom() {
    try {
      setTimeout(() => {
        this.chatContainer.nativeElement.scrollTop = 
          this.chatContainer.nativeElement.scrollHeight;
      });
    } catch(err) {}
  }


  endChat() {
    const dialogRef = this.dialog.open(EndChatDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.messages = [];
        this.messages = [];
      }
    });
  }


}
