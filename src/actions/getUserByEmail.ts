'use server';

import { connectToDatabase } from '@/util/connectToDatabase';
import { plainify } from '@/util/plainify';

import { User } from '@/types/types';

export async function getUserByEmail(email?: string | undefined | null) {
  if (!email) throw new Error('Either email must be provided');

  try {
    const { userCollection } = await connectToDatabase();
    const user = await userCollection.findOne({ email });

    return plainify(user);
  } catch (error) {
    console.error('Error getting user:', error);
    throw new Error('Error occurred while fetching user');
  }
}
