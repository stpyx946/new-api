/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useEffect, useState } from 'react';
import {
  API,
  getLogo,
  showError,
  showInfo,
  showSuccess,
  getSystemName,
} from '../../helpers';
import Turnstile from 'react-turnstile';
import { Button, Form, Typography } from '@douyinfe/semi-ui';
import { IconMail } from '@douyinfe/semi-icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const { Text, Title } = Typography;

const PasswordResetForm = () => {
  const { t } = useTranslation();
  const [inputs, setInputs] = useState({
    email: '',
  });
  const { email } = inputs;

  const [loading, setLoading] = useState(false);
  const [turnstileEnabled, setTurnstileEnabled] = useState(false);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [disableButton, setDisableButton] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const logo = getLogo();
  const systemName = getSystemName();

  useEffect(() => {
    let status = localStorage.getItem('status');
    if (status) {
      status = JSON.parse(status);
      if (status.turnstile_check) {
        setTurnstileEnabled(true);
        setTurnstileSiteKey(status.turnstile_site_key);
      }
    }
  }, []);

  useEffect(() => {
    let countdownInterval = null;
    if (disableButton && countdown > 0) {
      countdownInterval = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setDisableButton(false);
      setCountdown(30);
    }
    return () => clearInterval(countdownInterval);
  }, [disableButton, countdown]);

  function handleChange(value) {
    setInputs((inputs) => ({ ...inputs, email: value }));
  }

  async function handleSubmit(e) {
    if (!email) {
      showError(t('请输入邮箱地址'));
      return;
    }
    if (turnstileEnabled && turnstileToken === '') {
      showInfo(t('请稍后几秒重试，Turnstile 正在检查用户环境！'));
      return;
    }
    setDisableButton(true);
    setLoading(true);
    const res = await API.get(
      `/api/reset_password?email=${email}&turnstile=${turnstileToken}`,
    );
    const { success, message } = res.data;
    if (success) {
      showSuccess(t('重置邮件发送成功，请检查邮箱！'));
      setInputs({ ...inputs, email: '' });
    } else {
      showError(message);
    }
    setLoading(false);
  }

  return (
    <div className='flex flex-row min-h-screen bg-semi-color-bg-0'>
      {/* Left panel — hidden on mobile */}
      <div
        className='auth-left-panel animate-fade-in hidden md:flex flex-col items-center justify-center shrink-0'
        style={{
          width: '480px',
          maxWidth: '480px',
          padding: '72px 24px 24px',
        }}
      >
        <Title
          heading={3}
          className='font-barlow text-center mb-6'
          style={{ fontSize: '32px', fontWeight: 700 }}
        >
          {t('密码重置')}
        </Title>
        <img src={logo} alt='Logo' className='h-16 rounded-full mt-4' />
      </div>

      {/* Right panel */}
      <div
        className='flex-1 flex flex-col items-center justify-center'
        style={{ padding: '80px 16px' }}
      >
        <div className='w-full max-w-[420px]'>
          <Title
            heading={3}
            className='mb-2'
            style={{ color: 'var(--semi-color-text-0)', fontWeight: 700 }}
          >
            {t('密码重置')}
          </Title>
          <Title
            heading={5}
            className='mb-8'
            style={{ color: 'var(--semi-color-text-0)', fontWeight: 700, fontSize: '20px' }}
          >
            {t('输入邮箱以重置密码')}
          </Title>

          <div className='animate-fade-in-up'>
            <Form className='space-y-3'>
              <Form.Input
                field='email'
                label={t('邮箱')}
                placeholder={t('请输入您的邮箱地址')}
                name='email'
                value={email}
                onChange={handleChange}
                prefix={<IconMail />}
              />

              <div className='pt-2'>
                <Button
                  className='w-full !rounded-[8px]'
                  style={{
                    backgroundColor: 'var(--color-cta-bg)',
                    color: 'var(--color-cta-text)',
                    height: '48px',
                  }}
                  htmlType='submit'
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={disableButton}
                >
                  {disableButton
                    ? `${t('重试')} (${countdown})`
                    : t('提交')}
                </Button>
              </div>
            </Form>

            <div className='mt-6 text-center text-sm'>
              <Text>
                {t('想起来了？')}{' '}
                <Link
                  to='/login'
                  className='!text-semi-color-primary hover:!text-semi-color-primary-hover font-medium'
                >
                  {t('登录')}
                </Link>
              </Text>
            </div>
          </div>

          {turnstileEnabled && (
            <div className='flex justify-center mt-6'>
              <Turnstile
                sitekey={turnstileSiteKey}
                onVerify={(token) => {
                  setTurnstileToken(token);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordResetForm;
