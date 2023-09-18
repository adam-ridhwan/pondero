'use client';

import { FC, Fragment, useEffect, useRef, useState } from 'react';
import { getPosts } from '@/actions/getPosts';
import { useIntersection } from '@mantine/hooks';
import { useInfiniteQuery } from '@tanstack/react-query';

import CardSkeleton from '@/components/ui/card-skeleton';
import { Separator } from '@/components/ui/separator';
import Categories from '@/components/categories';
import Post from '@/components/post';

const LIMIT = 5;

type PostListProps = {
  initialPosts: Post[];
};

const PostList: FC<PostListProps> = ({ initialPosts }) => {
  /** ────────────────────────────────────────────────────────────────────────────────────────────────────
   * LOGIC
   * 1) Get first 5 posts first and set it to state
   * 2) Render the first 5 posts
   * 3) When user scrolls to the bottom of the page, fetch the next 5 posts
   * 4) Render the next 5 posts
   * ────────────────────────────────────────────────────────────────────────────────────────────────── */

  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [areAllPostsFetched, setAreAllPostsFetched] = useState(false);
  const lastPostRef = useRef<HTMLDivElement>(null);

  /** ────────────────────────────────────────────────────────────────────────────────────────────────────
   * FETCHES POSTS
   * Fetches posts from the server using server action
   * ────────────────────────────────────────────────────────────────────────────────────────────────── */
  const fetchPost = async (pageParam: number) => {
    const lastPostId = posts?.at(-1)?._id;

    const fetchedPosts = await getPosts(LIMIT, posts.length, lastPostId as string);

    if (!fetchedPosts) {
      setAreAllPostsFetched(true);
      return slicePostsByPage(posts, pageParam);
    }

    const newPosts = [...posts, ...fetchedPosts];
    setPosts(newPosts);

    return slicePostsByPage(newPosts, pageParam);
  };

  const slicePostsByPage = (allPosts: Post[], page: number) => {
    const start = (page - 1) * LIMIT;
    const end = page * LIMIT;
    return allPosts.slice(start, end);
  };

  /** ────────────────────────────────────────────────────────────────────────────────────────────────────
   * USE INFINITE QUERY
   * Fetches posts infinitely
   * ────────────────────────────────────────────────────────────────────────────────────────────────── */
  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ['fetchedPosts'],
    async ({ pageParam = 1 }) => {
      if (areAllPostsFetched) return posts.slice((pageParam - 1) * LIMIT, pageParam * LIMIT);
      return await fetchPost(pageParam);
    },
    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1;
      },
      refetchOnWindowFocus: false,
      initialData: {
        pages: [posts.slice(0, LIMIT)],
        pageParams: [1],
      },
    }
  );

  /** ────────────────────────────────────────────────────────────────────────────────────────────────────
   * USE INTERSECTION
   * Checks if last post is in view
   * ────────────────────────────────────────────────────────────────────────────────────────────────── */
  const { ref: postRef, entry: postEntry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });

  useEffect(() => {
    if (!postEntry?.isIntersecting) return;
    !areAllPostsFetched && fetchNextPage();
  }, [areAllPostsFetched, fetchNextPage, postEntry?.isIntersecting]);

  /** ────────────────────────────────────────────────────────────────────────────────────────────────────
   * Posts fetched from useInfiniteQuery
   * ────────────────────────────────────────────────────────────────────────────────────────────────── */
  const postsToRender = data?.pages.flatMap(page => page);

  return (
    <>
      <main className='relative mb-6 mt-12  md:flex md:flex-col md:items-center'>
        <div className='flex w-full max-w-[728px] flex-col gap-5 md:items-center'>
          <Categories />

          {postsToRender?.map((post, i) => {
            const lastPost = i === postsToRender?.length - 1;
            return (
              <Fragment key={post?.title}>
                <div ref={lastPost ? postRef : null} className='flex flex-col gap-5'>
                  <Post {...{ post }} />
                  <Separator className='md:hidden' />
                </div>

                {areAllPostsFetched ||
                  (lastPost && (
                    <>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Fragment key={i}>
                          <CardSkeleton key={i} className='animate-none' />
                          <Separator className='md:hidden' />
                        </Fragment>
                      ))}
                    </>
                  ))}
              </Fragment>
            );
          })}

          <span className='mt-3 text-muted'>
            {isFetchingNextPage ? 'Loading more posts...' : 'No more posts'}
          </span>
        </div>
      </main>
    </>
  );
};

export default PostList;
