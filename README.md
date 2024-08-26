# CookieGram

## Description
This is a food-focused social media platform built with Next.js. It allows users to share recipes, explore posts from others, and engage with a community of food enthusiasts. Users can upload images via Imgur, manage their profiles with Clerk, and store data securely in MongoDB. The app provides a seamless experience with modern UI and responsive design.

## Features
* **Recipe Sharing:** Share your favorite recipes with the community, complete with images and detailed instructions.
* **Explore Feed:** Discover new recipes and posts from other users, like their posts, and leave comments.
* **Find Recipes:** Search for specific food recipes that match your cravings.
* **Follow Creators:** Stay updated on what your favorite creators are posting.
* **Profile Management:** Securely sign up, sign in, and manage your profile with Clerk.
* **Interactive UI:** Enjoy a responsive design powered by Tailwind CSS, featuring modals, hover effects, and smooth navigation.

<p>
  <img src="https://github.com/Fahmid-Abdullah/cookiegram/blob/43d1fcfeb445cc0d30f60a47928ac8059a194999/demo%20gifs/Landing%20Page.gif" alt="Landing Page" width="300" style="display: inline-block; margin-right: 10px;">
  <img src="https://github.com/Fahmid-Abdullah/cookiegram/blob/43d1fcfeb445cc0d30f60a47928ac8059a194999/demo%20gifs/Home%20Page.gif" alt="Home Page" width="300" style="display: inline-block; margin-right: 10px;">
  <img src="https://github.com/Fahmid-Abdullah/cookiegram/blob/43d1fcfeb445cc0d30f60a47928ac8059a194999/demo%20gifs/New%20Post.gif" alt="New Post" width="300" style="display: inline-block;">
</p>


## Tech Stack
* **Frontend:** Next.js, React, Tailwind CSS, Axios
* **Backend:** Node.js
* **Database:** MongoDB
* **Authentication:** Clerk
* **Image Hosting:** Imgur API
* **Deployment:** Vercel

## How to Run
You can check out the app via the Vercel link in the bio. If you'd like to run it locally, follow the instructions below:


Clone the repository:

```bash
git clone https://github.com/Fahmid-Abdullah/cookiegram.git
cd your-repo
```

Install dependencies:

```bash
npm install
```

Create a .env.local file in the root directory with the following (Set up environment variables):
```bash
NEXT_PUBLIC_API_SECRET_TOKEN=<>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<>
CLERK_SECRET_KEY=<>
NEXT_PUBLIC_CLERK_SIGN_IN_URL=<>
NEXT_PUBLIC_CLERK_SIGN_UP_URL=<>
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=<>
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=<>
NEXT_PUBLIC_IMGUR_CLIENT_ID=<>
IMGUR_CLIENT_SECRET=<>
IMGUR_REFRESH_TOKEN=<>
MONGODB_URL=<>
```

Run the development server:

```bash
npm run dev
```

Open the app in your browser:

```bash
http://localhost:3000
```
