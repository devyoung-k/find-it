import {
  fetchProfileByNickname,
  updateProfile,
  type Profile
} from '@/lib/api/profile';
import { useAuthStore } from '@/features/auth/model/authStore';
import { requestPasswordReset } from '@/lib/api/auth';
import { Link } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import useSidoList from '@/features/auth/sign-in/hooks/useSidoList';
import useGunguList from '@/features/auth/sign-in/hooks/useGunguList';
import useSidoCode from '@/features/auth/sign-in/hooks/useSidoCode';
import profile from '@/assets/profile.svg';
import profileIcon from '@/assets/icons/icon_camera.svg';
import Horizon from '@/shared/ui/layout/Horizon';
import InputFormSlim from '@/features/auth/sign-in/ui/InputFormSlim';
import ButtonSelectItem from '@/shared/ui/select/ButtonSelectItem';
import SelectCategoryList from '@/shared/ui/select/SelectCategoryList';
import ModalComp from '@/shared/ui/modal/ModalComp';
import { useHeaderConfig } from '@/widgets/header/model/HeaderConfigContext';
import { logger } from '@/lib/utils/logger';

// 타입 정의
type AlertProps =
  | 'doubleCheckNickname'
  | 'doubleCheckPassword'
  | 'invalidValue'
  | 'invalidPassword'
  | '';
type ConfirmProps = 'doubleCheckEmail' | 'doubleCheckNickname' | '';

const MypageEdit = () => {
  const user = useAuthStore((s) => s.user);
  const patchUser = useAuthStore((s) => s.patchUser);
    // 유효성 검사
  const [userNickname, setUserNickname] = useState('');
  const [userId, setUserId] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [userSido, setUserSido] = useState('');
  const [userGungu, setUserGungu] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (!user) return;
    setUserId(user.id);
    setUserEmail(user.email ?? '');
    setUserNickname(user.nickname ?? '');
    setUserAvatar(user.avatarUrl ?? '');
    setUserSido(user.state ?? '');
    setUserGungu(user.city ?? '');
  }, [user]);

    // 입력값

  const [nicknameValue, setNicknameValue] = useState('');
  const [valiNickDouble, setValiNickDouble] = useState(false);
  const [alertNickname, setAlertNickname] = useState<AlertProps>();
  const [confirmNickname, setConfirmNickname] = useState<ConfirmProps>();
  const [isSendingPasswordReset, setIsSendingPasswordReset] = useState(false);
  const [passwordResetMessage, setPasswordResetMessage] = useState<string | null>(null);

  const nicknameRef = useRef(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  //닉네임 입력 & 중복검사 문구 지우기, 중복검사 상태 지우기
  const handleNickname = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setNicknameValue(newValue);
    setAlertNickname('');
    setConfirmNickname('');
    setValiNickDouble(false);
  };

  // 닉네임 중복확인
  const handleDoubleCheckNickname = async () => {
    try {
      const trimmed = nicknameValue.trim();
      if (trimmed === '') {
        setAlertNickname('invalidValue');
        setValiNickDouble(false);
        return;
      }

      const records = await fetchProfileByNickname(trimmed);
      const hasDuplicate = records.some((record) => record.id !== userId);

      if (hasDuplicate) {
        setAlertNickname('doubleCheckNickname');
        setConfirmNickname('');
        setValiNickDouble(false);
        return;
      }

      setAlertNickname('');
      setConfirmNickname('doubleCheckNickname');
      setValiNickDouble(true);
    } catch (error) {
      logger.error('닉네임 중복 확인에 실패했습니다.', error);
    }
  };
  // 삭제 버튼
  const handleDeleteNickname = () => {
    setNicknameValue('');
    setAlertNickname('');
    setConfirmNickname('');
    setValiNickDouble(false);
    setSubmit(false);
  };

  const handleSendPasswordReset = () => {
    if (!userEmail) {
      alert('계정 이메일 정보를 찾을 수 없습니다.');
      return;
    }

    setPasswordResetMessage(null);
    setIsSendingPasswordReset(true);

    void (async () => {
      try {
        await requestPasswordReset(userEmail);
        setPasswordResetMessage(
          '비밀번호 재설정 메일을 전송했습니다. 메일함을 확인해주세요.'
        );
      } catch (error) {
        logger.error('비밀번호 재설정 메일 전송 실패', error);
        setPasswordResetMessage('메일을 보내지 못했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setIsSendingPasswordReset(false);
      }
    })();
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
  // // 첫번째 아이템 리스트
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

  // 완료 조건
  const [submit, setSubmit] = useState(false);

  useEffect(() => {
    const hasNicknameChange = nicknameValue.trim() !== '' && valiNickDouble;
    const hasLocationChange =
      selectFirstItem.trim() !== '' && selectSecondItem.trim() !== '';

    setSubmit(hasNicknameChange || hasLocationChange);
  }, [nicknameValue, valiNickDouble, selectFirstItem, selectSecondItem]);
  //완료 버튼 & 서버 보내고 모달창 뜨우기
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [PWModalOpen, setPWModalOpen] = useState(false);

  const buttonSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) {
      logger.warn('사용자 정보를 찾을 수 없어 프로필을 수정할 수 없습니다.');
      return;
    }

    const profileUpdates: Partial<Omit<Profile, 'id'>> = {};
    if (nicknameValue.trim() && valiNickDouble) {
      profileUpdates.nickname = nicknameValue.trim();
    }
    if (selectFirstItem && selectSecondItem) {
      profileUpdates.state = selectFirstItem;
      profileUpdates.city = selectSecondItem;
    }

    try {
      if (Object.keys(profileUpdates).length > 0) {
        await updateProfile(userId, profileUpdates);
        patchUser({
          ...(profileUpdates.nickname !== undefined && {
            nickname: profileUpdates.nickname
          }),
          ...(profileUpdates.state !== undefined && {
            state: profileUpdates.state
          }),
          ...(profileUpdates.city !== undefined && { city: profileUpdates.city })
        });
      }

      setIsModalOpen(true);
    } catch (error) {
      logger.error('프로필 수정 페이지 통신 오류', error);
      setPWModalOpen(true);
    }
  };
  const onClickConfirm = () => {
    setPWModalOpen(false);
    setIsModalOpen(false);
    window.location.href = '/mypage';
  };

    // 프로필 사진 변경 (백엔드 업로드 엔드포인트 연동 전 — 준비 중)
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileInput = () => {
    alert('프로필 사진 업로드는 준비 중입니다.');
  };
  //프로필 버튼 클릭시 파일 선택창 열기
  const handleProfileChange = () => {
    fileInputRef.current?.click();
  };

      const avatarSrc = userAvatar || profile;

  const handleHeaderSubmit = useCallback(() => {
    formRef.current?.requestSubmit();
  }, []);

  useHeaderConfig(
    () => ({
      isShowPrev: true,
      children: '프로필 수정',
      isShowSubmit: submit,
      onSubmitClick: handleHeaderSubmit
    }),
    [submit, handleHeaderSubmit]
  );

  // 마크업
  return (
    <>
      <form
        ref={formRef}
        className="mx-auto my-0 flex w-full max-w-[430px] flex-col gap-6 px-6"
        onSubmit={buttonSubmit}
      >
        <input
          id="fileInput"
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleProfileChange}
          className="relative mx-auto mb-[30px] mt-[20px]"
        >
          <img
            className="size-88px rounded-full"
            src={avatarSrc}
            alt="나의 프로필 사진"
          />
          <img
            className="absolute	bottom-0 right-0 z-10 size-32px translate-x-4px translate-y-4px "
            src={profileIcon}
            alt="프로필 사진 변경 버튼"
          ></img>
        </button>
        <ul className="mx-[30px]">
          <li className="flex items-baseline justify-between ">
            <h2 className="text-xs">닉네임</h2>
            <div className="w-[232px]">
              <InputFormSlim
                ref={nicknameRef}
                type="text"
                title="nickname"
                placeholder={userNickname}
                value={nicknameValue}
                onChange={handleNickname}
                iconDoubleCheck={true}
                iconDelete={!!nicknameValue}
                onClickDoubleCheck={handleDoubleCheckNickname}
                onClickDelete={handleDeleteNickname}
                alertCase={alertNickname}
                confirmCase={confirmNickname}
                disabledDoubleCheck={!nicknameValue}
              />
            </div>
          </li>
          <li className=" py-[26px]">
            <Horizon lineBold="thin" lineWidth="short" />
          </li>
          <li className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs">비밀번호</h2>
              <button
                type="button"
                onClick={handleSendPasswordReset}
                disabled={isSendingPasswordReset}
                className="rounded-full border border-primary px-4 py-1.5 text-xs text-primary transition-colors duration-200 disabled:border-gray-300 disabled:text-gray-300"
              >
                {isSendingPasswordReset
                  ? '전송 중...'
                  : '비밀번호 재설정 메일 보내기'}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              비밀번호는 등록된 이메일로 전송되는 재설정 링크를 통해 변경할 수 있습니다.
            </p>
            {passwordResetMessage && (
              <p className="text-xs text-primary">{passwordResetMessage}</p>
            )}
          </li>
          <li className=" py-[26px]">
            <Horizon lineBold="thin" lineWidth="short" />
          </li>
          <li className="flex items-baseline justify-between ">
            <h2 className="text-xs">거주지역</h2>
            <ButtonSelectItem
              firstName={selectFirstItem || userSido}
              secondName={selectSecondItem || userGungu}
              onClickFirst={handleFirstItem}
              onClickSecond={handleSecondItem}
              disabledSecond={disabledSecond}
            />
          </li>

          <li className=" py-[26px]">
            <Horizon lineBold="thin" lineWidth="short" />
          </li>
          <li>
            <Link
              to="/mypagedelete"
              className="flex items-center py-1 text-xs text-gray-500"
            >
              회원탈퇴
            </Link>
          </li>
        </ul>
      </form>

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
      {isModalOpen && (
        <ModalComp
          children="프로필 수정이 완료되었습니다."
          confirmText="확인"
          onClickConfirm={onClickConfirm}
        />
      )}
      {PWModalOpen && (
        <ModalComp
          children="서버가 불안정하여 재로그인이 필요합니다."
          confirmText="확인"
          onClickConfirm={onClickConfirm}
        />
      )}
    </>
  );
};

export default MypageEdit;
