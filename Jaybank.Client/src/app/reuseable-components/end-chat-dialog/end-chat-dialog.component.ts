import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-end-chat-dialog',
  imports: [
    MatDialogModule,
  ],
  templateUrl: './end-chat-dialog.component.html',
  styleUrl: './end-chat-dialog.component.css'
})
export class EndChatDialogComponent {

  constructor() {}


}
