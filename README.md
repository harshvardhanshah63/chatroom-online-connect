# Real-Time Chat Application

A modern, feature-rich real-time chat application built with Node.js, Socket.IO, and a beautiful dark theme UI. The application supports text messages, file attachments (images, videos, audio, documents), and real-time user presence indicators.

![Real-Time Chat Application - visual selection (1)](https://github.com/user-attachments/assets/f699351b-d427-4514-9bed-4a4576c24bc9)


## 📸 Screenshot

![Screenshot 2025-06-15 023509](https://github.com/user-attachments/assets/fbd32a78-1a4e-4ce2-b564-45a35dda64e3)
![Screenshot 2025-06-15 023708](https://github.com/user-attachments/assets/601cc562-a9b9-4b65-82f5-0ad754fe2a6c)
![Screenshot 2025-06-15 023902](https://github.com/user-attachments/assets/ae098f7e-bfe2-4073-88ec-4f47b6971afe)
![Screenshot 2025-06-15 023917](https://github.com/user-attachments/assets/50a3d47d-e94e-471e-8f41-4507e933b19c)
![Screenshot 2025-06-15 024119](https://github.com/user-attachments/assets/e6296b6e-3a59-48c3-95d7-8e2ee327f2aa)


## Features

### 🚀 Core Features
- **Real-time messaging** with Socket.IO
- **User authentication** with username system
- **Online user count** and presence indicators
- **Message persistence** in local storage
- **Typing indicators** for active conversations
- **Responsive design** for mobile and desktop

![Real-Time Chat Application - visual selection (2) (1)](https://github.com/user-attachments/assets/b8a3a9d1-d033-4588-8026-dca1e191ab82)


### 📎 File Sharing
- **Image sharing** with inline preview and modal view
- **Video sharing** with embedded player
- **Audio file** support with custom player
- **Document attachments** with download functionality
- **File preview** before sending
- **Drag & drop** file upload support

### 🎨 UI/UX Features
- **Dark theme** with elegant design
- **Animated gradients** and smooth transitions
- **Custom logo** integration in header and background
- **WhatsApp-style** message bubbles
- **Smooth animations** for message delivery
- **Custom scrollbars** and hover effects

## Tech Stack

- **Backend**: Node.js, Express.js, Socket.IO
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **File Handling**: Multer for file uploads
- **Real-time Communication**: WebSocket via Socket.IO
- **Storage**: Local Storage for message persistence

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd chat-application
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Add your logo**
   - Place your `logo.png` file in the root directory
   - The logo will appear in the chat header and as a background watermark

4. **Start the server**
   \`\`\`bash
   npm start
   \`\`\`
   or
   \`\`\`bash
   node server.js
   \`\`\`

5. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - Enter a username to join the chat room

## File Structure

\`\`\`

![Real-Time Chat Application - visual selection (3) (1)](https://github.com/user-attachments/assets/74fdd61e-ea71-4887-be62-e2314786379b)

\`\`\`

## Configuration

### Server Configuration
The server runs on port 3000 by default. You can change this in `server.js`:

\`\`\`javascript
const PORT = process.env.PORT || 3000;
\`\`\`

### File Upload Limits
File upload limits can be configured in `server.js`:

\`\`\`javascript
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});
\`\`\`

### Supported File Types
- **Images**: JPG, JPEG, PNG, GIF, WebP
- **Videos**: MP4, WebM, OGV
- **Audio**: MP3, WAV, OGG
- **Documents**: PDF, DOC, DOCX, TXT, and more

## Usage

### Joining the Chat
1. Enter a username on the login screen
2. Click "Join Chat" to enter the chat room
3. Start sending messages and files instantly

### Sending Messages
- Type your message in the input field
- Press Enter or click the send button
- Messages appear instantly for all connected users

### Sharing Files
1. Click the attachment button (📎)
2. Select files from your device or drag & drop
3. Preview the file before sending
4. Click "Send File" to share with everyone

### Viewing Media
- **Images**: Click to view in full-screen modal
- **Videos**: Play directly in the chat
- **Audio**: Use the built-in audio player
- **Documents**: Download to view locally

## API Endpoints

### Socket.IO Events

#### Client to Server
- `join` - User joins the chat room
- `message` - Send a text message
- `typing` - User is typing indicator
- `stop typing` - User stopped typing
- `disconnect` - User leaves the chat

#### Server to Client
- `user joined` - Broadcast when user joins
- `user left` - Broadcast when user leaves
- `message` - Receive new messages
- `typing` - Show typing indicator
- `stop typing` - Hide typing indicator
- `user count` - Update online user count

### HTTP Endpoints
- `GET /` - Serve the main chat interface
- `POST /upload` - Handle file uploads

## Customization

### Changing Colors
The application uses CSS custom properties. Update the color scheme in `style.css`:

\`\`\`css
:root {
  --primary-color: #ffb6b6;
  --secondary-color: #ff9999;
  --background-dark: #1a1a1a;
  --surface-dark: #2d2d2d;
}
\`\`\`

### Adding Your Logo
1. Replace `logo.png` with your logo file
2. Ensure the logo is square (recommended: 100x100px)
3. The logo will automatically appear in the header and background

### Custom Themes
Create additional themes by duplicating and modifying the CSS color variables and gradient definitions.

## Browser Support

- **Chrome** 60+
- **Firefox** 55+
- **Safari** 12+
- **Edge** 79+
- **Mobile browsers** (iOS Safari, Chrome Mobile)

## Performance Features

- **Efficient file handling** with size limits
- **Optimized animations** with CSS transforms
- **Lazy loading** for media content
- **Memory management** for local storage
- **Responsive images** with proper sizing

## Security Features

- **File type validation** on upload
- **File size limits** to prevent abuse
- **XSS protection** with proper escaping
- **CORS configuration** for secure connections

## Troubleshooting

### Common Issues

1. **Port already in use**
   \`\`\`bash
   Error: listen EADDRINUSE :::3000
   \`\`\`
   Solution: Change the port in `server.js` or kill the process using port 3000

2. **Files not uploading**
   - Check file size (must be under 10MB)
   - Ensure `uploads/` directory exists
   - Verify file type is supported

3. **Messages not persisting**
   - Check browser local storage permissions
   - Clear browser cache if needed

4. **Real-time features not working**
   - Ensure WebSocket connections are allowed
   - Check firewall settings
   - Verify Socket.IO client/server versions match

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## Acknowledgments

- Socket.IO for real-time communication
- Font Awesome for icons
- CSS gradients and animations inspiration from modern chat applications
- Dark theme design inspired by popular messaging platforms



![Real-Time Chat Application - visual selection (4) (1)](https://github.com/user-attachments/assets/be5c8687-d162-4eb1-ae1c-16d631e35d30)

## Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Happy Chatting! 💬**
