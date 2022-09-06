import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

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
  return (
    <>
      <Head>
        <title>Home | spacetraveling.</title>
      </Head>

      <main
        className={`${styles.contentContainer} ${commonStyles.maxWidthContainer}`}
      >
        <section className={styles.post}>
          <Link href="post/1">
            <a>Como utilizar Hooks</a>
          </Link>
          <p>Pensando em sincronização em vez de ciclos de vida.</p>

          <nav className={styles.dateAndAuthor}>
            <div>
              <img src="/images/calendar.svg" alt="calendar" />
              <time>15 Mar 2021</time>
            </div>

            <div>
              <img src="/images/user.svg" alt="user" />
              <span>Joseph Oliveira</span>
            </div>
          </nav>
        </section>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', { pageSize: 10 });

  console.log(postsResponse);

  return {
    props: {
      postsResponse,
    },
    revalidate: 60 * 30,
  };
};
