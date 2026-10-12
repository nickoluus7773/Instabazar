export default function GradientText({ children }) {
  return (
    <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
      {children}
    </span>
  );
}
