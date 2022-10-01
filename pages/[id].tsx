import type { NextPage } from 'next';
import { auth, database, provider } from '../lib/firebase';
import Head from 'next/head';
import Image from 'next/image';
import { signInWithPopup, signOut } from 'firebase/auth';
import { HiArrowDown, HiArrowUp, HiCheck, HiOutlineMail, HiOutlinePuzzle, HiOutlineUserCircle, HiPaperAirplane, HiPuzzle } from 'react-icons/hi';
import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useRef, useState } from 'react';
import { BarLoader, FadeLoader } from 'react-spinners';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';
import { FaTrophy } from 'react-icons/fa';
import { Pie } from 'react-chartjs-2';
import { ArcElement, Chart, Tooltip } from 'chart.js';

const dictionaries: any = {
  english: '/english.txt',
  spanish: '/spanish.txt',
  latin: '/latin.txt',
}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

export function WinnerModal({ open, setOpen }: { open: boolean, setOpen: any }) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <FaTrophy className="h-6 w-6 text-green-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      You won!
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Good job. Come back tomorrow to play again.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:text-sm"
                    onClick={() => setOpen(false)}
                  >
                    Dismiss
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

const Game: NextPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<any>(null);
  const [current, setCurrent] = useState('');
  const [currentRow, setCurrentRow] = useState(0);
  const [guesses, setGuesses] = useState<any>([]);
  const [feedback, setFeedback] = useState<any>([]);
  const [feedbackKeys, setFeedbackKeys] = useState<any>([]);
  const [done, setDone] = useState(false);
  const [showingWinnerModal, setShowingWinnerModal] = useState(false);
  const [tries, setTries] = useState<any>([]);

  Chart.register(ArcElement, Tooltip);

  useEffect(() => {
    auth.onAuthStateChanged((state) => {
      setUser(state);
      if (!router.query.id) return;
      if (!state) router.push(`/login?to=${router.query.id}`);
    });
  }, [router.query]);

  useEffect(() => {
    if (!game) return;
    (async () => {
      const day = window.localStorage.getItem(`${game.id}.day`);
      const lbQuery = query(collection(database, 'completions'), where('game', '==', game.id), where('day', '==', Number(day)));
      const leaderboard = (await getDocs(lbQuery)).docs.map((doc) => doc.data());
      setTries([
        leaderboard.filter((entry) => entry.row === 1).length,
        leaderboard.filter((entry) => entry.row === 2).length,
        leaderboard.filter((entry) => entry.row === 3).length,
        leaderboard.filter((entry) => entry.row === 4).length,
        leaderboard.filter((entry) => entry.row === 5).length,
        leaderboard.filter((entry) => entry.row === 6).length,
      ]);
      setLoading(false);
    })();
  }, [game]);

  useEffect(() => {
    window.onkeydown = (e) => {
      if (e.key === 'Enter') {
        checkGuess();
      } else if (e.key === 'Backspace') {
        setCurrent(current.slice(0, -1));
      }
    }

    window.onkeypress = (e) => {
      if (done) return;
      if (!/^[A-Za-z]+$/.test(e.key) || e.key === 'Enter') return;
      if (current.length + 1 > game?.word.length) return;
      setCurrent(current + e.key.toLowerCase());
    }
  }, [current]);

  useEffect(() => {
    if (!router.query.id) return;
    (async () => {
      const gameData: any = (await getDoc(doc(database, 'games', router.query.id as string))).data();
      if (!gameData) return router.push('/404');
      const localeWords = (await axios.get(dictionaries[gameData.language])).data.split('\n');

      const epoch = new Date(gameData.epoch.seconds * 1000);
      const day = Number(Math.abs((epoch.getTime() - new Date().getTime()) / (1000 * 3600 * 24)).toString().charAt(0));
      const word = gameData.words[day % gameData.words.length];

      if (window.localStorage.getItem(`${gameData.id}.day`) === day.toString()) {
        setCurrentRow(Number(window.localStorage.getItem(`${gameData.id}.currentRow`)));
        setGuesses(window.localStorage.getItem(`${gameData.id}.guesses`)?.split(',').filter((guess) => guess !== ''));
        setFeedback(window.localStorage.getItem(`${gameData.id}.feedback`)?.split(',').filter((item) => item !== ''));
        setFeedbackKeys(JSON.parse(window.localStorage.getItem(`${gameData.id}.feedbackKeys`) as string));
        setDone(window.localStorage.getItem(`${gameData.id}.done`) === 'true' ? true : false);
      } else {
        window.localStorage.setItem(`${gameData.id}.currentRow`, currentRow.toString());
        window.localStorage.setItem(`${gameData.id}.guesses`, guesses.join(','));
        window.localStorage.setItem(`${gameData.id}.feedback`, feedback.join(','));
        window.localStorage.setItem(`${gameData.id}.feedbackKeys`, JSON.stringify(feedbackKeys));
        window.localStorage.setItem(`${gameData.id}.done`, done.toString());
        window.localStorage.setItem(`${gameData.id}.day`, day.toString());
      }

      setGame({ ...gameData, localeWords, word });
    })();
  }, [router.query]);

  useEffect(() => {
    if (!game || !game?.id) return;
    window.localStorage.setItem(`${game.id}.currentRow`, currentRow.toString());
    window.localStorage.setItem(`${game.id}.guesses`, guesses.join(','));
    window.localStorage.setItem(`${game.id}.feedback`, feedback.join(','));
    window.localStorage.setItem(`${game.id}.feedbackKeys`, JSON.stringify(feedbackKeys));
    window.localStorage.setItem(`${game.id}.done`, done.toString());
  }, [currentRow, guesses, feedback]);

  const checkGuess = async () => {
    if (done) return;
    if (current.length !== game.word.length) return alert('You must fill all characters.');
    if (!game.localeWords.includes(current)) return alert('That is not a word.');

    const guessChars = current.split('');
    let newFeedback: string[] = [];
    let newFeedbackKeys: any = {};
    guessChars.forEach((char, idx) => {
      if (char === game.word.split('')[idx]) {
        newFeedback.push('bg-green-200');
        newFeedbackKeys[char] = 'bg-green-200';
      } else if (game.word.includes(char)) {
        newFeedback.push('bg-yellow-200');
        newFeedbackKeys[char] = 'bg-yellow-200';
      } else {
        newFeedback.push('bg-gray-200');
        newFeedbackKeys[char] = 'bg-gray-200';
      }
    });

    setFeedback([...feedback, ...newFeedback]);
    setFeedbackKeys({ ...feedbackKeys, ...newFeedbackKeys });
    setGuesses([...guesses, current]);
    setCurrent('');
    setCurrentRow(currentRow + 1);

    if (current === game.word) {
      setShowingWinnerModal(true);
      setDone(true);

      const day = Number(window.localStorage.getItem(`${game.id}.day`));
      await setDoc(doc(database, 'completions', `${user.uid}-${game.id}-${day.toString()}`), {
        day,
        user: user.uid,
        game: game.id,
        row: currentRow + 1
      });
    } else if (currentRow + 1 === 6) {
      alert('You ran out of guesses.. :(');
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen">
        <div className="m-auto">
          <BarLoader color="#475569" />
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar user={user} />
      <WinnerModal open={showingWinnerModal} setOpen={setShowingWinnerModal} />
      <div className="flex h-screen -mt-8">
        <div className="m-auto">
          {/* Game */}
          <div className="flex flex-col md:flex-row gap-16">
            <div>
              <h1 className="text-center w-full text-2xl font-extrabold font-serif mb-4">{game.name}</h1>

              <div className="flex gap-6">
                <div className="h-24 w-24 bg-gray-50 rounded-lg mb-4 p-6 text-center items-center">
                  <span className="font-mono text-gray-400">Plays</span>
                  <h2 className="font-bold text-amber-500">{tries[0] + tries[1] + tries[2] + tries[3] + tries[4] + tries[5]}</h2>
                </div>

                <div className="h-24 w-24 bg-gray-50 rounded-lg mb-4 p-6 text-center items-center">
                  <span className="font-mono text-gray-400">Avg</span>
                  <h2 className="font-bold text-amber-500">{tries[0] + (2 * tries[1]) + (3 * tries[2]) + (4 * tries[3]) + (5 * tries[4]) + (6 * tries[5]) / 6}</h2>
                </div>

                <div className="h-24 w-24 bg-gray-50 rounded-lg mb-4 p-6 text-center items-center">
                  <span className="font-mono text-gray-400">Word</span>
                  <h2 className="font-bold text-amber-500">{(Number(window.localStorage.getItem(`${game.id}.day`)) % game.words.length) + 1} / {game.words.length}</h2>
                </div>
              </div>

              <div className="relative left-1/2 -translate-x-1/2 w-full mt-2">
                {[1, 2, 3].map((row) => {
                  return (
                    <>
                      <div className={`${row === 2 ? 'ml-8' : ''} ${row === 3 ? 'ml-16' : ''} flex gap-2 mb-2 text-center items-center`}>
                        {(row === 1 ? ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '←'] : (row === 2 ? ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'] : ['Z', 'X', 'C', 'V', 'B', 'N', 'M'])).map((key) => {
                          return (
                            <button className={`w-6 h-8 ${feedbackKeys[key.toLowerCase()] || 'bg-gray-100'} appearance-none focus-within:appearance-none rounded-md`} onClick={() => {
                              if(done) return;
                              if (key === '←') {
                                setCurrent(current.slice(0, -1));
                              } else {
                                setCurrent(current + key.toLowerCase())
                              }
                            }}>
                              <span className={`w-6 h-6 font-mono text-gray-500`}>{key}</span>
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-6 align-middle align-center justify-center items-center">
              <div>
                {[0, 1, 2, 3, 4, 5].map((row) => {
                  return (
                    <>
                      <div className="bg-yellow-50 bg-green-50 bg-gray-50" />
                      <div className="flex gap-3 mb-3">
                        {Array.from(new Array(game.word.length)).map((char: any, col) => {
                          return (
                            <>
                              <div className={`w-12 h-12 rounded border-2 border-gray-300 ${feedback[(row * game.word.length) + col] || 'bg-gray-50'} table`}>
                                <h1 className="text-center align-middle table-cell font-bold text-xl font-mono">{currentRow === row ? current.split('')?.at(col) : guesses?.at(row)?.at(col)}</h1>
                              </div>
                            </>
                          )
                        })}
                      </div>
                    </>
                  )
                })}

                <div className="w-full flex flex-col">
                  <button
                    type="button"
                    onClick={checkGuess}
                    className="text-center w-full inline-flex items-center rounded-md border border-transparent bg-amber-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  >
                    <span className="text-center w-full">
                      Check
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <h1 className="invisible text-center text-2xl font-extrabold font-serif mb-4 w-0 -mt-[5.6rem]">{game.name}</h1>
                {[0, 1, 2, 3, 4, 5].map((row) => {
                  return (
                    <>
                      <div className="block h-12 table mb-3">
                        <span className="font-mono align-middle table-cell text-gray-400">{tries[row]}</span>
                      </div>
                    </>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Game;