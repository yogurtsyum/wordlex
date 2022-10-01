import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import { FaGoogle } from 'react-icons/fa';
import { HiDocumentSearch, HiOutlineDocumentSearch } from 'react-icons/hi';
import { signIn } from '../utils/auth';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useEffect, useState } from 'react';

const Game: NextPage = () => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    auth.onAuthStateChanged((state) => {
      setUser(state);
      if(!router.query.to) return;
      if(state) router.push(`/${router.query.to}`);
    });

    (window as any).particlesJS.load('particles', '/particles.json');
  }, []);

  return (
    <>
      <Navbar user={user} />
      <div id="particles" className="h-full w-full opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-12 py-8 shadow-lg border-gray-300 border-2 rounded-lg bg-white">
        <h1 className="text-center font-bold text-xl font-serif">Login to Play</h1>

        <div className="text-center items-center mt-2">
          <button
            type="button"
            onClick={() => {
              signIn(() => {
                router.push(`/${router.query.to || ''}`);
              });
            }}
            className="inline-flex mr-3 items-center rounded-md border border-transparent bg-amber-100 px-3 py-2 text-sm font-medium leading-4 text-amber-600 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            <FaGoogle className="mr-2" />Login with Google
          </button>

          <button
            type="button"
            className="inline-flex items-center rounded-md border border-transparent bg-gray-100 px-3 py-2 text-sm font-medium leading-4 text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            onClick={() => {
              signInAnonymously(auth).then((result) => {
                router.push(`/${router.query.to || ''}`);
              });
            }}
          >
            <HiOutlineDocumentSearch className="mr-2" />Play Offline
          </button>
        </div>
      </div>
    </>
  )
}

export default Game;