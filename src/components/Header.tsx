import { Link } from "@tanstack/react-router"
import { FolderIcon, HomeIcon, NewspaperIcon } from "lucide-react"

export default function Header() {
  return (
    <div className="w-full h-fit sm:h-15 bg-black/70 backdrop-blur-md top-0 border-b border-white/10 fixed z-50">
      <div className="w-[90%] sm:w-[90%] md:w-[70%] lg:w-[50%] mx-auto sm:h-full h-15 flex items-center">
        <Link to='/' className="font-mono font-bold text-xl">
          cinaglia.dev
        </Link>
        <div className="gap-x-4 ml-auto hidden sm:flex">
          <Link to="/" className="flex gap-x-1.5 hover:bg-white hover:text-black p-1 px-2 rounded-lg" activeProps={{
            className: `bg-white text-black`
          }}>
            <HomeIcon className="w-4" />
            Home
          </Link>
          <Link to="/articles" className="flex gap-x-1.5 hover:bg-white hover:text-black p-1 px-2 rounded-lg" activeProps={{
            className: `bg-white text-black`
          }}>
            <NewspaperIcon className="w-4" />
            Articles
          </Link>
          <Link to="/archive/$" className="flex gap-x-1.5 hover:bg-white hover:text-black p-1 px-2 rounded-lg">
            <FolderIcon className="w-4" />
            Archive
          </Link>
        </div>
      </div>
      <div className="bottom-0 sm:hidden flex h-10 border-t gap-x-4 ml-auto border-white/10 w-full">
        <div>
          <div className="gap-x-5 flex w-[80%] sm:w-[90%] md:w-[70%] lg:w-[50%] items-center h-full mx-auto">
            <Link to="/" className="flex gap-x-1.5">
              <HomeIcon className="w-4" />
              Home
            </Link>
            <Link to="/articles" className="flex gap-x-1.5">
              <NewspaperIcon className="w-4" />
              Articles
            </Link>
            <Link to="/archive/$" className="flex gap-x-1.5">
              <FolderIcon className="w-4" />
              Archive
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}