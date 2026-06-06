const Skeleton = () => {
  return (
    <div className="flex items-center gap-3.5 border-b border-gray-100 py-4">
      <div className="h-[72px] w-[72px] shrink-0 animate-pulse rounded-2xl bg-gray-100" />
      <div className="flex-1 space-y-2.5">
        <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
        <div className="h-3 w-28 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  );
};

export default Skeleton;
