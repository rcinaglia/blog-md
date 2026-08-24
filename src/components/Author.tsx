import SocialIcons from './SocialIcons'


export default function Author() {
  return <div className="gap-y-2 flex flex-col w-full sm:w-[70%]">
    <h2 className="text-white/50 text-xl uppercase font-bold">pubblicato da</h2>
    <div className="flex flex-wrap gap-x-5 gap-y-3 py-3">
      <span className="h-25 w-25 rounded-full shrink-0 bg-white/10 overflow-hidden flex items-center justify-center text-2xl font-bold">
        <img src="/pfp2.jpg" alt="Author Avatar" className="h-full w-full object-cover" />
      </span>
      <div className="flex items-left flex-col justify-center gap-y-3">
        <div>
          <h2 className="font-bold text-xl">Riccardo Cinaglia</h2>
          <p className="text-sm text-white/50">Studente di Ingegneria informatica e appassionato di tecnologia.</p>
        </div>
        <SocialIcons/>
      </div>
    </div>
  </div>
}
