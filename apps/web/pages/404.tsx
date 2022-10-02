import { NextPage } from "next";
import { NextSeo } from "next-seo";
import MainContainer from "../components/MainContainer";

const NotFoundPage: NextPage = () => {
  return (
    <MainContainer>
      <NextSeo title="Not Found" />
      <div className="text-center mt-12">
        <h1 className="text-9xl font-bold">404</h1>
        <h2 className="text-6xl font-bold">Page Not Found</h2>
      </div>
    </MainContainer>
  );
};

export default NotFoundPage;
