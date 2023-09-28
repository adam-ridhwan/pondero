'use client';

import * as React from 'react';
import { FC } from 'react';
import { LIKE } from '@/util/constants';
import { Bookmark, Heart, MessageSquare, Share } from 'lucide-react';
import { Session } from 'next-auth';

import { Post } from '@/types/types';
import { Button } from '@/components/ui/button';
import { ActionButtonRequestBody } from '@/app/api/post/route';

type ActionButtonsProps = {
  mainPost: Post;
  session: Session | null;
};

const ActionButtons: FC<ActionButtonsProps> = ({ mainPost, session }) => {
  const likePost = async () => {
    const { signal } = new AbortController();

    if (!session) throw new Error('Session not found');

    if (!mainPost) throw new Error('Post not found');
    if (!session?.user?.email) throw new Error('Email session not found');

    const body: ActionButtonRequestBody = {
      actionId: LIKE,
      postId: mainPost._id,
      email: session.user.email,
    };

    const response = await fetch('/api/post', {
      signal,
      method: 'POST',
      body: JSON.stringify(body),
    });

    console.log(await response.json());
  };
  return (
    <>
      <div className='mb-5 flex flex-row gap-5'>
        <Button
          variant='ghost'
          onClick={() => {
            likePost();
          }}
          className='flex w-max flex-row gap-1 p-0 text-muted/80 hover:bg-transparent hover:text-primary'
        >
          <Heart className='h-5 w-5 ' />
          Like
        </Button>
        <Button
          variant='ghost'
          className='flex w-max flex-row gap-1 p-0 text-muted/80 hover:bg-transparent hover:text-primary'
        >
          <MessageSquare className='h-5 w-5' />
          Comment
        </Button>
        <Button
          variant='ghost'
          className='flex w-max flex-row gap-1 p-0 text-muted/80 hover:bg-transparent hover:text-primary'
        >
          <Bookmark className='h-5 w-5' />
          Save
        </Button>
        <Button
          variant='ghost'
          className='flex w-max flex-row gap-1 p-0 text-muted/80 hover:bg-transparent hover:text-primary'
        >
          <Share className='h-5 w-5' />
          Share
        </Button>
      </div>
    </>
  );
};

export default ActionButtons;
