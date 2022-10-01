import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, database, provider } from '../lib/firebase';

const signIn = (callback?: any) => {
  signInWithPopup(auth, provider).then(async (result) => {
    console.log('Signed in!', result);

    // await setDoc(doc(database, 'users', result.user.uid), {
    //   id: result.user.uid,
    //   username: result.user.displayName,
    //   avatar: result.user.photoURL,
    // });

    if(callback) callback();
  }).catch((err) => {});
}

export { signIn };