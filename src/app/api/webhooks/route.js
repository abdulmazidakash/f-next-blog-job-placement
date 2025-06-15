import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { createOrUpdateUser, deleteUser } from '@/lib/actions/user';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Missing WEBHOOK_SECRET in .env.local');
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing Svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  const { id, first_name, last_name, image_url, email_addresses, username } = evt?.data || {};
  const eventType = evt?.type;

  console.log(`Webhook ID: ${id}, Type: ${eventType}`);

  // ✅ Extract primary email safely
  const email = email_addresses?.[0]?.email_address || '';

  if (eventType === 'user.created' || eventType === 'user.updated') {
    try {
      const user = await createOrUpdateUser(
        id,
        first_name || '',
        last_name || '',
        image_url || '',
        email,
        username || ''
      );

      if (user && eventType === 'user.created') {
        await clerkClient.users.updateUserMetadata(id, {
          publicMetadata: {
            userMongoId: user._id.toString(),
            isAdmin: user.isAdmin,
          },
        });
        console.log('✅ Clerk metadata updated:', {
          userMongoId: user._id,
          isAdmin: user.isAdmin,
        });
      }
    } catch (err) {
      console.error('Error creating/updating user:', err);
      return new Response('Internal error', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    try {
      await deleteUser(id);
    } catch (err) {
      console.error('Error deleting user:', err);
      return new Response('Internal error', { status: 500 });
    }
  }

  return new Response('OK', { status: 200 });
}
