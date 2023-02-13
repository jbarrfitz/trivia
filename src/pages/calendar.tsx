import { GetStaticProps } from 'next';
import Head from 'next/head';
import { getEmojiList } from '../lib/sheets';

// temp
interface Props {
    emojis: Array<any>
}


export default function CalendarPage({ emojis }: Props) {
  return (
    <>
      <Head>
        <title>Title - FrasNym</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
      </Head>
      {emojis[0]?.title || 'TITLE'}
    </>
  );
}

export async function getStaticProps(context: GetStaticProps) {
  const emojis = await getEmojiList();
  return {
    props: {
      emojis: emojis.slice(1, emojis.length), // remove sheet header
    },
    revalidate: 1, // In seconds
  };
}
