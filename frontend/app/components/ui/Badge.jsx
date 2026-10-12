export default function Badge({
  children,
  className = "",
}) {
  return (
    <span
      className={`
        inline-flex
        items-center
        gap-2
        rounded-full
        px-4
        py-2
        text-sm
        font-semibold
        bg-gradient-to-r
        from-purple-100
        to-pink-100
        text-purple-700
        border
        border-purple-200
        ${className}
      `}
    >
      {children}
    </span>
  );
}
