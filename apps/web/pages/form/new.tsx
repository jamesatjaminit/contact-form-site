import type { GetServerSideProps, NextPage } from "next";
import { Session, unstable_getServerSession } from "next-auth";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import MainContainer from "../../components/MainContainer";
import { authOptions } from ".././api/auth/[...nextauth]";

interface Props {
  session: Session;
}

const NewFormPage: NextPage<Props> = ({ session }) => {
  const router = useRouter();
  const submitForm = async (e: any) => {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);
    const formName = form.get("name");
    const response = await fetch("/api/form/new", {
      method: "POST",
      body: JSON.stringify({
        name: formName,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status == 200) {
      const responseJson = await response.json();
      router.push("/form/" + responseJson._id);
    } else {
      alert("Failed to create form!");
    }
  };
  return (
    <MainContainer>
      <NextSeo title="New Form" />
      <h1 className="text-3xl">New Form</h1>
      <form className="max-w-fit" onSubmit={submitForm}>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Form Name</span>
          </label>
          <label className="input-group">
            <span>Name</span>
            <input
              type="text"
              placeholder="My Test Form"
              className="input input-bordered"
              name="name"
            />
          </label>
        </div>
        <div className="flex flex-col justify-center mt-3">
          <button type="submit" className="btn btn-primary btn-md">
            Create
          </button>
        </div>
      </form>
    </MainContainer>
  );
};

export default NewFormPage;
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
