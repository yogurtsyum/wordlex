import { useState, useEffect } from 'react';
import { ArrowRightIcon, LogoutIcon, MoonIcon } from '@heroicons/react/outline';
import { ClipLoader } from 'react-spinners';
import { Button, Heading, HStack, Input, Spinner, Text } from '@chakra-ui/react';
import { addDoc, collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Homepage() {
  const [isLoading, setLoading] = useState(true);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const router = useRouter();

  return (
    <>
      <div className="w-full h-full bg-gradient-to-r from-yellow-500 to-orange-400 overflow-hidden">
        <div className="translate-y-4 w-full h-screen overflow-hidden">
          <div className="w-full h-full bg-gray-200 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 text-center -translate-x-1/2 -translate-y-1/2">
              <Heading fontWeight={'extrabold'} mb={1}>Welcome to Wordlex</Heading>
              <Text>A website for making custom Wordles.</Text>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}