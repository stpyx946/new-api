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

import React, { useContext, useEffect, useState } from 'react';
import {
  Button,
  Typography,
  Input,
  ScrollList,
  ScrollItem,
  Card,
  Collapse,
} from '@douyinfe/semi-ui';
import { API, showError, copy, showSuccess } from '../../helpers';
import { useIsMobile } from '../../hooks/common/useIsMobile';
import { API_ENDPOINTS } from '../../constants/common.constant';
import { StatusContext } from '../../context/Status';
import { useActualTheme } from '../../context/Theme';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import {
  IconGithubLogo,
  IconFile,
  IconCopy,
} from '@douyinfe/semi-icons';
import { Zap, Shield, Layers, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import NoticeModal from '../../components/layout/NoticeModal';
import {
  Moonshot,
  OpenAI,
  XAI,
  Zhipu,
  Volcengine,
  Cohere,
  Claude,
  Gemini,
  Suno,
  Minimax,
  Wenxin,
  Spark,
  Qingyan,
  DeepSeek,
  Qwen,
  Midjourney,
  Grok,
  AzureAI,
  Hunyuan,
  Xinference,
} from '@lobehub/icons';

const { Text } = Typography;

const Home = () => {
  const { t, i18n } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const actualTheme = useActualTheme();
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const isMobile = useIsMobile();
  const isDemoSiteMode = statusState?.status?.demo_site_enabled || false;
  const docsLink = statusState?.status?.docs_link || '';
  const serverAddress =
    statusState?.status?.server_address || `${window.location.origin}`;
  const endpointItems = API_ENDPOINTS.map((e) => ({ value: e }));
  const [endpointIndex, setEndpointIndex] = useState(0);
  const isChinese = i18n.language.startsWith('zh');

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    try {
      const res = await API.get('/api/home_page_content');
      const { success, message, data } = res.data;
      if (success) {
        let content = data;
        if (!data.startsWith('https://')) {
          content = marked.parse(data);
        }
        setHomePageContent(content);
        localStorage.setItem('home_page_content', content);

        if (data.startsWith('https://')) {
          const iframe = document.querySelector('iframe');
          if (iframe) {
            iframe.onload = () => {
              iframe.contentWindow.postMessage({ themeMode: actualTheme }, '*');
              iframe.contentWindow.postMessage({ lang: i18n.language }, '*');
            };
          }
        }
      } else {
        showError(message);
      }
    } catch (error) {
      console.error('获取首页内容失败:', error);
    }
    setHomePageContentLoaded(true);
  };

  const handleCopyBaseURL = async () => {
    const ok = await copy(serverAddress);
    if (ok) {
      showSuccess(t('已复制到剪切板'));
    }
  };

  useEffect(() => {
    const checkNoticeAndShow = async () => {
      const lastCloseDate = localStorage.getItem('notice_close_date');
      const today = new Date().toDateString();
      if (lastCloseDate !== today) {
        try {
          const res = await API.get('/api/notice');
          const { success, data } = res.data;
          if (success && data && data.trim() !== '') {
            setNoticeVisible(true);
          }
        } catch (error) {
          console.error('获取公告失败:', error);
        }
      }
    };

    checkNoticeAndShow();
  }, []);

  useEffect(() => {
    displayHomePageContent().then();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setEndpointIndex((prev) => (prev + 1) % endpointItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [endpointItems.length]);

  const features = [
    {
      icon: <Zap size={28} className='text-semi-color-primary' />,
      title: t('高速 & 稳定'),
      desc: t('全球加速，无论你在哪里，都能得到快速且稳定的响应。'),
    },
    {
      icon: <Shield size={28} className='text-semi-color-primary' />,
      title: t('安全保障'),
      desc: t('严格保护信息和交互数据，确保使用过程安全无忧。'),
    },
    {
      icon: <Layers size={28} className='text-semi-color-primary' />,
      title: t('一站式服务'),
      desc: t('一个接口即可使用所有主流AI模型，零开发基础无缝对接。'),
    },
  ];

  const faqs = [
    {
      q: t('我该如何使用?'),
      a: t('你只需替换你使用的应用程序中的API地址和KEY即可。如果你有任何问题，请随时联系我们。'),
    },
    {
      q: t('支持哪些模型?'),
      a: t('我们支持 OpenAI、Claude、Gemini、Midjourney、Suno 等 30+ 主流 AI 模型，并持续添加新模型。'),
    },
    {
      q: t('如何保证稳定性?'),
      a: t('我们采用企业级基础设施，多节点负载均衡，并提供实时状态监控，确保服务高可用。'),
    },
    {
      q: t('价格如何计算?'),
      a: t('按照实际使用量计费，支持多种充值方式，价格透明无隐藏费用。请查看定价页面了解详情。'),
    },
  ];

  return (
    <div className='w-full overflow-x-hidden'>
      <NoticeModal
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        isMobile={isMobile}
      />
      {homePageContentLoaded && homePageContent === '' ? (
        <div className='w-full overflow-x-hidden'>
          {/* ===== Hero 区 ===== */}
          <section className='w-full min-h-[520px] md:min-h-[620px] lg:min-h-[700px] relative overflow-hidden'>
            <div className='flex items-center justify-center h-full px-4 py-20 md:py-28 lg:py-36 mt-10'>
              <div className='flex flex-col items-center justify-center text-center max-w-4xl mx-auto'>
                <h2
                  className={`animate-fade-in-up text-3xl md:text-4xl lg:text-[48px] lg:leading-[56px] font-extrabold text-semi-color-text-0 leading-tight ${isChinese ? 'tracking-wide' : ''}`}
                >
                  {t('高效且稳定的')}
                  <br />
                  {t('访问所有AI模型')}
                </h2>

                <h1 className='brand-gradient-text text-6xl md:text-7xl lg:text-8xl xl:text-[96px] font-black mt-4 leading-none tracking-[4px]'>
                  {statusState?.status?.system_name || 'New API'}
                </h1>

                <p className='animate-fade-in-up-delay-1 text-base md:text-lg text-semi-color-text-1 mt-6 max-w-2xl'>
                  {t('高性价比的企业级API转发服务，AI模型All In One！')}
                  <br />
                  {t('完全兼容各平台接口协议，零开发基础无缝对接各种应用。')}
                </p>

                {/* BASE URL 复制区 */}
                <div className='animate-fade-in-up-delay-2 flex flex-col md:flex-row items-center justify-center gap-4 w-full mt-6 max-w-md'>
                  <Input
                    readonly
                    value={serverAddress}
                    className='flex-1 !rounded-lg'
                    size={isMobile ? 'default' : 'large'}
                    suffix={
                      <div className='flex items-center gap-2'>
                        <ScrollList
                          bodyHeight={32}
                          style={{ border: 'unset', boxShadow: 'unset' }}
                        >
                          <ScrollItem
                            mode='wheel'
                            cycled={true}
                            list={endpointItems}
                            selectedIndex={endpointIndex}
                            onSelect={({ index }) => setEndpointIndex(index)}
                          />
                        </ScrollList>
                        <Button
                          type='primary'
                          onClick={handleCopyBaseURL}
                          icon={<IconCopy />}
                          className='!rounded-lg'
                        />
                      </div>
                    }
                  />
                </div>

                {/* CTA 按钮 */}
                <div className='animate-fade-in-up-delay-3 flex flex-row gap-4 justify-center items-center mt-8'>
                  <Link to='/console'>
                    <Button
                      theme='solid'
                      size={isMobile ? 'default' : 'large'}
                      className='!rounded-lg px-8 py-2'
                      style={{
                        backgroundColor: 'var(--color-cta-bg)',
                        color: 'var(--color-cta-text)',
                        border: 'none',
                      }}
                      icon={<ArrowRight size={16} />}
                      iconPosition='right'
                    >
                      {t('立即开始')}
                    </Button>
                  </Link>
                  {isDemoSiteMode && statusState?.status?.version ? (
                    <Button
                      theme='outline'
                      type='tertiary'
                      size={isMobile ? 'default' : 'large'}
                      className='!rounded-lg px-6 py-2'
                      icon={<IconGithubLogo />}
                      onClick={() =>
                        window.open(
                          'https://github.com/QuantumNous/new-api',
                          '_blank',
                        )
                      }
                    >
                      {statusState.status.version}
                    </Button>
                  ) : (
                    docsLink && (
                      <Button
                        theme='outline'
                        type='tertiary'
                        size={isMobile ? 'default' : 'large'}
                        className='!rounded-lg px-6 py-2'
                        icon={<IconFile />}
                        onClick={() => window.open(docsLink, '_blank')}
                      >
                        {t('查看文档')}
                      </Button>
                    )
                  )}
                </div>

                {/* 供应商 Logo */}
                <div className='animate-fade-in-up-delay-4 mt-16 md:mt-20 w-full'>
                  <div className='flex items-center mb-6 md:mb-8 justify-center'>
                    <Text
                      type='tertiary'
                      className='text-lg md:text-xl font-light'
                    >
                      {t('支持众多的大模型供应商')}
                    </Text>
                  </div>
                  <div className='flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-5xl mx-auto px-4'>
                    {[
                      <Moonshot size={40} />,
                      <OpenAI size={40} />,
                      <XAI size={40} />,
                      <Zhipu.Color size={40} />,
                      <Volcengine.Color size={40} />,
                      <Cohere.Color size={40} />,
                      <Claude.Color size={40} />,
                      <Gemini.Color size={40} />,
                      <Suno size={40} />,
                      <Minimax.Color size={40} />,
                      <Wenxin.Color size={40} />,
                      <Spark.Color size={40} />,
                      <Qingyan.Color size={40} />,
                      <DeepSeek.Color size={40} />,
                      <Qwen.Color size={40} />,
                      <Midjourney size={40} />,
                      <Grok size={40} />,
                      <AzureAI.Color size={40} />,
                      <Hunyuan.Color size={40} />,
                      <Xinference.Color size={40} />,
                    ].map((icon, i) => (
                      <div
                        key={i}
                        className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center'
                      >
                        {icon}
                      </div>
                    ))}
                    <div className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center'>
                      <Typography.Text className='!text-lg sm:!text-xl md:!text-2xl lg:!text-3xl font-bold'>
                        30+
                      </Typography.Text>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ===== 特性卡片区 ===== */}
          <section className='w-full py-16 md:py-24 px-4'>
            <div className='max-w-5xl mx-auto'>
              <h2 className='font-barlow animate-fade-in-up text-3xl md:text-4xl lg:text-[48px] lg:leading-[56px] font-extrabold text-semi-color-text-0 text-center mb-4'>
                {t('为您的应用赋能AI智能化服务')}
              </h2>
              <p className='text-semi-color-text-1 text-center mb-12 text-base md:text-lg max-w-2xl mx-auto'>
                {t('将复杂的模型集成工作交给我们，您只需注册账号即可轻松使用。')}
              </p>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {features.map((f, i) => (
                  <Card
                    key={i}
                    className='!border-0 card-hover-lift feature-card'
                    bodyStyle={{ padding: '80px 40px' }}
                  >
                    <div className='w-14 h-14 rounded-2xl bg-semi-color-primary-light-default flex items-center justify-center mb-5'>
                      {f.icon}
                    </div>
                    <h3 className='text-xl font-bold text-semi-color-text-0 mb-3'>
                      {f.title}
                    </h3>
                    <p className='text-semi-color-text-1 text-sm leading-relaxed'>
                      {f.desc}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* ===== FAQ 区 ===== */}
          <section className='w-full py-16 md:py-24 px-4 bg-semi-color-fill-0'>
            <div className='max-w-3xl mx-auto'>
              <h2 className='font-barlow text-3xl md:text-4xl font-extrabold text-semi-color-text-0 text-center mb-4'>
                FAQs
              </h2>
              <p className='text-semi-color-text-1 text-center mb-10'>
                {t('常见问题')}
              </p>
              <Collapse accordion>
                {faqs.map((faq, i) => (
                  <Collapse.Panel
                    key={i}
                    header={
                      <span className='font-semibold text-semi-color-text-0'>
                        {faq.q}
                      </span>
                    }
                    itemKey={String(i)}
                  >
                    <p className='text-semi-color-text-1 leading-relaxed'>
                      {faq.a}
                    </p>
                  </Collapse.Panel>
                ))}
              </Collapse>
            </div>
          </section>

          {/* ===== 底部 CTA 区 ===== */}
          <section
            className='w-full py-20 md:py-28 px-4'
            style={{ backgroundColor: 'rgb(28, 37, 46)' }}
          >
            <div className='max-w-4xl mx-auto text-center'>
              <h2 className='font-barlow text-3xl md:text-4xl lg:text-[64px] lg:leading-[72px] font-extrabold text-white leading-tight'>
                {t('准备好了吗？')}
                <br />
                {t('即刻开始体验')}
              </h2>
              <div className='flex flex-row gap-4 justify-center items-center mt-10'>
                <Link to='/console'>
                  <Button
                    theme='solid'
                    size='large'
                    className='!rounded-lg px-8'
                    style={{
                      backgroundColor: 'var(--semi-color-primary)',
                      color: '#fff',
                      border: 'none',
                    }}
                  >
                    {t('立即试用')}
                  </Button>
                </Link>
                {docsLink && (
                  <Button
                    theme='outline'
                    size='large'
                    className='!rounded-lg px-8'
                    style={{
                      borderColor: 'rgba(255,255,255,0.5)',
                      color: '#fff',
                    }}
                    onClick={() => window.open(docsLink, '_blank')}
                  >
                    {t('查看文档')}
                  </Button>
                )}
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className='overflow-x-hidden w-full'>
          {homePageContent.startsWith('https://') ? (
            <iframe
              src={homePageContent}
              className='w-full h-screen border-none'
            />
          ) : (
            <div
              className='mt-[60px]'
              dangerouslySetInnerHTML={{ __html: homePageContent }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
