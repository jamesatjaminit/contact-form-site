import type { NextPage } from "next";
import NavBar from "./NavBar";

interface Props {
  children: React.ReactNode | React.ReactNode[];
}
const MainContainer: NextPage<Props> = ({ children }) => {
  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="container mx-auto px-4 mt-5">{children}</div>
    </div>
  );
};

export default MainContainer;
