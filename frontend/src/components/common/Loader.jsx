function Loader() {
  return (
    <div className="flex min-h-40 items-center justify-center" role="status" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-blue-100 border-t-[var(--navy)]" />
    </div>
  );
}

export default Loader;
