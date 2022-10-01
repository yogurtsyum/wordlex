import { sign } from 'crypto';
import { addDoc, collection, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { HiLogin } from 'react-icons/hi';
import Navbar from '../components/Navbar';
import { auth, database } from '../lib/firebase';
import { signIn } from '../utils/auth';

const Home: NextPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [words, setWords] = useState('');
  const [language, setLanguage] = useState('english');

  const getIdFromName = () => {
    return name.replace(/[^a-z0-9- ]/gi, '').toLowerCase().replaceAll(' ', '-');
  }

  const createGame = async () => {
    let id = getIdFromName();
    let existing = (await getDoc(doc(database, 'games', id))).data();
    if(existing) {
      id = getIdFromName() + '-' + (Math.random() + 1).toString(36).substring(5);
      existing = (await getDoc(doc(database, 'games', id))).data();
      if(existing) return alert('That ID combination is taken.');
    }

    await setDoc(doc(database, 'games', id), {
      id,
      name,
      words: words.split(','),
      language,
      creator: user.uid,
      epoch: Timestamp.fromDate(new Date())
    });

    router.push(`/${id}`);
  }

  useEffect(() => {
    auth.onAuthStateChanged((state) => {
      setUser(state);
    });

    (window as any).particlesJS.load('particles', '/particles.json');
  }, []);

  return (
    <>
      <Navbar user={auth.currentUser} />
      <div id="particles" className="h-full w-full opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 md:-translate-x-0 md:left-16 -translate-y-1/2 mt-2 px-12 py-8 w-3/4 md:w-auto shadow-lg border-gray-300 border-2 rounded-lg bg-white">
        <h1 className="text-center font-bold text-2xl font-serif">Create your own Wordles</h1>
        <p className="text-center mt-1 font-mono text-gray-600 w-auto md:w-96">Recreation of New York Times' Wordle (originally Josh Wardle) for custom games.</p>

        {
          user && user.email && (['@lengo.dev'].some((domain) => user.email.endsWith(domain))) ?
            <>
              <div className="mt-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                    placeholder="Lordle"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  https://wordle.tmg.sh/{getIdFromName() || ''} (may be changed)
                </p>
              </div>

              <div className="mt-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Words
                </label>
                <div className="mt-1">
                  <textarea
                    name="words"
                    id="words"
                    onChange={(e) => setWords(e.target.value.replaceAll(' ', ''))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                    placeholder="Separate with commas (e.g. conch,beast,shore)"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Language
                </label>
                <div className="mt-1">
                  <select
                    name="words"
                    id="words"
                    onChange={(e) => setLanguage(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                    placeholder="Separate with commas"
                  >
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="latin">Latin</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => createGame()}
                  className="mt-4 text-center w-full inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  <span className="text-center w-full">
                    Create
                  </span>
                </button>
              </div>
            </> : <>
              <div className="text-center items-center mt-2">
                <button
                  type="button"
                  onClick={() => signIn()}
                  className="inline-flex items-center rounded-md border border-transparent bg-gray-100 px-3 py-2 text-sm font-medium leading-4 text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  <HiLogin className="mr-2" />Login to create
                </button>
                <p className="mt-4 items-center font-mono text-center text-gray-400">You must have an approved school email.</p>
              </div>
            </>
        }
      </div>
    </>
  )
}

export default Home;