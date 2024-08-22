// import "./Input.css";
import { LexicalEditor } from "lexical";
import React, { ReactNode, useEffect, useState } from "react";

type TextInputProps = {
  "data-test-id"?: string;
  label: string;
  onChange: (val: string) => void;
  placeholder?: string;
  value: string;
  type?: React.HTMLInputTypeAttribute;
};

const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  placeholder = "",
  "data-test-id": dataTestId,
  type = "text",
}) => (
  <div className="mb-4 flex flex-col">
    <input
      type={type}
      className="rounded-md border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-test-id={dataTestId}
    />
  </div>
);

type InsertDialogProps = {
  activeEditor: LexicalEditor;
  onClose: () => void;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  insertFunction: (params: any) => void;
  label: string;
  placeholder?: string;
};

export const InsertDialog: React.FC<InsertDialogProps> = ({
  activeEditor,
  onClose,
  insertFunction,
  label,
  placeholder,
}) => {
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    setIsDisabled(Object.values(inputValues).some((val) => val.trim() === ""));
  }, [inputValues]);

  const handleChange = (key: string) => (value: string) => {
    console.log({ inputValues });
    setInputValues((prev) => ({ ...prev, [key]: value }));
  };

  const onClick = () => {
    console.log("Inserting Note: ", inputValues);
    insertFunction({
      editor: activeEditor,
      inputValues,
    });
    setInputValues({});
    onClose();
  };

  return (
    <div className="mx-auto max-w-sm rounded-lg bg-white p-6 shadow-lg">
      {label === "Footnote" ? (
        <>
          <TextInput
            placeholder="Text"
            label="Text"
            onChange={handleChange("ft")}
            value={inputValues.ft || ""}
            data-test-id="note-ft"
          />

          <TextInput
            placeholder="Origin Reference."
            label="Orign Reference"
            onChange={handleChange("fr")}
            value={inputValues.fr || ""}
            data-test-id="note-fr"
          />
          <TextInput
            placeholder="Quotation"
            label="Quotation"
            onChange={handleChange("fq")}
            value={inputValues.fq || ""}
            data-test-id="note-ftquot"
          />
          <TextInput
            placeholder="Content"
            label="Content"
            onChange={handleChange("fqa")}
            value={inputValues.fqa || ""}
            data-test-id="note-fqa"
          />
        </>
      ) : label === "XRef" ? (
        <>
          <TextInput
            placeholder="Origin Reference."
            label="Origin Reference"
            onChange={handleChange("xo")}
            value={inputValues.xo || ""}
            data-test-id="note-xo"
          />
          <TextInput
            placeholder="Target Reference"
            label="Target Reference"
            onChange={handleChange("xt")}
            value={inputValues.xt || ""}
            data-test-id="note-xt"
          />
          <TextInput
            placeholder="Quotation"
            label="Quotation"
            onChange={handleChange("xq")}
            value={inputValues.xq || ""}
            data-test-id="note-xq"
          />
        </>
      ) : (
        <TextInput
          placeholder={placeholder ?? "Enter Value"}
          label={label}
          onChange={handleChange(label.toLowerCase())}
          value={inputValues[label.toLowerCase()] || ""}
          data-test-id={`modal-${label.toLowerCase()}`}
          type="number"
        />
      )}
      <Button disabled={isDisabled} onClick={onClick}>
        Confirm
      </Button>
    </div>
  );
};

type ButtonProps = {
  "data-test-id"?: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick: () => void;
  title?: string;
};

export const Button: React.FC<ButtonProps> = ({
  "data-test-id": dataTestId,
  children,
  className,
  onClick,
  disabled,
  title,
}) => (
  <button
    disabled={disabled}
    className={`rounded-md bg-primary px-4 py-2 font-bold text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 ${
      disabled ? "cursor-not-allowed opacity-50" : ""
    } ${className}`}
    onClick={onClick}
    title={title}
    aria-label={title}
    {...(dataTestId && { "data-test-id": dataTestId })}
  >
    {children}
  </button>
);
