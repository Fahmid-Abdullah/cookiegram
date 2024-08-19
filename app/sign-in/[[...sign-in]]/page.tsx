import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return <div className="bg-slate-300 min-h-screen flex items-center justify-center"><SignIn /></div>;
}