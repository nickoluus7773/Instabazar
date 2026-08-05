import Badge from "./Badge";
import GradientText from "./GradientText";

export default function SectionHeading({
  badge,
  title,
  gradientText,
  description,
  center = true,
}) {
  return (
    <div
      className={`mb-16 ${
        center ? "text-center" : "text-left"
      }`}
    >
      {badge && (
        <Badge>
          {badge}
        </Badge>
      )}

      <h2 className="mt-6 text-4xl lg:text-5xl font-black leading-tight text-slate-900">

        {title}

        {gradientText && (
          <>
            <br />

           <GradientText>
            {gradientText}
          </GradientText>
          </>
        )}

      </h2>

      {description && (
        <p className="mt-6 max-w-3xl mx-auto text-lg leading-8 text-slate-600">
          {description}
        </p>
      )}
    </div>
  );
}