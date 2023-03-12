import type { GetServerSideProps, NextPage } from "next";
import { Session, getServerSession } from "next-auth";
import MainContainer from "../../components/MainContainer";
import { authOptions } from "../api/auth/[...nextauth]";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import { AUTHENTICATION_METHOD } from "../../lib/consts";

interface Props {
  session: Session;
}

const InviteUserPage: NextPage<Props> = ({ session }) => {
  const router = useRouter();
  const submitForm = async (e: any) => {
    e.preventDefault();
    const email = e.target.email.value;
    const admin = e.target.admin.checked;
    const response = await fetch("/api/user/invite", {
      method: "POST",
      body: JSON.stringify({
        email,
        admin,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status == 200) {
      const responseJson = await response.json();
      router.push("/user/" + responseJson._id);
    } else {
      alert("Failed to invite user!");
    }
  };
  if (AUTHENTICATION_METHOD == "AUTHENTIK") {
    return (
      <MainContainer>
        <NextSeo title="Invite User" />
        <h1 className="text-3xl">Invite User</h1>
        <p>Invite user is disabled since SSO is enabled</p>
      </MainContainer>
    );
  }
  return (
    <MainContainer>
      <NextSeo title="Invite User" />
      <h1 className="text-3xl">Invite User</h1>
      <form className="max-w-fit" onSubmit={submitForm}>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <label className="input-group">
            <span>Email</span>
            <input
              type="text"
              placeholder="john@example.com"
              className="input input-bordered"
              name="email"
              required
            />
          </label>
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Admin</span>
          </label>
          <label className="input-group">
            <span>Admin</span>
            <input
              type="checkbox"
              className="input input-bordered checkbox"
              name="admin"
            />
          </label>
        </div>
        <div className="flex flex-col justify-center mt-3">
          <button type="submit" className="btn btn-primary btn-md">
            Invite
          </button>
        </div>
      </form>
    </MainContainer>
  );
};

export default InviteUserPage;
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
