// pages/index.js
import Head from 'next/head';
import Game from './components/Game';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Gift Box Game</title>
        <meta name="description" content="A simple gift box game using Next.js and Framer Motion" />
      </Head>
      <Game />
    </div>
  );
}
