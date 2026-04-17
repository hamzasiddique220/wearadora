export default function Loading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="text-center py-20 text-bronze text-sm tracking-wider">
      {message}
    </div>
  );
}
