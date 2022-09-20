import type { GetServerSideProps, NextPage } from "next";
import { Session, unstable_getServerSession } from "next-auth";
import MainContainer from "../../../components/MainContainer";
import { authOptions } from "../../api/auth/[...nextauth]";
import { useRouter } from "next/router";
import { User, WithStringId } from "types/dist/database";
import { getUser } from "../../api/user/[userId]";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface Props {
  session: Session;
  user: WithStringId<User>;
}
interface Inputs {
  name: string;
  email: string;
  image: string;

}
const schema = z.object({
  name: z.string().min(1, { message: "Please enter a name" }).trim(),
  email: z.string().email({ message: "Please enter a valid email" }),
  image: z.string().url({ message: "Please enter a valid image URL" })
});
const EditUserPage: NextPage<Props> = ({ session, user }) => {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name,
      email: user.email,
      image: user.image
    }
  });
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const response = await fetch('/api/user/' + user._id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (response.status == 200) {
      router.push('/user/' + user._id);
    } else {
      alert("Failed to update user");
    }
  };
  return (
    <MainContainer>
      <h1 className="text-3xl">Edit User: {user.name}</h1>
      <form className="mt-5 max-w-fit" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-2">
          <div className="form-control">
            <label className="input-group">
              <span>Name</span>
              <input type="text" placeholder="Name" className="input input-bordered" {...register("name")} />
            </label>
          </div>
          <div className="form-control">
            <label className="input-group">
              <span>Email</span>
              <input type="email" placeholder="Email" className="input input-bordered" {...register("email")} />
            </label>
          </div>
          <div className="form-control">
            <label className="input-group">
              <span>Profile Image</span>
              <input type="text" placeholder="/image.jpg" className="input input-bordered" {...register("image")} />
            </label>
          </div>
        </div>
        <button className="btn btn-primary mt-2" type="submit">Save</button>
      </form>
    </MainContainer>
  );
};

export default EditUserPage;
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
  const user = await getUser(context.query.userId as string);
  if (!user || (user && (!session.user.admin && user._id !== session.user.id))) {
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
      user,
    },
  };
};
