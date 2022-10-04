import type { GetServerSideProps, NextPage } from "next";
import { Session, unstable_getServerSession } from "next-auth";
import type { WithStringId, Form } from "types/dist/database";
import MainContainer from "../../../components/MainContainer";
import { authOptions } from "../../api/auth/[...nextauth]";
import { useRouter } from "next/router";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getForm } from "../../api/form/[id]";
import { useState } from "react";
import { NextSeo } from "next-seo";
interface Props {
  session: Session;
  form: WithStringId<Form>;
}
interface Inputs {
  name: string;
  updateToken: string | null;
  submissionsPaused: boolean;
  // permissions: {
  //   owners: string[];
  //   editors: string[];
  //   viewers: string[];
  // };
}
const ownerSchema = z.object({
  name: z.string().min(1, { message: "Please enter a form name" }).trim(),
  updateToken: z
    .string()
    .min(10, { message: "Update token must be at least 10 characters" }),
  submissionsPaused: z.boolean(),
  // permissions: z.object({
  //   owners: z.array(z.string().min(12, { message: 'Invalid user ID' }).max(12, { message: 'Invalid user ID' })),
  //   editors: z.array(z.string().min(12, { message: 'Invalid user ID' }).max(12, { message: 'Invalid user ID' })),
  //   viewers: z.array(z.string().min(12, { message: 'Invalid user ID' }).max(12, { message: 'Invalid user ID' })),
  // })
});
const editorSchema = z.object({
  submissionsPaused: z.boolean(),
});

const EditFormPage: NextPage<Props> = ({ session, form }) => {
  const router = useRouter();
  const [confirmDeleteForm, setConfirmDeleteForm] = useState(false);
  const sessionIsFormOwner = form.permissions.owners.includes(session.user.id);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: sessionIsFormOwner
      ? zodResolver(ownerSchema)
      : zodResolver(editorSchema),
    defaultValues: {
      name: form.name,
      updateToken: form.updateToken,
      submissionsPaused: form.submissionsPaused,
      // permissions: {
      //   owners: form.permissions.owners,
      //   editors: form.permissions.editors,
      //   viewers: form.permissions.viewers
      // }
    },
  });
  // const { fields: ownerFields, append: appendOwnerField, remove: removeOwnerField, } = useFieldArray<Inputs>({
  //   control, // control props comes from useForm (optional: if you are using FormContext)
  //   name: "permissions.owners", // unique name for your Field Array
  // });
  const submitHandler: SubmitHandler<Inputs> = async (data) => {
    const response = await fetch("/api/form/" + form._id, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status == 200) {
      const responseJson = await response.json();
      router.push("/form/" + router.query.formId);
    } else {
      alert("Failed to update form!");
    }
  };
  const deleteForm = async () => {
    if (!confirmDeleteForm) {
      setConfirmDeleteForm(true);
      return;
    }
    const response = await fetch("/api/form/" + form._id, {
      method: "DELETE",
    });
    if (response.status == 200) {
      router.push("/forms");
    } else {
      alert("Failed to delete form.");
    }
  };
  return (
    <MainContainer>
      <NextSeo title="Edit Form" />
      <h1 className="text-3xl">Edit Form: {form ? form.name : "Loading..."}</h1>
      <form
        className="flex flex-col gap-3 max-w-fit mt-3"
        onSubmit={handleSubmit(submitHandler)}
      >
        <div className="form-control">
          <label className="input-group">
            <span>Name</span>
            <input
              type="text"
              className="input input-bordered"
              placeholder="My Special Form"
              {...register("name", { disabled: !sessionIsFormOwner })}
            />
          </label>
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name?.message}</p>
          )}
        </div>
        {sessionIsFormOwner && (
          <>
            <div className="form-control">
              <label className="input-group">
                <span>Update Token</span>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="Update Token"
                  {...register("updateToken", {
                    disabled: !sessionIsFormOwner,
                  })}
                />
              </label>
            </div>
            {errors.updateToken && (
              <p className="text-sm text-red-500">
                {errors.updateToken?.message}
              </p>
            )}
          </>
        )}
        <div className="form-control">
          <label className="input-group">
            <span>Submissions Paused</span>
            <input
              type="checkbox"
              className="input input-bordered checkbox"
              placeholder="Submissions Paused"
              {...register("submissionsPaused")}
            />
          </label>
        </div>
        {/* <h2 className="text-2xl">Permissions</h2>
        <div className="flex flex-col gap-1">
          <h3 className="text-xl">Owners</h3>
          {ownerFields.map((item) => (
            <div className="form-control" key={item.id}>
              <label className="input-group">
                <span>Owner ID</span>
                <input type="text" className="input input-bordered" placeholder="Owner ID" {...register(`permissions.owners.${item.id}` as const, { required: true, minLength: 8 })} />
                <button type="button" onClick={() => removeOwnerField(item.id)} className="btn btn-error">Remove</button>
              </label>
            </div>
          ))}
          <button type="button" onClick={() => appendOwnerField({})} className="btn btn-secondary btn-md w-24">Add Owner</button>
        </div> */}
        {sessionIsFormOwner && (
          <p>
            Responses URL: https://{process.env.NEXT_PUBLIC_HOST}/api/form/
            {form._id}
          </p>
        )}
        <div className="flex flex-row gap-2 justify-center">
          {sessionIsFormOwner && (
            <button
              className="btn btn-error"
              type="button"
              onClick={deleteForm}
            >
              {confirmDeleteForm ? "Confirm Delete" : "Delete Form"}
            </button>
          )}

          <button className="btn btn-primary btn-md" type="submit">
            Save
          </button>
        </div>
      </form>
    </MainContainer>
  );
};

export default EditFormPage;
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
  const form = await getForm(context.params?.formId as string, session.user.id);
  if (
    !form ||
    (!form.permissions.owners.includes(session.user.id) &&
      !form.permissions.editors.includes(session.user.id))
  ) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      session,
      form,
    },
  };
};
