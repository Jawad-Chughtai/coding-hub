import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root', // Automatically makes it a singleton
  })
export class SharedService {
  html: string = `<div class="container"><div class="spiral"></div> <div id="clock">00:00:00</div> </div>`;

  css: string = `body {
    background-color: #1a0033;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
    overflow: hidden;
}.container {
    position: relative;
    width: 200px;
    height: 200px;
}

#clock {
    font-family: 'Arial', sans-serif;
    font-size: 40px;
    font-weight: bold;
    color: #ff00ff;
    text-align: center;
    position: absolute;
    width: 100%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-shadow: 0 0 10px #ff00ff, 0 0 20px #ff00ff;
}

.spiral {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 3px solid rgba(255, 0, 255, 0.5);
    animation: spin 5s linear infinite;
}

.spiral::before,
.spiral::after {
    content: "";
    position: absolute;
    width: 120%;
    height: 120%;
    border-radius: 50%;
    border: 3px solid rgba(255, 0, 255, 0.3);
    animation: spin 6s linear infinite reverse;
}

.spiral::after {
    width: 140%;
    height: 140%;
    border: 3px solid rgba(255, 0, 255, 0.2);
    animation-duration: 7s;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}`;

  js: string = "function updateClock() {let now = new Date();let hours = String(now.getHours()).padStart(2, '0');let minutes = String(now.getMinutes()).padStart(2, '0');let seconds = String(now.getSeconds()).padStart(2, '0');document.getElementById(\"clock\").textContent = `${hours}:${minutes}:${seconds}`;}setInterval(updateClock, 1000);updateClock();";
}