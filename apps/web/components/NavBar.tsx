import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

const NavBar: NextPage = () => {
  const { data: session, status } = useSession();
  return (
    <div className="navbar bg-base-300">
      <div className="flex-1">
        <Link href="/">
          <a className="btn btn-ghost normal-case text-xl">Contact Admin</a>
        </Link>
      </div>
      <div className="flex-none">
        {
          status == 'authenticated' ? (
            <div className="flex flex-row gap-3">
              <Link href="/forms">
                <a className="btn btn-ghost normal-case">Forms</a>
              </Link>
              {session.user.admin && (
                <Link href="/users">
                  <a className="btn btn-ghost normal-case">Users</a>
                </Link>
              )}
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                  <div className="w-10 rounded-full">
                    <img src={session.user.image ?? '/defaultImage.jpg'} width={80} height={80} alt="Profile Image" />
                  </div>
                </label>

                <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
                  <li>
                    <Link href={"/user/" + session.user.id}>
                      <a>
                        Profile
                      </a>
                    </Link>
                  </li>
                  <li><Link href={"/user/" + session.user.id + "/edit"}>
                    <a>
                      Settings
                    </a>
                  </Link></li>
                  <li><button onClick={() => signOut()}>Logout</button></li>
                </ul>
              </div>
            </div>
          ) : (
            <div>
              <button onClick={() => signIn()} className="btn btn-ghost normal-case">Login</button>
            </div>
          )
        }
      </div>
    </div>
  );
};

export default NavBar;