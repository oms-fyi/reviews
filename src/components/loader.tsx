export function Loader(): JSX.Element {
  return (
    <div className="mx-auto w-full max-w-xl rounded-md bg-white p-4 shadow">
      <div className="flex animate-pulse flex-col gap-6">
        <div className="flex gap-2">
          <div className="h-10 w-10 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-3 py-1">
            <div className="h-4 rounded bg-slate-200" />
            <div className="h-4 rounded bg-slate-200" />
          </div>
        </div>
        <div className="h-4 rounded bg-slate-200" />
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-3 h-4 rounded bg-slate-200" />
          <div className="col-span-3 h-4 rounded bg-slate-200" />
          <div className="col-span-3 h-4 rounded bg-slate-200" />
          <div className="col-span-3 h-4 rounded bg-slate-200" />
          <div className="col-span-3 h-4 rounded bg-slate-200" />
          <div className="col-span-3 h-4 rounded bg-slate-200" />
        </div>
        <div className="grid grid-cols-6 gap-2">
          <div className="col-span-1 h-4 rounded bg-slate-200" />
          <div className="col-span-1 h-4 rounded bg-slate-200" />
          <div className="col-span-1 h-4 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
