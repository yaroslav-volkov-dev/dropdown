import { ForwardedRef, forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";
import "./index.css";

enum DropdownStatus {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  CLOSING = 'CLOSING',
  OPENING = 'OPENING',
}

type Option = {
  id: string;
  label: string;
};

type DropdownProps = {
  options: Option[];
  selectedOptionId?: string | null;
  onSelect: (option: Option) => void;
};

type DropdownMenuProps = {
  options: Option[];
  onSelect: (option: Option) => void;
  dropdownStatus: DropdownStatus;
}

const OPEN_DROPDOWN_STATUSES = [DropdownStatus.OPEN, DropdownStatus.OPENING];
const CLOSED_DROPDOWN_STATUSES = [DropdownStatus.CLOSED, DropdownStatus.CLOSING];

const DropdownMenu = forwardRef((
  {
    options,
    onSelect,
    dropdownStatus
  }: DropdownMenuProps, ref: ForwardedRef<HTMLUListElement>) => {

  if (dropdownStatus === DropdownStatus.CLOSED) return null;

  return createPortal(
    <ul
      ref={ref}
      className={clsx('dropdown-menu', {
        ['opening']: dropdownStatus === DropdownStatus.OPENING,
        ['closing']: dropdownStatus === DropdownStatus.CLOSING
      })}
    >
      {options.map(({ id, label }) => {
        return (
          <li className="dropdown-menu-item" key={id}>
            <button
              onClick={() => onSelect({ id, label })}
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
  const [dropdownStatus, setDropdownStatus] = useState<DropdownStatus>(DropdownStatus.CLOSED);

  const dropdownRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);
  const selectedOption = options.find(({ id }) => id === selectedOptionId);

  const updateMenuCoordinates = () => {
    if (!dropdownRef.current || !menuRef.current) return;

    const dropdownRect = dropdownRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current?.getBoundingClientRect().height || 0;
    const windowHeight = window.innerHeight;
    const shouldRenderMenuUpwards = dropdownRect.bottom + menuHeight > windowHeight;
    const top = shouldRenderMenuUpwards ? null : `${dropdownRect.bottom}px`;
    const bottom = shouldRenderMenuUpwards ? `${(windowHeight - dropdownRect.top).toString()}px` : null;
    const left = `${dropdownRect.x.toString()}px`;
    const width = `${dropdownRect.width.toString()}px`;

    menuRef.current.style.setProperty('top', top);
    menuRef.current.style.setProperty('bottom', bottom);
    menuRef.current.style.setProperty('left', left);
    menuRef.current.style.setProperty('width', width);
  };

  const openDropdown = () => {
    setDropdownStatus(DropdownStatus.OPENING);
  };

  const closeDropdown = () => {
    setDropdownStatus(DropdownStatus.CLOSING);
  };

  const onTriggerClick = () => {
    if (CLOSED_DROPDOWN_STATUSES.includes(dropdownStatus)) {
      openDropdown();
      return;
    }
    if (OPEN_DROPDOWN_STATUSES.includes(dropdownStatus)) {
      closeDropdown();
      return;
    }
  };

  useEffect(() => {
    if(!menuRef.current) return;

    const menuElement = menuRef.current
    const onTransitionEnd = () => {

      if (dropdownStatus === DropdownStatus.CLOSING) {
        setDropdownStatus(DropdownStatus.CLOSED);
      }

      if (dropdownStatus === DropdownStatus.OPENING) {
        setDropdownStatus(DropdownStatus.OPEN);
      }
    };

    menuElement.addEventListener('animationend', onTransitionEnd);

    return () => {
      menuElement.removeEventListener('animationend', onTransitionEnd);
    };
  }, [dropdownStatus]);

  useLayoutEffect(() => {
    if (OPEN_DROPDOWN_STATUSES.includes(dropdownStatus)) {
      updateMenuCoordinates();
    }
  }, [dropdownStatus]);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (
        !menuRef.current
        || menuRef.current.contains(event.target as Node)
        || dropdownRef.current?.contains(event.target as Node)
      ) return;

      closeDropdown();
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
      onClick={onTriggerClick}
      ref={dropdownRef}
    >
      {selectedOption?.label || "Select ..."}
      <div
        className={`chevron-icon ${(OPEN_DROPDOWN_STATUSES.includes(dropdownStatus)) ? 'chevron-icon-open' : 'chevron-icon-closed'}`} />
      <DropdownMenu
        options={options}
        onSelect={onSelect}
        ref={menuRef}
        dropdownStatus={dropdownStatus}
      />
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
