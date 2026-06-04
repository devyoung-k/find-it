import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/model/authStore';
import { fetchProfileByNickname } from '@/lib/api/profile';
import InputForm from '@/features/auth/sign-in/ui/InputForm';
import useSidoList from '@/features/auth/sign-in/hooks/useSidoList';
import useGunguList from '@/features/auth/sign-in/hooks/useGunguList';
import useSidoCode from '@/features/auth/sign-in/hooks/useSidoCode';
import ButtonVariable from '@/shared/ui/buttons/ButtonVariable';
import ButtonSelectItem from '@/shared/ui/select/ButtonSelectItem';
import SelectCategoryList from '@/shared/ui/select/SelectCategoryList';
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

type ConfirmProps = '' | 'doubleCheckNickname';

const SignUp = () => {
  const navigate = useNavigate();
  const signup = useAuthStore((s) => s.signup);
  // 이메일과 비밀번호 정규식
  const regex = {
    emailRegex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    pwRegex: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,}$/
  };
  const [emailValue, setEmailValue] = useState('');
  const [valiEmailForm, setValiEmailForm] = useState(false);

  const [passwordValue, setPasswordValue] = useState('');
  const [valiPasswordForm, setValiPasswordForm] = useState(false);

  const [passwordType, setPasswordType] = useState('password');
  const [passwordCheckValue, setPasswordCheckValue] = useState('');
  const [passwordCheckType, setPasswordCheckType] = useState('password');

  const [nicknameValue, setNicknameValue] = useState('');
  const [isNicknameVerified, setIsNicknameVerified] = useState(false);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);

  const [alertEmail, setAlertEmail] = useState<AlertProps>();
  const [alertPassword, setAlertPassword] = useState<AlertProps>();
  const [alertPasswordCheck, setAlertPasswordCheck] = useState<AlertProps>();
  const [alertNickname, setAlertNickname] = useState<AlertProps>();
  const [confirmNickname, setConfirmNickname] = useState<ConfirmProps>('');

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const passwordCheckRef = useRef(null);
  const nicknameRef = useRef(null);

    // 이메일 입력 & 정규식 검사
  const handleEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const newValue = e.target.value;
    setEmailValue(newValue);

    if (!newValue.match(regex.emailRegex)) {
      setAlertEmail('invalidEmail');
      setValiEmailForm(false);
    } else {
      setAlertEmail('');
      setValiEmailForm(true);
    }
  };
  // 비밀번호 입력 & 정규식 검사
  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setPasswordValue(newValue);
    if (!newValue.match(regex.pwRegex)) {
      setAlertPassword('invalidPassword');
      setValiPasswordForm(false);
    } else {
      setAlertPassword('');
      setValiPasswordForm(true);
    }
  };
  // 비밀번호 입력 & 동일 검사
  const handlePasswordCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setPasswordCheckValue(newValue);
    if (newValue !== passwordValue) {
      setAlertPasswordCheck('doubleCheckPassword');
    } else {
      setAlertPasswordCheck('');
    }
  };
  const handleNickname = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setNicknameValue(newValue);
    setAlertNickname('');
    setConfirmNickname('');
    setIsNicknameVerified(false);
  };

  const handleNicknameDoubleCheck = async () => {
    const trimmed = nicknameValue.trim();
    if (!trimmed) {
      setAlertNickname('invalidValue');
      setConfirmNickname('');
      setIsNicknameVerified(false);
      return;
    }

    setIsCheckingNickname(true);
    setAlertNickname('');
    setConfirmNickname('');

    try {
      const records = await fetchProfileByNickname(trimmed);
      if (records.length > 0) {
        setAlertNickname('doubleCheckNickname');
        setIsNicknameVerified(false);
      } else {
        setConfirmNickname('doubleCheckNickname');
        setIsNicknameVerified(true);
      }
    } catch (error) {
      logger.error('닉네임 중복 확인 실패', error);
      setAlertNickname('invalidValue');
      setIsNicknameVerified(false);
    } finally {
      setIsCheckingNickname(false);
    }
  };

  const toggleType = (current: string) =>
    current === 'password' ? 'text' : 'password';

  const handleEyePassword = () => {
    setPasswordType((current) => toggleType(current));
  };

  const handleEyePasswordCheck = () => {
    setPasswordCheckType((current) => toggleType(current));
  };

  const handleDeleteEmail = () => {
    setEmailValue('');
    setAlertEmail('');
  };

  const handleDeletePassword = () => {
    setPasswordValue('');
    setAlertPassword('');
  };

  const handleDeletePasswordCheck = () => {
    setPasswordCheckValue('');
    setAlertPasswordCheck('');
  };

  const handleDeleteNickname = () => {
    setNicknameValue('');
    setAlertNickname('');
    setConfirmNickname('');
    setIsNicknameVerified(false);
  };

  // 지역 선택 버튼

  // 대분류 버튼 클릭시 대분류 리스트 랜더링 & 소분류 비활성화 & 소분류 초기화
  const [renderFirstList, setRenderFirstList] = useState(false);
  const [disabledSecond, setDisabledSecond] = useState(true);
  const handleFirstItem = () => {
    setRenderFirstList(true);
    setSelectSecondItem('');
    setDisabledSecond(true);
  };
  // 소분류 버튼 클릭시 소분류 리스트 랜더링
  const [renderSecondList, setRenderSecondList] = useState(false);
  const handleSecondItem = () => {
    setRenderSecondList(true);
  };

  // 렌더된 리스트 (SelectCategoryList 컴포넌트) 에서 찍은거 가져오기
  // 첫번째 아이템 리스트
  const [selectFirstItem, setSelectFirstItem] = useState('');
  const handleSelectFirstItem = (item: string) => {
    setSelectFirstItem(item);
  };
  // 두번째 아이템 리스트
  const [selectSecondItem, setSelectSecondItem] = useState('');
  const handleSelectSecondItem = (item: string) => {
    setSelectSecondItem(item);
  };
  // 뿌릴 데이터 종류 전달
  const LOCAL_CODE = useSidoCode(selectFirstItem);
  const firstItemList = useSidoList(); // 문자열로 된 배열 반환
  const secondItemList = useGunguList(LOCAL_CODE || selectFirstItem);

    // 최종 버튼 활성화 조건 버튼 변경 & 데이터 보내기
  const [variant, setVariant] = useState<'submit' | 'disabled'>('disabled');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  useEffect(() => {
    const hasEmail = emailValue !== '' && valiEmailForm;
    const hasValidPassword =
      valiPasswordForm &&
      passwordValue !== '' &&
      passwordValue === passwordCheckValue;
    const hasNickname = isNicknameVerified;
    const hasLocation = selectFirstItem !== '' && selectSecondItem !== '';

    if (hasEmail && hasValidPassword && hasNickname && hasLocation) {
      setVariant('submit');
    } else {
      setVariant('disabled');
    }
  }, [
    emailValue,
    valiEmailForm,
    valiPasswordForm,
    passwordValue,
    passwordCheckValue,
    nicknameValue,
    isNicknameVerified,
    selectFirstItem,
    selectSecondItem
  ]);

  const getSignUpErrorMessage = (error: unknown) => {
    const message = (error instanceof Error ? error.message : '').toLowerCase();

    if (message.includes('이메일') && message.includes('이미')) {
      return '이미 가입된 이메일입니다. 로그인하거나 다른 이메일을 사용해주세요.';
    }
    if (message.includes('already') || message.includes('exist')) {
      return '이미 가입된 이메일 또는 닉네임입니다.';
    }
    if (message.includes('password') || message.includes('비밀번호')) {
      return '비밀번호 조건을 만족하지 않습니다. 영어, 숫자, 특수문자를 포함한 8자 이상으로 입력해주세요.';
    }
    return '회원가입에 실패했습니다. 입력 정보를 다시 확인해주세요.';
  };

  // 백엔드(/api/auth/signup)로 가입 — 유저+프로필을 함께 생성
  const createUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (variant !== 'submit' || isSubmitting) {
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await signup({
        email: emailValue.trim(),
        password: passwordValue,
        nickname: nicknameValue,
        state: selectFirstItem,
        city: selectSecondItem
      });
      navigate('/welcome');
    } catch (error) {
      logger.error('회원가입 오류', error);
      setSubmitError(getSignUpErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

      // jsx 반환
  useHeaderConfig(
    () => ({
      isShowPrev: true,
      children: '회원가입',
      empty: true
    }),
    []
  );

  return (
    <div className="min-h-nav-safe flex w-full flex-col items-center bg-white md:mt-5">
      <div className="flex w-full flex-col items-center">
        <div className="flex w-full justify-center">
          <form className="w-full max-w-[430px] px-5 pb-10" onSubmit={createUser}>
            <InputForm
              ref={emailRef}
              type="email"
              title="useremail"
              placeholder="이메일 주소를 입력해주세요."
              value={emailValue}
              onChange={handleEmail}
              iconDelete={!!emailValue}
              onClickDelete={handleDeleteEmail}
              alertCase={alertEmail}
              iconDoubleCheck={false}
            />
            <InputForm
              ref={passwordRef}
              marginTop="40px"
              type={passwordType}
              title="userpassword"
              placeholder="비밀번호를 입력해주세요."
              value={passwordValue}
              onChange={handlePassword}
              iconDoubleCheck={false}
              iconDelete={!!passwordValue}
              iconEyeToggle={true}
              onClickDelete={handleDeletePassword}
              onClickEye={handleEyePassword}
              alertCase={alertPassword}
            />
            <InputForm
              marginTop="8px"
              ref={passwordCheckRef}
              type={passwordCheckType}
              title="userpasswordCheck"
              placeholder="비밀번호를 한번 더 입력해주세요."
              value={passwordCheckValue}
              onChange={handlePasswordCheck}
              iconDoubleCheck={false}
              iconDelete={!!passwordCheckValue}
              iconEyeToggle={true}
              onClickDelete={handleDeletePasswordCheck}
              onClickEye={handleEyePasswordCheck}
              alertCase={alertPasswordCheck}
            />
            <InputForm
              marginTop="40px"
              ref={nicknameRef}
              type="text"
              title="nickname"
              placeholder="닉네임을 입력해주세요."
              value={nicknameValue}
              onChange={handleNickname}
              iconDoubleCheck={true}
              iconDelete={!!nicknameValue}
              onClickDoubleCheck={handleNicknameDoubleCheck}
              onClickDelete={handleDeleteNickname}
              alertCase={alertNickname}
              confirmCase={confirmNickname}
              disabledDoubleCheck={isCheckingNickname || nicknameValue.trim() === ''}
            />
            <div className="mt-2.5 flex h-12 w-full items-center justify-between">
              <input
                style={{ pointerEvents: 'none', cursor: 'default' }}
                className="text-#989898 w-full pr-2.5 pl-2.5 text-sm"
                type="text"
                name="거주지역"
                readOnly
                placeholder="거주지역을 선택해주세요"
              />
              <ButtonSelectItem
                firstName={selectFirstItem || '시/도'}
                secondName={selectSecondItem || '군/구'}
                onClickFirst={handleFirstItem} // 컴포넌트 렌더 실행
                onClickSecond={handleSecondItem}
                disabledSecond={disabledSecond}
              />
            </div>
            {submitError && (
              <p className="pt-4 text-sm text-red-500">{submitError}</p>
            )}
            <div className="box-border flex flex-col items-center gap-4 pt-20">
              <ButtonVariable
                buttonText={isSubmitting ? '처리 중...' : '완료'}
                variant={isSubmitting ? 'disabled' : variant}
              />
            </div>
          </form>
        </div>
        {renderFirstList && (
          <SelectCategoryList
            title={'거주하시는 시/도를 선택하세요.'}
            dataList={firstItemList}
            getSelectItem={handleSelectFirstItem} // 선택 아이템 가져옴
            onClose={() => setRenderFirstList(false)} // 바깥 영역 누르면 사라짐
          />
        )}
        {renderSecondList && (
          <SelectCategoryList
            title={'거주하시는 군/구를 선택하세요.'}
            dataList={secondItemList}
            getSelectItem={handleSelectSecondItem}
            onClose={() => setRenderSecondList(false)}
          />
        )}
      </div>
    </div>
  );
};

export default SignUp;
