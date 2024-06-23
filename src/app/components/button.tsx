interface ButtonProps {
  label: string;
  onClick: () => void;
  twStyle?: string;
  style?: {};
}

export default function Button({label, onClick, style, twStyle}: ButtonProps) {
  const className = twStyle + " " + "bg-white hover:bg-gray-200 text-gray-500 text-xxs font-bold py-1 px-2 rounded border-gray-500 border";
  return (
    <button className={className} style={style} onClick={onClick}>
      {label}
    </button>
  );
}