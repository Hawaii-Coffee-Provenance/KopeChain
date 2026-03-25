"use client";

interface FormHeaderProps {
  title: string;
  description: string;
}

const FormHeader = ({ title, description }: FormHeaderProps) => {
  return (
    <div className="px-6 py-6 sm:px-8 border-b border-base-300">
      <h2 className="heading-card text-4xl mb-2">{title}</h2>
      <p className="text-muted text-sm m-0">{description}</p>
    </div>
  );
};

export default FormHeader;
