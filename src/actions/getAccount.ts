'use server';

import { connectToDatabase } from '@/util/connectToDatabase';
import { ObjectId } from 'mongodb';

export async function getAccount(userId: ObjectId | string | undefined, provider: string) {
  try {
    const { accountCollection } = await connectToDatabase();

    const existingAccount = accountCollection.findOne({ userId: new ObjectId(userId), provider });

    return !existingAccount ? null : existingAccount;
  } catch (error) {
    console.error('Error getting account:', error);
    throw new Error('Error occurred while fetching account');
  }
}
