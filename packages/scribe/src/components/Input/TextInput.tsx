import "./Input.css";
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
  label,
  value,
  onChange,
  placeholder = "",
  "data-test-id": dataTestId,
  type = "text",
}) => (
  <div className="Input__wrapper">
    <label className="Input__label">{label}</label>
    <input
      type={type}
      className="Input__input"
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
    // console.log({ inputValues });
    setInputValues((prev) => ({ ...prev, [key]: value }));
  };

  const onClick = () => {
    // console.log("Inserting Note: ", inputValues);
    insertFunction({
      editor: activeEditor,
      inputValues,
    });
    setInputValues({});
    onClose();
  };

  return (
    <>
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
            placeholder="Note Title"
            label="Title"
            onChange={handleChange("title")}
            value={inputValues.title || ""}
            data-test-id="note-title"
          />
          <TextInput
            placeholder="Note Content"
            label="Content"
            onChange={handleChange("content")}
            value={inputValues.content || ""}
            data-test-id="note-content"
          />
          <TextInput
            placeholder="Author"
            label="Author"
            onChange={handleChange("author")}
            value={inputValues.author || ""}
            data-test-id="note-author"
          />
          <TextInput
            placeholder="Date"
            label="Date"
            onChange={handleChange("date")}
            value={inputValues.date || ""}
            data-test-id="note-date"
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
    </>
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
    className={`Button__root ${className}`}
    onClick={onClick}
    title={title}
    aria-label={title}
    {...(dataTestId && { "data-test-id": dataTestId })}
  >
    {children}
  </button>
);
