'use server';

import { createAccount } from '@/actions/createAccount';
import { connectToDatabase } from '@/util/connectToDatabase';
import { generateRandomString } from '@/util/generateRandomString';
import { InsertOneResult, ObjectId } from 'mongodb';
import { type Account as NextAuthAccount, type User as NextAuthUser } from 'next-auth';

import { accountSchema, type Account, type User } from '@/types/types';

export const createUserAndAccount = async (account: NextAuthAccount | null, user: NextAuthUser) => {
  try {
    const { userCollection } = await connectToDatabase();

    if (!account) return new Error('Account is null');
    if (!user) return new Error('User is null');

    const validatedAccount = accountSchema.safeParse(account);

    const newUser: User = {
      name: user.name!,
      email: user.email!,
      username: '@' + user?.email?.split('@')[0] + '_' + generateRandomString(),
      accounts: [account as Account],
      posts: [],
      comments: [],
      savedPosts: [],
      followers: [],
    };

    const createdNewUser: InsertOneResult<User> = await userCollection.insertOne(newUser);

    await createAccount(account, new ObjectId(createdNewUser.insertedId));
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Error occurred while creating user');
  }
};
