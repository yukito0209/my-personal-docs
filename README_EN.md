# Yukito's Penthouse

English | [简体中文](./README.md)

A modern personal homepage and documentation system built with Next.js and Fumadocs UI.

## 🌟 Features

### 🏠 Homepage
- Responsive design for mobile and desktop
- Personal information display
- Education history
- Interest showcase
- Portfolio display
- Real-time announcement board

### 🎵 Music Player
- Local music file playback support
- Album cover display
- Playback controls (play/pause, previous/next)
- Volume control
- Progress bar control
- Support for MP3, WAV, OGG, FLAC formats

### 📚 Documentation System
- Fumadocs-based document management
- MDX format support
- Document search functionality
- Responsive navigation

### 🖼️ Gallery
- Waterfall layout display
- High-resolution image support
- Responsive design
- Image lazy loading

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.1
- **UI Components**: Fumadocs UI 15.2.12
- **Styling**: TailwindCSS 4.1.4
- **Documentation**: Fumadocs MDX 11.6.1
- **Icons**: Lucide React 0.503.0
- **Type Checking**: TypeScript 5.8.3

## 📦 Project Structure

```
my-personal-docs/
├── app/                   # Next.js application directory
│   ├── (home)/            # Homepage components
│   ├── api/               # API routes
│   ├── docs/              # Documentation system
│   ├── gallery/           # Gallery feature
│   └── components/        # Shared components
├── content/               # Content files
│   └── docs/              # Documentation content
├── public/                # Static assets
│   ├── music/             # Music files
│   ├── photos/            # Image files
│   └── logos/             # Logo files
├── lib/                   # Utility functions and configurations
└── .source/               # Source files directory
```

## 🚀 Quick Start

### Requirements

- Node.js 18.0 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yukito0209/my-personal-docs.git

# Navigate to project directory
cd my-personal-docs

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## 🔧 Configuration

### Music Player

Place music files in the `public/music` directory. Supported formats:
- MP3
- WAV
- OGG
- FLAC

### Gallery

Place image files in the `public/photos` directory. It's recommended to compress images appropriately for better loading performance.

### Documentation

Documentation uses MDX format and should be placed in the `content/docs` directory.

## 📝 Development Notes

1. Image Optimization
   - Use Next.js Image component for optimization
   - Consider using CDN for large images
   - Implement image lazy loading

2. Performance Optimization
   - Proper component splitting
   - Use React.memo() for render optimization
   - Compress images and audio files appropriately
   - Use Next.js Turbo mode for development

3. Security
   - Add proper validation to API routes
   - Avoid exposing sensitive information
   - Use environment variables for sensitive configurations

## 📄 License

MIT License

## 🤝 Contributing

Issues and Pull Requests are welcome to help improve the project.