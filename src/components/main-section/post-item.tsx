'use client';

import * as React from 'react';
import { FC, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { postsAtom } from '@/providers/hydrate-atoms';
import { cn } from '@/util/cn';
import { MD } from '@/util/constants';
import { formatDate } from '@/util/formatDate';
import { useViewportSize } from '@mantine/hooks';
import { useAtom, useAtomValue } from 'jotai';
import { Heart, MessageCircle, MessageSquare } from 'lucide-react';

import { AuthorDetails, type Post } from '@/types/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import SeparatorDot from '@/components/ui/separator-dot';

type CardProps = {
  post: Post;
  author: AuthorDetails | undefined;
};

const MAX_TITLE_HEIGHT = 32;

const PostItem: FC<CardProps> = ({
  post: { _id, title, content, likes, comments, views, createdAt },
  author: { name, image, username } = {},
}) => {
  const titleRef = useRef<HTMLDivElement>(null);
  const [isTitleWrappedInTwoLines, setTsTitleWrappedInTwoLines] = useState(false);
  const { width } = useViewportSize();

  const posts = useAtomValue(postsAtom);
  const post = posts.find(post => post._id === _id);

  /** ────────────────────────────────────────────────────────────────────────────────────────────────────
   * WRAP TITLE
   * Wrap title if it exceeds the height of 32px
   * ────────────────────────────────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const titleNode = titleRef.current;
    if (!titleNode) return;

    if (titleNode.clientHeight > MAX_TITLE_HEIGHT) setTsTitleWrappedInTwoLines(true);
  }, []);

  /** ────────────────────────────────────────────────────────────────────────────────────────────────────
   * PARSE HTML
   * ────────────────────────────────────────────────────────────────────────────────────────────────── */
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const paragraphs = doc.querySelectorAll('p');

  let firstNonEmptyParagraph = null;
  for (let p of paragraphs) {
    if (p.innerHTML.trim() !== '<br>') {
      firstNonEmptyParagraph = p;
      break;
    }
  }

  // if (firstNonEmptyParagraph) {
  //   // Do something with the firstNonEmptyParagraph
  //   console.log(firstNonEmptyParagraph.textContent);
  // } else {
  //   // Handle the case where there is no non-empty paragraph.
  //   console.log('No valid paragraph found!');
  // }

  return (
    <>
      <Card className='md:min-h-[266px]'>
        <Link href={`${username}`} className='flex flex-row items-center gap-2'>
          <Avatar className='h-12 w-12'>
            {image ? <Image src={image} alt='' /> : <AvatarFallback>{name?.split('')[0]}</AvatarFallback>}
          </Avatar>

          <div className='flex flex-col'>
            <span className='font-bold text-primary'>{name}</span>
            <div className='flex flex-row items-center gap-2'>
              <span className='text-muted'>{formatDate(createdAt.toString())}</span>
            </div>
          </div>
        </Link>

        <Link
          href={`${username}/${_id}`}
          className='flex min-h-[112px] flex-col gap-1 md:flex-row md:items-end md:gap-7'
        >
          <div className='flex flex-1 flex-col'>
            <CardHeader>
              <CardTitle ref={titleRef} className={cn(`two-line-ellipsis max-h-[64px] text-primary`)}>
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={cn(
                  `text-muted`,
                  { 'two-line-ellipsis hidden': isTitleWrappedInTwoLines },
                  { 'three-line-ellipsis': !isTitleWrappedInTwoLines },
                  { 'enable-ellipsis': width > MD }
                )}
              >
                {firstNonEmptyParagraph?.innerHTML}
              </p>
            </CardContent>
          </div>

          {/* TODO: Implement images */}
          {/*<div className='relative aspect-video h-max w-full rounded-2xl md:h-[108px] md:w-[180px]'>*/}
          {/*  <Image src='/sand.jpg' alt='' fill className='rounded-2xl object-cover' />*/}
          {/*</div>*/}
        </Link>

        <Link href={`${username}/${_id}`}>
          <CardFooter>
            <div className='mr-3 flex flex-row items-center gap-1'>
              <Heart className='h-5 w-5' />
              <span>{post?.likes.length}</span>
            </div>
            <div className='mr-3 flex flex-row items-center gap-1'>
              <MessageSquare className='h-5 w-5' />
              <span>{post?.comments?.length}</span>
            </div>
            <SeparatorDot />
            <span className='ml-3'>{views} views</span>
          </CardFooter>
        </Link>
      </Card>
    </>
  );
};

export default PostItem;
