interface ButtonProps {
  label: string;
  onClick: () => void;
  twStyle?: string;
  style?: {};
  disabled?: boolean;
}

export default function Button({label, onClick, style, twStyle, disabled=false}: ButtonProps) {
  const baseClass = "hover:bg-gray-200 text-gray-500 text-xxs font-bold py-1 px-2 rounded border-gray-500 border";
  const disabledClass = "bg-gray-200 text-gray-400 border-gray-400 cursor-not-allowed";
  const className = twStyle + (disabled ? " " + disabledClass : "") + " " + baseClass;
  return (
    <button className={className} style={style} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}