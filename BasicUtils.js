/*
*   Basic Utils for Userscripts
*/

class BasicUtils {
    static DEBUG = false;
    static overlayElement = null;
    static countdowns = {};

    static setDebug(value) {
        this.DEBUG = value;
        this.log(`Debugmode: ${value ? "aktiviert" : "deaktiviert"}`, "⚙️");
    }

    static getDebug() {
        return this.DEBUG;
    }

    static log(msg, emoji = "📘") {
        if (this.DEBUG) console.log(`${emoji} ${msg}`);
        this.logToOverlay(`${emoji} ${msg}`);
    }

    static $(selector, root = document) {
        return root.querySelector(selector);
    }

    static $$(selector, root = document) {
        return [...root.querySelectorAll(selector)];
    }

    static simulateClick(element) {
        ['mousedown', 'mouseup', 'click'].forEach(type => {
            const event = new MouseEvent(type, { bubbles: true, cancelable: true, view: window });
            element.dispatchEvent(event);
        });
        this.log("Simulierter Klick", "🖱️");
    }

    static simulateHover(element) {
        const event = new MouseEvent('mouseover', { bubbles: true, cancelable: true });
        element.dispatchEvent(event);
        this.log("Simulierter Hover", "👆");
    }

    static simulateMouseOut(element) {
        const event = new MouseEvent('mouseout', { bubbles: true, cancelable: true });
        element.dispatchEvent(event);
        this.log("Simulierter MouseOut", "👋");
    }

    static wait(minMs, maxMs) {
        let delay;
        if (maxMs) {
            delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
            this.log(`Warte ${delay}ms`, "⏳");
        } else {
            delay = minMs;
            this.log(`Warte exakt ${delay}ms`, "⏳");
        }
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    static async waitForElement(selector, timeout) {
        const startTime = Date.now();
        let element = this.$(selector);
        this.log(`Warte auf ${selector}...`, "⏳");

        while (!element && (Date.now() - startTime) < timeout) {
            await this.wait(1000, 2000);
            element = this.$(selector);
        }

        if (!element) {
            this.log(`Timeout erreicht, ${selector} ist weiterhin nicht sichtbar`, "⚠️");
            return false;
        }

        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        this.log(`${selector} hat ${elapsed} Sekunden benötigt.`, "✅");
        return true;
    }

    static async waitForLoadingScreen() {
        this.log("Warte auf Ladebildschirm…", "⏳");
        const check = () => {
            const loading = this.$('.loadingScreen');
            return !loading || loading.style.display === 'none';
        };
        while (!check()) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        this.log("Ladebildschirm fertig", "✅");
        return true;
    }

    static startCountdown(name, targetTimestamp, action) {
        const now = Date.now();
        const timeLeft = targetTimestamp - now;

        if (timeLeft <= 0) {
            this.log(`${name} - Zielzeit erreicht`, "⏰");
            action();
            return;
        }

        this.countdowns[name] = setInterval(() => {
            const remainingTime = targetTimestamp - Date.now();
            if (remainingTime <= 0) {
                clearInterval(this.countdowns[name]);
                delete this.countdowns[name];
                action();
            }
        }, 1000);
    }

    static stopCountdown(name) {
        if (this.countdowns[name]) {
            clearInterval(this.countdowns[name]);
            delete this.countdowns[name];
            this.log(`${name} - Countdown gestoppt`, "🛑");
        } else {
            this.log(`${name} - Kein laufender Countdown`, "⚠️");
        }
    }

    static setLocalStorage(name, value) {
        try {
            localStorage.setItem(name, JSON.stringify(value));
            this.log(`${name} gespeichert`, "💾");
        } catch (error) {
            console.error("❌ Fehler beim Speichern:", error);
        }
    }

    static getLocalStorage(name) {
        try {
            const value = localStorage.getItem(name);
            this.log(`${name} geladen`, "📤");
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error("❌ Fehler beim Laden:", error);
            return null;
        }
    }

    static removeLocalStorage(name) {
        try {
            localStorage.removeItem(name);
            this.log(`${name} entfernt`, "🗑️");
        } catch (error) {
            console.error("❌ Fehler beim Entfernen:", error);
        }
    }

    static observeDOMChanges(element, callback) {
        const observer = new MutationObserver(callback);
        observer.observe(element, { childList: true, subtree: true });
        this.log("DOM-Observer gestartet", "🔍");
    }

    static getText(selector) {
        const el = this.$(selector);
        return el ? el.innerText.trim() : null;
    }

    static showDebugOverlay() {
        if (document.getElementById("debug-overlay")) return;

        const wrapper = document.createElement("div");
        wrapper.id = "debug-overlay";
        wrapper.style.position = "fixed";
        wrapper.style.bottom = "100px";
        wrapper.style.left = "30px";
        wrapper.style.width = "500px";
        wrapper.style.maxHeight = "200px";
        //wrapper.style.overflow = "hidden";
        wrapper.style.zIndex = "999999";
        wrapper.style.pointerEvents = "none"; // Klicks blockieren nichts
        document.body.appendChild(wrapper);

        const content = document.createElement("div");
        content.id = "debug-overlay-content";
        content.style.background = "rgba(0, 0, 0, 0.8)";
        content.style.color = "#0f0";
        content.style.fontSize = "12px";
        content.style.fontFamily = "monospace";
        content.style.padding = "10px";
        content.style.border = "1px solid #0f0";
        content.style.borderRadius = "8px";
        content.style.overflowY = "auto";
        content.style.maxHeight = "200px";
        content.style.pointerEvents = "auto"; // ← Nur dieses Element reagiert
        wrapper.appendChild(content);

        // Cookie setzen, um Cookie-Banner dauerhaft zu unterdrücken
        document.cookie = "cmpboxrecall=1; path=/; max-age=31536000"; // 1 Jahr gültig

        const cmp = document.getElementById("cmpwrapper");
        if (cmp) {
            cmp.remove(); // Ganz entfernen statt nur verstecken
            this.log("cmpwrapper entfernt und Cookie gesetzt", "🛡️");
        }
    }

    static logToOverlay(msg) {
        const content = document.getElementById("debug-overlay-content");
        if (!content) return;
        const p = document.createElement("div");
        p.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        content.appendChild(p);
        content.scrollTop = content.scrollHeight; // Immer ganz nach unten scrollen
    }
}
