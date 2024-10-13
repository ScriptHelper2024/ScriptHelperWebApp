import WikiNavigation from "./components/WikiNavigation";
export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="col-start-1 col-span-3 row-span-1 row-start-3 h-full bg-white  relative overflow-hidden flex flex-col pl-[64px]">
      <div className="scrollWrapper overflow-x-hidden h-full w-full p-6 pb-[80px]">
        <div className="flex flex-col">{children}</div>
      </div>
      <WikiNavigation />
    </div>
  );
}
