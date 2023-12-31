'use server';

import { connectToDatabase } from '@/util/connectToDatabase';
import { plainify } from '@/util/plainify';
import { ObjectId } from 'mongodb';

import { Comment, CommentWithUserInfo } from '@/types/types';

export type CreateCommentResponse = {
  response: boolean;
  newComment: CommentWithUserInfo;
};

export const createComment = async (
  postId: string,
  currentUserId: string,
  newComment: string
): Promise<CreateCommentResponse> => {
  try {
    const { commentCollection, postCollection, userCollection } = await connectToDatabase();

    const fetchedCurrentUser = await userCollection.findOne({ _id: new ObjectId(currentUserId) });
    if (!fetchedCurrentUser) throw new Error('User not found');

    const comment: Comment = {
      createdAt: new Date(),
      comment: newComment,
      postId: new ObjectId(postId),
      userId: new ObjectId(currentUserId),
      likes: [],
      replies: [],
    };

    const insertCommentResponse = await commentCollection.insertOne(comment);
    const commentId = insertCommentResponse.insertedId;

    const pendingUpdatePost = postCollection.updateOne(
      { _id: new ObjectId(postId) },
      { $push: { comments: new ObjectId(commentId) } }
    );
    const pendingUpdateUser = userCollection.updateOne(
      { _id: new ObjectId(currentUserId) },
      { $push: { comments: new ObjectId(commentId) } }
    );

    await Promise.all([pendingUpdatePost, pendingUpdateUser]);

    const commenter = await userCollection.findOne({ _id: new ObjectId(currentUserId) });
    if (!commenter) throw new Error('Commenter not found');

    const newCommentWithUserInfo: CommentWithUserInfo = {
      ...comment,
      name: commenter.name,
      username: commenter.username,
      image: commenter.image,
      posts: commenter.posts,
      followers: commenter.followers,
    };

    return {
      response: plainify(insertCommentResponse.acknowledged),
      newComment: plainify(newCommentWithUserInfo),
    };
  } catch (err) {
    console.error('Error creating comment:', err);
    throw new Error('Error occurred while creating comment');
  }
};
