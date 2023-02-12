import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { AUTHENTICATION_METHOD } from "../lib/consts";

const NavBar: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  return (
    <div className="navbar bg-base-300">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost normal-case text-xl">
          Contact Admin
        </Link>
      </div>
      <div className="flex-none">
        {status == "authenticated" ? (
          <div className="flex flex-row gap-3">
            <Link href="/forms" className="btn btn-ghost normal-case">
              Forms
            </Link>
            {session.user.admin && (
              <Link href="/users" className="btn btn-ghost normal-case">
                Users
              </Link>
            )}
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <img
                    src={session.user.image ?? "/img/defaultImage.jpg"}
                    width={80}
                    height={80}
                    alt="Profile Image"
                  />
                </div>
              </label>

              <ul
                tabIndex={0}
                className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <Link href={"/user/" + session.user.id}>Profile</Link>
                </li>
                <li>
                  <Link href={"/user/" + session.user.id + "/edit"}>
                    Settings
                  </Link>
                </li>
                <li>
                  <button onClick={() => signOut()}>Logout</button>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={() =>
                signIn(AUTHENTICATION_METHOD.toLowerCase(), {
                  callbackUrl: router.pathname,
                })
              }
              className="btn btn-ghost normal-case"
            >
              Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavBar;
