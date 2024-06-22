interface ButtonProps {
  label: string;
  onClick: () => void;
  style?: {};
}

export default function Button({label, onClick, style}: ButtonProps) {
  const baseStyle = "bg-black hover:bg-gray-700 text-white text-xxs font-bold py-1 px-2 rounded";
  const concatStyle = baseStyle + " " + (style || "");
  return (
    <button className={concatStyle} style={style} onClick={onClick}>
      {label}
    </button>
  );
}