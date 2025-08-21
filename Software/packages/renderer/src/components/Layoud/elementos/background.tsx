import {type PropsWithChildren } from "react";

export function Background({ children }: PropsWithChildren) {
  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white ">
      {children}
    </div>
  );
}
