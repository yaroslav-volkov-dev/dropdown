import { ForwardedRef, forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./index.css";

type Option = {
  id: string;
  label: string;
};

type PositionCoordinates = {
  top: number | null;
  bottom: number | null;
  left: number | null;
  width: number | null;
}

type DropdownProps = {
  options: Option[];
  selectedOptionId?: string | null;
  onSelect: (option: Option) => void;
};

type DropdownMenuProps = {
  options: Option[];
  onSelect: (option: Option) => void;
  menuPosition: PositionCoordinates
}

const DropdownMenu = forwardRef((
  {
    options,
    onSelect,
    menuPosition
  }: DropdownMenuProps, ref: ForwardedRef<HTMLUListElement>) => {

  const {
    top,
    width,
    left,
    bottom
  } = menuPosition;

  return createPortal(
    <ul
      ref={ref}
      className="dropdown-menu"
      style={{
        position: "fixed",
        ...(left && { left }),
        ...(width && { width }),
        ...(top && { top }),
        ...(bottom && { bottom }),
      }}
    >
      {options.map(({ id, label }, index) => {
        return (
          <li className="dropdown-menu-item" key={id}>
            <button
              onClick={() => onSelect({ id, label })}
              tabIndex={index + 1}
              className="dropdown-menu-button"
            >
              {label}
            </button>
          </li>
        );
      })}
    </ul>,
    document.body
  );
});

const Dropdown = ({ options, selectedOptionId, onSelect }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<PositionCoordinates>({
    top: null,
    left: null,
    width: null,
    bottom: null
  });

  const dropdownRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);
  const selectedOption = options.find(({ id }) => id === selectedOptionId);

  const updateMenuCoordinates = () => {
    if (!dropdownRef.current) return;

    const dropdownRect = dropdownRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight || 0;
    const windowHeight = window.innerHeight;
    const shouldRenderMenuUpwards = dropdownRect.bottom + menuHeight > windowHeight;

    setMenuPosition({
      top: shouldRenderMenuUpwards ? null : dropdownRect.bottom,
      bottom: shouldRenderMenuUpwards ? windowHeight - dropdownRect.top : null,
      left: dropdownRect.x,
      width: dropdownRect.width
    });
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updateMenuCoordinates();
    }
  }, [isOpen]);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (
        !menuRef.current
        || menuRef.current.contains(event.target as Node)
        || dropdownRef.current?.contains(event.target as Node)
      ) return;

      setIsOpen(false);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, []);

  useEffect(() => {
    const resizeListener = () => {
      updateMenuCoordinates();
    };

    window.addEventListener("resize", resizeListener);
    return () => {
      window.removeEventListener("resize", resizeListener);
    };
  }, []);

  return (
    <button
      className="dropdown"
      onClick={() => setIsOpen(prevState => !prevState)}
      ref={dropdownRef}
      tabIndex={0}
    >
      {selectedOption?.label || "Select ..."}
      <div className={`chevron-icon ${isOpen ? 'chevron-icon-open' : 'chevron-icon-closed'}`} />
      {isOpen && (
        <DropdownMenu
          options={options}
          onSelect={onSelect}
          ref={menuRef}
          menuPosition={menuPosition}
        />
      )}
    </button>
  );
};

const options = [
  {
    id: "1",
    label: "Option 1",
  },
  {
    id: "2",
    label: "Option 2",
  },
  {
    id: "3",
    label: "Option 3",
  },
  {
    id: "4",
    label: "Option 4",
  },
  {
    id: "5",
    label: "Option 5",
  },
  {
    id: "6",
    label: "Option 6",
  },
  {
    id: "7",
    label: "Option 7",
  },
  {
    id: "8",
    label: "Option 8",
  },
];

export default function App() {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  return (
    <div className="App">
      <div className="container">
        <Dropdown
          options={options}
          selectedOptionId={selectedOptionId}
          onSelect={({ id }) => setSelectedOptionId(id)}
        />
      </div>
    </div>
  );
}
