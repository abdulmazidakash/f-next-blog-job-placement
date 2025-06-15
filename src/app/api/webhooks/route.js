import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { clerkClient } from '@clerk/nextjs/server';
import { createOrUpdateUser, deleteUser } from '@/lib/actions/user';

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET; // ✅ Correct name

  if (!WEBHOOK_SECRET) {
    throw new Error(
      'Missing CLERK_WEBHOOK_SIGNING_SECRET in .env.local'
    );
  }

  // ✅ 1. get raw body for svix
  const body = await req.text();
  const headerPayload = headers();

  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error verifying', { status: 400 });
  }

  const eventType = evt?.type;
  const payload = evt?.data;

  console.log(`Webhook: ${eventType} for ID ${payload.id}`);

  if (eventType === 'user.created' || eventType === 'user.updated') {
    try {
      const user = await createOrUpdateUser(
        payload.id,
        payload.first_name,
        payload.last_name,
        payload.image_url,
        payload.email_addresses[0].email_address, // ✅ plural + first item
        payload.username // ✅ check Clerk docs: it's `username` not `userName`
      );

      if (user && eventType === 'user.created') {
        await clerkClient.users.updateUserMetadata(payload.id, {
          publicMetadata: {
            userMongoId: user._id,
            isAdmin: user.isAdmin,
          },
        });
      }
    } catch (err) {
      console.error('Error saving user:', err);
      return new Response('Error saving user', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    try {
      await deleteUser(payload.id);
    } catch (err) {
      console.error('Error deleting user:', err);
      return new Response('Error deleting user', { status: 500 });
    }
  }

  return new Response('OK', { status: 200 });
}
