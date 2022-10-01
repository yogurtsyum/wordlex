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
  }, []);

  return (
    <>
      <div className="flex h-screen bg-black">
        <div className="m-auto">
          <img className="h-64 w-auto" src="https://http.cat/404" />
        </div>
      </div>
    </>
  )
}

export default Game;