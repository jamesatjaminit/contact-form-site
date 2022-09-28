import type { GetServerSideProps, NextPage } from "next";
import { Session, unstable_getServerSession } from "next-auth";
import MainContainer from "../components/MainContainer";
import { fetcher } from "../lib/utils";
import { authOptions } from "./api/auth/[...nextauth]";
import useSWR from "swr";
import { Form, WithStringId } from "types/dist/database";
import Link from "next/link";
interface Props {
  session: Session;
}

const FormsPage: NextPage<Props> = ({ session }) => {
  const { data, error } = useSWR<WithStringId<Form>[]>(
    "/api/user/" + session.user.id + "/forms",
    fetcher
  );
  return (
    <MainContainer>
      <h1 className="text-3xl">Forms</h1>
      <div className="flex flex-row justify-end">
        <Link href="/form/new">
          <a className="btn btn-primary">New Form</a>
        </Link>
      </div>
      {(!!data && data.length) > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {data &&
            data.map((form) => (
              <Link href={"/form/" + form._id} key={form._id}>
                <a>
                  <div className="card bg-base-200 shadow-xl max-w-sm">
                    <div className="card-body">
                      <h2 className="card-title">{form.name}</h2>
                    </div>
                  </div>
                </a>
              </Link>
            ))}
        </div>
      )}
      {error && (
        <div className="alert alert-error shadow-lg mt-5">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Error: Failed to load forms!</span>
          </div>
        </div>
      )}
      {!data && <div>Loading Forms...</div>}
      {!data?.length && (
        <div className="alert alert-info shadow-lg mt-5">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current flex-shrink-0 w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>You have no forms. How about making one!</span>
          </div>
        </div>
      )}
    </MainContainer>
  );
};

export default FormsPage;
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  if (!session) {
    return {
      redirect: {
        destination:
          "/api/auth/signin?callbackUrl=" +
          encodeURIComponent(context.resolvedUrl),
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
