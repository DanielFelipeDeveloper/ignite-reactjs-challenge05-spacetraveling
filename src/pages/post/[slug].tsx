import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { RichText } from 'prismic-dom';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling.</title>
      </Head>

      <div className={styles.banner}>
        <img src={post.data.banner.url} alt="banner" />
      </div>

      <main
        className={`${styles.contentContainer} ${commonStyles.maxWidthContainer}`}
      >
        <div className={styles.postHeader}>
          <h1>{post.data.title}</h1>

          <nav className={commonStyles.dateAndAuthor}>
            <div>
              <img src="/images/calendar.svg" alt="calendar" />
              <time>{post.first_publication_date}</time>
            </div>

            <div>
              <img src="/images/user.svg" alt="user" />
              <span>{post.data.author}</span>
            </div>
          </nav>
        </div>

        <div className={styles.postContent}>
          {post.data.content.map(content => (
            <article key={content.heading}>
              {content.heading && <h1>{content.heading}</h1>}

              <div
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </article>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');

  return {
    paths: posts.results.map(post => ({ params: { slug: post.uid } })),
    fallback: true,
  };
};

export const getStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug));

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      ...response.data,
      title: RichText.asText(response.data.title),
      author: RichText.asText(response.data.author),
      content: response.data.content.map(content => ({
        heading: RichText.asText(content.heading),
        body: [...content.body],
      })),
    },
  };

  return {
    props: {
      post,
    },
  };
};
