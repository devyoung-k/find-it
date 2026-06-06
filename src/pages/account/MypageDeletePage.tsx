import { useEffect, useRef, useState } from 'react';
import InputFormSlim from '@/features/auth/sign-in/ui/InputFormSlim';
import ButtonVariable from '@/shared/ui/buttons/ButtonVariable';
import ModalComp from '@/shared/ui/modal/ModalComp';
import { useAuthStore } from '@/features/auth/model/authStore';
import { deleteAccount } from '@/lib/api/auth';
import { useHeaderConfig } from '@/widgets/header/model/HeaderConfigContext';
import { logger } from '@/lib/utils/logger';

// 타입 정의
type AlertProps =
  | 'doubleCheckEmail'
  | 'doubleCheckNickname'
  | 'doubleCheckPassword'
  | 'invalidValue'
  | 'invalidEmail'
  | 'invalidPassword'
  | 'userEmail'
  | 'userEmailDouble'
  | '';

const MypageDelete = () => {
  const user = useAuthStore((s) => s.user);
  const userEmail = user?.email ?? '';
  const userId = user?.id ?? '';

  const [emailValue, setEmailValue] = useState('');
  const [emailCheckValue, setEmailCheckValue] = useState('');
  const [alertEmail, setAlertEmail] = useState<AlertProps>();

  const emailRef = useRef(null);
  const emailCheckRef = useRef(null);

  const handleEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const newValue = e.target.value;
    setEmailValue(newValue);
    setAlertEmail('');
  };
  const handleEmailCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const newValue = e.target.value;
    setEmailCheckValue(newValue);
  };

  const handleDeleteEmail = () => {
    setEmailValue('');
    setAlertEmail('');
  };
  const handleDeleteEmailCheck = () => {
    setEmailCheckValue('');
  };
  const [variant, setVariant] = useState<'submit' | 'disabled'>('disabled');
  useEffect(() => {
    if (
      emailValue !== '' &&
      emailCheckValue !== '' &&
      emailCheckValue === emailValue
    ) {
      setVariant('submit');
    } else {
      setVariant('disabled');
    }
  }, [emailValue, emailCheckValue]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const deleteData = async () => {
    if (!userId) return;
    try {
      await deleteAccount();
      useAuthStore.setState({ user: null, status: 'guest' });
    } catch (error) {
      logger.error('사용자 데이터 삭제 오류', error);
    }
  };

  const isComplete = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (emailValue !== userEmail) {
      setAlertEmail('userEmailDouble');
    } else {
      setAlertEmail('');
      deleteData();
      setIsModalOpen(true);
    }
  };
  const onClickConfirm = () => {
    setIsModalOpen(false);
    window.location.href = '/';
  };

  useHeaderConfig(
    () => ({
      isShowPrev: true,
      children: '',
      empty: true
    }),
    []
  );

  return (
    <div className="mx-auto my-0 flex w-full max-w-[430px] flex-col px-6">
      <form className="stext-left mx-[30px] mt-[20px]" onSubmit={isComplete}>
        <h1 className="leading-7.5 text-xl">
          회원 확인을 위해
          <br />
          이메일을 입력해주세요.
        </h1>
        <span className="inline-block w-[244px] pt-[12px] text-left text-sm text-gray-400">
          회원 탈퇴 처리 후 복구가 불가합니다.
        </span>
        <li className="mt-[40px] flex items-baseline justify-between">
          <h2 className="text-xs">이메일 입력</h2>
          <div className="w-[232px]">
            <InputFormSlim
              ref={emailRef}
              type="email"
              title="useremail"
              placeholder="이메일을 입력해주세요."
              value={emailValue}
              onChange={handleEmail}
              iconDelete={!!emailValue}
              onClickDelete={handleDeleteEmail}
              alertCase={alertEmail}
            />
          </div>
        </li>
        <li className="mt-[16px] flex items-baseline justify-between ">
          <h2 className="text-xs">이메일 확인</h2>
          <div className="w-[232px]">
            <InputFormSlim
              ref={emailCheckRef}
              type="email"
              title="useremail"
              placeholder="이메일을 한번 더 입력해주세요."
              value={emailCheckValue}
              onChange={handleEmailCheck}
              iconDelete={!!emailCheckValue}
              onClickDelete={handleDeleteEmailCheck}
            />
          </div>
        </li>
        <div className="mt-[60px] w-full">
          <ButtonVariable buttonText="회원탈퇴" variant={variant} />
        </div>
      </form>
      {isModalOpen && (
        <ModalComp
          children="회원 탈퇴가 완료되었습니다."
          confirmText="확인"
          onClickConfirm={onClickConfirm}
        />
      )}
    </div>
  );
};

export default MypageDelete;
