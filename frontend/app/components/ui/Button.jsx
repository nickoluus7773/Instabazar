export default function Button({
  children,
  variant = "primary",
  type = "button",
  className = "",
}) {

  const styles = {

    primary:
      "bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-400 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]",

    secondary:
      "bg-white border border-slate-300 text-slate-900 hover:border-pink-400 hover:text-pink-600",

    outline:
      "border border-pink-300 text-pink-600 hover:bg-pink-50",

    dark:
      "bg-slate-900 text-white hover:bg-slate-800",

  };

  return (

    <button
      type={type}
      className={`
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
      `}
    >

      {children}

    </button>

  );

}