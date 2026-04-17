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
  copy,
  showError,
  showNotice,
  getLogo,
  getSystemName,
} from '../../helpers';
import { useSearchParams, Link } from 'react-router-dom';
import { Button, Form, Typography, Banner } from '@douyinfe/semi-ui';
import { IconMail, IconLock, IconCopy } from '@douyinfe/semi-icons';
import { useTranslation } from 'react-i18next';

const { Text, Title } = Typography;

const PasswordResetConfirm = () => {
  const { t } = useTranslation();
  const [inputs, setInputs] = useState({
    email: '',
    token: '',
  });
  const { email, token } = inputs;
  const isValidResetLink = email && token;

  const [loading, setLoading] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [newPassword, setNewPassword] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [formApi, setFormApi] = useState(null);

  const logo = getLogo();
  const systemName = getSystemName();

  useEffect(() => {
    let token = searchParams.get('token');
    let email = searchParams.get('email');
    setInputs({
      token: token || '',
      email: email || '',
    });
    if (formApi) {
      formApi.setValues({
        email: email || '',
        newPassword: newPassword || '',
      });
    }
  }, [searchParams, newPassword, formApi]);

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

  async function handleSubmit(e) {
    if (!email || !token) {
      showError(t('无效的重置链接，请重新发起密码重置请求'));
      return;
    }
    setDisableButton(true);
    setLoading(true);
    const res = await API.post(`/api/user/reset`, {
      email,
      token,
    });
    const { success, message } = res.data;
    if (success) {
      let password = res.data.data;
      setNewPassword(password);
      await copy(password);
      showNotice(`${t('密码已重置并已复制到剪贴板：')} ${password}`);
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
          {t('密码重置确认')}
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
            style={{ color: 'rgb(28,37,46)', fontWeight: 700 }}
          >
            {t('密码重置确认')}
          </Title>
          <Title
            heading={5}
            className='mb-8'
            style={{ color: 'rgb(28,37,46)', fontWeight: 700, fontSize: '20px' }}
          >
            {t('确认重置你的密码')}
          </Title>

          <div className='animate-fade-in-up'>
            {!isValidResetLink && (
              <Banner
                type='danger'
                description={t('无效的重置链接，请重新发起密码重置请求')}
                className='mb-4 !rounded-lg'
                closeIcon={null}
              />
            )}
            <Form
              getFormApi={(api) => setFormApi(api)}
              initValues={{
                email: email || '',
                newPassword: newPassword || '',
              }}
              className='space-y-4'
            >
              <Form.Input
                field='email'
                label={t('邮箱')}
                name='email'
                disabled={true}
                prefix={<IconMail />}
                placeholder={email ? '' : t('等待获取邮箱信息...')}
              />

              {newPassword && (
                <Form.Input
                  field='newPassword'
                  label={t('新密码')}
                  name='newPassword'
                  disabled={true}
                  prefix={<IconLock />}
                  suffix={
                    <Button
                      icon={<IconCopy />}
                      type='tertiary'
                      theme='borderless'
                      onClick={async () => {
                        await copy(newPassword);
                        showNotice(
                          `${t('密码已复制到剪贴板：')} ${newPassword}`,
                        );
                      }}
                    >
                      {t('复制')}
                    </Button>
                  }
                />
              )}

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
                  disabled={
                    disableButton || newPassword || !isValidResetLink
                  }
                >
                  {newPassword ? t('密码重置完成') : t('确认重置密码')}
                </Button>
              </div>
            </Form>

            <div className='mt-6 text-center text-sm'>
              <Text>
                <Link
                  to='/login'
                  className='!text-semi-color-primary hover:!text-semi-color-primary-hover font-medium'
                >
                  {t('返回登录')}
                </Link>
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetConfirm;
