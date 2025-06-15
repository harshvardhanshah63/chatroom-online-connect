let socket;
let nickname = "";
let selectedFile = null;
let typingTimer;
let isTyping = false;
let connectionRetries = 0;
const maxRetries = 5;

// Initialize socket connection
function initializeSocket() {
  socket = io({
    transports: ['websocket', 'polling'],
    timeout: 20000,
    forceNew: true
  });

  // Connection events
  socket.on('connect', () => {
    console.log('✅ Connected to server:', socket.id);
    connectionRetries = 0;
    
    // If user was already logged in, rejoin
    const savedNickname = localStorage.getItem('chatNickname');
    if (savedNickname && document.getElementById("chatContainer").classList.contains('hidden') === false) {
      socket.emit("join", savedNickname);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from server');
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    if (connectionRetries < maxRetries) {
      connectionRetries++;
      console.log(`Retrying connection... (${connectionRetries}/${maxRetries})`);
      setTimeout(() => {
        socket.connect();
      }, 2000);
    }
  });

  socket.on('connected', (message) => {
    console.log('Server says:', message);
  });

  // Message events
  socket.on("message", (data) => {
    console.log('📨 Received message:', data);
    // Only display if it's not from current user (prevent double messages)
    if (data.nickname !== nickname) {
      displayMessage(data, true);
    }
  });

  socket.on("file", (data) => {
    console.log('📎 Received file:', data);
    // Only display if it's not from current user
    if (data.nickname !== nickname) {
      displayMessage({ ...data, fileUrl: data.fileData }, true);
    }
  });

  socket.on("onlineUsers", count => {
    console.log('👥 Online users count:', count);
    document.getElementById("onlineCount").textContent = `${count} online`;
  });

  socket.on("typing", (data) => {
    const typingIndicator = document.getElementById("typingIndicator");
    const typingText = typingIndicator.querySelector(".typing-text");
    
    if (data.nickname !== nickname) {
      if (data.typing) {
        typingText.textContent = `${data.nickname} is typing...`;
        typingIndicator.classList.remove("hidden");
      } else {
        typingIndicator.classList.add("hidden");
      }
    }
  });
}

// Check localStorage on page load
window.addEventListener('load', () => {
  console.log('🚀 Page loaded, initializing...');
  
  // Initialize socket connection
  initializeSocket();
  
  const savedNickname = localStorage.getItem('chatNickname');
  const savedMessages = localStorage.getItem('chatMessages');
  
  if (savedNickname) {
    console.log('👤 Found saved nickname:', savedNickname);
    nickname = savedNickname;
    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("chatContainer").classList.remove("hidden");
    
    // Load saved messages
    if (savedMessages) {
      console.log('💾 Loading saved messages...');
      const messages = JSON.parse(savedMessages);
      const chatBox = document.getElementById("chatBox");
      chatBox.innerHTML = ''; // Clear welcome message
      
      messages.forEach(msg => {
        displayMessage(msg, false); // false = don't save to localStorage again
      });
    }
    
    // Wait for socket connection before joining
    if (socket.connected) {
      socket.emit("join", nickname);
    } else {
      socket.on('connect', () => {
        socket.emit("join", nickname);
      });
    }
  }
});

function joinChat() {
  const nicknameInput = document.getElementById("nicknameInput").value.trim();
  if (!nicknameInput) {
    alert("Please enter your name");
    return;
  }
  
  nickname = nicknameInput;
  localStorage.setItem('chatNickname', nickname);
  
  console.log('🔑 Joining chat as:', nickname);
  
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("chatContainer").classList.remove("hidden");
  
  // Make sure socket is connected before joining
  if (socket.connected) {
    socket.emit("join", nickname);
  } else {
    console.log('⏳ Waiting for connection...');
    socket.on('connect', () => {
      socket.emit("join", nickname);
    });
  }
}

function leaveChat() {
  if (confirm("Are you sure you want to leave the chat? All messages will be deleted.")) {
    localStorage.removeItem('chatNickname');
    localStorage.removeItem('chatMessages');
    socket.emit('leave', nickname);
    location.reload();
  }
}

function handleKey(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function handleTyping() {
  if (!socket.connected) return;
  
  if (!isTyping) {
    isTyping = true;
    socket.emit("typing", { nickname, typing: true });
  }
  
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    isTyping = false;
    socket.emit("typing", { nickname, typing: false });
  }, 1000);
}

function sendMessage() {
  const msgInput = document.getElementById("messageInput");
  const msg = msgInput.value.trim();
  if (!msg) return;

  if (!socket.connected) {
    alert("Not connected to server. Please wait...");
    return;
  }

  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const messageData = {
    msg,
    time,
    nickname,
    type: 'text',
    id: Date.now() + Math.random() // Unique ID
  };
  
  console.log('📤 Sending message:', messageData);
  
  // Display message immediately for sender
  displayMessage({ ...messageData, own: true }, true);
  
  // Send to server (server won't echo back to sender)
  socket.emit("message", messageData);
  msgInput.value = "";
  
  // Stop typing indicator
  isTyping = false;
  socket.emit("typing", { nickname, typing: false });
}

function displayMessage(data, saveToStorage = true) {
  const chatBox = document.getElementById("chatBox");
  
  // Remove welcome message if it exists
  const welcomeMsg = chatBox.querySelector('.welcome-message');
  if (welcomeMsg) {
    welcomeMsg.remove();
  }
  
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${data.own ? 'own' : ''}`;
  
  let content = '';
  
  if (data.type === 'file') {
    content = createFileMessage(data);
  } else {
    content = `
      <div class="message-bubble">
        ${!data.own ? `<div class="message-header">${data.nickname}</div>` : ''}
        <div class="message-content">${escapeHtml(data.msg)}</div>
        <div class="message-time">${data.time}</div>
      </div>
    `;
  }
  
  messageDiv.innerHTML = content;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
  
  // Save to localStorage
  if (saveToStorage) {
    saveMessageToStorage(data);
  }
}

function createFileMessage(data) {
  const isImage = data.fileType && data.fileType.startsWith('image/');
  const isVideo = data.fileType && data.fileType.startsWith('video/');
  const isAudio = data.fileType && data.fileType.startsWith('audio/');
  
  let mediaContent = '';
  
  if (isImage) {
    mediaContent = `
      <div class="media-container">
        <img src="${data.fileData || data.fileUrl}" alt="${data.fileName}" class="chat-image" onclick="openImageModal('${data.fileData || data.fileUrl}', '${data.fileName}')" />
        <div class="media-overlay">
          <button class="download-overlay-btn" onclick="downloadFile('${data.fileData || data.fileUrl}', '${data.fileName}')" title="Download">
            <i class="fas fa-download"></i>
          </button>
        </div>
      </div>
    `;
  } else if (isVideo) {
    mediaContent = `
      <div class="media-container">
        <video class="chat-video" controls preload="metadata">
          <source src="${data.fileData || data.fileUrl}" type="${data.fileType}">
          Your browser does not support the video tag.
        </video>
        <div class="video-info">
          <span class="file-name">${data.fileName}</span>
          <button class="download-btn" onclick="downloadFile('${data.fileData || data.fileUrl}', '${data.fileName}')" title="Download">
            <i class="fas fa-download"></i>
          </button>
        </div>
      </div>
    `;
  } else if (isAudio) {
    mediaContent = `
      <div class="audio-container">
        <div class="audio-header">
          <i class="fas fa-music"></i>
          <span class="file-name">${data.fileName}</span>
          <button class="download-btn" onclick="downloadFile('${data.fileData || data.fileUrl}', '${data.fileName}')" title="Download">
            <i class="fas fa-download"></i>
          </button>
        </div>
        <audio controls class="chat-audio">
          <source src="${data.fileData || data.fileUrl}" type="${data.fileType}">
          Your browser does not support the audio element.
        </audio>
      </div>
    `;
  } else {
    // Other file types (documents, etc.)
    const fileIcon = getFileIcon(data.fileName);
    mediaContent = `
      <div class="file-attachment">
        <div class="file-icon-container">
          <i class="fas ${fileIcon} file-icon"></i>
        </div>
        <div class="file-details">
          <div class="file-name">${data.fileName}</div>
          <div class="file-size">${formatFileSize(data.fileSize)}</div>
        </div>
        <button class="download-btn" onclick="downloadFile('${data.fileData || data.fileUrl}', '${data.fileName}')" title="Download">
          <i class="fas fa-download"></i>
        </button>
      </div>
    `;
  }
  
  return `
    <div class="message-bubble ${isImage || isVideo ? 'media-bubble' : ''}">
      ${!data.own ? `<div class="message-header">${data.nickname}</div>` : ''}
      <div class="message-content">
        ${mediaContent}
      </div>
      <div class="message-time">${data.time}</div>
    </div>
  `;
}

function saveMessageToStorage(messageData) {
  const savedMessages = localStorage.getItem('chatMessages');
  let messages = savedMessages ? JSON.parse(savedMessages) : [];
  
  // Keep only last 200 messages to prevent storage overflow
  if (messages.length >= 200) {
    messages = messages.slice(-199);
  }
  
  messages.push(messageData);
  localStorage.setItem('chatMessages', JSON.stringify(messages));
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Check file size (max 25MB)
  if (file.size > 25 * 1024 * 1024) {
    alert("File size must be less than 25MB");
    return;
  }
  
  selectedFile = file;
  showFilePreview(file);
}

function showFilePreview(file) {
  const preview = document.getElementById("filePreview");
  const previewBody = document.getElementById("previewBody");
  
  previewBody.innerHTML = '';
  
  if (file.type.startsWith('image/')) {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.style.maxWidth = '100%';
    img.style.maxHeight = '300px';
    img.style.borderRadius = '10px';
    previewBody.appendChild(img);
  } else if (file.type.startsWith('video/')) {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.controls = true;
    video.style.maxWidth = '100%';
    video.style.maxHeight = '300px';
    video.style.borderRadius = '10px';
    previewBody.appendChild(video);
  } else if (file.type.startsWith('audio/')) {
    const audioContainer = document.createElement('div');
    audioContainer.innerHTML = `
      <i class="fas fa-music fa-3x" style="color: #667eea; margin-bottom: 15px;"></i>
      <p><strong>${file.name}</strong></p>
      <p>${formatFileSize(file.size)}</p>
      <audio controls style="width: 100%; margin-top: 10px;">
        <source src="${URL.createObjectURL(file)}" type="${file.type}">
      </audio>
    `;
    audioContainer.style.textAlign = 'center';
    previewBody.appendChild(audioContainer);
  } else {
    const fileInfo = document.createElement('div');
    fileInfo.innerHTML = `
      <i class="fas ${getFileIcon(file.name)} fa-3x" style="color: #667eea; margin-bottom: 10px;"></i>
      <p><strong>${file.name}</strong></p>
      <p>${formatFileSize(file.size)}</p>
    `;
    fileInfo.style.textAlign = 'center';
    previewBody.appendChild(fileInfo);
  }
  
  preview.classList.remove("hidden");
}

function cancelFileUpload() {
  selectedFile = null;
  document.getElementById("fileInput").value = '';
  document.getElementById("filePreview").classList.add("hidden");
}

function sendFile() {
  if (!selectedFile) return;
  
  if (!socket.connected) {
    alert("Not connected to server. Please wait...");
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const fileData = {
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileType: selectedFile.type,
      fileData: e.target.result,
      time,
      nickname,
      type: 'file',
      id: Date.now() + Math.random()
    };
    
    console.log('📤 Sending file:', fileData.fileName);
    
    // Display file message immediately for sender
    displayMessage({ ...fileData, own: true }, true);
    
    // Send to server
    socket.emit("file", fileData);
    
    cancelFileUpload();
  };
  
  reader.readAsDataURL(selectedFile);
}

// Image modal functions
function openImageModal(src, fileName) {
  const modal = document.createElement('div');
  modal.className = 'image-modal';
  modal.innerHTML = `
    <div class="modal-backdrop" onclick="closeImageModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <span>${fileName}</span>
          <button onclick="closeImageModal()" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <img src="${src}" alt="${fileName}" class="modal-image" />
        <div class="modal-footer">
          <button onclick="downloadFile('${src}', '${fileName}')" class="modal-download">
            <i class="fas fa-download"></i> Download
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function closeImageModal() {
  const modal = document.querySelector('.image-modal');
  if (modal) {
    modal.remove();
  }
}

// Utility functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getFileIcon(fileName) {
  const extension = fileName.split('.').pop().toLowerCase();
  const iconMap = {
    'pdf': 'fa-file-pdf',
    'doc': 'fa-file-word',
    'docx': 'fa-file-word',
    'xls': 'fa-file-excel',
    'xlsx': 'fa-file-excel',
    'ppt': 'fa-file-powerpoint',
    'pptx': 'fa-file-powerpoint',
    'zip': 'fa-file-archive',
    'rar': 'fa-file-archive',
    'mp3': 'fa-file-audio',
    'wav': 'fa-file-audio',
    'mp4': 'fa-file-video',
    'avi': 'fa-file-video',
    'jpg': 'fa-file-image',
    'jpeg': 'fa-file-image',
    'png': 'fa-file-image',
    'gif': 'fa-file-image',
    'txt': 'fa-file-alt',
    'js': 'fa-file-code',
    'html': 'fa-file-code',
    'css': 'fa-file-code'
  };
  
  return iconMap[extension] || 'fa-file';
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function downloadFile(fileUrl, fileName) {
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}