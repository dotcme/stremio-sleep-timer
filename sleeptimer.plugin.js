/**
 * @name Sleep Timer
 * @description Automatically pauses playback and asks "Are you still watching?" after 90 minutes of inactivity. Simulates returning to home if ignored for 2 minutes.
 * @version 1.0.0
 * @author dotcom
 */

(function () {
    const INACTIVITY_LIMIT_MS = 90 * 60 * 1000;
    const IGNORE_LIMIT_MS = 2 * 60 * 1000;

    let lastActivityTime = Date.now();
    let isOverlayActive = false;
    let autoExitTimeout = null;

    const resetTimer = () => {
        lastActivityTime = Date.now();
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('mousedown', resetTimer);
    window.addEventListener('wheel', resetTimer);

    setInterval(() => {
        const videoElement = document.querySelector('video');

        if (!videoElement || videoElement.paused || isOverlayActive) return;

        const timeSinceLastActivity = Date.now() - lastActivityTime;

        if (timeSinceLastActivity >= INACTIVITY_LIMIT_MS) {
            triggerSleepTimer(videoElement);
        }
    }, 10000);

    function triggerSleepTimer(videoElement) {
        videoElement.pause();
        isOverlayActive = true;

        const overlay = document.createElement('div');
        overlay.id = 'stremio-sleep-timer-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            opacity: 0;
            transition: opacity 0.4s ease;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #ffffff;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: rgba(20, 20, 25, 0.75);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            padding: 48px 64px;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
            transform: scale(0.95) translateY(10px);
            transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        `;

        const h2 = document.createElement('h2');
        h2.innerText = 'Are you still watching?';
        h2.style.cssText = `
            margin: 0 0 8px 0;
            font-size: 28px;
            font-weight: 600;
            letter-spacing: -0.5px;
        `;

        const p = document.createElement('p');
        p.innerText = 'Playback has been paused due to inactivity.';
        p.style.cssText = `
            margin: 0 0 32px 0;
            font-size: 16px;
            color: rgba(255, 255, 255, 0.5);
        `;

        const button = document.createElement('button');
        button.innerText = "Yes, I'm here";
        button.style.cssText = `
            background: linear-gradient(135deg, #6366f1, #a855f7);
            color: white;
            border: none;
            padding: 14px 40px;
            font-size: 16px;
            font-weight: 600;
            border-radius: 99px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 8px 20px -6px rgba(168, 85, 247, 0.6);
        `;

        button.onmouseenter = () => {
            button.style.transform = 'translateY(-2px) scale(1.02)';
            button.style.boxShadow = '0 12px 24px -6px rgba(168, 85, 247, 0.8)';
        };
        button.onmouseleave = () => {
            button.style.transform = 'translateY(0) scale(1)';
            button.style.boxShadow = '0 8px 20px -6px rgba(168, 85, 247, 0.6)';
        };
        button.onmousedown = () => button.style.transform = 'scale(0.98)';

        dialog.appendChild(h2);
        dialog.appendChild(p);
        dialog.appendChild(button);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            dialog.style.transform = 'scale(1) translateY(0)';
        });

        const closeOverlayAndResume = () => {
            clearTimeout(autoExitTimeout);
            isOverlayActive = false;
            resetTimer();

            overlay.style.opacity = '0';
            dialog.style.transform = 'scale(0.95) translateY(10px)';

            setTimeout(() => {
                overlay.remove();
                videoElement.play();
            }, 400);
        };

        button.onclick = closeOverlayAndResume;

        autoExitTimeout = setTimeout(() => {
            overlay.remove();
            window.history.back();
        }, IGNORE_LIMIT_MS);
    }
})();
