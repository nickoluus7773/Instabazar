export default function GradientText({ children }) {
  return (
    <span className="bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
      {children}
    </span>
  );
}