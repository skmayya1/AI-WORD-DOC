import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectInputProps {
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({
  options,
  label,
  placeholder = "Select an option",
  value,
  onChange,
  className,
}) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className || "w-[160px]"}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {label && <SelectLabel>{label}</SelectLabel>}
          {options.map((option) => (
            <SelectItem  key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SelectInput;