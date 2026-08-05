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
        from-pink-100
        via-orange-50
        to-yellow-100
        text-pink-700
        border
        border-pink-200
        ${className}
      `}
    >
      {children}
    </span>
  );
}