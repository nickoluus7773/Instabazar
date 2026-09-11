import Link from "next/link";

export default function Button({
  children,
  variant = "primary",
  type = "button",
  href,
  className = "",
}) {
  const styles = {
    primary:
      "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]",
    secondary:
      "bg-white border border-slate-300 text-slate-900 hover:border-purple-400 hover:text-purple-600",
    outline: "border border-purple-300 text-purple-600 hover:bg-purple-50",
    dark: "bg-slate-900 text-white hover:bg-slate-800",
  };

  const buttonClassName = `
    inline-flex
    items-center
    justify-center
    rounded-xl
    px-7
    py-4
    font-semibold
    transition-all
    duration-300
    ${styles[variant]}
    ${className}
  `;

  if (href) {
    return (
      <Link href={href} className={buttonClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={buttonClassName}>
      {children}
    </button>
  );
}
