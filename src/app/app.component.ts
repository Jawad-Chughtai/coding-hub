import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { css_beautify, html_beautify, js_beautify } from 'js-beautify';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { SharedService } from './shared/app.shared.service';
import { StartButtonComponent } from "./shared/components/start-button/start-button.component";

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, MonacoEditorModule, StartButtonComponent, StartButtonComponent],
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
  interval: any;

  constructor(sharedService: SharedService) {
    this.tabs = [
      { name: 'HTML', text: sharedService.html, value: '', options: this.htmlEditorOptions, editor: null },
      { name: 'CSS', text: sharedService.css, value: '', options: this.cssEditorOptions, editor: null },
      { name: 'JS', text: sharedService.js, value: '', options: this.jsEditorOptions, editor: null }
    ];

    this.selectedTab = this.tabs[0].name;

    this.valueChanged$.pipe(debounceTime(300)).subscribe(() => {
      // this.updateFrame(true);
    });
  }

  onEditorInit(editor: any, tab: any) {
    tab.editor = editor;
  }

  updateFrame(value: boolean, isStyle: boolean, isScript: boolean) {
    const iframe = document.getElementById("previewFrame") as HTMLIFrameElement;
    if (!iframe || !iframe.contentDocument) return;

    if (value) {
      this.interval = setInterval(() => {
        const doc = iframe.contentDocument;
        if (!doc) return;

        if (isStyle) {
          // Update or create <style> tag
          let styleTag = doc.getElementById("live-style") as HTMLStyleElement;
          if (!styleTag) {
            styleTag = doc.createElement("style");
            styleTag.id = "live-style";
            doc.head.appendChild(styleTag);
          }
          styleTag.innerHTML = this.tabs[1].value;
        }

        // Update or create <script> tag
        let scriptTag = doc.getElementById("live-script") as HTMLScriptElement;
        if (!scriptTag) {
          scriptTag = doc.createElement("script");
          scriptTag.id = "live-script";
          doc.body.appendChild(scriptTag);
        } else {
          scriptTag.remove(); // Remove and recreate script to re-execute
          scriptTag = doc.createElement("script");
          scriptTag.id = "live-script";
          doc.body.appendChild(scriptTag);
        }
        scriptTag.innerHTML = this.tabs[2].value;

        if (isStyle) {
          // Instead of replacing body.innerHTML, update only the content area
          let contentDiv = doc.getElementById("live-content");
          if (!contentDiv) {
            contentDiv = doc.createElement("div");
            contentDiv.id = "live-content";
            doc.body.appendChild(contentDiv);
          }
          contentDiv.innerHTML = this.tabs[0].value;
        }
      }, 300)
    }
    else {
      clearInterval(this.interval)
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
          if (tab.editor) {
            const model = tab.editor.getModel();
            if (model) {
              const lineCount = model.getLineCount();
              const lastLineLength = model.getLineMaxColumn(lineCount);

              // Move cursor to end of the text
              tab.editor.setPosition({ lineNumber: lineCount, column: lastLineLength });
              tab.editor.revealLine(lineCount); // Scroll to cursor
              tab.editor.focus(); // Ensure cursor is visible
            }
          }
        } else {
          clearInterval(interval);
          resolve();
        }
      }, delay);
    });
  }

  resetCode() {
    window.location.reload();
  }

  startCode(tabIndex: any = 0) {
    if (tabIndex === 0)
      this.updateFrame(true, false, false);
    if (tabIndex === 1) {
      this.updateFrame(false, false, false);
      this.updateFrame(true, true, false)
    }
    if (tabIndex === 2) {
      this.updateFrame(false, false, false);
      this.updateFrame(true, false, true)
    }
    if (tabIndex === 3)
      this.updateFrame(false, false, false);

    if (tabIndex < 3) {
      const tab = this.tabs[tabIndex];
      this.beautify(tab);
      window.setTimeout(() => {
        this.selectedTab = tab.name;
        this.typeText(tab.text, tab, 50)
          .then(() => {
            this.startCode(tabIndex + 1);
          });
      }, 500);
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
