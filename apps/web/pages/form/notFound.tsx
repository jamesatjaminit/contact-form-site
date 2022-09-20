import type { GetServerSideProps, NextPage } from "next";
import { Session, unstable_getServerSession } from "next-auth";
import MainContainer from "../../components/MainContainer";
import { authOptions } from "../api/auth/[...nextauth]";

interface Props {
  session: Session;
}

const FormNotFound: NextPage<Props> = ({ session }) => {
  return (
    <MainContainer>
      <h1 className="text-3xl">For Not Found</h1>
    </MainContainer>
  );
};

export default FormNotFound;