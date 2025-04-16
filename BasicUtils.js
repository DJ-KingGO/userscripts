/*
 * BasicUtils
 * Hilfsklasse für Userscripts in Browsergames
 * Enthält vereinfachte Utilities für DOM, Timing, Events und Storage
 */

class BasicUtils {
    // ========================
    // Konfiguration & Logging
    // ========================

    /*
     * DEBUG Flag
     * Aktiviert/Deaktiviert Logging
     */
    static DEBUG = false;

    /*
     * setDebug
     * Setzt den Debugmodus (true = aktiv)
     * 
     * Parameters:
     *   value (boolean): Aktivierung
     */
    static setDebug(value) {
        this.DEBUG = value;
        this.log(`Debugmode: ${value ? "aktiviert" : "deaktiviert"}`, "⚙️");
    }

    /*
     * getDebug
     * Gibt aktuellen Debugstatus zurück
     * 
     * Returns:
     *   boolean
     */
    static getDebug() {
        return this.DEBUG;
    }
    
    /*
     * log
     * Gibt eine Debugnachricht aus, wenn DEBUG aktiv ist
     * 
     * Parameters:
     *   msg (string): Nachricht
     *   emoji (string): Optionales Symbol zur Markierung
     */
    static log(msg, emoji = "📘") {
        if (this.DEBUG) console.log(`${emoji} ${msg}`);
    }

    // ========================
    // DOM Hilfsfunktionen
    // ========================

    /*
     * $
     * Kurzform für document.querySelector
     * 
     * Parameters:
     *   selector (string): CSS-Selektor
     *   root (Element): Root-Element (optional)
     * 
     * Returns:
     *   Element|null
     */
    static $(selector, root = document) {
        return root.querySelector(selector);
    }

    /*
     * $$
     * Kurzform für document.querySelectorAll
     * 
     * Parameters:
     *   selector (string): CSS-Selektor
     *   root (Element): Root-Element (optional)
     * 
     * Returns:
     *   Array<Element>
     */
    static $$(selector, root = document) {
        return [...root.querySelectorAll(selector)];
    }

    // ========================
    // Events und Simulationen
    // ========================

    /*
     * simulateClick
     * Simuliert Mausklick (mousedown, mouseup, click)
     * 
     * Parameters:
     *   element (Element): Ziel-Element
     */
    static simulateClick(element) {
        ['mousedown', 'mouseup', 'click'].forEach(type => {
            const event = new MouseEvent(type, { bubbles: true, cancelable: true, view: window });
            element.dispatchEvent(event);
        });
        this.log("Simulierter Klick", "🖱️");
    }

    /*
     * simulateHover
     * Simuliert Mouseover-Ereignis
     * 
     * Parameters:
     *   element (Element): Ziel-Element
     */
    static simulateHover(element) {
        const event = new MouseEvent('mouseover', { bubbles: true, cancelable: true });
        element.dispatchEvent(event);
        this.log("Simulierter Hover", "👆");
    }

    /*
     * simulateMouseOut
     * Simuliert Mouseout-Ereignis
     * 
     * Parameters:
     *   element (Element): Ziel-Element
     */
    static simulateMouseOut(element) {
        const event = new MouseEvent('mouseout', { bubbles: true, cancelable: true });
        element.dispatchEvent(event);
        this.log("Simulierter MouseOut", "👋");
    }

    // ========================
    // Zeitfunktionen
    // ========================

    /*
     * wait
     * Pausiert für bestimmte oder zufällige Dauer
     * 
     * Parameters:
     *   minMs (number): Mindestdauer in ms
     *   maxMs (number): Maximale Dauer in ms (optional)
     * 
     * Returns:
     *   Promise<void>
     */
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

    /*
     * waitUntil
     * Wartet bis eine Bedingung erfüllt ist oder ein Timeout überschritten wird
     * 
     * Used for:
     *   - Dynamisches Laden von Elementen abwarten
     * 
     * Parameters:
     *   conditionFn (Function): Muss true zurückgeben
     *   interval (number): Prüfintervall (ms), Default 500
     *   timeout (number): Abbruchzeit (ms), Default 10000
     * 
     * Returns:
     *   Promise<boolean> – true wenn erfüllt, false bei Timeout
     */
    static async waitUntil(conditionFn, interval = 500, timeout = 10000) {
        const start = Date.now();
        while (!conditionFn()) {
            if (Date.now() - start > timeout) return false;
            await this.wait(interval);
        }
        return true;
    }

    // ========================
    // Countdown Management
    // ========================

    static countdowns = {};

    /*
     * startCountdown
     * Startet Countdown und führt Aktion bei Zielzeit aus
     * 
     * Parameters:
     *   name (string): Bezeichner
     *   targetTimestamp (number): Zeitpunkt (ms)
     *   action (Function): Auszuführende Funktion
     */
    static startCountdown(name, targetTimestamp, action) {
        const now = Date.now();
        const timeLeft = targetTimestamp - now;

        if (timeLeft <= 0) {
            this.log(`${name} - Zielzeit erreicht`, "⏰");
            action();
            return;
        }

        this.countdowns[name] = setInterval(() => {
            const remaining = targetTimestamp - Date.now();
            if (remaining <= 0) {
                clearInterval(this.countdowns[name]);
                delete this.countdowns[name];
                action();
            }
        }, 1000);
    }

    /*
     * stopCountdown
     * Stoppt laufenden Countdown
     * 
     * Parameters:
     *   name (string): Bezeichner
     */
    static stopCountdown(name) {
        if (this.countdowns[name]) {
            clearInterval(this.countdowns[name]);
            delete this.countdowns[name];
            this.log(`${name} - Countdown gestoppt`, "🛑");
        } else {
            this.log(`${name} - Kein laufender Countdown`, "⚠️");
        }
    }

    // ========================
    // LocalStorage Management
    // ========================

    /*
     * setLocalStorage
     * Speichert Daten im localStorage
     * 
     * Parameters:
     *   name (string): Schlüssel
     *   value (any): Wert
     */
    static setLocalStorage(name, value) {
        try {
            localStorage.setItem(name, JSON.stringify(value));
            this.log(`${name} gespeichert`, "💾");
        } catch (e) {
            console.error("❌ Fehler beim Speichern:", e);
        }
    }

    /*
     * getLocalStorage
     * Liest Daten aus localStorage
     * 
     * Parameters:
     *   name (string): Schlüssel
     * 
     * Returns:
     *   any|null
     */
    static getLocalStorage(name) {
        try {
            const value = localStorage.getItem(name);
            this.log(`${name} geladen`, "📤");
            return value ? JSON.parse(value) : null;
        } catch (e) {
            console.error("❌ Fehler beim Laden:", e);
            return null;
        }
    }

    /*
     * removeLocalStorage
     * Löscht Daten aus localStorage
     * 
     * Parameters:
     *   name (string): Schlüssel
     */
    static removeLocalStorage(name) {
        try {
            localStorage.removeItem(name);
            this.log(`${name} entfernt`, "🗑️");
        } catch (e) {
            console.error("❌ Fehler beim Entfernen:", e);
        }
    }

    // ========================
    // Dynamisches Warten
    // ========================

    /*
     * waitForElement
     * Wartet auf das Erscheinen eines Elements bis Timeout
     * 
     * Parameters:
     *   selector (string): CSS-Selektor
     *   timeout (number): Max. Wartezeit in ms
     * 
     * Returns:
     *   Promise<boolean>
     */
    static async waitForElement(selector, timeout) {
        const start = Date.now();
        let element = this.$(selector);
        this.log(`Warte auf ${selector}...`, "🔄");

        while (!element && (Date.now() - start) < timeout) {
            await this.wait(1000, 2000);
            element = this.$(selector);
        }

        if (!element) {
            this.log(`Timeout erreicht, ${selector} ist weiterhin nicht sichtbar`, "⏳");
            return false;
        }

        const elapsed = Math.floor((Date.now() - start) / 1000);
        this.log(`${selector} hat ${elapsed}s benötigt.`, "✅");
        return true;
    }

    /*
     * waitForLoadingScreen
     * Wartet auf das Ende eines Ladebildschirms (z.B. .loadingScreen)
     * 
     * Returns:
     *   Promise<boolean>
     */
    static async waitForLoadingScreen() {
        this.log("Warte auf Ladebildschirm…", "🔄");

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
}

}
