import { Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"

export default function NoCookieBanner() {

    const [closed, setClosed] = useState(true)

    function closeBanner() {
        localStorage.setItem("nocookie-closed", "true")
        setClosed(true)
    }

    useEffect(() => {
        const value = localStorage.getItem("nocookie-closed")
        if (!value)
            setClosed(false)
    }, [])

    if (closed)
        return null

    return <div className="fixed bottom-0 left-0 w-full bg-black/80 border-t border-white/10 backdrop-blur-lg py-8 px-5 flex flex-col sm:flex-row gap-x-15 gap-y-5">
        <div className="left-0">
            <p>Questo sito web rispetta la tua privacy.<br /> Nessun cookie, solo numeri anonimi per capire come va il sito.</p>
            <Link to="/privacy-policy" className="text-white/30 underline">Visualizza la Privacy Policy</Link>
        </div>
        <div className="ml-auto flex items-center">
            <button className="px-4 py-1 bg-white text-black cursor-pointer" onClick={closeBanner}>Capito, chiudi</button>
        </div>
    </div>
}