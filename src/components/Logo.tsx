import ScrambledText from "./ScrambledText"
import { Link } from "@tanstack/react-router"


export default function Logo() {
  return <Link className="cursor-pointer" to="/">
    <ScrambledText
      className="text-xl"
      radius={50}
      duration={1.2}
      speed={0.3}
      scrambleChars=".:"
    >
      cinaglia.dev
    </ScrambledText>
  </Link>
}