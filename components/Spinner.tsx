export default function Spinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ff5722] border-t-transparent" />
    </div>
  );
}
