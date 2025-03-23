import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { css_beautify, html_beautify, js_beautify } from 'js-beautify';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { SharedService } from './shared/app.shared.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, MonacoEditorModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  editorOptions = { theme: 'vs-dark', minimap: { enabled: false }, wordWrap: 'on' };
  htmlEditorOptions = { ...this.editorOptions, language: 'html' };
  cssEditorOptions = { ...this.editorOptions, language: 'css' };
  jsEditorOptions = { ...this.editorOptions, language: 'javascript' };

  wordWrap: boolean = true;
  private valueChanged$ = new Subject<string>();

  public tabs: any = []
  public selectedTab: string;

  hidden: boolean = false;
  autoCodeStarted: boolean = false;

  constructor(sharedService: SharedService) {
    this.tabs = [
      { name: 'HTML', text: sharedService.html, value: '', options: this.htmlEditorOptions },
      { name: 'CSS', text: sharedService.css, value: '', options: this.cssEditorOptions },
      { name: 'JS', text: sharedService.js, value: '', options: this.jsEditorOptions }
    ]
    this.selectedTab = this.tabs[0].name;

    this.valueChanged$.pipe(debounceTime(300)).subscribe(() => {
      this.updateFrame();
    });
  }

  updateFrame() {
    const src = `<style>${this.tabs[1].value}</style> <script>${this.tabs[2].value}</script>${this.tabs[0].value}`

    let iframe = document.getElementById("previewFrame") as HTMLIFrameElement;
    if (iframe) {
      iframe.srcdoc = src;
    }
  }

  valueChanged() {
    this.valueChanged$.next('');
  }

  tabChanged(tabName: string) {
    this.selectedTab = tabName;
  }

  typeText(text: string, tab: any, delay: number) {
    return new Promise<void>((resolve) => {
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          tab.value += text[i];
          i++;
        } else {
          clearInterval(interval);
          resolve();
        }
      }, delay);
    });
  }

  startClicked() {
    this.hidden = true;
    window.setTimeout(() => {
      this.autoCodeStarted = true;
      window.setTimeout(() => {
        this.startCode();
      }, 1000);
    }, 1000);
  }

  resetCode(){
    window.location.reload();
  }

  startCode(tabIndex: any = 0) {
    if (tabIndex < 3) {
      const tab = this.tabs[tabIndex];
      this.beautify(tab);
      window.setTimeout(() => {
        this.selectedTab = tab.name;
        this.typeText(tab.text, tab, 10)
          .then(() => {
            this.valueChanged();
            this.startCode(tabIndex + 1);
          });
      }, 1000);
    }
  }

  beautify(tab: any) {
    const options: any = { indent_size: 2 };
    switch (tab.name) {
      case 'HTML':
        tab.text = html_beautify(tab.text, options);
        break;
      case 'CSS':
        tab.text = css_beautify(tab.text, options);
        break;
      case 'JS':
        tab.text = js_beautify(tab.text, options);
        break;
      default:
        return;
    }
  }

  toggleWrap(value: boolean) {
    this.wordWrap = value;
    this.tabs.forEach((tab: any) => {
      tab.options = { ...tab.options, wordWrap: value ? 'on' : 'false' }
    })
  }
}
