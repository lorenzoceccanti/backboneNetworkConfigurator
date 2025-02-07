import NumberOfRouters from "@/components/NumberOfRouters";

export default function Home() {
  return (
    <main className="font-[family-name:var(--font-geist-mono)] space-y-10 mt-5">
      <h1 className="font-bold text-5xl mx-auto w-fit uppercase text-primary">Automatic Network Configuration 🌐</h1>
      <NumberOfRouters></NumberOfRouters>
    </main>
  );
}
