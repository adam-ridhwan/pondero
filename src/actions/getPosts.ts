'use server';

import { revalidatePath } from 'next/cache';
import { Post } from '@/types';
import { connectToDatabase } from '@/util/connectToDatabase';
import { ObjectId } from 'mongodb';

interface QueryObject {
  _id?: {
    $lt?: ObjectId;
  };
}

const dynamic = 'force-dynamic';
const revalidate = 0;

export const getPosts = async (
  numberOfPostsToFetch: number = 5,
  lastFetchedId?: string | undefined
): Promise<[Post[], number]> => {
  try {
    const { postCollection } = await connectToDatabase();
    const totalDocuments = await postCollection.countDocuments();

    const queryObj: QueryObject = {};

    if (lastFetchedId) {
      queryObj['_id'] = { $lt: new ObjectId(lastFetchedId) };
    }

    const posts: Post[] = await postCollection
      .find(queryObj)
      .sort({ _id: -1 })
      .limit(numberOfPostsToFetch)
      .toArray();

    const convertObjectIdsToStrings = (posts: Post[]) => {
      return [...posts].map(post => {
        // Convert _id, category, and author
        if (post._id && post._id instanceof ObjectId) post._id = post._id.toString();
        if (post.categoryId && post.categoryId instanceof ObjectId)
          post.categoryId = post.categoryId.toString();
        if (post.authorId && post.authorId instanceof ObjectId) post.authorId = post.authorId.toString();

        // Convert comments array
        if (post.comments && Array.isArray(post.comments)) {
          post.comments = post.comments.map(commentId => commentId.toString());
        }

        return post;
      });
    };

    return [convertObjectIdsToStrings(posts), totalDocuments];
  } catch (err) {
    console.error('Error getting posts:', err);
    throw new Error('Error occurred while fetching posts');
  }
};
