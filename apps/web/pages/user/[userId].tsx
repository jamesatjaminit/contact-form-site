import type { GetServerSideProps, NextPage } from "next";
import { Session, unstable_getServerSession } from "next-auth";
import MainContainer from "../../components/MainContainer";
import { authOptions } from "../api/auth/[...nextauth]";
import useSWR from "swr";
import { useRouter } from "next/router";
import { fetcher } from "../../lib/utils";
import type { User, WithStringId } from "types/dist/database";
import dayjs from "dayjs";
import { BsPencilFill } from 'react-icons/bs';
import Link from "next/link";
interface Props {
  session: Session;
}

const UserInfoPage: NextPage<Props> = ({ session }) => {
  const router = useRouter();
  const { data: user, error } = useSWR<WithStringId<User>>('/api/user/' + router.query.userId, fetcher);
  return (
    <MainContainer>
      <h1 className="text-3xl">User: {(!user && !error) && "Loading..."}{user && user.email}</h1>
      <div className="flex flex-row justify-end">
        <Link href={`/user/${router.query.userId}/edit`}>
          <a className="btn btn-primary"><BsPencilFill /></a>
        </Link>
      </div>
      {user && (
        <div>
          <p>Email: {user.email}</p>
          <p>ID: {user._id}</p>
          <p>Account Created: {dayjs(user.emailVerified).format("DD/MM/YYYY hh:mm")}</p>
          <p>Administrator: {user.admin ? "Yes" : "No"}</p>
        </div>
      )}
      {error && (
        <div className="alert alert-error shadow-lg mt-5">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Error: Failed to fetch user.</span>
          </div>
        </div>
      )}
    </MainContainer>
  );
};

export default UserInfoPage;
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
  return {
    props: {
      session,
    },
  };
};
