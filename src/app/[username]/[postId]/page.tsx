import * as React from 'react';
import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostInformation } from '@/actions/getPostInformation';
import { formatDate } from '@/util/formatDate';
import sanitizeHtml from 'sanitize-html';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import CommentButton from '@/components/post-page/action-buttons/comment-button';
import LikeButton from '@/components/post-page/action-buttons/like-button';
import MoreOptionsButton from '@/components/post-page/action-buttons/more-options-button';
import SaveButton from '@/components/post-page/action-buttons/save-button';
import ShareButton from '@/components/post-page/action-buttons/share-button';
import MorePostsList from '@/components/post-page/more-posts-list';

type PostPageProps = {
  params: {
    username: string;
    postId: string;
  };
};

const PostPage: FC<PostPageProps> = async ({ params }) => {
  const { username, postId } = params;

  const postInformation = await getPostInformation(decodeURIComponent(username), postId);
  if (!postInformation) notFound();

  const { author, post } = postInformation;
  if (!author || !post) notFound();

  const { name, image, followerCount } = author;
  const { mainPost, next4Posts } = post;

  return (
    <>
      <div className='flex min-h-[100dvh] flex-col'>
        <div className='container flex flex-col items-center pb-[30px] pt-[100px]'>
          <div className='mb-3 w-full md:max-w-[680px]'>
            <h1 className='text-balance title leading-9 text-primary'>{mainPost?.title}</h1>
            <h2 className='text-balance subtitle text-muted'>{mainPost?.subtitle}</h2>

            <div className='mb-3 flex flex-row items-center gap-3'>
              <Link href={`/${username}`} className='flex flex-row items-center gap-2'>
                <Avatar className='h-12 w-12'>
                  {image ? (
                    <Image src={image} alt='' />
                  ) : (
                    <AvatarFallback className='text-primary'>{name?.split('')[0]}</AvatarFallback>
                  )}
                </Avatar>

                <div className='flex flex-col'>
                  <span className='font-bold text-primary'>{name}</span>
                  <div className='flex flex-row items-center gap-2'>
                    <span className='text-muted'>{formatDate(mainPost.createdAt.toString())}</span>
                  </div>
                </div>
              </Link>
            </div>

            <div className='mb-5 flex flex-row justify-between'>
              <div className='flex flex-row gap-5'>
                <LikeButton />
                <CommentButton mainPost={mainPost} />
              </div>
              <div className='flex flex-row gap-5'>
                <SaveButton />
                <ShareButton />
                <MoreOptionsButton />
              </div>
            </div>

            {/* TODO: Implement images */}
            {/*<div className='relative mb-5 aspect-video w-full max-w-[750px]'>*/}
            {/*  <Image src='/sand.jpg' alt='sand' fill className='rounded-lg object-cover' />*/}
            {/*</div>*/}

            <div
              className='content-section flex flex-col gap-5 text-xl leading-8 text-paragraph'
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(mainPost.content) }}
            />
          </div>
        </div>

        <MorePostsList {...{ author, next4Posts }} />
      </div>
    </>
  );
};

export default PostPage;
