import { Component, ElementRef, HostListener, inject, OnInit, ViewChild } from '@angular/core';
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
import { ToastrService } from 'ngx-toastr';
import { ChangeDetectorRef } from '@angular/core';

interface ChatMessage {
  chat_from_user?: string;
  response_from_ai?: string;
  query_id?: number;
  status?: 'pending' | 'processing' | 'completed';
  time_sent?: string;
  time_responded?: string;
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
  private toastr = inject(ToastrService);

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
      this.token = this.authService.getToken();
      this.userName = localStorage.getItem("userId");

      this.greeting = this.getGreeting();
      this.currentTimestamp = new Date();

      this.scrollToBottom();

      this.pollForResponses();
    } else {
      console.warn('localStorage is not available.');
    }
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

  submitUserMessage() {
    if (!this.newMessage.trim()) return;
  
    const chatMessage: ChatMessage = {
      chat_from_user: this.newMessage,
      status: 'pending',
      time_sent: new Date().toISOString()
    };
  
    this.messages.push(chatMessage);
    this.scrollToBottom();
  
    this.chatService.submitUserQuestion(this.newMessage, this.token).subscribe({
      next: (res) => {
        chatMessage.query_id = res.queryId;
        this.toastr.success(`${res.message}`);
      },
      error: (err) => {
        this.toastr.error("Failed to submit message");
        console.error(err);
      }
    });
  
    this.newMessage = '';
  }

  pollForResponses(): void {
    setInterval(() => {
      const pendingMessages = this.messages.filter(m => m.query_id && (m.status === 'pending' || m.status === 'processing'));
      pendingMessages.forEach(msg => {
        this.chatService.getQueueStatus(msg.query_id!, this.token).subscribe(status => {
          if (status === 'completed') {
            this.chatService.getAIResponseByQueryId(msg.query_id!, this.token).subscribe(response => {
              msg.response_from_ai = response.response;
              msg.status = 'completed';
              msg.time_responded = response.time.toISOString();
              this.scrollToBottom();
              this.toastr.info("AI has replied!");
            });
          }
        });
      });
    }, 5000); // Polling every 5 seconds
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
        this.typingIndicator = false;
        this.toastr.info("Chat ended. Welcome message retained.");
      }
    });
  }


}
