import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { EndChatDialogComponent } from '../../reuseable-components/end-chat-dialog/end-chat-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
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

  messages: ChatMessage[] = [
    {
      id: '1',
      sender: 'ai',
      text: "Hello! I'm your AI customer support assistant. How can I help you today?",
      timestamp: new Date(),
    }
  ];

  newMessage = '';

  typingIndicator = false;

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.scrollToBottom();
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: this.generateUniqueId(),
      sender: 'user',
      text: this.newMessage,
      timestamp: new Date(),
    };

    this.messages.push(userMessage);
    this.newMessage = '';
    this.scrollToBottom();

    // Simulate AI response
    this.simulateAIResponse(userMessage);
  }

  simulateAIResponse(userMessage: ChatMessage) {
    this.typingIndicator = true;

    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: this.generateUniqueId(),
        sender: 'ai',
        text: this.generateAIResponse(userMessage.text),
        timestamp: new Date(),
      };

      this.messages.push(aiResponse);
      this.typingIndicator = false;
      this.scrollToBottom();
    }, 1500);
  }

  generateAIResponse(userMessage: string): string {
    const responses = [
      "Thank you for your message. Could you provide more details?",
      "I'm processing your request. One moment please.",
      "I understand your concern. Let me help you with that.",
      "Can you clarify your question further?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  scrollToBottom() {
    try {
      setTimeout(() => {
        this.chatContainer.nativeElement.scrollTop = 
          this.chatContainer.nativeElement.scrollHeight;
      });
    } catch(err) {}
  }

  generateUniqueId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  endChat() {
    const dialogRef = this.dialog.open(EndChatDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.messages = [];
        // Add initial welcome message
        this.messages.push({
          id: '1',
          sender: 'ai',
          text: "Hello! I'm your AI customer support assistant. How can I help you today?",
          timestamp: new Date(),
        });
      }
    });
  }


}
