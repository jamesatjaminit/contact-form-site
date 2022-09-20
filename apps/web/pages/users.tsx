import type { GetServerSideProps, NextPage } from "next";
import { Session, unstable_getServerSession } from "next-auth";
import Link from "next/link";
import MainContainer from "../components/MainContainer";
import { fetcher } from "../lib/utils";
import { authOptions } from "./api/auth/[...nextauth]";
import useSWR from "swr";
import type { User, WithStringId } from "types/dist/database";
import dayjs from 'dayjs';
interface Props {
  session: Session;
}

const UsersPage: NextPage<Props> = ({ session }) => {
  const { data: users, error } = useSWR<WithStringId<User>[]>('/api/users', fetcher);
  return (
    <MainContainer>
      <h1 className="text-3xl">Users</h1>
      <div className="flex flex-row justify-end">
        <Link href="/user/invite">
          <a className="btn btn-primary">Invite</a>
        </Link>
      </div>
      {users && (
        <div className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <Link href={"/user/" + user._id} key={user._id}>
                <a>
                  <div className="card bg-base-200 shadow-xl max-w-sm">
                    <div className="card-body">
                      <h2 className="card-title">{user.email}</h2>
                      <p>Email: {user.email}</p>
                      <p>Account Created: {dayjs(user.emailVerified).format("DD/MM/YYYY hh:mm")}</p>
                      <p>Administrator: {user.admin ? "Yes" : "No"}</p>
                    </div>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        </div>
      )}
    </MainContainer>
  );
};

export default UsersPage;
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  if (!session) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }
  if (!session.user.admin) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  return {
    props: {
      session,
    },
  };
};
