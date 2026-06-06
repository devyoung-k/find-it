import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ButtonVariable from '@/shared/ui/buttons/ButtonVariable';
import { resetPassword } from '@/lib/api/auth';
import { logger } from '@/lib/utils/logger';

type Status = 'ready' | 'success' | 'error';

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

const PasswordResetFormCard = ({ token }: { token: string }) => {
  const navigate = useNavigate();

  const [status, setStatus] = useState<Status>('ready');
  const [errorMessage, setErrorMessage] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!passwordRegex.test(password)) {
      setFormError('영어, 숫자, 특수문자를 포함한 8자 이상의 비밀번호를 입력해주세요.');
      return;
    }
    if (password !== passwordConfirm) {
      setFormError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(token, password);
      setStatus('success');
      setPassword('');
      setPasswordConfirm('');
    } catch (error) {
      logger.error('비밀번호 재설정 실패', error);
      setStatus('error');
      setErrorMessage(
        '링크가 만료되었거나 이미 사용되었습니다. 다시 요청해주세요.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'success') {
    return (
      <section className="rounded-3xl bg-white p-6 text-center shadow-sm md:p-8">
        <p className="text-sm text-primary">비밀번호가 변경되었어요!</p>
        <h2 className="mt-2 text-2xl font-bold text-gray-900">
          다시 로그인을 진행해 주세요.
        </h2>
        <p className="mt-3 text-sm text-gray-500">
          새로운 비밀번호로 바로 로그인하거나 홈으로 돌아갈 수 있어요.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <ButtonVariable
            buttonText="로그인 하기"
            variant="submit"
            type="button"
            onClick={() => navigate('/signin')}
          />
          <ButtonVariable
            buttonText="메인으로 돌아가기"
            variant="lineStyle"
            type="button"
            onClick={() => navigate('/')}
          />
        </div>
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-bold text-gray-900">
          비밀번호 재설정을 진행할 수 없어요
        </h2>
        <p className="mt-3 text-sm text-gray-500">{errorMessage}</p>
        <div className="mt-6 flex flex-col gap-3">
          <ButtonVariable
            buttonText="로그인 화면으로"
            variant="lineStyle"
            type="button"
            onClick={() => navigate('/signin')}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">비밀번호 재설정</h2>
        <p className="text-sm text-gray-400">
          새로운 비밀번호를 입력하고 확인을 눌러주세요.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            className="text-sm font-medium text-gray-800"
            htmlFor="new-password"
          >
            새 비밀번호
          </label>
          <input
            id="new-password"
            type="password"
            className="mt-2 w-full rounded-xl bg-gray-100 p-4 text-sm outline-none focus:bg-gray-50"
            placeholder="영어, 숫자, 특수문자를 포함한 8자 이상"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label
            className="text-sm font-medium text-gray-800"
            htmlFor="confirm-password"
          >
            새 비밀번호 확인
          </label>
          <input
            id="confirm-password"
            type="password"
            className="mt-2 w-full rounded-xl bg-gray-100 p-4 text-sm outline-none focus:bg-gray-50"
            placeholder="다시 한 번 입력해주세요"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />
        </div>

        {formError && <p className="text-sm text-red-500">{formError}</p>}

        <ButtonVariable
          buttonText={isSubmitting ? '처리 중...' : '비밀번호 변경하기'}
          variant={isSubmitting ? 'disabled' : 'submit'}
        />
      </form>
    </section>
  );
};

export default PasswordResetFormCard;
