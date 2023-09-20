import { getPosts } from '@/actions/getPosts';
import { getUsersById } from '@/actions/getUsersById';
import { Post } from '@/types';
import { connectToDatabase } from '@/util/connectToDatabase';
import { ObjectId } from 'mongodb';

import PostList from '@/components/post-list';
import SideMenu from '@/components/side-menu';

const generatePost = (index: number): Post => {
  const title = `Mock Post ${index}`;
  const postSlug = `mock-post-${index}`;
  const category = new ObjectId('6505ecac822e8ec0e9b8a1be');
  const author = new ObjectId('6503dc4a3d166bffdaeacc0c');

  return {
    createdAt: new Date(),
    postSlug,
    title,
    content: `This is the content for the ${title}. It aims to provide readers with insights on topic ${index}. 
    More in-depth content will be shared soon. Stay tuned for updates.`,
    views: Math.floor(Math.random() * 2000),
    categorySlug: 'mock-category',
    category,
    author,
    comments: [],
    likes: Math.floor(Math.random() * 100),
  };
};

export default async function Home() {
  const initialPosts = await getPosts(5, 0, undefined);
  if (!initialPosts) throw new Error('Failed to fetch initial posts');

  const authorIds = initialPosts.map(post => post.author);
  const initialAuthors = await getUsersById(authorIds);
  if (!initialAuthors) throw new Error('Failed to fetch initial authors');

  const { postCollection } = await connectToDatabase();
  const mockPosts = Array.from({ length: 30 }, (_, index) => generatePost(index + 31));
  // await postCollection.insertMany(mockPosts);
  // await postCollection.deleteMany({});

  if (!initialPosts && !initialAuthors) return <div>Please refresh page</div>;

  return (
    <div className='container flex flex-col px-5 xl:flex-row xl:justify-center'>
      {initialPosts && <PostList {...{ initialPosts, initialAuthors }} />}
      <SideMenu />
    </div>
  );
}
