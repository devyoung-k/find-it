import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/model/authStore';
import InputForm from '@/features/auth/sign-in/ui/InputForm';
import ButtonVariable from '@/shared/ui/buttons/ButtonVariable';
import { useHeaderConfig } from '@/widgets/header/model/HeaderConfigContext';
import { logger } from '@/lib/utils/logger';
import BrandLogo from '@/shared/ui/BrandLogo';

//알럿창 타입 정의
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

const SignIn = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  // 변수
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [passwordType, setPasswordType] = useState('password');

  const [alertEmail, setAlertEmail] = useState<AlertProps>();
  const [alertPassword, setAlertPassword] = useState<AlertProps>();

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  // 입력 함수
  const handleEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const newValue = e.target.value;
    setEmailValue(newValue);
    setAlertEmail('');
  };
  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setPasswordValue(newValue);
    setAlertPassword('');
  };

  // 비밀번호 눈 보이기
  const handleEyePassword = () => {
    setPasswordType((current) =>
      current === 'password' ? 'text' : 'password'
    );
  };

  // 삭제 버튼
  const handleDeleteEmail = () => {
    setEmailValue('');
    setAlertEmail('');
  };
  const handleDeletePassword = () => {
    setPasswordValue('');
    setAlertPassword('');
  };
  // 회원가입 버튼
  const handleSignUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    window.location.href = '/signup';
  };

  // 로그인 버튼 활성화 조건 : 빈문자열만 아니면 됨
  const [variant, setVariant] = useState<'submit' | 'disabled'>('disabled');
  useEffect(() => {
    if (emailValue.trim() !== '' && passwordValue !== '') {
      setVariant('submit');
    } else {
      setVariant('disabled');
    }
  }, [emailValue, passwordValue]);

  // 최종 로그인 버튼
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAlertEmail('');
    setAlertPassword('');

    try {
      await login(emailValue.trim(), passwordValue);
      navigate('/');
    } catch (error) {
      logger.warn('로그인 실패', error);
      setAlertPassword('invalidValue');
    }
  };
  // 마크업
  useHeaderConfig(() => ({ isShowPrev: true }), []);

  return (
    <div className="min-h-nav-safe w-full bg-white">
      <div className="mx-auto w-full max-w-[420px] px-5 pt-6 pb-10">
        <BrandLogo size={44} showWordmark={false} />
        <h1 className="mt-5 text-[24px] leading-snug font-extrabold text-gray-900">
          잃어버린 소중함,
          <br />
          찾아줘가 함께 찾아요
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          이메일로 간편하게 시작하세요
        </p>

        <form className="mt-8" onSubmit={handleSignIn}>
          <div className="flex flex-col gap-5">
            <InputForm
              ref={emailRef}
              type="email"
              title="useremail"
              placeholder="이메일"
              value={emailValue}
              onChange={handleEmail}
              iconDelete={!!emailValue}
              onClickDelete={handleDeleteEmail}
              alertCase={alertEmail}
            />
            <InputForm
              ref={passwordRef}
              type={passwordType}
              title="userpassword"
              placeholder="비밀번호(영어, 숫자, 특수문자 조합)"
              value={passwordValue}
              onChange={handlePassword}
              iconDelete={!!passwordValue}
              iconEyeToggle={true}
              onClickDelete={handleDeletePassword}
              onClickEye={handleEyePassword}
              alertCase={alertPassword}
            />
          </div>

          <div className="pt-8">
            <ButtonVariable buttonText="로그인" variant={variant} />
          </div>

          <div className="mt-5 flex items-center justify-center gap-3 text-sm text-gray-400">
            <button
              type="button"
              onClick={handleSignUp}
              className="hover:text-primary"
            >
              회원가입
            </button>
            <span className="text-gray-200">|</span>
            <Link to="/reset-password" className="hover:text-primary">
              비밀번호 찾기
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
