/*
*   Basic Utils for Userscripts
*/

class BasicUtils {
    static DEBUG = false;
    static overlayElement = null;
    static countdowns = {};

    /* Used for toggling debug mode
     * @param {boolean} value - true = on, false = off
     * No return
     */
    static setDebug(value) {
        this.DEBUG = value;
        this.log(`Debugmode: ${value ? "aktiviert" : "deaktiviert"}`, "⚙️");
    }

    /* Used for getting current debug state
     * @return {boolean} DEBUG
     */
    static getDebug() {
        return this.DEBUG;
    }

    /* Used for console logging (only in debug mode)
     * @param {string} msg - Message to log
     * @param {string} emoji - Optional emoji prefix
     * No return
     */
    static log(msg, emoji = "📘") {
        if (this.DEBUG) console.log(`${emoji} ${msg}`);
        this.logToOverlay(`${emoji} ${msg}`);
    }

    /* Used for selecting single element
     * @param {string} selector - CSS selector
     * @param {HTMLElement} root - Optional root element
     * @return {HTMLElement|null}
     */
    static $(selector, root = document) {
        return root.querySelector(selector);
    }

    /* Used for selecting multiple elements
     * @param {string} selector - CSS selector
     * @param {HTMLElement} root - Optional root element
     * @return {HTMLElement[]} Array of found elements
     */
    static $$(selector, root = document) {
        return [...root.querySelectorAll(selector)];
    }

    /* Used for simulating a full mouse click
     * @param {HTMLElement} element
     * No return
     */
    static simulateClick(element) {
        ['mousedown', 'mouseup', 'click'].forEach(type => {
            const event = new MouseEvent(type, { bubbles: true, cancelable: true, view: window });
            element.dispatchEvent(event);
        });
        this.log("Simulierter Klick", "🖱️");
    }

    /* Used for simulating mouse hover
     * @param {HTMLElement} element
     * No return
     */
    static simulateHover(element) {
        const event = new MouseEvent('mouseover', { bubbles: true, cancelable: true });
        element.dispatchEvent(event);
        this.log("Simulierter Hover", "👆");
    }

    /* Used for simulating mouseout
     * @param {HTMLElement} element
     * No return
     */
    static simulateMouseOut(element) {
        const event = new MouseEvent('mouseout', { bubbles: true, cancelable: true });
        element.dispatchEvent(event);
        this.log("Simulierter MouseOut", "👋");
    }

    /* Used for waiting (randomized if maxMs given)
     * @param {number} minMs - minimum milliseconds
     * @param {number} maxMs - optional maximum milliseconds
     * @return {Promise<void>}
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

    /* Used for waiting until an element appears or timeout
     * @param {string} selector
     * @param {number} timeout - in ms
     * @return {Promise<boolean>} true if found
     */
    static async waitForElement(selector, timeout) {
        const startTime = Date.now();
        let element = this.$(selector);
        this.log(`Warte auf ${selector}...`, "🔄");

        while (!element && (Date.now() - startTime) < timeout) {
            await this.wait(1000, 2000);
            element = this.$(selector);
        }

        if (!element) {
            this.log(`Timeout erreicht, ${selector} ist weiterhin nicht sichtbar`, "⏳");
            return false;
        }

        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        this.log(`${selector} hat ${elapsed} Sekunden benötigt.`, "✅");
        return true;
    }

    /* Used for waiting until loading screen disappears
     * @return {Promise<boolean>} true when gone
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

    /* Used for starting a countdown
     * @param {string} name
     * @param {number} targetTimestamp
     * @param {Function} action - callback when done
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
            const remainingTime = targetTimestamp - Date.now();
            if (remainingTime <= 0) {
                clearInterval(this.countdowns[name]);
                delete this.countdowns[name];
                action();
            }
        }, 1000);
    }

    /* Used for stopping a countdown
     * @param {string} name
     * No return
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

    /* Used for saving data to LocalStorage
     * @param {string} name
     * @param {*} value - will be JSON.stringify'd
     */
    static setLocalStorage(name, value) {
        try {
            localStorage.setItem(name, JSON.stringify(value));
            this.log(`${name} gespeichert`, "💾");
        } catch (error) {
            console.error("❌ Fehler beim Speichern:", error);
        }
    }

    /* Used for loading data from LocalStorage
     * @param {string} name
     * @return {*} parsed JSON or null
     */
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

    /* Used for removing a LocalStorage entry
     * @param {string} name
     * No return
     */
    static removeLocalStorage(name) {
        try {
            localStorage.removeItem(name);
            this.log(`${name} entfernt`, "🗑️");
        } catch (error) {
            console.error("❌ Fehler beim Entfernen:", error);
        }
    }

    /* Used for observing DOM changes
     * @param {HTMLElement} element - root to observe
     * @param {Function} callback - triggered on change
     */
    static observeDOMChanges(element, callback) {
        const observer = new MutationObserver(callback);
        observer.observe(element, { childList: true, subtree: true });
        this.log("DOM-Observer gestartet", "🔍");
    }

    /* Used for getting trimmed innerText
     * @param {string} selector
     * @return {string|null} text content or null
     */
    static getText(selector) {
        const el = this.$(selector);
        return el ? el.innerText.trim() : null;
    }

    /* Used for showing the floating debug overlay
     * No return
     */
    static showDebugOverlay() {
        if (this.overlayElement) return;
        const overlay = document.createElement("div");
        overlay.id = "debug-overlay";
        overlay.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            background: rgba(0,0,0,0.8);
            color: #0f0;
            font-family: monospace;
            font-size: 12px;
            max-height: 150px;
            overflow-y: auto;
            padding: 5px;
            z-index: 99999;
            width: 100%;
        `;
        document.body.appendChild(overlay);
        this.overlayElement = overlay;
    }

    /* Used for logging text into debug overlay
     * @param {string} msg
     * No return
     */
    static logToOverlay(msg) {
        if (!this.overlayElement) return;
        const entry = document.createElement("div");
        entry.textContent = msg;
        this.overlayElement.appendChild(entry);
        this.overlayElement.scrollTop = this.overlayElement.scrollHeight;
    }
}
