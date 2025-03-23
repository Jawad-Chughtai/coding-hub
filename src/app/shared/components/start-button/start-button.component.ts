import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-start-button',
  imports: [CommonModule],
  templateUrl: './start-button.component.html',
  styleUrl: './start-button.component.scss'
})
export class StartButtonComponent {
  @Output() onClick = new EventEmitter<any>();

  isClicked: boolean = false;
  hidden: boolean = false;

  clicked() {
    this.isClicked = true;
    window.setTimeout(() => { this.hidden = true; this.onClick.emit(); }, 1000);
  }
}
