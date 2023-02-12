import type { GetServerSideProps, NextPage } from "next";
import { Session, getServerSession } from "next-auth";
import MainContainer from "../../components/MainContainer";
import { authOptions } from "../api/auth/[...nextauth]";
import useSWR from "swr";
import { Form, Response, WithStringId } from "types/dist/database";
import { useRouter } from "next/router";
import { fetcher } from "../../lib/utils";
import { BsEnvelopeFill, BsPencilFill } from "react-icons/bs";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getForm } from "../api/form/[id]";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import { NextSeo } from "next-seo";
import z from "zod";

interface Props {
  session: Session;
  form: WithStringId<Form>;
}

const FormResponsesPage: NextPage<Props> = ({ session, form }) => {
  const router = useRouter();
  const {
    data: responses,
    error: responsesFetchError,
    mutate: mutateResponses,
    isValidating: responsesIsValidating,
  } = useSWR<WithStringId<Response>[]>(
    "/api/form/" + router.query.formId + "/responses",
    fetcher
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleteResponse = async (responseId: string) => {
    if (deletingId != responseId) {
      setDeletingId(responseId);
      return;
    }
    const response = await fetch("/api/response/" + responseId, {
      method: "DELETE",
    });
    if (response.status == 200) {
      mutateResponses();
    } else {
      alert("Failed to delete response");
    }
  };
  return (
    <MainContainer>
      <NextSeo title={form.name} />
      <h1 className="text-3xl">Form: {form ? form.name : "Loading..."}</h1>
      <div className="flex flex-row justify-end gap-2">
        <button
          className={`btn btn-primary ${
            responsesIsValidating ? "loading btn-disabled" : ""
          }`}
          onClick={() => mutateResponses()}
        >
          Refresh
        </button>
        {!!(
          form &&
          (form.permissions.owners.includes(session.user.id) ||
            form.permissions.editors.includes(session.user.id))
        ) && (
          <Link
            href={`/form/${router.query.formId}/edit`}
            className="btn btn-secondary"
          >
            <BsPencilFill />
          </Link>
        )}
      </div>
      <h2 className="text-2xl">Responses: </h2>
      {responsesFetchError && (
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
            <span>Error: Failed to fetch responses.</span>
          </div>
        </div>
      )}
      {!!(
        !responses?.length &&
        !responsesIsValidating &&
        !responsesFetchError
      ) && (
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
            <span>No responses to this form yet!</span>
          </div>
        </div>
      )}
      {!!responses?.length && (
        <div className="flex flex-col gap-3 mt-5">
          <AnimatePresence>
            {responses.map((response) => (
              <motion.div key={response._id} layout>
                <div className="card bg-base-200 shadow-xl">
                  <div className="card-body">
                    <div className="flex flex-row justify-between items-center">
                      <h3 className="card-title">Response: {response._id}</h3>
                      <div
                        className="tooltip"
                        data-tip={dayjs(response.createdAt).format(
                          "DD/MM/YYYY HH:mm:ss"
                        )}
                      >
                        <span className="badge badge-accent font-bold">
                          {dayjs(response.createdAt).fromNow()}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {Object.entries(response.data).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-bold">{key}: </span>
                          <span>
                            {String(value)} {"    "}
                            {z.string().email().safeParse(value).success && (
                              <a
                                href={`mailto:${value}`}
                                className="text-accent hover:text-accent-focus"
                              >
                                Email
                              </a>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                    {(form?.permissions.owners.includes(session.user.id) ||
                      form?.permissions.editors.includes(session.user.id)) && (
                      <div className="card-actions mt-3">
                        <button
                          className="btn btn-error"
                          onClick={() => deleteResponse(response._id)}
                        >
                          {deletingId == response._id
                            ? "Confirm Delete"
                            : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </MainContainer>
  );
};

export default FormResponsesPage;
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
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
  if (!form) {
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
