import Head from 'next/head';
import Link from 'next/link';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
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
        {postsPagination.results.map(post => (
          <section key={post.uid} className={styles.post}>
            <Link href={`/post/${post.uid}`}>
              <a>{post.data.title}</a>
            </Link>
            <p>{post.data.subtitle}</p>

            <nav className={styles.dateAndAuthor}>
              <div>
                <img src="/images/calendar.svg" alt="calendar" />
                <time>{post.first_publication_date}</time>
              </div>

              <div>
                <img src="/images/user.svg" alt="user" />
                <span>{post.data.author}</span>
              </div>
            </nav>
          </section>
        ))}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByType('posts', { pageSize: 10 });

  const posts = response.results.map(post => ({
    uid: post.uid,
    first_publication_date: format(
      new Date(post.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ).toString(),
    data: {
      title: RichText.asText(post.data.title),
      subtitle: RichText.asText(post.data.subtitle),
      author: RichText.asText(post.data.author),
    },
  }));

  return {
    props: {
      postsPagination: {
        next_page: response.next_page,
        results: posts,
      },
    },
    revalidate: 60 * 30,
  };
};
