/*
*   Basic Utils for Userscripts
*/

class BasicUtils {
    // Standardwert für DEBUG
    static DEBUG = false;

    // Setzt den DEBUG-Wert
    static setDebug(value) {
        this.DEBUG = value;
        this.log(`Debugmode: ${value ? "aktiviert" : "deaktiviert"}`, "⚙️");
    }

    // Gibt den aktuellen DEBUG-Wert zurück
    static getDebug() {
        return this.DEBUG;
    }
    
    // Nachrichten in der Konsole ausgeben
    static log(msg, emoji = "📘") {
        if (this.DEBUG) console.log(`${emoji} ${msg}`);
    }

    // Kurzform für document.querySelector
    static $(selector, root = document) {
        return root.querySelector(selector);
    }

    // Kurzform für document.querySelectorAll, gibt ein Array zurück
    static $$(selector, root = document) {
        return [...root.querySelectorAll(selector)];
    }

    // Simuliert einen Klick auf ein Element (mousedown, mouseup, click)
    static simulateClick(element) {
        ['mousedown', 'mouseup', 'click'].forEach(type => {
            const event = new MouseEvent(type, { bubbles: true, cancelable: true, view: window });
            element.dispatchEvent(event);
        });
        this.log("Simulierter Klick", "🖱️");
    }

    // Simuliert das Überfahren eines Elements mit der Maus (mouseover)
    static simulateHover(element) {
        const event = new MouseEvent('mouseover', { bubbles: true, cancelable: true });
        element.dispatchEvent(event);
        this.log("Simulierter Hover", "👆");
    }

    // Simuliert das Verlassen eines Elements mit der Maus (mouseout)
    static simulateMouseOut(element) {
        const event = new MouseEvent('mouseout', { bubbles: true, cancelable: true });
        element.dispatchEvent(event);
        this.log("Simulierter MouseOut", "👋");
    }

    // Wartet für eine zufällige Zeitspanne zwischen minMs und maxMs (wenn beide angegeben) oder exakt minMs
    static wait(minMs, maxMs) {
        let delay;
        if (maxMs) {
            delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs; // Zufällige Zeitspanne
            this.log(`Warte ${delay}ms`, "⏳");
        } else {
            delay = minMs; // Exakte Zeitspanne
            this.log(`Warte exakt ${delay}ms`, "⏳");
        }
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    // Objekt zum Verwalten von Countdowns
    static countdowns = {};

    // Startet einen Countdown, der eine Aktion ausführt, wenn die Zielzeit erreicht ist
    static startCountdown(name, targetTimestamp, action) {
        const now = Date.now();
        const timeLeft = targetTimestamp - now;

        if (timeLeft <= 0) {
            this.log(`${name} - Zielzeit erreicht`, "⏰");
            action();
            return;
        }

        // Startet den Countdown und führt jede Sekunde eine Überprüfung durch
        this.countdowns[name] = setInterval(() => {
            const remainingTime = targetTimestamp - Date.now();
            if (remainingTime <= 0) {
                clearInterval(this.countdowns[name]);
                delete this.countdowns[name];
                this.log(`${name} - Countdown abgelaufen`, "✅");
                action();
            }
        }, 1000);
        this.log(`${name} - Countdown gestartet`, "⏱️");
    }

    // Stoppt einen laufenden Countdown
    static stopCountdown(name) {
        if (this.countdowns[name]) {
            clearInterval(this.countdowns[name]);
            delete this.countdowns[name];
            this.log(`${name} - Countdown gestoppt`, "🛑");
        } else {
            this.log(`${name} - Kein laufender Countdown`, "⚠️");
        }
    }

    // Speichert einen Wert im LocalStorage
    static setLocalStorage(name, value) {
        try {
            localStorage.setItem(name, JSON.stringify(value));
            this.log(`${name} gespeichert`, "💾");
        } catch (error) {
            console.error("❌ Fehler beim Speichern:", error);
        }
    }

    // Lädt einen Wert aus dem LocalStorage
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

    // Entfernt einen Wert aus dem LocalStorage
    static removeLocalStorage(name) {
        try {
            localStorage.removeItem(name);
            this.log(`${name} entfernt`, "🗑️");
        } catch (error) {
            console.error("❌ Fehler beim Entfernen:", error);
        }
    }

    // Wartet darauf, dass ein beliebiges Element verschwindet oder ein Timeout überschritten wird
    static async waitForElement(elementSelector, timeout) {
        const startTime = Date.now(); // Startzeit des Wartens
        let element = this.$(elementSelector); // Versuchen, das Element zu finden

        // Loggen zu Beginn
        this.log(`Warte auf ${elementSelector}...`, "🔄");

        // Warten, bis das Element erscheint oder der Timeout erreicht wird
        while (!element && (Date.now() - startTime) < timeout) {
            await this.wait(1000, 2000); // Wartet zufällig 1-2 Sekunden
            element = this.$(elementSelector); // Versuchen, das Element erneut zu finden
        }

        // Wenn das Element nicht gefunden wurde oder Timeout erreicht ist
        if (!element) {
            this.log(`Timeout erreicht, ${elementSelector} ist weiterhin nicht sichtbar`, "⏳");
            return false; // Timeout überschritten und Element ist immer noch nicht sichtbar
        }

        // Loggen nach Abschluss
        const elapsedTimeInSeconds = Math.floor((Date.now() - startTime) / 1000);
        this.log(`${elementSelector} hat ${elapsedTimeInSeconds} Sekunden benötigt.`, "✅");

        return true;
    }

    // Wartet darauf, dass der Ladebildschirm verschwindet
    static async waitForLoadingScreen() {
        this.log("Warte auf Ladebildschirm…", "🔄");
    
        const check = () => {
            const loading = this.$('.loadingScreen');
            return !loading || loading.style.display === 'none';
        };
    
        while (!check()) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 Sekunde warten
        }
    
        this.log("Ladebildschirm fertig", "✅");
        return true;
    }
}
