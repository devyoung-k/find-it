import { forwardRef, useState } from 'react';
import AlertText, { AlertCase } from '@/shared/ui/feedback/AlertText';
import ConfirmText, { ConfirmCase } from '@/shared/ui/feedback/ConfirmText';
import InputIconButton from '@/features/auth/sign-in/ui/InputIconButton';

interface InputFormProps {
  marginTop?: string;
  type?: string;
  title: string;
  placeholder: string;
  value: string;
  alertCase?: AlertCase | '';
  confirmCase?: ConfirmCase | '';

  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  iconDoubleCheck?: boolean;
  iconDelete?: boolean;
  iconEyeToggle?: boolean;
  onClickDoubleCheck?: () => void;
  onClickDelete?: () => void;
  onClickEye?: () => void;
  disabledDoubleCheck?: boolean;
}

const InputForm: React.ForwardRefRenderFunction<
  HTMLInputElement,
  InputFormProps
> = (
  {
    marginTop = '0px',
    type = 'text',
    title,
    placeholder,
    value,
    alertCase,
    confirmCase,
    onChange,
    iconDoubleCheck,
    iconDelete,
    iconEyeToggle,
    onClickDoubleCheck,
    onClickDelete,
    onClickEye,
    disabledDoubleCheck,
    ...resProps
  },
  ref
) => {
  // 포커스 상태에 따라 보더 색상을 조정한다.
  const [isFocus, setIsFocus] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && typeof ref === 'object' && ref?.current) {
      ref.current.blur();
    }
  };

  const handleFocus = () => {
    setIsFocus(true);
  };
  const handleBlur = () => {
    setIsFocus(false);
  };

  return (
    <div
      style={{
        marginTop: `${marginTop}`,
      }}
    >
      <div
        className={`flex h-[52px] w-full items-center justify-between gap-2 rounded-xl px-4 transition-colors ${
          isFocus ? 'bg-gray-50 ring-2 ring-primary/30' : 'bg-gray-100'
        }`}
      >
        <label className="sr-only">{title}</label>
        <input
          className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
          ref={ref}
          type={type}
          name={title}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...resProps}
        />
        <InputIconButton
          iconDoubleCheck={!!iconDoubleCheck}
          iconDelete={!!iconDelete}
          iconEyeToggle={!!iconEyeToggle}
          onClickDoubleCheck={onClickDoubleCheck}
          onClickDelete={onClickDelete}
          onClickEye={onClickEye}
          disabledDoubleCheck={disabledDoubleCheck}
        />
      </div>
      <AlertText alertCase={alertCase} />
      <ConfirmText confirmCase={confirmCase} />
    </div>
  );
};

const InputFormRef = forwardRef(InputForm);
export default InputFormRef;
