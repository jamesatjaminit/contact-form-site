import type { GetServerSideProps, NextPage } from "next";
import { Session, getServerSession } from "next-auth";
import Link from "next/link";
import MainContainer from "../components/MainContainer";
import { fetcher } from "../lib/utils";
import { authOptions } from "./api/auth/[...nextauth]";
import useSWR from "swr";
import type { User, WithStringId } from "types/dist/database";
import dayjs from "dayjs";
import { NextSeo } from "next-seo";
import { AUTHENTICATION_METHOD } from "../lib/consts";
interface Props {
  session: Session;
}

const UsersPage: NextPage<Props> = ({ session }) => {
  const { data: users, error } = useSWR<WithStringId<User>[]>(
    "/api/users",
    fetcher
  );
  return (
    <MainContainer>
      <NextSeo title="Users" />
      <h1 className="text-3xl">Users</h1>
      <div className="flex flex-row justify-end">
        {AUTHENTICATION_METHOD == "EMAIL" && (
          <Link href="/user/invite" className="btn btn-primary">
            Invite
          </Link>
        )}
      </div>
      {users && (
        <div className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <Link href={"/user/" + user._id} key={user._id}>
                <div className="card bg-base-200 shadow-xl max-w-sm">
                  <div className="card-body">
                    <h2 className="card-title">{user.email}</h2>
                    <p>Email: {user.email}</p>
                    <p>
                      Account Created:{" "}
                      {dayjs(user.emailVerified).format("DD/MM/YYYY hh:mm")}
                    </p>
                    <p>Administrator: {user.admin ? "Yes" : "No"}</p>
                  </div>
                </div>
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
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session?.user.admin) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      session,
    },
  };
};
