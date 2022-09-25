import { useState, useEffect, Fragment, useRef, MutableRefObject } from 'react';
import { ArrowRightIcon, CheckIcon, DotsVerticalIcon, LockClosedIcon, LogoutIcon, MoonIcon } from '@heroicons/react/outline';
import { ClipLoader } from 'react-spinners';
import axios from 'axios';
import { Button, FormControl, Heading, HStack, PinInput, PinInputField, Spinner, Stack, Text, useToast } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { Menu, Transition } from '@headlessui/react';
import { doc, getDoc } from 'firebase/firestore';

const games = {
  lotf: {
    id: 'lotf',
    name: 'Lordle',
    words: ['shore', 'conch', 'beast', 'beach'],
  },
  lotf2: {
    id: 'lotf2',
    name: 'Lordle (v2)',
    words: ['beach'],
  },
  latin: {
    id: 'latin',
    name: 'Latin Wordle',
    words: ['canis', 'cibus', 'filia'],
  }
}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ');
}

export default function Homepage() {
  const [isLoading, setLoading] = useState(true);
  const [user, setUser] = useState<any>();
  const [game, setGame] = useState<any>();
  const [step, setStep] = useState(1);
  const [currentGuess, setCurrentGuess] = useState<any>();
  const [userData, setUserData] = useState<any>();
  const [guesses, setGuesses] = useState<any>([]);
  const [word, setWord] = useState<any>();
  const [words, setWords] = useState<any>([]);
  const [feedback, setFeedback] = useState<any>([]);

  const ref1 = useRef() as MutableRefObject<HTMLInputElement>;
  const ref2 = useRef() as MutableRefObject<HTMLInputElement>;
  const ref3 = useRef() as MutableRefObject<HTMLInputElement>;
  const ref4 = useRef() as MutableRefObject<HTMLInputElement>;
  const ref5 = useRef() as MutableRefObject<HTMLInputElement>;
  const ref6 = useRef() as MutableRefObject<HTMLInputElement>;

  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if(!router.query.id) return;
    (async () => {
      const rawWords = (await axios.get('https://raw.githubusercontent.com/lorenbrichter/Words/master/Words/en.txt')).data;
      setWords(rawWords.split('\n'));
      // @ts-ignore
      const game = games[router.query.id as string];
      if (!game) {
        alert('Sorry, this game link is invalid.');
        router.push('/');
      } else {
        const daysSinceEpoch = Math.floor((new Date().getTime()) / 8.64e7); // @ts-ignore
        setWord(game.words[daysSinceEpoch % game.words.length]);
        setGame(game);
      }
    })();
  }, [router.query]);

  useEffect(() => {
    if(!game) return;
    const daysSinceEpoch = Math.floor((new Date().getTime()) / 8.64e7); // @ts-ignore
    if(window.localStorage.getItem(`${game.id}.lastPlayed`) !== daysSinceEpoch.toString()) {
      window.localStorage.clear();
    } else {
      setCurrentGuess(window.localStorage.getItem(`${game.id}.currentGuess`));
      setStep(Number(window.localStorage.getItem(`${game.id}.step`)));
      setGuesses(window.localStorage.getItem(`${game.id}.guesses`)?.split(','));
      setFeedback(window.localStorage.getItem(`${game.id}.feedback`)?.split(','));
    }
  }, [game]);

  useEffect(() => {
    if(!game) return;
    const daysSinceEpoch = Math.floor((new Date() as any) / 8.64e7);
    window.localStorage.setItem(`${game.id}.currentGuess`, currentGuess);
    window.localStorage.setItem(`${game.id}.guesses`, guesses.join(','));
    window.localStorage.setItem(`${game.id}.feedback`, feedback.join(','));
    window.localStorage.setItem(`${game.id}.step`, step.toString());
    window.localStorage.setItem(`${game.id}.lastPlayed`, daysSinceEpoch.toString());
  }, [currentGuess, guesses, feedback, step]);

  useEffect(() => {
    if (!words || !game) return;
    setLoading(false);
  }, [words, game]);

  useEffect(() => {
    if(!words) return;
    document.onkeyup = (e) => {
      if(e.key === 'Enter') {
        checkGuess();
      }
    }
  });

  const onGuessChange = (word: string) => {
    setCurrentGuess(word.toLowerCase());
  }

  const checkGuess = () => {
    if(currentGuess.length !== 5 ?? true) {
      toast({
        title: 'Cannot check word...',
        description: 'Does not contain 5 letters.',
        position: 'bottom-right',
        status: 'error',
        duration: 1000,
        isClosable: true,
      });
      return;
    }

    if(!words.includes(currentGuess)) {
      toast({
        title: 'Cannot check word...',
        description: 'Is not a valid English word.',
        position: 'bottom-right',
        status: 'error',
        duration: 1000,
        isClosable: true,
      });
      return;
    }

    if(step === 6 && word !== currentGuess) toast({
      title: 'You lost! :(',
      description: `Word: ${word}`,
      position: 'bottom-right',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });

    if(word === currentGuess) {
      toast({
        title: 'You won! :)',
        description: 'Great job!',
        position: 'bottom-right',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      for(let i = 0; i < 5; i++) {
        feedback.push('green.200');
      }
    } else {
      currentGuess.split('').forEach((char: string, idx: number) => {
        if(word.split('')[idx] === char) {
          feedback.push('green.200');
        } else if(word.split('').includes(char)) {
          feedback.push('yellow.200');
        } else {
          feedback.push('blackAlpha.400');
        }
      });
    }
    
    guesses.push(currentGuess);
    setCurrentGuess('');
    setStep(word === currentGuess ? 7 : step + 1);

    if(word !== currentGuess) {
      // @ts-ignore
      if(step + 1 === 2) ref2.current.focus();
      // @ts-ignore
      if(step + 1 === 3) ref3.current.focus();
      // @ts-ignore
      if(step + 1 === 4) ref4.current.focus();
      // @ts-ignore
      if(step + 1 === 5) ref5.current.focus();
      // @ts-ignore
      if(step + 1 === 6) ref6.current.focus();
    }
  }

  if (isLoading) {
    return (
      <>
        <div className="w-full h-full bg-gradient-to-r from-yellow-500 to-orange-400 overflow-hidden">
          <div className="translate-y-4 w-full h-screen overflow-hidden">
            <div className="w-full h-full bg-gray-200 overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Spinner />
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="w-full h-full bg-gradient-to-r from-yellow-500 to-orange-400 overflow-hidden">
        <div className="translate-y-4 w-full h-screen overflow-hidden">
          <div className="w-full h-full bg-gray-200 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 text-center -translate-x-1/2 -translate-y-1/2">
              <Heading textAlign="center" mb={2}>{game.name}</Heading>
              <div>
                <div className="text-center content-center">
                  <Stack>
                    <HStack>
                      <PinInput defaultValue={guesses[0]} isDisabled={step !== 1} onChange={onGuessChange} focusBorderColor="yellow.500" autoFocus placeholder="" size="lg" colorScheme="gray" type="alphanumeric">
                        <PinInputField ref={ref1} bgColor={feedback[0] || 'gray.50'} borderColor="gray.300" />
                        <PinInputField bgColor={feedback[1] || 'gray.50'} borderColor="gray.300" />
                        <PinInputField bgColor={feedback[2] || 'gray.50'} borderColor="gray.300" />
                        <PinInputField bgColor={feedback[3] || 'gray.50'} borderColor="gray.300" />
                        <PinInputField bgColor={feedback[4] || 'gray.50'} borderColor="gray.300" />
                      </PinInput>
                    </HStack>
                    <HStack>
                      <PinInput defaultValue={guesses[1]} isDisabled={step !== 2} onChange={onGuessChange} focusBorderColor="yellow.500" autoFocus placeholder="" size="lg" colorScheme="gray" type="alphanumeric">
                        <PinInputField ref={ref2} bgColor={feedback[5] || 'gray.50'} borderColor="gray.300" />
                        <PinInputField bgColor={feedback[6] || 'gray.50'} borderColor="gray.300" />
                        <PinInputField bgColor={feedback[7] || 'gray.50'} borderColor="gray.300" />
                        <PinInputField bgColor={feedback[8] || 'gray.50'} borderColor="gray.300" />
                        <PinInputField bgColor={feedback[9] || 'gray.50'} borderColor="gray.300" />
                      </PinInput>
                    </HStack>
                    <HStack>
                      <PinInput defaultValue={guesses[2]} isDisabled={step !== 3} onChange={onGuessChange} focusBorderColor="yellow.500" autoFocus placeholder="" size="lg" colorScheme="gray" type="alphanumeric">
                        <PinInputField ref={ref3} bgColor={feedback[10] || 'gray.50'} borderColor="gray.300" />
                        <PinInputField bgColor={feedback[11] || 'gray.50'} borderColor="gray.300" />
                        <PinInputField bgColor={feedback[12] || 'gray.50'} borderColor="gray.300" />
                        <PinInputField bgColor={feedback[13] || 'gray.50'} borderColor="gray.300" />
                        <PinInputField bgColor={feedback[14] || 'gray.50'} borderColor="gray.300" />
                      </PinInput>
                    </HStack>
                    <HStack>
                      <PinInput defaultValue={guesses[3]} isDisabled={step !== 4} onChange={onGuessChange} focusBorderColor="yellow.500" autoFocus placeholder="" size="lg" colorScheme="gray" type="alphanumeric">
                        <PinInputField ref={ref4} bgColor={feedback[15] || 'gray.50'} borderColor="gray.300" />
                        <PinInputField bgColor={feedback[16] || 'gray.50'} borderColor="gray.300" />
                        <PinInputField bgColor={feedback[17] || 'gray.50'} borderColor="gray.300" />
                        <PinInputField bgColor={feedback[18] || 'gray.50'} borderColor="gray.300" />
                        <PinInputField bgColor={feedback[19] || 'gray.50'} borderColor="gray.300" />
                      </PinInput>
                    </HStack>
                    <HStack>
                      <PinInput defaultValue={guesses[4]} isDisabled={step !== 5} onChange={onGuessChange} focusBorderColor="yellow.500" autoFocus placeholder="" size="lg" colorScheme="gray" type="alphanumeric">
                        <PinInputField ref={ref5} bgColor={feedback[20] || 'gray.50'} borderColor="gray.300" />
                        <PinInputField bgColor={feedback[21] || 'gray.50'} borderColor="gray.300" />
                        <PinInputField bgColor={feedback[22] || 'gray.50'} borderColor="gray.300" />
                        <PinInputField bgColor={feedback[23] || 'gray.50'} borderColor="gray.300" />
                        <PinInputField bgColor={feedback[24] || 'gray.50'} borderColor="gray.300" />
                      </PinInput>
                    </HStack>
                    <HStack>
                      <PinInput defaultValue={guesses[5]} isDisabled={step !== 6} onChange={onGuessChange} focusBorderColor="yellow.500" autoFocus placeholder="" size="lg" colorScheme="gray" type="alphanumeric">
                        <PinInputField ref={ref6} bgColor={feedback[25] || 'gray.50'} borderColor="gray.300" />
                        <PinInputField bgColor={feedback[26] || 'gray.50'} borderColor="gray.300" />
                        <PinInputField bgColor={feedback[27] || 'gray.50'} borderColor="gray.300" />
                        <PinInputField bgColor={feedback[28] || 'gray.50'} borderColor="gray.300" />
                        <PinInputField bgColor={feedback[29] || 'gray.50'} borderColor="gray.300" />
                      </PinInput>
                    </HStack>
                    <Button isDisabled={step > 6} onClick={checkGuess} leftIcon={<CheckIcon />} colorScheme={!(step > 6) ? 'green' : 'gray'}>Check</Button>
                  </Stack>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
