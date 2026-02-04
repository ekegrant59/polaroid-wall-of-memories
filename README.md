# Wall of Memories

**Wall of Memories** is a beautiful, interactive digital platform designed for creating and sharing personalized memory walls. Whether for anniversaries, birthdays, or special moments, it allows users to curate a journey of memories using photos, heartfelt letters, and a grand final reveal.

## ✨ Features

- **Interactive Wall Editor**: Drag-and-drop interface to upload "Polaroid" style photos, add captions, and arrange them.
- **Storytelling Experience**:
    - **Polaroid Gallery**: Review memories one by one.
    - **Digital Letter**: A "burning" effect transition reveals a personal letter.
    - **Final Reveal**: A grand finale image and message.
- **Secure & Private**:
    - User Authentication via **Supabase**.
    - Optional **PIN Code Protection** for walls.
- **High-Quality Media**: Images are stored and optimized using **Cloudinary**.
- **Responsive Design**: precise layouts for both desktop and mobile experiences.
- **Animations**: Smooth transitions powered by `framer-motion`.

## 🛠️ Tech Stack

- **Frontend**: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth)
- **Storage**: [Cloudinary](https://cloudinary.com/)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- A Supabase account
- A Cloudinary account

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/wall-of-memories.git
    cd wall-of-memories
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory based on `.env.example`:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
    VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
    ```

4.  **Database Setup** 
    Run the SQL scripts provided in `supabase-setup.sql` in your Supabase SQL Editor to create the necessary tables (`users`, `walls`, `polaroids`) and security policies.

5.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 📦 Deployment

This project is optimized for deployment on **Vercel**.

For detailed deployment instructions, please read [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

## 📄 License

MIT License.
