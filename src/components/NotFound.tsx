import { Link } from "@tanstack/react-router"
import Header from "./Header"
import Footer from "./Footer"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="w-[90%] sm:w-[90%] md:w-[70%] lg:w-[50%] mx-auto sm:mt-25 mt-32 flex flex-col items-center justify-center gap-y-5 mb-10 flex-1 text-center">
        <h1 className="text-6xl font-extrabold">404</h1>
        <p className="text-white/70">The page you requested does not exist (or has been moved).</p>
        <Link to="/" className="underline underline-offset-4">
          Back to home
        </Link>
      </div>
      <Footer />
    </div>
  )
}
