import { Link } from "@tanstack/react-router"
import SocialIcons from "./SocialIcons"

export default function Footer() {
    return <div className="bg-black/35 border-t border-white/10 shrink-0 flex items-center sm:h-20 sm:py-0 py-5">
        <div className="w-[90%] sm:w-[90%] md:w-[70%] lg:w-[50%] mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-y-3 gap-x-5">
            <p className="text-white/40 text-sm order-2 sm:order-1 w-fit whitespace-nowrap">© {new Date().getFullYear()} rs.cinaglia.dev</p>
            <div className="flex items-center gap-x-4 sm:gap-x-6 order-1 sm:order-2 w-full justify-between">
                <Link to="/privacy-policy" className="text-white/30 text-sm hover:text-white/60 transition-colors duration-300">
                    Privacy Policy
                </Link>
                <SocialIcons />
            </div>
        </div>
    </div>
}