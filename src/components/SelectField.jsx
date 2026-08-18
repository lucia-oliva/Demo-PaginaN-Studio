import { ChevronDown } from 'lucide-react';

export default function SelectField({ children, ...props }) {
  return (
    <div className="select-wrap">
      <select className="custom-select" {...props}>
        {children}
      </select>
      <ChevronDown className="select-icon" />
    </div>
  );
}