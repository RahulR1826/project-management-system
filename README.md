# Project Management System

A comprehensive project management system built with Next.js, React, and TypeScript. Features include project tracking, team collaboration, admin messaging portal, and analytics dashboard.

## Features

- **Project Management**: Create, organize, and track projects with detailed task management
- **Team Collaboration**: Assign tasks, share files, and communicate effectively
- **Admin Portal**: Powerful messaging system for sending announcements and managing communications
- **Analytics Dashboard**: Track progress, generate reports, and gain insights
- **User Management**: Manage user roles, permissions, and access control
- **Responsive Design**: Modern, mobile-friendly interface

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library with Radix UI
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── admin/             # Admin portal pages
│   ├── dashboard/         # User dashboard
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Reusable components
│   └── ui/               # UI component library
├── lib/                  # Utility functions
└── public/               # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Key Pages

- **/** - Homepage with feature overview
- **/dashboard** - Main project dashboard
- **/user** - User portal for personal tasks, projects, and messages
- **/admin** - Admin portal with messaging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
