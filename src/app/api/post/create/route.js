import Post from '@/lib/models/post.model.js';
import User from '@/lib/models/user.model.js';  // ✅ import your User model
import { connect } from '@/lib/mongodb/mongoose';
import { currentUser } from '@clerk/nextjs/server';

export const POST = async (req) => {
  const user = await currentUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    await connect();
    const data = await req.json();

    // ✅ Find MongoDB user using Clerk ID
    const mongoUser = await User.findOne({ clerkId: user.id });

    if (!mongoUser) {
      return new Response('User not found in MongoDB', { status: 404 });
    }

    const slug = data.title
      .split(' ')
      .join('-')
      .toLowerCase()
      .replace(/[^a-zA-Z0-9-]/g, '');

    // ✅ Create post with real MongoDB user ID
    const newPost = await Post.create({
      userId: mongoUser._id,   // ✅ MongoDB _id!
      content: data.content,
      title: data.title,
      image: data.image,
      category: data.category,
      slug,
    });

    return new Response(JSON.stringify(newPost), { status: 200 });
  } catch (error) {
    console.log('Error creating post:', error);
    return new Response('Error creating post', { status: 500 });
  }
};
