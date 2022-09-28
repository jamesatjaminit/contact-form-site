import type { GetServerSideProps, NextPage } from "next";
import { Session, unstable_getServerSession } from "next-auth";
import Link from "next/link";
import useSWR from "swr";
import type { Form, WithStringId } from "types/dist/database";
import MainContainer from "../components/MainContainer";
import { fetcher } from "../lib/utils";
import { authOptions } from "./api/auth/[...nextauth]";
import { getStats, StatsResponse } from "./api/stats";

interface Props {
  session: Session | null;
  stats: StatsResponse | undefined;
}
const Home: NextPage<Props> = ({ session, stats }) => {
  const { data: forms, error: getFormsError } = useSWR<WithStringId<Form>[]>(
    "/api/user/" + (session?.user.id ?? "") + "/forms",
    fetcher
  );
  if (!session) {
    return (
      <MainContainer>
        <h1 className="text-3xl">Contact Form Site</h1>
        <p className="mt-5">Please login to view this site.</p>
      </MainContainer>
    );
  }
  return (
    <MainContainer>
      <h1 className="text-3xl">Contact Form Site</h1>
      <div className="grid grid-flow-col auto-cols-auto">
        <div className="stats shadow mt-5 max-w-fit">
          <div className="stat">
            <div className="stat-title text-center">
              Total Responses Handled
            </div>
            <div className="stat-value text-center">
              {stats?.totalResponses}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title text-center">Total Forms</div>
            <div className="stat-value text-center">{stats?.totalForms}</div>
          </div>
          <div className="stat">
            <div className="stat-title text-center">Total Users</div>
            <div className="stat-value text-center">{stats?.totalUsers}</div>
          </div>
        </div>
        <div>
          <h2 className="text-2xl mt-5">Forms</h2>
          <ul className="list-disc list-inside">
            {forms &&
              forms.map((form) => (
                <li key={form._id}>
                  <Link href={"/form/" + form._id}>
                    <a className="text-accent hover:text-accent-focus">
                      {form.name}
                    </a>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </MainContainer>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  if (!session) {
    return {
      props: {
        session,
      },
    };
  }
  return {
    props: {
      session,
      stats: await getStats(),
    },
  };
};
