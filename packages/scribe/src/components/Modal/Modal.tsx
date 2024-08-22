import { ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

function PortalImpl({
  onClose,
  children,
  title,
  closeOnClickOutside,
}: {
  children: ReactNode;
  closeOnClickOutside: boolean;
  onClose: () => void;
  title: string;
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalRef.current !== null) {
      modalRef.current.focus();
    }
  }, []);

  useEffect(() => {
    let modalOverlayElement: HTMLElement | null = null;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    const clickOutsideHandler = (event: MouseEvent) => {
      const target = event.target;
      if (
        modalRef.current !== null &&
        !modalRef.current.contains(target as Node) &&
        closeOnClickOutside
      ) {
        onClose();
      }
    };
    const modelElement = modalRef.current;
    if (modelElement !== null) {
      modalOverlayElement = modelElement.parentElement;
      if (modalOverlayElement !== null) {
        modalOverlayElement.addEventListener("click", clickOutsideHandler);
      }
    }

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
      if (modalOverlayElement !== null) {
        modalOverlayElement?.removeEventListener("click", clickOutsideHandler);
      }
    };
  }, [closeOnClickOutside, onClose]);

  return (
    <div className="z-100 fixed inset-0 flex items-center justify-center bg-gray-800/60">
      <div className="w-80 rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between rounded-t-lg bg-gray-900 px-1 py-1">
          {/* <div
        className="relative flex min-h-[100px] min-w-[300px] flex-col rounded-lg bg-white p-5 shadow-lg"
        tabIndex={-1}
        ref={modalRef}
      > */}
          {/* <h2 className="m-0 border-b border-gray-300 pb-2.5 text-gray-700">{title}</h2> */}
          <h2 className="pl-3 font-bold text-white">{title}</h2>
          <button
            // className="w-7.5 h-7.5 absolute right-5 flex cursor-pointer items-center justify-center text-gray-500 hover:text-gray-700 focus:outline-none"
            // className="text-gray-500 hover:text-gray-700 focus:outline-none"
            className="rounded bg-primary p-1 text-white transition duration-300 hover:bg-orange-600"
            aria-label="Close modal"
            type="button"
            onClick={onClose}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="">{children}</div>
      </div>
    </div>
  );
}

export default function Modal({
  onClose,
  children,
  title,
  closeOnClickOutside = false,
}: {
  children: ReactNode;
  closeOnClickOutside?: boolean;
  onClose: () => void;
  title: string;
}): JSX.Element {
  return createPortal(
    <PortalImpl onClose={onClose} title={title} closeOnClickOutside={closeOnClickOutside}>
      {children}
    </PortalImpl>,
    document.body,
  );
}
