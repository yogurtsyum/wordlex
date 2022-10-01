import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { HiLogin, HiOutlineUserCircle } from 'react-icons/hi';
import { signIn } from '../utils/auth';
import Link from 'next/link';

const Navbar = ({ user }: { user: any }) => {
  const accountButton = () => {
    if (user) {
      signOut(auth);
    } else {
      signIn();
    }
  }

  return (
    <div className="h-12 bg-gray-50 border-b-2 border-gray-300 flex justify-between">
      <div className="h-full table">
        <Link href="/">
          <a className="table h-full">
            <h1 className="text-xl translate-x-3 font-bold font-serif align-middle table-cell">twordle</h1>
          </a>
        </Link>
      </div>
      <div className="h-full table">
        {user?.photoURL ?
          <>
            <a href="#"><img src={user.photoURL || `https://avatars.dicebear.com/api/identicon/${user.username}.png`} className="w-8 h-8 align-middle mt-2 rounded-full -translate-x-3" onClick={accountButton}></img></a>
          </> : (
            user ?
              <>
                <a href="#" className="text-xl align-middle table-cell -translate-x-3" onClick={accountButton}><HiOutlineUserCircle /></a>
              </> : <>
                <a href="#" className="text-xl align-middle table-cell -translate-x-3" onClick={accountButton}><HiLogin /></a>
              </>
          )}
      </div>
    </div>
  )
}

export default Navbar;