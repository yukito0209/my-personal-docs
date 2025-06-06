# Yukito's Penthouse

English | [简体中文](./README.md)

A modern personal homepage and documentation system built with Next.js and Fumadocs UI.

## 🌟 Features

- Responsive personal homepage displaying personal information and education history
- Fumadocs-based documentation system with MDX support and search functionality
- Custom local music player with album cover display (supports MP3, WAV, OGG, FLAC)
- Waterfall layout photo gallery
- Light/dark mode switching with smooth transition animations
- Global application of LXGW WenKai font for enhanced reading experience
- Frosted glass UI effect applied in multiple areas for enhanced visual hierarchy
- Bangumi-API-based "Daily Anime Broadcast" and "My Watching List"

## 🛠️ Tech Stack

- **Next.js 15.3.1** - React application framework
- **Fumadocs UI 15.2.12 & MDX 11.6.1** - Documentation system core
- **TailwindCSS 4.1.4** - Utility-first CSS framework
- **TypeScript 5.8.3** - Strongly typed JavaScript superset
- **Lucide React 0.503.0** - Icon library
- **Simple Icons** - Brand SVG icon library
- **React Context API** - For state management (e.g., theme, music player)

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

- Node.js 20.0 or higher
- npm

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
```

## 🔧 Configuration

### Music Player

Place music files in the `public/music` directory. Supported formats:
- MP3
- WAV
- OGG
- FLAC
It is recommended that music files are not too large to avoid long loading times for web playback.

### Gallery

Place image files in the `public/photos` directory. It's recommended to compress images appropriately for better loading performance.
We recommend using [Squoosh](https://squoosh.app/) to compress images into webp format.

### Documentation

Documentation uses MDX format and should be placed in the `content/docs` directory.
For specific usage, please refer to: https://fumadocs.dev/docs/mdx

## 📄 License

[MIT License](https://github.com/yukito0209/my-personal-docs/blob/master/LICENSE)

## 🤝 Special Thanks

The successful implementation of this project relies on the support of the following projects/service providers. **We express our sincere gratitude to them!**

- [Rainyun](https://www.rainyun.com/YUKITO_) - A new generation cloud server provider
- [Fumadocs](https://github.com/fuma-nama/fumadocs) - A practical framework for building documentation websites with Next.js
- [LXGW WenKai](https://github.com/lxgw/LxgwWenKai) - An elegant and beautiful open-source font
- [lxgw-wenkai-webfont](https://github.com/chawyehsu/lxgw-wenkai-webfont) - npm webfont package for LXGW WenKai
- [Squoosh](https://github.com/GoogleChromeLabs/squoosh?tab=readme-ov-file) - Image compression web app that reduces image file sizes through various formats
- [Lucide](https://github.com/lucide-icons/lucide) - An open-source icon library featuring 1k+ SVG files
- [Simple Icons](https://github.com/simple-icons/simple-icons) - An open-source icon library containing 3.2k+ SVG icons for popular brands

Feel free to submit Issues and Pull Requests to help improve the project! If it helps you, **please star this repo**. Thank you very much!