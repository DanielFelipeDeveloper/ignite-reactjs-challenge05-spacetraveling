import Head from 'next/head';
import Link from 'next/link';

import { GetStaticProps } from 'next';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import formatPostsData from '../utils/formatPostsData';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(
    formatPostsData(postsPagination.results)
  );
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function handleLoadMorePosts(): Promise<void> {
    const response = await fetch(postsPagination.next_page);
    const postsResponse: PostPagination = await response.json();
    const { results, next_page } = postsResponse;

    setNextPage(next_page);
    setPosts([...posts, ...formatPostsData(results)]);
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling.</title>
      </Head>

      <main
        className={`${styles.contentContainer} ${commonStyles.maxWidthContainer}`}
      >
        {posts.map(post => (
          <section key={post.uid} className={styles.post}>
            <Link href={`/post/${post.uid}`}>
              <a>{post.data.title}</a>
            </Link>
            <p>{post.data.subtitle}</p>

            <nav className={commonStyles.postInfos}>
              <div>
                <FiCalendar />
                <time>{post.first_publication_date}</time>
              </div>

              <div>
                <FiUser />
                <span>{post.data.author}</span>
              </div>
            </nav>
          </section>
        ))}

        {nextPage && (
          <button
            type="button"
            className={styles.hasNextButton}
            onClick={handleLoadMorePosts}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByType('posts', { pageSize: 1 });

  return {
    props: {
      postsPagination: {
        next_page: response.next_page,
        results: response.results,
      },
    },
    revalidate: 60 * 30,
  };
};
