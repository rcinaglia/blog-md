import { SiGithub, SiInstagram, SiBluesky, SiX } from '@icons-pack/react-simple-icons';


export default function SocialIcons() {
  const icons_size = 20;
  const icons_classes = "hover:rotate-20 hover:scale-110 transition-all duration-300"


  return <ul className="flex gap-x-4">
    <li className={icons_classes}>
      <a href="https://github.com/rcinaglia" target="_blank" rel="noreferrer">
        <SiGithub color="white" size={icons_size} />
      </a>
    </li>
    <li className={icons_classes}>
      <a href="https://instagram.com/riccardocinaglia" target="_blank" rel="noreferrer">
        <SiInstagram color="white" size={icons_size} />
      </a>
    </li>
    <li className={icons_classes}>
      <a href="https://x.com/cinaglia_" target="_blank" rel="noreferrer">
        <SiX color="white" size={icons_size} />
      </a>
    </li>
    <li className={icons_classes}>
      <a href="https://bsky.app/profile/cinaglia.dev" target="_blank" rel="noreferrer">
        <SiBluesky color="white" size={icons_size} />
      </a>
    </li>
  </ul>
}
