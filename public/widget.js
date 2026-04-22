(function() {
  const scriptTag = document.currentScript;
  const token = scriptTag.getAttribute('data-token');
  const apiUrl = scriptTag.getAttribute('data-api') || 'http://localhost:3000/api/feedback';

  if (!token) {
    console.error('VibeFeedback: Missing data-token attribute.');
    return;
  }

  // Inject html-to-image
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js';
  document.head.appendChild(script);

  const container = document.createElement('div');
  const shadow = container.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
    * { box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
    .vibe-btn {
      position: fixed; bottom: 24px; right: 24px;
      background: #121213; color: white; border: none;
      border-radius: 999px; padding: 12px 24px;
      font-weight: 500; cursor: pointer; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
      transition: transform 0.2s; z-index: 999999;
    }
    .vibe-btn:hover { transform: scale(1.05); }
    .vibe-modal {
      position: fixed; bottom: 80px; right: 24px; width: 340px;
      background: #ffffff; border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
      border: 1px solid #e5e7eb; display: none; flex-direction: column;
      z-index: 999999; overflow: hidden;
    }
    .vibe-modal.open { display: flex; }
    .vibe-header {
      padding: 16px; border-bottom: 1px solid #e5e7eb;
      font-weight: 600; color: #111827; background: #f9fafb;
    }
    .vibe-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    textarea {
      width: 100%; border: 1px solid #d1d5db; border-radius: 6px;
      padding: 8px; min-height: 80px; resize: none; outline: none;
    }
    textarea:focus { border-color: #22C55E; box-shadow: 0 0 0 1px #22C55E; }
    .vibe-footer { padding: 16px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 8px; }
    .btn { padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; border: none; }
    .btn-cancel { background: white; color: #374151; border: 1px solid #d1d5db; }
    .btn-submit { background: #22C55E; color: white; }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .capture-btn {
      background: #f3f4f6; color: #374151; border: 1px dashed #d1d5db;
      padding: 8px; border-radius: 6px; text-align: center; cursor: pointer;
      font-size: 14px;
    }
    .preview { width: 100%; max-height: 100px; object-fit: contain; border-radius: 6px; display: none; }
  `;

  shadow.appendChild(style);

  const button = document.createElement('button');
  button.className = 'vibe-btn';
  button.innerText = 'Feedback';

  const modal = document.createElement('div');
  modal.className = 'vibe-modal';
  modal.innerHTML = `
    <div class="vibe-header">Send Feedback</div>
    <div class="vibe-body">
      <textarea id="vibe-msg" placeholder="What's on your mind?"></textarea>
      <div class="capture-btn" id="vibe-capture">Take Screenshot</div>
      <img id="vibe-preview" class="preview" />
    </div>
    <div class="vibe-footer">
      <button class="btn btn-cancel" id="vibe-cancel">Cancel</button>
      <button class="btn btn-submit" id="vibe-submit">Send</button>
    </div>
  `;

  shadow.appendChild(button);
  shadow.appendChild(modal);
  document.body.appendChild(container);

  let screenshotDataUrl = null;

  button.onclick = () => {
    modal.classList.toggle('open');
  };

  shadow.getElementById('vibe-cancel').onclick = () => {
    modal.classList.remove('open');
    shadow.getElementById('vibe-msg').value = '';
    screenshotDataUrl = null;
    shadow.getElementById('vibe-preview').style.display = 'none';
    shadow.getElementById('vibe-capture').style.display = 'block';
  };

  shadow.getElementById('vibe-capture').onclick = async () => {
    if (!window.htmlToImage) {
      alert('Loading capture library, try again in a second.');
      return;
    }
    const btn = shadow.getElementById('vibe-capture');
    btn.innerText = 'Capturing...';
    
    modal.style.display = 'none';
    
    try {
      screenshotDataUrl = await window.htmlToImage.toPng(document.body, { quality: 0.8 });
      const preview = shadow.getElementById('vibe-preview');
      preview.src = screenshotDataUrl;
      preview.style.display = 'block';
      btn.style.display = 'none';
    } catch (e) {
      console.error(e);
      alert('Could not capture screen.');
    }
    
    modal.style.display = 'flex';
    btn.innerText = 'Take Screenshot';
  };

  shadow.getElementById('vibe-submit').onclick = async () => {
    const msg = shadow.getElementById('vibe-msg').value;
    if (!msg) return;

    const btn = shadow.getElementById('vibe-submit');
    btn.innerText = 'Sending...';
    btn.disabled = true;

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script_token: token,
          type: 'feedback',
          message: msg,
          screenshot_url: screenshotDataUrl,
          metadata: {
            url: window.location.href,
            userAgent: navigator.userAgent
          }
        })
      });

      if (res.ok) {
        alert('Feedback sent! Thank you.');
        shadow.getElementById('vibe-cancel').click();
      } else {
        alert('Failed to send feedback.');
      }
    } catch (e) {
      alert('Error sending feedback.');
    } finally {
      btn.innerText = 'Send';
      btn.disabled = false;
    }
  };

})();
