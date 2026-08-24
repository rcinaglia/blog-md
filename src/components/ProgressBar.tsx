import { useEffect } from "react"
import { useRouter } from "@tanstack/react-router"
import NProgress from "nprogress"

// Renders nothing itself — NProgress injects/removes its own bar element in
// the DOM. Only wires the router's navigation lifecycle to start()/done(),
// so this must stay inside an effect (client-only): the router is isomorphic
// and re-runs on the server too, where there's no `document` for NProgress
// to touch.
export default function ProgressBar() {
  const router = useRouter()

  useEffect(() => {
    NProgress.configure({ showSpinner: false })

    const unsubStart = router.subscribe("onBeforeLoad", () => {
      NProgress.start()
    })
    const unsubDone = router.subscribe("onResolved", () => {
      NProgress.done()
    })

    return () => {
      unsubStart()
      unsubDone()
      NProgress.remove()
    }
  }, [router])

  return null
}
