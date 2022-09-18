import type { NextPage } from "next";
import NavBar from "./NavBar";

interface Props {
  children: React.ReactNode | React.ReactNode[];
}
const MainContainer: NextPage<Props> = ({ children }) => {
  return (
    <div>
      <NavBar />
      <div className="container mx-auto px-4">
        {children}
      </div>
    </div>

  );
};

export default MainContainer;