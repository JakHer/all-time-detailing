export function DetailEmptyPanelMessage({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-white/8 bg-white/2 p-4 text-center text-sm text-stone-500">
      {message}
    </p>
  );
}
