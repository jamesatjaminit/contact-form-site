import type { NextPage } from "next";
import { ReactNode } from "react";
import NavBar from "./NavBar";

interface Props {
  children: ReactNode | ReactNode[];
}
const MainContainer: NextPage<Props> = ({ children }) => {
  return (
    <div className="min-h-screen mb-10">
      <NavBar />
      <div className="container mx-auto px-4 mt-5">{children}</div>
    </div>
  );
};

export default MainContainer;
