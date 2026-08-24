import { Link } from "@tanstack/react-router"
import Logo from "./Logo"

export default function Header() {
  return (
    <div className="w-full h-fit sm:h-15 bg-black/70 backdrop-blur-md top-0 border-b border-white/10 fixed z-50">
      <div className="w-[90%] sm:w-[90%] md:w-[70%] lg:w-[50%] mx-auto sm:h-full h-15 flex items-center">
        <Logo />
        <div className="gap-x-4 ml-auto hidden sm:flex">
          <Link to="/">Home</Link>
          <Link to="/articles">Articles</Link>
        </div>
      </div>
      <div className="bottom-0 sm:hidden flex h-10 border-t gap-x-4 ml-auto border-white/10 w-full">
        <div>
          <div className="gap-x-4 ml-auto flex w-[80%] sm:w-[90%] md:w-[70%] lg:w-[50%] items-center h-full">
            <Link to="/">Home</Link>
            <Link to="/articles">Articles</Link>
          </div>
        </div>
      </div>
    </div>
  )
}